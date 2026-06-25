/**
 * Edges API — the only surface other modules should use to read/write the
 * Peninsula Knowledge Graph.
 *
 * Phase C.1 scope: Project-centric edges only. Callers are expected to pass
 * `project` as one side of the relationship. Helpers accept either direction.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  ACTIVE_EDGE_STATUSES,
  type EdgeStatus,
  type GraphEdge,
  type NodeRef,
  type NodeType,
  type Relation,
} from "./types";

export interface LinkOpts {
  from: NodeRef;
  to: NodeRef;
  relation?: Relation;
  status?: EdgeStatus;
  matchedRules?: string[];
}

export async function link({
  from,
  to,
  relation = "belongs_to",
  status = "manual",
  matchedRules = [],
}: LinkOpts): Promise<GraphEdge> {
  const { data, error } = await supabase
    .from("hq_graph_edges")
    .upsert(
      {
        from_type: from.type,
        from_id: from.id,
        to_type: to.type,
        to_id: to.id,
        relation,
        status,
        matched_rules: matchedRules,
      },
      { onConflict: "from_type,from_id,to_type,to_id,relation" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as GraphEdge;
}

export async function setStatus(
  edgeId: string,
  status: EdgeStatus,
): Promise<void> {
  const { error } = await supabase
    .from("hq_graph_edges")
    .update({ status })
    .eq("id", edgeId);
  if (error) throw error;
}

export async function unlink(edgeId: string): Promise<void> {
  const { error } = await supabase
    .from("hq_graph_edges")
    .delete()
    .eq("id", edgeId);
  if (error) throw error;
}

export interface RelatedQuery {
  /** Filter by status. Defaults to active statuses (system_linked, manual, verified). */
  statuses?: readonly EdgeStatus[];
  /** Restrict to a specific target node type. */
  toType?: NodeType;
  relation?: Relation;
}

/** Edges where (from_type, from_id) matches the supplied node. */
export async function edgesFrom(
  node: NodeRef,
  q: RelatedQuery = {},
): Promise<GraphEdge[]> {
  let query = supabase
    .from("hq_graph_edges")
    .select("*")
    .eq("from_type", node.type)
    .eq("from_id", node.id)
    .in("status", [...(q.statuses ?? ACTIVE_EDGE_STATUSES)]);
  if (q.toType) query = query.eq("to_type", q.toType);
  if (q.relation) query = query.eq("relation", q.relation);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GraphEdge[];
}

/** Edges where (to_type, to_id) matches the supplied node. */
export async function edgesTo(
  node: NodeRef,
  q: RelatedQuery = {},
): Promise<GraphEdge[]> {
  let query = supabase
    .from("hq_graph_edges")
    .select("*")
    .eq("to_type", node.type)
    .eq("to_id", node.id)
    .in("status", [...(q.statuses ?? ACTIVE_EDGE_STATUSES)]);
  if (q.toType) query = query.eq("from_type", q.toType);
  if (q.relation) query = query.eq("relation", q.relation);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GraphEdge[];
}

/** Suggestions awaiting human judgement for a given target node. */
export async function pendingSuggestionsFor(
  node: NodeRef,
): Promise<GraphEdge[]> {
  const { data, error } = await supabase
    .from("hq_graph_edges")
    .select("*")
    .eq("to_type", node.type)
    .eq("to_id", node.id)
    .eq("status", "suggested");
  if (error) throw error;
  return (data ?? []) as GraphEdge[];
}

/**
 * Bulk fetch: which of the supplied media ids have at least one suggested edge?
 * Used by Media Vault to render the Smart Attach chip without N round-trips.
 */
export async function mediaIdsWithSuggestions(
  mediaIds: string[],
): Promise<Set<string>> {
  if (mediaIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from("hq_graph_edges")
    .select("to_id")
    .eq("to_type", "media")
    .eq("status", "suggested")
    .in("to_id", mediaIds);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.to_id as string));
}

/** Total open suggestions across the graph. Used by Command Centre. */
export async function countOpenSuggestions(): Promise<number> {
  const { count, error } = await supabase
    .from("hq_graph_edges")
    .select("id", { count: "exact", head: true })
    .eq("status", "suggested");
  if (error) throw error;
  return count ?? 0;
}

/** Full suggestion queue with the data needed to render context. */
export async function listOpenSuggestions(limit = 200): Promise<GraphEdge[]> {
  const { data, error } = await supabase
    .from("hq_graph_edges")
    .select("*")
    .eq("status", "suggested")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as GraphEdge[];
}

/**
 * Human-accepted a suggestion. Promotes status to `verified`; preserves
 * matched_rules and edge identity. Idempotent.
 */
export async function acceptSuggestion(edgeId: string): Promise<void> {
  const { error } = await supabase
    .from("hq_graph_edges")
    .update({ status: "verified" })
    .eq("id", edgeId);
  if (error) throw error;
}

/** Human-rejected a suggestion. Promotes status to `dismissed`. */
export async function dismissSuggestion(edgeId: string): Promise<void> {
  const { error } = await supabase
    .from("hq_graph_edges")
    .update({ status: "dismissed" })
    .eq("id", edgeId);
  if (error) throw error;
}

export interface CoverageBucket {
  type: NodeType;
  count: number;
  state: "missing" | "thin" | "ok";
}

const COVERAGE_THRESHOLDS: Partial<Record<NodeType, { thin: number; ok: number }>> = {
  media: { thin: 1, ok: 5 },
  document: { thin: 1, ok: 3 },
  field_note: { thin: 1, ok: 3 },
  inquiry: { thin: 1, ok: 1 },
  staff: { thin: 1, ok: 1 },
};

/**
 * Per-project coverage across active edge statuses.
 * Pure derivation — no extra storage.
 */
export async function projectCoverage(
  projectId: string,
): Promise<CoverageBucket[]> {
  const edges = await edgesFrom({ type: "project", id: projectId });
  const counts = new Map<NodeType, number>();
  for (const e of edges) {
    counts.set(e.to_type, (counts.get(e.to_type) ?? 0) + 1);
  }
  const buckets: CoverageBucket[] = [];
  for (const type of ["media", "document", "field_note", "inquiry", "staff"] as NodeType[]) {
    const count = counts.get(type) ?? 0;
    const t = COVERAGE_THRESHOLDS[type] ?? { thin: 1, ok: 5 };
    const state: CoverageBucket["state"] =
      count <= 0 ? "missing" : count < t.ok ? "thin" : "ok";
    buckets.push({ type, count, state });
  }
  return buckets;
}
