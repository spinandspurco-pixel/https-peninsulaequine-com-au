import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dir, "..");
const PROJECT = "mxjuknqwzbvvmmdrvkql";
const FIXTURE_TOKEN = "sbp_security_gate_fixture_only";
const ADVISORS = `https://${["api", "supabase", "com"].join(".")}/v1/projects/${PROJECT}/advisors/security`;
const LINT = {
  name: "rls_disabled_in_public", level: "ERROR", cache_key: "fixture_rls",
  metadata: { schema: "public", name: "fixture_table", type: "table" },
};

type Options = {
  token?: boolean;
  legacyToken?: boolean;
  wiz?: boolean;
  status?: number;
  body?: unknown;
  error?: string;
  invalidJson?: boolean;
  project?: string;
  baselineProject?: string;
  baselineFindings?: unknown[];
  update?: boolean;
  verifier?: boolean;
};

// Every child request is intercepted. No production credentials or network
// calls are used, including when exercising the verifier's previous probes.
function run(options: Options = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "pe-security-gate-"));
  try {
    mkdirSync(join(cwd, ".security"));
    const baselineText = JSON.stringify({
      generated_at: "2026-06-19T00:00:00.000Z",
      project_ref: options.baselineProject ?? PROJECT,
      findings: options.baselineFindings ?? [],
    });
    const baselinePath = join(cwd, ".security/baseline.json");
    writeFileSync(baselinePath, baselineText);
    const callsPath = join(cwd, "calls.jsonl");
    const preload = join(cwd, "fetch-fixture.ts");
    writeFileSync(preload, `
      import { appendFileSync } from "node:fs";
      const fixture = JSON.parse(process.env.SECURITY_GATE_FIXTURE!);
      globalThis.fetch = async (input, init = {}) => {
        const url = String(input);
        const method = init.method ?? "GET";
        appendFileSync(${JSON.stringify(callsPath)}, JSON.stringify({ url, method }) + "\\n");
        if (url === fixture.advisors && method === "GET") {
          if (fixture.error) throw new Error(fixture.error);
          return new Response(fixture.invalidJson ? "not JSON" : JSON.stringify(fixture.body), { status: fixture.status });
        }
        if (url === "https://wiz-fixture.invalid/oauth" && method === "POST") {
          return Response.json({ access_token: "wiz-fixture-access" });
        }
        if (url === "https://wiz-fixture.invalid/graphql" && method === "POST") {
          return Response.json({ data: { issues: { nodes: [{ id: "wiz-1", severity: "HIGH", status: "OPEN", control: { name: "fixture-wiz-control" } }] } } });
        }
        throw new Error("Unexpected fixture request: " + method + " " + url);
      };
    `);
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (/^(SB_MGMT_|SUPABASE_|WIZ_|GITHUB_STEP_SUMMARY$)/.test(key)) delete env[key];
    }
    Object.assign(env, {
      SUPABASE_PROJECT_REF: options.project ?? PROJECT,
      SECURITY_GATE_FIXTURE: JSON.stringify({
        advisors: ADVISORS, status: options.status ?? 200,
        body: options.body ?? { lints: [] }, error: options.error, invalidJson: options.invalidJson,
      }),
      GITHUB_STEP_SUMMARY: join(cwd, "summary.md"),
    });
    if (options.token !== false) env.SB_MGMT_ACCESS_TOKEN = FIXTURE_TOKEN;
    if (options.legacyToken) {
      delete env.SB_MGMT_ACCESS_TOKEN;
      env.SUPABASE_ACCESS_TOKEN = FIXTURE_TOKEN;
    }
    if (options.wiz) Object.assign(env, {
      WIZ_API_URL: "https://wiz-fixture.invalid/graphql",
      WIZ_AUTH_URL: "https://wiz-fixture.invalid/oauth",
      WIZ_CLIENT_ID: "fixture-id", WIZ_CLIENT_SECRET: "fixture-secret",
    });
    const script = options.verifier ? "scripts/ci/verifyMgmtTokenScopes.ts" : "scripts/security-gate.ts";
    const result = spawnSync(process.execPath, ["--preload", preload, join(ROOT, script), ...(options.update ? ["--update-baseline"] : [])], {
      cwd, env, encoding: "utf8", timeout: 10_000,
    });
    if (result.error) throw result.error;
    const readJson = (name: string) => existsSync(join(cwd, name)) ? JSON.parse(readFileSync(join(cwd, name), "utf8")) : undefined;
    return {
      code: result.status, output: result.stdout + result.stderr,
      report: readJson("security-report.json"), added: readJson("security-added.json"),
      baseline: readFileSync(baselinePath, "utf8"), originalBaseline: baselineText,
      calls: existsSync(callsPath) ? readFileSync(callsPath, "utf8").trim().split("\n").map(line => JSON.parse(line)) : [],
    };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

