/**
 * Google OAuth sign-in helper with automatic retry-on-transient.
 *
 * Wraps `lovable.auth.signInWithOAuth("google", …)` so both the primary
 * "Sign in with Google" button and the in-banner "Retry" action share one
 * code path. Network blips and Supabase 5xx responses get one quiet
 * automatic retry with linear backoff; deterministic failures (missing
 * OAuth secret, redirect_uri mismatch, popup blocked, user cancelled)
 * fail fast so the UI can surface an actionable error immediately.
 */

import { lovable } from "@/integrations/lovable";

export type OAuthAttemptResult =
  | { kind: "ok"; via: "popup" | "redirect"; attempts: number }
  | { kind: "error"; message: string; attempts: number; transient: boolean };

const TRANSIENT_PATTERNS: readonly RegExp[] = [
  /network/i,
  /failed to fetch/i,
  /load failed/i,
  /timeout/i,
  /timed out/i,
  /temporar/i,
  /try again/i,
  /\b50[234]\b/, // 502 / 503 / 504
  /service unavailable/i,
  /upstream/i,
];

const DETERMINISTIC_PATTERNS: readonly RegExp[] = [
  /popup/i,
  /blocked/i,
  /cancel(l)?ed/i,
  /access_denied/i,
  /user denied/i,
  /redirect_uri/i,
  /oauth secret/i,
  /provider .* (not enabled|disabled)/i,
  /missing oauth/i,
  /client_secret/i,
  /client secret/i,
  /invalid client/i,
];

export function isTransientOAuthError(message: string): boolean {
  if (!message) return false;
  if (DETERMINISTIC_PATTERNS.some((r) => r.test(message))) return false;
  return TRANSIENT_PATTERNS.some((r) => r.test(message));
}

export async function attemptGoogleSignIn(opts: {
  redirectUri: string;
  maxAttempts?: number;
  /** Linear backoff base in ms (default 400). */
  backoffMs?: number;
  onAttempt?: (attempt: number) => void;
}): Promise<OAuthAttemptResult> {
  const max = Math.max(1, opts.maxAttempts ?? 2);
  const backoff = Math.max(0, opts.backoffMs ?? 400);
  let lastMsg = "";

  for (let attempt = 1; attempt <= max; attempt++) {
    opts.onAttempt?.(attempt);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: opts.redirectUri,
      });
      if (result.redirected) return { kind: "ok", via: "redirect", attempts: attempt };
      if (!result.error) return { kind: "ok", via: "popup", attempts: attempt };
      lastMsg = result.error.message || "Unknown error";
    } catch (err) {
      lastMsg = err instanceof Error ? err.message : String(err);
    }

    const transient = isTransientOAuthError(lastMsg);
    if (!transient) {
      return { kind: "error", message: lastMsg, attempts: attempt, transient: false };
    }
    if (attempt < max) {
      await new Promise((r) => setTimeout(r, backoff * attempt));
    }
  }

  return { kind: "error", message: lastMsg, attempts: max, transient: true };
}
