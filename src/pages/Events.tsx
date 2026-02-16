import { useState, useMemo } from "react";
import { Calendar, CalendarPlus, CheckCircle2, Clock, MapPin, Users, Send, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

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

// ── Validation schema ──
const rsvpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  guests: z.number().int().min(1, "At least 1 guest").max(20, "Max 20 guests"),
  notes: z.string().trim().max(500).optional(),
});

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

// ── RSVP form component ──
function RSVPForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", guests: 1, notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = rsvpSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = i.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("event_rsvps" as any).insert({
      event_id: eventId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      guests: parsed.data.guests,
      notes: parsed.data.notes || null,
    } as any);

    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success(`RSVP confirmed for ${eventTitle}!`);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
        <p className="font-serif text-xl text-foreground mb-1">You're In!</p>
        <p className="text-muted-foreground text-sm">We'll send a confirmation to your email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`name-${eventId}`}>Full Name *</Label>
          <Input
            id={`name-${eventId}`}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Jane Smith"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor={`email-${eventId}`}>Email *</Label>
          <Input
            id={`email-${eventId}`}
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="jane@example.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`phone-${eventId}`}>Phone</Label>
          <Input
            id={`phone-${eventId}`}
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="0400 000 000"
          />
        </div>
        <div>
          <Label htmlFor={`guests-${eventId}`}>Number of Guests</Label>
          <Select
            value={String(form.guests)}
            onValueChange={(v) => handleChange("guests", Number(v))}
          >
            <SelectTrigger id={`guests-${eventId}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "guest" : "guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.guests && <p className="text-destructive text-xs mt-1">{errors.guests}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor={`notes-${eventId}`}>Notes (optional)</Label>
        <Textarea
          id={`notes-${eventId}`}
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Dietary requirements, accessibility needs…"
          rows={2}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        <Send className="mr-2 h-4 w-4" />
        {submitting ? "Submitting…" : "Confirm RSVP"}
      </Button>
    </form>
  );
}

// ── Event card ──
function EventRSVPCard({ event, index }: { event: (typeof upcomingEvents)[0]; index: number }) {
  const [showRSVP, setShowRSVP] = useState(false);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

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

          {/* Calendar sync buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadICS(event)}
              className="text-xs"
            >
              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
              Add to Calendar (.ics)
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs"
            >
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Google Calendar
              </a>
            </Button>
          </div>

          {/* RSVP toggle */}
          {!showRSVP ? (
            <Button onClick={() => setShowRSVP(true)} className="w-full mt-2">
              RSVP Now
            </Button>
          ) : (
            <div className="border-t border-border pt-6 mt-4">
              <p className="font-serif text-lg text-foreground mb-4">Reserve Your Spot</p>
              <RSVPForm eventId={event.id} eventTitle={event.title} />
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
