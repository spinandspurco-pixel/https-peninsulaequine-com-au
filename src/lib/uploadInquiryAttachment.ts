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
      return `${who} exceeds the ${maxMb} MB limit.`;
    }
    case "mime_not_allowed":
      return `${who} isn't a supported file type. Use PDF, image, or common office formats.`;
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
      return `${who} couldn't be saved. Please try again in a moment.`;
    default:
      return `${who} couldn't be uploaded (${code}).`;
  }
}

/**
 * Uploads a single inquiry attachment via the server-side
 * `validate-inquiry-upload` edge function, which enforces size,
 * MIME/extension, and magic-byte checks before writing to Storage.
 */
export async function uploadInquiryAttachment(
  file: File,
  folder: string,
): Promise<UploadedAttachment> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const { data, error } = await supabase.functions.invoke<UploadedAttachment>(
    "validate-inquiry-upload",
    { body },
  );
  if (error) {
    const ctx = (error as unknown as { context?: Response }).context;
    let code = "upload_failed";
    let message = error.message || "Upload failed";
    let details: Record<string, unknown> | undefined;
    const status = ctx?.status;
    if (ctx && typeof ctx.json === "function") {
      try {
        const payload = await ctx.json();
        // New shape: { error: string, code, details? }
        if (typeof payload?.error === "string") {
          message = payload.error;
          if (typeof payload?.code === "string") code = payload.code;
          if (payload?.details && typeof payload.details === "object") {
            details = payload.details as Record<string, unknown>;
          }
        } else if (payload?.error?.message) {
          // Legacy shape: { error: { code, message } }
          message = payload.error.message;
          if (typeof payload.error.code === "string") code = payload.error.code;
        }
      } catch {
        /* ignore body parse errors */
      }
    }
    throw new UploadValidationError({
      message: friendlyUploadMessage(code, details, file.name),
      code,
      details,
      fileName: file.name,
      status,
    });
  }
  if (!data?.path) {
    throw new UploadValidationError({
      message: friendlyUploadMessage("upload_failed", undefined, file.name),
      code: "upload_failed",
      fileName: file.name,
    });
  }
  return data;
}

export interface AttachmentRecord {
  path: string;
  name: string;
  size: number;
  mime: string;
  uploaded_at: string;
}

export async function uploadInquiryAttachments(
  files: File[],
  folder = crypto.randomUUID(),
): Promise<{ paths: string[]; records: AttachmentRecord[] }> {
  // Sequential so the first failure surfaces cleanly with its file name.
  const uploaded: UploadedAttachment[] = [];
  for (const f of files) {
    uploaded.push(await uploadInquiryAttachment(f, folder));
  }
  const now = new Date().toISOString();
  const records: AttachmentRecord[] = uploaded.map((u) => ({
    path: u.path,
    name: u.name,
    size: u.size,
    mime: u.mime,
    uploaded_at: now,
  }));
  return { paths: records.map((r) => r.path), records };
}
