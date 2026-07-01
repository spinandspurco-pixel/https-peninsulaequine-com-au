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
 * The scope-prober itself (verifyMgmtTokenScopes.ts) is exempted because its
 * whole purpose is to probe over-scope endpoints — it never runs in prod
 * code paths.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = join(__dirname, "..", "..");
const SCAN_ROOTS = ["scripts", "supabase/functions", "src"];

// Endpoint templates the app is allowed to call. `{ref}` matches any
// project ref; any other path segment must match literally.
const ALLOWED_PATHS: readonly string[] = [
  "/v1/projects/{ref}/database/lints",
];

// Files whose entire purpose is to enumerate Management API endpoints.
// They document surface area rather than call it in production flows.
const EXEMPT_FILES: readonly string[] = [
  "scripts/ci/verifyMgmtTokenScopes.ts",
  "scripts/ci/assertMgmtToken.ts", // only mentions the host in a JSDoc comment
  "src/test/mgmt-api-allowlist.test.ts", // this file
];

// Match `https://api.supabase.com<path>` where <path> is a template literal
// or string that may contain `${...}` interpolations. We stop at the first
// backtick, quote, or whitespace so we capture just the URL body.
const URL_RE = /https:\/\/api\.supabase\.com([^\s`"'?#]*)/g;

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
  // Replace any `${...}` interpolation with `{ref}` so the path template
  // matches the allowlist regardless of which variable holds the project ref.
  return rawPath.replace(/\$\{[^}]+\}/g, "{ref}");
}

interface Hit {
  file: string;
  line: number;
  path: string;
  normalised: string;
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
    const rendered = violations.map((v) => `  ${v.file}:${v.line} → ${v.path}`).join("\n");
    expect(
      violations,
      violations.length === 0
        ? ""
        : `Un-allowlisted Management API call(s) detected. If legitimate, add ` +
            `the normalised path to ALLOWED_PATHS in src/test/mgmt-api-allowlist.test.ts ` +
            `AND update scripts/ci/verifyMgmtTokenScopes.ts so the scope probe covers ` +
            `the new capability.\n${rendered}`,
    ).toEqual([]);
  });
});
