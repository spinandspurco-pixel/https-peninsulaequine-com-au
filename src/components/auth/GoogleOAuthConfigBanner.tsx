import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import {
  probeGoogleOAuth,
  type GoogleOAuthProbeResult,
} from "@/lib/probeGoogleOAuth";

/**
 * Sign-in screen banner that probes Supabase auth for Google provider
 * configuration. Renders ONLY when the probe definitively classifies the
 * provider as misconfigured — "unknown" results stay silent so we never
 * scare users away from a working flow.
 */
export function GoogleOAuthConfigBanner() {
  const [result, setResult] = useState<GoogleOAuthProbeResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    probeGoogleOAuth(supabaseUrl, origin).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!result || result.status !== "misconfigured") return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="border border-amber-500/40 bg-amber-500/10 rounded-sm p-4 space-y-2"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="h-4 w-4 text-amber-500 mt-0.5 shrink-0"
          aria-hidden
        />
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-amber-500">
            Google sign-in is not fully configured
          </p>
          <p className="text-[12px] text-foreground/80 leading-relaxed">
            The auth service rejected a Google sign-in probe. Email sign-in
            still works, but Google will fail until the provider's Client ID
            and Secret are saved.
          </p>
          <p className="text-[11px] text-foreground/60 leading-relaxed">
            {result.detail}
          </p>
          <Link
            to="/hq/diagnostics"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-500 hover:text-amber-400 underline-offset-4 hover:underline mt-1"
          >
            Open diagnostics <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
