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
