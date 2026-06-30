/**
 * Shared response shapes for the static diagnostic endpoints emitted by
 * `buildInfoPlugin` in `vite.config.ts`:
 *
 *   GET /api/build-info  -> BuildInfo
 *   GET /api/health      -> HealthResponse
 *
 * Importing the same types in both the emitter (vite.config.ts) and the
 * consumer (ClientDiagPanel) prevents UI/response drift — if a field is
 * renamed or removed here, both ends fail to typecheck together.
 */

export interface BuildInfo {
  buildTime: string;
  buildCommit: string;
  bundleHash: string | null;
}

export type HealthStatus = "ok" | "degraded" | "error";

export interface HealthResponse {
  status: HealthStatus;
  service: string;
  uptime: string;
  checkedAt: string;
  buildInfo: BuildInfo;
}

/**
 * GET /api/diag — non-secret snapshot of what the deployed frontend bundle
 * was built with. Never includes raw secrets; key fields are limited to the
 * non-secret format identifier (prefix family + length).
 */
export interface DiagSupabaseKeyInfo {
  present: boolean;
  /** Format family: "sb_publishable" | "sb_secret" | "legacy_jwt" | "unknown" | "missing" */
  family: "sb_publishable" | "sb_secret" | "legacy_jwt" | "unknown" | "missing";
  /** Non-secret prefix token only (e.g. "sb_publishable_" or "eyJ…"). */
  prefix: string;
  /** Total length of the value baked into the bundle. */
  length: number;
  /** What the frontend expects to find. */
  expectedPrefix: "sb_publishable_";
  isLegacyJwt: boolean;
  /** True when family === "sb_publishable". */
  ok: boolean;
}

export interface DiagResponse {
  service: string;
  checkedAt: string;
  buildInfo: BuildInfo;
  supabase: {
    urlPresent: boolean;
    urlValid: boolean;
    /** Host portion only (e.g. "abc123.supabase.co"); never the project id alone. */
    urlHost: string | null;
    key: DiagSupabaseKeyInfo;
  };
}

