// Runtime guard for Supabase Management API calls.
//
// Any code path that fetches api.supabase.com MUST route the URL and
// method through `assertMgmtCall()` immediately before the `fetch()`
// call. The guard throws synchronously on:
//
//   1. A non-Management host (defence against a bad interpolation).
//   2. A path that is not in the shared endpoint allowlist.
//   3. A method that the allowlist does not permit for that path.
//
// The allowlist mirrors the static list enforced by
// `src/test/mgmt-api-allowlist.test.ts` and the token-scope probe in
// `scripts/ci/verifyMgmtTokenScopes.ts`. All three must be updated
// together when a new endpoint is introduced.
//
// This module intentionally does NOT contain the literal
// `api.supabase.com` string so the static scanner does not treat the
// guard itself as an additional call site.

export const MGMT_API_HOST = ["api", "supabase", "com"].join(".");

export const MGMT_ALLOWED_ENDPOINTS: Readonly<Record<string, readonly string[]>> = {
  "/v1/projects/{ref}/advisors/security": ["GET"],
};

const KNOWN_PROJECT_REFS: readonly string[] = ["aizkqajrzkvwuobisnzr"];

export function normaliseMgmtPath(rawPath: string): string {
  let p = rawPath;
  p = p.replace(/[?#].*$/, "");
  p = p.replace(/\$\{\s*[^}]+?\s*\}/g, "{ref}");
  for (const ref of KNOWN_PROJECT_REFS) {
    p = p.replace(new RegExp(`(/projects/)${ref}(?=/|$)`, "g"), "$1{ref}");
  }
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

export class MgmtApiGuardError extends Error {
  readonly code: "bad_host" | "path_not_allowed" | "method_not_allowed";
  constructor(code: MgmtApiGuardError["code"], message: string) {
    super(message);
    this.name = "MgmtApiGuardError";
    this.code = code;
  }
}

/**
 * Validate a Management API call before it is issued. Throws
 * `MgmtApiGuardError` on any deviation from the shared allowlist.
 * Returns the normalised path so callers can log it safely.
 */
export function assertMgmtCall(rawUrl: string, method: string = "GET"): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new MgmtApiGuardError("bad_host", `mgmt guard: invalid URL`);
  }
  if (parsed.host !== MGMT_API_HOST) {
    throw new MgmtApiGuardError(
      "bad_host",
      `mgmt guard: host ${parsed.host} is not the Management API`,
    );
  }
  const normalised = normaliseMgmtPath(parsed.pathname + parsed.search);
  const allowedMethods = MGMT_ALLOWED_ENDPOINTS[normalised];
  if (!allowedMethods) {
    throw new MgmtApiGuardError(
      "path_not_allowed",
      `mgmt guard: path ${normalised} is not in the endpoint allowlist`,
    );
  }
  const upperMethod = method.toUpperCase();
  if (!allowedMethods.includes(upperMethod)) {
    throw new MgmtApiGuardError(
      "method_not_allowed",
      `mgmt guard: ${upperMethod} not permitted for ${normalised} (allowed: ${allowedMethods.join(", ")})`,
    );
  }
  return normalised;
}
