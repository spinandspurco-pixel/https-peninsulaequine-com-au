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

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILENAME_LEN = 120;

// Allowed MIME types and matching extension set. Both must agree.
const ALLOWED: Record<string, string[]> = {
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

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
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

  return new Response(
    JSON.stringify({ path, size: file.size, mime, name: safeBase }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

Deno.serve(handler);
