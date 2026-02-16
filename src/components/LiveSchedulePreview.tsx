import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Clock, CalendarIcon, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";

type QuickFilter = "today" | "week" | "month" | "custom";

interface SlotRow {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_bookings: number;
  current_bookings: number;
}

const CHIPS: { key: QuickFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

function getRange(filter: QuickFilter, custom?: DateRange): { from: string; to: string } {
  const now = new Date();
  switch (filter) {
    case "today":
      return { from: format(now, "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd") };
    case "week":
      return { from: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"), to: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd") };
    case "month":
      return { from: format(startOfMonth(now), "yyyy-MM-dd"), to: format(endOfMonth(now), "yyyy-MM-dd") };
    case "custom":
      return {
        from: custom?.from ? format(custom.from, "yyyy-MM-dd") : format(now, "yyyy-MM-dd"),
        to: custom?.to ? format(custom.to, "yyyy-MM-dd") : format(addDays(now, 6), "yyyy-MM-dd"),
      };
  }
}

export function LiveSchedulePreview({ className }: { className?: string }) {
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<QuickFilter>("today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  const range = useMemo(() => getRange(activeFilter, customRange), [activeFilter, customRange]);

  const fetchSlots = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lesson_slots")
      .select("id, slot_date, start_time, end_time, max_bookings, current_bookings")
      .gte("slot_date", range.from)
      .lte("slot_date", range.to)
      .order("slot_date")
      .order("start_time");
    setSlots(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();

    const channel = supabase
      .channel("schedule-preview-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lesson_slots" }, () => fetchSlots())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [range.from, range.to]);

  const available = slots.filter((s) => s.current_bookings < s.max_bookings);

  // Group slots by date for multi-day views
  const grouped = useMemo(() => {
    const map = new Map<string, SlotRow[]>();
    slots.forEach((s) => {
      const arr = map.get(s.slot_date) || [];
      arr.push(s);
      map.set(s.slot_date, arr);
    });
    return Array.from(map.entries());
  }, [slots]);

  const showDateHeaders = activeFilter !== "today";

  const handleChipClick = (key: QuickFilter) => {
    if (key === "custom") {
      setPopoverOpen(true);
    }
    setActiveFilter(key);
  };

  const rangeLabel = activeFilter === "today"
    ? format(new Date(), "EEEE, d MMM")
    : activeFilter === "custom" && customRange?.from
    ? `${format(customRange.from, "d MMM")}${customRange.to ? ` – ${format(customRange.to, "d MMM")}` : ""}`
    : activeFilter === "week"
    ? "This Week"
    : "This Month";

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
            <CalendarIcon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Schedule Preview</h4>
            <p className="text-[11px] text-muted-foreground">{rangeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Quick-filter chips */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {CHIPS.map((chip) =>
          chip.key === "custom" ? (
            <Popover key={chip.key} open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    activeFilter === "custom"
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-muted-foreground border-border hover:border-accent/40"
                  )}
                >
                  {chip.label}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={customRange}
                  onSelect={(r) => {
                    setCustomRange(r);
                    if (r?.from && r?.to) {
                      setActiveFilter("custom");
                      setPopoverOpen(false);
                    }
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  numberOfMonths={1}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          ) : (
            <button
              key={chip.key}
              onClick={() => handleChipClick(chip.key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                activeFilter === chip.key
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background text-muted-foreground border-border hover:border-accent/40"
              )}
            >
              {chip.label}
            </button>
          )
        )}
      </div>

      {/* Slot list */}
      <div className="space-y-1 mb-4 max-h-56 overflow-y-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
          ))
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No slots in this range</p>
        ) : (
          grouped.map(([date, dateSlots]) => (
            <div key={date}>
              {showDateHeaders && (
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium pt-2 pb-1">
                  {format(new Date(date + "T00:00:00"), "EEE d MMM")}
                </p>
              )}
              <div className="space-y-1">
                {dateSlots.map((slot) => {
                  const spotsLeft = slot.max_bookings - slot.current_bookings;
                  const isFull = spotsLeft <= 0;
                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border text-sm",
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
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary + CTA */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{loading ? "—" : `${available.length} of ${slots.length} slot${slots.length !== 1 ? "s" : ""} open`}</span>
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
