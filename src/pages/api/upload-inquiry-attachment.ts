import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Disable Next's default body parser so formidable can handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "inquiry-attachments";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp|heic|dwg|dxf|docx?|xlsx?)$/i;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Fail fast in server runtime if env is missing
  // (next will surface this during server start or first invocation)
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supaAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({ maxFileSize: MAX_SIZE, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { fields, files } = await parseForm(req);
    const fileField = (files as any).file || (files as any).files;
    if (!fileField) return res.status(400).json({ error: "No file provided" });

    // Support single-file upload; if multiple, take first (can be extended)
    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    const filepath = (file as formidable.File).filepath;
    const originalFilename = (file as formidable.File).originalFilename || "upload.bin";
    const mimetype = (file as formidable.File).mimetype || null;
    const size = (file as formidable.File).size || fs.statSync(filepath).size;

    if (size > MAX_SIZE) return res.status(400).json({ error: "File too large" });
    if (!ALLOWED_EXT.test(originalFilename)) return res.status(400).json({ error: "Filetype not allowed" });

    const buffer = fs.readFileSync(filepath);
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

    // Safe object path
    const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
    const objectPath = `${crypto.randomUUID()}/${Date.now()}-${safeName}`;

    // Upload via service role
    const { error: uploadErr } = await supaAdmin.storage.from(BUCKET).upload(objectPath, buffer, {
      contentType: mimetype || undefined,
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadErr) {
      console.error("Storage upload failed", uploadErr);
      return res.status(500).json({ error: "Upload failed" });
    }

    // Insert attachments metadata row
    const inquiry_id = Array.isArray(fields.inquiry_id) ? fields.inquiry_id[0] : (fields.inquiry_id as any) ?? null;
    const uploaded_by = Array.isArray(fields.uploaded_by) ? fields.uploaded_by[0] : (fields.uploaded_by as any) ?? null;

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
      // cleanup the uploaded object to avoid orphans
      await supaAdmin.storage.from(BUCKET).remove([objectPath]).catch(() => {});
      console.error("DB insert failed", insertErr);
      return res.status(500).json({ error: "DB insert failed" });
    }

    // Remove temporary server file
    try {
      fs.unlinkSync(filepath);
    } catch {}

    return res.status(200).json({ attachment: attachmentRow });
  } catch (err) {
    console.error("upload handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
