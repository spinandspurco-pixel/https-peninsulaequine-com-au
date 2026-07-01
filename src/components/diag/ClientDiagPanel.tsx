import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthLogEntries, subscribeAuthLog, type AuthLogEntry } from "@/lib/authRouting";
import type { BuildInfo, DiagResponse, HealthResponse } from "@/types/health";

type ServerBuildState =
  | ({ status?: number; error?: string; latencyMs?: number; fetchedAt?: string } & Partial<BuildInfo>)
  | null;

type HealthState =
  | {
      httpStatus?: number;
      error?: string;
      status?: HealthResponse["status"];
      service?: HealthResponse["service"];
      checkedAt?: HealthResponse["checkedAt"];
      bundleHash?: BuildInfo["bundleHash"];
      latencyMs?: number;
      fetchedAt?: string;
    }
  | null;

type DiagState =
  | ({
      httpStatus?: number;
      error?: string;
      latencyMs?: number;
      fetchedAt?: string;
    } & Partial<DiagResponse>)
  | null;

/**
 * Temporary client-side diagnostic panel.
 *
 * Enabled when ANY of:
 *   - URL has ?debug=1
 *   - URL has ?debug=auth
 *   - localStorage["LOVABLE_CLIENT_DIAG"] === "1"
 *
 * Renders only on /login and /hq (and /hq/* children). Read-only — never
 * mutates auth/RLS. Safe to ship; if not enabled, returns null.
 */
