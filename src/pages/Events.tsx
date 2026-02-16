import { useState, useMemo, useCallback } from "react";
import { Calendar as CalendarIcon, CalendarPlus, Clock, MapPin, Users, ExternalLink, Tag, Zap, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, isBefore, startOfDay, isAfter, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { EventRSVPForm } from "@/components/events/EventRSVPForm";
import { EventGuestList } from "@/components/events/EventGuestList";

import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena5 from "@/assets/equitana-arena-5.jpg";
import caulfieldEvent from "@/assets/caulfield-event.jpg";

// Fallback images by keyword
const fallbackImages: Record<string, string> = {
  equitana: equitanaArena1,
  caulfield: caulfieldEvent,
  default: equitanaArena5,
};

function getEventImage(title: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  const lower = title.toLowerCase();
  for (const [key, img] of Object.entries(fallbackImages)) {
    if (key !== "default" && lower.includes(key)) return img;
  }
  return fallbackImages.default;
}

type DBEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  capacity: number | null;
  image_url: string | null;
  price: string | null;
  early_bird_price: string | null;
  early_bird_deadline: string | null;
  active: boolean;
};

// ── Calendar helpers ──
function toICSDate(d: string) {
  return d.replace(/-/g, "") + "T080000Z";
}

function generateICS(event: DBEvent) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula Equine//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${toICSDate(event.event_date)}`,
    `DTEND:${toICSDate(event.event_date)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || "").slice(0, 200)}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadICS(event: DBEvent) {
  const blob = new Blob([generateICS(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(event: DBEvent) {
  const start = event.event_date.replace(/-/g, "") + "T080000Z";
  const end = event.event_date.replace(/-/g, "") + "T180000Z";
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent((event.description || "").slice(0, 200))}&location=${encodeURIComponent(event.location || "")}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isEarlyBird(deadline: string | null): boolean {
  if (!deadline) return false;
  return isBefore(startOfDay(new Date()), startOfDay(parseISO(deadline)));
}

// ── Pricing badge ──
function PricingBadge({ event }: { event: DBEvent }) {
  if (!event.price || event.price === "Free") {
    return (
      <Badge className="bg-accent/10 text-accent border-accent/30 text-xs">
        Free Entry
      </Badge>
    );
  }

  const earlyBirdActive = isEarlyBird(event.early_bird_deadline);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {earlyBirdActive && event.early_bird_price ? (
        <>
          <Badge className="bg-accent text-accent-foreground text-xs inline-flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Early Bird: {event.early_bird_price}
          </Badge>
          <span className="text-xs text-muted-foreground line-through">{event.price}</span>
          <span className="text-[10px] text-muted-foreground">
            until {format(parseISO(event.early_bird_deadline!), "MMM d")}
          </span>
        </>
      ) : (
        <Badge variant="outline" className="text-xs inline-flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {event.price}
        </Badge>
      )}
    </div>
  );
}

// ── Event card ──
function EventRSVPCard({ event, index }: { event: DBEvent; index: number }) {
  const [showRSVP, setShowRSVP] = useState(false);
  const [remainingSpots, setRemainingSpots] = useState(event.capacity || 100);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  const handleSpotsChange = useCallback((remaining: number) => {
    setRemainingSpots(remaining);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <Card className="overflow-hidden border-border/60 hover:shadow-xl hover:shadow-accent/5 transition-shadow duration-500">
        {/* Image */}
        <div className="relative aspect-[16/7] overflow-hidden">
          <img
            src={getEventImage(event.title, event.image_url)}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isEarlyBird(event.early_bird_deadline) && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-accent text-accent-foreground uppercase tracking-wider text-xs inline-flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Early Bird
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <h3 className="font-serif text-2xl sm:text-3xl text-foreground">{event.title}</h3>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-accent" />
              {formatDate(event.event_date)}
            </span>
            {event.event_time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" />
                {event.event_time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" />
                {event.location}
              </span>
            )}
            {event.capacity && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accent" />
                {event.capacity} spots
              </span>
            )}
          </div>

          {/* Pricing */}
          <PricingBadge event={event} />

          {event.description && (
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          )}

          {/* Live guest list & capacity */}
          <EventGuestList
            eventId={event.id}
            totalSpots={event.capacity || 100}
            onSpotsChange={handleSpotsChange}
          />

          {/* Calendar sync buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => downloadICS(event)} className="text-xs">
              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
              Add to Calendar (.ics)
            </Button>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Google Calendar
              </a>
            </Button>
          </div>

          {/* RSVP toggle */}
          {!showRSVP ? (
            <Button
              onClick={() => setShowRSVP(true)}
              className="w-full mt-2"
            >
              {remainingSpots <= 0 ? "Join Waitlist" : "RSVP Now"}
            </Button>
          ) : (
            <div className="border-t border-border pt-6 mt-4">
              <p className="font-serif text-lg text-foreground mb-4">
                {remainingSpots <= 0 ? "Join the Waitlist" : "Reserve Your Spot"}
              </p>
              <EventRSVPForm
                eventId={event.id}
                eventTitle={event.title}
                remainingSpots={remainingSpots}
                eventDate={event.event_date}
                eventTime={event.event_time}
                eventLocation={event.location}
                eventDescription={event.description}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Mini event calendar sidebar ──
function EventCalendarSidebar({
  events,
  selectedDate,
  onSelectDate,
}: {
  events: DBEvent[];
  selectedDate: Date | undefined;
  onSelectDate: (d: Date | undefined) => void;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const eventDates = useMemo(
    () => new Set(events.map((e) => e.event_date)),
    [events]
  );

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <h3 className="font-serif text-lg font-semibold text-foreground mb-4 text-center">
        Events Calendar
      </h3>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        modifiers={{
          event: (date) => eventDates.has(format(date, "yyyy-MM-dd")),
        }}
        modifiersClassNames={{
          event:
            "!bg-accent/15 !text-accent font-semibold hover:!bg-accent/25 relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-accent",
        }}
        className={cn("p-3 pointer-events-auto")}
      />
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Gold dates have upcoming events
      </p>
    </div>
  );
}

// ── Page ──
export default function Events() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dbEvents = [], isLoading } = useQuery<DBEvent[]>({
    queryKey: ["managed-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_events")
        .select("*")
        .eq("active", true)
        .order("event_date");
      if (error) throw error;
      // Cast needed: new columns (price, early_bird_price, early_bird_deadline) not yet in generated types
      return (data as unknown as DBEvent[]) || [];
    },
    staleTime: 60_000,
  });

  const events = dbEvents;

  // Filter by time, search, and selected calendar date
  const displayEvents = useMemo(() => {
    let filtered = events;

    // Time filter
    const today = startOfDay(new Date());
    if (timeFilter === "upcoming") {
      filtered = filtered.filter((e) => !isBefore(startOfDay(parseISO(e.event_date)), today));
    } else if (timeFilter === "past") {
      filtered = filtered.filter((e) => isBefore(startOfDay(parseISO(e.event_date)), today));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    // Calendar date filter
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter((e) => e.event_date === dateStr);
    }

    return filtered;
  }, [events, selectedDate, timeFilter, searchQuery]);

  return (
    <Layout>
      <PageHeader
        title="Upcoming Events"
        description="Clinics, expos, and open days — reserve your spot and sync to your calendar."
      />

      <section className="section-padding bg-background">
        <div className="section-container">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center">
            <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
            {/* Event cards */}
            <div className="space-y-12">
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Loading events…</p>
                </div>
              ) : displayEvents.length === 0 && selectedDate ? (
                <div className="text-center py-16">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="font-serif text-lg text-foreground mb-1">No events on this date</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try selecting a highlighted date on the calendar.
                  </p>
                  <Button variant="outline" onClick={() => setSelectedDate(undefined)}>
                    Show All Events
                  </Button>
                </div>
              ) : displayEvents.length === 0 ? (
                <div className="text-center py-16">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="font-serif text-lg text-foreground">No upcoming events</p>
                  <p className="text-sm text-muted-foreground">Check back soon for new events.</p>
                </div>
              ) : (
                displayEvents.map((event, i) => (
                  <EventRSVPCard key={event.id} event={event} index={i} />
                ))
              )}
            </div>

            {/* Sidebar calendar */}
            <div className="hidden lg:block sticky top-24">
              <EventCalendarSidebar
                events={events}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs text-muted-foreground"
                  onClick={() => setSelectedDate(undefined)}
                >
                  Clear filter — show all events
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
