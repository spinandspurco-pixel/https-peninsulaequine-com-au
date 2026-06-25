import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { melbourneTodayStart, melbourneOvernightStart } from "@/lib/commandCentre/time";

/**
 * Read-only counts that power the five Priority cards.
 *
 * All queries are HEAD counts with no row payload, so this hook stays cheap
 * to refetch on the 60s cadence. Demo rows are excluded.
 *
 * Field meaning per card (drill-down target in brackets):
 *   - enquiries        → new since "overnight" cutoff   [/hq/inquiries]
 *   - projects         → active managed_projects        [/hq/projects]
 *   - clients_active   → distinct project clients today [/hq/clients]
 *   - media_pending    → media awaiting approval        [/hq/media]
 *   - review_pending   → website suggestions in review  [/hq/review]
 */
export type PriorityCounts = {
  enquiries: number;
  projects: number;
  clients_active: number;
  media_pending: number;
  review_pending: number;
};

async function fetchPriorityCounts(): Promise<PriorityCounts> {
  const overnight = melbourneOvernightStart();
  const _today = melbourneTodayStart();

  const [enquiries, projects, mediaPending, reviewPending] = await Promise.all([
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_demo", false)
      .gte("created_at", overnight),
    supabase
      .from("managed_projects")
      .select("id", { count: "exact", head: true })
      .eq("is_demo", false)
      .in("status", ["active", "in_progress", "in-progress", "planning"]),
    supabase
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("is_demo", false)
      .neq("approval_state", "approved"),
    supabase
      .from("website_suggestions")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "review", "open"]),
  ]);

  // "clients_active" = distinct managed_projects with an update today.
  // Cheap proxy: count managed_projects whose updated_at >= today.
  const { count: clientsActive } = await supabase
    .from("managed_projects")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", false)
    .gte("updated_at", _today);

  return {
    enquiries: enquiries.count ?? 0,
    projects: projects.count ?? 0,
    clients_active: clientsActive ?? 0,
    media_pending: mediaPending.count ?? 0,
    review_pending: reviewPending.count ?? 0,
  };
}

export function usePriorityCounts() {
  return useQuery({
    queryKey: ["command-centre", "priority-counts"],
    queryFn: fetchPriorityCounts,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}
