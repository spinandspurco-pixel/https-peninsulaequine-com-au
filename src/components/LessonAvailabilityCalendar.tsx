import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  isSameDay,
  isThursday,
  isFriday,
  isBefore,
  startOfDay,
} from "date-fns";
import { CalendarIcon, Clock, ArrowRight, RefreshCw, Circle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type LessonSlot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  slot_type: string;
  max_bookings: number;
  current_bookings: number;
  notes: string | null;
};

const SLOT_TYPE_LABELS: Record<string, string> = {
  beginner: "Foundation",
  intermediate: "Development",
  advanced: "Performance",
  lesson: "Lesson",
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export function LessonAvailabilityCalendar() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const [slots, setSlots] = useState<LessonSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch slots for the visible month range
  const fetchSlots = async (month: Date) => {
    const from = format(startOfMonth(month), "yyyy-MM-dd");
    const to = format(endOfMonth(addMonths(month, 1)), "yyyy-MM-dd");

    const { data } = await supabase
      .from("lesson_slots")
      .select("*")
      .gte("slot_date", from)
      .lte("slot_date", to)
      .order("slot_date")
      .order("start_time");

    setSlots((data as LessonSlot[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots(currentMonth);
  }, [currentMonth]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("lesson-slots-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_slots" },
        () => {
          fetchSlots(currentMonth);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentMonth]);

  // Index slots by date
  const slotsByDate = useMemo(() => {
    const map: Record<string, LessonSlot[]> = {};
    for (const slot of slots) {
      if (!map[slot.slot_date]) map[slot.slot_date] = [];
      map[slot.slot_date].push(slot);
    }
    return map;
  }, [slots]);

  // Dates with available slots
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const slot of slots) {
      if (slot.current_bookings < slot.max_bookings) {
        dates.add(slot.slot_date);
      }
    }
    return dates;
  }, [slots]);

  // Full dates (all slots booked)
  const fullDates = useMemo(() => {
    const dates = new Set<string>();
    for (const [date, dateSlots] of Object.entries(slotsByDate)) {
      if (dateSlots.every((s) => s.current_bookings >= s.max_bookings)) {
        dates.add(date);
      }
    }
    return dates;
  }, [slotsByDate]);

  // Selected date's slots
  const selectedDateSlots = selectedDate
    ? slotsByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  const handleBookSlot = (slot: LessonSlot) => {
    const typeParam = slot.slot_type !== "lesson" ? slot.slot_type : "";
    navigate(
      `/book-lesson?type=${typeParam}&date=${slot.slot_date}#book`
    );
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="text-center mb-8">
        <div
          className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
        />
        <h2 className="heading-section text-foreground mb-3">Lesson Availability</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          View real-time availability and pick a slot. Green dates have open spots — select a
          day to see available times.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Calendar */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onMonthChange={setCurrentMonth}
                disabled={(date) => {
                  const day = date.getDay();
                  const dateStr = format(date, "yyyy-MM-dd");
                  // Disable past dates, non-Thu/Fri, and fully booked
                  return (
                    isBefore(date, startOfDay(new Date())) ||
                    (day !== 4 && day !== 5) ||
                    fullDates.has(dateStr)
                  );
                }}
                modifiers={{
                  available: (date) =>
                    availableDates.has(format(date, "yyyy-MM-dd")),
                  full: (date) =>
                    fullDates.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersClassNames={{
                  available:
                    "!bg-accent/15 !text-accent font-semibold hover:!bg-accent/25 relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-accent",
                  full: "!bg-destructive/10 !text-destructive/60 line-through",
                }}
                className={cn("p-3 pointer-events-auto")}
              />

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Circle className="h-2.5 w-2.5 fill-accent text-accent" />
                  Available
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Circle className="h-2.5 w-2.5 fill-destructive/40 text-destructive/40" />
                  Fully Booked
                </div>
              </div>
            </>
          )}
        </div>

        {/* Slot details panel */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <CalendarIcon className="h-7 w-7 text-accent" />
              </div>
              <p className="font-serif text-lg font-semibold text-foreground mb-1">
                Select a Date
              </p>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Choose a highlighted date to see available lesson times
              </p>
            </div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="font-serif text-lg font-semibold text-foreground mb-1">
                {format(selectedDate, "EEEE, MMMM d")}
              </p>
              <p className="text-sm text-muted-foreground">
                No slots published for this date yet. Check back soon or contact us directly.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selectedDateSlots.filter((s) => s.current_bookings < s.max_bookings).length} of{" "}
                {selectedDateSlots.length} slots available
              </p>

              <div className="space-y-3">
                {selectedDateSlots.map((slot) => {
                  const isAvailable = slot.current_bookings < slot.max_bookings;
                  const spotsLeft = slot.max_bookings - slot.current_bookings;

                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        "rounded-lg border p-4 transition-all",
                        isAvailable
                          ? "border-accent/30 bg-accent/5 hover:border-accent/50"
                          : "border-border bg-muted/30 opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            <span className="text-sm font-medium text-foreground">
                              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] border-accent/30 text-accent"
                            >
                              {SLOT_TYPE_LABELS[slot.slot_type] || slot.slot_type}
                            </Badge>
                            {isAvailable ? (
                              <span className="text-[10px] text-muted-foreground">
                                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                              </span>
                            ) : (
                              <span className="text-[10px] text-destructive">Fully booked</span>
                            )}
                          </div>
                          {slot.notes && (
                            <p className="text-xs text-muted-foreground mt-1.5 italic">
                              {slot.notes}
                            </p>
                          )}
                        </div>

                        {isAvailable && (
                          <Button
                            size="sm"
                            onClick={() => handleBookSlot(slot)}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
                          >
                            Book
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
