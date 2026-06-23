import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { authLog, resolveLandingPath } from "@/lib/authRouting";

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
  const { user, ready, roles, authLoading, rolesLoading } = useAuth();
  const location = useLocation();

  // TEMP: HQ login-hang investigation
  // eslint-disable-next-line no-console
  console.log("[auth:guard:render]", { path: location.pathname, ready, authLoading, rolesLoading, hasUser: !!user, roles, allowedRoles });

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
