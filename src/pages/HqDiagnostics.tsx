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

  const expectedCallback = url ? `${url.replace(/\/$/, "")}/auth/v1/callback` : null;
  const appOrigin = typeof window !== "undefined" ? window.location.origin : "";

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
          return;
        }
        if (err) {
          setRedirectStatus("warn");
          setRedirectDetail(`Returned with error: ${decodeURIComponent(err)}`);
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
