/**
 * Peninsula Knowledge Graph — canonical types.
 *
 * Phase C.1 implements Project-centric relationships only.
 * Other node types are declared here so the type system reserves them,
 * but no module should register edges for them until they have a
 * concrete operational need.
 */

/** Every kind of object that can be a node in the graph. */
export const NODE_TYPES = [
  "project",
  "media",
  "document",
  "field_note",
  "inquiry",
  "note",
  "staff",
  // Reserved for future phases — do NOT register edges yet.
  "client",
  "horse",
  "invoice",
  "deliverable",
  "proposal",
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

/** Node types actively wired in Phase C.1. */
export const ACTIVE_NODE_TYPES: readonly NodeType[] = [
  "project",
  "media",
  "document",
  "field_note",
  "inquiry",
  "note",
  "staff",
];

export const RELATIONS = [
  "belongs_to",
  "references",
  "authored_by",
  "attached_to",
] as const;
export type Relation = (typeof RELATIONS)[number];

/**
 * Lifecycle status of an edge — the canonical truth signal.
 * Numeric confidence is never persisted; the rules that produced
 * the edge live in `matched_rules`.
 */
export const EDGE_STATUSES = [
  "system_linked", // produced by a legacy column or deterministic system import
  "suggested", // rule engine surfaced this; needs human judgement
  "manual", // human explicitly attached
  "verified", // human explicitly confirmed a system-linked or suggested edge
  "dismissed", // human rejected a suggestion
] as const;
export type EdgeStatus = (typeof EDGE_STATUSES)[number];

/** Statuses that count as a "real" attachment (i.e. not pending/rejected). */
export const ACTIVE_EDGE_STATUSES: readonly EdgeStatus[] = [
  "system_linked",
  "manual",
  "verified",
];

export interface GraphEdge {
  id: string;
  from_type: NodeType;
  from_id: string;
  to_type: NodeType;
  to_id: string;
  relation: Relation;
  status: EdgeStatus;
  matched_rules: string[];
  created_by: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NodeRef {
  type: NodeType;
  id: string;
}

export interface RuleMatch {
  rule: string;
  matched: boolean;
}

export interface CandidateEdge {
  to: NodeRef;
  matchedRules: string[];
  /** Internal-only, for ranking. Not persisted, not shown. */
  score: number;
}
