import { supabase } from "@/integrations/supabase/client";
import { getClientSupabaseKey } from "@/lib/clientSupabaseEnv";

/**
 * Client-side mirror of the edge function's allow-list. Kept in sync with
 * `supabase/functions/validate-inquiry-upload/index.ts` DEFAULT_ALLOWED so
 * users get instant feedback for obvious type/size problems without a
 * roundtrip. The server remains authoritative (magic-byte sniff, etc.).
 */
export const CLIENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const CLIENT_ALLOWED_MIME: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/heic": ["heic"],
  "image/heif": ["heif"],
  "image/gif": ["gif"],
  "application/pdf": ["pdf"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "application/vnd.ms-excel": ["xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "text/csv": ["csv"],
  "text/plain": ["txt"],
};

/** Accept attribute string usable in <input type="file" accept="..."> */
export const CLIENT_ACCEPT_ATTR = [
  ...Object.keys(CLIENT_ALLOWED_MIME),
  ...Object.values(CLIENT_ALLOWED_MIME).flat().map((e) => `.${e}`),
].join(",");

export interface UploadedAttachment {
  id: string;
  path: string;
  size: number;
  mime: string;
  name: string;
}

export interface PreflightIssue {
  code:
    | "empty_file"
    | "file_too_large"
    | "mime_not_allowed"
    | "extension_mismatch"
    | "invalid_filename";
  details?: Record<string, unknown>;
}

/**
 * Fast, offline sanity-check for a single file against the same size/type
 * rules the edge function enforces. Returns `null` if the file passes.
 * The server still validates authoritatively (magic bytes, MIME sniff).
 */
export function preflightValidateFile(file: File): PreflightIssue | null {
  if (!file || file.size <= 0) {
    return { code: "empty_file", details: { size: file?.size ?? 0 } };
  }
  if (file.size > CLIENT_MAX_BYTES) {
    return {
      code: "file_too_large",
      details: { size: file.size, max: CLIENT_MAX_BYTES },
    };
  }
  const rawName = (file.name || "").split(/[\\/]/).pop() || "";
  const safeBase = rawName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  if (!safeBase || safeBase.startsWith(".")) {
    return { code: "invalid_filename", details: { received: rawName } };
  }
  const mime = (file.type || "").toLowerCase();
  const allowedExts = CLIENT_ALLOWED_MIME[mime];
  if (!allowedExts) {
    return {
      code: "mime_not_allowed",
      details: { mime: mime || null, allowed: Object.keys(CLIENT_ALLOWED_MIME) },
    };
  }
  const extMatch = safeBase.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";
  if (!ext || !allowedExts.includes(ext)) {
    return {
      code: "extension_mismatch",
      details: { extension: ext || null, mime, allowed_extensions: allowedExts },
    };
  }
  return null;
}

/**
 * Server-authoritative upload config (max size, allowed types) returned
 * by `GET /functions/v1/validate-inquiry-upload`. Lets the client show
 * accurate limits when operators tune `INQUIRY_UPLOAD_MAX_BYTES` or the
 * allow-list via env, without redeploying the frontend.
 */
export interface ServerUploadConfig {
  maxBytes: number;
  allowedTypes: Record<string, string[]>;
  allowedMime: string[];
  allowedExtensions: string[];
}

let _cachedConfig: ServerUploadConfig | null = null;
let _inflight: Promise<ServerUploadConfig> | null = null;

/**
 * Fetch (and cache) the live upload limits from the edge function. Falls
 * back to the client-side constants above if the endpoint is unreachable,
 * so form UX never blocks on a config lookup.
 */
export async function fetchUploadConfig(
  options: { force?: boolean } = {},
): Promise<ServerUploadConfig> {
  if (!options.force && _cachedConfig) return _cachedConfig;
  if (_inflight) return _inflight;

  _inflight = (async () => {
    try {
      const url = `${(supabase as unknown as { supabaseUrl: string }).supabaseUrl}/functions/v1/validate-inquiry-upload`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`config_http_${res.status}`);
      const raw = (await res.json()) as {
        max_bytes?: unknown;
        allowed_types?: unknown;
        allowed_mime?: unknown;
        allowed_extensions?: unknown;
      };
      const maxBytes =
        typeof raw.max_bytes === "number" && raw.max_bytes > 0
          ? raw.max_bytes
          : CLIENT_MAX_BYTES;
      const allowedTypes =
        raw.allowed_types && typeof raw.allowed_types === "object"
          ? (raw.allowed_types as Record<string, string[]>)
          : CLIENT_ALLOWED_MIME;
      const allowedMime = Array.isArray(raw.allowed_mime)
        ? (raw.allowed_mime as string[])
        : Object.keys(allowedTypes);
      const allowedExtensions = Array.isArray(raw.allowed_extensions)
        ? (raw.allowed_extensions as string[])
        : Array.from(new Set(Object.values(allowedTypes).flat())).sort();
      _cachedConfig = { maxBytes, allowedTypes, allowedMime, allowedExtensions };
      return _cachedConfig;
    } catch {
      _cachedConfig = {
        maxBytes: CLIENT_MAX_BYTES,
        allowedTypes: CLIENT_ALLOWED_MIME,
        allowedMime: Object.keys(CLIENT_ALLOWED_MIME),
        allowedExtensions: Array.from(
          new Set(Object.values(CLIENT_ALLOWED_MIME).flat()),
        ).sort(),
      };
      return _cachedConfig;
    } finally {
      _inflight = null;
    }
  })();

  return _inflight;
}



