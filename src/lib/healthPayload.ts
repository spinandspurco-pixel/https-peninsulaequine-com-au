/**
 * Pure factories for the `/api/build-info` and `/api/health` response
 * payloads. Lives outside `vite.config.ts` so it can be exercised by unit
 * tests without booting Vite.
 *
 * The vite plugin (see `vite.config.ts` -> `buildInfoPlugin`) calls these
 * for both the dev middleware and the static assets emitted at build time.
 */

import type {
  BuildInfo,
  DiagResponse,
  DiagSupabaseKeyInfo,
  HealthResponse,
} from "../types/health";

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

/**
 * Classify a Supabase publishable key value into its non-secret format
 * identifier. The raw value never leaves this function — callers receive only
 * the family, length, and the public prefix token.
 */
export function classifySupabaseKey(rawKey: string | null | undefined): DiagSupabaseKeyInfo {
  if (!rawKey) {
    return {
      present: false,
      family: "missing",
      prefix: "—",
      length: 0,
      expectedPrefix: "sb_publishable_",
      isLegacyJwt: false,
      ok: false,
    };
  }
  const length = rawKey.length;
  if (rawKey.startsWith("sb_publishable_")) {
    return {
      present: true,
      family: "sb_publishable",
      prefix: "sb_publishable_",
      length,
      expectedPrefix: "sb_publishable_",
      isLegacyJwt: false,
      ok: true,
    };
  }
  if (rawKey.startsWith("sb_secret_")) {
    return {
      present: true,
      family: "sb_secret",
      prefix: "sb_secret_",
      length,
      expectedPrefix: "sb_publishable_",
      isLegacyJwt: false,
      ok: false,
    };
  }
  if (rawKey.startsWith("eyJ")) {
    return {
      present: true,
      family: "legacy_jwt",
      prefix: "eyJ…",
      length,
      expectedPrefix: "sb_publishable_",
      isLegacyJwt: true,
      ok: false,
    };
  }
  return {
    present: true,
    family: "unknown",
    prefix: "(unrecognised)",
    length,
    expectedPrefix: "sb_publishable_",
    isLegacyJwt: false,
    ok: false,
  };
}

export interface DiagInput extends BuildInfoInput {
  supabaseUrl: string | null | undefined;
  supabaseKey: string | null | undefined;
  checkedAt?: string;
  service?: string;
}

export function makeDiagPayload(input: DiagInput): DiagResponse {
  const urlPresent = !!input.supabaseUrl;
  const urlValid =
    !!input.supabaseUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(input.supabaseUrl);
  let urlHost: string | null = null;
  if (input.supabaseUrl) {
    try {
      urlHost = new URL(input.supabaseUrl).host;
    } catch {
      urlHost = null;
    }
  }
  return {
    service: input.service ?? "peninsula-os-web",
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    buildInfo: makeBuildInfoPayload(input),
    supabase: {
      urlPresent,
      urlValid,
      urlHost,
      key: classifySupabaseKey(input.supabaseKey),
    },
  };
}

/** Runtime guard for the /api/diag wire shape. */
export function isDiagResponse(value: unknown): value is DiagResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.service !== "string" || v.service.length === 0) return false;
  if (typeof v.checkedAt !== "string" || Number.isNaN(Date.parse(v.checkedAt))) return false;
  const bi = v.buildInfo as Record<string, unknown> | undefined;
  if (!bi || typeof bi !== "object") return false;
  if (typeof bi.buildTime !== "string") return false;
  if (typeof bi.buildCommit !== "string") return false;
  if (!(bi.bundleHash === null || typeof bi.bundleHash === "string")) return false;
  const sb = v.supabase as Record<string, unknown> | undefined;
  if (!sb || typeof sb !== "object") return false;
  if (typeof sb.urlPresent !== "boolean") return false;
  if (typeof sb.urlValid !== "boolean") return false;
  if (!(sb.urlHost === null || typeof sb.urlHost === "string")) return false;
  const k = sb.key as Record<string, unknown> | undefined;
  if (!k || typeof k !== "object") return false;
  if (typeof k.present !== "boolean") return false;
  if (typeof k.family !== "string") return false;
  if (typeof k.prefix !== "string") return false;
  if (typeof k.length !== "number") return false;
  if (typeof k.ok !== "boolean") return false;
  return true;
}

