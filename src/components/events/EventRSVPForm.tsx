import { useState } from "react";
import { CheckCircle2, Send, Clock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarSyncButtons } from "@/components/CalendarSyncButtons";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import type { CalendarEvent } from "@/lib/calendarSync";

const rsvpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().max(20).optional(),
  guests: z.number().int().min(1, "At least 1 guest").max(20, "Max 20 guests"),
  notes: z.string().trim().max(500).optional(),
});

interface EventRSVPFormProps {
  eventId: string;
  eventTitle: string;
  remainingSpots: number;
  eventDate?: string;
  eventTime?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
}

function toCalendarEvent(
  title: string,
  date: string,
  time?: string | null,
  location?: string | null,
  description?: string | null
): CalendarEvent {
  return {
    title,
    date,
    startTime: time ?? undefined,
    durationMinutes: 120,
    description: description ?? undefined,
    location: location ?? undefined,
  };
}

export function EventRSVPForm({
  eventId,
  eventTitle,
  remainingSpots,
  eventDate,
  eventTime,
  eventLocation,
  eventDescription,
}: EventRSVPFormProps) {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", guests: 1, notes: "" });
  const [joinWaitlist, setJoinWaitlist] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<"confirmed" | "waitlisted">("confirmed");

  const isFull = remainingSpots <= 0;
  const maxGuests = isFull ? 10 : Math.min(10, remainingSpots);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isWaitlist = isFull || form.guests > remainingSpots;

    if (!isWaitlist && form.guests > remainingSpots) {
      setErrors({ guests: `Only ${remainingSpots} spots remaining` });
      return;
    }

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
    const status = isWaitlist ? "waitlisted" : "confirmed";

    const { error } = await supabase.from("event_rsvps").insert({
      event_id: eventId,
      name: parsed.data.name,
      email: user.email!,
      phone: parsed.data.phone || null,
      guests: parsed.data.guests,
      notes: parsed.data.notes || null,
      status,
      user_id: user.id,
    } as any);

    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setRsvpStatus(status);
    setSubmitted(true);
    toast.success(
      status === "waitlisted"
        ? `You've been added to the waitlist for ${eventTitle}`
        : `RSVP confirmed for ${eventTitle}!`
    );

    supabase.functions
      .invoke("send-rsvp-confirmation", {
        body: {
          name: parsed.data.name,
          email: user.email,
          eventTitle,
          eventDate,
          eventTime,
          eventLocation,
          eventDescription,
          guests: parsed.data.guests,
          status,
        },
      })
      .catch(() => {});
  };

  // ── Auth loading ──
  if (authLoading) {
    return (
      <div className="animate-pulse space-y-3 py-6">
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  // ── Not signed in ──
  if (!user) {
    return (
      <div className="text-center py-8 space-y-4">
        <LogIn className="h-10 w-10 text-muted-foreground mx-auto" />
        <div>
          <p className="font-serif text-xl text-foreground mb-1">Sign in to RSVP</p>
          <p className="text-muted-foreground text-sm">
            Create an account or sign in to reserve your spot.
          </p>
        </div>
        <Button asChild>
          <Link to="/login?redirect=/events">Sign In</Link>
        </Button>
      </div>
    );
  }

  // ── Confirmation screen ──
  if (submitted) {
    const nextSteps = rsvpStatus === "confirmed"
      ? [
          { text: "A confirmation email is on its way to your inbox." },
          { text: `Arrive 15 minutes early${eventLocation ? ` at ${eventLocation}` : ""}.` },
          { text: "Wear closed-toe shoes and comfortable clothing." },
          { text: "Check your email for any event updates closer to the date." },
        ]
      : [
          { text: "We'll email you if a spot opens up." },
          { text: "Keep an eye on your inbox for waitlist updates." },
        ];

    return (
      <div className="text-center py-8 space-y-5">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
        <div>
          <p className="font-serif text-xl text-foreground mb-1">
            {rsvpStatus === "waitlisted" ? "You're on the Waitlist!" : "You're In!"}
          </p>
          <p className="text-muted-foreground text-sm">
            {rsvpStatus === "waitlisted"
              ? "We'll notify you by email if a spot opens up."
              : "We'll send a confirmation to your email."}
          </p>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground mb-3">What to do next</p>
          <ol className="text-left max-w-xs mx-auto space-y-2">
            {nextSteps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {rsvpStatus === "confirmed" && eventDate && (
          <div className="border-t border-border pt-5 space-y-3">
            <p className="text-sm font-medium text-foreground">Add to your calendar</p>
            <CalendarSyncButtons
              event={toCalendarEvent(eventTitle, eventDate, eventTime, eventLocation, eventDescription)}
            />
            <p className="text-[11px] text-muted-foreground">
              Works with Apple Calendar, Outlook &amp; more.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Sold out with waitlist option ──
  if (isFull && !joinWaitlist) {
    return (
      <div className="text-center py-8 space-y-4">
        <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
        <div>
          <p className="font-serif text-xl text-foreground mb-1">Sold Out</p>
          <p className="text-muted-foreground text-sm">All spots have been taken for this event.</p>
        </div>
        <Button variant="outline" onClick={() => setJoinWaitlist(true)}>
          Join the Waitlist
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(isFull || joinWaitlist) && (
        <div className="rounded-lg bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
          <strong>Waitlist:</strong> This event is full. Submit your details and we'll notify you if a spot opens.
        </div>
      )}

      {/* Show logged-in email */}
      <div className="rounded-lg bg-muted/50 border border-border/40 px-4 py-3 text-sm text-muted-foreground">
        Submitting as <span className="font-medium text-foreground">{user.email}</span>
      </div>

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
          <Label htmlFor={`phone-${eventId}`}>Phone</Label>
          <Input
            id={`phone-${eventId}`}
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="0400 000 000"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
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
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "guest" : "guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.guests && <p className="text-destructive text-xs mt-1">{errors.guests}</p>}
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
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        <Send className="mr-2 h-4 w-4" />
        {submitting
          ? "Submitting…"
          : isFull
          ? "Join Waitlist"
          : "Confirm RSVP"}
      </Button>
    </form>
  );
}
