/**
 * Pure classifier for the Supabase publishable key shipped to the browser.
 *
 * Mirrors the visual indicator rendered in:
 *   - src/pages/Login.tsx (LegacyKeyBanner)
 *   - src/components/diag/ClientDiagPanel.tsx (SUPABASE KEY row)
 *   - src/pages/HqDeployHealth.tsx (key format diff)
 *
 * Keeping this in one place lets us unit-test every status without rendering
 * the full UI.
 */

export type SupabaseKeyFamily =
  | "modern" // sb_publishable_*  → expected, OK
  | "legacy_jwt" // eyJ…             → rotated, sign-in disabled
  | "secret" // sb_secret_*      → server key leaked to client
  | "missing" // null / "" / undefined
  | "unknown"; // anything else

export type SupabaseKeySeverity = "ok" | "warn" | "error" | "danger";

export type SupabaseKeyIndicator = {
  family: SupabaseKeyFamily;
  severity: SupabaseKeySeverity;
  label: string; // short status chip text (e.g. "OK", "MISMATCH")
  title: string; // banner/heading copy
  message: string; // sentence shown to the user
  detectedPrefix: string; // first 16 chars or "(empty)"
  expectedPrefix: "sb_publishable_";
  length: number;
};

const EXPECTED: "sb_publishable_" = "sb_publishable_";

export function classifyClientSupabaseKey(
  rawKey: string | null | undefined,
): SupabaseKeyIndicator {
  const trimmed = typeof rawKey === "string" ? rawKey.trim() : "";
  const length = trimmed.length;

  if (length === 0) {
    return {
      family: "missing",
      severity: "error",
      label: "MISSING",
      title: "No Supabase publishable key configured",
      message:
        "No Supabase publishable key is configured in this build. Sign-in will fail.",
      detectedPrefix: "(empty)",
      expectedPrefix: EXPECTED,
      length: 0,
    };
  }

  if (trimmed.startsWith(EXPECTED)) {
    return {
      family: "modern",
      severity: "ok",
      label: "OK",
      title: "Supabase publishable key OK",
      message: "sb_publishable_ ✓ matches expected format.",
      detectedPrefix: EXPECTED,
      expectedPrefix: EXPECTED,
      length,
    };
  }

  if (trimmed.startsWith("sb_secret_")) {
    return {
      family: "secret",
      severity: "danger",
      label: "DANGER",
      title: "Secret key exposed in client",
      message:
        "sb_secret_* is a SERVER key. It must never ship to the client. Replace with sb_publishable_*.",
      detectedPrefix: "sb_secret_",
      expectedPrefix: EXPECTED,
      length,
    };
  }

  if (trimmed.startsWith("eyJ")) {
    return {
      family: "legacy_jwt",
      severity: "error",
      label: "MISMATCH",
      title: "Legacy Supabase key — sign-in disabled",
      message:
        "Legacy JWT (eyJ…) — Supabase disabled this key family. Sign-in will fail. Expected sb_publishable_*.",
      detectedPrefix: "eyJ",
      expectedPrefix: EXPECTED,
      length,
    };
  }

  return {
    family: "unknown",
    severity: "warn",
    label: "UNKNOWN",
    title: "Unrecognised Supabase key format",
    message: "Key prefix is not recognised. Expected sb_publishable_*.",
    detectedPrefix: trimmed.slice(0, 16),
    expectedPrefix: EXPECTED,
    length,
  };
}
