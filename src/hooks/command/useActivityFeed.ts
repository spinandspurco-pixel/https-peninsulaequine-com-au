import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Unified, human-readable activity feed for the Command Centre.
 *
 * Sources (all read-only):
 *   - activity_log
 *   - inquiry_activity
 *   - graph_smoke_reports
 *   - media_assets (recent inserts)
 *
 * Each source is normalised into the same shape and merged client-side,
 * sorted newest-first. We cap each source at 12 rows and the final feed at
 * 24 to keep the band scannable.
 */
export type FeedKind = "activity" | "inquiry" | "smoke" | "media";

export interface FeedEntry {
  id: string;
  kind: FeedKind;
  ts: string; // ISO
  summary: string;
  href?: string;
}

const CAP_PER_SOURCE = 8;
const CAP_TOTAL = 8;

function humaniseInquiryEvent(event_type: string, to_value: string | null): string {
  switch (event_type) {
    case "created":
      return "New enquiry received";
    case "status_changed":
      return to_value ? `Enquiry status → ${to_value}` : "Enquiry status changed";
    case "stage_changed":
      return to_value ? `Enquiry stage → ${to_value}` : "Enquiry stage changed";
    case "note_added":
      return "Note added to enquiry";
    case "follow_up_sent":
      return "Follow-up sent";
    default:
      return `Enquiry · ${event_type.replace(/_/g, " ")}`;
  }
}

async function fetchActivityFeed(includeOpsSignals: boolean): Promise<FeedEntry[]> {
  const [activity, inquiry, smoke, media] = await Promise.all([
    supabase
      .from("activity_log")
      .select("id, created_at, title, description, entity_type, entity_id")
      .order("created_at", { ascending: false })
      .limit(CAP_PER_SOURCE),
    supabase
      .from("inquiry_activity")
      .select("id, created_at, event_type, to_value, inquiry_id")
      .order("created_at", { ascending: false })
      .limit(CAP_PER_SOURCE),
    includeOpsSignals
      ? supabase
          .from("graph_smoke_reports")
          .select("id, created_at, result, exit_code, environment")
          .order("created_at", { ascending: false })
          .limit(CAP_PER_SOURCE)
      : Promise.resolve({ data: [] as Array<{ id: string; created_at: string; result: string | null; exit_code: number | null; environment: string | null }> }),
    supabase
      .from("media_assets")
      .select("id, created_at, title, approval_state, project_id")
      .eq("is_demo", false)
      .order("created_at", { ascending: false })
      .limit(CAP_PER_SOURCE),
  ]);

  const out: FeedEntry[] = [];

  for (const row of activity.data ?? []) {
    out.push({
      id: `activity:${row.id}`,
      kind: "activity",
      ts: row.created_at,
      summary: row.title || row.description || "Activity recorded",
      href:
        row.entity_type === "inquiry" && row.entity_id
          ? `/hq/inquiries`
          : row.entity_type === "project" && row.entity_id
            ? `/hq/projects/${row.entity_id}`
            : undefined,
    });
  }

  for (const row of inquiry.data ?? []) {
    out.push({
      id: `inquiry:${row.id}`,
      kind: "inquiry",
      ts: row.created_at,
      summary: humaniseInquiryEvent(row.event_type, row.to_value),
      href: `/hq/inquiries`,
    });
  }

  if (includeOpsSignals) {
    for (const row of smoke.data ?? []) {
      const verdict = row.result?.toUpperCase() ?? "RUN";
      out.push({
        id: `smoke:${row.id}`,
        kind: "smoke",
        ts: row.created_at,
        summary: `Graph Smoke · ${verdict}${row.exit_code != null ? ` · exit ${row.exit_code}` : ""}`,
        href: `/hq/graph-smoke`,
      });
    }
  }

  for (const row of media.data ?? []) {
    const status =
      row.approval_state && row.approval_state !== "approved"
        ? ` (${row.approval_state})`
        : "";
    out.push({
      id: `media:${row.id}`,
      kind: "media",
      ts: row.created_at,
      summary: `Media added · ${row.title ?? "Untitled"}${status}`,
      href: `/hq/media`,
    });
  }

  out.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
  return out.slice(0, CAP_TOTAL);
}

export function useActivityFeed(includeOpsSignals = false) {
  return useQuery({
    queryKey: ["command-centre", "activity-feed", { ops: includeOpsSignals }],
    queryFn: () => fetchActivityFeed(includeOpsSignals),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  });
}
