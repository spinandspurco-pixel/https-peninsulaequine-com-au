#!/usr/bin/env node
/**
 * Inquiry attachment upload smoke check.
 *
 * Round-trips a synthetic PNG through the production upload path and
 * verifies that:
 *   1. `validate-inquiry-upload` returns a `path` + row `id` (i.e. the
 *      file was written to the private `inquiry-attachments` bucket via
 *      the service role).
 *   2. That path is retrievable via a signed URL (proves the object
 *      actually exists in the bucket, not just that the API said so).
 *   3. `submit-inquiry` accepts the returned path, persists an
 *      `inquiries` row, and echoes `received.attachment_count`
 *      matching the number of uploaded files.
 *
 * Usage:  node scripts/inquiry-upload-smoke.mjs
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env
 * (or the current environment). No service-role key required.
 */
import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}
loadEnv();

const URL_BASE = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!URL_BASE || !ANON) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(2);
}

// 1×1 transparent PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

const headers = { apikey: ANON, Authorization: `Bearer ${ANON}` };
const folder = randomUUID();
const fileName = `smoke-${Date.now()}.png`;

function step(name, ok, detail = "") {
  const badge = ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(` ${badge} ${name}${detail ? "  " + detail : ""}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  console.log("→ Inquiry upload smoke check\n");

  // 1. Upload via edge function (service-role proxy → private bucket).
  const form = new FormData();
  form.append("folder", folder);
  form.append(
    "file",
    new Blob([PNG], { type: "image/png" }),
    fileName,
  );
  const upRes = await fetch(`${URL_BASE}/functions/v1/validate-inquiry-upload`, {
    method: "POST",
    headers,
    body: form,
  });
  const upBody = await upRes.json().catch(() => ({}));
  const uploaded =
    upRes.ok && typeof upBody.path === "string" && typeof upBody.id === "string";
  step(
    "validate-inquiry-upload returned path + id",
    uploaded,
    uploaded ? upBody.path : `HTTP ${upRes.status} ${JSON.stringify(upBody)}`,
  );
  if (!uploaded) return;

  // 2. Prove the object physically exists in the bucket via signed URL.
  const signRes = await fetch(
    `${URL_BASE}/storage/v1/object/sign/inquiry-attachments/${upBody.path}`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: 60 }),
    },
  );
  const signBody = await signRes.json().catch(() => ({}));
  let objectPresent = false;
  if (signRes.ok && signBody.signedURL) {
    const dl = await fetch(`${URL_BASE}/storage/v1${signBody.signedURL}`);
    const bytes = dl.ok ? (await dl.arrayBuffer()).byteLength : 0;
    objectPresent = dl.ok && bytes === PNG.length;
    step(
      "object retrievable from inquiry-attachments bucket",
      objectPresent,
      `HTTP ${dl.status}, ${bytes} bytes`,
    );
  } else {
    step(
      "object retrievable from inquiry-attachments bucket",
      false,
      `sign HTTP ${signRes.status} ${JSON.stringify(signBody)}`,
    );
  }

  // 3. Submit an inquiry carrying the path + id and verify the round-trip.
  const submitRes = await fetch(`${URL_BASE}/functions/v1/submit-inquiry`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Test",
      email: `smoke+${Date.now()}@peninsulaequine.systems`,
      services: ["riding-lessons"],
      project_vision: "Automated upload smoke check — safe to delete.",
      attachment_urls: [upBody.path],
      attachment_ids: [upBody.id],
      source: "smoke-test",
      // spam-guard bypass fields
      website: "",
      dwell_ms: 5000,
    }),
  });
  const submitBody = await submitRes.json().catch(() => ({}));
  const echoed = submitBody?.received?.attachment_count;
  const persisted =
    submitRes.ok && submitBody.ok && echoed === 1 && typeof submitBody.id === "string";
  step(
    "submit-inquiry persisted row with attachment_count = 1",
    persisted,
    persisted
      ? `inquiry ${submitBody.id}`
      : `HTTP ${submitRes.status} echoed=${echoed} ${JSON.stringify(submitBody).slice(0, 200)}`,
  );

  console.log(
    process.exitCode
      ? "\n✗ Smoke check failed"
      : "\n✓ Smoke check passed",
  );
}

main().catch((err) => {
  console.error("\n✗ Uncaught error:", err);
  process.exit(1);
});
