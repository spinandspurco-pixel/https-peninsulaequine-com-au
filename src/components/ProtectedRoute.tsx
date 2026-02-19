import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users (default: /login) */
  loginPath?: string;
}

/**
 * Wraps any route that requires authentication.
 * - Shows a spinner while the auth state is resolving.
 * - Redirects unauthenticated users to /login?redirect=<current-path>.
 * - Renders children once the user is confirmed signed-in.
 */
export function ProtectedRoute({ children, loginPath = "/login" }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
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

  return <>{children}</>;
}
