import { supabase } from "@/integrations/supabase/client";

export interface UploadedAttachment {
  id: string;
  path: string;
  size: number;
  mime: string;
  name: string;
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
      return `${who} is empty. Choose a different file.`;
    case "file_too_large": {
      const max = typeof details?.max === "number" ? details.max : 10 * 1024 * 1024;
      const maxMb = Math.round(max / 1024 / 1024);
      return `${who} exceeds the ${maxMb} MB limit. Compress it or upload a smaller version.`;
    }
    case "mime_not_allowed":
      return `${who} isn't a supported file type. Use PDF, image, or common office formats.`;
    case "invalid_filename":
      return `${who} has an invalid filename. Rename it without special characters and try again.`;
    case "extension_mismatch":
      return `${who} extension doesn't match its contents. Re-save it and try again.`;
    case "content_mismatch":
      return `${who} doesn't look like the type it claims to be. Please upload the original file.`;
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
  const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
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


