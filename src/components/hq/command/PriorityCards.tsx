import { Link } from "react-router-dom";
import { usePriorityCounts, type PriorityCounts } from "@/hooks/command/usePriorityCounts";
import { hasWidget, type CommandView, type CommandWidget } from "@/lib/commandCentre/roleView";
import { cn } from "@/lib/utils";

interface Props {
  view: CommandView;
}

interface CardSpec {
  widget: CommandWidget;
  label: string;
  to: string;
  read: (c: PriorityCounts) => number;
  caption: (n: number) => string;
}

const CARDS: CardSpec[] = [
  {
    widget: "priority-enquiries",
    label: "Enquiries",
    to: "/hq/inquiries",
    read: (c) => c.enquiries,
    caption: (n) => (n === 0 ? "none overnight" : n === 1 ? "1 new overnight" : `${n} new overnight`),
  },
  {
    widget: "priority-projects",
    label: "Projects",
    to: "/hq/projects",
    read: (c) => c.projects,
    caption: (n) => (n === 0 ? "no active builds" : n === 1 ? "1 active build" : `${n} active builds`),
  },
  {
    widget: "priority-clients",
    label: "Clients",
    to: "/hq/clients",
    read: (c) => c.clients_active,
    caption: (n) => (n === 0 ? "no movement today" : n === 1 ? "1 client touched today" : `${n} clients touched today`),
  },
  {
    widget: "priority-media",
    label: "Media",
    to: "/hq/media",
    read: (c) => c.media_pending,
    caption: (n) => (n === 0 ? "all approved" : n === 1 ? "1 awaiting review" : `${n} awaiting review`),
  },
  {
    widget: "priority-review",
    label: "Review Queue",
    to: "/hq/review",
    read: (c) => c.review_pending,
    caption: (n) => (n === 0 ? "clear" : n === 1 ? "1 suggestion open" : `${n} suggestions open`),
  },
];

export function PriorityCards({ view }: Props) {
  const { data, isLoading, error } = usePriorityCounts();
  const visible = CARDS.filter((c) => hasWidget(view, c.widget));
  if (visible.length === 0) return null;

  return (
    <ul
      className={cn(
        "grid gap-x-10 gap-y-8",
        "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
      )}
    >
      {visible.map((card) => {
        const count = data ? card.read(data) : null;
        return (
          <li key={card.widget}>
            <Link
              to={card.to}
              className="group block focus:outline-none"
              aria-label={`${card.label} — ${
                isLoading ? "loading" : count === null ? "unavailable" : card.caption(count)
              }`}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55 group-hover:text-accent/80 transition-colors">
                {card.label}
              </p>
              <p
                className={cn(
                  "mt-3 font-serif text-5xl sm:text-6xl leading-none tracking-tight transition-colors",
                  count == null
                    ? "text-foreground/25"
                    : count > 0
                      ? "text-foreground/90 group-hover:text-accent"
                      : "text-foreground/40",
                )}
              >
                {error ? "—" : isLoading ? "·" : count}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground/60 leading-snug">
                {error
                  ? "unavailable"
                  : isLoading || count == null
                    ? "loading…"
                    : card.caption(count)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
