import { Link } from "react-router-dom";
import { CalendarIcon, ArrowRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroBookingProgressProps {
  /** 0–100 percentage of monthly capacity filled */
  percentFilled?: number;
  totalSlots?: number;
  remainingSlots?: number;
  className?: string;
}

export function HeroBookingProgress({
  percentFilled = 72,
  totalSlots = 25,
  remainingSlots = 7,
  className,
}: HeroBookingProgressProps) {
  const isHigh = percentFilled >= 75;

  return (
    <div
      className={cn(
        "mx-auto max-w-sm rounded-xl border border-white/15 bg-white/5 backdrop-blur-md px-5 py-4",
        className
      )}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          {isHigh && <Flame className="h-3.5 w-3.5 text-accent animate-pulse" />}
          <span className="text-[11px] uppercase tracking-widest text-white/60 font-medium">
            Monthly Booking Capacity
          </span>
        </div>
        <span className="text-xs font-semibold text-accent">
          {remainingSlots} spot{remainingSlots !== 1 ? "s" : ""} left
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-white/10 overflow-hidden mb-3">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
            isHigh
              ? "bg-gradient-to-r from-accent to-accent/70"
              : "bg-accent/80"
          )}
          style={{ width: `${percentFilled}%` }}
        />
        {isHigh && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent/30 animate-pulse"
            style={{ width: `${percentFilled}%` }}
          />
        )}
      </div>

      {/* Stats + CTA */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">
          <span className="text-white/80 font-medium">{percentFilled}%</span> of {totalSlots} sessions booked
        </p>
        <Link
          to="/book-lesson"
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium",
            "bg-accent text-accent-foreground hover:bg-accent/90",
            "transition-all duration-300 hover:scale-105 hover:shadow-[0_2px_12px_hsl(var(--accent)/0.4)]"
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          Book Now
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
