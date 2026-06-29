// Lightweight auth funnel tracker.
//
// Records the staff sign-in journey as discrete steps:
//   1. auth_login_attempt    — user submitted credentials or clicked Google
//   2. auth_login_success    — signIn returned without error
//   3. auth_session_created  — onAuthStateChange fired SIGNED_IN with a session
//   4. auth_hq_reached       — /hq (Command Centre) actually mounted
//
// Each step also fires a generic GA4 event via trackEvent() so the funnel is
// inspectable in any analytics surface that listens to gtag/dataLayer. Steps
// are deduped per browser session so a re-render or a back/forward navigation
// doesn't double-count.
//
// This is a placeholder hook: swap trackEvent() for Segment/PostHog/etc. by
// editing emit() — no callers need to change.

import { trackEvent } from "@/lib/analytics";
import { authLog } from "@/lib/authRouting";

export type AuthFunnelStep =
  | "auth_login_attempt"
  | "auth_login_success"
  | "auth_session_created"
  | "auth_hq_reached";

export type AuthFunnelMethod = "password" | "google" | "session-restore";

type Payload = {
  method?: AuthFunnelMethod;
  userId?: string;
  roles?: string[];
  via?: string;
  [key: string]: unknown;
};

const SESSION_KEY = "pe_auth_funnel_seen";

function loadSeen(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function saveSeen(seen: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(seen));
  } catch {
    /* ignore */
  }
}

function emit(step: AuthFunnelStep, payload: Payload) {
  authLog(`funnel:${step}`, payload);
  trackEvent(step, {
    ...payload,
    ts: Date.now(),
  });
}

/**
 * Track an auth funnel step. Deduped per session+method so the same step
 * isn't double-counted on re-renders. Pass `{ force: true }` to bypass.
 */
export function trackAuthFunnel(
  step: AuthFunnelStep,
  payload: Payload & { force?: boolean } = {},
) {
  const { force, ...rest } = payload;
  const key = `${step}:${rest.method ?? "_"}`;
  const seen = loadSeen();
  if (!force && seen[key]) return;
  seen[key] = Date.now();
  saveSeen(seen);
  emit(step, rest);
}

/** Reset the per-session dedupe cache. Call on sign-out. */
export function resetAuthFunnel() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
