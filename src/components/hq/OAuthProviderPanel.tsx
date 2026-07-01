import { useEffect, useMemo, useState } from "react";
import {
  fetchOAuthProviderConfig,
  saveOAuthProviderConfig,
  type OAuthProviderConfig,
} from "@/lib/oauthProviderConfig";

/**
 * Google OAuth provider verification panel.
 *
 * Confirms two things support cares about after a Google client rotation:
 *  1. The intended Google **Client ID** is the one Supabase is actually
 *     handing to Google at sign-in time.
 *  2. The **expected callback URI** that must appear in Google Cloud →
 *     "Authorized redirect URIs" is visible and copyable.
 *
 * Because the Supabase auth service holds the configured Google client_id
 * server-side, the browser cannot read it via fetch (CORS + opaque redirect).
 * Instead we:
 *   - Open the Supabase authorize URL in a new tab. The browser follows the
 *     302 to `https://accounts.google.com/o/oauth2/v2/auth?client_id=…`.
 *   - The admin copies the full URL from the address bar and pastes it back.
 *   - We parse `client_id` out of the query string and compare it to the
 *     intended value (stored in localStorage so it persists across reloads).
 *
 * Read-only, admin-only. Stores nothing sensitive — the client_id is a
 * public identifier and the URL is pasted by the admin themselves.
 */

const INTENDED_KEY = "pe.oauth.intendedGoogleClientId";
const LAST_PASTED_KEY = "pe.oauth.lastGoogleAuthorizeUrl";

function statusColor(s: "ok" | "warn" | "fail" | "info"): string {
  switch (s) {
    case "ok": return "#10b981";
    case "warn": return "#f59e0b";
    case "fail": return "#ef4444";
    default: return "rgba(232,230,225,0.45)";
  }
}

function extractParam(input: string, name: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const v = u.searchParams.get(name);
    if (v) return v;
  } catch { /* fall through to regex */ }
  const m = trimmed.match(new RegExp(`[?&#]${name}=([^&\\s]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function extractClientId(input: string): string | null {
  return extractParam(input, "client_id");
}

export function extractRedirectUri(input: string): string | null {
  return extractParam(input, "redirect_uri");
}

export function compareRedirectUri(
  observed: string | null,
  expected: string | null,
): "ok" | "fail" | "info" {
  if (!observed || !expected) return "info";
  const norm = (u: string) => {
    try {
      const url = new URL(u);
      return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`.toLowerCase();
    } catch {
      return u.trim().replace(/\/+$/, "").toLowerCase();
    }
  };
  return norm(observed) === norm(expected) ? "ok" : "fail";
}

