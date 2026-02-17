import { useState, useCallback } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Users, CalendarPlus, ExternalLink, Zap, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, isBefore, startOfDay, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTransition } from "@/components/SectionTransition";
import { EventRSVPForm } from "@/components/events/EventRSVPForm";
import { EventGuestList } from "@/components/events/EventGuestList";
import { CalendarSyncButtons } from "@/components/CalendarSyncButtons";
import type { CalendarEvent } from "@/lib/calendarSync";

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
  trainer: string | null;
};

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

function toCalendarEvent(e: DBEvent): CalendarEvent {
  return {
    title: e.title,
    date: e.event_date,
    startTime: e.event_time ?? undefined,
    durationMinutes: 120,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
  };
}

function ClinicCard({ event, index }: { event: DBEvent; index: number }) {
  const [showRSVP, setShowRSVP] = useState(false);
  const [remainingSpots, setRemainingSpots] = useState(event.capacity || 100);

  const handleSpotsChange = useCallback((remaining: number) => {
    setRemainingSpots(remaining);
  }, []);

  const earlyBirdActive = isEarlyBird(event.early_bird_deadline);

  return (
    <SectionTransition variant="fade-up" delay={index * 100}>
      <Card className="overflow-hidden border-border/60 hover:border-accent/30 transition-colors">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-xl text-foreground">{event.title}</h3>
            {earlyBirdActive && event.early_bird_price ? (
              <Badge className="bg-accent text-accent-foreground text-xs flex-shrink-0 inline-flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Early Bird
              </Badge>
            ) : event.price && event.price !== "Free" ? (
              <Badge variant="outline" className="text-xs flex-shrink-0 inline-flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {event.price}
              </Badge>
            ) : (
              <Badge className="bg-accent/10 text-accent border-accent/30 text-xs flex-shrink-0">
                Free
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
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

          {earlyBirdActive && event.early_bird_price && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-accent">{event.early_bird_price}</span>
              <span className="text-muted-foreground line-through text-xs">{event.price}</span>
              <span className="text-[10px] text-muted-foreground">
                until {format(parseISO(event.early_bird_deadline!), "MMM d")}
              </span>
            </div>
          )}

          {event.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
          )}

          <EventGuestList
            eventId={event.id}
            totalSpots={event.capacity || 100}
            onSpotsChange={handleSpotsChange}
          />

          {/* Calendar sync */}
          <CalendarSyncButtons event={toCalendarEvent(event)} compact className="pt-1" />

          {/* RSVP */}
          {!showRSVP ? (
            <Button onClick={() => setShowRSVP(true)} className="w-full">
              {remainingSpots <= 0 ? "Join Waitlist" : "RSVP Now"}
            </Button>
          ) : (
            <div className="border-t border-border pt-5 mt-2">
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
    </SectionTransition>
  );
}

interface Props {
  trainerName: string;
}

export function TrainerClinicRSVP({ trainerName }: Props) {
  const today = startOfDay(new Date()).toISOString().split("T")[0];

  const { data: clinics = [], isLoading } = useQuery<DBEvent[]>({
    queryKey: ["trainer-clinics", trainerName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_events")
        .select("id, title, description, event_date, event_time, location, capacity, image_url, price, early_bird_price, early_bird_deadline, trainer")
        .eq("active", true)
        .eq("trainer", trainerName)
        .gte("event_date", today)
        .order("event_date");
      if (error) throw error;
      return (data as unknown as DBEvent[]) || [];
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <section className="section-padding bg-card border-y border-border">
        <div className="section-container text-center py-8">
          <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  if (clinics.length === 0) return null;

  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-5" />
          <SectionTransition variant="fade-up">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CalendarIcon className="h-5 w-5 text-accent" />
              <h2 className="heading-section text-foreground">
                Upcoming Clinics with {trainerName.split(" ")[0]}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Reserve your spot and sync directly to your calendar.
            </p>
          </SectionTransition>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {clinics.map((clinic, i) => (
            <ClinicCard key={clinic.id} event={clinic} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
