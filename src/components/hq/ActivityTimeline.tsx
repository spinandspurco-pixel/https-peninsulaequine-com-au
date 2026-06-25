import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
  fetchHqActivity,
  groupHqActivity,
  KIND_BADGE,
  type HqActivityEvent,
  type HqActivityGroup,
} from "@/lib/hqActivity";

interface Props {
  limit?: number;
  className?: string;
}

export function ActivityTimeline({ limit = 80, className = "" }: Props) {
  const [groups, setGroups] = useState<HqActivityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const events = await fetchHqActivity({ limit });
        if (cancelled) return;
        setGroups(groupHqActivity(events));
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (loading && groups.length === 0) {
    return (
      <p className="font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/40">
        Reading the wire…
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="font-mono text-[11px] uppercase tracking-[0.4em] text-red-500/80">
        Failed to load · {error}
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="font-serif italic text-foreground/55 py-8">
        Nothing on the wire yet. New inquiries, project moves and edits will record here.
      </p>
    );
  }

  return (
    <div className={`space-y-14 ${className}`}>
      {groups.map((group) => (
        <section key={group.key} className="grid grid-cols-12 gap-x-6 gap-y-6">
          <header className="col-span-12 sm:col-span-3 space-y-2">
            <p className="font-mono uppercase text-[9px] tracking-[0.45em] text-accent/55">
              {group.label}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/35">
              {group.events.length} event{group.events.length === 1 ? "" : "s"}
            </p>
          </header>
          <ol className="col-span-12 sm:col-span-9 divide-y divide-accent/12 border-t border-accent/15">
            {group.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function EventRow({ event }: { event: HqActivityEvent }) {
  const time = format(new Date(event.at), "HH:mm");
  const distance = formatDistanceToNow(new Date(event.at), { addSuffix: true });
  const actor = event.actorName ?? "—";
  const role = event.actorRole ? event.actorRole.replace(/_/g, " ") : null;

  return (
    <li className="grid grid-cols-12 gap-4 py-5">
      <div className="col-span-12 sm:col-span-3 font-mono uppercase text-[10px] tracking-[0.36em] text-foreground/45">
        <div className="text-foreground/70">{time}</div>
        <div className="mt-1 normal-case tracking-normal font-sans text-foreground/35 text-[11px]">
          {distance}
        </div>
      </div>
      <div className="col-span-12 sm:col-span-9 space-y-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-serif text-[1.02rem] leading-snug text-foreground/85">
            {event.actionLabel}
          </span>
          <span className="font-mono uppercase text-[9px] tracking-[0.4em] text-accent/55">
            {KIND_BADGE[event.kind]}
          </span>
        </div>
        {event.targetLabel && (
          <p className="font-sans font-light text-foreground/65 leading-snug text-[0.95rem]">
            {event.href ? (
              <Link
                to={event.href}
                className="hover:text-accent transition-colors underline-offset-4 hover:underline"
              >
                {event.targetLabel}
              </Link>
            ) : (
              event.targetLabel
            )}
          </p>
        )}
        {event.detail && (
          <p className="font-sans font-light text-foreground/50 leading-snug text-[0.88rem]">
            {event.detail}
          </p>
        )}
        <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.32em] text-foreground/35 pt-1">
          <span>
            By · <span className="text-foreground/65 normal-case tracking-normal font-sans">{actor}</span>
          </span>
          {role && <span>· {role}</span>}
        </div>
      </div>
    </li>
  );
}
