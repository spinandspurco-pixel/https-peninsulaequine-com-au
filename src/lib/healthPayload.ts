/**
 * Pure factories for the `/api/build-info` and `/api/health` response
 * payloads. Lives outside `vite.config.ts` so it can be exercised by unit
 * tests without booting Vite.
 *
 * The vite plugin (see `vite.config.ts` -> `buildInfoPlugin`) calls these
 * for both the dev middleware and the static assets emitted at build time.
 */

import type { BuildInfo, HealthResponse } from "../types/health";

export interface BuildInfoInput {
  buildTime: string;
  buildCommit: string;
  bundleHash: string | null;
}

export function makeBuildInfoPayload(input: BuildInfoInput): BuildInfo {
  return {
    buildTime: input.buildTime,
    buildCommit: input.buildCommit,
    bundleHash: input.bundleHash,
  };
}

export interface HealthInput extends BuildInfoInput {
  checkedAt?: string;
  service?: string;
}

export function makeHealthPayload(input: HealthInput): HealthResponse {
  return {
    status: "ok",
    service: input.service ?? "peninsula-os-web",
    uptime: "static",
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    buildInfo: makeBuildInfoPayload(input),
  };
}

/** Runtime guard — keeps the wire shape honest in tests and at runtime. */
export function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.status !== "ok" && v.status !== "degraded" && v.status !== "error") return false;
  if (typeof v.service !== "string" || v.service.length === 0) return false;
  if (typeof v.uptime !== "string") return false;
  if (typeof v.checkedAt !== "string" || Number.isNaN(Date.parse(v.checkedAt))) return false;
  const bi = v.buildInfo as Record<string, unknown> | undefined;
  if (!bi || typeof bi !== "object") return false;
  if (typeof bi.buildTime !== "string") return false;
  if (typeof bi.buildCommit !== "string") return false;
  if (!(bi.bundleHash === null || typeof bi.bundleHash === "string")) return false;
  return true;
}
