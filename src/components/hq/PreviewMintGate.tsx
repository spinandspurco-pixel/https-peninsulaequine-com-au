import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PreflightFrame, BronzeRule, StatusLamp } from "@/components/hq/HqPrimitives";

interface Finding {
  table: string;
  column: string;
  match: string;
  rowId?: string | null;
  value: string;
}

interface CheckResult {
  passed: boolean;
  findings: Finding[];
  tablesScanned: string[];
  ranAt: string;
}

/**
 * Preview Mint Gate
 * ─────────────────
 * Admin-only panel. Runs the `preview-mint-check` edge function which scans
 * every preview-visible table for placeholder / test / generic identities.
 * If any are found, the "Mint preview account" affordance is disabled and the
 * findings are listed. The gate is intentionally hard — Josh Dales (or any
 * future preview client) should never sign in to a dataset that contains
 * "Josh Smith", "Test User", "Operator", etc.
 */
export function PreviewMintGate() {
  const { isAdmin } = useAuth();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke(
        "preview-mint-check",
        { body: {} }
      );
      if (invokeErr) throw invokeErr;
      setResult(data as CheckResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const lamp = !result ? "standby" : result.passed ? "nominal" : "fault";
  const headline = !result
    ? "Awaiting scan"
    : result.passed
    ? "Cleared — safe to mint"
    : `Blocked — ${result.findings.length} finding${result.findings.length === 1 ? "" : "s"}`;

  return (
    <PreflightFrame
      designation="MINT-01"
      title="Preview Mint Gate"
      subtitle="Pre-flight scan across every preview-visible table. Blocks minting until clean."
      actions={
        <div className="flex items-center gap-4">
          <StatusLamp state={lamp as any} glow={result?.passed} />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/65">
            {headline}
          </span>
        </div>
      }
    >
      <div className="px-6 py-7 space-y-7">
        <div className="flex flex-wrap items-center gap-6">
          <button
            onClick={run}
            disabled={running}
            className="text-[11px] uppercase tracking-[0.25em] text-foreground/90 hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {running ? "Scanning…" : "Run pre-mint check →"}
          </button>
          <button
            disabled={!result?.passed}
            onClick={() => {
              const url =
                "mailto:josh.dales@peninsulaequine.systems?subject=Peninsula%20Equine%20HQ%20%E2%80%94%20Client%20Preview%20access&body=Welcome%20to%20Peninsula%20Equine%20HQ.%20Your%20preview%20environment%20is%20ready.";
              window.location.href = url;
            }}
            className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/55 hover:text-foreground/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {result?.passed ? "Send Josh the login →" : "Mint locked"}
          </button>
          {result && (
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/40 ml-auto">
              Scanned · {result.tablesScanned.length} tables · {new Date(result.ranAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {error && (
          <div className="border border-destructive/40 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-destructive/90 mb-1">
              Scan error
            </p>
            <p className="text-[12px] text-foreground/80">{error}</p>
          </div>
        )}

        {result && result.findings.length > 0 && (
          <div className="space-y-4">
            <BronzeRule label="Findings" />
            <div className="grid grid-cols-12 gap-3 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/45 px-1">
              <div className="col-span-3">Table · Column</div>
              <div className="col-span-2">Match</div>
              <div className="col-span-5">Value</div>
              <div className="col-span-2">Row</div>
            </div>
            <ul className="divide-y divide-border/10 border-y border-border/10">
              {result.findings.map((f, i) => (
                <li
                  key={i}
                  className="grid grid-cols-12 gap-3 px-1 py-3 text-[12px] text-foreground/80 items-baseline"
                >
                  <div className="col-span-3 font-mono text-[11px] text-foreground/65">
                    {f.table}
                    <span className="text-muted-foreground/40"> · </span>
                    {f.column}
                  </div>
                  <div className="col-span-2 font-mono text-[11px] text-destructive/85">
                    {f.match}
                  </div>
                  <div className="col-span-5 truncate text-foreground/80">{f.value}</div>
                  <div className="col-span-2 font-mono text-[10px] text-muted-foreground/45 truncate">
                    {f.rowId ?? "—"}
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground/55 leading-relaxed max-w-2xl">
              Resolve each row before re-running the gate. Replace placeholder names with curated
              fictional clients, or delete the rows entirely. The gate must report{" "}
              <span className="text-accent/80">Cleared</span> before Josh receives the login.
            </p>
          </div>
        )}

        {result?.passed && (
          <div className="border border-accent/25 px-5 py-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent/70 mb-2">
              Cleared
            </p>
            <p className="text-[13px] text-foreground/80 leading-relaxed">
              No placeholder, test or generic identity exists in any preview-visible table. The
              Client Preview environment is intentionally curated end to end. Mint may proceed.
            </p>
          </div>
        )}
      </div>
    </PreflightFrame>
  );
}
