import { supabase } from "@/integrations/supabase/client";

export interface UploadedAttachment {
  path: string;
  size: number;
  mime: string;
  name: string;
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
    // FunctionsHttpError exposes response body via context.
    const ctx = (error as unknown as { context?: Response }).context;
    let message = error.message;
    if (ctx && typeof ctx.json === "function") {
      try {
        const payload = await ctx.json();
        message = payload?.error?.message ?? message;
      } catch {
        /* ignore */
      }
    }
    throw new Error(message);
  }
  if (!data?.path) throw new Error("Upload failed: no path returned");
  return data;
}

export async function uploadInquiryAttachments(
  files: File[],
  folder = crypto.randomUUID(),
): Promise<string[]> {
  const results = await Promise.all(files.map((f) => uploadInquiryAttachment(f, folder)));
  return results.map((r) => r.path);
}
