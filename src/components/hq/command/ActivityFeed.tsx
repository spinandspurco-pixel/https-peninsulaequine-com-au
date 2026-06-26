import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useActivityFeed, type FeedEntry } from "@/hooks/command/useActivityFeed";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<FeedEntry["kind"], string> = {
  activity: "Activity",
  inquiry: "Enquiry",
  smoke: "Diagnostics",
  media: "Media",
};

export function ActivityFeed({ includeOpsSignals = false }: { includeOpsSignals?: boolean } = {}) {
  const { data, isLoading, error } = useActivityFeed(includeOpsSignals);

  if (isLoading) {
    return <p className="text-[12px] text-muted-foreground/55">Loading recent activity…</p>;
  }
  if (error) {
    return <p className="text-[12px] text-muted-foreground/55">Activity feed unavailable.</p>;
  }
  if (!data || data.length === 0) {
    return <p className="text-[12px] text-muted-foreground/55">No recent activity recorded.</p>;
  }

  return (
    <ol className="space-y-3">
      {data.map((entry) => {
        const body = (
          <>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/45 mr-3">
              {KIND_LABEL[entry.kind]}
            </span>
            <span className="text-foreground/80">{entry.summary}</span>
            <span className="ml-3 text-muted-foreground/45 text-[11px]">
              {formatDistanceToNow(new Date(entry.ts), { addSuffix: true })}
            </span>
          </>
        );
        return (
          <li
            key={entry.id}
            className="text-[12px] leading-snug border-b border-border/5 pb-3 last:border-b-0"
          >
            {entry.href ? (
              <Link
                to={entry.href}
                className={cn(
                  "block transition-colors hover:text-accent",
                  "focus:outline-none focus-visible:text-accent",
                )}
              >
                {body}
              </Link>
            ) : (
              <div>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
