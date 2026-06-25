import { useEffect, useState } from "react";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { clearLocalAuthCacheAndSignOut } from "@/lib/authCache";

/**
 * /hq/whoami — diagnostic page to verify the current signed-in user's
 * user_roles mapping in Live. Requires auth but no specific role, so a
 * staff user who is missing roles can still load it and see why.
 */
export default function HqWhoAmI() {
  const { user, session, roles, rolesError, rolesLoading, authLoading, refetchRoles, signOut } = useAuth();
  const [dbRoles, setDbRoles] = useState<string[] | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [bootstrapResult, setBootstrapResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runDirectQuery = async () => {
    if (!user) return;
    setDbError(null);
    setDbRoles(null);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (error) {
      setDbError(`${error.code ?? ""} ${error.message}`.trim());
    } else {
      setDbRoles((data ?? []).map((r: { role: string }) => r.role));
    }
  };

  const runBootstrap = async () => {
    setBusy(true);
    setBootstrapResult(null);
    try {
      const { data, error } = await (supabase as any).rpc("bootstrap_user_role");
      if (error) {
        setBootstrapResult(`error: ${error.message}`);
      } else {
        setBootstrapResult(`ok: ${JSON.stringify(data)}`);
      }
      await runDirectQuery();
      refetchRoles();
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) void runDirectQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (authLoading) {
    return <div className="min-h-screen bg-background text-foreground p-8">Loading auth…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 space-y-4">
        <h1 className="text-2xl font-serif">Who am I</h1>
        <p className="opacity-70">Not signed in.</p>
        <a className="underline" href="/login">Go to /login</a>
      </div>
    );
  }

  const host = typeof window !== "undefined" ? window.location.host : "";

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-6 max-w-2xl">
      <HqBreadcrumbs current="Who Am I" />
      <div>
        <div className="text-[0.7rem] uppercase tracking-[0.45em] opacity-50">Diagnostic</div>
        <h1 className="text-3xl font-serif">Who am I</h1>
        <p className="text-sm opacity-60 mt-1">Host: {host}</p>
      </div>

      <section className="space-y-1 text-sm">
        <Row label="auth.uid" value={user.id} mono />
        <Row label="email" value={user.email ?? "(none)"} mono />
        <Row label="provider" value={user.app_metadata?.provider ?? "(none)"} />
        <Row label="session.expires_at" value={session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : "(none)"} />
      </section>

      <section className="space-y-2 border-t border-foreground/10 pt-4">
        <h2 className="text-xs uppercase tracking-[0.3em] opacity-60">Roles via useAuth()</h2>
        <div className="text-sm">
          {rolesLoading ? "loading…" : roles.length ? roles.join(", ") : <span className="opacity-60">(empty)</span>}
        </div>
        {rolesError && <div className="text-sm text-destructive">error: {rolesError}</div>}
      </section>

      <section className="space-y-2 border-t border-foreground/10 pt-4">
        <h2 className="text-xs uppercase tracking-[0.3em] opacity-60">Roles via direct query</h2>
        <div className="text-sm">
          {dbRoles === null && !dbError ? "loading…" : dbRoles?.length ? dbRoles.join(", ") : <span className="opacity-60">(empty)</span>}
        </div>
        {dbError && <div className="text-sm text-destructive">error: {dbError}</div>}
      </section>

      <section className="flex flex-wrap gap-4 border-t border-foreground/10 pt-4 text-sm">
        <button className="underline disabled:opacity-40" onClick={runDirectQuery} disabled={busy}>
          Re-query user_roles
        </button>
        <button className="underline disabled:opacity-40" onClick={runBootstrap} disabled={busy}>
          Run bootstrap_user_role()
        </button>
        <button className="underline disabled:opacity-40" onClick={refetchRoles} disabled={busy}>
          Refetch via useAuth
        </button>
        <button className="underline opacity-60" onClick={() => void signOut()}>
          Sign out
        </button>
        <button className="underline opacity-60" onClick={() => void clearLocalAuthCacheAndSignOut()}>
          Clear local auth cache + sign out
        </button>
      </section>

      {bootstrapResult && (
        <pre className="text-xs bg-foreground/5 p-3 whitespace-pre-wrap break-all">{bootstrapResult}</pre>
      )}

      <section className="border-t border-foreground/10 pt-4 text-xs opacity-60 space-y-1">
        <p>If "useAuth" and "direct query" disagree, the client cache is stale — refetch.</p>
        <p>If production still says "No staff access" after roles are fixed, use "Clear local auth cache + sign out", then sign in again.</p>
        <p>If both are empty but you are allowlisted, click "Run bootstrap_user_role()".</p>
        <p>If bootstrap returns [] but you should have a role, the allowlist row for your exact email is missing in Live.</p>
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="opacity-50 w-40 shrink-0">{label}</span>
      <span className={mono ? "font-mono break-all" : "break-all"}>{value}</span>
    </div>
  );
}
