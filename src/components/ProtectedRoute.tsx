import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { authLog, resolveLandingPath } from "@/lib/authRouting";
import { SignOutConfirm } from "@/components/auth/SignOutConfirm";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users (default: /login) */
  loginPath?: string;
  /** If set, only users holding at least one of these roles may view the route. */
  allowedRoles?: AppRole[];
  /**
   * Where to redirect authenticated-but-unauthorised users.
   * Default: each user's own role landing path (never the homepage).
   * Pass an explicit string to override (e.g. "/portal").
   */
  forbiddenRedirect?: string;
}

/**
 * Auth + role gate for protected routes.
 *
 * Routing rules:
 *  1. Never decide while `ready` is false — show a spinner.
 *  2. Unauthenticated → /login?redirect=<current path>.
 *  3. Authenticated but wrong role → user's own role landing path.
 *     (Falls back to /login if the user has no recognised role.)
 *  4. Authenticated and allowed → render children.
 *
 * The component never returns the homepage as a redirect target — that was
 * the source of the "logged in but bounced to /" bug.
 */
export function ProtectedRoute({
  children,
  loginPath = "/login",
  allowedRoles,
  forbiddenRedirect,
}: ProtectedRouteProps) {
  const { user, ready, roles, authLoading, rolesLoading, rolesError, refetchRoles, signOut } = useAuth();
  const location = useLocation();

  if (!ready) {
    authLog("guard:wait", { path: location.pathname, authLoading, rolesLoading });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    authLog("guard:no-user", { redirectTo: location.pathname });
    return <Navigate to={`${loginPath}?redirect=${redirect}`} replace />;
  }

  // Authenticated but role lookup failed — never infinite-spin; show actionable error.
  if (rolesError) {
    authLog("guard:roles-error", { path: location.pathname, rolesError });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full space-y-5 text-center">
          <h1 className="font-serif text-2xl text-foreground">Profile didn't load</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn't read your access role. This is usually a transient connection issue.
          </p>
          <p className="text-xs font-mono text-muted-foreground/70 break-words">{rolesError}</p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => refetchRoles()}
              className="text-xs font-mono uppercase tracking-[0.25em] text-foreground hover:text-accent transition-colors"
            >
              Retry
            </button>
            <span className="text-muted-foreground/40">·</span>
            <SignOutConfirm onConfirm={async () => { await signOut(); window.location.href = "/login"; }}>
              <button
                type="button"
                className="text-xs font-mono uppercase tracking-[0.25em] text-foreground hover:text-accent transition-colors"
              >
                Sign out
              </button>
            </SignOutConfirm>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const ok = allowedRoles.some((r) => roles.includes(r));
    if (!ok) {
      const fallback = forbiddenRedirect ?? resolveLandingPath(roles);
      authLog("guard:forbidden", {
        path: location.pathname,
        roles,
        allowed: allowedRoles,
        redirectTo: fallback,
      });
      // Avoid a redirect loop if the user's own landing path is also the
      // route they just failed — send them to /login instead.
      if (fallback === location.pathname) {
        return <Navigate to="/login" replace />;
      }
      return <Navigate to={fallback} replace />;
    }
  }

  authLog("guard:allow", { path: location.pathname, roles });
  return <>{children}</>;
}