export function OAuthProviderPanel({
  url,
  expectedCallback,
  appOrigin,
}: {
  url: string | undefined;
  expectedCallback: string | null;
  appOrigin: string;
}) {
  const [intendedClientId, setIntendedClientId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try { return window.localStorage.getItem(INTENDED_KEY) ?? ""; } catch { return ""; }
  });
  const [pastedUrl, setPastedUrl] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try { return window.localStorage.getItem(LAST_PASTED_KEY) ?? ""; } catch { return ""; }
  });
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const [remote, setRemote] = useState<OAuthProviderConfig | null>(null);
  const [remoteExpected, setRemoteExpected] = useState<string>("");
  const [syncState, setSyncState] = useState<"idle" | "loading" | "loaded" | "unavailable">("idle");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    try { window.localStorage.setItem(INTENDED_KEY, intendedClientId); } catch { /* ignore */ }
  }, [intendedClientId]);
  useEffect(() => {
    try { window.localStorage.setItem(LAST_PASTED_KEY, pastedUrl); } catch { /* ignore */ }
  }, [pastedUrl]);

  // Load persisted config from Lovable Cloud once (admin-only via RLS).
  useEffect(() => {
    let cancelled = false;
    setSyncState("loading");
    fetchOAuthProviderConfig("google")
      .then((cfg) => {
        if (cancelled) return;
        setRemote(cfg);
        setSyncState("loaded");
        if (cfg?.intended_client_id) setIntendedClientId(cfg.intended_client_id);
        if (cfg?.expected_redirect_uri) setRemoteExpected(cfg.expected_redirect_uri);
      })
      .catch(() => {
        if (cancelled) return;
        // Non-admins (or unauth) get blocked by RLS — fall back silently.
        setSyncState("unavailable");
      });
    return () => { cancelled = true; };
  }, []);

  const effectiveExpectedCallback = remoteExpected.trim() || expectedCallback;

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await saveOAuthProviderConfig({
        intended_client_id: intendedClientId.trim() || null,
        expected_redirect_uri: remoteExpected.trim() || expectedCallback || null,
      });
      setRemote(saved);
      setSavedAt(Date.now());
      window.setTimeout(() => setSavedAt(null), 2000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };


  const authorizeUrl = useMemo(() => {
    if (!url) return null;
    const base = url.replace(/\/$/, "");
    return (
      `${base}/auth/v1/authorize?provider=google` +
      `&redirect_to=${encodeURIComponent(appOrigin || "")}`
    );
  }, [url, appOrigin]);

  const observedClientId = useMemo(() => extractClientId(pastedUrl), [pastedUrl]);
  const observedRedirectUri = useMemo(() => extractRedirectUri(pastedUrl), [pastedUrl]);
  const redirectStatus = useMemo(
    () => compareRedirectUri(observedRedirectUri, effectiveExpectedCallback),
    [observedRedirectUri, effectiveExpectedCallback],
  );

  const intendedNorm = intendedClientId.trim();
  const status: "ok" | "warn" | "fail" | "info" = !observedClientId
    ? "info"
    : !intendedNorm
      ? "warn"
      : observedClientId === intendedNorm
        ? "ok"
        : "fail";

  const statusLine =
    status === "ok"
      ? "MATCH — Supabase is handing your intended Client ID to Google."
      : status === "fail"
        ? "MISMATCH — Supabase is using a different Client ID than the one you intend."
        : status === "warn"
          ? "Observed Client ID captured. Enter the intended value above to compare."
          : "Idle — open the authorize URL and paste the resulting Google URL below.";

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedAt(Date.now());
      window.setTimeout(() => setCopiedAt(null), 1500);
    });
  };

  const looksLikeGoogleClientId = (v: string) =>
    /^\d{6,}-[a-z0-9]+\.apps\.googleusercontent\.com$/i.test(v.trim());

  return (
    <div className="mb-8 border border-foreground/10 rounded-sm">
      <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-55 flex items-center justify-between gap-4">
        <span>Google OAuth — Provider verification</span>
        <span
          className="text-[0.55rem] font-mono"
          style={{ color: statusColor(status), letterSpacing: "0.2em" }}
        >
          {status === "ok" ? "MATCH" : status === "fail" ? "MISMATCH" : status === "warn" ? "CAPTURED" : "IDLE"}
        </span>
      </div>
      <div className="px-4 py-3 text-[0.7rem] opacity-65 font-light leading-relaxed border-b border-foreground/10">
        Confirms Google is configured with the intended Client ID and surfaces the exact callback
        URI that must be allow-listed in Google Cloud. Nothing here is secret — the Client ID is a
        public identifier and the authorize URL is pasted by you.
      </div>

      {/* Expected callback URI — always visible, with copy */}
      <div className="px-4 py-3 border-b border-foreground/10">
        <div className="text-[0.55rem] tracking-[0.35em] uppercase opacity-55 mb-1.5">
          Expected callback URI (Google → Authorized redirect URIs)
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-[0.75rem] font-mono opacity-90 break-all">
            {expectedCallback ?? "(missing VITE_SUPABASE_URL)"}
          </code>
          {expectedCallback && (
            <button
              type="button"
              onClick={() => copy(expectedCallback)}
              className="text-[0.55rem] tracking-[0.3em] uppercase opacity-70 hover:opacity-100 border-b border-foreground/30 hover:border-foreground/60 pb-0.5 transition-opacity shrink-0"
            >
              {copiedAt ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="text-[0.6rem] opacity-45 mt-1.5 font-light">
          Paste this exact value into Google Cloud Console → APIs &amp; Services → Credentials →
          your OAuth 2.0 Client → Authorized redirect URIs.
        </div>
      </div>

      {/* Intended Client ID input */}
      <div className="px-4 py-3 border-b border-foreground/10">
        <label className="text-[0.55rem] tracking-[0.35em] uppercase opacity-55 block mb-2">
          Intended Google Client ID <span className="opacity-50 normal-case tracking-normal">(persisted locally)</span>
        </label>
        <input
          type="text"
          value={intendedClientId}
          onChange={(e) => setIntendedClientId(e.target.value)}
          placeholder="000000000000-xxxxxxxxxxxx.apps.googleusercontent.com"
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent border border-foreground/20 focus:border-foreground/50 outline-none px-2.5 py-1.5 text-[0.75rem] font-mono opacity-90 placeholder:opacity-25"
        />
        {intendedNorm && !looksLikeGoogleClientId(intendedNorm) && (
          <div className="text-[0.6rem] mt-1.5" style={{ color: statusColor("warn") }}>
            Doesn't look like a Google Client ID — expected format
            <code className="font-mono opacity-90"> ….apps.googleusercontent.com</code>.
          </div>
        )}
      </div>

      {/* Probe row */}
      <div className="px-4 py-3 border-b border-foreground/10">
        <div className="text-[0.55rem] tracking-[0.35em] uppercase opacity-55 mb-2">
          Probe the configured Client ID
        </div>
        <ol className="text-[0.7rem] opacity-75 font-light leading-relaxed space-y-1 list-decimal pl-4 mb-3">
          <li>
            <button
              type="button"
              onClick={() => authorizeUrl && window.open(authorizeUrl, "_blank", "noopener,noreferrer")}
              disabled={!authorizeUrl}
              className="underline underline-offset-2 hover:opacity-100 opacity-90 disabled:opacity-30"
            >
              Open Supabase authorize URL in a new tab →
            </button>
          </li>
          <li>
            Wait for the browser to land on <code className="font-mono opacity-90">accounts.google.com</code>.
          </li>
          <li>Copy the full URL from the address bar and paste it below.</li>
        </ol>
        <textarea
          value={pastedUrl}
          onChange={(e) => setPastedUrl(e.target.value)}
          placeholder="https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=…&redirect_uri=…"
          rows={3}
          spellCheck={false}
          className="w-full bg-transparent border border-foreground/20 focus:border-foreground/50 outline-none px-2.5 py-2 text-[0.7rem] font-mono opacity-90 placeholder:opacity-25 resize-y"
        />
        {pastedUrl && !observedClientId && (
          <div className="text-[0.6rem] mt-1.5" style={{ color: statusColor("warn") }}>
            No <code className="font-mono">client_id</code> parameter found in the pasted URL.
          </div>
        )}
      </div>

      {/* Comparison */}
      <div className="px-4 py-3">
        <div
          className="text-[0.7rem] font-light leading-relaxed mb-2"
          style={{ color: statusColor(status) }}
        >
          {statusLine}
        </div>
        <div className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-1.5 text-[0.7rem]">
          <div className="text-[0.55rem] tracking-[0.3em] uppercase opacity-55 pt-1">
            Intended
          </div>
          <code className="font-mono opacity-85 break-all">
            {intendedNorm || <span className="opacity-40">(not set)</span>}
          </code>
          <div className="text-[0.55rem] tracking-[0.3em] uppercase opacity-55 pt-1">
            Observed
          </div>
          <code className="font-mono opacity-85 break-all" style={{ color: status === "fail" ? statusColor("fail") : undefined }}>
            {observedClientId || <span className="opacity-40">(awaiting paste)</span>}
          </code>
        </div>

        {/* Redirect URI validation */}
        <div className="mt-4 pt-3 border-t border-foreground/10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[0.55rem] tracking-[0.35em] uppercase opacity-55">
              Redirect URI validation
            </div>
            <span
              className="text-[0.55rem] font-mono"
              style={{ color: statusColor(redirectStatus), letterSpacing: "0.2em" }}
            >
              {redirectStatus === "ok" ? "MATCH" : redirectStatus === "fail" ? "MISMATCH" : "IDLE"}
            </span>
          </div>
          <div
            className="text-[0.7rem] font-light leading-relaxed mb-2"
            style={{ color: statusColor(redirectStatus) }}
          >
            {redirectStatus === "ok"
              ? "MATCH — Google is redirecting to the expected Supabase callback."
              : redirectStatus === "fail"
                ? "MISMATCH — the redirect_uri Google received does not equal the expected Supabase callback. Update Google Cloud → Authorized redirect URIs, or Supabase Site/Callback URL."
                : "Idle — paste the Google authorize URL above to compare redirect_uri."}
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-1.5 text-[0.7rem]">
            <div className="text-[0.55rem] tracking-[0.3em] uppercase opacity-55 pt-1">
              Expected
            </div>
            <code className="font-mono opacity-85 break-all">
              {expectedCallback || <span className="opacity-40">(missing VITE_SUPABASE_URL)</span>}
            </code>
            <div className="text-[0.55rem] tracking-[0.3em] uppercase opacity-55 pt-1">
              Observed
            </div>
            <code
              className="font-mono opacity-85 break-all"
              style={{ color: redirectStatus === "fail" ? statusColor("fail") : undefined }}
            >
              {observedRedirectUri || <span className="opacity-40">(awaiting paste)</span>}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
