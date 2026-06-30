import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthLogEntries, subscribeAuthLog, type AuthLogEntry } from "@/lib/authRouting";

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
  const [cacheHeaders, setCacheHeaders] = useState<Record<string, string | null> | null>(null);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [cacheCheckedAt, setCacheCheckedAt] = useState<number | null>(null);
  const [serverBuild, setServerBuild] = useState<
    | { buildTime?: string; buildCommit?: string; bundleHash?: string | null; error?: string; status?: number }
    | null
  >(null);
  const [health, setHealth] = useState<
    | { status?: string; service?: string; checkedAt?: string; bundleHash?: string | null; error?: string; httpStatus?: number }
    | null
  >(null);


  useEffect(() => {
    let cancelled = false;
    fetch("/api/build-info", { cache: "no-store", credentials: "omit" })
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          setServerBuild({ error: `HTTP ${r.status}`, status: r.status });
          return;
        }
        try {
          const j = await r.json();
          setServerBuild({
            buildTime: j.buildTime,
            buildCommit: j.buildCommit,
            bundleHash: j.bundleHash,
            status: r.status,
          });
        } catch (e) {
          setServerBuild({ error: `parse: ${String((e as Error)?.message ?? e)}`, status: r.status });
        }
      })
      .catch((e) => {
        if (!cancelled) setServerBuild({ error: String((e as Error)?.message ?? e) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store", credentials: "omit" })
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          setHealth({ error: `HTTP ${r.status}`, httpStatus: r.status });
          return;
        }
        try {
          const j = await r.json();
          setHealth({
            status: j.status,
            service: j.service,
            checkedAt: j.checkedAt,
            bundleHash: j?.buildInfo?.bundleHash ?? null,
            httpStatus: r.status,
          });
        } catch (e) {
          setHealth({ error: `parse: ${String((e as Error)?.message ?? e)}`, httpStatus: r.status });
        }
      })
      .catch((e) => {
        if (!cancelled) setHealth({ error: String((e as Error)?.message ?? e) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        try {
          const res = await fetch(t.url, { method: "GET", cache: "no-store", credentials: "omit" });
          for (const h of interesting) {
            const v = res.headers.get(h);
            if (v !== null) out[`${t.label}.${h}`] = v;
          }
          out[`${t.label}.status`] = String(res.status);
        } catch (err) {
          out[`${t.label}.error`] = String((err as Error)?.message ?? err);
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
          {row("bundle", bundleHash)}
          {row("build time", (typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "(unknown)"))}
          {row("build commit", (typeof __BUILD_COMMIT__ !== "undefined" ? __BUILD_COMMIT__ : "(unknown)").slice(0, 12))}
          {row(
            "server build",
            serverBuild === null
              ? "fetching…"
              : serverBuild.error
                ? `error: ${serverBuild.error}`
                : `${serverBuild.buildTime ?? "?"} · ${(serverBuild.buildCommit ?? "?").slice(0, 12)} · ${serverBuild.bundleHash ?? "?"}`,
          )}
          {serverBuild && !serverBuild.error && (
            row(
              "server vs client",
              serverBuild.bundleHash && serverBuild.bundleHash === bundleHash ? "match ✓" : "MISMATCH ✗ (stale edge)",
            )
          )}
          {row("supabase url", supaUrl || "(missing)")}
          {row("supabase url valid", supaUrlValid ? "yes" : "no")}
          {row("supabase key", supaKeyShape)}
          {row("supabase key prefix", supaKeyPrefix)}
          {row("supabase key length", supaKeyLen || "—")}
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
