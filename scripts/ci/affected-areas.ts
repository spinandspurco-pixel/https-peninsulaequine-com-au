/**
 * Maps a security finding to the files in this repo most likely to be the
 * source of the misconfiguration. Pure function over an injected
 * `searcher`, so it can be unit-tested without spawning ripgrep.
 *
 * The mapping is deliberately heuristic: we surface candidate files in
 * the auto-filed nightly issue to give the on-call reviewer a starting
 * point, not to make automated decisions.
 */

export interface AddedFinding {
  source: string;
  fingerprint: string;
  name: string;
  level: string;
  schema?: string;
  object?: string;
  description?: string;
  searchHints: string[];
}

export type Searcher = (token: string) => Promise<string[]>;

export interface AffectedFinding extends AddedFinding {
  affectedFiles: string[];
}

/**
 * Resolve affected files per finding. Hints are de-duplicated and capped
 * to keep the issue body well under GitHub's 65k limit even when the
 * repo has many incidental matches.
 */
export async function mapAffectedAreas(
  findings: AddedFinding[],
  search: Searcher,
  opts: { maxFilesPerFinding?: number } = {},
): Promise<AffectedFinding[]> {
  const cap = opts.maxFilesPerFinding ?? 10;
  const out: AffectedFinding[] = [];
  for (const f of findings) {
    const hits = new Set<string>();
    for (const hint of dedupe(f.searchHints)) {
      if (!hint || hint.length < 3) continue;
      try {
        const files = await search(hint);
        for (const file of files) hits.add(file);
      } catch {
        // a single failed hint shouldn't abort issue creation
      }
      if (hits.size >= cap) break;
    }
    out.push({ ...f, affectedFiles: Array.from(hits).slice(0, cap) });
  }
  return out;
}

/**
 * Markdown section appended to the nightly tracking issue body. Empty
 * string when no findings have any candidate files — the caller should
 * omit the section entirely in that case.
 */
export function renderAffectedAreas(findings: AffectedFinding[]): string {
  const withFiles = findings.filter((f) => f.affectedFiles.length > 0);
  if (withFiles.length === 0) return "";

  const lines: string[] = ["### Affected code areas", ""];
  for (const f of withFiles) {
    const label = f.schema && f.object ? `${f.schema}.${f.object}` : f.object ?? f.name;
    lines.push(`- **[${f.source}] ${f.name}** — \`${label}\``);
    for (const file of f.affectedFiles) {
      lines.push(`  - \`${file}\``);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function dedupe<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}
