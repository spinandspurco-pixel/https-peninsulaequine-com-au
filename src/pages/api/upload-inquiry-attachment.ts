import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const BUCKET = "inquiry-attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadResponse =
  | {
      attachment: {
        id: string;
        object_path: string;
        filename: string;
        mime_type: string | null;
        size_bytes: number;
        scan_status: "pending";
      };
    }
  | { error: string };

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function parseForm(req: NextApiRequest) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true,
  });

  return new Promise<formidable.File>((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);

      const fileValue = files.file;
      const file = Array.isArray(fileValue) ? fileValue[0] : fileValue;

      if (!file) return reject(new Error("Missing file field"));

      resolve(file);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let objectPath: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const file = await parseForm(req);

    const buffer = await fs.readFile(file.filepath);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    const originalName = file.originalFilename || "attachment";
    const mimeType = file.mimetype || null;
    const sizeBytes = file.size;

    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    objectPath = `inquiries/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, buffer, {
        contentType: mimeType || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data, error: insertError } = await supabase
      .from("attachments")
      .insert({
        object_path: objectPath,
        filename: originalName,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        sha256: hash,
        scan_status: "pending",
      })
      .select("id, object_path, filename, mime_type, size_bytes, scan_status")
      .single();

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([objectPath]);
      throw insertError;
    }

    return res.status(200).json({ attachment: data });
  } catch (error) {
    console.error("upload-inquiry-attachment error:", error);

    return res.status(400).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
}
