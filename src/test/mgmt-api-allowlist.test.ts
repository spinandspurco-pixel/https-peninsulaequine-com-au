/**
 * Static allowlist test: any script or edge function that calls
 * `api.supabase.com` must only hit endpoints that are explicitly documented
 * and reviewed here. This prevents drift where a future edit quietly adds
 * a call to a broader Management API endpoint (functions:deploy, secrets,
 * auth, etc.) that would require expanding SB_MGMT_ACCESS_TOKEN scopes.
 *
 * If this test fails:
 *   - If the new call is legitimate → add its path template to ALLOWED_PATHS
 *     below AND update scripts/ci/verifyMgmtTokenScopes.ts so the CI scope
 *     probe reflects the newly required capability.
 *   - If the new call is unintended → remove it from the source.
 *
 * The token verifier itself (verifyMgmtTokenScopes.ts) is exempted because it
 * independently checks the same read-only endpoint and never runs in production
 * code paths.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = join(__dirname, "..", "..");
const SCAN_ROOTS = ["scripts", "supabase/functions", "src"];

// Endpoint templates the app is allowed to call. `{ref}` matches any
// project ref; any other path segment must match literally. Each path
// is paired with the exact HTTP methods it may be invoked with so a
// future edit cannot quietly upgrade a read to a write against the
// same URL (which would require broader token scopes).
const ALLOWED_ENDPOINTS: Readonly<Record<string, readonly string[]>> = {
  "/v1/projects/{ref}/advisors/security": ["GET"],
};
const ALLOWED_PATHS: readonly string[] = Object.keys(ALLOWED_ENDPOINTS);

// Files whose entire purpose is to enumerate Management API endpoints.
// They document surface area rather than call it in production flows.
const EXEMPT_FILES: readonly string[] = [
  "scripts/ci/verifyMgmtTokenScopes.ts",
  "scripts/ci/assertMgmtToken.ts", // only mentions the host in a JSDoc comment
  "src/test/mgmt-api-allowlist.test.ts", // this file
  "src/test/mgmt-api-guard.test.ts", // negative-test fixtures for the runtime guard
];

// Match `https://api.supabase.com<path>` where <path> is a template literal
// or string that may contain `${...}` interpolations. We deliberately
// include `?` and `#` in the capture so `normalise()` can strip them and
// prove that query and fragment variants collapse to the same template.
// Capture stops at the first backtick, quote, or whitespace.
const URL_RE = /https:\/\/api\.supabase\.com([^\s`"']*)/g;

// Known concrete project refs that appear as literal strings in code. Any
// literal ref must collapse to `{ref}` so a hard-coded URL cannot bypass
// the interpolation-based normalisation.
const KNOWN_PROJECT_REFS: readonly string[] = [
  "aizkqajrzkvwuobisnzr",
];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs|cjs)$/.test(name)) out.push(full);
  }
  return out;
}

function normalise(rawPath: string): string {
  let p = rawPath;
  // 1. Strip query string and fragment so equivalent endpoint URLs normalise identically.
  p = p.replace(/[?#].*$/, "");
  // 2. Collapse any `${...}` interpolation (with any whitespace / quoting
  //    inside the braces) to a single `{ref}` marker. This covers
  //    `${ref}`, `${projectRef}`, `${ PROJECT_REF }`, `${cfg.ref}`, etc.
  p = p.replace(/\$\{\s*[^}]+?\s*\}/g, "{ref}");
  // 3. Collapse known hard-coded project refs so a literal URL cannot
  //    slip past the template-only matcher.
  for (const ref of KNOWN_PROJECT_REFS) {
    // Only replace when the ref sits between `/projects/` and the next
    // `/` so unrelated occurrences of the string are left alone.
    p = p.replace(
      new RegExp(`(/projects/)${ref}(?=/|$)`, "g"),
      "$1{ref}",
    );
  }
  // 4. Collapse repeated slashes then strip a single trailing slash so
  //    `/lints/` and `/lints` are the same endpoint.
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

interface Hit {
  file: string;
  line: number;
  path: string;
  normalised: string;
  method: string;
}

// Look forward from the URL line for the first `method: "VERB"` in the
// same fetch/RequestInit literal. Bounded to 15 lines so we can't
// accidentally pick up an unrelated method: further down the file.
// If no explicit method is set, `fetch` defaults to GET.
const METHOD_RE = /method\s*:\s*["'`]([A-Z]+)["'`]/;
const METHOD_LOOKAHEAD = 15;

function detectMethod(lines: string[], startIdx: number): string {
  const end = Math.min(lines.length, startIdx + METHOD_LOOKAHEAD);
  for (let i = startIdx; i < end; i++) {
    const m = lines[i].match(METHOD_RE);
    if (m) return m[1].toUpperCase();
  }
  return "GET";
}

function collectHits(): Hit[] {
  const hits: Hit[] = [];
  for (const root of SCAN_ROOTS) {
    for (const file of walk(join(REPO_ROOT, root))) {
      const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
      if (EXEMPT_FILES.includes(rel)) continue;
      const src = readFileSync(file, "utf8");
      const lines = src.split("\n");
      lines.forEach((line, idx) => {
        for (const match of line.matchAll(URL_RE)) {
          const raw = match[1] ?? "";
          hits.push({
            file: rel,
            line: idx + 1,
            path: raw,
            normalised: normalise(raw),
            method: detectMethod(lines, idx),
          });
        }
      });
    }
  }
  return hits;
}

describe("Supabase Management API allowlist", () => {
  const hits = collectHits();

  it("finds at least one governed call (sanity check)", () => {
    // If this drops to 0 the scanner is broken or the code was deleted;
    // either way we want to know before shipping.
    expect(hits.length).toBeGreaterThan(0);
  });

  it("every api.supabase.com call targets an allowlisted path", () => {
    const violations = hits.filter((h) => !ALLOWED_PATHS.includes(h.normalised));
    expect(
      violations,
      violations.length === 0 ? "" : renderPathDiff(hits, violations),
    ).toEqual([]);
  });

  it("every call uses an HTTP method allowed for that endpoint", () => {
    const violations = hits
      .filter((h) => ALLOWED_PATHS.includes(h.normalised))
      .filter((h) => !ALLOWED_ENDPOINTS[h.normalised].includes(h.method));
    expect(
      violations,
      violations.length === 0 ? "" : renderMethodDiff(violations),
    ).toEqual([]);
  });
});

function groupByNormalised(hs: Hit[]): Map<string, Hit[]> {
  const g = new Map<string, Hit[]>();
  for (const h of hs) {
    const arr = g.get(h.normalised) ?? [];
    arr.push(h);
    g.set(h.normalised, arr);
  }
  return g;
}

function renderPathDiff(allHits: Hit[], violations: Hit[]): string {
  const discoveredNorms = new Set(allHits.map((h) => h.normalised));
  const grouped = groupByNormalised(violations);
  const unexpected = [...grouped.keys()].sort();
  const unusedAllowed = ALLOWED_PATHS.filter((p) => !discoveredNorms.has(p)).sort();

  const lines: string[] = [];
  lines.push("Un-allowlisted Management API call(s) detected.");
  lines.push("");
  lines.push("── Discovered vs ALLOWED_PATHS ──");
  for (const p of ALLOWED_PATHS) lines.push(`    ${p}`);
  for (const p of unexpected) lines.push(`  + ${p}   (not in ALLOWED_PATHS)`);
  for (const p of unusedAllowed) lines.push(`  - ${p}   (allowlisted but no call site found)`);
  lines.push("");
  lines.push("── Offending call sites ──");
  for (const [norm, hs] of grouped) {
    lines.push(`  ${norm}`);
    for (const h of hs) {
      const rawSuffix = h.path !== norm ? `   raw: ${h.path}` : "";
      lines.push(`    • ${h.file}:${h.line}  [${h.method}]${rawSuffix}`);
    }
  }
  lines.push("");
  lines.push(
    "Fix: if legitimate, add the normalised path (with allowed methods) to " +
      "ALLOWED_ENDPOINTS in src/test/mgmt-api-allowlist.test.ts AND update " +
      "scripts/ci/verifyMgmtTokenScopes.ts so the scope probe covers the new capability.",
  );
  return lines.join("\n");
}

function renderMethodDiff(violations: Hit[]): string {
  const grouped = groupByNormalised(violations);
  const lines: string[] = [];
  lines.push("Management API call uses a method not permitted for that endpoint.");
  lines.push("");
  lines.push("── Method drift ──");
  for (const [norm, hs] of grouped) {
    const allowed = ALLOWED_ENDPOINTS[norm].join(", ");
    const observed = [...new Set(hs.map((h) => h.method))].sort().join(", ");
    lines.push(`  ${norm}`);
    lines.push(`    allowed:  [${allowed}]`);
    lines.push(`    observed: [${observed}]`);
    for (const h of hs) {
      lines.push(`    • ${h.file}:${h.line}  [${h.method}]  ${h.path}`);
    }
  }
  lines.push("");
  lines.push(
    "Fix: broadening a read-only path to a write method requires a security " +
      "review and a token-scope update. If legitimate, extend ALLOWED_ENDPOINTS " +
      "and scripts/ci/verifyMgmtTokenScopes.ts.",
  );
  return lines.join("\n");
}

describe("URL normaliser", () => {
  const CANON = "/v1/projects/{ref}/advisors/security";
  const variants = [
    "/v1/projects/${ref}/advisors/security",
    "/v1/projects/${projectRef}/advisors/security",
    "/v1/projects/${ PROJECT_REF }/advisors/security",
    "/v1/projects/${cfg.projectRef}/advisors/security",
    "/v1/projects/aizkqajrzkvwuobisnzr/advisors/security",
    "/v1/projects/${ref}/advisors/security/",
    "/v1/projects/${ref}/advisors/security?include_definition=true",
    "/v1/projects/${ref}/advisors/security#section",
    "/v1/projects/${ref}/advisors/security/?foo=bar",
    "/v1/projects//${ref}//advisors//security",
  ];

  for (const v of variants) {
    it(`collapses ${v} → ${CANON}`, () => {
      expect(normalise(v)).toBe(CANON);
    });
  }

  it("does not touch unrelated occurrences of the known project ref", () => {
    // A hard-coded ref outside the /projects/<ref>/ slot must be left as-is
    // so we don't accidentally rewrite log lines or unrelated identifiers.
    expect(normalise("/v1/other/aizkqajrzkvwuobisnzr/details")).toBe(
      "/v1/other/aizkqajrzkvwuobisnzr/details",
    );
  });
});
