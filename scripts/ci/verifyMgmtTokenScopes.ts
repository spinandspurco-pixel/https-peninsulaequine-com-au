/**
 * Verifies SB_MGMT_ACCESS_TOKEN grants ONLY the least-privilege capabilities
 * our security-gate + edge functions need:
 *
 *   REQUIRED (must return 2xx):
 *     - GET /v1/projects                                       → projects:read
 *     - GET /v1/projects/{ref}/advisors/security-lints         → database:read
 *
 *   FORBIDDEN (must return 401/403 — token must NOT be able to write):
 *     - DELETE /v1/projects/{ref}/secrets?name=__scope_probe   → secrets:write
 *     - DELETE /v1/projects/{ref}/functions/__scope_probe__    → functions:write
 *     - POST   /v1/projects/{ref}/database/backups             → database:write
 *
 * Negative probes target intentionally non-existent resources so they are
 * safe even if the token were over-scoped: DELETE of a missing name is a
 * no-op, and POST backups without a body fails validation before any state
 * change. We distinguish "refused by scope" (401/403) from "allowed but
 * rejected on other grounds" (400/404/422) — the latter proves the scope
 * IS present and fails the gate.
 *
 * Supabase PATs currently do not expose an introspection endpoint, so
 * capability probing is the only reliable check. Exit 0 = safe, exit 1 =
 * missing required scope, exit 2 = over-scoped.
 */

import { assertMgmtToken, scrubError } from "./assertMgmtToken.ts";

const API = "https://api.supabase.com";
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "aizkqajrzkvwuobisnzr";

interface Probe {
  label: string;
  method: string;
  path: string;
  expect: "allowed" | "forbidden";
  body?: string;
}

const PROBES: Probe[] = [
  { label: "projects:read (GET /v1/projects)", method: "GET", path: "/v1/projects", expect: "allowed" },
  {
    label: "database:read (GET /v1/projects/{ref}/advisors/security-lints)",
    method: "GET",
    path: `/v1/projects/${PROJECT_REF}/advisors/security-lints`,
    expect: "allowed",
  },
  {
    label: "secrets:write (DELETE /v1/projects/{ref}/secrets)",
    method: "DELETE",
    path: `/v1/projects/${PROJECT_REF}/secrets`,
    body: JSON.stringify(["__scope_probe_nonexistent__"]),
    expect: "forbidden",
  },
  {
    label: "functions:write (DELETE /v1/projects/{ref}/functions/{slug})",
    method: "DELETE",
    path: `/v1/projects/${PROJECT_REF}/functions/__scope_probe_nonexistent__`,
    expect: "forbidden",
  },
  {
    label: "database:write (POST /v1/projects/{ref}/database/backups)",
    method: "POST",
    path: `/v1/projects/${PROJECT_REF}/database/backups`,
    body: "{}",
    expect: "forbidden",
  },
];

interface ProbeResult {
  label: string;
  expect: "allowed" | "forbidden";
  status: number;
  outcome: "ok" | "missing_scope" | "over_scope";
  detail: string;
}

async function runProbe(probe: Probe, token: string): Promise<ProbeResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (probe.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API}${probe.path}`, {
    method: probe.method,
    headers,
    body: probe.body,
  });
  const status = res.status;
  // Drain body so keep-alive can recycle the socket; we don't log it.
  await res.text().catch(() => "");

  if (probe.expect === "allowed") {
    if (status >= 200 && status < 300) {
      return { label: probe.label, expect: probe.expect, status, outcome: "ok", detail: "2xx as required" };
    }
    return {
      label: probe.label,
      expect: probe.expect,
      status,
      outcome: "missing_scope",
      detail: `expected 2xx, got ${status} — token is missing this read scope`,
    };
  }

  // expect: "forbidden"
  if (status === 401 || status === 403) {
    return { label: probe.label, expect: probe.expect, status, outcome: "ok", detail: `refused with ${status}` };
  }
  return {
    label: probe.label,
    expect: probe.expect,
    status,
    outcome: "over_scope",
    detail: `expected 401/403, got ${status} — token has this write capability`,
  };
}

async function main(): Promise<void> {
  const token = assertMgmtToken();
  console.log(`Probing Supabase Management API scopes for project ${PROJECT_REF}…\n`);

  const results: ProbeResult[] = [];
  for (const probe of PROBES) {
    try {
      results.push(await runProbe(probe, token));
    } catch (err) {
      const safe = scrubError(err);
      results.push({
        label: probe.label,
        expect: probe.expect,
        status: 0,
        outcome: "missing_scope",
        detail: `network error: ${safe.message}`,
      });
    }
  }

  const missing = results.filter((r) => r.outcome === "missing_scope");
  const over = results.filter((r) => r.outcome === "over_scope");

  for (const r of results) {
    const icon = r.outcome === "ok" ? "✓" : r.outcome === "missing_scope" ? "✗" : "⚠";
    console.log(`  ${icon} [${r.status || "err"}] ${r.label} — ${r.detail}`);
  }
  console.log("");

  // GitHub Actions job summary
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const { appendFileSync } = await import("node:fs");
    const lines: string[] = ["## Management token scope verification", "", "| Probe | Status | Expected | Result |", "|---|---|---|---|"];
    for (const r of results) {
      const icon = r.outcome === "ok" ? "✅" : r.outcome === "missing_scope" ? "❌ missing" : "⚠️ over-scoped";
      lines.push(`| \`${r.label}\` | ${r.status || "err"} | ${r.expect} | ${icon} |`);
    }
    appendFileSync(summaryPath, lines.join("\n") + "\n");
  }

  if (missing.length > 0) {
    console.error(`✗ Token is missing ${missing.length} required scope(s). Security gate cannot run.`);
    process.exit(1);
  }
  if (over.length > 0) {
    console.error(
      `✗ Token is over-scoped: ${over.length} write capability(ies) detected. ` +
        `Mint a new PAT with only projects:read + database:read and rotate SB_MGMT_ACCESS_TOKEN.`,
    );
    process.exit(2);
  }

  console.log("✓ Token has exactly the required read-only scopes. Proceeding.");
}

main().catch((err) => {
  const safe = scrubError(err);
  console.error(safe.stack ?? safe.message);
  process.exit(1);
});
