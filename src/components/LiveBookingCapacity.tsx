import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, ArrowRight, Flame, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const MONTHLY_CAPACITY = 25;

export function LiveBookingCapacity({ className }: { className?: string }) {
  const [activeBookings, setActiveBookings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  const fetchCount = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const startOfNext = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .neq("status", "cancelled")
      .gte("booking_date", startOfMonth)
      .lt("booking_date", startOfNext);

    setActiveBookings(count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel("bookings-capacity")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchCount()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const percentFilled = Math.min(Math.round((activeBookings / MONTHLY_CAPACITY) * 100), 100);
  const remaining = Math.max(MONTHLY_CAPACITY - activeBookings, 0);
  const isHigh = percentFilled >= 70;
  const isCritical = percentFilled >= 90;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Live Availability</h4>
            <p className="text-[11px] text-muted-foreground">This month's sessions</p>
          </div>
        </div>
        {!loading && (
          <div className="flex items-center gap-1.5">
            {isHigh && <Flame className={cn("h-3.5 w-3.5 text-accent", isCritical && "animate-pulse")} />}
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              isCritical
                ? "bg-destructive/10 text-destructive"
                : isHigh
                ? "bg-accent/10 text-accent"
                : "bg-muted text-muted-foreground"
            )}>
              {remaining} spot{remaining !== 1 ? "s" : ""} left
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden mb-3">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
            isCritical
              ? "bg-gradient-to-r from-destructive/80 to-destructive"
              : isHigh
              ? "bg-gradient-to-r from-accent to-accent/70"
              : "bg-accent/60"
          )}
          style={{ width: loading ? "0%" : `${percentFilled}%` }}
        />
        {isHigh && !loading && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent/20 animate-pulse"
            style={{ width: `${percentFilled}%` }}
          />
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {loading ? (
            <span className="inline-block w-24 h-3 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <span className="font-semibold text-foreground">{percentFilled}%</span> of {MONTHLY_CAPACITY} sessions booked
            </>
          )}
        </p>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/book-lesson"
        className={cn(
          "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium",
          "bg-accent text-accent-foreground hover:bg-accent/90",
          "transition-all duration-300 hover:shadow-md"
        )}
      >
        <CalendarIcon className="h-4 w-4" />
        Book a Lesson
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
