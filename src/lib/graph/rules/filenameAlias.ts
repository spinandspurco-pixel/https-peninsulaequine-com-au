import type { EntitySignal } from "../evaluate";
import type { ProjectCandidate } from "../evaluate";

/** Slugify a value into a comparable token. */
function slug(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Matches when the filename contains the project code, name, or any alias.
 * Boundary-aware: substring matches inside other words don't count.
 */
export function filenameAliasRule(
  signal: EntitySignal,
  project: ProjectCandidate,
): boolean {
  const filename = signal.filename;
  if (!filename) return false;
  const haystack = `-${slug(filename)}-`;
  const needles = new Set<string>();
  needles.add(slug(project.code));
  needles.add(slug(project.name));
  for (const a of project.aliases ?? []) needles.add(slug(a));
  for (const n of needles) {
    if (!n) continue;
    if (haystack.includes(`-${n}-`)) return true;
  }
  return false;
}
