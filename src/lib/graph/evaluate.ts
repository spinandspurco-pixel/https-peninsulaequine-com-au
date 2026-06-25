/**
 * Rule engine for Project ↔ Entity matching.
 *
 * Each rule is a pure function operating on the candidate entity and a
 * project. Adding a rule = adding a file in `./rules/` and registering it
 * below. The evaluator combines rule results; numeric weights live here as
 * an internal implementation detail and are never persisted.
 */
import type { CandidateEdge, NodeRef } from "./types";
import { filenameAliasRule } from "./rules/filenameAlias";
import { projectTagRule } from "./rules/projectTag";
import { textMentionRule } from "./rules/textMention";

/** Minimal project shape the rule engine needs. Kept local to avoid coupling. */
export interface ProjectCandidate {
  id: string;
  name: string;
  code: string;
  aliases: string[];
}

/**
 * A signal an entity may expose to the rule engine. Producers extract these
 * from the source row before calling `evaluate`.
 */
export interface EntitySignal {
  /** Human filename, title, or original upload name. */
  filename?: string;
  /** Free-text description / body. */
  text?: string;
  /** Tags attached to the entity. */
  tags?: string[];
}

interface Rule {
  name: string;
  /** Score contribution if the rule matches, internal only. */
  weight: number;
  test: (signal: EntitySignal, project: ProjectCandidate) => boolean;
}

const RULES: Rule[] = [
  { name: "filename_alias", weight: 40, test: filenameAliasRule },
  { name: "project_tag", weight: 35, test: projectTagRule },
  { name: "text_mention", weight: 25, test: textMentionRule },
];

/** Threshold above which a candidate is surfaced as a suggestion. */
const SUGGEST_THRESHOLD = 35;

/**
 * Run the rule set against every active project. Returns ranked candidate
 * edges. Does not write anything.
 */
export function evaluate(
  entity: NodeRef,
  signal: EntitySignal,
  projects: ProjectCandidate[],
): CandidateEdge[] {
  const candidates: CandidateEdge[] = [];
  for (const project of projects) {
    const matchedRules: string[] = [];
    let score = 0;
    for (const rule of RULES) {
      if (rule.test(signal, project)) {
        matchedRules.push(rule.name);
        score += rule.weight;
      }
    }
    if (score >= SUGGEST_THRESHOLD) {
      candidates.push({
        to: { type: "project", id: project.id },
        matchedRules,
        score,
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  // Silence the unused-parameter warning while preserving the API shape for
  // future rules that need the entity reference (e.g. uploader history).
  void entity;
  return candidates;
}

export { RULES as __RULES_FOR_TEST };
