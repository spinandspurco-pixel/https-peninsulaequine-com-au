import { useMemo, useState } from "react";
import { classifyClientSupabaseKey } from "@/lib/supabaseKeyIndicator";

/**
 * EnvKeyDebug
 *
 * Non-production-only floating badge that surfaces the current
 * VITE_SUPABASE_PUBLISHABLE_KEY family (sb_publishable_ vs legacy eyJ… vs
 * missing / sb_secret_). Rendered as a tiny bottom-left chip so it never
 * competes with real UI. Hidden entirely in production builds.
 *
 * This complements the fuller diagnostics in ClientDiagPanel (`?debug=1`)
 * and HqDeployHealth — this one is always visible during local dev / preview
 * so key drift is impossible to miss while iterating.
 */
export function EnvKeyDebug() {
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "error">("idle");
  const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "";
  const info = useMemo(() => classifyClientSupabaseKey(key), [key]);

  // Hide completely in production. Vite replaces import.meta.env.PROD at
  // build time, so this whole component tree tree-shakes away in prod bundles.
  if (import.meta.env.PROD) return null;

  const prefix =
    info.family === "missing"
      ? "(missing)"
      : info.family === "modern"
      ? "sb_publishable_"
      : info.family === "secret"
      ? "sb_secret_"
      : info.family === "legacy_jwt"
      ? "eyJ… (legacy JWT)"
      : key.slice(0, 12) + "…";

  const palette: Record<string, { bg: string; border: string; fg: string; label: string }> = {
    modern: { bg: "rgba(34,197,94,0.12)", border: "#22c55e", fg: "#86efac", label: "OK" },
    legacy_jwt: { bg: "rgba(239,68,68,0.14)", border: "#ef4444", fg: "#fca5a5", label: "LEGACY" },
    secret: { bg: "rgba(239,68,68,0.22)", border: "#ef4444", fg: "#fecaca", label: "DANGER" },
    missing: { bg: "rgba(239,68,68,0.14)", border: "#ef4444", fg: "#fca5a5", label: "MISSING" },
    unknown: { bg: "rgba(234,179,8,0.14)", border: "#eab308", fg: "#fde68a", label: "UNKNOWN" },
  };
  const tone = palette[info.family] ?? palette.unknown;


  const base: React.CSSProperties = {
    position: "fixed",
    left: 8,
    bottom: 8,
    zIndex: 2147483000,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 10,
    lineHeight: 1.35,
    border: `1px solid ${tone.border}`,
    background: tone.bg,
    color: tone.fg,
    borderRadius: 4,
    padding: open ? "6px 8px" : "3px 6px",
    maxWidth: 320,
    boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
    cursor: "pointer",
    userSelect: "text",
  };

  return (
    <div
      style={base}
      onClick={() => setOpen((v) => !v)}
      role="status"
      aria-label={`Supabase key family: ${info.family}`}
      title="Click to expand · dev/preview only"
      data-testid="env-key-debug"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontWeight: 600, letterSpacing: "0.06em" }}>
          SUPABASE KEY · {tone.label}
        </span>
        {!open && <span style={{ opacity: 0.85 }}>{prefix}</span>}
      </div>
      {open && (
        <div style={{ marginTop: 4 }}>
          <div>
            <span style={{ opacity: 0.6 }}>prefix</span>{" "}
            <code>{prefix}</code>
          </div>
          <div>
            <span style={{ opacity: 0.6 }}>length</span>{" "}
            <code>{key ? key.length : "—"}</code>
          </div>
          <div>
            <span style={{ opacity: 0.6 }}>expected</span>{" "}
            <code>sb_publishable_*</code>
          </div>
          <div>
            <span style={{ opacity: 0.6 }}>mode</span>{" "}
            <code>{import.meta.env.MODE}</code>
          </div>
          {info.family !== "modern" && (
            <div style={{ marginTop: 4, opacity: 0.9 }}>{info.message}</div>
          )}
          <div style={{ marginTop: 6 }}>
            <button
              type="button"
              data-testid="env-key-debug-copy"
              onClick={async (e) => {
                e.stopPropagation();
                const payload = {
                  family: info.family,
                  prefix,
                  length: key ? key.length : 0,
                  mode: import.meta.env.MODE,
                };
                try {
                  await navigator.clipboard.writeText(
                    JSON.stringify(payload, null, 2),
                  );
                  setCopyStatus("ok");
                } catch {
                  setCopyStatus("error");
                }
                setTimeout(() => setCopyStatus("idle"), 1500);
              }}
              style={{
                font: "inherit",
                color: tone.fg,
                background: "transparent",
                border: `1px solid ${tone.border}`,
                borderRadius: 3,
                padding: "2px 6px",
                cursor: "pointer",
              }}
            >
              {copyStatus === "ok"
                ? "✓ Copied"
                : copyStatus === "error"
                ? "Copy failed"
                : "Copy payload"}
            </button>
          </div>
          <div style={{ marginTop: 4, opacity: 0.55 }}>
            Non-production only · hidden in production builds
          </div>

        </div>
      )}
    </div>
  );
}

export default EnvKeyDebug;
