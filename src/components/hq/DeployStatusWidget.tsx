import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  isStuck,
  runProbes,
  type ProbeResult,
  type StreakState,
} from "@/lib/deployHealth";

const BUNDLE_RE = /\/assets\/(index-[A-Za-z0-9_-]+\.js)/;

function getCurrentPageBundle(): string | null {
  if (typeof document === "undefined") return null;
  for (const s of Array.from(document.getElementsByTagName("script"))) {
    const m = (s.getAttribute("src") ?? "").match(BUNDLE_RE);
    if (m) return m[1];
  }
  return null;
}

/**
 * Admin-only compact deployment status widget.
 *
 * Shows the JS bundle currently served by each public domain, the last probe
 * outcome, and a one-click "Recheck now" trigger. Strictly read-only — links
 * to /hq/deploy-health for the full detector + escalation payload.
 */
export function DeployStatusWidget() {
  const { isAdmin } = useAuth();
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [running, setRunning] = useState(false);
  const pageBundle = useMemo(getCurrentPageBundle, []);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      const { results, streak } = await runProbes();
      setResults(results);
      setStreak(streak);
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) run();
  }, [isAdmin, run]);

  if (!isAdmin) return null;

  const anyStuck = results.some(isStuck);

  return (
    <section
      aria-labelledby="deploy-status-heading"
      className="border border-border/10 p-5 space-y-4"
    >
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h3
            id="deploy-status-heading"
            className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55"
          >
            Deployment status
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground/50">
            Last probe:{" "}
            <span className="text-foreground/70">
              {streak?.lastCheckedAt
                ? new Date(streak.lastCheckedAt).toLocaleTimeString()
                : "—"}
            </span>
            {anyStuck && (
              <span className="ml-3 text-amber-700">· stale bundle detected</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/80 hover:text-accent underline underline-offset-8 disabled:opacity-40"
        >
          {running ? "Checking…" : "Recheck now"}
        </button>
      </header>

      <dl className="text-[11px] space-y-2">
        <div className="flex items-baseline gap-3">
          <dt className="uppercase tracking-[0.3em] text-foreground/40 w-32 shrink-0">
            This page
          </dt>
          <dd>
            <code className="text-foreground/80">{pageBundle ?? "—"}</code>
          </dd>
        </div>
        {results.map((r) => {
          const stuck = isStuck(r);
          return (
            <div key={r.url} className="flex items-baseline gap-3">
              <dt className="uppercase tracking-[0.3em] text-foreground/40 w-32 shrink-0">
                {r.label}
              </dt>
              <dd className="flex-1 min-w-0">
                {r.ok ? (
                  <span className="flex items-baseline gap-3 flex-wrap">
                    {r.bundleUrl ? (
                      <a
                        href={r.bundleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-foreground/80 underline underline-offset-4 truncate"
                      >
                        <code>{r.bundleFile}</code>
                      </a>
                    ) : (
                      <code className="text-foreground/80">{r.bundleFile}</code>
                    )}
                    <span
                      className={
                        stuck ? "text-amber-700" : "text-emerald-700"
                      }
                    >
                      {stuck ? "stale" : "fresh"}
                    </span>
                  </span>
                ) : (
                  <span className="text-red-600/80">{r.error ?? "probe error"}</span>
                )}
              </dd>
            </div>
          );
        })}
        {results.length === 0 && !running && (
          <div className="text-foreground/50">No probes yet.</div>
        )}
      </dl>

      <footer className="pt-2 border-t border-border/10">
        <Link
          to="/hq/deploy-health"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 hover:text-accent transition-colors"
        >
          Open full detector →
        </Link>
      </footer>
    </section>
  );
}
