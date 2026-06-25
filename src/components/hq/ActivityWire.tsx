import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
  fetchHqActivity,
  KIND_BADGE,
  type HqActivityEvent,
} from "@/lib/hqActivity";

interface Props {
  limit?: number;
}

// Compact activity wire for Command Centre. Pulls the same unified feed as
// /hq/activity so signal stays consistent across surfaces.
export function ActivityWire({ limit = 5 }: Props) {
  const [events, setEvents] = useState<HqActivityEvent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchHqActivity({ limit });
        if (!cancelled) setEvents(data);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (!ready) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/35">
        Reading the wire…
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground/50 italic font-light">
        Nothing on the wire yet. New inquiries, quotes and project moves will record here.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <ul className="border-l border-accent/20 pl-5 sm:pl-6 space-y-0">
        {events.map((event) => (
          <li key={event.id} className="py-3 group relative">
            <div className="absolute -left-[6px] sm:-left-[7px] top-[18px] h-px w-3 bg-accent/25 group-hover:bg-accent/60 transition-colors" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
              <p className="text-[13px] text-foreground/85 font-light leading-relaxed">
                {event.actionLabel}
                {event.targetLabel && (
                  <span className="text-foreground/55"> · {event.targetLabel}</span>
                )}
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.22em] text-accent/45">
                  {KIND_BADGE[event.kind]}
                </span>
              </p>
              <time
                dateTime={event.at}
                title={format(new Date(event.at), "PPpp")}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 whitespace-nowrap"
              >
                {formatDistanceToNow(new Date(event.at), { addSuffix: true })}
              </time>
            </div>
            {event.actorName && (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/35">
                {event.actorName}
                {event.actorRole ? (
                  <span className="text-foreground/25"> · {event.actorRole.replace(/_/g, " ")}</span>
                ) : null}
              </p>
            )}
          </li>
        ))}
      </ul>
      <Link
        to="/hq/activity"
        className="inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-accent transition-colors duration-500 text-[10px] tracking-[0.42em]"
      >
        <span className="w-8 h-px bg-accent/40 transition-all duration-500 hover:w-14" />
        Open full timeline
      </Link>
    </div>
  );
}
