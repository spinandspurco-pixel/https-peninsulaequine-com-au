import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { melbourneOvernightStart } from "@/lib/commandCentre/time";
import {
  SCORE,
  rank,
  scoreFollowup,
  snoozeItem,
  dismissItem,
  restoreAll,
  hiddenCount,
  type WorkItem,
} from "@/lib/commandCentre/workQueue";

const BASE_KEY = ["command-centre", "work-queue"] as const;

async function fetchWorkQueue(includeOpsSignals: boolean): Promise<WorkItem[]> {
  const overnight = melbourneOvernightStart();
  const nowIso = new Date().toISOString();

  const [overdue, newEnquiries, reviewCount, mediaCount, staleProjects, lastSmoke] =
    await Promise.all([
      supabase
        .from("inquiries")
        .select("id, name, next_follow_up_at")
        .eq("is_demo", false)
        .not("next_follow_up_at", "is", null)
        .lt("next_follow_up_at", nowIso)
        .order("next_follow_up_at", { ascending: true })
        .limit(10),
      supabase
        .from("inquiries")
        .select("id, name")
        .eq("is_demo", false)
        .gte("created_at", overnight)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("website_suggestions")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "review", "open"]),
      supabase
        .from("media_assets")
        .select("id", { count: "exact", head: true })
        .eq("is_demo", false)
        .neq("approval_state", "approved"),
      supabase
        .from("managed_projects")
        .select("id, name")
        .eq("is_demo", false)
        .in("status", ["active", "in_progress", "in-progress"])
        .is("last_update", null)
        .limit(3),
      includeOpsSignals
        ? supabase
            .from("graph_smoke_reports")
            .select("id, result, created_at")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const items: WorkItem[] = [];
  const now = Date.now();

  // Smoke failure → critical, top of queue (ops/admin only)
  if (includeOpsSignals) {
    const smoke = lastSmoke.data;
    if (smoke?.result && smoke.result.toLowerCase() !== "pass") {
      items.push({
        id: `smoke:${smoke.id}`,
        kind: "smoke",
        label: "Investigate failed Graph Smoke run",
        detail: `Last result: ${smoke.result.toUpperCase()}`,
        href: "/hq/graph-smoke",
        severity: "critical",
        score: SCORE.smokeFailed,
      });
    }
  }

  // Overdue follow-ups — one row each, scored by lateness
  for (const row of overdue.data ?? []) {
    const due = row.next_follow_up_at ? new Date(row.next_follow_up_at).getTime() : now;
    const daysOverdue = Math.max(0, Math.floor((now - due) / 86_400_000));
    items.push({
      id: `followup:${row.id}`,
      kind: "followup",
      label: `Reply to ${row.name ?? "client"}`,
      detail:
        daysOverdue <= 0
          ? "Follow-up due today"
          : daysOverdue === 1
            ? "Follow-up 1 day overdue"
            : `Follow-up ${daysOverdue} days overdue`,
      href: "/hq/inquiries",
      severity: daysOverdue >= 3 ? "critical" : "warn",
      score: scoreFollowup(daysOverdue),
    });
  }

  // New enquiries overnight — one row each
  for (const row of newEnquiries.data ?? []) {
    items.push({
      id: `enquiry:${row.id}`,
      kind: "enquiry",
      label: `Triage new enquiry — ${row.name ?? "unknown"}`,
      detail: "Arrived overnight",
      href: "/hq/inquiries",
      severity: "warn",
      score: SCORE.newEnquiry,
    });
  }

  // Review queue — aggregate, signature includes count so it re-fires when count changes
  const reviewN = reviewCount.count ?? 0;
  if (reviewN > 0) {
    items.push({
      id: `review:open:${reviewN}`,
      kind: "review",
      label:
        reviewN === 1
          ? "Verify 1 knowledge-graph suggestion"
          : `Verify ${reviewN} knowledge-graph suggestions`,
      href: "/hq/review",
      severity: "info",
      score: SCORE.reviewPending,
    });
  }

  // Media awaiting approval — aggregate
  const mediaN = mediaCount.count ?? 0;
  if (mediaN > 0) {
    items.push({
      id: `media:pending:${mediaN}`,
      kind: "media",
      label:
        mediaN === 1
          ? "Approve 1 media asset"
          : `Approve ${mediaN} media assets`,
      href: "/hq/media",
      severity: "info",
      score: SCORE.mediaPending,
    });
  }

  // Stale active projects — one row each
  for (const row of staleProjects.data ?? []) {
    items.push({
      id: `project-stale:${row.id}`,
      kind: "project-stale",
      label: `Record field notes — ${row.name}`,
      detail: "No notes captured yet",
      href: `/hq/projects/${row.id}`,
      severity: "info",
      score: SCORE.projectStale,
    });
  }

  return rank(items);
}

export function useWorkQueue(includeOpsSignals = false) {
  const qc = useQueryClient();
  const queryKey = [...BASE_KEY, { ops: includeOpsSignals }] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => fetchWorkQueue(includeOpsSignals),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey });
  }, [qc, queryKey]);

  const snooze = useCallback(
    (id: string) => {
      snoozeItem(id);
      refresh();
    },
    [refresh],
  );

  const dismiss = useCallback(
    (id: string) => {
      dismissItem(id);
      refresh();
    },
    [refresh],
  );

  const restore = useCallback(() => {
    restoreAll();
    refresh();
  }, [refresh]);

  return {
    items: (query.data ?? []) as WorkItem[],
    isLoading: query.isLoading,
    error: query.error,
    snooze,
    dismiss,
    restore,
    hiddenCount: hiddenCount(),
  };
}
