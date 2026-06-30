/**
 * Lightweight, client-side probe to detect whether the Google OAuth provider
 * is fully configured on the Supabase auth service.
 *
 * Strategy: hit `${SUPABASE_URL}/auth/v1/authorize?provider=google` with
 * `redirect: "manual"`. Supabase returns:
 *   - 302 → Google              ⇒ response.type === "opaqueredirect"  (OK)
 *   - 400 "missing OAuth secret" or "provider … not enabled"            (FAIL)
 *
 * We deliberately classify ambiguous network failures as `unknown` and
 * never show the warning banner in that case — false positives would
 * scare users away from a working sign-in flow.
 */

export type GoogleOAuthProbeStatus = "ok" | "misconfigured" | "unknown";

export type GoogleOAuthProbeResult = {
  status: GoogleOAuthProbeStatus;
  detail: string;
};

const MISCONFIG_PATTERNS: readonly RegExp[] = [
  /missing\s+oauth\s+secret/i,
  /provider\s+(is\s+)?not\s+enabled/i,
  /provider\s+disabled/i,
  /invalid\s+client/i,
  /unsupported\s+provider/i,
];

function classifyBody(body: string): GoogleOAuthProbeStatus {
  if (MISCONFIG_PATTERNS.some((r) => r.test(body))) return "misconfigured";
  return "unknown";
}

export async function probeGoogleOAuth(
  supabaseUrl: string | undefined,
  appOrigin: string,
): Promise<GoogleOAuthProbeResult> {
  if (!supabaseUrl) {
    return {
      status: "unknown",
      detail: "Missing VITE_SUPABASE_URL — cannot probe the auth service.",
    };
  }
  const target =
    `${supabaseUrl.replace(/\/$/, "")}/auth/v1/authorize?provider=google` +
    `&redirect_to=${encodeURIComponent(appOrigin)}`;

  try {
    const res = await fetch(target, {
      method: "GET",
      mode: "no-cors",
      redirect: "manual",
      cache: "no-store",
    });
    if (res.type === "opaqueredirect") {
      return { status: "ok", detail: "Supabase redirected to Google — provider is configured." };
    }
    // Fall back to a normal fetch to read the body for the canonical error.
    const probe = await fetch(target, { method: "GET", cache: "no-store" }).catch(() => null);
    if (probe && probe.ok === false) {
      const body = await probe.text().catch(() => "");
      const classified = classifyBody(body);
      if (classified === "misconfigured") {
        return {
          status: "misconfigured",
          detail: "Supabase rejected the Google sign-in request (missing Client Secret or provider disabled).",
        };
      }
      return {
        status: "unknown",
        detail: `Auth service returned HTTP ${probe.status}; inconclusive.`,
      };
    }
    return {
      status: "unknown",
      detail: `Inconclusive — response type "${res.type}".`,
    };
  } catch (err) {
    return {
      status: "unknown",
      detail: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
