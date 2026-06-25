import type { EntitySignal, ProjectCandidate } from "../evaluate";

function norm(v: string): string {
  return v.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Matches when the entity's free-text body mentions the project name or any
 * alias as a whole-word substring. Code/slug aliases are skipped here to
 * avoid false positives in prose.
 */
export function textMentionRule(
  signal: EntitySignal,
  project: ProjectCandidate,
): boolean {
  const text = signal.text;
  if (!text) return false;
  const haystack = ` ${norm(text)} `;
  const needles = new Set<string>();
  needles.add(norm(project.name));
  for (const a of project.aliases ?? []) {
    const n = norm(a);
    // Skip pure slug-style aliases; those are for filenames/tags.
    if (n.length >= 3 && !/^[a-z0-9-]+$/.test(n.replace(/ /g, "-"))) {
      needles.add(n);
      continue;
    }
    if (n.length >= 4 && n.includes(" ")) needles.add(n);
  }
  for (const n of needles) {
    if (!n) continue;
    if (haystack.includes(` ${n} `)) return true;
  }
  return false;
}