/**
 * Typed error thrown when the server rejects an upload. Carries the
 * `code` slug returned by the `validate-inquiry-upload` edge function
 * so the UI can render code-specific messaging and highlight the
 * offending file.
 */
export class UploadValidationError extends Error {
  code: string;
  details?: Record<string, unknown>;
  fileName?: string;
  status?: number;

  constructor(opts: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
    fileName?: string;
    status?: number;
  }) {
    super(opts.message);
    this.name = "UploadValidationError";
    this.code = opts.code;
    this.details = opts.details;
    this.fileName = opts.fileName;
    this.status = opts.status;
  }
}

/**
 * Human-friendly copy for every documented error code returned by the
 * `validate-inquiry-upload` edge function (see integration_test.ts).
 */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Short, friendly summary of the accepted formats used in inline hints. */
export const ACCEPTED_FORMATS_HINT =
  "Accepted: PDF, JPG, PNG, HEIC, WebP, GIF, DOC/DOCX, XLS/XLSX, CSV, TXT.";

function summariseAllowedExtensions(details?: Record<string, unknown>): string | null {
  const list = details?.allowed_extensions;
  if (Array.isArray(list) && list.length) {
    const exts = list.map((e) => `.${String(e).replace(/^\./, "")}`).join(", ");
    return exts;
  }
  return null;
}

/**
 * Human-friendly copy for every documented error code returned by the
 * `validate-inquiry-upload` edge function (see integration_test.ts).
 * Uses server-provided `details` (actual size, actual mime, allowed
 * extensions, max bytes) to make messages specific and actionable.
 */
export function friendlyUploadMessage(
  code: string,
  details?: Record<string, unknown>,
  fileName?: string,
): string {
  const who = fileName ? `"${fileName}"` : "This file";
  switch (code) {
    case "file_required":
      return "Please attach a file before uploading.";
    case "empty_file":
      return `${who} is empty (0 bytes). Choose a different file.`;
    case "file_too_large": {
      const max = typeof details?.max === "number" ? details.max : 10 * 1024 * 1024;
      const size = typeof details?.size === "number" ? details.size : null;
      const maxMb = Math.round(max / 1024 / 1024);
      const actual = size !== null ? ` It's ${formatBytes(size)}.` : "";
      return `${who} is too large — the limit is ${maxMb} MB.${actual} Compress it or upload a smaller version.`;
    }
    case "mime_not_allowed": {
      const mime =
        typeof details?.mime === "string" && details.mime ? details.mime : "unknown";
      return `${who} is a ${mime} file, which isn't accepted. ${ACCEPTED_FORMATS_HINT}`;
    }
    case "invalid_filename":
      return `${who} has an invalid filename. Rename it using letters, numbers, dots, dashes or underscores and try again.`;
    case "extension_mismatch": {
      const allowed = summariseAllowedExtensions(details);
      const mime =
        typeof details?.mime === "string" && details.mime ? details.mime : null;
      const ext =
        typeof details?.extension === "string" && details.extension
          ? `.${details.extension}`
          : "the current extension";
      const expected = allowed ? ` Expected ${allowed}.` : "";
      return `${who} has ${ext}, which doesn't match its ${mime ?? "declared"} contents.${expected}`;
    }
    case "content_mismatch": {
      const mime =
        typeof details?.mime === "string" && details.mime ? details.mime : "declared";
      return `${who} doesn't look like a real ${mime} file. Please re-export or upload the original.`;
    }
    case "invalid_folder":
      return "Upload session was invalid. Refresh the page and try again.";
    case "invalid_multipart":
      return "Upload was malformed. Please try again.";
    case "method_not_allowed":
      return "Upload endpoint rejected the request. Please try again.";
    case "storage_write_failed":
    case "upload_failed":
      return `${who} couldn't be saved to storage. Please retry in a moment.`;
    case "persist_failed":
      return `${who} uploaded but couldn't be recorded. Please retry.`;
    case "server_misconfigured":
      return "Uploads are temporarily unavailable. Please try again shortly or email us the file directly.";
    case "rate_limit":
    case "too_many_requests":
      return "Too many uploads in a short time. Wait a moment and try again.";
    case "unauthorized":
    case "forbidden":
      return "Your session expired. Refresh the page and try again.";
    case "network_error":
      return `${who} couldn't reach the server. Check your connection and retry.`;
    case "aborted":
      return `${who} upload was cancelled.`;
    default:
      return `${who} couldn't be uploaded. Please retry or choose a different file.`;
  }
}

