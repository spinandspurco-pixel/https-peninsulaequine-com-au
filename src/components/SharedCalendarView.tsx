import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Loader2,
  RefreshCw,
  CircleDot,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";

interface Booking {
  id: string;
  client_name: string;
  service_type: string;
  booking_date: string;
  booking_time: string | null;
  duration_minutes: number | null;
  status: string;
}

interface LessonSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_bookings: number;
  current_bookings: number;
  slot_type: string;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500",
  pending: "bg-amber-500",
  completed: "bg-blue-500",
  cancelled: "bg-destructive",
  no_show: "bg-muted-foreground",
};

export function SharedCalendarView({ isAdmin = false }: { isAdmin?: boolean }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<LessonSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const [bookingsRes, slotsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, client_name, service_type, booking_date, booking_time, duration_minutes, status")
        .gte("booking_date", monthStart)
        .lte("booking_date", monthEnd)
        .neq("status", "cancelled")
        .order("booking_time", { ascending: true }),
      supabase
        .from("lesson_slots")
        .select("*")
        .gte("slot_date", monthStart)
        .lte("slot_date", monthEnd)
        .order("start_time", { ascending: true }),
    ]);

    if (bookingsRes.error) toast.error("Failed to load bookings");
    if (slotsRes.error) toast.error("Failed to load availability");

    setBookings((bookingsRes.data as Booking[]) || []);
    setSlots((slotsRes.data as LessonSlot[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("shared-calendar-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "lesson_slots" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentMonth]);

  // Build lookup maps
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const list = map.get(b.booking_date) || [];
      list.push(b);
      map.set(b.booking_date, list);
    });
    return map;
  }, [bookings]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, LessonSlot[]>();
    slots.forEach((s) => {
      const list = map.get(s.slot_date) || [];
      list.push(s);
      map.set(s.slot_date, list);
    });
    return map;
  }, [slots]);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedBookings = selectedDateStr ? bookingsByDate.get(selectedDateStr) || [] : [];
  const selectedSlots = selectedDateStr ? slotsByDate.get(selectedDateStr) || [] : [];

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-accent" />
              Shared Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
                className="text-sm font-medium min-w-[140px]"
              >
                {format(currentMonth, "MMMM yyyy")}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            View booked lessons, clinics, and available time slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && bookings.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Slots Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
                </span>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayBookings = bookingsByDate.get(dateStr) || [];
                  const daySlots = slotsByDate.get(dateStr) || [];
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const hasBookings = dayBookings.length > 0;
                  const hasAvailableSlots = daySlots.some((s) => s.current_bookings < s.max_bookings);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative flex flex-col items-center justify-start p-1.5 min-h-[60px] rounded-lg text-sm transition-all
                        ${!inMonth ? "opacity-30" : ""}
                        ${selected ? "ring-2 ring-accent bg-accent/10" : "hover:bg-muted/50"}
                        ${today ? "font-bold" : ""}
                      `}
                    >
                      <span className={`text-xs ${today ? "bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                        {format(day, "d")}
                      </span>
                      {inMonth && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {hasBookings && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          {hasAvailableSlots && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                          {dayBookings.some((b) => b.status === "pending") && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                        </div>
                      )}
                      {inMonth && dayBookings.length > 0 && (
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {dayBookings.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Day Detail Panel */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent" />
              {format(selectedDate, "EEEE, d MMMM yyyy")}
            </CardTitle>
            <CardDescription>
              {selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""} · {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Availability Slots */}
            {selectedSlots.length > 0 && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                  Availability Slots
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSlots.map((slot) => {
                    const spotsLeft = slot.max_bookings - slot.current_bookings;
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          <span className="text-sm font-medium">
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {slot.slot_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-xs font-medium ${spotsLeft <= 0 ? "text-destructive" : spotsLeft <= 1 ? "text-amber-500" : "text-accent"}`}>
                            {spotsLeft <= 0 ? "Full" : `${spotsLeft} left`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bookings */}
            {selectedBookings.length > 0 ? (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                  Bookings
                </h4>
                <div className="space-y-2">
                  {selectedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${STATUS_COLORS[booking.status] || "bg-muted-foreground"}`} />
                        <div>
                          <p className="text-sm font-medium">{booking.client_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {booking.booking_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(booking.booking_time)}
                              </span>
                            )}
                            <span className="capitalize">{booking.service_type.replace(/-/g, " ")}</span>
                            {booking.duration_minutes && (
                              <span>· {booking.duration_minutes} min</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs text-white ${STATUS_COLORS[booking.status] || "bg-muted-foreground"}`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedSlots.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm">No bookings or availability on this date</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
