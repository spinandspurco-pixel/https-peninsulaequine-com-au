import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
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

  const [healthHistory, setHealthHistory] = useState<number[]>([]);
  const [diagHistory, setDiagHistory] = useState<number[]>([]);
  const [buildHistory, setBuildHistory] = useState<number[]>([]);
  const [docCacheHistory, setDocCacheHistory] = useState<number[]>([]);
  const [bundleCacheHistory, setBundleCacheHistory] = useState<number[]>([]);
  const HISTORY_MAX = 10;

  // Unified probe history — last N entries across all endpoints, so users
  // can compare latency and payload hash over time.
  type ProbeEntry = {
    id: string;
    endpoint: "build-info" | "health" | "diag";
    fetchedAt: string;
    latencyMs: number;
    ok: boolean;
    httpStatus?: number;
    error?: string;
    payloadHash?: string;
    bytes?: number;
  };
  const PROBE_HISTORY_MAX = 20;
  const [probeHistory, setProbeHistory] = useState<ProbeEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("pe.diag.probeHistory");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-PROBE_HISTORY_MAX) : [];
    } catch {
      return [];
    }
  });
  const pushProbe = useCallback((entry: Omit<ProbeEntry, "id">) => {
    setProbeHistory((prev) => {
      const next = [
        ...prev,
        { ...entry, id: `${entry.fetchedAt}-${entry.endpoint}-${Math.random().toString(36).slice(2, 7)}` },
      ].slice(-PROBE_HISTORY_MAX);
      try {
        window.localStorage.setItem("pe.diag.probeHistory", JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      return next;
    });
  }, []);

  // Short deterministic hash of a payload string (FNV-1a 32-bit, hex).
  const hashPayload = (text: string): string => {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  };

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
      const text = await r.text();
      const payloadHash = hashPayload(text);
      if (!r.ok) {
        setServerBuild({ error: `HTTP ${r.status}`, status: r.status, latencyMs, fetchedAt });
        pushProbe({
          endpoint: "build-info",
          fetchedAt,
          latencyMs,
          ok: false,
          httpStatus: r.status,
          error: `HTTP ${r.status}`,
          payloadHash,
          bytes: text.length,
        });
        return;
      }
      const j = JSON.parse(text) as BuildInfo;
      setServerBuild({
        buildTime: j.buildTime,
        buildCommit: j.buildCommit,
        bundleHash: j.bundleHash,
        status: r.status,
        latencyMs,
        fetchedAt,
      });
      pushProbe({
        endpoint: "build-info",
        fetchedAt,
        latencyMs,
        ok: true,
        httpStatus: r.status,
        payloadHash,
        bytes: text.length,
      });
    } catch (e) {
      const latencyMs = stop();
      const message = String((e as Error)?.message ?? e);
      setServerBuild({ error: message, latencyMs, fetchedAt });
      pushProbe({ endpoint: "build-info", fetchedAt, latencyMs, ok: false, error: message });
    }
  }, [pushProbe]);

  const fetchHealth = useCallback(async () => {
    const stop = measure();
    const fetchedAt = new Date().toISOString();
    try {
      const r = await fetch("/api/health", { cache: "no-store", credentials: "omit" });
      const latencyMs = stop();
      const text = await r.text();
      const payloadHash = hashPayload(text);
      if (!r.ok) {
        setHealth({ error: `HTTP ${r.status}`, httpStatus: r.status, latencyMs, fetchedAt });
        pushProbe({
          endpoint: "health",
          fetchedAt,
          latencyMs,
          ok: false,
          httpStatus: r.status,
          error: `HTTP ${r.status}`,
          payloadHash,
          bytes: text.length,
        });
        return;
      }
      const j = JSON.parse(text) as HealthResponse;
      setHealth({
        status: j.status,
        service: j.service,
        checkedAt: j.checkedAt,
        bundleHash: j?.buildInfo?.bundleHash ?? null,
        httpStatus: r.status,
        latencyMs,
        fetchedAt,
      });
      pushProbe({
        endpoint: "health",
        fetchedAt,
        latencyMs,
        ok: true,
        httpStatus: r.status,
        payloadHash,
        bytes: text.length,
      });
    } catch (e) {
      const latencyMs = stop();
      const message = String((e as Error)?.message ?? e);
      setHealth({ error: message, latencyMs, fetchedAt });
      pushProbe({ endpoint: "health", fetchedAt, latencyMs, ok: false, error: message });
    }
  }, [pushProbe]);

  const fetchDiag = useCallback(async () => {
    const stop = measure();
    const fetchedAt = new Date().toISOString();
    try {
      const r = await fetch("/api/diag", { cache: "no-store", credentials: "omit" });
      const latencyMs = stop();
      const text = await r.text();
      const payloadHash = hashPayload(text);
      if (!r.ok) {
        setDiag({ error: `HTTP ${r.status}`, httpStatus: r.status, latencyMs, fetchedAt });
        pushProbe({
          endpoint: "diag",
          fetchedAt,
          latencyMs,
          ok: false,
          httpStatus: r.status,
          error: `HTTP ${r.status}`,
          payloadHash,
          bytes: text.length,
        });
        return;
      }
      const j = JSON.parse(text) as DiagResponse;
      setDiag({
        service: j.service,
        checkedAt: j.checkedAt,
        buildInfo: j.buildInfo,
        supabase: j.supabase,
        httpStatus: r.status,
        latencyMs,
        fetchedAt,
      });
      pushProbe({
        endpoint: "diag",
        fetchedAt,
        latencyMs,
        ok: true,
        httpStatus: r.status,
        payloadHash,
        bytes: text.length,
      });
    } catch (e) {
      const latencyMs = stop();
      const message = String((e as Error)?.message ?? e);
      setDiag({ error: message, latencyMs, fetchedAt });
      pushProbe({ endpoint: "diag", fetchedAt, latencyMs, ok: false, error: message });
    }
  }, [pushProbe]);

  const lastBuildStamp = serverBuild?.fetchedAt ?? null;
  const lastHealthStamp = health?.fetchedAt ?? null;
  const lastDiagStamp = diag?.fetchedAt ?? null;
  useEffect(() => {
    const ms = serverBuild?.latencyMs;
    if (typeof ms === "number" && isFinite(ms)) {
      setBuildHistory((h) => [...h, ms].slice(-HISTORY_MAX));
    }
  }, [lastBuildStamp, serverBuild?.latencyMs]);
  useEffect(() => {
    const ms = health?.latencyMs;
    if (typeof ms === "number" && isFinite(ms)) {
      setHealthHistory((h) => [...h, ms].slice(-HISTORY_MAX));
    }
  }, [lastHealthStamp, health?.latencyMs]);
  useEffect(() => {
    const ms = diag?.latencyMs;
    if (typeof ms === "number" && isFinite(ms)) {
      setDiagHistory((h) => [...h, ms].slice(-HISTORY_MAX));
    }
  }, [lastDiagStamp, diag?.latencyMs]);

  // Track the most recent error cause per endpoint so we can surface it
  // next to the latency row even after a subsequent probe recovers.
  type LastErr = { message: string; httpStatus?: number; at: string } | null;
  const [buildLastErr, setBuildLastErr] = useState<LastErr>(null);
  const [healthLastErr, setHealthLastErr] = useState<LastErr>(null);
  const [diagLastErr, setDiagLastErr] = useState<LastErr>(null);
  useEffect(() => {
    if (serverBuild?.error && serverBuild.fetchedAt) {
      setBuildLastErr({ message: serverBuild.error, httpStatus: serverBuild.status, at: serverBuild.fetchedAt });
    }
  }, [serverBuild?.error, serverBuild?.status, serverBuild?.fetchedAt]);
  useEffect(() => {
    if (health?.error && health.fetchedAt) {
      setHealthLastErr({ message: health.error, httpStatus: health.httpStatus, at: health.fetchedAt });
    }
  }, [health?.error, health?.httpStatus, health?.fetchedAt]);
  useEffect(() => {
    if (diag?.error && diag.fetchedAt) {
      setDiagLastErr({ message: diag.error, httpStatus: diag.httpStatus, at: diag.fetchedAt });
    }
  }, [diag?.error, diag?.httpStatus, diag?.fetchedAt]);

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

  // Auto-probe interval in seconds; 0 = off. Persisted in localStorage.
  const POLL_OPTIONS = [0, 5, 10, 30, 60] as const;
  const [pollSeconds, setPollSeconds] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const raw = window.localStorage.getItem("pe.diag.pollSeconds");
    const n = raw == null ? 10 : Number(raw);
    return POLL_OPTIONS.includes(n as typeof POLL_OPTIONS[number]) ? n : 10;
  });
  useEffect(() => {
    try {
      window.localStorage.setItem("pe.diag.pollSeconds", String(pollSeconds));
    } catch {
      /* ignore */
    }
  }, [pollSeconds]);
  const cyclePollSeconds = () => {
    const idx = POLL_OPTIONS.indexOf(pollSeconds as typeof POLL_OPTIONS[number]);
    const next = POLL_OPTIONS[(idx + 1) % POLL_OPTIONS.length];
    setPollSeconds(next);
  };

  useEffect(() => {
    if (!pollSeconds) return;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      await Promise.all([fetchBuildInfo(), fetchHealth(), fetchDiag()]);
      setLastRefreshAt(Date.now());
    };
    const id = window.setInterval(() => {
      void tick();
    }, pollSeconds * 1000);
    return () => window.clearInterval(id);
  }, [pollSeconds, fetchBuildInfo, fetchHealth, fetchDiag]);




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
      const docMs = Number(out["document.latencyMs"]);
      if (Number.isFinite(docMs)) {
        setDocCacheHistory((prev) => [...prev, docMs].slice(-HISTORY_MAX));
      }
      const bundleMs = Number(out["bundle.latencyMs"]);
      if (Number.isFinite(bundleMs)) {
        setBundleCacheHistory((prev) => [...prev, bundleMs].slice(-HISTORY_MAX));
      }
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
  let supaKeyChecksum = "—";
  let supaKeyMasked = "—";
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
    // Non-cryptographic djb2 checksum → 4 hex chars. Sufficient to detect
    // "same key across environments" without exposing key material. Never
    // reversible to the original secret.
    let h = 5381;
    for (let i = 0; i < supaKey.length; i++) {
      h = ((h << 5) + h + supaKey.charCodeAt(i)) & 0xffffffff;
    }
    supaKeyChecksum = (h >>> 0).toString(16).padStart(8, "0").slice(-4);
    // Masked representation: prefix + bullets + checksum. Never render supaKey directly.
    const prefixForMask = supaKeyPrefix === "(unrecognised)" ? "" : supaKeyPrefix.replace("…", "");
    supaKeyMasked = `${prefixForMask}${"•".repeat(6)}…(chk:${supaKeyChecksum})`;
  }

  const lastEvent = [...entries].reverse().find((e) => e.scope.startsWith("event:"));
  const lastGuard = [...entries].reverse().find((e) => e.scope.startsWith("guard:"));

  const row = (label: string, value: unknown) => (
    <div className="flex gap-2 leading-snug">
      <span className="opacity-50 min-w-[140px]">{label}</span>
      <span className="font-mono break-all">{String(value)}</span>
    </div>
  );

  // Configurable latency thresholds (ms). Persisted in localStorage.
  // Shape supports a shared `default` plus optional per-endpoint overrides
  // for /api/build-info, /api/health, /api/diag so each can be fine-tuned.
  type ThresholdPair = { warn: number; crit: number };
  type EndpointKey = "buildInfo" | "health" | "diag";
  type LatencyThresholds = { default: ThresholdPair } & Partial<Record<EndpointKey, ThresholdPair>>;
  const DEFAULT_PAIR: ThresholdPair = { warn: 200, crit: 500 };
  const readThresholds = (): LatencyThresholds => {
    try {
      const raw = window.localStorage.getItem("LOVABLE_DIAG_LATENCY");
      if (raw) {
        const p = JSON.parse(raw);
        // Migrate legacy shape { warn, crit } → { default: { warn, crit } }
        if (typeof p?.warn === "number" && typeof p?.crit === "number") {
          return { default: { warn: p.warn, crit: p.crit } };
        }
        if (p?.default && typeof p.default.warn === "number" && typeof p.default.crit === "number") {
          return p as LatencyThresholds;
        }
      }
    } catch {
      /* ignore */
    }
    return { default: { ...DEFAULT_PAIR } };
  };
  const [latencyThresholds, setLatencyThresholds] = useState<LatencyThresholds>(readThresholds);
  const persistThresholds = (next: LatencyThresholds) => {
    setLatencyThresholds(next);
    try {
      window.localStorage.setItem("LOVABLE_DIAG_LATENCY", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };
  const pairFor = (endpoint?: EndpointKey): ThresholdPair =>
    (endpoint && latencyThresholds[endpoint]) || latencyThresholds.default;
  const setEndpointPair = (endpoint: EndpointKey, pair: ThresholdPair | null) => {
    const next: LatencyThresholds = { ...latencyThresholds };
    if (pair === null) {
      delete next[endpoint];
    } else {
      next[endpoint] = pair;
    }
    persistThresholds(next);
  };
  const latencyColor = (ms: number | null | undefined, endpoint?: EndpointKey): string | undefined => {
    if (typeof ms !== "number" || !isFinite(ms)) return undefined;
    const p = pairFor(endpoint);
    if (ms >= p.crit) return "#ff8a8a";
    if (ms >= p.warn) return "#fde68a";
    return "#86efac";
  };

  // Optional: when any endpoint's latest latency is at or above its crit
  // threshold (or has a current error), automatically re-run /api/health
  // and /api/diag. Debounced to avoid tight re-probe loops.
  const [critAutoProbe, setCritAutoProbe] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pe.diag.critAutoProbe") === "1";
  });
  useEffect(() => {
    try {
      window.localStorage.setItem("pe.diag.critAutoProbe", critAutoProbe ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [critAutoProbe]);
  const [lastCritReprobeAt, setLastCritReprobeAt] = useState<number | null>(null);
  const [lastCritReason, setLastCritReason] = useState<string | null>(null);
  useEffect(() => {
    if (!critAutoProbe) return;
    const CRIT_COOLDOWN_MS = 5000;
    const now = Date.now();
    if (lastCritReprobeAt && now - lastCritReprobeAt < CRIT_COOLDOWN_MS) return;
    const offenders: string[] = [];
    const check = (endpoint: EndpointKey, label: string, ms?: number | null, err?: string | null) => {
      if (err) {
        offenders.push(`${label} error`);
        return;
      }
      if (typeof ms === "number" && isFinite(ms) && ms >= pairFor(endpoint).crit) {
        offenders.push(`${label} ${ms}ms ≥ ${pairFor(endpoint).crit}ms`);
      }
    };
    check("buildInfo", "/api/build-info", serverBuild?.latencyMs, serverBuild?.error);
    check("health", "/api/health", health?.latencyMs, health?.error);
    check("diag", "/api/diag", diag?.latencyMs, diag?.error);
    if (offenders.length === 0) return;
    setLastCritReprobeAt(now);
    setLastCritReason(offenders.join(" · "));
    void Promise.all([fetchHealth(), fetchDiag()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    critAutoProbe,
    serverBuild?.latencyMs,
    serverBuild?.fetchedAt,
    serverBuild?.error,
    health?.latencyMs,
    health?.fetchedAt,
    health?.error,
    diag?.latencyMs,
    diag?.fetchedAt,
    diag?.error,
  ]);

  // Optional latency-threshold toast notifications for /api/health and /api/diag.
  // Fires when the tier transitions upward (ok→warn, ok→crit, warn→crit) or on
  // a new error. Also fires a "recovered" toast when the endpoint returns to ok.
  const [latencyToasts, setLatencyToasts] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pe.diag.latencyToasts") === "1";
  });
  useEffect(() => {
    try {
      window.localStorage.setItem("pe.diag.latencyToasts", latencyToasts ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [latencyToasts]);
  const lastToastTierRef = useRef<Record<EndpointKey, "ok" | "warn" | "crit" | "error" | "none">>({
    buildInfo: "none",
    health: "none",
    diag: "none",
  });
  useEffect(() => {
    if (!latencyToasts) return;
    const evaluate = (
      endpoint: EndpointKey,
      label: string,
      ms?: number | null,
      err?: string | null,
    ) => {
      const pair = pairFor(endpoint);
      const prev = lastToastTierRef.current[endpoint];
      let next: "ok" | "warn" | "crit" | "error" | "none" = "none";
      if (err) next = "error";
      else if (typeof ms === "number" && isFinite(ms)) {
        next = ms >= pair.crit ? "crit" : ms >= pair.warn ? "warn" : "ok";
      } else return;
      if (next === prev) return;
      lastToastTierRef.current[endpoint] = next;
      if (prev === "none") return; // seed only on first sample; no toast
      const msg = err
        ? `${label} error: ${err.length > 80 ? err.slice(0, 80) + "…" : err}`
        : `${label} ${ms}ms (warn ≥ ${pair.warn}ms · crit ≥ ${pair.crit}ms)`;
      if (next === "crit" || next === "error") toast.error(msg);
      else if (next === "warn") toast.warning(msg);
      else if (next === "ok" && (prev === "warn" || prev === "crit" || prev === "error"))
        toast.success(`${label} recovered · ${ms}ms`);
    };
    evaluate("health", "/api/health", health?.latencyMs, health?.error);
    evaluate("diag", "/api/diag", diag?.latencyMs, diag?.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    latencyToasts,
    health?.latencyMs,
    health?.fetchedAt,
    health?.error,
    diag?.latencyMs,
    diag?.fetchedAt,
    diag?.error,
  ]);


  const sparkline = (points: number[]) => {
    if (!points || points.length < 2) return null;
    const w = 60;
    const h = 14;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const step = w / (points.length - 1);
    const path = points
      .map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const last = points[points.length - 1];
    const stroke = latencyColor(last) ?? "currentColor";
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ opacity: 0.85 }}
        aria-label={`last ${points.length} latencies: ${points.join(", ")} ms`}
      >
        <path d={path} fill="none" stroke={stroke} strokeWidth={1} />
      </svg>
    );
  };
  const latencyRow = (
    label: string,
    ms: number | null | undefined,
    history?: number[],
    opts?: {
      currentError?: { message: string; httpStatus?: number } | null;
      lastError?: LastErr;
      endpoint?: EndpointKey;
    },
  ) => {
    const endpoint = opts?.endpoint;
    const pair = pairFor(endpoint);
    const color = latencyColor(ms, endpoint);
    const display = typeof ms === "number" && isFinite(ms) ? `${ms} ms` : "—";
    const tier =
      typeof ms === "number" && isFinite(ms)
        ? ms >= pair.crit
          ? " · slow"
          : ms >= pair.warn
            ? " · warn"
            : " · ok"
        : "";
    const points = history ?? [];
    const stats =
      points.length >= 2
        ? ` · min ${Math.min(...points)} / max ${Math.max(...points)} / n=${points.length}`
        : "";
    const cur = opts?.currentError ?? null;
    const last = opts?.lastError ?? null;
    const classification =
      typeof ms === "number" && isFinite(ms)
        ? ms >= pair.crit
          ? `crit (≥ ${pair.crit}ms)`
          : ms >= pair.warn
            ? `warn (≥ ${pair.warn}ms, < ${pair.crit}ms)`
            : `ok (< ${pair.warn}ms)`
        : "no sample yet";
    const sourceNote = endpoint
      ? latencyThresholds[endpoint]
        ? " · source: per-endpoint override"
        : " · source: default"
      : "";
    const tooltip =
      `${label}\n` +
      `current: ${display}\n` +
      `classification: ${classification}\n` +
      `warn ≥ ${pair.warn}ms · crit ≥ ${pair.crit}ms${sourceNote}`;
    return (
      <div className="leading-snug">
        <div className="flex gap-2 items-center" title={tooltip}>
          <span className="opacity-50 min-w-[140px]">{label}</span>
          <span className="font-mono break-all" style={color ? { color } : undefined} title={tooltip}>
            {display}
            {tier}
          </span>
          {points.length >= 2 ? (
            <>
              <span
                className="inline-flex items-center"
                title={`last ${points.length}: ${points.join(", ")} ms`}
              >
                {sparkline(points)}
              </span>
              <span className="opacity-40 font-mono text-[10px]">{stats}</span>
            </>
          ) : null}
          {cur ? (
            <span
              className="font-mono text-[10px]"
              style={{ color: "#ff8a8a" }}
              title={cur.message}
            >
              ✗ {cur.httpStatus ? `HTTP ${cur.httpStatus} · ` : ""}
              {cur.message.length > 60 ? cur.message.slice(0, 60) + "…" : cur.message}
            </span>
          ) : last ? (
            <span
              className="font-mono text-[10px] opacity-60"
              style={{ color: "#eab308" }}
              title={`${last.httpStatus ? `HTTP ${last.httpStatus} · ` : ""}${last.message} @ ${last.at}`}
            >
              ⚠ recovered · last error {last.at.slice(11, 19)}
            </span>
          ) : (
            <span className="font-mono text-[10px] opacity-40" style={{ color: "#7fbf7f" }}>
              ✓ ok
            </span>
          )}
        </div>
        {cur ? (
          <div
            className="font-mono text-[10px] mt-0.5"
            style={{ color: "#ff9a9a", paddingLeft: 148, wordBreak: "break-all" }}
          >
            cause: {cur.message}
          </div>
        ) : last ? (
          <div
            className="font-mono text-[10px] mt-0.5 opacity-60"
            style={{ paddingLeft: 148, wordBreak: "break-all" }}
          >
            last cause: {last.httpStatus ? `HTTP ${last.httpStatus} · ` : ""}
            {last.message}
          </div>
        ) : null}
      </div>
    );
  };




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
      latencyHistory: {
        buildInfo: buildHistory,
        health: healthHistory,
        diag: diagHistory,
        max: HISTORY_MAX,
      },
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
    const fmtMs = (ms: number | null | undefined) =>
      typeof ms === "number" && isFinite(ms) ? `${ms} ms` : "not measured";
    const tier = (ms: number | null | undefined, endpoint?: EndpointKey) => {
      if (typeof ms !== "number" || !isFinite(ms)) return "n/a";
      const p = pairFor(endpoint);
      if (ms >= p.crit) return `slow (≥ ${p.crit} ms)`;
      if (ms >= p.warn) return `warn (≥ ${p.warn} ms)`;
      return "ok";
    };
    const d = latencyThresholds.default;
    const fmtPair = (k: EndpointKey) => {
      const p = latencyThresholds[k];
      return p ? `warn ≥ ${p.warn} · crit ≥ ${p.crit}` : `inherit default`;
    };
    const lines = [
      `# Peninsula HQ diagnostics — captured ${stamp}`,
      `# origin: ${origin}`,
      `# route:  ${path}`,
      `# latency thresholds (default): warn ≥ ${d.warn} ms · crit ≥ ${d.crit} ms`,
      `#   /api/build-info override: ${fmtPair("buildInfo")}`,
      `#   /api/health override:     ${fmtPair("health")}`,
      `#   /api/diag override:       ${fmtPair("diag")}`,
      `# observed latencies (client-measured, performance.now):`,
      `#   /api/build-info: ${fmtMs(serverBuild?.latencyMs)} [${tier(serverBuild?.latencyMs, "buildInfo")}]  fetchedAt=${serverBuild?.fetchedAt ?? "—"}`,
      `#   /api/health:     ${fmtMs(health?.latencyMs)} [${tier(health?.latencyMs, "health")}]  fetchedAt=${health?.fetchedAt ?? "—"}`,
      `#   /api/diag:       ${fmtMs(diag?.latencyMs)} [${tier(diag?.latencyMs, "diag")}]  fetchedAt=${diag?.fetchedAt ?? "—"}`,
      `#   document probe:  ${fmtMs(cacheHeaders?.["document.latencyMs"] ? Number(cacheHeaders["document.latencyMs"]) : null)}`,
      `#   bundle probe:    ${fmtMs(cacheHeaders?.["bundle.latencyMs"] ? Number(cacheHeaders["bundle.latencyMs"]) : null)}`,
      ``,
      `# 1. Build info (expected: JSON with buildTime, buildCommit, bundleHash)`,
      `# observed: ${fmtMs(serverBuild?.latencyMs)} [${tier(serverBuild?.latencyMs, "buildInfo")}]`,
      `curl -sS -w '\\n# curl timing: total=%{time_total}s connect=%{time_connect}s ttfb=%{time_starttransfer}s http=%{http_code}\\n' \\`,
      `  -D - -o /tmp/build-info.json \\`,
      `  -H 'Accept: application/json' \\`,
      `  -H 'Cache-Control: no-cache' \\`,
      `  -H 'User-Agent: ${ua}' \\`,
      `  '${origin}/api/build-info'`,
      ``,
      `# 2. Health (expected: JSON with status, service, checkedAt, buildInfo)`,
      `# observed: ${fmtMs(health?.latencyMs)} [${tier(health?.latencyMs)}]`,
      `curl -sS -w '\\n# curl timing: total=%{time_total}s connect=%{time_connect}s ttfb=%{time_starttransfer}s http=%{http_code}\\n' \\`,
      `  -D - -o /tmp/health.json \\`,
      `  -H 'Accept: application/json' \\`,
      `  -H 'Cache-Control: no-cache' \\`,
      `  -H 'User-Agent: ${ua}' \\`,
      `  '${origin}/api/health'`,
      ``,
      `# 3. Diag (expected: JSON with supabase key metadata)`,
      `# observed: ${fmtMs(diag?.latencyMs)} [${tier(diag?.latencyMs)}]`,
      `curl -sS -w '\\n# curl timing: total=%{time_total}s connect=%{time_connect}s ttfb=%{time_starttransfer}s http=%{http_code}\\n' \\`,
      `  -D - -o /tmp/diag.json \\`,
      `  -H 'Accept: application/json' \\`,
      `  -H 'Cache-Control: no-cache' \\`,
      `  -H 'User-Agent: ${ua}' \\`,
      `  '${origin}/api/diag'`,
      ``,
      `# 4. Document headers (expected: text/html, no-store on auth surfaces)`,
      `curl -sS -w '\\n# curl timing: total=%{time_total}s connect=%{time_connect}s ttfb=%{time_starttransfer}s http=%{http_code}\\n' \\`,
      `  -I \\`,
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 6 }}>
              <span style={{ opacity: 0.6, letterSpacing: "0.06em" }}>LATENCY THRESHOLDS (ms)</span>
              <button
                onClick={() => {
                  try {
                    window.localStorage.removeItem("LOVABLE_DIAG_LATENCY");
                  } catch {
                    /* ignore */
                  }
                  persistThresholds({ default: { ...DEFAULT_PAIR } });
                }}
                style={btn}
                disabled={
                  latencyThresholds.default.warn === DEFAULT_PAIR.warn &&
                  latencyThresholds.default.crit === DEFAULT_PAIR.crit &&
                  !latencyThresholds.buildInfo &&
                  !latencyThresholds.health &&
                  !latencyThresholds.diag
                }
                title="Restore default 200/500 ms and clear all per-endpoint overrides"
              >
                reset defaults
              </button>
              <button
                onClick={() => {
                  setHealthHistory([]);
                  setDiagHistory([]);
                  setBuildHistory([]);
                }}
                style={btn}
                disabled={
                  healthHistory.length === 0 &&
                  diagHistory.length === 0 &&
                  buildHistory.length === 0
                }
                title="Clear stored latency trend samples for /api/build-info, /api/health, and /api/diag (sparklines reset)"
              >
                clear history
              </button>
              <button
                onClick={() => {
                  const payload = {
                    exportedAt: new Date().toISOString(),
                    origin: typeof window !== "undefined" ? window.location.origin : null,
                    unit: "ms",
                    max: HISTORY_MAX,
                    endpoints: {
                      buildInfo: {
                        thresholds: pairFor("buildInfo"),
                        samples: buildHistory,
                      },
                      health: { thresholds: pairFor("health"), samples: healthHistory },
                      diag: { thresholds: pairFor("diag"), samples: diagHistory },
                    },
                  };
                  try {
                    const blob = new Blob([JSON.stringify(payload, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `pe-diag-latency-${new Date()
                      .toISOString()
                      .replace(/[:.]/g, "-")}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  } catch {
                    /* ignore */
                  }
                }}
                style={btn}
                disabled={
                  healthHistory.length === 0 &&
                  diagHistory.length === 0 &&
                  buildHistory.length === 0
                }
                title="Download the last ≤10 latency measurements per endpoint as JSON"
              >
                export JSON
              </button>
              <button
                onClick={() => {
                  const rows: string[] = ["endpoint,index,latency_ms,warn_ms,crit_ms"];
                  const push = (name: string, samples: number[], endpoint: EndpointKey) => {
                    const p = pairFor(endpoint);
                    samples.forEach((v, i) => rows.push(`${name},${i + 1},${v},${p.warn},${p.crit}`));
                  };
                  push("/api/build-info", buildHistory, "buildInfo");
                  push("/api/health", healthHistory, "health");
                  push("/api/diag", diagHistory, "diag");
                  try {
                    const blob = new Blob([rows.join("\n") + "\n"], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `pe-diag-latency-${new Date()
                      .toISOString()
                      .replace(/[:.]/g, "-")}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  } catch {
                    /* ignore */
                  }
                }}
                style={btn}
                disabled={
                  healthHistory.length === 0 &&
                  diagHistory.length === 0 &&
                  buildHistory.length === 0
                }
                title="Download the last ≤10 latency measurements per endpoint as CSV"
              >
                export CSV
              </button>
            </div>
            {(() => {
              type Row = { key: EndpointKey | "default"; label: string };
              const rows: Row[] = [
                { key: "default", label: "default (fallback)" },
                { key: "buildInfo", label: "/api/build-info" },
                { key: "health", label: "/api/health" },
                { key: "diag", label: "/api/diag" },
              ];
              const rowStyle: React.CSSProperties = {
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto auto auto",
                gap: 4,
                alignItems: "center",
                marginBottom: 3,
              };
              const inputStyle: React.CSSProperties = {
                width: 56,
                background: "transparent",
                color: "#e6edf3",
                border: "1px solid #2a313a",
                padding: "1px 4px",
                fontSize: 10,
              };
              return rows.map(({ key, label }) => {
                const isDefault = key === "default";
                const override = !isDefault ? latencyThresholds[key as EndpointKey] : undefined;
                const active = isDefault ? latencyThresholds.default : (override ?? latencyThresholds.default);
                const inherited = !isDefault && !override;
                const update = (patch: Partial<ThresholdPair>) => {
                  if (isDefault) {
                    persistThresholds({
                      ...latencyThresholds,
                      default: { ...latencyThresholds.default, ...patch },
                    });
                  } else {
                    setEndpointPair(key as EndpointKey, { ...active, ...patch });
                  }
                };
                return (
                  <div key={key} style={rowStyle}>
                    <span style={{ opacity: inherited ? 0.5 : 0.85, fontSize: 10 }}>
                      {label}
                      {inherited ? " · inherit" : ""}
                    </span>
                    <span style={{ color: "#fde68a", fontSize: 10 }}>warn</span>
                    <input
                      type="number"
                      min={0}
                      value={active.warn}
                      onChange={(e) => update({ warn: Math.max(0, Number(e.target.value) || 0) })}
                      style={{ ...inputStyle, opacity: inherited ? 0.6 : 1 }}
                    />
                    <span style={{ color: "#ff8a8a", fontSize: 10 }}>crit</span>
                    <input
                      type="number"
                      min={0}
                      value={active.crit}
                      onChange={(e) => update({ crit: Math.max(0, Number(e.target.value) || 0) })}
                      style={{ ...inputStyle, opacity: inherited ? 0.6 : 1 }}
                    />
                    {!isDefault ? (
                      <button
                        onClick={() => setEndpointPair(key as EndpointKey, null)}
                        style={{ ...btn, opacity: override ? 1 : 0.4 }}
                        disabled={!override}
                        title="Clear override — inherit default"
                      >
                        clear
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              });
            })()}
            <div style={{ opacity: 0.5, fontSize: 10, marginTop: 2 }}>
              <span style={{ color: "#86efac" }}>green</span> &lt; warn ·{" "}
              <span style={{ color: "#fde68a" }}>yellow</span> ≥ warn ·{" "}
              <span style={{ color: "#ff8a8a" }}>red</span> ≥ crit. Per-endpoint values override the default.
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
                  onClick={cyclePollSeconds}
                  style={{ ...btn, color: pollSeconds ? "#7fbf7f" : "#9aa4af" }}
                  title="Auto-probe interval — cycles off / 5s / 10s / 30s / 60s. Pauses when tab hidden."
                >
                  {pollSeconds ? `auto ${pollSeconds}s ✓` : "auto off"}
                </button>
                <button
                  onClick={() => setCritAutoProbe((v) => !v)}
                  style={{ ...btn, color: critAutoProbe ? "#ff8a8a" : "#9aa4af" }}
                  title={
                    critAutoProbe
                      ? `Auto re-probe on ≥ crit / error is ON${lastCritReprobeAt ? ` · last trigger ${new Date(lastCritReprobeAt).toISOString().slice(11, 19)} (${lastCritReason ?? ""})` : ""}`
                      : "Auto re-probe /api/health + /api/diag whenever any endpoint hits its crit threshold or errors (5s cooldown)"
                  }
                >
                  {critAutoProbe ? `crit-reprobe ✓${lastCritReprobeAt ? ` · ${new Date(lastCritReprobeAt).toISOString().slice(11, 19)}` : ""}` : "crit-reprobe off"}
                </button>
                <button
                  onClick={() => setLatencyToasts((v) => !v)}
                  style={{ ...btn, color: latencyToasts ? "#fde68a" : "#9aa4af" }}
                  title={
                    latencyToasts
                      ? "Latency toasts ON — notified when /api/health or /api/diag cross warn/crit or error"
                      : "Show toast notifications when /api/health or /api/diag cross warn/crit or error"
                  }
                >
                  {latencyToasts ? "toasts ✓" : "toasts off"}
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
                {latencyRow("/api/build-info ms", serverBuild.latencyMs ?? null, buildHistory, { currentError: serverBuild.error ? { message: serverBuild.error, httpStatus: serverBuild.status } : null, lastError: buildLastErr, endpoint: "buildInfo" })}
                {row("hint", "/api/build-info unreachable — check rewrite & cache")}
              </>
            ) : (
              <>
                {row("server bundle", serverBuild.bundleHash ?? "(unknown)")}
                {row("server buildTime", serverBuild.buildTime ?? "(unknown)")}
                {row("server buildCommit", (serverBuild.buildCommit ?? "(unknown)").slice(0, 12))}
                {latencyRow("/api/build-info ms", serverBuild.latencyMs ?? null, buildHistory, { currentError: serverBuild.error ? { message: serverBuild.error, httpStatus: serverBuild.status } : null, lastError: buildLastErr, endpoint: "buildInfo" })}
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
          {latencyRow("/api/health ms", health?.latencyMs ?? null, healthHistory, { currentError: health?.error ? { message: health.error, httpStatus: health.httpStatus } : null, lastError: healthLastErr, endpoint: "health" })}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8 }}>
                  <span style={{ letterSpacing: "0.06em", fontWeight: 600 }}>SUPABASE KEY · {palette.label}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={async () => {
                        const serverKey = diag && !diag.error ? diag.supabase?.key : undefined;
                        const payload = {
                          capturedAt: new Date().toISOString(),
                          origin: typeof window !== "undefined" ? window.location.origin : null,
                          bundleHash,
                          supabase: {
                            url: supaUrl ?? null,
                            urlValid: supaUrlValid,
                            urlHost: supaUrl ? (() => { try { return new URL(supaUrl).host; } catch { return null; } })() : null,
                          },
                          publishableKey: {
                            family,
                            status: palette.label,
                            message: palette.msg,
                            prefix: supaKeyPrefix,
                            length: supaKeyLen || null,
                            shape: supaKeyShape,
                            expectedPrefix: "sb_publishable_",
                          },
                          serverComparison: diag === null
                            ? { state: "pending" }
                            : diag.error
                              ? { state: "error", error: diag.error, httpStatus: diag.httpStatus ?? null }
                              : {
                                  state: "ok",
                                  urlHost: diag.supabase?.urlHost ?? null,
                                  keyFamily: serverKey?.family ?? null,
                                  keyPrefix: serverKey?.prefix ?? null,
                                  keyLength: serverKey?.length ?? null,
                                  familyMatch: (serverKey?.family ?? null) === (
                                    !supaKey ? "missing"
                                      : supaKey.startsWith("sb_publishable_") ? "sb_publishable"
                                        : supaKey.startsWith("sb_secret_") ? "sb_secret"
                                          : supaKey.startsWith("eyJ") ? "legacy_jwt"
                                            : "unknown"
                                  ),
                                  prefixMatch: (serverKey?.prefix ?? "") === supaKeyPrefix,
                                  lengthMatch: (serverKey?.length ?? -1) === supaKeyLen,
                                },
                        };
                        const pretty = JSON.stringify(payload, null, 2);
                        try {
                          await navigator.clipboard.writeText(pretty);
                          setCopied("key-payload:copied ✓");
                        } catch {
                          setCopied("key-payload:copy failed");
                        }
                        setTimeout(() => setCopied(null), 2500);
                      }}
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.05em",
                        padding: "2px 6px",
                        border: `1px solid ${palette.border}`,
                        background: "transparent",
                        color: palette.fg,
                        cursor: "pointer",
                        borderRadius: 3,
                      }}
                      title="Copy publishable-key debug payload for bug reports (no secret value)"
                      aria-label="Copy publishable-key debug payload"
                    >
                      {copied?.startsWith("key-payload:") ? copied.slice("key-payload:".length) : "copy payload"}
                    </button>
                    <span style={{ opacity: 0.8, fontSize: 10 }}>family: {family}</span>
                  </span>
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
                  {latencyRow("/api/diag ms", diag.latencyMs ?? null, diagHistory, { currentError: diag.error ? { message: diag.error, httpStatus: diag.httpStatus } : null, lastError: diagLastErr, endpoint: "diag" })}
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
                {latencyRow("/api/diag ms", diag.latencyMs ?? null, diagHistory, { currentError: diag.error ? { message: diag.error, httpStatus: diag.httpStatus } : null, lastError: diagLastErr, endpoint: "diag" })}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
                {latencyRow(
                  "document ms",
                  docCacheHistory.length ? docCacheHistory[docCacheHistory.length - 1] : null,
                  docCacheHistory,
                )}
                {latencyRow(
                  "bundle ms",
                  bundleCacheHistory.length ? bundleCacheHistory[bundleCacheHistory.length - 1] : null,
                  bundleCacheHistory,
                )}
              </div>
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
          <details style={{ marginTop: 6 }} open>
            <summary style={{ cursor: "pointer", opacity: 0.7 }}>
              probe history ({probeHistory.length}/{PROBE_HISTORY_MAX})
            </summary>
            {probeHistory.length === 0 ? (
              <div style={{ opacity: 0.5, fontSize: 10, marginTop: 4 }}>
                No probes recorded yet. Run "probe now" or wait for auto-probe.
              </div>
            ) : (
              <div style={{ marginTop: 4 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "78px 78px 44px 60px 74px 1fr",
                    columnGap: 8,
                    rowGap: 2,
                    fontSize: 10,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  <div style={{ opacity: 0.5 }}>time</div>
                  <div style={{ opacity: 0.5 }}>endpoint</div>
                  <div style={{ opacity: 0.5 }}>ok</div>
                  <div style={{ opacity: 0.5 }}>latency</div>
                  <div style={{ opacity: 0.5 }}>hash</div>
                  <div style={{ opacity: 0.5 }}>notes</div>
                  {[...probeHistory]
                    .slice()
                    .reverse()
                    .map((p, idx, arr) => {
                      const prevSameEndpoint = arr
                        .slice(idx + 1)
                        .find((x) => x.endpoint === p.endpoint);
                      const hashChanged =
                        !!prevSameEndpoint &&
                        !!p.payloadHash &&
                        !!prevSameEndpoint.payloadHash &&
                        prevSameEndpoint.payloadHash !== p.payloadHash;
                      return (
                        <Fragment key={p.id}>
                          <div>{p.fetchedAt.slice(11, 19)}</div>
                          <div>{p.endpoint}</div>
                          <div style={{ color: p.ok ? "#7fbf7f" : "#ff8a8a" }}>
                            {p.ok ? "✓" : "✗"}
                            {typeof p.httpStatus === "number" ? ` ${p.httpStatus}` : ""}
                          </div>
                          <div style={{ color: latencyColor(p.latencyMs) }}>{p.latencyMs} ms</div>
                          <div
                            style={{ color: hashChanged ? "#eab308" : undefined }}
                            title={hashChanged ? "payload changed since previous probe" : ""}
                          >
                            {p.payloadHash ?? "—"}
                            {hashChanged ? " Δ" : ""}
                          </div>
                          <div style={{ opacity: 0.7, wordBreak: "break-all" }}>
                            {p.error
                              ? `error: ${p.error.length > 60 ? p.error.slice(0, 60) + "…" : p.error}`
                              : typeof p.bytes === "number"
                                ? `${p.bytes} B`
                                : ""}
                          </div>
                        </Fragment>
                      );
                    })}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <button
                    style={btn}
                    onClick={() => {
                      const json = JSON.stringify(probeHistory, null, 2);
                      navigator.clipboard?.writeText(json).catch(() => {});
                    }}
                    title="Copy full probe history as JSON"
                  >
                    copy JSON
                  </button>
                  <button
                    style={btn}
                    onClick={() => {
                      const latestByEndpoint: Record<string, ProbeEntry> = {};
                      for (const p of probeHistory) {
                        const prev = latestByEndpoint[p.endpoint];
                        if (!prev || p.fetchedAt > prev.fetchedAt) latestByEndpoint[p.endpoint] = p;
                      }
                      const latest = probeHistory.reduce<ProbeEntry | null>(
                        (acc, p) => (!acc || p.fetchedAt > acc.fetchedAt ? p : acc),
                        null,
                      );
                      const payload = {
                        exportedAt: new Date().toISOString(),
                        origin: typeof window !== "undefined" ? window.location.origin : null,
                        latest,
                        endpoints: latestByEndpoint,
                      };
                      try {
                        const blob = new Blob([JSON.stringify(payload, null, 2)], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `pe-diag-latest-${new Date()
                          .toISOString()
                          .replace(/[:.]/g, "-")}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      } catch {
                        /* ignore */
                      }
                    }}
                    title="Download the most recent probe result per endpoint as JSON"
                    disabled={probeHistory.length === 0}
                  >
                    export latest
                  </button>
                  <button
                    style={btn}
                    onClick={() => {
                      const diagnostics = buildDiagnosticPayload();
                      const latestByEndpoint: Record<string, ProbeEntry> = {};
                      for (const p of probeHistory) {
                        const prev = latestByEndpoint[p.endpoint];
                        if (!prev || p.fetchedAt > prev.fetchedAt) latestByEndpoint[p.endpoint] = p;
                      }
                      const payload = {
                        exportedAt: new Date().toISOString(),
                        origin: typeof window !== "undefined" ? window.location.origin : null,
                        thresholds: {
                          default: latencyThresholds.default,
                          overrides: {
                            buildInfo: latencyThresholds.buildInfo ?? null,
                            health: latencyThresholds.health ?? null,
                            diag: latencyThresholds.diag ?? null,
                          },
                          units: "ms",
                        },
                        latestByEndpoint,
                        probeHistory,
                        diagnostics,
                      };
                      try {
                        const blob = new Blob([JSON.stringify(payload, null, 2)], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `pe-diag-snapshot-${new Date()
                          .toISOString()
                          .replace(/[:.]/g, "-")}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      } catch {
                        /* ignore */
                      }
                    }}
                    title="Download a full snapshot: latest probe results, timestamps, and current threshold settings"
                  >
                    export snapshot
                  </button>
                  <button
                    style={btn}
                    onClick={() => {
                      setProbeHistory([]);
                      try {
                        window.localStorage.removeItem("pe.diag.probeHistory");
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    clear
                  </button>
                </div>
              </div>
            )}
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
