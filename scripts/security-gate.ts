#!/usr/bin/env bun
/**
 * Security gate.
 *
 * Fetches current findings from every wired-in scanner (Supabase DB
 * linter today, optional Wiz connector when credentials are present, and
 * any future connector source), compares the merged set to the committed
 * baseline at `.security/baseline.json`, and exits non-zero if any *new*
 * finding has appeared since the baseline was last updated.
 *
 * Side effects beyond the exit code:
 *   - Writes `security-report.json` with the raw per-source findings so
 *     the workflow can upload it as a CI artifact.
 *   - Writes `security-added.json` with the *added vs baseline* subset so
 *     the nightly-issue helper can render an Affected-code-areas section
 *     without re-implementing the diff logic.
 *
 * Usage:
 *   bun scripts/security-gate.ts                 # check, fail on new findings
 *   bun scripts/security-gate.ts --update-baseline   # rewrite baseline locally
 *
 * Env (required):
 *   SUPABASE_ACCESS_TOKEN   personal access token w/ read access to the lint endpoint
 *
 * Env (optional — Wiz connector findings are merged in when all are set):
 *   WIZ_API_URL             e.g. https://api.us17.app.wiz.io/graphql
 *   WIZ_CLIENT_ID
 *   WIZ_CLIENT_SECRET
 *   WIZ_AUTH_URL            defaults to https://auth.app.wiz.io/oauth/token
 *   WIZ_PROJECT_ID          optional project filter
 *
 * Env (optional — generic):
 *   SUPABASE_PROJECT_REF    defaults to the project's ref
 *   GITHUB_STEP_SUMMARY     when set, a markdown summary is appended
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "aizkqajrzkvwuobisnzr";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? "";
const BASELINE_PATH = resolve(process.cwd(), ".security/baseline.json");
const REPORT_PATH = resolve(process.cwd(), "security-report.json");
const ADDED_PATH = resolve(process.cwd(), "security-added.json");

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

type Finding = {
  source: "supabase" | "wiz" | string;
  fingerprint: string;
  name: string;
  level: string;
  schema?: string;
  object?: string;
  description?: string;
  remediation?: string;
  /** Tokens worth grepping the repo for to locate affected code. */
  searchHints: string[];
};

type BaselineEntry = {
  fingerprint: string;
  source?: string;
  name: string;
  level: string;
  schema?: string;
  object?: string;
  acknowledged_in?: string;
};

function fp(source: string, parts: Array<string | undefined>): string {
  return createHash("sha256")
    .update([source, ...parts.map((p) => p ?? "")].join("|"))
    .digest("hex")
    .slice(0, 16);
}

// ----------------------------------------------------------------------------
// Supabase linter source
// ----------------------------------------------------------------------------

