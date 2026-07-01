// Server-side validated proxy for inquiry attachment uploads.
// - Enforces size (10 MB), MIME type + extension whitelist, and magic-byte sniffing
// - Uploads via the service role into the private `inquiry-attachments` bucket
// - Returns the stored object path (client persists it on the inquiry row)
//
// Public function (verify_jwt = false) — inquiry forms are accessible to anonymous
// visitors, matching the current storage RLS. Rate limiting is left to the
// Supabase edge platform / upstream WAF.
//
// Error contract: every failure returns
//   { error: string, code: string, details?: Record<string, unknown> }
// at HTTP status matching the class of failure.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MAX_FILENAME_LEN = 120;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ABSOLUTE_MAX_BYTES = 50 * 1024 * 1024; // hard ceiling regardless of env

// Default allowed MIME → extension map. Overridable per environment
// via INQUIRY_UPLOAD_ALLOWED_TYPES (JSON) or the pair
// INQUIRY_UPLOAD_ALLOWED_MIME / INQUIRY_UPLOAD_ALLOWED_EXT (CSV).
const DEFAULT_ALLOWED: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/heic": ["heic"],
  "image/heif": ["heif"],
  "application/pdf": ["pdf"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "application/vnd.ms-excel": ["xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
};

export type UploadConfig = {
  maxBytes: number;
  allowed: Record<string, string[]>;
};

function normaliseExt(ext: string): string {
  return ext.trim().toLowerCase().replace(/^\./, "");
}

function normaliseMime(mime: string): string {
  return mime.trim().toLowerCase();
}

/**
 * Resolve upload limits from env, with strict validation. Called per-request
 * so tests (and hot config reloads) can toggle env between invocations.
 *
 * Precedence for MIME/extension mapping:
 *   1. INQUIRY_UPLOAD_ALLOWED_TYPES  — JSON object `{ "image/png": ["png"] }`
 *   2. INQUIRY_UPLOAD_ALLOWED_MIME + INQUIRY_UPLOAD_ALLOWED_EXT — CSV pair
 *      where every listed MIME accepts every listed extension.
 *   3. Built-in defaults.
 *
 * Size:
 *   INQUIRY_UPLOAD_MAX_BYTES — positive integer, capped at 50 MB.
 */
export function loadUploadConfig(
  env: { get: (k: string) => string | undefined } = Deno.env,
): { config: UploadConfig; errors: string[] } {
  const errors: string[] = [];

  // ---- size ----
  let maxBytes = DEFAULT_MAX_BYTES;
  const rawMax = env.get("INQUIRY_UPLOAD_MAX_BYTES");
  if (rawMax !== undefined && rawMax !== "") {
    const parsed = Number(rawMax);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
      errors.push("INQUIRY_UPLOAD_MAX_BYTES must be a positive integer");
    } else if (parsed > ABSOLUTE_MAX_BYTES) {
      errors.push(
        `INQUIRY_UPLOAD_MAX_BYTES=${parsed} exceeds hard cap ${ABSOLUTE_MAX_BYTES}`,
      );
    } else {
      maxBytes = parsed;
    }
  }

  // ---- allowed types ----
  let allowed: Record<string, string[]> | null = null;
  const rawJson = env.get("INQUIRY_UPLOAD_ALLOWED_TYPES");
  if (rawJson !== undefined && rawJson !== "") {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("must be a JSON object");
      }
      const map: Record<string, string[]> = {};
      for (const [mime, exts] of Object.entries(parsed as Record<string, unknown>)) {
        if (!Array.isArray(exts) || exts.length === 0) {
          throw new Error(`entry "${mime}" must be a non-empty array of extensions`);
        }
        const cleanMime = normaliseMime(mime);
        if (!cleanMime.includes("/")) throw new Error(`invalid MIME "${mime}"`);
        const cleanExts = exts.map((e) => {
          if (typeof e !== "string") throw new Error(`extension for "${mime}" must be a string`);
          const ne = normaliseExt(e);
          if (!ne || !/^[a-z0-9]+$/.test(ne)) throw new Error(`invalid extension "${e}"`);
          return ne;
        });
        map[cleanMime] = Array.from(new Set(cleanExts));
      }
      if (Object.keys(map).length === 0) {
        throw new Error("must define at least one MIME type");
      }
      allowed = map;
    } catch (e) {
      errors.push(
        `INQUIRY_UPLOAD_ALLOWED_TYPES invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  } else {
    const mimeCsv = env.get("INQUIRY_UPLOAD_ALLOWED_MIME");
    const extCsv = env.get("INQUIRY_UPLOAD_ALLOWED_EXT");
    if ((mimeCsv && mimeCsv !== "") || (extCsv && extCsv !== "")) {
      const mimes = (mimeCsv ?? "").split(",").map(normaliseMime).filter(Boolean);
      const exts = (extCsv ?? "").split(",").map(normaliseExt).filter(Boolean);
      if (mimes.length === 0 || exts.length === 0) {
        errors.push(
          "INQUIRY_UPLOAD_ALLOWED_MIME and INQUIRY_UPLOAD_ALLOWED_EXT must both list at least one value",
        );
      } else if (mimes.some((m) => !m.includes("/"))) {
        errors.push("INQUIRY_UPLOAD_ALLOWED_MIME contains an invalid MIME");
      } else if (exts.some((e) => !/^[a-z0-9]+$/.test(e))) {
        errors.push("INQUIRY_UPLOAD_ALLOWED_EXT contains an invalid extension");
      } else {
        allowed = Object.fromEntries(mimes.map((m) => [m, [...exts]]));
      }
    }
  }

  return {
    config: { maxBytes, allowed: allowed ?? DEFAULT_ALLOWED },
    errors,
  };
}

// Magic-byte signatures ("file type sniffing") so a renamed .exe cannot pose as an image.
type SigCheck = (b: Uint8Array) => boolean;
const SIGS: Record<string, SigCheck> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  "image/webp": (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  "image/heic": (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70,
  "image/heif": (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70,
  "application/pdf": (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (b) =>
    b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07),
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (b) =>
    b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07),
  "application/msword": (b) =>
    b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
  "application/vnd.ms-excel": (b) =>
    b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  const body: Record<string, unknown> = { error: message, code };
  if (details) body.details = details;
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return errorResponse(405, "method_not_allowed", "Use POST.", { method: req.method });
  }

  // Resolve limits from env each request so operators can adjust without redeploy.
  const { config, errors: configErrors } = loadUploadConfig();
  if (configErrors.length > 0) {
    console.error("validate-inquiry-upload: invalid config", configErrors);
    return errorResponse(500, "server_misconfigured", "Upload limits are misconfigured.");
  }
  const { maxBytes, allowed: ALLOWED } = config;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return errorResponse(
      400,
      "invalid_multipart",
      "Request body must be multipart/form-data.",
      { received_content_type: contentType || null },
    );
  }
    return errorResponse(
      400,
      "invalid_multipart",
      "Request body must be multipart/form-data.",
      { received_content_type: contentType || null },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    return errorResponse(
      400,
      "invalid_multipart",
      "Request body must be multipart/form-data.",
      { reason: e instanceof Error ? e.message : "parse_failed" },
    );
  }

  const file = form.get("file");
  const folderRaw = String(form.get("folder") ?? "").trim();

  if (file === null) {
    return errorResponse(400, "file_required", "A `file` field is required.", {
      field: "file",
    });
  }
  if (!(file instanceof File)) {
    return errorResponse(400, "file_required", "A `file` field is required.", {
      field: "file",
      received: typeof file,
    });
  }
  if (!folderRaw) {
    return errorResponse(400, "invalid_folder", "`folder` must be a UUID.", {
      field: "folder",
      reason: "missing",
    });
  }
  if (!UUID_RE.test(folderRaw)) {
    return errorResponse(400, "invalid_folder", "`folder` must be a UUID.", {
      field: "folder",
      reason: "not_uuid",
    });
  }

  // 1. Size
  if (file.size <= 0) {
    return errorResponse(400, "empty_file", "File is empty.", { size: file.size });
  }
  if (file.size > MAX_BYTES) {
    return errorResponse(413, "file_too_large", `File exceeds ${MAX_BYTES} bytes (10 MB).`, {
      size: file.size,
      max: MAX_BYTES,
    });
  }

  // 2. Filename sanitisation
  const originalName = (file.name || "upload").split(/[\\/]/).pop() || "upload";
  const safeBase = originalName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, MAX_FILENAME_LEN);
  if (!safeBase || safeBase.startsWith(".")) {
    return errorResponse(400, "invalid_filename", "Filename is invalid.", {
      received: originalName,
    });
  }
  const extMatch = safeBase.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";

  // 3. Declared MIME + extension agreement
  const mime = (file.type || "").toLowerCase();
  const allowedExts = ALLOWED[mime];
  if (!allowedExts) {
    return errorResponse(
      415,
      "mime_not_allowed",
      `Content-Type "${mime || "unknown"}" is not accepted.`,
      { mime: mime || null, allowed: Object.keys(ALLOWED) },
    );
  }
  if (!ext || !allowedExts.includes(ext)) {
    return errorResponse(
      415,
      "extension_mismatch",
      `Extension .${ext || "(none)"} does not match ${mime}.`,
      { extension: ext || null, mime, allowed_extensions: allowedExts },
    );
  }

  // 4. Magic-byte sniff — must match declared MIME
  const headBuf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sig = SIGS[mime];
  if (!sig || !sig(headBuf)) {
    return errorResponse(
      415,
      "content_mismatch",
      "File contents do not match the declared type.",
      { mime },
    );
  }

  // 5. Upload with service role (bypasses public INSERT policy safely).
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return errorResponse(500, "server_misconfigured", "Storage credentials unavailable.");
  }
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const path = `${folderRaw}/${Date.now()}-${safeBase}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("inquiry-attachments")
    .upload(path, bytes, { contentType: mime, upsert: false, cacheControl: "3600" });

  if (upErr) {
    return errorResponse(502, "upload_failed", "Failed to store attachment.");
  }

  // 6. Persist metadata row and return its id to the client.
  const { data: inserted, error: dbErr } = await admin
    .from("inquiry_attachments")
    .insert({
      folder: folderRaw,
      filename: safeBase,
      size_bytes: file.size,
      mime_type: mime,
      storage_path: path,
    })
    .select("id")
    .single();

  if (dbErr || !inserted?.id) {
    // Roll back the object so we don't leak orphaned storage entries.
    await admin.storage.from("inquiry-attachments").remove([path]).catch(() => {});
    return errorResponse(502, "persist_failed", "Failed to record attachment.");
  }

  return new Response(
    JSON.stringify({
      id: inserted.id,
      path,
      size: file.size,
      mime,
      name: safeBase,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

Deno.serve(handler);
