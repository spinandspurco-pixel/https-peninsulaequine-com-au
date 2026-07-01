// Cleanup orphan attachments: delete storage objects and DB rows for unattached files older than 7 days
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SCAN_BUCKET || "inquiry-attachments";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env");

const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function cleanup() {
  const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data } = await supa.from("attachments").select("id,object_path").is("inquiry_id", null).lt("uploaded_at", cutoff);
  if (!data || data.length === 0) return;
  const paths = data.map(r => r.object_path);
  await supa.storage.from(BUCKET).remove(paths).catch(() => {});
  const ids = data.map(r => r.id);
  await supa.from("attachments").delete().in("id", ids).catch(() => {});
}

cleanup().catch(console.error);
