import type { EntitySignal, ProjectCandidate } from "../evaluate";

function slug(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Matches when a tag equals the project's code, name, or alias (slug-compared). */
export function projectTagRule(
  signal: EntitySignal,
  project: ProjectCandidate,
): boolean {
  const tags = signal.tags ?? [];
  if (!tags.length) return false;
  const needles = new Set<string>();
  needles.add(slug(project.code));
  needles.add(slug(project.name));
  for (const a of project.aliases ?? []) needles.add(slug(a));
  for (const t of tags) {
    const s = slug(t);
    if (s && needles.has(s)) return true;
  }
  return false;
}
