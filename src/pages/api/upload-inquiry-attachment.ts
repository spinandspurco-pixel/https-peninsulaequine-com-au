import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { errors as formidableErrors } from "formidable";
import fs from "fs";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Disable Next's default body parser so formidable can handle multipart/form-data
export const config = {
  api: { bodyParser: false },
};

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "inquiry-attachments";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp|heic|dwg|dxf|docx?|xlsx?)$/i;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/acad",
  "image/vnd.dwg",
  "image/vnd.dxf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream", // some browsers report this for DWG/DXF
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supaAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type ValidationError = {
  error: string;
  code:
    | "no_file"
    | "empty_file"
    | "file_too_large"
    | "filetype_not_allowed"
    | "invalid_content_type"
    | "invalid_inquiry_id"
    | "method_not_allowed"
    | "multipart_parse_failed"
    | "internal_error"
    | "upload_failed"
    | "db_insert_failed";
  details?: Record<string, unknown>;
};

function fail(
  res: NextApiResponse,
  status: number,
  code: ValidationError["code"],
  error: string,
  details?: Record<string, unknown>,
) {
  return res.status(status).json({ error, code, details } satisfies ValidationError);
}

function safeUnlink(p?: string) {
  if (!p) return;
  try {
    fs.unlinkSync(p);
  } catch {
    /* noop */
  }
}

async function parseForm(
  req: NextApiRequest,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({
    maxFileSize: MAX_SIZE,
    maxFiles: 1,
    keepExtensions: true,
    multiples: false,
    allowEmptyFiles: false,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return fail(res, 405, "method_not_allowed", "Method not allowed. Use POST.");
  }

  const ct = req.headers["content-type"] || "";
  if (!ct.toLowerCase().startsWith("multipart/form-data")) {
    return fail(
      res,
      415,
      "invalid_content_type",
      "Request must be multipart/form-data.",
      { received: ct || null },
    );
  }

  let filepath: string | undefined;

  try {
    let fields: formidable.Fields;
    let files: formidable.Files;
    try {
      ({ fields, files } = await parseForm(req));
    } catch (err) {
      const anyErr = err as { code?: number; httpCode?: number; message?: string };
      // formidable-specific error codes → user-actionable responses
      if (anyErr?.code === formidableErrors.biggerThanMaxFileSize) {
        return fail(res, 413, "file_too_large", "File exceeds the 10 MB limit.", {
          maxBytes: MAX_SIZE,
        });
      }
      if (anyErr?.code === formidableErrors.noEmptyFiles) {
        return fail(res, 400, "empty_file", "Uploaded file is empty.");
      }
      return fail(res, 400, "multipart_parse_failed", "Could not parse upload.", {
        message: anyErr?.message ?? "unknown parser error",
      });
    }

    // Locate the file under `file` or `files`
    const fileField = (files.file ?? files.files) as
      | formidable.File
      | formidable.File[]
      | undefined;
    if (!fileField) {
      return fail(res, 400, "no_file", "No file provided. Send the file under field name 'file'.");
    }

    const file: formidable.File = Array.isArray(fileField) ? fileField[0] : fileField;
    filepath = file.filepath;
    const originalFilename = file.originalFilename || "upload.bin";
    const mimetype = file.mimetype || null;
    const size = file.size ?? (filepath ? fs.statSync(filepath).size : 0);

    if (size <= 0) {
      return fail(res, 400, "empty_file", "Uploaded file is empty.");
    }
    if (size > MAX_SIZE) {
      return fail(res, 413, "file_too_large", "File exceeds the 10 MB limit.", {
        maxBytes: MAX_SIZE,
        receivedBytes: size,
      });
    }
    if (!ALLOWED_EXT.test(originalFilename)) {
      return fail(
        res,
        415,
        "filetype_not_allowed",
        "This file type is not supported.",
        { filename: originalFilename },
      );
    }
    if (mimetype && !ALLOWED_MIME.has(mimetype)) {
      return fail(
        res,
        415,
        "filetype_not_allowed",
        "This MIME type is not supported.",
        { mimetype },
      );
    }

    // Optional inquiry_id must be a UUID if present
    const inquiryRaw = Array.isArray(fields.inquiry_id)
      ? fields.inquiry_id[0]
      : (fields.inquiry_id as string | undefined);
    const inquiry_id = inquiryRaw?.trim() || null;
    if (inquiry_id && !UUID_RE.test(inquiry_id)) {
      return fail(res, 400, "invalid_inquiry_id", "inquiry_id must be a UUID.");
    }
    const uploaded_by = Array.isArray(fields.uploaded_by)
      ? fields.uploaded_by[0]
      : (fields.uploaded_by as string | undefined) ?? null;

    const buffer = fs.readFileSync(filepath);
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

    const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
    const objectPath = `${crypto.randomUUID()}/${Date.now()}-${safeName}`;

    const { error: uploadErr } = await supaAdmin.storage.from(BUCKET).upload(objectPath, buffer, {
      contentType: mimetype || undefined,
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadErr) {
      console.error("Storage upload failed", uploadErr);
      return fail(res, 502, "upload_failed", "Storage upload failed.");
    }

    const { data: attachmentRow, error: insertErr } = await supaAdmin
      .from("attachments")
      .insert({
        inquiry_id,
        bucket_id: BUCKET,
        object_path: objectPath,
        filename: originalFilename,
        content_type: mimetype,
        size,
        checksum,
        uploaded_by,
        scan_status: "pending",
        metadata: {
          uploader_ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        },
      })
      .select()
      .single();

    if (insertErr) {
      await supaAdmin.storage.from(BUCKET).remove([objectPath]).catch(() => {});
      console.error("DB insert failed", insertErr);
      return fail(res, 500, "db_insert_failed", "Failed to record attachment.");
    }

    return res.status(200).json({ attachment: attachmentRow });
  } catch (err) {
    console.error("upload handler error:", err);
    return fail(res, 500, "internal_error", "Internal server error.");
  } finally {
    safeUnlink(filepath);
  }
}
