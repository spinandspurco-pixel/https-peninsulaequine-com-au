import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Read-only "needs attention" list for the Command Centre Watchlist band.
 *
 * Each item names the *thing* that needs action and where to go to act on
 * it. We intentionally do not write here — Watchlist is a doorway, not a
 * task UI.
 */
export interface WatchlistItem {
  id: string;
  label: string;
  detail?: string;
  href: string;
  severity: "info" | "warn" | "critical";
}

async function fetchWatchlist(includeOpsSignals: boolean): Promise<WatchlistItem[]> {
  const out: WatchlistItem[] = [];

  const [overdueFollowUps, pendingMedia, pendingReview, lastSmoke, staleProjects] =
    await Promise.all([
      supabase
        .from("inquiries")
        .select("id, name, next_follow_up_at")
        .eq("is_demo", false)
        .not("next_follow_up_at", "is", null)
        .lt("next_follow_up_at", new Date().toISOString())
        .order("next_follow_up_at", { ascending: true })
        .limit(5),
      supabase
        .from("media_assets")
        .select("id", { count: "exact", head: true })
        .eq("is_demo", false)
        .neq("approval_state", "approved"),
      supabase
        .from("website_suggestions")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "review", "open"]),
      includeOpsSignals
        ? supabase
            .from("graph_smoke_reports")
            .select("id, result, created_at")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("managed_projects")
        .select("id, name")
        .eq("is_demo", false)
        .in("status", ["active", "in_progress", "in-progress"])
        .is("last_update", null)
        .limit(5),
    ]);

  for (const row of overdueFollowUps.data ?? []) {
    out.push({
      id: `followup:${row.id}`,
      label: `Follow-up overdue — ${row.name}`,
      href: "/hq/inquiries",
      severity: "warn",
    });
  }

  if ((pendingMedia.count ?? 0) > 0) {
    out.push({
      id: "media-pending",
      label: `${pendingMedia.count} media awaiting review`,
      href: "/hq/media",
      severity: "info",
    });
  }

  if ((pendingReview.count ?? 0) > 0) {
    out.push({
      id: "review-pending",
      label: `${pendingReview.count} suggestions in review`,
      href: "/hq/review",
      severity: "info",
    });
  }

  if (includeOpsSignals) {
    const smoke = lastSmoke.data;
    if (smoke && smoke.result && smoke.result.toLowerCase() !== "pass") {
      out.push({
        id: "smoke-failed",
        label: `Last Graph Smoke: ${smoke.result.toUpperCase()}`,
        href: "/hq/graph-smoke",
        severity: "critical",
      });
    }
  }

  for (const row of staleProjects.data ?? []) {
    out.push({
      id: `project-no-notes:${row.id}`,
      label: `${row.name} — no field notes recorded`,
      href: `/hq/projects/${row.id}`,
      severity: "info",
    });
  }

  return out.slice(0, 6);
}

export function useWatchlist(includeOpsSignals = false) {
  return useQuery({
    queryKey: ["command-centre", "watchlist", { ops: includeOpsSignals }],
    queryFn: () => fetchWatchlist(includeOpsSignals),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}
