import type { AppRole } from "@/hooks/useAuth";

/**
 * Single source of truth for "where does this user belong?".
 * Used by Login (post sign-in) and ProtectedRoute (unauthorised redirect).
 *
 * Order is significant — the first role the user holds wins.
 * Admin always wins; preview is matched before user-only because a preview
 * account is a staff demo surface, not a public-site account.
 */
const ROLE_LANDING: Array<{ role: AppRole; path: string }> = [
  { role: "admin", path: "/hq" },
  { role: "moderator", path: "/hq" },
  { role: "employee", path: "/employee" },
  { role: "trainer", path: "/schedule" },
  { role: "preview", path: "/hq" },
];

/**
 * Resolve the destination after a successful sign-in or a failed
 * role check on a protected route.
 *
 * @param roles      Roles currently held by the user (may be empty).
 * @param redirectTo Optional `?redirect=` value from the login URL — wins
 *                   over the role default when it points at a path the
 *                   user can actually open. We don't validate the path
 *                   itself; ProtectedRoute will catch a wrong role and
 *                   re-route through this same helper.
 * @returns A pathname. Never returns `/` for a signed-in user.
 */
export function resolveLandingPath(
  roles: AppRole[],
  redirectTo?: string | null
): string {
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }
  for (const { role, path } of ROLE_LANDING) {
    if (roles.includes(role)) return path;
  }
  // Signed in but no recognised role — send to the staff portal, which will
  // render a polite "request access" state via Login. Never the homepage.
  return "/login";
}

/**
 * Lightweight, opt-in auth tracing. Enable in the browser console:
 *   localStorage.setItem("LOVABLE_AUTH_DEBUG", "1")
 * or append `?debug=auth` to any URL.
 */
export function authDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("LOVABLE_AUTH_DEBUG") === "1") return true;
    const sp = new URLSearchParams(window.location.search);
    return sp.get("debug") === "auth";
  } catch {
    return false;
  }
}

export function authLog(scope: string, payload: Record<string, unknown>): void {
  if (!authDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log(`[auth:${scope}]`, payload);
}