describe("required Supabase security scan", () => {
  test("missing Supabase credentials fail even when all sources are unavailable", () => {
    const r = run({ token: false });
    expect(r.code).toBe(2);
    expect(r.report.project_ref).toBe(PROJECT);
    expect(r.report.database_scan).toBe("unavailable");
    expect(r.report.sources.supabase.status).toBe("unavailable");
    expect(r.calls).toEqual([]);
    expect(r.output).not.toContain("✅");
  });

  test("Wiz cannot substitute for required database coverage", () => {
    const r = run({ token: false, wiz: true });
    expect(r.code).toBe(2);
    expect(r.report.database_scan).toBe("unavailable");
    expect(r.report.sources.wiz.status).toBe("ok");
    expect(r.added.added[0].source).toBe("wiz");
  });

  test("a completed empty advisor response passes without optional Wiz", () => {
    const r = run();
    expect(r.code).toBe(0);
    expect(r.report.database_scan).toBe("completed");
    expect(r.report.sources.wiz.status).toBe("unavailable");
    expect(r.calls).toEqual([{ url: ADVISORS, method: "GET" }]);
  });

  test("new database findings fail comparison after a completed scan", () => {
    const r = run({ body: { lints: [LINT] } });
    expect(r.code).toBe(1);
    expect(r.report.database_scan).toBe("completed");
    expect(r.added.added).toHaveLength(1);
    expect(r.added.added[0]).toMatchObject({ source: "supabase", name: LINT.name, schema: "public", object: "fixture_table" });
    expect(r.baseline).toBe(r.originalBaseline);
  });

  test("configured Wiz findings still participate in comparison", () => {
    const r = run({ wiz: true });
    expect(r.code).toBe(1);
    expect(r.report.sources.supabase.status).toBe("ok");
    expect(r.report.sources.wiz.status).toBe("ok");
    expect(r.added.added[0].source).toBe("wiz");
  });

  test("reviewed baseline findings retain the existing comparison contract", () => {
    const accepted = run({ body: { lints: [LINT] }, update: true });
    expect(accepted.code).toBe(0);
    const baselineFindings = JSON.parse(accepted.baseline).findings;
    const unchanged = run({ body: { lints: [LINT] }, baselineFindings });
    expect(unchanged.code).toBe(0);
    expect(unchanged.added.added).toEqual([]);
    const changed = run({ body: { lints: [LINT, { ...LINT, cache_key: "another-object", metadata: { schema: "public", name: "another-table" } }] }, baselineFindings });
    expect(changed.code).toBe(1);
    expect(changed.added.added).toHaveLength(1);
    expect(changed.added.added[0].object).toBe("another-table");
  });

  for (const status of [401, 403, 429, 500]) {
    test(`HTTP ${status} is unavailable coverage and preserves a report`, () => {
      const r = run({ status });
      expect(r.code).toBe(2);
      expect(r.report.database_scan).toBe("unavailable");
      expect(r.report.sources.supabase.reason).toContain(String(status));
      expect(r.baseline).toBe(r.originalBaseline);
    });
  }

  test("network failure is reported safely without leaking the credential", () => {
    const r = run({ error: `fetch failed with Bearer ${FIXTURE_TOKEN}` });
    expect(r.code).toBe(2);
    expect(r.report.database_scan).toBe("unavailable");
    expect(r.output + JSON.stringify(r.report)).not.toContain(FIXTURE_TOKEN);
  });

  test("invalid JSON is unavailable coverage", () => {
    const r = run({ invalidJson: true });
    expect(r.code).toBe(2);
    expect(r.report.database_scan).toBe("unavailable");
  });

  test("a request timeout is unavailable coverage", () => {
    const r = run({ error: "The operation timed out" });
    expect(r.code).toBe(2);
    expect(r.report.database_scan).toBe("unavailable");
  });

  for (const body of [{}, { lints: null }, { lints: [{}] }, []]) {
    test(`invalid advisor payload ${JSON.stringify(body)} cannot pass`, () => {
      const r = run({ body });
      expect(r.code).toBe(2);
      expect(r.report.database_scan).toBe("unavailable");
    });
  }

  test("a mismatched baseline project aborts before any request", () => {
    const r = run({ baselineProject: "aizkqajrzkvwuobisnzr" });
    expect(r.code).toBe(2);
    expect(r.output).toContain("baseline project");
    expect(r.calls).toEqual([]);
    expect(r.baseline).toBe(r.originalBaseline);
  });

  test("baseline updates require completed database coverage", () => {
    const r = run({ token: false, wiz: true, update: true });
    expect(r.code).toBe(2);
    expect(r.baseline).toBe(r.originalBaseline);
  });

  test("unavailable Wiz findings are not reported as resolved", () => {
    const r = run({ baselineFindings: [{ source: "wiz", fingerprint: "fixture-accepted", name: "old-wiz", level: "high" }] });
    expect(r.code).toBe(0);
    expect(r.output).toContain("Resolved since baseline: **0**");
    expect(r.baseline).toBe(r.originalBaseline);
  });

  test("the documented legacy token fallback remains usable", () => {
    const r = run({ legacyToken: true });
    expect(r.code).toBe(0);
    expect(r.report.database_scan).toBe("completed");
  });
});

describe("read-only advisor credential verification", () => {
  test("verification issues only the exact advisor GET and avoids scope claims", () => {
    const r = run({ verifier: true });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual([{ url: ADVISORS, method: "GET" }]);
    expect(r.output).not.toContain("exactly the required read-only scopes");
  });

  test("missing credentials stop without issuing requests", () => {
    const r = run({ verifier: true, token: false });
    expect(r.code).not.toBe(0);
    expect(r.calls).toEqual([]);
  });

  test("denied advisor access stops without trying write operations", () => {
    const r = run({ verifier: true, status: 403 });
    expect(r.code).not.toBe(0);
    expect(r.calls).toEqual([{ url: ADVISORS, method: "GET" }]);
  });
});
