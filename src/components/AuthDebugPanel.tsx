import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  getAuthLogEntries,
  subscribeAuthLog,
  type AuthLogEntry,
} from "@/lib/authRouting";

const REDIRECT_SCOPES = new Set([
  "login:redirect",
  "guard:no-user",
  "guard:forbidden",
  "guard:allow",
  "guard:wait",
]);

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function isLocalHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".local");
}

function debugAllowed(isAdmin: boolean): boolean {
  // Panel is hidden in production for everyone (including admins and preview users)
  // unless one of these is true:
  //   1. running on localhost
  //   2. Vite dev build (import.meta.env.DEV)
  //   3. explicit opt-in via ?debug=auth or localStorage.LOVABLE_AUTH_DEBUG=1
  //      (the localStorage flag additionally requires an admin signed in)
  // Always hidden when HQ preview mode is active (?view=preview) so preview
  // surfaces stay clean regardless of who is signed in.
  if (typeof window !== "undefined") {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("view") === "preview") return false;
      if (sp.get("debug") === "auth" && isAdmin) return true;
      if (window.localStorage.getItem("LOVABLE_AUTH_DEBUG") === "1" && isAdmin) return true;
    } catch {
      /* ignore */
    }
  }
  if (isLocalHost()) return true;
  if (import.meta.env.DEV) return true;
  return false;
}

function useIsOpen(isAdmin: boolean, search: string): [boolean, (v: boolean) => void] {
  const [manual, setManual] = useState<boolean | null>(null);
  // search dep so that toggling ?view=preview within the SPA re-evaluates.
  const allowed = useMemo(() => debugAllowed(isAdmin), [isAdmin, search]);

  useEffect(() => {
    if (!allowed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setManual((m) => !(m ?? true));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allowed]);

  if (!allowed) return [false, () => {}];
  const open = manual ?? true;
  return [open, (v: boolean) => setManual(v)];
}

export function AuthDebugPanel() {
  const { user, session, ready, authLoading, rolesLoading, roles, isAdmin } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useIsOpen(isAdmin);
  const [collapsed, setCollapsed] = useState(true);
  const [entries, setEntries] = useState<AuthLogEntry[]>(() => getAuthLogEntries());

  useEffect(() => {
    setEntries(getAuthLogEntries());
    return subscribeAuthLog(setEntries);
  }, []);

  if (!open) return null;

  const lastRedirect = [...entries]
    .reverse()
    .find((e) => REDIRECT_SCOPES.has(e.scope));

  const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000) : null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 99999,
        width: collapsed ? 220 : 420,
        maxHeight: collapsed ? 44 : "60vh",
        background: "rgba(10,10,14,0.94)",
        color: "#e5e7eb",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 6,
        boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.45,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "rgba(255,255,255,0.04)",
          color: "inherit",
          border: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 10 }}>
          Auth Debug
        </span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: !ready ? "#f59e0b" : user ? "#10b981" : "#ef4444",
            }}
          />
          <span style={{ opacity: 0.6, fontSize: 10 }}>{collapsed ? "▴" : "▾"}</span>
        </span>
      </button>

      {!collapsed && (
        <div style={{ padding: "10px 12px", overflowY: "auto", maxHeight: "calc(60vh - 44px)" }}>
          <Section title="Session">
            <Row k="ready" v={String(ready)} />
            <Row k="authLoading" v={String(authLoading)} />
            <Row k="rolesLoading" v={String(rolesLoading)} />
            <Row k="user" v={user ? `${user.email ?? "(no email)"} · ${user.id.slice(0, 8)}…` : "—"} />
            <Row k="roles" v={roles.length ? roles.join(", ") : "(none)"} />
            <Row
              k="expires"
              v={expiresAt ? `${expiresAt.toLocaleTimeString()} (${Math.round((expiresAt.getTime() - Date.now()) / 1000)}s)` : "—"}
            />
            <Row k="path" v={location.pathname + location.search} />
          </Section>

          <Section title="Last redirect decision">
            {lastRedirect ? (
              <>
                <Row k="ts" v={fmtTime(lastRedirect.ts)} />
                <Row k="scope" v={lastRedirect.scope} />
                <pre
                  style={{
                    margin: "4px 0 0",
                    padding: 8,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 4,
                    overflowX: "auto",
                    fontSize: 10,
                  }}
                >
                  {JSON.stringify(lastRedirect.payload, null, 2)}
                </pre>
              </>
            ) : (
              <div style={{ opacity: 0.6 }}>No redirect events yet.</div>
            )}
          </Section>

          <Section title={`Recent events (${entries.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {entries
                .slice(-12)
                .reverse()
                .map((e, i) => (
                  <div
                    key={`${e.ts}-${i}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "78px 1fr",
                      gap: 6,
                      padding: "4px 6px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 3,
                    }}
                  >
                    <span style={{ opacity: 0.6 }}>{fmtTime(e.ts)}</span>
                    <span>
                      <span style={{ color: "#93c5fd" }}>{e.scope}</span>
                      <span style={{ opacity: 0.7 }}>
                        {" "}
                        {summarisePayload(e.payload)}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          </Section>

          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", opacity: 0.6, fontSize: 10 }}>
            <span>Ctrl+Shift+A to toggle</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: "none", border: 0, color: "inherit", cursor: "pointer", textDecoration: "underline" }}
            >
              hide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: 9,
          opacity: 0.55,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 6 }}>
      <span style={{ opacity: 0.55 }}>{k}</span>
      <span style={{ wordBreak: "break-all" }}>{v}</span>
    </div>
  );
}

function summarisePayload(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload);
  if (!keys.length) return "";
  const parts = keys.slice(0, 4).map((k) => {
    const v = payload[k];
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `${k}=${s.length > 28 ? s.slice(0, 28) + "…" : s}`;
  });
  return parts.join(" ");
}
