/**
 * Diagnostics expectations
 * ────────────────────────
 * Single source of truth for the values the /hq/diagnostics panel checks
 * the running bundle against.
 *
 * Override at build time without code changes by setting either of these
 * Vite env vars in your hosting environment (e.g. Vercel → Settings →
 * Environment Variables):
 *
 *   VITE_DIAGNOSTICS_EXPECTED_PROJECT_ID="aizkqajrzkvwuobisnzr"
 *   VITE_DIAGNOSTICS_EXPECTED_URL="https://aizkqajrzkvwuobisnzr.supabase.co"
 *
 * If unset, the defaults below are used.
 */

const DEFAULT_PROJECT_ID = "aizkqajrzkvwuobisnzr";

const envProjectId = import.meta.env.VITE_DIAGNOSTICS_EXPECTED_PROJECT_ID as
  | string
  | undefined;
const envUrl = import.meta.env.VITE_DIAGNOSTICS_EXPECTED_URL as string | undefined;

export type ExpectedSource = "default" | "env_override";

export const EXPECTED_PROJECT_ID: string =
  envProjectId?.trim() || DEFAULT_PROJECT_ID;

export const EXPECTED_PROJECT_ID_SOURCE: ExpectedSource = envProjectId?.trim()
  ? "env_override"
  : "default";

export const EXPECTED_URL: string =
  envUrl?.trim() || `https://${EXPECTED_PROJECT_ID}.supabase.co`;

export const EXPECTED_URL_SOURCE: ExpectedSource = envUrl?.trim()
  ? "env_override"
  : "default";

/** Required prefix for the modern Supabase publishable key format. */
export const SB_PUBLISHABLE_PREFIX = "sb_publishable_";

/** Deprecated JWT-shaped anon key prefix — flagged as FAIL if encountered. */
export const LEGACY_JWT_PREFIX = "eyJ";
