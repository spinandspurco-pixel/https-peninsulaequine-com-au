import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supaAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function isStringOrNull(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  return String(v);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body ?? {};

    // Basic server-side validation & normalization
    const name = (body.name || "").toString().trim().slice(0, 200);
    const email = (body.email || "").toString().trim().slice(0, 320);
    if (!name || !email) return res.status(400).json({ error: "name and email required" });

    const phone = isStringOrNull(body.phone);
    const property_location = isStringOrNull(body.property_location);
    const property_type = isStringOrNull(body.property_type);

    // services should be an array of strings; coerce if possible
    let services: string[] | null = null;
    if (Array.isArray(body.services)) services = body.services.map((s: unknown) => String(s));
    else if (typeof body.services === "string") services = (body.services || "").split(",").map((s) => s.trim()).filter(Boolean);

    const budget_range = isStringOrNull(body.budget_range);
    const preferred_start = isStringOrNull(body.preferred_start);
    const project_details = isStringOrNull(body.project_details);
    const notes = isStringOrNull(body.notes);

    // attachment_ids: expected array of UUID strings (may be empty)
    const attachment_ids = Array.isArray(body.attachment_ids) ? body.attachment_ids.filter(Boolean) : [];

    // Call the DB function that performs the insert + update atomically.
    // The function name and param order must match the migration provided elsewhere.
    const rpcParams: Record<string, unknown> = {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_property_location: property_location,
      p_property_type: property_type,
      p_services: services,
      p_budget_range: budget_range,
      p_preferred_start: preferred_start,
      p_project_details: project_details,
      p_notes: notes,
      p_attachment_ids: attachment_ids.length ? attachment_ids : null,
    };

    const { data, error } = await supaAdmin.rpc("create_inquiry_with_attachments", rpcParams);

    if (error) {
      console.error("create_inquiry_with_attachments rpc error:", error);
      return res.status(500).json({ error: error.message || "DB error" });
    }

    return res.status(200).json({ inquiry: data });
  } catch (err) {
    console.error("create-inquiry handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
