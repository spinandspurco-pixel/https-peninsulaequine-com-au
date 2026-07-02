#!/usr/bin/env node
/**
 * scripts/prepublish.mjs
 *
 * Pre-publish gate. Runs typecheck, lint, tests, and build sequentially,
 * captures the full stdout+stderr of each step, writes a JSON report to
 * `.lovable/publish-logs/<run_id>.json`, and — when
 * PUBLISH_LOG_INGEST_URL + PUBLISH_LOG_INGEST_SECRET are set — POSTs the
 * report to the `publish-log-ingest` edge function so it appears in
 * /hq/publish-logs.
 *
 * Exit code is non-zero if any step fails, so this is safe to wire into a
 * `prepublish` npm hook or CI job.
 *
 * Usage:
 *   node scripts/prepublish.mjs                     # run everything
 *   node scripts/prepublish.mjs --skip=lint,test    # skip specific steps
 *   PUBLISH_LOG_INGEST_URL=... PUBLISH_LOG_INGEST_SECRET=... node scripts/prepublish.mjs
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, ".lovable/publish-logs");
mkdirSync(OUT_DIR, { recursive: true });

const skipArg = process.argv.find((a) => a.startsWith("--skip="));
const SKIP = new Set(
  (skipArg ? skipArg.slice("--skip=".length) : "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const STEPS = [
  { kind: "typecheck", cmd: "bunx",  args: ["tsgo", "--noEmit"] },
  { kind: "lint",      cmd: "bunx",  args: ["eslint", ".", "--max-warnings=0"] },
  { kind: "test",      cmd: "bunx",  args: ["vitest", "run", "--reporter=default"] },
  { kind: "build",     cmd: "bun",   args: ["run", "build"] },
];

function runStep(step) {
  return new Promise((res) => {
    const started = Date.now();
    const child = spawn(step.cmd, step.args, { cwd: ROOT, env: process.env });
    let out = "";
    const push = (chunk) => {
      const s = chunk.toString();
      out += s;
      process.stdout.write(s);
    };
    child.stdout.on("data", push);
    child.stderr.on("data", push);
    child.on("close", (code) => {
      res({
        kind: step.kind,
        status: code === 0 ? "pass" : "fail",
        duration_ms: Date.now() - started,
        exit_code: code,
        log: out,
      });
    });
    child.on("error", (err) => {
      res({
        kind: step.kind,
        status: "fail",
        duration_ms: Date.now() - started,
        exit_code: -1,
        log: out + `\n[spawn error] ${err.message}`,
      });
    });
  });
}

const runId = process.env.PUBLISH_RUN_ID || randomUUID();
const commitSha =
  process.env.COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  null;
const branch =
  process.env.BRANCH ||
  process.env.GITHUB_REF_NAME ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  null;
const actor = process.env.PUBLISH_ACTOR || process.env.GITHUB_ACTOR || null;

console.log(`\n▶ prepublish gate  run_id=${runId}\n`);

const results = [];
let failed = false;
for (const step of STEPS) {
  if (SKIP.has(step.kind)) {
    console.log(`\n─── ${step.kind}: SKIPPED\n`);
    results.push({ kind: step.kind, status: "skipped", duration_ms: 0, log: "" });
    continue;
  }
  console.log(`\n─── ${step.kind}: running (${step.cmd} ${step.args.join(" ")})\n`);
  if (failed) {
    console.log(`(previous step failed — skipping ${step.kind})`);
    results.push({
      kind: step.kind,
      status: "skipped",
      duration_ms: 0,
      log: "skipped because a previous step failed",
    });
    continue;
  }
  const r = await runStep(step);
  results.push(r);
  console.log(`\n─── ${step.kind}: ${r.status.toUpperCase()} in ${r.duration_ms}ms`);
  if (r.status === "fail") failed = true;
}

const summary = {
  kind: "summary",
  status: failed ? "fail" : "pass",
  duration_ms: results.reduce((n, r) => n + (r.duration_ms || 0), 0),
  log:
    results
      .map((r) => `${r.kind.padEnd(10)} ${r.status.padEnd(8)} ${r.duration_ms ?? 0}ms`)
      .join("\n"),
  meta: {
    exit_codes: Object.fromEntries(results.map((r) => [r.kind, r.exit_code ?? null])),
  },
};

const payload = {
  run_id: runId,
  commit_sha: commitSha,
  branch,
  actor,
  steps: results.map((r) => ({
    kind: r.kind,
    status: r.status,
    duration_ms: r.duration_ms,
    log: r.log,
    meta: { exit_code: r.exit_code ?? null },
  })).concat([summary]),
};

const outPath = resolve(OUT_DIR, `${runId}.json`);
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`\n📝 wrote ${outPath}`);

const ingestUrl = process.env.PUBLISH_LOG_INGEST_URL;
const ingestSecret = process.env.PUBLISH_LOG_INGEST_SECRET;
if (ingestUrl && ingestSecret) {
  try {
    const resp = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-ingest-secret": ingestSecret,
      },
      body: JSON.stringify(payload),
    });
    const body = await resp.text();
    if (!resp.ok) {
      console.error(`\n⚠ publish-log-ingest returned ${resp.status}: ${body}`);
    } else {
      console.log(`\n✅ uploaded log run to publish_logs (${body})`);
    }
  } catch (err) {
    console.error(`\n⚠ publish-log-ingest upload failed: ${err.message}`);
  }
} else {
  console.log(
    "\nℹ set PUBLISH_LOG_INGEST_URL + PUBLISH_LOG_INGEST_SECRET to stream this run to /hq/publish-logs",
  );
}

console.log(`\n${failed ? "❌ prepublish FAILED" : "✅ prepublish PASSED"}\n`);
process.exit(failed ? 1 : 0);
