import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import {
  EXPECTED_PROJECT_ID,
  EXPECTED_PROJECT_ID_SOURCE,
  EXPECTED_URL,
  EXPECTED_URL_SOURCE,
  SB_PUBLISHABLE_PREFIX as SB_PREFIX,
  LEGACY_JWT_PREFIX as LEGACY_PREFIX,
} from "@/config/diagnostics";
import {
  listOAuthErrors,
  clearOAuthErrors,
  recordOAuthError,
  diagnoseOAuthError,
  type OAuthErrorEntry,
} from "@/lib/oauthErrorLog";



type CheckStatus = "ok" | "warn" | "fail" | "info";

type Check = {
  label: string;
  status: CheckStatus;
  detail: string;
};

function maskKey(key: string | undefined): string {
  if (!key) return "(missing)";
  if (key.length <= 16) return key;
  return `${key.slice(0, 12)}…${key.slice(-4)}`;
}

function statusColor(s: CheckStatus): string {
  switch (s) {
    case "ok":
      return "#10b981";
    case "warn":
      return "#f59e0b";
    case "fail":
      return "#ef4444";
    default:
      return "rgba(232,230,225,0.45)";
  }
}

function statusLabel(s: CheckStatus): string {
  return s === "ok" ? "PASS" : s === "warn" ? "WARN" : s === "fail" ? "FAIL" : "INFO";
}

