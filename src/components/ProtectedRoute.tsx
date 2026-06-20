import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users (default: /login) */
  loginPath?: string;
  /** If set, only users holding at least one of these roles may view the route. */
  allowedRoles?: AppRole[];
  /** Where to redirect authenticated users that fail the role check (default: /). */
  forbiddenRedirect?: string;
}

/**
 * Wraps any route that requires authentication.
 * - Shows a spinner while the auth state is resolving (never renders children early).
 * - Redirects unauthenticated users to /login?redirect=<current-path>.
 * - If `allowedRoles` is provided, redirects authenticated-but-unauthorised users
 *   to `forbiddenRedirect` BEFORE rendering — children never mount, so no
 *   protected content leaks during a hydration race.
 */
export function ProtectedRoute({
  children,
  loginPath = "/login",
  allowedRoles,
  forbiddenRedirect = "/",
}: ProtectedRouteProps) {
  const { user, loading, roles } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginPath}?redirect=${redirect}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const ok = allowedRoles.some((r) => roles.includes(r));
    if (!ok) {
      return <Navigate to={forbiddenRedirect} replace />;
    }
  }

  return <>{children}</>;
}
