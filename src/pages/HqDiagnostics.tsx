import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";

const EXPECTED_PROJECT_ID = "aizkqajrzkvwuobisnzr";
const EXPECTED_URL = `https://${EXPECTED_PROJECT_ID}.supabase.co`;
const SB_PREFIX = "sb_publishable_";
const LEGACY_PREFIX = "eyJ";

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
      keyStatus = "fail";
      keyDetail = `${maskKey(key)} — LEGACY JWT format (eyJ…). Replace with sb_publishable_ value from Lovable → Cloud → Backend → API Keys.`;
    } else if (!key.startsWith(SB_PREFIX)) {
      keyStatus = "fail";
      keyDetail = `${maskKey(key)} — unrecognised format. Must start with sb_publishable_.`;
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

    return items;
  }, [url, projectId, key, mode, pingStatus, pingDetail]);

  const overall: CheckStatus = useMemo(() => {
    if (checks.some((c) => c.status === "fail")) return "fail";
    if (checks.some((c) => c.status === "warn")) return "warn";
    return "ok";
  }, [checks]);

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

        <p className="mt-8 text-xs opacity-40 font-light leading-relaxed">
          No secrets are exposed on this page. The publishable key is intentionally public
          (frontend-bundled) but is masked here as a readability aid. The service-role key is
          server-only and never reaches the browser.
        </p>
      </div>
    </div>
  );
}