export default function HqDiagnostics() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const mode = import.meta.env.MODE;

  const [pingStatus, setPingStatus] = useState<CheckStatus>("info");
  const [pingDetail, setPingDetail] = useState<string>("Checking…");
  const [googleStatus, setGoogleStatus] = useState<CheckStatus>("info");
  const [googleDetail, setGoogleDetail] = useState<string>("Checking Google OAuth provider…");
  const [redirectStatus, setRedirectStatus] = useState<CheckStatus>("info");
  const [redirectDetail, setRedirectDetail] = useState<string>("Idle — run validator to compare with Google.");
  const [e2eStatus, setE2eStatus] = useState<CheckStatus>("info");
  const [e2eDetail, setE2eDetail] = useState<string>("Idle — click to perform the full Google sign-in flow and confirm /hq.");
  const [e2eRunning, setE2eRunning] = useState(false);
  const [e2eLog, setE2eLog] = useState<string[]>([]);

  const expectedCallback = url ? `${url.replace(/\/$/, "")}/auth/v1/callback` : null;
  const appOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const [oauthErrors, setOauthErrors] = useState<OAuthErrorEntry[]>([]);
  const refreshOAuthErrors = () => setOauthErrors(listOAuthErrors());

  type AutoDetected = {
    status: CheckStatus;
    detail: string;
    callback: string | null;
    siteUrl: string | null;
    googleEnabled: boolean | null;
    fetchedAt: string | null;
  };
  const [autoDetected, setAutoDetected] = useState<AutoDetected>({
    status: "info",
    detail: "Auto-detecting from Supabase project…",
    callback: null,
    siteUrl: null,
    googleEnabled: null,
    fetchedAt: null,
  });

  const detectFromProject = useMemo(() => async () => {
    if (!url || !key) {
      setAutoDetected((s) => ({
        ...s,
        status: "fail",
        detail: "Cannot auto-detect: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY missing.",
      }));
      return;
    }
    setAutoDetected((s) => ({ ...s, status: "info", detail: "Probing /auth/v1/settings…" }));
    try {
      const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const cb = `${url.replace(/\/$/, "")}/auth/v1/callback`;
      const google = !!(j?.external?.google);
      const siteUrl: string | null = typeof j?.site_url === "string" ? j.site_url : null;
      setAutoDetected({
        status: google ? "ok" : "warn",
        detail: google
          ? "Auto-detected from live Supabase settings. Google provider is enabled."
          : "Settings reachable, but Google provider is not enabled in this Supabase project.",
        callback: cb,
        siteUrl,
        googleEnabled: google,
        fetchedAt: new Date().toISOString(),
      });
    } catch (e) {
      setAutoDetected({
        status: "fail",
        detail: `Auto-detect failed: ${(e as Error).message}. Falling back to env-derived URI.`,
        callback: url ? `${url.replace(/\/$/, "")}/auth/v1/callback` : null,
        siteUrl: null,
        googleEnabled: null,
        fetchedAt: new Date().toISOString(),
      });
    }
  }, [url, key]);

  useEffect(() => { void detectFromProject(); }, [detectFromProject]);

  const PASTE_KEY = "pe.oauth.googleRedirectUris";
  const [pastedUris, setPastedUris] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try { return window.localStorage.getItem(PASTE_KEY) ?? ""; } catch { return ""; }
  });

  const normalizeUri = (raw: string): string | null => {
    const v = raw.trim().replace(/[,;]+$/, "");
    if (!v) return null;
    try {
      const u = new URL(v);
      const port = u.port ? `:${u.port}` : "";
      const path = u.pathname.replace(/\/+$/, "") || "";
      return `${u.protocol.toLowerCase()}//${u.hostname.toLowerCase()}${port}${path}`;
    } catch {
      return v.toLowerCase().replace(/\/+$/, "");
    }
  };

  const parsedUris = useMemo(() => {
    return pastedUris
      .split(/[\s,]+/)
      .map((s) => ({ raw: s.trim(), norm: normalizeUri(s) }))
      .filter((x) => x.raw.length > 0);
  }, [pastedUris]);

  const expectedNorm = expectedCallback ? normalizeUri(expectedCallback) : null;

  type ExpectedTarget = {
    env: "supabase" | "dev" | "preview" | "production";
    label: string;
    uri: string;
    required: boolean;
    note?: string;
  };

  const expectedTargets = useMemo<ExpectedTarget[]>(() => {
    const list: ExpectedTarget[] = [];
    if (expectedCallback) {
      list.push({
        env: "supabase",
        label: "Supabase callback (required by Google)",
        uri: expectedCallback,
        required: true,
        note: "Must appear in Google client's Authorized redirect URIs.",
      });
    }
    list.push({
      env: "dev",
      label: "Dev origin (local)",
      uri: "http://localhost:8080/auth/callback",
      required: false,
      note: "Used when running the app locally.",
    });
    list.push({
      env: "preview",
      label: "Lovable preview origin",
      uri: "https://https-peninsulaequine-com-au.lovable.app/auth/callback",
      required: false,
      note: "Published lovable.app preview.",
    });
    list.push({
      env: "production",
      label: "Production origin",
      uri: "https://peninsulaequine.systems/auth/callback",
      required: true,
      note: "Live custom domain — must be allowed for production sign-in.",
    });
    list.push({
      env: "production",
      label: "Production origin (www)",
      uri: "https://www.peninsulaequine.systems/auth/callback",
      required: false,
      note: "www subdomain variant.",
    });
    return list;
  }, [expectedCallback]);

  const currentOriginNorm = appOrigin ? normalizeUri(appOrigin) : null;
  const targetResults = useMemo(() => {
    return expectedTargets.map((t) => {
      const tNorm = normalizeUri(t.uri);
      const present = !!tNorm && parsedUris.some((u) => u.norm === tNorm);
      let originHost: string | null = null;
      try { originHost = new URL(t.uri).origin.toLowerCase(); } catch { originHost = null; }
      const isCurrent = !!currentOriginNorm && !!originHost &&
        currentOriginNorm.startsWith(originHost);
      return { ...t, normalized: tNorm, present, isCurrent };
    });
  }, [expectedTargets, parsedUris, currentOriginNorm]);

  const requiredMissing = targetResults.filter((r) => r.required && !r.present);
  const optionalMissing = targetResults.filter((r) => !r.required && !r.present);
  const allRequiredMatch = requiredMissing.length === 0;
  const pasteMatch = !!expectedNorm && parsedUris.some((u) => u.norm === expectedNorm);
  const pasteHostMatches = useMemo(() => {
    if (!expectedNorm) return [];
    try {
      const expHost = new URL(expectedCallback!).hostname.toLowerCase();
      return parsedUris.filter((u) => {
        if (!u.norm || u.norm === expectedNorm) return false;
        try { return new URL(u.raw).hostname.toLowerCase() === expHost; } catch { return false; }
      });
    } catch { return []; }
  }, [parsedUris, expectedNorm, expectedCallback]);

  const savePastedUris = (v: string) => {
    setPastedUris(v);
    try { window.localStorage.setItem(PASTE_KEY, v); } catch { /* ignore */ }
  };

  useEffect(() => {
    refreshOAuthErrors();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith("pe.oauth.errorLog")) refreshOAuthErrors();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const runRedirectUriValidator = useMemo(() => () => {
    if (!url) {
      setRedirectStatus("fail");
      setRedirectDetail("VITE_SUPABASE_URL missing.");
      return;
    }
    setRedirectStatus("info");
    setRedirectDetail("Opening Google in a popup — sign in (or cancel) to complete the check…");
    const authorize =
      `${url.replace(/\/$/, "")}/auth/v1/authorize?provider=google` +
      `&redirect_to=${encodeURIComponent(window.location.origin + "/hq/diagnostics?oauth=probe")}`;
    const popup = window.open(authorize, "oauth-validator", "width=520,height=640");
    if (!popup) {
      setRedirectStatus("fail");
      setRedirectDetail("Popup blocked — allow popups for this site and re-run.");
      return;
    }
    const start = Date.now();
    const timer = window.setInterval(() => {
      // Cross-origin reads throw; only readable when popup lands back on our origin.
      try {
        if (popup.closed) {
          window.clearInterval(timer);
          setRedirectStatus("warn");
          setRedirectDetail("Popup closed before completing — inconclusive.");
          return;
        }
        const href = popup.location.href;
        if (!href || href === "about:blank") return;
        const u = new URL(href);
        if (u.origin !== window.location.origin) return;
        // Same-origin landing — read params and tokens.
        const err = u.searchParams.get("error") || u.searchParams.get("error_description") || "";
        const hash = u.hash || "";
        const hasCode = u.searchParams.has("code") || hash.includes("access_token=");
        window.clearInterval(timer);
        popup.close();
        if (/redirect_uri_mismatch/i.test(err + " " + hash)) {
          setRedirectStatus("fail");
          setRedirectDetail(
            `MISMATCH — Google rejected the redirect URI Supabase sent. Add ${expectedCallback} to "Authorized redirect URIs" in your Google OAuth client.`
          );
          recordOAuthError({
            provider: "google",
            source: "redirect-validator",
            message: "redirect_uri_mismatch",
            code: "redirect_uri_mismatch",
            context: { expectedCallback },
          });
          refreshOAuthErrors();
          return;
        }
        if (err) {
          setRedirectStatus("warn");
          setRedirectDetail(`Returned with error: ${decodeURIComponent(err)}`);
          recordOAuthError({
            provider: "google",
            source: "redirect-validator",
            message: decodeURIComponent(err),
          });
          refreshOAuthErrors();
          return;
        }
        if (hasCode) {
          setRedirectStatus("ok");
          setRedirectDetail(
            `Google accepted ${expectedCallback} and redirected back to ${u.origin}. Redirect URI is valid.`
          );
          return;
        }
        setRedirectStatus("warn");
        setRedirectDetail(`Returned to ${u.origin} without code or error — inconclusive.`);
      } catch {
        // Still on Google or Supabase — keep polling.
      }
      if (Date.now() - start > 120_000) {
        window.clearInterval(timer);
        try { popup.close(); } catch { /* ignore */ }
        setRedirectStatus("warn");
        setRedirectDetail("Timed out after 2 minutes without returning to app origin.");
      }
    }, 600);
  }, [url, expectedCallback]);

  const runGoogleE2E = useMemo(() => () => {
    if (e2eRunning) return;
    if (!url) {
      setE2eStatus("fail");
      setE2eDetail("VITE_SUPABASE_URL missing — cannot start flow.");
      return;
    }
    const pushLog = (line: string) => {
      const stamp = new Date().toISOString().slice(11, 19);
      setE2eLog((prev) => [...prev, `[${stamp}] ${line}`]);
    };
    setE2eLog([]);
    setE2eRunning(true);
    setE2eStatus("info");
    setE2eDetail("Opening Google sign-in popup…");
    pushLog("Starting E2E: opening Supabase /authorize with redirect_to=/hq?e2e=1");

    const target = `${window.location.origin}/hq?e2e=1`;
    const authorize =
      `${url.replace(/\/$/, "")}/auth/v1/authorize?provider=google` +
      `&redirect_to=${encodeURIComponent(target)}`;
    const popup = window.open(authorize, "oauth-e2e", "width=520,height=700");
    if (!popup) {
      setE2eRunning(false);
      setE2eStatus("fail");
      setE2eDetail("Popup blocked — allow popups for this site and re-run.");
      pushLog("FAIL: popup blocked");
      return;
    }

    let landed = false;
    let landedHref = "";
    const start = Date.now();
    const timer = window.setInterval(() => {
      try {
        if (popup.closed) {
          window.clearInterval(timer);
          if (!landed) {
            setE2eRunning(false);
            setE2eStatus("warn");
            setE2eDetail("Popup closed before reaching /hq — inconclusive.");
            pushLog("WARN: popup closed prior to landing");
          }
          return;
        }
        const href = popup.location.href;
        if (!href || href === "about:blank") return;
        const u = new URL(href);
        if (u.origin !== window.location.origin) return;

        // Same-origin landing — inspect.
        const err = u.searchParams.get("error") || u.searchParams.get("error_description") || "";
        const hash = u.hash || "";
        if (/redirect_uri_mismatch/i.test(err + " " + hash)) {
          window.clearInterval(timer);
          try { popup.close(); } catch { /* ignore */ }
          setE2eRunning(false);
          setE2eStatus("fail");
          setE2eDetail(
            `redirect_uri_mismatch — Google rejected the URI Supabase sent. Add ${expectedCallback} to Authorized redirect URIs.`
          );
          pushLog("FAIL: redirect_uri_mismatch from Google");
          recordOAuthError({
            provider: "google",
            source: "redirect-validator",
            message: "redirect_uri_mismatch",
            code: "redirect_uri_mismatch",
            context: { expectedCallback, source: "e2e" },
          });
          refreshOAuthErrors();
          return;
        }
        if (err) {
          window.clearInterval(timer);
          try { popup.close(); } catch { /* ignore */ }
          setE2eRunning(false);
          setE2eStatus("fail");
          setE2eDetail(`Returned with error: ${decodeURIComponent(err)}`);
          pushLog(`FAIL: ${decodeURIComponent(err)}`);
          recordOAuthError({
            provider: "google",
            source: "redirect-validator",
            message: decodeURIComponent(err),
            context: { source: "e2e" },
          });
          refreshOAuthErrors();
          return;
        }

        // Track intermediate landings — Supabase /auth/v1/callback then redirect to target.
        if (!landed) {
          pushLog(`Same-origin landing: ${u.pathname}${u.search}`);
        }

        if (u.pathname.startsWith("/hq")) {
          landed = true;
          landedHref = href;
          window.clearInterval(timer);
          pushLog("Popup reached /hq — verifying session in main window…");
          // Allow Supabase JS in the popup to persist the session to localStorage.
          window.setTimeout(async () => {
            try {
              const { data, error } = await supabase.auth.getSession();
              if (error) throw error;
              const session = data?.session;
              if (session?.user) {
                setE2eStatus("ok");
                setE2eDetail(
                  `PASS — signed in as ${session.user.email ?? session.user.id} and landed at ${new URL(landedHref).pathname}.`
                );
                pushLog(`PASS: session established for ${session.user.email ?? session.user.id}`);
              } else {
                setE2eStatus("warn");
                setE2eDetail("Landed on /hq but no session detected in this window — check storage sync.");
                pushLog("WARN: no session in main window after landing");
              }
            } catch (e) {
              setE2eStatus("fail");
              setE2eDetail(`Landed on /hq but session check failed: ${(e as Error).message}`);
              pushLog(`FAIL: session check error — ${(e as Error).message}`);
            } finally {
              setE2eRunning(false);
              try { popup.close(); } catch { /* ignore */ }
            }
          }, 600);
        }
      } catch {
        // Cross-origin (Google/Supabase) — keep polling.
      }
      if (Date.now() - start > 120_000) {
        window.clearInterval(timer);
        try { popup.close(); } catch { /* ignore */ }
        if (!landed) {
          setE2eRunning(false);
          setE2eStatus("warn");
          setE2eDetail("Timed out after 2 minutes without reaching /hq.");
          pushLog("WARN: timeout");
        }
      }
    }, 600);
  }, [url, expectedCallback, e2eRunning]);




  const runGoogleOAuthCheck = useMemo(() => () => {
    setGoogleStatus("info");
    setGoogleDetail("Checking Google OAuth provider…");
    (async () => {
      if (!url) {
        setGoogleStatus("fail");
        setGoogleDetail("VITE_SUPABASE_URL missing — cannot test /auth/v1/authorize.");
        return;
      }
      try {
        const target =
          `${url.replace(/\/$/, "")}/auth/v1/authorize?provider=google` +
          `&redirect_to=${encodeURIComponent(window.location.origin)}`;
        const res = await fetch(target, { method: "GET", mode: "no-cors", redirect: "manual" });
        // Cross-origin with redirect:"manual" → opaqueredirect when Supabase
        // returns a 302 to accounts.google.com. That proves the provider is
        // enabled AND a Client Secret (managed or custom) is persisted.
        if (res.type === "opaqueredirect") {
          setGoogleStatus("ok");
          setGoogleDetail("Provider enabled and Client Secret is persisted (Supabase issued a redirect to Google).");
          return;
        }
        // Some browsers/edges expose status 0 + type "opaque". Try a follow
        // request to read the body for the canonical "missing OAuth secret"
        // error message.
        const probe = await fetch(target, { method: "GET" }).catch(() => null);
        if (probe && probe.ok === false) {
          const body = await probe.text().catch(() => "");
          if (/missing\s+oauth\s+secret/i.test(body)) {
            setGoogleStatus("fail");
            setGoogleDetail("Supabase returned 400 — Google Client Secret is NOT persisted on the auth service.");
            recordOAuthError({
              provider: "google",
              source: "provider-check",
              message: "missing OAuth secret",
              code: "missing_oauth_secret",
            });
            refreshOAuthErrors();
            return;
          }
          setGoogleStatus("warn");
          setGoogleDetail(`Unexpected response (HTTP ${probe.status}). ${body.slice(0, 160)}`);
          return;
        }
        setGoogleStatus("warn");
        setGoogleDetail(`Inconclusive: response type "${res.type}". A real sign-in is the definitive test.`);
      } catch (e) {
        setGoogleStatus("warn");
        setGoogleDetail(`Could not reach /auth/v1/authorize: ${e instanceof Error ? e.message : String(e)}`);
      }
    })();
  }, [url]);

  useEffect(() => {
    runGoogleOAuthCheck();
  }, [runGoogleOAuthCheck]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t0 = performance.now();
        const { error } = await supabase.from("user_roles").select("user_id").limit(1);
        const ms = Math.round(performance.now() - t0);
        if (cancelled) return;
        if (error) {
          // RLS-denied (no session) is fine — it means the network round-trip
          // and key both work. A 401 on the publishable key would surface as
          // a different code/message.
          const msg = String(error.message || error);
          if (msg.toLowerCase().includes("jwt") || msg.toLowerCase().includes("invalid api key")) {
            setPingStatus("fail");
            setPingDetail(`Auth rejected by Supabase (${ms}ms): ${msg}`);
          } else {
            setPingStatus("ok");
            setPingDetail(`Reached Supabase in ${ms}ms (RLS-scoped response — expected for anon).`);
          }
        } else {
          setPingStatus("ok");
          setPingDetail(`Reached Supabase in ${ms}ms.`);
        }
      } catch (e) {
        if (cancelled) return;
        setPingStatus("fail");
        setPingDetail(`Network error: ${e instanceof Error ? e.message : String(e)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const checks: Check[] = useMemo(() => {
    const items: Check[] = [];

    items.push({
      label: "VITE_SUPABASE_URL",
      status: !url ? "fail" : url === EXPECTED_URL ? "ok" : "warn",
      detail: url ? url : "(missing)",
    });

    items.push({
      label: "VITE_SUPABASE_PROJECT_ID",
      status: !projectId
        ? "fail"
        : projectId === EXPECTED_PROJECT_ID
          ? "ok"
          : "warn",
      detail: projectId ?? "(missing)",
    });

    let keyStatus: CheckStatus = "ok";
    let keyDetail = `${maskKey(key)} (sb_publishable_ format)`;
    if (!key) {
      keyStatus = "fail";
      keyDetail = "(missing)";
    } else if (key.startsWith(LEGACY_PREFIX)) {
      keyStatus = "warn";
      keyDetail = `${maskKey(key)} — Legacy key format active — valid for this unmigrated project; migrate via Rotate API keys when ready.`;
    } else if (!key.startsWith(SB_PREFIX)) {
      keyStatus = "fail";
      keyDetail = `${maskKey(key)} — unrecognised format. Must start with sb_publishable_ or legacy eyJ.`;
    }
    items.push({
      label: "VITE_SUPABASE_PUBLISHABLE_KEY",
      status: keyStatus,
      detail: keyDetail,
    });

    items.push({
      label: "Backend reachability",
      status: pingStatus,
      detail: pingDetail,
    });

    items.push({
      label: "Build mode",
      status: "info",
      detail: `${mode} · host: ${typeof window !== "undefined" ? window.location.host : "—"}`,
    });

    items.push({
      label: "Google OAuth provider",
      status: googleStatus,
      detail: googleDetail,
    });

    items.push({
      label: "Google redirect URI validator",
      status: redirectStatus,
      detail: redirectDetail,
    });

    return items;
  }, [url, projectId, key, mode, pingStatus, pingDetail, googleStatus, googleDetail, redirectStatus, redirectDetail]);

  const overall: CheckStatus = useMemo(() => {
    if (checks.some((c) => c.status === "fail")) return "fail";
    if (checks.some((c) => c.status === "warn")) return "warn";
    return "ok";
  }, [checks]);

  // When the OAuth popup lands back here it carries ?oauth=probe — render a
  // tiny acknowledgement so the parent window can read location and close it.
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("oauth") === "probe") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-xs opacity-60 font-mono">Probe complete — you can close this window.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <HqBreadcrumbs current="Diagnostics" />

        <header className="mt-6 mb-10">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase opacity-50 mb-3">
            HQ · Operations · Diagnostics
          </div>
          <h1 className="font-serif text-3xl font-light leading-tight">
            Frontend ↔ Backend configuration
          </h1>
          <p className="mt-3 text-sm opacity-60 font-light max-w-xl">
            Read-only view of the Supabase env values baked into the running bundle and a live
            reachability check. Admin only.
          </p>
        </header>

        <div
          className="mb-6 px-4 py-3 rounded-sm flex items-center justify-between"
          style={{
            border: `1px solid ${statusColor(overall)}40`,
            background: `${statusColor(overall)}0d`,
          }}
        >
          <div className="text-[0.6rem] tracking-[0.4em] uppercase opacity-70">Overall</div>
          <div
            className="text-xs font-mono"
            style={{ color: statusColor(overall), letterSpacing: "0.2em" }}
          >
            {statusLabel(overall)}
          </div>
        </div>

        <div className="mb-8 border border-foreground/10 rounded-sm">
          <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-55">
            Expected configuration
          </div>
          {[
            {
              label: "Expected project ID",
              value: EXPECTED_PROJECT_ID,
              source: EXPECTED_PROJECT_ID_SOURCE,
              envVar: "VITE_DIAGNOSTICS_EXPECTED_PROJECT_ID",
            },
            {
              label: "Expected URL",
              value: EXPECTED_URL,
              source: EXPECTED_URL_SOURCE,
              envVar: "VITE_DIAGNOSTICS_EXPECTED_URL",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-b border-foreground/10 last:border-b-0"
            >
              <div>
                <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-1.5">
                  {row.label}
                </div>
                <div className="text-sm font-mono opacity-85 break-all">{row.value}</div>
              </div>
              <div className="text-right self-start pt-1">
                <div
                  className="text-[0.55rem] font-mono"
                  style={{
                    color:
                      row.source === "env_override"
                        ? statusColor("ok")
                        : "rgba(232,230,225,0.5)",
                    letterSpacing: "0.2em",
                  }}
                >
                  {row.source === "env_override" ? "ENV OVERRIDE" : "DEFAULT"}
                </div>
                <div className="text-[0.55rem] font-mono opacity-35 mt-1">{row.envVar}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 border border-foreground/10 rounded-sm">
          <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-55 flex items-center justify-between gap-4">
            <span>Google OAuth — End-to-end sign-in</span>
            <div className="flex items-center gap-4">
              <span
                className="text-[0.55rem] font-mono"
                style={{ color: statusColor(e2eStatus), letterSpacing: "0.2em" }}
              >
                {e2eRunning ? "RUNNING" : statusLabel(e2eStatus)}
              </span>
              <button
                type="button"
                onClick={runGoogleE2E}
                disabled={e2eRunning}
                className="text-[0.55rem] tracking-[0.3em] uppercase opacity-80 hover:opacity-100 border-b border-foreground/40 hover:border-foreground/70 pb-0.5 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {e2eRunning ? "Running…" : "Run Google OAuth E2E →"}
              </button>
            </div>
          </div>
          <div className="px-4 py-3 text-[0.7rem] opacity-70 font-light leading-relaxed border-b border-foreground/10">
            Performs the full real flow: opens a Google sign-in popup → Supabase callback →
            redirect to <span className="font-mono opacity-90">/hq?e2e=1</span> → verifies an
            authenticated session is established in this window. PASS means sign-in completed
            with no <code className="font-mono">redirect_uri_mismatch</code> or provider errors.
          </div>
          <div className="px-4 py-3 text-sm font-light leading-relaxed border-b border-foreground/10"
               style={{ color: statusColor(e2eStatus) }}>
            {e2eDetail}
          </div>
          {e2eLog.length > 0 && (
            <div className="px-4 py-3">
              <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-2">Trace</div>
              <pre className="text-[0.7rem] font-mono opacity-80 whitespace-pre-wrap leading-relaxed">
{e2eLog.join("\n")}
              </pre>
            </div>
          )}
        </div>

        <div className="mb-8 border border-foreground/10 rounded-sm">

          <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-55 flex items-center justify-between">
            <span>Google OAuth — Authorized redirect URIs</span>
            <button
              type="button"
              onClick={runRedirectUriValidator}
              className="text-[0.55rem] tracking-[0.3em] uppercase opacity-70 hover:opacity-100 border-b border-foreground/30 hover:border-foreground/60 pb-0.5 transition-opacity"
            >
              Run live validator →
            </button>
          </div>
          <div className="px-4 py-3 text-[0.7rem] opacity-60 font-light leading-relaxed border-b border-foreground/10">
            These exact values must appear in your Google Cloud OAuth client's "Authorized
            redirect URIs". The live validator opens a popup, completes a real OAuth round-trip,
            and flags <code className="font-mono opacity-90">redirect_uri_mismatch</code> if Google
            rejects the URI Supabase sends.
          </div>
          {[
            { label: "Supabase callback (required)", value: expectedCallback ?? "(missing VITE_SUPABASE_URL)" },
            { label: "App origin (post-callback)", value: appOrigin || "(unknown)" },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-b border-foreground/10 last:border-b-0 items-center">
              <div>
                <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-1.5">{row.label}</div>
                <div className="text-sm font-mono opacity-85 break-all">{row.value}</div>
              </div>
              <button
                type="button"
                onClick={() => { void navigator.clipboard?.writeText(row.value); }}
                className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity"
              >
                Copy
              </button>
            </div>
          ))}
        </div>

        <div className="mb-8 border border-foreground/10 rounded-sm">
          <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-55 flex items-center justify-between gap-4">
            <span>Auto-detected from Supabase project</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => { void detectFromProject(); }}
                className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity"
              >
                Re-detect
              </button>
              <span
                className="text-[0.55rem] font-mono"
                style={{ color: statusColor(autoDetected.status), letterSpacing: "0.2em" }}
              >
                {autoDetected.status === "ok" ? "LIVE" : autoDetected.status === "fail" ? "ERROR" : autoDetected.status === "warn" ? "WARN" : "PROBING"}
              </span>
            </div>
          </div>
          <div className="px-4 py-3 text-[0.7rem] opacity-60 font-light leading-relaxed border-b border-foreground/10">
            {autoDetected.detail}
            {autoDetected.fetchedAt && (
              <span className="ml-2 opacity-50">· fetched {new Date(autoDetected.fetchedAt).toLocaleTimeString()}</span>
            )}
          </div>
          {(() => {
            const detectedCb = autoDetected.callback ?? expectedCallback;
            const detectedNorm = detectedCb ? normalizeUri(detectedCb) : null;
            const present = !!detectedNorm && parsedUris.some((u) => u.norm === detectedNorm);
            const rows: { label: string; value: string | null; status: CheckStatus; note?: string }[] = [
              {
                label: "Detected Supabase callback URI",
                value: detectedCb,
                status: parsedUris.length === 0 ? "info" : present ? "ok" : "fail",
                note: parsedUris.length === 0
                  ? "Paste your Google client's redirect URIs below to compare."
                  : present
                    ? "Found in your pasted Google redirect URIs."
                    : "MISSING from your pasted Google redirect URIs — add it to Google Cloud Console.",
              },
              {
                label: "Supabase site_url (auth)",
                value: autoDetected.siteUrl,
                status: autoDetected.siteUrl ? "info" : "warn",
                note: autoDetected.siteUrl ? "Default post-auth landing URL." : "Not exposed by /auth/v1/settings.",
              },
              {
                label: "Google provider",
                value: autoDetected.googleEnabled === null ? null : autoDetected.googleEnabled ? "enabled" : "disabled",
                status: autoDetected.googleEnabled === null ? "info" : autoDetected.googleEnabled ? "ok" : "fail",
              },
            ];
            return (
              <ul className="px-4 py-3 space-y-3">
                {rows.map((r) => (
                  <li
                    key={r.label}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 items-start border-l-2 pl-3"
                    style={{ borderColor: statusColor(r.status) }}
                  >
                    <span className="text-[0.55rem] font-mono pt-0.5" style={{ color: statusColor(r.status), letterSpacing: "0.2em" }}>
                      {r.status === "ok" ? "OK" : r.status === "fail" ? "FAIL" : r.status === "warn" ? "WARN" : "—"}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-1">{r.label}</div>
                      <div className="text-sm font-mono opacity-85 break-all">{r.value ?? "(not available)"}</div>
                      {r.note && <div className="text-[0.7rem] opacity-55 mt-1">{r.note}</div>}
                    </div>
                    {r.value && (
                      <button
                        type="button"
                        onClick={() => { void navigator.clipboard?.writeText(r.value!); }}
                        className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                      >
                        Copy
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>

        <div className="mb-8 border border-foreground/10 rounded-sm">
          <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-55 flex items-center justify-between gap-4">
            <span>Paste &amp; compare — Google client redirect URIs</span>
            <div className="flex items-center gap-4">
              {pastedUris.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => savePastedUris("")}
                  className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                >
                  Clear
                </button>
              )}
              <span
                className="text-[0.55rem] font-mono"
                style={{
                  color: parsedUris.length === 0
                    ? statusColor("info")
                    : allRequiredMatch ? statusColor("ok") : statusColor("fail"),
                  letterSpacing: "0.2em",
                }}
              >
                {parsedUris.length === 0
                  ? "IDLE"
                  : allRequiredMatch
                    ? (optionalMissing.length === 0 ? "ALL MATCH" : "REQUIRED OK")
                    : `${requiredMissing.length} MISSING`}
              </span>
            </div>
          </div>
          <div className="px-4 py-3 text-[0.7rem] opacity-60 font-light leading-relaxed border-b border-foreground/10">
            Paste the contents of Google Cloud → APIs &amp; Services → Credentials → your OAuth
            client → <span className="font-mono opacity-90">Authorized redirect URIs</span>. One
            URI per line (commas and spaces are also accepted). Each deployed environment
            (Supabase callback, dev, preview, production) is checked separately. Stored locally
            in your browser.
          </div>
          <div className="px-4 py-3 border-b border-foreground/10">
            <textarea
              value={pastedUris}
              onChange={(e) => savePastedUris(e.target.value)}
              spellCheck={false}
              placeholder={expectedCallback ?? "https://<project>.supabase.co/auth/v1/callback"}
              className="w-full min-h-[120px] bg-transparent border border-foreground/15 rounded-sm px-3 py-2 text-sm font-mono opacity-90 focus:outline-none focus:border-foreground/40 resize-y"
            />
          </div>

          <div className="px-4 py-3 border-b border-foreground/10">
            <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-3">
              Expected redirect URIs by environment
            </div>
            <ul className="space-y-3">
              {targetResults.map((t) => {
                const idle = parsedUris.length === 0;
                const tone: CheckStatus = idle
                  ? "info"
                  : t.present ? "ok" : (t.required ? "fail" : "warn");
                return (
                  <li
                    key={`${t.env}-${t.uri}`}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 items-start border-l-2 pl-3"
                    style={{ borderColor: statusColor(tone) }}
                  >
                    <span
                      className="text-[0.55rem] font-mono pt-0.5"
                      style={{ color: statusColor(tone), letterSpacing: "0.2em" }}
                    >
                      {idle ? "—" : t.present ? "MATCH" : (t.required ? "MISSING" : "OPTIONAL")}
                    </span>
                    <div>
                      <div className="text-[0.55rem] tracking-[0.3em] uppercase opacity-55 mb-0.5 flex items-center gap-2">
                        <span>{t.env}</span>
                        <span className="opacity-50 normal-case tracking-normal">· {t.label}</span>
                        {t.isCurrent && (
                          <span
                            className="text-[0.5rem] font-mono px-1.5 py-0.5 rounded-sm"
                            style={{
                              color: statusColor("ok"),
                              backgroundColor: "rgba(16,185,129,0.08)",
                              letterSpacing: "0.2em",
                            }}
                          >
                            THIS ORIGIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono opacity-85 break-all">{t.uri}</div>
                      {t.note && (
                        <div className="text-[0.65rem] opacity-50 font-light mt-1">{t.note}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { void navigator.clipboard?.writeText(t.uri); }}
                      className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity pt-1"
                    >
                      Copy
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {parsedUris.length > 0 && (
            <div className="px-4 py-3 border-b border-foreground/10">
              <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-2">
                Pasted entries ({parsedUris.length})
              </div>
              <ul className="space-y-1.5">
                {parsedUris.map((u, i) => {
                  const matchedTarget = targetResults.find((t) => t.normalized === u.norm);
                  return (
                    <li key={i} className="grid grid-cols-[auto_1fr] gap-3 items-start">
                      <span
                        className="text-[0.55rem] font-mono pt-0.5"
                        style={{
                          color: matchedTarget ? statusColor("ok") : "rgba(232,230,225,0.35)",
                          letterSpacing: "0.2em",
                        }}
                      >
                        {matchedTarget ? matchedTarget.env.toUpperCase() : "—"}
                      </span>
                      <span className="text-xs font-mono opacity-80 break-all">{u.raw}</span>
                    </li>
                  );
                })}
              </ul>
              {requiredMissing.length > 0 && (
                <div className="mt-4 text-[0.7rem] leading-relaxed font-light"
                     style={{ color: statusColor("fail") }}>
                  {requiredMissing.length} required URI{requiredMissing.length === 1 ? "" : "s"} not in the pasted list.
                  Add the following to &quot;Authorized redirect URIs&quot; in Google Cloud, then save:
                  <ul className="mt-2 space-y-1">
                    {requiredMissing.map((m) => (
                      <li key={m.uri} className="font-mono opacity-90">• {m.uri}</li>
                    ))}
                  </ul>
                </div>
              )}
              {requiredMissing.length === 0 && optionalMissing.length > 0 && (
                <div className="mt-4 text-[0.7rem] leading-relaxed font-light"
                     style={{ color: statusColor("warn") }}>
                  All required URIs present. {optionalMissing.length} optional URI{optionalMissing.length === 1 ? "" : "s"} missing — add if you need sign-in from that environment.
                </div>
              )}
              {requiredMissing.length === 0 && optionalMissing.length === 0 && (
                <div className="mt-4 text-[0.7rem] leading-relaxed font-light"
                     style={{ color: statusColor("ok") }}>
                  All expected redirect URIs are present in the Google client.
                </div>
              )}
              {!pasteMatch && pasteHostMatches.length > 0 && (
                <div className="mt-3 text-[0.65rem] leading-relaxed font-light opacity-60">
                  Closest host matches to Supabase callback:{" "}
                  <span className="font-mono opacity-90">
                    {pasteHostMatches.map((m) => m.raw).join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Remediation checklist — surfaces only when mismatches exist */}
        {(() => {
          const missingTargets = targetResults.filter((t) => !t.present);
          const missingRequired = missingTargets.filter((t) => t.required);
          const missingOptional = missingTargets.filter((t) => !t.required);
          const hasAnything = missingTargets.length > 0;
          const allMissingUris = missingTargets.map((t) => t.uri);
          const allMissingBlock = allMissingUris.join("\n");
          const consoleUrl = "https://console.cloud.google.com/apis/credentials";

          return (
            <div className="mb-8 border rounded-sm"
                 style={{
                   borderColor: hasAnything
                     ? (missingRequired.length > 0 ? "rgba(239,68,68,0.35)" : "rgba(245,158,11,0.3)")
                     : "rgba(232,230,225,0.1)",
                 }}>
              <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-70 flex items-center justify-between gap-4">
                <span>Remediation checklist — Google redirect URIs</span>
                <span
                  className="text-[0.55rem] font-mono"
                  style={{
                    color: !hasAnything
                      ? statusColor("ok")
                      : missingRequired.length > 0 ? statusColor("fail") : statusColor("warn"),
                    letterSpacing: "0.2em",
                  }}
                >
                  {!hasAnything
                    ? "NOTHING TO DO"
                    : `${missingTargets.length} TO ADD`}
                </span>
              </div>

              {!hasAnything ? (
                <div className="px-4 py-4 text-[0.7rem] opacity-65 font-light leading-relaxed">
                  Every expected redirect URI is already present in the pasted Google client.
                  No remediation needed.
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 text-[0.7rem] opacity-65 font-light leading-relaxed border-b border-foreground/10">
                    Follow these steps in Google Cloud to resolve the mismatch. Each missing URI
                    is generated from the environments this app is deployed to — copy them exactly,
                    no trailing slashes, no stray spaces.
                  </div>

                  <ol className="px-4 py-3 space-y-3 border-b border-foreground/10 text-[0.75rem] font-light leading-relaxed">
                    <li className="grid grid-cols-[1.25rem_1fr] gap-2">
                      <span className="font-mono opacity-50">1.</span>
                      <span>
                        Open{" "}
                        <a
                          href={consoleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline opacity-90 hover:opacity-100"
                        >
                          Google Cloud → APIs &amp; Services → Credentials
                        </a>{" "}
                        and select the OAuth 2.0 Client ID used by this project.
                      </span>
                    </li>
                    <li className="grid grid-cols-[1.25rem_1fr] gap-2">
                      <span className="font-mono opacity-50">2.</span>
                      <span>Scroll to <span className="font-mono opacity-90">Authorized redirect URIs</span> and click <span className="font-mono opacity-90">+ ADD URI</span> for each entry below.</span>
                    </li>
                    <li className="grid grid-cols-[1.25rem_1fr] gap-2">
                      <span className="font-mono opacity-50">3.</span>
                      <span>Paste the URI exactly as shown — Google does string-equality matching, so capitalisation, scheme, and trailing slash all matter.</span>
                    </li>
                    <li className="grid grid-cols-[1.25rem_1fr] gap-2">
                      <span className="font-mono opacity-50">4.</span>
                      <span>Click <span className="font-mono opacity-90">SAVE</span>. Changes take effect within a few seconds; re-run the validator above to confirm.</span>
                    </li>
                  </ol>

                  {missingRequired.length > 0 && (
                    <div className="px-4 py-3 border-b border-foreground/10">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="text-[0.6rem] tracking-[0.35em] uppercase"
                             style={{ color: statusColor("fail") }}>
                          Required — sign-in will fail without these ({missingRequired.length})
                        </div>
                        <button
                          type="button"
                          onClick={() => { void navigator.clipboard?.writeText(missingRequired.map((t) => t.uri).join("\n")); }}
                          className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                        >
                          Copy all required
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {missingRequired.map((t) => (
                          <li key={t.uri}
                              className="grid grid-cols-[1fr_auto] gap-3 items-start border-l-2 pl-3"
                              style={{ borderColor: statusColor("fail") }}>
                            <div>
                              <div className="text-[0.55rem] tracking-[0.3em] uppercase opacity-55 mb-0.5">
                                {t.env} · {t.label}
                              </div>
                              <div className="text-xs font-mono opacity-90 break-all">{t.uri}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { void navigator.clipboard?.writeText(t.uri); }}
                              className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity pt-1"
                            >
                              Copy
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {missingOptional.length > 0 && (
                    <div className="px-4 py-3 border-b border-foreground/10">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="text-[0.6rem] tracking-[0.35em] uppercase"
                             style={{ color: statusColor("warn") }}>
                          Optional — add if you sign in from this environment ({missingOptional.length})
                        </div>
                        <button
                          type="button"
                          onClick={() => { void navigator.clipboard?.writeText(missingOptional.map((t) => t.uri).join("\n")); }}
                          className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                        >
                          Copy all optional
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {missingOptional.map((t) => (
                          <li key={t.uri}
                              className="grid grid-cols-[1fr_auto] gap-3 items-start border-l-2 pl-3"
                              style={{ borderColor: statusColor("warn") }}>
                            <div>
                              <div className="text-[0.55rem] tracking-[0.3em] uppercase opacity-55 mb-0.5">
                                {t.env} · {t.label}
                              </div>
                              <div className="text-xs font-mono opacity-90 break-all">{t.uri}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { void navigator.clipboard?.writeText(t.uri); }}
                              className="text-[0.55rem] tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity pt-1"
                            >
                              Copy
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="text-[0.65rem] opacity-55 font-light">
                      Block-paste all {missingTargets.length} URI{missingTargets.length === 1 ? "" : "s"} (one per line) into Google.
                    </div>
                    <button
                      type="button"
                      onClick={() => { void navigator.clipboard?.writeText(allMissingBlock); }}
                      className="text-[0.6rem] tracking-[0.35em] uppercase opacity-75 hover:opacity-100 transition-opacity border border-foreground/20 px-3 py-1.5 rounded-sm"
                    >
                      Copy all ({missingTargets.length})
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })()}






        <div className="mb-8 border border-foreground/10 rounded-sm">
          <div className="px-4 py-2.5 border-b border-foreground/10 text-[0.6rem] tracking-[0.4em] uppercase opacity-55 flex items-center justify-between gap-4">
            <span>
              OAuth error log{" "}
              <span className="opacity-50 normal-case tracking-normal">
                ({oauthErrors.length}{oauthErrors.length === 25 ? "+" : ""} recent)
              </span>
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={refreshOAuthErrors}
                className="text-[0.55rem] tracking-[0.3em] uppercase opacity-70 hover:opacity-100 border-b border-foreground/30 hover:border-foreground/60 pb-0.5 transition-opacity"
              >
                Refresh →
              </button>
              <button
                type="button"
                onClick={() => { clearOAuthErrors(); refreshOAuthErrors(); }}
                className="text-[0.55rem] tracking-[0.3em] uppercase opacity-50 hover:opacity-90 transition-opacity"
              >
                Clear
              </button>
            </div>
          </div>
          {oauthErrors.length === 0 ? (
            <div className="px-4 py-6 text-[0.7rem] opacity-50 font-light">
              No OAuth errors recorded on this device. Errors are captured automatically from the
              login button, the provider check, and the redirect-URI validator above.
            </div>
          ) : (
            oauthErrors.map((entry, i) => {
              const fix = diagnoseOAuthError(entry);
              const color = statusColor(fix.severity);
              return (
                <div
                  key={`${entry.ts}-${i}`}
                  className="px-4 py-4 border-b border-foreground/10 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-1">
                        {new Date(entry.ts).toLocaleString()} · {entry.provider} · {entry.source}
                      </div>
                      <div className="text-sm font-mono opacity-90 break-words">
                        {entry.message}
                      </div>
                    </div>
                    <div
                      className="text-[0.6rem] font-mono shrink-0"
                      style={{ color, letterSpacing: "0.2em" }}
                    >
                      {statusLabel(fix.severity)}
                    </div>
                  </div>
                  <div
                    className="mt-3 pl-3 border-l"
                    style={{ borderColor: `${color}55` }}
                  >
                    <div className="text-[0.65rem] tracking-[0.3em] uppercase opacity-70 mb-1.5">
                      Fix · {fix.title}
                    </div>
                    <ol className="text-[0.75rem] opacity-75 font-light leading-relaxed space-y-1 list-decimal pl-4">
                      {fix.steps.map((s, j) => (
                        <li key={j}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-foreground/10">



          {checks.map((c) => (
            <div
              key={c.label}
              className="grid grid-cols-[1fr_auto] gap-4 py-4 border-b border-foreground/10"
            >
              <div>
                <div className="text-[0.6rem] tracking-[0.35em] uppercase opacity-55 mb-1.5">
                  {c.label}
                </div>
                <div className="text-sm font-mono opacity-85 break-all">{c.detail}</div>
              </div>
              <div
                className="text-[0.6rem] font-mono self-start pt-1"
                style={{ color: statusColor(c.status), letterSpacing: "0.2em" }}
              >
                {statusLabel(c.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-xs opacity-40 font-light leading-relaxed max-w-md">
            No secrets are exposed on this page. The publishable key is intentionally public
            (frontend-bundled) but is masked here as a readability aid. The service-role key is
            server-only and never reaches the browser.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={runGoogleOAuthCheck}
              className="text-[0.6rem] tracking-[0.35em] uppercase opacity-70 hover:opacity-100 border-b border-foreground/30 hover:border-foreground/60 pb-1 transition-opacity"
            >
              Re-check Google OAuth →
            </button>
          <button
            type="button"
            onClick={() => {
              const report = {
                generatedAt: new Date().toISOString(),
                host: typeof window !== "undefined" ? window.location.host : null,
                href: typeof window !== "undefined" ? window.location.href : null,
                buildMode: mode,
                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
                env: {
                  VITE_SUPABASE_URL: url ?? null,
                  VITE_SUPABASE_PROJECT_ID: projectId ?? null,
                  VITE_SUPABASE_PUBLISHABLE_KEY: key ? maskKey(key) : null,
                  key_format:
                    !key
                      ? "missing"
                      : key.startsWith(LEGACY_PREFIX)
                        ? "legacy_jwt"
                        : key.startsWith(SB_PREFIX)
                          ? "sb_publishable"
                          : "unknown",
                },
                expected: {
                  project_id: EXPECTED_PROJECT_ID,
                  project_id_source: EXPECTED_PROJECT_ID_SOURCE,
                  url: EXPECTED_URL,
                  url_source: EXPECTED_URL_SOURCE,
                  key_prefix: SB_PREFIX,
                },

                overall: statusLabel(overall),
                checks: checks.map((c) => ({
                  label: c.label,
                  status: statusLabel(c.status),
                  detail: c.detail,
                })),
                oauthErrors: oauthErrors.map((e) => ({
                  ts: new Date(e.ts).toISOString(),
                  provider: e.provider,
                  source: e.source,
                  message: e.message,
                  code: e.code,
                  fix: diagnoseOAuthError(e),
                })),
              };
              const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: "application/json",
              });
              const url2 = URL.createObjectURL(blob);
              const a = document.createElement("a");
              const stamp = new Date().toISOString().replace(/[:.]/g, "-");
              a.href = url2;
              a.download = `hq-diagnostics-${stamp}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url2);
            }}
            className="shrink-0 text-[0.6rem] tracking-[0.35em] uppercase opacity-70 hover:opacity-100 border-b border-foreground/30 hover:border-foreground/60 pb-1 transition-opacity"
          >
            Export report →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
