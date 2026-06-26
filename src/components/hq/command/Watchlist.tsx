import { Link } from "react-router-dom";
import { useWatchlist } from "@/hooks/command/useWatchlist";
import { cn } from "@/lib/utils";

const DOT: Record<"info" | "warn" | "critical", string> = {
  info: "bg-foreground/30",
  warn: "bg-amber-500/70",
  critical: "bg-rose-500/80",
};

export function Watchlist({ includeOpsSignals = false }: { includeOpsSignals?: boolean } = {}) {
  const { data, isLoading, error } = useWatchlist(includeOpsSignals);

  if (isLoading) {
    return <p className="text-[12px] text-muted-foreground/55">Scanning…</p>;
  }
  if (error) {
    return <p className="text-[12px] text-muted-foreground/55">Watchlist unavailable.</p>;
  }
  if (!data || data.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground/55">
        Nothing flagged. Quiet day in HQ.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((item) => (
        <li key={item.id}>
          <Link
            to={item.href}
            className={cn(
              "group flex items-start gap-3 text-[12px] leading-snug",
              "transition-colors hover:text-accent focus:outline-none focus-visible:text-accent",
            )}
          >
            <span
              aria-hidden
              className={cn("mt-[7px] inline-block h-1.5 w-1.5 rounded-full", DOT[item.severity])}
            />
            <span className="text-foreground/80 group-hover:text-accent">
              {item.label}
              {item.detail ? (
                <span className="block text-muted-foreground/55 text-[11px] mt-0.5">
                  {item.detail}
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
