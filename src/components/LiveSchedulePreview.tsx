import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, CalendarIcon, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface SlotRow {
  id: string;
  start_time: string;
  end_time: string;
  max_bookings: number;
  current_bookings: number;
  slot_type: string;
}

export function LiveSchedulePreview({ className }: { className?: string }) {
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const today = format(new Date(), "yyyy-MM-dd");

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("lesson_slots")
      .select("id, start_time, end_time, max_bookings, current_bookings, slot_type")
      .eq("slot_date", today)
      .order("start_time");
    setSlots(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();

    const channel = supabase
      .channel("schedule-preview-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_slots" },
        () => fetchSlots()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const available = slots.filter((s) => s.current_bookings < s.max_bookings);

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Today's Schedule</h4>
            <p className="text-[11px] text-muted-foreground">{format(new Date(), "EEEE, d MMM")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Slot list */}
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
          ))
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No slots scheduled today</p>
        ) : (
          slots.map((slot) => {
            const spotsLeft = slot.max_bookings - slot.current_bookings;
            const isFull = spotsLeft <= 0;
            return (
              <div
                key={slot.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm",
                  isFull
                    ? "border-border/50 bg-muted/50 opacity-60"
                    : "border-border bg-background"
                )}
              >
                <span className="flex items-center gap-1.5 text-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    isFull
                      ? "bg-muted text-muted-foreground"
                      : spotsLeft <= 1
                      ? "bg-destructive/10 text-destructive"
                      : "bg-accent/10 text-accent"
                  )}
                >
                  {isFull ? "Full" : `${spotsLeft} left`}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Summary + CTA */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>
          {loading ? "—" : `${available.length} of ${slots.length} slot${slots.length !== 1 ? "s" : ""} open`}
        </span>
      </div>

      <Link
        to="/schedule"
        className={cn(
          "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium",
          "bg-accent text-accent-foreground hover:bg-accent/90",
          "transition-all duration-300 hover:shadow-md"
        )}
      >
        <CalendarIcon className="h-4 w-4" />
        Schedule a Consultation
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