export function ClientDiagPanel() {
  const location = useLocation();
  const { user, ready, authLoading, rolesLoading, roles, rolesError } = useAuth();
  const [entries, setEntries] = useState<AuthLogEntry[]>(() => getAuthLogEntries());
  const [lastError, setLastError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const [cacheHeaders, setCacheHeaders] = useState<Record<string, string | null> | null>(null);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [cacheCheckedAt, setCacheCheckedAt] = useState<number | null>(null);
  const [serverBuild, setServerBuild] = useState<ServerBuildState>(null);
  const [health, setHealth] = useState<HealthState>(null);
  const [diag, setDiag] = useState<DiagState>(null);


  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  const measure = () => {
    const start =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    return () =>
      Math.round(
        (typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Date.now()) - start,
      );
  };

  const fetchBuildInfo = useCallback(async () => {
    const stop = measure();
    const fetchedAt = new Date().toISOString();
    try {
      const r = await fetch("/api/build-info", { cache: "no-store", credentials: "omit" });
      const latencyMs = stop();
      if (!r.ok) {
        setServerBuild({ error: `HTTP ${r.status}`, status: r.status, latencyMs, fetchedAt });
        return;
      }
      const j = (await r.json()) as BuildInfo;
      setServerBuild({
        buildTime: j.buildTime,
        buildCommit: j.buildCommit,
        bundleHash: j.bundleHash,
        status: r.status,
        latencyMs,
        fetchedAt,
      });
    } catch (e) {
      setServerBuild({ error: String((e as Error)?.message ?? e), latencyMs: stop(), fetchedAt });
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    const stop = measure();
    const fetchedAt = new Date().toISOString();
    try {
      const r = await fetch("/api/health", { cache: "no-store", credentials: "omit" });
      const latencyMs = stop();
      if (!r.ok) {
        setHealth({ error: `HTTP ${r.status}`, httpStatus: r.status, latencyMs, fetchedAt });
        return;
      }
      const j = (await r.json()) as HealthResponse;
      setHealth({
        status: j.status,
        service: j.service,
        checkedAt: j.checkedAt,
        bundleHash: j?.buildInfo?.bundleHash ?? null,
        httpStatus: r.status,
        latencyMs,
        fetchedAt,
      });
    } catch (e) {
      setHealth({ error: String((e as Error)?.message ?? e), latencyMs: stop(), fetchedAt });
    }
  }, []);

  const fetchDiag = useCallback(async () => {
    const stop = measure();
    const fetchedAt = new Date().toISOString();
    try {
      const r = await fetch("/api/diag", { cache: "no-store", credentials: "omit" });
      const latencyMs = stop();
      if (!r.ok) {
        setDiag({ error: `HTTP ${r.status}`, httpStatus: r.status, latencyMs, fetchedAt });
        return;
      }
      const j = (await r.json()) as DiagResponse;
      setDiag({
        service: j.service,
        checkedAt: j.checkedAt,
        buildInfo: j.buildInfo,
        supabase: j.supabase,
        httpStatus: r.status,
        latencyMs,
        fetchedAt,
      });
    } catch (e) {
      setDiag({ error: String((e as Error)?.message ?? e), latencyMs: stop(), fetchedAt });
    }
  }, []);

  const refreshBuildInfo = useCallback(async () => {
    setRefreshing(true);
    setServerBuild(null);
    setHealth(null);
    setDiag(null);
    try {
      await Promise.all([fetchBuildInfo(), fetchHealth(), fetchDiag()]);
      setLastRefreshAt(Date.now());
    } finally {
      setRefreshing(false);
    }
  }, [fetchBuildInfo, fetchHealth, fetchDiag]);

  const [probing, setProbing] = useState(false);
  const [lastProbeAt, setLastProbeAt] = useState<number | null>(null);


  useEffect(() => {
    void fetchBuildInfo();
  }, [fetchBuildInfo]);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    void fetchDiag();
  }, [fetchDiag]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const POLL_MS = 10_000;

  useEffect(() => {
    if (!autoRefresh) return;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      await Promise.all([fetchBuildInfo(), fetchHealth(), fetchDiag()]);
      setLastRefreshAt(Date.now());
    };
    const id = window.setInterval(() => {
      void tick();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [autoRefresh, fetchBuildInfo, fetchHealth, fetchDiag]);




  useEffect(() => {
    const unsub = subscribeAuthLog(setEntries);
    const onErr = (e: ErrorEvent) =>

      setLastError(`${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`);
    const onRej = (e: PromiseRejectionEvent) =>
      setLastError(`unhandledrejection: ${String((e.reason && (e.reason.message || e.reason)) ?? e.reason)}`);
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      unsub();
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  // Probe edge caching headers on the current document and main JS bundle.
  // Uses GET (HEAD is often blocked by edges) with cache:'no-store' so we
  // observe the edge's own headers, not a cached response. Read-only.
  const probeCache = async () => {
    setCacheError(null);
    try {
      const targets: { label: string; url: string }[] = [
        { label: "document", url: window.location.pathname + window.location.search },
      ];
      const mainScript = Array.from(document.querySelectorAll<HTMLScriptElement>("script[src]"))
        .map((s) => s.src)
        .find((src) => /\/assets\/index-[A-Za-z0-9_-]+\.js$/.test(src));
      if (mainScript) targets.push({ label: "bundle", url: mainScript });

      const interesting = [
        "cache-control",
        "etag",
        "age",
        "x-cache",
        "x-vercel-cache",
        "cf-cache-status",
        "x-served-by",
        "x-vercel-id",
        "last-modified",
        "date",
        "content-type",
      ];
      const out: Record<string, string | null> = {};
      for (const t of targets) {
        const stop = measure();
        try {
          const res = await fetch(t.url, { method: "GET", cache: "no-store", credentials: "omit" });
          const latencyMs = stop();
          for (const h of interesting) {
            const v = res.headers.get(h);
            if (v !== null) out[`${t.label}.${h}`] = v;
          }
          out[`${t.label}.status`] = String(res.status);
          out[`${t.label}.latencyMs`] = String(latencyMs);
        } catch (err) {
          out[`${t.label}.error`] = String((err as Error)?.message ?? err);
          out[`${t.label}.latencyMs`] = String(stop());
        }
      }
      setCacheHeaders(out);
      setCacheCheckedAt(Date.now());
    } catch (err) {
      setCacheError(String((err as Error)?.message ?? err));
    }
  };

  useEffect(() => {
    let enabledNow = false;
    try {
      const sp = new URLSearchParams(window.location.search);
      enabledNow =
        sp.get("debug") === "1" ||
        sp.get("debug") === "auth" ||
        window.localStorage.getItem("LOVABLE_CLIENT_DIAG") === "1";
    } catch {
      enabledNow = false;
    }
    const onSurface =
      location.pathname === "/login" ||
      location.pathname === "/hq" ||
      location.pathname.startsWith("/hq/");
    if (enabledNow && onSurface) void probeCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Gate: route + opt-in
  const path = location.pathname;
  const onAuthSurface = path === "/login" || path === "/hq" || path.startsWith("/hq/");
  if (!onAuthSurface) return null;

  let enabled = false;
  try {
    const sp = new URLSearchParams(window.location.search);
    enabled =
      sp.get("debug") === "1" ||
      sp.get("debug") === "auth" ||
      window.localStorage.getItem("LOVABLE_CLIENT_DIAG") === "1";
  } catch {
    enabled = false;
  }
  if (!enabled) return null;

  // Bundle hash — read the main module script src injected by Vite at build time.
  let bundleHash = "(unknown)";
  try {
    const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>("script[src]"));
    const main = scripts.map((s) => s.src).find((src) => /\/assets\/index-[A-Za-z0-9_-]+\.js$/.test(src));
    if (main) {
      const m = main.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/);
      bundleHash = m ? m[1] : main;
    }
  } catch {
    /* ignore */
  }

  const supaUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const supaKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const supaUrlValid = !!supaUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supaUrl);
  // Safe key format detection — never render the secret value itself.
  // We only report: format family, total length, and the non-secret prefix
  // (the literal `sb_publishable_` token or the JWT header `eyJ`), which
  // are public format identifiers, not credentials.
  let supaKeyShape = "missing";
  let supaKeyLen = 0;
  let supaKeyPrefix = "—";
  if (supaKey) {
    supaKeyLen = supaKey.length;
    if (supaKey.startsWith("sb_publishable_")) {
      supaKeyShape = "sb_publishable_ ✓ (new format)";
      supaKeyPrefix = "sb_publishable_";
    } else if (supaKey.startsWith("sb_secret_")) {
      // Should never appear client-side; flag loudly.
      supaKeyShape = "sb_secret_ ✗ SECRET KEY IN CLIENT";
      supaKeyPrefix = "sb_secret_";
    } else if (supaKey.startsWith("eyJ")) {
      supaKeyShape = "legacy JWT ✗ (disabled by Supabase)";
      supaKeyPrefix = "eyJ…";
    } else {
      supaKeyShape = "unknown format";
      supaKeyPrefix = "(unrecognised)";
    }
  }

  const lastEvent = [...entries].reverse().find((e) => e.scope.startsWith("event:"));
  const lastGuard = [...entries].reverse().find((e) => e.scope.startsWith("guard:"));

  const row = (label: string, value: unknown) => (
    <div className="flex gap-2 leading-snug">
      <span className="opacity-50 min-w-[140px]">{label}</span>
      <span className="font-mono break-all">{String(value)}</span>
    </div>
  );

  const clientBuildTime = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "(unknown)";
  const clientBuildCommit = typeof __BUILD_COMMIT__ !== "undefined" ? __BUILD_COMMIT__ : "(unknown)";



  const viteEnv = (import.meta as any).env ?? {};
  const viteMode: string = viteEnv.MODE ?? "(unknown)";
  const isDev: boolean = !!viteEnv.DEV;
  const isProd: boolean = !!viteEnv.PROD;
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const environment =
    host === "localhost" || host === "127.0.0.1"
      ? "local"
      : host.includes("id-preview--") || host.endsWith(".lovable.app")
        ? host.includes("id-preview--")
          ? "lovable-preview"
          : "lovable-published"
        : host.endsWith("peninsulaequine.systems")
          ? "production"
          : "custom";
  let region = "(unknown)";
  try {
    region = Intl.DateTimeFormat().resolvedOptions().timeZone || "(unknown)";
  } catch {
    /* ignore */
  }
  const language = typeof navigator !== "undefined" ? navigator.language : "(unknown)";

  const buildDiagnosticPayload = () => {
    const capturedAt = new Date().toISOString();
    const serverFetchedAt = health?.checkedAt ?? null;
    const serverOk = !!serverBuild && !serverBuild.error;
    return {
      capturedAt,
      url: window.location.href,
      host,
      environment,
      client: {
        capturedAt,
        bundleHash: bundleHash,
        clientBuildTime: clientBuildTime,
        clientBuildCommit: clientBuildCommit,
        viteMode,
        viteDev: isDev,
        viteProd: isProd,
        region,
        language,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "(unknown)",
        supabaseUrl: supaUrl ?? null,
        supabaseUrlValid: supaUrlValid,
        supabaseKey: {
          present: !!supaKey,
          shape: supaKeyShape,
          prefix: supaKeyPrefix,
          length: supaKeyLen,
          expected: "sb_publishable_",
          isLegacyJwt: !!supaKey && supaKey.startsWith("eyJ"),
        },
      },
      server: {
        fetchedAt: serverFetchedAt,
        reachable: serverOk,
        httpStatus: serverBuild?.status ?? null,
        error: serverBuild?.error ?? null,
        serverBundleHash: serverOk ? (serverBuild?.bundleHash ?? null) : null,
        serverBuildTime: serverOk ? (serverBuild?.buildTime ?? null) : null,
        serverBuildCommit: serverOk ? (serverBuild?.buildCommit ?? null) : null,
      },
      diag: {
        fetchedAt: diag?.fetchedAt ?? null,
        httpStatus: diag?.httpStatus ?? null,
        reachable: !!diag && !diag.error,
        error: diag?.error ?? null,
        latencyMs: diag?.latencyMs ?? null,
        service: diag?.service ?? null,
        checkedAt: diag?.checkedAt ?? null,
        buildInfo: diag?.buildInfo ?? null,
        supabase: diag?.supabase ?? null,
      },
      timings: {
        unit: "ms",
        source: "client (performance.now)",
        buildInfo: {
          fetchedAt: serverBuild?.fetchedAt ?? null,
          latencyMs: serverBuild?.latencyMs ?? null,
          httpStatus: serverBuild?.status ?? null,
          error: serverBuild?.error ?? null,
        },
        health: {
          fetchedAt: health?.fetchedAt ?? null,
          latencyMs: health?.latencyMs ?? null,
          httpStatus: health?.httpStatus ?? null,
          error: health?.error ?? null,
        },
        edgeProbe: {
          checkedAt: cacheCheckedAt ? new Date(cacheCheckedAt).toISOString() : null,
          documentLatencyMs: cacheHeaders?.["document.latencyMs"]
            ? Number(cacheHeaders["document.latencyMs"])
            : null,
          bundleLatencyMs: cacheHeaders?.["bundle.latencyMs"]
            ? Number(cacheHeaders["bundle.latencyMs"])
            : null,
        },
      },
      comparison: {
        bundleHashMatch: serverOk ? serverBuild?.bundleHash === bundleHash : null,
        clientBundleHash: bundleHash,
        serverBundleHash: serverOk ? (serverBuild?.bundleHash ?? null) : null,
      },
    };
  };

  const copyBuildInfo = async () => {
    const pretty = JSON.stringify(buildDiagnosticPayload(), null, 2);
    try {
      await navigator.clipboard.writeText(pretty);
      setCopied("copied ✓");
    } catch {
      setCopied("copy failed — select & copy below");
    }
    setTimeout(() => setCopied(null), 2500);
  };

  const [downloaded, setDownloaded] = useState<string | null>(null);
  const downloadDiagnostics = () => {
    try {
      const payload = buildDiagnosticPayload();
      const pretty = JSON.stringify(payload, null, 2);
      const blob = new Blob([pretty], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const stamp = payload.capturedAt.replace(/[:.]/g, "-");
      const safeHost = (host || "unknown").replace(/[^a-z0-9.-]/gi, "_");
      const a = document.createElement("a");
      a.href = url;
      a.download = `diagnostics-${safeHost}-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloaded("saved ✓");
    } catch (e) {
      setDownloaded(`failed: ${String((e as Error)?.message ?? e)}`);
    }
    setTimeout(() => setDownloaded(null), 2500);
  };

  const [curlCopied, setCurlCopied] = useState<string | null>(null);
  const buildCurlSnippet = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://peninsulaequine.systems";
    const stamp = new Date().toISOString();
    const ua = `peninsula-diag/1.0 (${environment}; ${host})`;
    const lines = [
      `# Peninsula HQ diagnostics — captured ${stamp}`,
      `# origin: ${origin}`,
      `# route:  ${path}`,
      ``,
      `# 1. Build info (expected: JSON with buildTime, buildCommit, bundleHash)`,
      `curl -sS -D - -o /tmp/build-info.json \\`,
      `  -H 'Accept: application/json' \\`,
      `  -H 'Cache-Control: no-cache' \\`,
      `  -H 'User-Agent: ${ua}' \\`,
      `  '${origin}/api/build-info'`,
      ``,
      `# 2. Health (expected: JSON with status, service, checkedAt, buildInfo)`,
      `curl -sS -D - -o /tmp/health.json \\`,
      `  -H 'Accept: application/json' \\`,
      `  -H 'Cache-Control: no-cache' \\`,
      `  -H 'User-Agent: ${ua}' \\`,
      `  '${origin}/api/health'`,
      ``,
      `# 3. Document headers (expected: text/html, no-store on auth surfaces)`,
      `curl -sS -I \\`,
      `  -H 'User-Agent: ${ua}' \\`,
      `  '${origin}${path}'`,
      ``,
    ];
    return lines.join("\n");
  };
  const copyCurl = async () => {
    const snippet = buildCurlSnippet();
    try {
      await navigator.clipboard.writeText(snippet);
      setCurlCopied("copied ✓");
    } catch {
      setCurlCopied("copy failed");
    }
    setTimeout(() => setCurlCopied(null), 2500);
  };




  const buildEnvSnapshot = () => ({
    capturedAt: new Date().toISOString(),
    label: "frontend env snapshot",
    origin: typeof window !== "undefined" ? window.location.origin : null,
    host,
    environment,
    viteMode,
    viteDev: isDev,
    viteProd: isProd,
    region,
    language,
    bundleHash,
    clientBuildTime,
    clientBuildCommit,
    supabase: {
      urlPresent: !!supaUrl,
      urlValid: supaUrlValid,
      keyPresent: !!supaKey,
      keyPrefix: supaKeyPrefix,
      keyShape: supaKeyShape,
      keyLength: supaKeyLen,
      keyExpectedPrefix: "sb_publishable_",
      keyIsLegacyJwt: !!supaKey && supaKey.startsWith("eyJ"),
    },
  });

  const [envCopied, setEnvCopied] = useState<string | null>(null);
  const copyEnvSnapshot = async () => {
    const pretty = JSON.stringify(buildEnvSnapshot(), null, 2);
    try {
      await navigator.clipboard.writeText(pretty);
      setEnvCopied("copied ✓");
    } catch {
      setEnvCopied("copy failed");
    }
    setTimeout(() => setEnvCopied(null), 2500);
  };

  const btn: React.CSSProperties = {
    background: "transparent",
    color: "#9aa4af",
    border: "1px solid #2a313a",
    padding: "2px 6px",
    cursor: "pointer",
    fontSize: 10,
  };




  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 2147483646,
        maxWidth: 460,
        maxHeight: "70vh",
        overflow: "auto",
        background: "rgba(10,12,16,0.96)",
        color: "#e6edf3",
        border: "1px solid #2a313a",
        borderRadius: 6,
        padding: "10px 12px",
        fontSize: 11,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <strong style={{ letterSpacing: "0.08em" }}>CLIENT DIAG</strong>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ background: "transparent", color: "#9aa4af", border: "1px solid #2a313a", padding: "2px 6px", cursor: "pointer", fontSize: 10 }}
        >
          {open ? "hide" : "show"}
        </button>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {row("url", window.location.href)}
          {row("route", path)}
          {row("environment", `${environment} · ${host}`)}
          {row("vite mode", `${viteMode}${isDev ? " (dev)" : isProd ? " (prod)" : ""}`)}
          {row("region/tz", `${region} · ${language}`)}

          <div
            style={{
              marginTop: 4,
              marginBottom: 4,
              padding: "6px 8px",
              border: "1px solid #2a313a",
              borderRadius: 4,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ opacity: 0.6, letterSpacing: "0.06em" }}>FRONTEND ENV SNAPSHOT</span>
              <button
                onClick={copyEnvSnapshot}
                style={btn}
                title="Copy environment + Supabase key prefix as JSON (no secret values)"
              >
                {envCopied ?? "copy env"}
              </button>
            </div>
            {row("environment", environment)}
            {row("vite mode", `${viteMode}${isDev ? " (dev)" : isProd ? " (prod)" : ""}`)}
            {row("region", region)}
            {row("supabase key prefix", supaKeyPrefix)}
            <div style={{ opacity: 0.5, marginTop: 2, fontSize: 10 }}>
              Safe to paste into support tickets — key prefix only, never the secret.
            </div>
          </div>


          <div
            style={{
              marginTop: 4,
              marginBottom: 4,
              padding: "6px 8px",
              border: "1px solid #2a313a",
              borderRadius: 4,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ opacity: 0.6, letterSpacing: "0.06em" }}>
                BUILD INFO
                {lastRefreshAt && (
                  <span style={{ opacity: 0.5, marginLeft: 6 }}>
                    · refreshed {new Date(lastRefreshAt).toISOString().slice(11, 19)}
                  </span>
                )}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setAutoRefresh((v) => !v)}
                  style={{ ...btn, color: autoRefresh ? "#7fbf7f" : "#9aa4af" }}
                  title={`Auto-refresh every ${POLL_MS / 1000}s (pauses when tab hidden)`}
                >
                  {autoRefresh ? `auto ${POLL_MS / 1000}s ✓` : "auto off"}
                </button>
                <button
                  onClick={async () => {
                    setProbing(true);
                    try {
                      await Promise.all([fetchBuildInfo(), fetchHealth(), fetchDiag(), probeCache()]);
                      const now = Date.now();
                      setLastRefreshAt(now);
                      setLastProbeAt(now);
                    } finally {
                      setProbing(false);
                    }
                  }}
                  style={{ ...btn, color: probing ? "#eab308" : "#7fbf7f" }}
                  disabled={probing}
                  title="Re-run /api/build-info, /api/health, /api/diag, and edge cache probe now"
                >
                  {probing ? "probing…" : lastProbeAt ? `probe now ✓ ${new Date(lastProbeAt).toISOString().slice(11, 19)}` : "probe now"}
                </button>
                <button
                  onClick={refreshBuildInfo}
                  style={btn}
                  disabled={refreshing}
                  title="Re-fetch /api/build-info and /api/health"
                >
                  {refreshing ? "refreshing…" : "refresh"}
                </button>

                <button onClick={copyBuildInfo} style={btn} title="Copy build info JSON">
                  {copied ?? "copy"}
                </button>
                <button onClick={downloadDiagnostics} style={btn} title="Download diagnostics as .json">
                  {downloaded ?? "download"}
                </button>
                <button onClick={copyCurl} style={btn} title="Copy curl commands for /api/build-info, /api/health and current page headers">
                  {curlCopied ?? "copy curl"}
                </button>

              </div>

            </div>

            {row("client bundle", bundleHash)}
            {row("client buildTime", clientBuildTime)}
            {row("client buildCommit", clientBuildCommit.slice(0, 12))}
            {serverBuild === null ? (
              row("server", "loading…")
            ) : serverBuild.error ? (
              <>
                {row("server", `error ${serverBuild.status ?? ""} ${serverBuild.error}`.trim())}
                {row("/api/build-info ms", serverBuild.latencyMs ?? "—")}
                {row("hint", "/api/build-info unreachable — check rewrite & cache")}
              </>
            ) : (
              <>
                {row("server bundle", serverBuild.bundleHash ?? "(unknown)")}
                {row("server buildTime", serverBuild.buildTime ?? "(unknown)")}
                {row("server buildCommit", (serverBuild.buildCommit ?? "(unknown)").slice(0, 12))}
                {row("/api/build-info ms", serverBuild.latencyMs ?? "—")}
                {(() => {
                  const fields: Array<{ label: string; expected: string; actual: string }> = [
                    { label: "bundleHash", expected: bundleHash, actual: serverBuild.bundleHash ?? "(unknown)" },
                    { label: "buildTime", expected: clientBuildTime, actual: serverBuild.buildTime ?? "(unknown)" },
                    { label: "buildCommit", expected: clientBuildCommit, actual: serverBuild.buildCommit ?? "(unknown)" },
                  ];
                  const diffs = fields.filter((f) => f.expected !== f.actual);
                  if (diffs.length === 0) {
                    return row("match", "✓ client = server");
                  }
                  return (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "6px 8px",
                        border: "1px solid #5a2a2a",
                        borderRadius: 4,
                        background: "rgba(255, 60, 60, 0.06)",
                      }}
                    >
                      <div style={{ color: "#ff8a8a", marginBottom: 4, letterSpacing: "0.06em" }}>
                        ✗ MISMATCH ({diffs.length} field{diffs.length > 1 ? "s" : ""})
                      </div>
                      {diffs.map((f) => (
                        <div key={f.label} style={{ marginBottom: 4 }}>
                          <div style={{ opacity: 0.7 }}>{f.label}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                            <span style={{ color: "#7fbf7f", minWidth: 56 }}>expected</span>
                            <code style={{ color: "#cfead0", wordBreak: "break-all" }}>{f.expected || "(empty)"}</code>
                          </div>
                          <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                            <span style={{ color: "#ff9a9a", minWidth: 56 }}>actual</span>
                            <code style={{ color: "#ffd4d4", wordBreak: "break-all" }}>{f.actual || "(empty)"}</code>
                          </div>
                        </div>
                      ))}
                      <div style={{ opacity: 0.6, marginTop: 2 }}>
                        edge serving stale bundle — purge cache / re-promote
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

          </div>

          {row(
            "health",
            health === null
              ? "fetching…"
              : health.error
                ? `error: ${health.error}`
                : `${health.status ?? "?"} · ${health.service ?? "?"} · ${health.checkedAt ?? "?"}`,
          )}
          {row("/api/health ms", health?.latencyMs ?? "—")}
          {row("supabase url", supaUrl || "(missing)")}
          {row("supabase url valid", supaUrlValid ? "yes" : "no")}
          {(() => {
            const family =
              !supaKey
                ? "missing"
                : supaKey.startsWith("sb_publishable_")
                  ? "new"
                  : supaKey.startsWith("sb_secret_")
                    ? "secret"
                    : supaKey.startsWith("eyJ")
                      ? "legacy"
                      : "unknown";
            const ok = family === "new";
            const palette =
              family === "new"
                ? { bg: "rgba(34,197,94,0.08)", border: "#22c55e", fg: "#86efac", label: "OK", msg: "sb_publishable_ ✓ matches expected format" }
                : family === "legacy"
                  ? { bg: "rgba(239,68,68,0.10)", border: "#ef4444", fg: "#fca5a5", label: "MISMATCH", msg: "Legacy JWT (eyJ…) — Supabase disabled this key family. Sign-in will fail. Expected sb_publishable_*." }
                  : family === "secret"
                    ? { bg: "rgba(239,68,68,0.18)", border: "#ef4444", fg: "#fecaca", label: "DANGER", msg: "sb_secret_* is a SERVER key. It must never ship to the client. Replace with sb_publishable_*." }
                    : family === "missing"
                      ? { bg: "rgba(239,68,68,0.10)", border: "#ef4444", fg: "#fca5a5", label: "MISSING", msg: "VITE_SUPABASE_PUBLISHABLE_KEY is not defined in the build." }
                      : { bg: "rgba(234,179,8,0.10)", border: "#eab308", fg: "#fde68a", label: "UNKNOWN", msg: "Key prefix is not recognised. Expected sb_publishable_*." };
            return (
              <div
                style={{
                  marginTop: 4,
                  marginBottom: 4,
                  padding: "6px 8px",
                  border: `1px solid ${palette.border}`,
                  borderRadius: 4,
                  background: palette.bg,
                  color: palette.fg,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ letterSpacing: "0.06em", fontWeight: 600 }}>SUPABASE KEY · {palette.label}</span>
                  <span style={{ opacity: 0.8, fontSize: 10 }}>family: {family}</span>
                </div>
                <div style={{ marginBottom: 4, lineHeight: 1.35 }}>{palette.msg}</div>
                {row("prefix", supaKeyPrefix)}
                {row("length", supaKeyLen || "—")}
                {row("expected", "sb_publishable_*")}
                {!ok && row("action", "Rotate via Lovable Cloud → API keys, then republish")}
              </div>
            );
          })()}

          {(() => {
            if (diag === null) return row("/api/diag", "fetching…");
            if (diag.error)
              return (
                <>
                  {row("/api/diag", `error: ${diag.error}`)}
                  {row("/api/diag ms", diag.latencyMs ?? "—")}
                </>
              );
            const serverKey = diag.supabase?.key;
            const serverFamily = serverKey?.family ?? "(unknown)";
            const clientFamily =
              !supaKey
                ? "missing"
                : supaKey.startsWith("sb_publishable_")
                  ? "sb_publishable"
                  : supaKey.startsWith("sb_secret_")
                    ? "sb_secret"
                    : supaKey.startsWith("eyJ")
                      ? "legacy_jwt"
                      : "unknown";
            const familyMatch = serverFamily === clientFamily;
            const prefixMatch = (serverKey?.prefix ?? "") === supaKeyPrefix;
            const lengthMatch = (serverKey?.length ?? -1) === supaKeyLen;
            const allMatch = familyMatch && prefixMatch && lengthMatch;
            return (
              <>
                {row(
                  "/api/diag",
                  `${diag.httpStatus ?? "?"} · ${diag.service ?? "?"} · ${diag.checkedAt ?? "?"}`,
                )}
                {row("/api/diag ms", diag.latencyMs ?? "—")}
                {row("server supabase host", diag.supabase?.urlHost ?? "(unknown)")}
                {row("server key family", serverFamily)}
                {row("server key prefix", serverKey?.prefix ?? "—")}
                {row("server key length", serverKey?.length ?? "—")}
                {row("client/server match", allMatch ? "✓ identical" : "✗ differs (see below)")}
                {!allMatch && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "6px 8px",
                      border: "1px solid #5a2a2a",
                      borderRadius: 4,
                      background: "rgba(255, 60, 60, 0.06)",
                      color: "#ffd4d4",
                    }}
                  >
                    <div style={{ color: "#ff8a8a", marginBottom: 4, letterSpacing: "0.06em" }}>
                      KEY DRIFT — bundle vs /api/diag
                    </div>
                    {!familyMatch && row("family", `client ${clientFamily} ≠ server ${serverFamily}`)}
                    {!prefixMatch && row("prefix", `client ${supaKeyPrefix} ≠ server ${serverKey?.prefix ?? "—"}`)}
                    {!lengthMatch && row("length", `client ${supaKeyLen} ≠ server ${serverKey?.length ?? "—"}`)}
                    <div style={{ opacity: 0.6, marginTop: 2 }}>
                      Bundle and /api/diag are emitted from the same build — drift indicates a stale edge.
                    </div>
                  </div>
                )}
              </>
            );
          })()}


          {row("auth ready", ready ? "yes" : "no")}
          {row("authLoading", authLoading ? "true" : "false")}
          {row("rolesLoading", rolesLoading ? "true" : "false")}
          {row("session", user ? "yes" : "no")}
          {row("user.id", user?.id ?? "—")}
          {row("user.email", user?.email ?? "—")}
          {row("roles", roles.length ? roles.join(",") : "(none)")}
          {row("rolesError", rolesError ?? "—")}
          {row("last event", lastEvent ? `${lastEvent.scope} ${JSON.stringify(lastEvent.payload)}` : "—")}
          {row("last guard", lastGuard ? `${lastGuard.scope} ${JSON.stringify(lastGuard.payload)}` : "—")}
          {row("last client error", lastError ?? "—")}
          <details style={{ marginTop: 6 }} open>
            <summary style={{ cursor: "pointer", opacity: 0.7 }}>
              edge cache headers{cacheCheckedAt ? ` (checked ${new Date(cacheCheckedAt).toISOString().slice(11, 19)}Z)` : ""}
            </summary>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6 }}>
              {cacheError && row("probe error", cacheError)}
              {!cacheHeaders && !cacheError && row("status", "probing…")}
              {cacheHeaders &&
                Object.keys(cacheHeaders)
                  .sort()
                  .map((k) => row(k, cacheHeaders[k] ?? "—"))}
              <button
                onClick={() => void probeCache()}
                style={{
                  marginTop: 6,
                  alignSelf: "flex-start",
                  background: "transparent",
                  color: "#9aa4af",
                  border: "1px solid #2a313a",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: 10,
                }}
              >
                re-probe
              </button>
            </div>
          </details>
          <details style={{ marginTop: 6 }}>
            <summary style={{ cursor: "pointer", opacity: 0.7 }}>auth log buffer ({entries.length})</summary>
            <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0", fontSize: 10, opacity: 0.85 }}>
              {entries
                .slice(-25)
                .map((e) => `${new Date(e.ts).toISOString().slice(11, 23)} ${e.scope} ${JSON.stringify(e.payload)}`)
                .join("\n")}
            </pre>
          </details>
          <div style={{ marginTop: 6, opacity: 0.5, fontSize: 10 }}>
            Toggle off: remove <code>?debug=1</code> from URL, or run{" "}
            <code>localStorage.removeItem('LOVABLE_CLIENT_DIAG')</code>.
          </div>
        </div>
      )}
    </div>
  );
}
