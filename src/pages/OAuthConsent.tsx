import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string; logo_uri?: string };
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};

// Beta namespace: type locally to avoid depending on generated SDK types.
type OAuthNs = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};

function oauth(): OAuthNs {
  return (supabase.auth as unknown as { oauth: OAuthNs }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setNeedsLogin(true);
        return;
      }
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const returnHref =
    typeof window !== "undefined" ? window.location.pathname + window.location.search : "";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/60">
            Peninsula Equine · Authorise Access
          </p>
          <h1 className="font-serif text-2xl text-foreground/90 font-light">
            Connect an application to your account
          </h1>
        </div>

        {error && (
          <div className="border border-destructive/40 px-5 py-4 text-[13px] text-destructive">
            {error}
          </div>
        )}

        {needsLogin && !error && (
          <div className="space-y-4 text-[13px] text-muted-foreground/80 leading-relaxed">
            <p>Please sign in first, then return to this page to complete the authorisation.</p>
            <a
              href={`/login?next=${encodeURIComponent(returnHref)}`}
              className="inline-block text-[11px] uppercase tracking-[0.22em] text-foreground/85 hover:text-accent transition-colors"
            >
              Sign in →
            </a>
          </div>
        )}

        {!error && !needsLogin && !details && (
          <p className="text-[13px] text-muted-foreground/60">Loading…</p>
        )}

        {details && (
          <div className="space-y-6">
            <p className="text-[13px] text-foreground/75 leading-relaxed">
              <span className="text-foreground">{details.client?.name ?? "An application"}</span> is
              requesting access to your Peninsula Equine account. It will be able to use the tools
              this site exposes as you.
            </p>
            {details.scopes && details.scopes.length > 0 && (
              <ul className="text-[12px] text-muted-foreground/70 space-y-1">
                {details.scopes.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-6 pt-2">
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="text-[11px] uppercase tracking-[0.22em] text-foreground/85 hover:text-accent transition-colors disabled:opacity-40"
              >
                Approve →
              </button>
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/55 hover:text-foreground/80 transition-colors disabled:opacity-40"
              >
                Deny
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
