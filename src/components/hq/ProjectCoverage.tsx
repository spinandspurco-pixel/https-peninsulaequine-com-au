import { useEffect, useState } from "react";
import { projectCoverage, type CoverageBucket } from "@/lib/graph/edges";

const LABELS: Record<string, string> = {
  media: "Media",
  document: "Documents",
  field_note: "Field notes",
  inquiry: "Inquiries",
  staff: "Staff",
};

const STATE_COPY: Record<CoverageBucket["state"], string> = {
  missing: "missing",
  thin: "thin",
  ok: "complete",
};

const STATE_TONE: Record<CoverageBucket["state"], string> = {
  missing: "text-muted-foreground/40",
  thin: "text-amber-400/70",
  ok: "text-emerald-400/70",
};

/**
 * Read-only Coverage block. Phase C.1b.2 — surface only.
 * No accept / reject actions. No suggestion chrome.
 */
export function ProjectCoverage({ projectId }: { projectId: string }) {
  const [buckets, setBuckets] = useState<CoverageBucket[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    projectCoverage(projectId)
      .then((b) => {
        if (!cancelled) setBuckets(b);
      })
      .catch(() => {
        if (!cancelled) setBuckets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (buckets === null) return null;

  // Phase C.1: only surface buckets the graph currently tracks meaningfully.
  const visible = buckets.filter((b) =>
    ["media", "document", "field_note"].includes(b.type),
  );

  return (
    <section className="border-t border-border/10 pt-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/45 mb-5">
        Coverage
      </p>
      <ul className="grid grid-cols-3 gap-x-10 gap-y-4">
        {visible.map((b) => (
          <li key={b.type} className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/50">
              {LABELS[b.type] ?? b.type}
            </span>
            <span className="font-serif text-2xl font-light text-foreground/90 tabular-nums">
              {b.count}
            </span>
            <span
              className={`text-[10px] uppercase tracking-[0.22em] ${STATE_TONE[b.state]}`}
            >
              {STATE_COPY[b.state]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
