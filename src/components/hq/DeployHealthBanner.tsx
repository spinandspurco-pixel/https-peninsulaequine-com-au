import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ESCALATION_THRESHOLD,
  readStreak,
  runProbes,
  type StreakState,
} from "@/lib/deployHealth";

/**
 * Admin-only deploy-health chip.
 *
 *  - Silent when the live bundle is fresh.
 *  - Subtle bronze chip after the first stale check.
 *  - Hardens into a "Platform action required" badge after
 *    ESCALATION_THRESHOLD consecutive stale checks.
 *
 * Hidden for preview-role users and anyone who isn't an admin. Performs at most
 * one probe per 10 minutes per browser, and only on private surfaces (rendered
 * from <Layout/> alongside <HqPreviewBanner/>).
 */
const RECHECK_MS = 10 * 60 * 1000;

export function DeployHealthBanner() {
  const { isAdmin, isPreview } = useAuth();
  const [state, setState] = useState<StreakState>(() => readStreak());

  useEffect(() => {
    if (!isAdmin || isPreview) return;
    const { lastCheckedAt } = readStreak();
    const stale =
      !lastCheckedAt || Date.now() - new Date(lastCheckedAt).getTime() > RECHECK_MS;
    if (!stale) return;
    let cancelled = false;
    runProbes()
      .then(({ streak }) => {
        if (!cancelled) setState(streak);
      })
      .catch(() => {/* network/CORS — leave streak untouched */});
    return () => {
      cancelled = true;
    };
  }, [isAdmin, isPreview]);

  if (!isAdmin || isPreview) return null;
  if (state.lastState !== "stale" || state.streak < 1) return null;

  const escalated = state.streak >= ESCALATION_THRESHOLD;

  return (
    <div
      className={
        "sticky top-14 z-40 border-b backdrop-blur-md " +
        (escalated
          ? "border-amber-600/40 bg-amber-600/[0.06]"
          : "border-accent/15 bg-background/85")
      }
    >
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden
            className={
              "w-1.5 h-1.5 rounded-full shrink-0 " +
              (escalated ? "bg-amber-600 animate-pulse" : "bg-accent/70")
            }
          />
          <p
            className={
              "font-mono text-[10px] uppercase tracking-[0.32em] shrink-0 " +
              (escalated ? "text-amber-700" : "text-accent/80")
            }
          >
            {escalated ? "Platform action required" : "Deploy health · stale bundle"}
          </p>
          <span className="text-muted-foreground/20 hidden sm:inline" aria-hidden>·</span>
          <p className="text-[11px] text-muted-foreground/65 hidden sm:inline truncate">
            {escalated
              ? `${state.streak} consecutive stale checks — escalate to Lovable Support`
              : "Live bundle has not advanced to the latest publishable key"}
          </p>
        </div>
        <Link
          to="/hq/deploy-health"
          className={
            "font-mono text-[10px] uppercase tracking-[0.25em] shrink-0 transition-colors " +
            (escalated
              ? "text-amber-700 hover:text-amber-800"
              : "text-accent/70 hover:text-accent")
          }
        >
          {escalated ? "Open escalation →" : "Open detector →"}
        </Link>
      </div>
    </div>
  );
}
