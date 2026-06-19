#!/usr/bin/env bun
/**
 * Security gate.
 *
 * Fetches current Supabase DB linter findings, compares them to the
 * committed baseline at `.security/baseline.json`, and exits non-zero if
 * any *new* finding has appeared since the baseline was last updated.
 *
 * Usage:
 *   bun scripts/security-gate.ts                 # check, fail on new findings
 *   bun scripts/security-gate.ts --update-baseline   # rewrite baseline locally
 *
 * Env:
 *   SUPABASE_ACCESS_TOKEN   (required) personal access token w/ read access
 *   SUPABASE_PROJECT_REF    (optional) defaults to the project's ref
 *   GITHUB_STEP_SUMMARY     (optional) when set, a markdown summary is appended
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "aizkqajrzkvwuobisnzr";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? "";
const BASELINE_PATH = resolve(process.cwd(), ".security/baseline.json");
const REPORT_PATH = resolve(process.cwd(), "security-report.json");

type Lint = {
  name: string;
  level: string;
  facing?: string;
  categories?: string[];
  description?: string;
  detail?: string;
  remediation?: string;
  metadata?: { schema?: string; name?: string; type?: string };
  cache_key?: string;
};

type BaselineEntry = {
  fingerprint: string;
  name: string;
  level: string;
  schema?: string;
  object?: string;
  acknowledged_in?: string;
};

function fingerprint(l: Lint): string {
  const key = [
    l.name,
    l.level,
    l.metadata?.schema ?? "",
    l.metadata?.name ?? "",
    l.cache_key ?? "",
  ].join("|");
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

async function fetchLints(): Promise<Lint[]> {
  if (!TOKEN) {
    console.error(
      "ERROR: SUPABASE_ACCESS_TOKEN is not set. Add it as a GitHub Actions secret " +
        "with read access to project " + PROJECT_REF + ".",
    );
    process.exit(2);
  }
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/lints`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    console.error(`ERROR: linter fetch failed: ${res.status} ${await res.text()}`);
    process.exit(2);
  }
  return (await res.json()) as Lint[];
}

function loadBaseline(): BaselineEntry[] {
  if (!existsSync(BASELINE_PATH)) return [];
  try {
    const raw = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
    return Array.isArray(raw?.findings) ? raw.findings : [];
  } catch (e) {
    console.error(`ERROR: failed to parse ${BASELINE_PATH}: ${(e as Error).message}`);
    process.exit(2);
  }
}

function writeBaseline(entries: BaselineEntry[]) {
  mkdirSync(dirname(BASELINE_PATH), { recursive: true });
  writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        project_ref: PROJECT_REF,
        findings: entries,
      },
      null,
      2,
    ) + "\n",
  );
}

function summary(lines: string[]) {
  const out = lines.join("\n") + "\n";
  console.log(out);
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (path) {
    try {
      writeFileSync(path, out, { flag: "a" });
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  const update = process.argv.includes("--update-baseline");
  const lints = await fetchLints();
  const current: BaselineEntry[] = lints.map((l) => ({
    fingerprint: fingerprint(l),
    name: l.name,
    level: l.level,
    schema: l.metadata?.schema,
    object: l.metadata?.name,
  }));

  writeFileSync(
    REPORT_PATH,
    JSON.stringify({ fetched_at: new Date().toISOString(), lints }, null, 2),
  );

  if (update) {
    writeBaseline(current);
    summary([
      "## Security Gate — baseline updated",
      `- Project: \`${PROJECT_REF}\``,
      `- Findings recorded: **${current.length}**`,
    ]);
    return;
  }

  const baseline = loadBaseline();
  const baselineFps = new Set(baseline.map((b) => b.fingerprint));
  const currentFps = new Set(current.map((c) => c.fingerprint));

  const added = current.filter((c) => !baselineFps.has(c.fingerprint));
  const resolved = baseline.filter((b) => !currentFps.has(b.fingerprint));

  const lines: string[] = [];
  lines.push("## Security Gate");
  lines.push(`- Project: \`${PROJECT_REF}\``);
  lines.push(`- Current findings: **${current.length}**`);
  lines.push(`- Baseline findings: **${baseline.length}**`);
  lines.push(`- New (must fix or acknowledge): **${added.length}**`);
  lines.push(`- Resolved since baseline: **${resolved.length}**`);

  if (resolved.length) {
    lines.push("");
    lines.push("### Resolved findings (consider pruning baseline)");
    for (const r of resolved) {
      lines.push(`- \`${r.name}\` ${r.level} — ${r.schema ?? ""}.${r.object ?? ""}`);
    }
  }

  if (added.length) {
    lines.push("");
    lines.push("### ❌ New security findings");
    lines.push("");
    lines.push("| Level | Name | Object | Fingerprint |");
    lines.push("| --- | --- | --- | --- |");
    for (const a of added) {
      lines.push(
        `| ${a.level} | ${a.name} | ${a.schema ?? ""}.${a.object ?? ""} | \`${a.fingerprint}\` |`,
      );
    }
    lines.push("");
    lines.push(
      "To accept any of these intentionally, run `bun scripts/security-gate.ts --update-baseline` locally and commit `.security/baseline.json` in the same PR.",
    );
    summary(lines);
    process.exit(1);
  }

  lines.push("");
  lines.push("✅ No new security findings.");
  summary(lines);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
