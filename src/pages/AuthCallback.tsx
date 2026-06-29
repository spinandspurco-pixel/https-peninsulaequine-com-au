import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles OAuth callback paths on the app origin (e.g. /auth/callback,
 * /auth/v1/callback). Supabase JS auto-detects the session from the URL
 * (PKCE ?code= or implicit #access_token=); we just wait for it, then
 * redirect to the intended destination.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const url = new URL(window.location.href);
    const errDesc =
      url.searchParams.get("error_description") ||
      url.searchParams.get("error");
    if (errDesc) {
      setError(errDesc);
      return;
    }

    const finish = (path: string) => {
      if (cancelled) return;
      // Clean tokens/code from URL before navigating.
      window.history.replaceState({}, "", path);
      navigate(path, { replace: true });
    };

    // If session already present, go straight in.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish("/hq");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish("/hq");
    });

    // Watchdog: if nothing arrives in 8s, bounce to /login.
    const t = window.setTimeout(() => {
      if (!cancelled) finish("/login");
    }, 8000);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.clearTimeout(t);
    };
  }, [navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-3">
        <p className="text-xs tracking-[0.45em] uppercase opacity-60">
          Peninsula Equine
        </p>
        <p className="text-sm opacity-70">
          {error ? `Sign-in error: ${error}` : "Completing sign-in…"}
        </p>
      </div>
    </main>
  );
}