export interface UploadOptions {
  /** Fires with a 0..1 progress fraction while the request body streams. */
  onProgress?: (progress: number) => void;
  /** Optional AbortSignal to cancel the in-flight upload. */
  signal?: AbortSignal;
}

/**
 * Uploads a single inquiry attachment via the server-side
 * `validate-inquiry-upload` edge function. Uses XHR so we can surface
 * upload-progress events and support cancellation.
 */
export async function uploadInquiryAttachment(
  file: File,
  folder: string,
  opts: UploadOptions = {},
): Promise<UploadedAttachment> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-inquiry-upload`;
  const anon = getClientSupabaseKey() as string;
  const { data: sessionData } = await supabase.auth.getSession();
  const bearer = sessionData?.session?.access_token || anon;

  return new Promise<UploadedAttachment>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("apikey", anon);
    xhr.setRequestHeader("Authorization", `Bearer ${bearer}`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.min(1, e.loaded / e.total));
      }
    };

    const abortHandler = () => {
      xhr.abort();
    };
    if (opts.signal) {
      if (opts.signal.aborted) {
        reject(
          new UploadValidationError({
            message: "Upload cancelled.",
            code: "aborted",
            fileName: file.name,
          }),
        );
        return;
      }
      opts.signal.addEventListener("abort", abortHandler, { once: true });
    }

    const cleanup = () => {
      if (opts.signal) opts.signal.removeEventListener("abort", abortHandler);
    };

    xhr.onload = () => {
      cleanup();
      const status = xhr.status;
      const payload = xhr.response as
        | { path?: string; id?: string; size?: number; mime?: string; name?: string; error?: unknown; code?: string; details?: Record<string, unknown> }
        | null;

      if (status >= 200 && status < 300 && payload?.path) {
        resolve(payload as UploadedAttachment);
        return;
      }

      let code = "upload_failed";
      let details: Record<string, unknown> | undefined;
      if (payload && typeof payload === "object") {
        if (typeof payload.code === "string") code = payload.code;
        if (payload.details && typeof payload.details === "object") {
          details = payload.details as Record<string, unknown>;
        }
      }
      if (status === 0) code = "network_error";
      else if (status === 401) code = payload?.code ? code : "unauthorized";
      else if (status === 403) code = payload?.code ? code : "forbidden";
      else if (status === 429) code = payload?.code ? code : "rate_limit";
      else if (status >= 500 && !payload?.code) code = "upload_failed";
      reject(
        new UploadValidationError({
          message: friendlyUploadMessage(code, details, file.name),
          code,
          details,
          fileName: file.name,
          status,
        }),
      );
    };

    xhr.onerror = () => {
      cleanup();
      reject(
        new UploadValidationError({
          message: friendlyUploadMessage("network_error", undefined, file.name),
          code: "network_error",
          fileName: file.name,
        }),
      );
    };

    xhr.onabort = () => {
      cleanup();
      reject(
        new UploadValidationError({
          message: "Upload cancelled.",
          code: "aborted",
          fileName: file.name,
        }),
      );
    };

    xhr.send(body);
  });
}

export interface AttachmentRecord {
  id: string;
  path: string;
  name: string;
  size: number;
  mime: string;
  uploaded_at: string;
}

/**
 * Sequential multi-file upload. Retained for callers that don't need
 * per-file progress reporting; prefer `useAttachmentUpload` in UI.
 */
export async function uploadInquiryAttachments(
  files: File[],
  folder = crypto.randomUUID(),
  opts: {
    onFileProgress?: (index: number, progress: number) => void;
  } = {},
): Promise<{ ids: string[]; paths: string[]; records: AttachmentRecord[] }> {
  const uploaded: UploadedAttachment[] = [];
  for (let i = 0; i < files.length; i++) {
    uploaded.push(
      await uploadInquiryAttachment(files[i], folder, {
        onProgress: opts.onFileProgress ? (p) => opts.onFileProgress!(i, p) : undefined,
      }),
    );
  }
  const now = new Date().toISOString();
  const records: AttachmentRecord[] = uploaded.map((u) => ({
    id: u.id,
    path: u.path,
    name: u.name,
    size: u.size,
    mime: u.mime,
    uploaded_at: now,
  }));
  return {
    ids: records.map((r) => r.id),
    paths: records.map((r) => r.path),
    records,
  };
}

/**
 * Links previously uploaded attachment rows to a newly created inquiry.
 * Called by the submit flow once the `inquiries` row exists so admins
 * can query attachments by inquiry_id.
 */
export async function linkAttachmentsToInquiry(
  ids: string[],
  inquiryId: string,
): Promise<void> {
  if (!ids.length || !inquiryId) return;
  await supabase.rpc("link_inquiry_attachments", {
    _ids: ids,
    _inquiry_id: inquiryId,
  });
}

