#!/usr/bin/env node
/**
 * scripts/prepublish.mjs
 *
 * Pre-publish gate with automatic retry. Runs typecheck → lint → tests →
 * build sequentially, captures the full stdout+stderr of each step, and on
 * failure re-runs just that step up to PUBLISH_MAX_RETRIES times with
 * exponential backoff. On persistent failure we classify the failure into a
 * specific phase (compile / bundle / asset-upload / publish-infra / …) using
 * scripts/lib/publishPhase.mjs, so the report says exactly what broke.
 *
 * Writes a JSON report to `.lovable/publish-logs/<run_id>.json` and — when
 * PUBLISH_LOG_INGEST_URL + PUBLISH_LOG_INGEST_SECRET are set — POSTs the
 * report to the `publish-log-ingest` edge function so it appears in
 * /hq/publish-logs.
 *
 * Env:
 *   PUBLISH_MAX_RETRIES     default 2 (so up to 3 attempts per step)
 *   PUBLISH_RETRY_BASE_MS   default 4000
 *   PUBLISH_SKIP_RETRY      comma list of step kinds that should not retry
 *   PUBLISH_LOG_INGEST_URL  edge function URL
 *   PUBLISH_LOG_INGEST_SECRET  shared secret
 *
 * Usage:
 *   node scripts/prepublish.mjs
 *   node scripts/prepublish.mjs --skip=lint,test
 *   node scripts/prepublish.mjs --only=build      # rerun a single step
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { classifyFailure } from "./lib/publishPhase.mjs";

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, ".lovable/publish-logs");
mkdirSync(OUT_DIR, { recursive: true });

const argv = process.argv.slice(2);
const flag = (name) => {
  const a = argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : "";
};
const SKIP = new Set(flag("skip").split(",").map((s) => s.trim()).filter(Boolean));
const ONLY = new Set(flag("only").split(",").map((s) => s.trim()).filter(Boolean));

const MAX_RETRIES = Math.max(0, Number(process.env.PUBLISH_MAX_RETRIES ?? 2));
const RETRY_BASE_MS = Math.max(500, Number(process.env.PUBLISH_RETRY_BASE_MS ?? 4000));
const NO_RETRY = new Set(
  (process.env.PUBLISH_SKIP_RETRY ?? "lint,typecheck")
    .split(",").map((s) => s.trim()).filter(Boolean),
);

const STEPS = [
  { kind: "typecheck", cmd: "bunx", args: ["tsgo", "--noEmit"] },
  { kind: "lint",      cmd: "bunx", args: ["eslint", ".", "--max-warnings=0"] },
  { kind: "test",      cmd: "bunx", args: ["vitest", "run", "--reporter=default"] },
  { kind: "build",     cmd: "bun",  args: ["run", "build"] },
];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function runOnce(step) {
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
        status: code === 0 ? "pass" : "fail",
        duration_ms: Date.now() - started,
        exit_code: code,
        log: out,
      });
    });
    child.on("error", (err) => {
      res({
        status: "fail",
        duration_ms: Date.now() - started,
        exit_code: -1,
        log: out + `\n[spawn error] ${err.message}`,
      });
    });
  });
}

async function runStepWithRetry(step) {
  const attempts = [];
  const maxAttempts = NO_RETRY.has(step.kind) ? 1 : MAX_RETRIES + 1;
  let last;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `\n─── ${step.kind}: attempt ${attempt}/${maxAttempts} (${step.cmd} ${step.args.join(" ")})\n`,
    );
    last = await runOnce(step);
    attempts.push({
      attempt,
      status: last.status,
      exit_code: last.exit_code,
      duration_ms: last.duration_ms,
    });
    if (last.status === "pass") break;
    const { phase, hint } = classifyFailure(last.log, step.kind);
    console.log(`\n✗ ${step.kind} failed [phase=${phase}]${hint ? `  ${hint}` : ""}`);
    if (attempt < maxAttempts) {
      const wait = RETRY_BASE_MS * 2 ** (attempt - 1);
      console.log(`↻ retrying in ${wait}ms…`);
      await sleep(wait);
    }
  }
  const { phase, hint } = last.status === "pass"
    ? { phase: null, hint: null }
    : classifyFailure(last.log, step.kind);
  return {
    kind: step.kind,
    status: last.status,
    duration_ms: attempts.reduce((n, a) => n + a.duration_ms, 0),
    exit_code: last.exit_code,
    log: last.log,
    attempts,
    phase,
    phase_hint: hint,
  };
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

console.log(`\n▶ prepublish gate  run_id=${runId}  max_retries=${MAX_RETRIES}\n`);

const results = [];
let failed = false;
for (const step of STEPS) {
  if (SKIP.has(step.kind) || (ONLY.size && !ONLY.has(step.kind))) {
    console.log(`\n─── ${step.kind}: SKIPPED`);
    results.push({ kind: step.kind, status: "skipped", duration_ms: 0, log: "", attempts: [] });
    continue;
  }
  if (failed) {
    console.log(`\n─── ${step.kind}: SKIPPED (previous step failed)`);
    results.push({
      kind: step.kind, status: "skipped", duration_ms: 0,
      log: "skipped because a previous step failed", attempts: [],
    });
    continue;
  }
  const r = await runStepWithRetry(step);
  results.push(r);
  console.log(
    `\n─── ${step.kind}: ${r.status.toUpperCase()} in ${r.duration_ms}ms` +
    (r.attempts.length > 1 ? ` (after ${r.attempts.length} attempts)` : ""),
  );
  if (r.status === "fail") failed = true;
}

const failing = results.find((r) => r.status === "fail");
const summary = {
  kind: "summary",
  status: failed ? "fail" : "pass",
  duration_ms: results.reduce((n, r) => n + (r.duration_ms || 0), 0),
  log:
    results
      .map((r) => {
        const a = r.attempts?.length ? ` [${r.attempts.length}x]` : "";
        const p = r.phase ? ` phase=${r.phase}` : "";
        return `${r.kind.padEnd(10)} ${r.status.padEnd(8)} ${r.duration_ms ?? 0}ms${a}${p}`;
      })
      .join("\n") + (failing?.phase_hint ? `\n\nfailing hint: ${failing.phase_hint}` : ""),
  meta: {
    exit_codes: Object.fromEntries(results.map((r) => [r.kind, r.exit_code ?? null])),
    failing_step: failing?.kind ?? null,
    failing_phase: failing?.phase ?? null,
    failing_hint: failing?.phase_hint ?? null,
    attempts: Object.fromEntries(results.map((r) => [r.kind, r.attempts?.length ?? 0])),
    max_retries: MAX_RETRIES,
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
    meta: {
      exit_code: r.exit_code ?? null,
      attempts: r.attempts ?? [],
      phase: r.phase ?? null,
      phase_hint: r.phase_hint ?? null,
    },
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
      headers: { "content-type": "application/json", "x-ingest-secret": ingestSecret },
      body: JSON.stringify(payload),
    });
    const body = await resp.text();
    if (!resp.ok) console.error(`\n⚠ publish-log-ingest returned ${resp.status}: ${body}`);
    else console.log(`\n✅ uploaded log run to publish_logs (${body})`);
  } catch (err) {
    console.error(`\n⚠ publish-log-ingest upload failed: ${err.message}`);
  }
} else {
  console.log(
    "\nℹ set PUBLISH_LOG_INGEST_URL + PUBLISH_LOG_INGEST_SECRET to stream this run to /hq/publish-logs",
  );
}

if (failing) {
  console.log(
    `\n❌ prepublish FAILED at ${failing.kind}` +
    (failing.phase ? `  phase=${failing.phase}` : "") +
    (failing.phase_hint ? `\n   ${failing.phase_hint}` : "") +
    `\n   attempts=${failing.attempts.length}\n`,
  );
} else {
  console.log("\n✅ prepublish PASSED\n");
}
process.exit(failed ? 1 : 0);
