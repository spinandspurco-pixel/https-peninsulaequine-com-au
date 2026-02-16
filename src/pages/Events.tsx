import { useState, useMemo, useCallback } from "react";
import { Calendar, CalendarPlus, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { EventRSVPForm } from "@/components/events/EventRSVPForm";
import { EventGuestList } from "@/components/events/EventGuestList";

import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena5 from "@/assets/equitana-arena-5.jpg";
import caulfieldEvent from "@/assets/caulfield-event.jpg";

// ── Upcoming events data ──
const upcomingEvents = [
  {
    id: "equitana-2026",
    title: "Equitana Melbourne 2026",
    date: "2026-11-12",
    endDate: "2026-11-15",
    time: "8:00 AM – 6:00 PM",
    location: "Melbourne Showgrounds",
    description:
      "Join us at Australia's premier equine expo. Peninsula Equine returns as exclusive arena preparation partner — come see competition-grade arena surfaces built in real time.",
    image: equitanaArena1,
    badge: "Exclusive Partner",
    spots: 200,
  },
  {
    id: "ranch-roundup-2026",
    title: "Ranch Roundup — Caulfield",
    date: "2026-03-21",
    endDate: "2026-03-22",
    time: "9:00 AM – 4:00 PM",
    location: "Caulfield Racecourse, Melbourne",
    description:
      "A weekend of Western and ranch-style riding events with arena demos, horsemanship clinics, and live construction showcases by Ciro.",
    image: caulfieldEvent,
    badge: "Official Contractor",
    spots: 80,
  },
  {
    id: "open-day-2026",
    title: "PE Open Day & Facility Tour",
    date: "2026-05-10",
    endDate: "2026-05-10",
    time: "10:00 AM – 3:00 PM",
    location: "Peninsula Equine HQ, Mornington Peninsula",
    description:
      "Walk through our workshops, see construction methods up close, meet the team, and enjoy a family-friendly day at the yard.",
    image: equitanaArena5,
    badge: "Free Entry",
    spots: 60,
  },
];

// ── Calendar helpers ──
function toICSDate(d: string) {
  return d.replace(/-/g, "") + "T080000Z";
}

function generateICS(event: (typeof upcomingEvents)[0]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula Equine//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${toICSDate(event.date)}`,
    `DTEND:${toICSDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.slice(0, 200)}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadICS(event: (typeof upcomingEvents)[0]) {
  const blob = new Blob([generateICS(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(event: (typeof upcomingEvents)[0]) {
  const start = event.date.replace(/-/g, "") + "T080000Z";
  const end = event.endDate.replace(/-/g, "") + "T180000Z";
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description.slice(0, 200))}&location=${encodeURIComponent(event.location)}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Event card ──
function EventRSVPCard({ event, index }: { event: (typeof upcomingEvents)[0]; index: number }) {
  const [showRSVP, setShowRSVP] = useState(false);
  const [remainingSpots, setRemainingSpots] = useState(event.spots);
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
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <Badge className="absolute top-4 left-4 uppercase tracking-wider text-xs">{event.badge}</Badge>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <h3 className="font-serif text-2xl sm:text-3xl text-foreground">{event.title}</h3>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent" />
              {formatDate(event.date)}
              {event.date !== event.endDate && ` – ${formatDate(event.endDate)}`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" />
              {event.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-accent" />
              {event.spots} spots
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed">{event.description}</p>

          {/* Live guest list & capacity */}
          <EventGuestList
            eventId={event.id}
            totalSpots={event.spots}
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
              disabled={remainingSpots <= 0}
            >
              {remainingSpots <= 0 ? "Sold Out" : "RSVP Now"}
            </Button>
          ) : (
            <div className="border-t border-border pt-6 mt-4">
              <p className="font-serif text-lg text-foreground mb-4">Reserve Your Spot</p>
              <EventRSVPForm
                eventId={event.id}
                eventTitle={event.title}
                remainingSpots={remainingSpots}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ──
export default function Events() {
  const sorted = useMemo(
    () => [...upcomingEvents].sort((a, b) => a.date.localeCompare(b.date)),
    []
  );

  return (
    <Layout>
      <PageHeader
        title="Upcoming Events"
        description="Clinics, expos, and open days — reserve your spot and sync to your calendar."
      />

      <section className="section-padding bg-background">
        <div className="section-container max-w-4xl">
          <div className="space-y-12">
            {sorted.map((event, i) => (
              <EventRSVPCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