async function fetchSupabaseFindings(): Promise<Finding[]> {
  if (!TOKEN) {
    console.error(
      "ERROR: SUPABASE_ACCESS_TOKEN is not set. Add it as a GitHub Actions secret " +
        "with read access to project " + PROJECT_REF + ".",
    );
    process.exit(2);
  }
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/lints`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) {
    console.error(`ERROR: Supabase linter fetch failed: ${res.status} ${await res.text()}`);
    process.exit(2);
  }
  const lints = (await res.json()) as Lint[];
  return lints.map((l) => ({
    source: "supabase",
    fingerprint: fp("supabase", [l.name, l.level, l.metadata?.schema, l.metadata?.name, l.cache_key]),
    name: l.name,
    level: l.level,
    schema: l.metadata?.schema,
    object: l.metadata?.name,
    description: l.description,
    remediation: l.remediation,
    searchHints: [l.metadata?.name, l.metadata?.schema && l.metadata?.name
      ? `${l.metadata.schema}.${l.metadata.name}`
      : undefined].filter((x): x is string => Boolean(x)),
  }));
}

// ----------------------------------------------------------------------------
// Wiz connector source (optional)
// ----------------------------------------------------------------------------

type WizIssue = {
  id: string;
  severity: string;
  status: string;
  control?: { name?: string };
  entitySnapshot?: { name?: string; type?: string; cloudPlatform?: string };
};

async function fetchWizFindings(): Promise<Finding[]> {
  const apiUrl = process.env.WIZ_API_URL;
  const clientId = process.env.WIZ_CLIENT_ID;
  const clientSecret = process.env.WIZ_CLIENT_SECRET;
  if (!apiUrl || !clientId || !clientSecret) {
    console.log("Wiz: credentials not set, skipping connector source.");
    return [];
  }
  const authUrl = process.env.WIZ_AUTH_URL ?? "https://auth.app.wiz.io/oauth/token";

  const tokenRes = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      audience: "wiz-api",
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });
  if (!tokenRes.ok) {
    console.error(`ERROR: Wiz auth failed: ${tokenRes.status} ${await tokenRes.text()}`);
    process.exit(2);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const query = `
    query OpenIssues($first: Int!, $filter: IssueFilters) {
      issues(first: $first, filterBy: $filter) {
        nodes {
          id severity status
          control { name }
          entitySnapshot { name type cloudPlatform }
        }
      }
    }`;
  const filter: Record<string, unknown> = { status: ["OPEN", "IN_PROGRESS"] };
  if (process.env.WIZ_PROJECT_ID) filter.project = [process.env.WIZ_PROJECT_ID];

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { first: 200, filter } }),
  });
  if (!res.ok) {
    console.error(`ERROR: Wiz query failed: ${res.status} ${await res.text()}`);
    process.exit(2);
  }
  const body = (await res.json()) as { data?: { issues?: { nodes?: WizIssue[] } } };
  const nodes = body.data?.issues?.nodes ?? [];
  return nodes.map((n) => ({
    source: "wiz",
    fingerprint: fp("wiz", [n.control?.name, n.severity, n.entitySnapshot?.type, n.entitySnapshot?.name]),
    name: n.control?.name ?? "wiz-issue",
    level: n.severity.toLowerCase(),
    schema: n.entitySnapshot?.cloudPlatform,
    object: n.entitySnapshot?.name,
    description: `${n.entitySnapshot?.type ?? "resource"} ${n.entitySnapshot?.name ?? n.id}`,
    searchHints: [n.entitySnapshot?.name].filter((x): x is string => Boolean(x)),
  }));
}

// ----------------------------------------------------------------------------
// Baseline + reporting
// ----------------------------------------------------------------------------

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
      { generated_at: new Date().toISOString(), project_ref: PROJECT_REF, findings: entries },
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
    try { writeFileSync(path, out, { flag: "a" }); } catch { /* ignore */ }
  }
}

async function main() {
  const update = process.argv.includes("--update-baseline");

  const [supabase, wiz] = await Promise.all([
    fetchSupabaseFindings(),
    fetchWizFindings(),
  ]);
  const findings = [...supabase, ...wiz];

  writeFileSync(
    REPORT_PATH,
    JSON.stringify({ fetched_at: new Date().toISOString(), sources: { supabase, wiz } }, null, 2),
  );

  if (update) {
    writeBaseline(findings.map(toBaselineEntry));
    summary([
      "## Security Gate — baseline updated",
      `- Project: \`${PROJECT_REF}\``,
      `- Sources: supabase=${supabase.length}, wiz=${wiz.length}`,
      `- Findings recorded: **${findings.length}**`,
    ]);
    return;
  }

  const baseline = loadBaseline();
  const baselineFps = new Set(baseline.map((b) => b.fingerprint));
  const currentFps = new Set(findings.map((c) => c.fingerprint));

  const added = findings.filter((c) => !baselineFps.has(c.fingerprint));
  const resolved = baseline.filter((b) => !currentFps.has(b.fingerprint));

  // Persisted for nightly-issue.ts to render Affected code areas.
  writeFileSync(ADDED_PATH, JSON.stringify({ added }, null, 2));

  const lines: string[] = [];
  lines.push("## Security Gate");
  lines.push(`- Project: \`${PROJECT_REF}\``);
  lines.push(`- Sources: supabase=${supabase.length}, wiz=${wiz.length}`);
  lines.push(`- Current findings: **${findings.length}**`);
  lines.push(`- Baseline findings: **${baseline.length}**`);
  lines.push(`- New (must fix or acknowledge): **${added.length}**`);
  lines.push(`- Resolved since baseline: **${resolved.length}**`);

  if (resolved.length) {
    lines.push("", "### Resolved findings (consider pruning baseline)");
    for (const r of resolved) {
      lines.push(`- [${r.source ?? "supabase"}] \`${r.name}\` ${r.level} — ${r.schema ?? ""}.${r.object ?? ""}`);
    }
  }

  if (added.length) {
    lines.push("", "### ❌ New security findings", "");
    lines.push("| Source | Level | Name | Object | Fingerprint |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const a of added) {
      lines.push(`| ${a.source} | ${a.level} | ${a.name} | ${a.schema ?? ""}.${a.object ?? ""} | \`${a.fingerprint}\` |`);
    }
    lines.push("", "To accept any of these intentionally, run `bun scripts/security-gate.ts --update-baseline` locally and commit `.security/baseline.json` in the same PR.");
    summary(lines);
    process.exit(1);
  }

  lines.push("", "✅ No new security findings.");
  summary(lines);
}

function toBaselineEntry(f: Finding): BaselineEntry {
  return {
    fingerprint: f.fingerprint,
    source: f.source,
    name: f.name,
    level: f.level,
    schema: f.schema,
    object: f.object,
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
