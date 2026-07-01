// Simple scanner worker for attachments (Node)
const { createClient } = require("@supabase/supabase-js");
const { spawnSync } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SCAN_BUCKET || "inquiry-attachments";
const MAX_WORK = Number(process.env.MAX_WORK || 5);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing env");

const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function downloadObject(objectPath) {
  const { data, error } = await supa.storage.from(BUCKET).download(objectPath);
  if (error || !data) throw new Error("download failed");
  const tmpFile = path.join("/tmp", path.basename(objectPath));
  const buf = Buffer.from(await data.arrayBuffer());
  await fs.writeFile(tmpFile, buf);
  return tmpFile;
}

function runClamScan(filePath) {
  const res = spawnSync("clamscan", ["--no-summary", filePath], { encoding: "utf8" });
  return { code: res.status, output: res.stdout || res.stderr };
}

async function mark(id, update) {
  await supa.from("attachments").update(update).eq("id", id);
}

async function processOne(row) {
  const { id, object_path } = row;
  try {
    await mark(id, { scan_status: "scanning" });
    const tmp = await downloadObject(object_path);
    const { code, output } = runClamScan(tmp);
    if (code === 0) {
      await mark(id, { scan_status: "clean", scan_result: { output } });
    } else {
      const infected = output && output.includes("FOUND");
      await mark(id, { scan_status: infected ? "infected" : "failed", scan_result: { output } });
      if (infected) {
        await supa.storage.from(BUCKET).remove([object_path]).catch(() => {});
      }
    }
    await fs.unlink(tmp).catch(() => {});
  } catch (err) {
    console.error("scan error", id, err);
    await mark(id, { scan_status: "failed", scan_result: { error: String(err) } });
  }
}

async function main() {
  try {
    const { data } = await supa.from("attachments").select("*").eq("scan_status", "pending").limit(MAX_WORK);
    if (!data || data.length === 0) return;
    for (const row of data) {
      await processOne(row);
    }
  } catch (err) {
    console.error("worker main error", err);
  }
}

setInterval(main, Number(process.env.POLL_MS || 30_000));
main().catch(console.error);
