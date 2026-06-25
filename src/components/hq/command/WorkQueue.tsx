import { Link } from "react-router-dom";
import { useWorkQueue } from "@/hooks/command/useWorkQueue";
import { applyHiddenAndCap } from "@/lib/commandCentre/workQueue";
import { cn } from "@/lib/utils";

const MAX_ITEMS = 5;

const SEVERITY_DOT: Record<"info" | "warn" | "critical", string> = {
  info: "bg-foreground/30",
  warn: "bg-amber-500/70",
  critical: "bg-rose-500/80",
};

/**
 * Ranked work queue — answers "What should I do first?".
 *
 * - Hard cap at 5 visible items.
 * - Each item is snoozable (24h) or dismissable (7d) so the dashboard
 *   gets quieter as the operator works through it.
 * - "Restore hidden" surfaces only when at least one item is hidden.
 */
export function WorkQueue() {
  const { items, isLoading, error, snooze, dismiss, restore, hiddenCount } =
    useWorkQueue();

  if (isLoading) {
    return (
      <p className="text-[12px] text-muted-foreground/55">Ranking your day…</p>
    );
  }
  if (error) {
    return (
      <p className="text-[12px] text-muted-foreground/55">
        Work queue unavailable.
      </p>
    );
  }

  const visible = applyHiddenAndCap(items, MAX_ITEMS);

  if (visible.length === 0) {
    return (
      <div className="space-y-3">
        <p className="font-serif text-2xl text-foreground/70 leading-tight">
          {hiddenCount > 0
            ? "Nothing else demands you right now."
            : "Inbox zero. Nothing demands you right now."}
        </p>
        <p className="text-[12px] text-muted-foreground/55">
          The queue will repopulate as new signals arrive.
        </p>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={restore}
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 hover:text-accent transition-colors"
          >
            Restore {hiddenCount} hidden →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <ol className="divide-y divide-border/10 border-y border-border/10">
        {visible.map((item, idx) => (
          <li
            key={item.id}
            className="group grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-4 py-4"
          >
            <span
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/45 pt-[3px]"
              aria-hidden
            >
              {String(idx + 1).padStart(2, "0")}
            </span>

            <Link
              to={item.href}
              className="block focus:outline-none focus-visible:text-accent"
            >
              <p className="flex items-start gap-2 text-[14px] sm:text-[15px] leading-snug text-foreground/85 group-hover:text-accent transition-colors">
                <span
                  aria-hidden
                  className={cn(
                    "mt-[8px] inline-block h-1.5 w-1.5 rounded-full shrink-0",
                    SEVERITY_DOT[item.severity],
                  )}
                />
                <span>{item.label}</span>
              </p>
              {item.detail && (
                <p className="mt-1 ml-3.5 text-[11px] text-muted-foreground/55">
                  {item.detail}
                </p>
              )}
            </Link>

            <div className="flex items-center gap-3 pt-[3px] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => snooze(item.id)}
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/55 hover:text-accent transition-colors"
                aria-label={`Snooze "${item.label}" for 24 hours`}
              >
                Snooze
              </button>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/55 hover:text-accent transition-colors"
                aria-label={`Dismiss "${item.label}"`}
              >
                Done
              </button>
            </div>
          </li>
        ))}
      </ol>

      {hiddenCount > 0 && (
        <div className="pt-3">
          <button
            type="button"
            onClick={restore}
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 hover:text-accent transition-colors"
          >
            Restore {hiddenCount} hidden →
          </button>
        </div>
      )}
    </div>
  );
}
