import { useState } from "react";
import { CheckCircle2, Send, CalendarPlus, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const rsvpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  guests: z.number().int().min(1, "At least 1 guest").max(20, "Max 20 guests"),
  notes: z.string().trim().max(500).optional(),
});

interface EventRSVPFormProps {
  eventId: string;
  eventTitle: string;
  remainingSpots: number;
  /** Event data for calendar sync on confirmation */
  eventDate?: string;
  eventTime?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
}

// Calendar helpers
function toICSDate(d: string, time?: string | null) {
  const datePart = d.replace(/-/g, "");
  if (time) {
    const timePart = time.replace(/:/g, "").slice(0, 6).padEnd(6, "0");
    return `${datePart}T${timePart}`;
  }
  return `${datePart}T080000`;
}

function generateICS(title: string, date: string, time?: string | null, location?: string | null, description?: string | null) {
  const dtStart = toICSDate(date, time);
  // Default 2-hour duration
  const startHour = time ? parseInt(time.split(":")[0], 10) : 8;
  const endHour = String(startHour + 2).padStart(2, "0");
  const endDate = date.replace(/-/g, "");
  const dtEnd = `${endDate}T${endHour}0000`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula Equine//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || "").slice(0, 200).replace(/\n/g, "\\n")}`,
    `LOCATION:${location || ""}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadICS(title: string, date: string, time?: string | null, location?: string | null, description?: string | null) {
  const blob = new Blob([generateICS(title, date, time, location, description)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(title: string, date: string, time?: string | null, location?: string | null, description?: string | null) {
  const start = toICSDate(date, time) + "Z";
  const startHour = time ? parseInt(time.split(":")[0], 10) : 8;
  const endDate = date.replace(/-/g, "");
  const end = `${endDate}T${String(startHour + 2).padStart(2, "0")}0000Z`;
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent((description || "").slice(0, 200))}&location=${encodeURIComponent(location || "")}`;
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
  const [form, setForm] = useState({ name: "", email: "", phone: "", guests: 1, notes: "" });
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
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      guests: parsed.data.guests,
      notes: parsed.data.notes || null,
      status,
    });

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

    // Send confirmation email (fire-and-forget)
    supabase.functions
      .invoke("send-rsvp-confirmation", {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
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

  // ── Confirmation screen ──
  if (submitted) {
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

        {/* Calendar sync — only for confirmed RSVPs */}
        {rsvpStatus === "confirmed" && eventDate && (
          <div className="border-t border-border pt-5 space-y-3">
            <p className="text-sm font-medium text-foreground">Add to your calendar</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadICS(eventTitle, eventDate, eventTime, eventLocation, eventDescription)}
                className="text-xs"
              >
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                Download .ics
              </Button>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <a
                  href={googleCalendarUrl(eventTitle, eventDate, eventTime, eventLocation, eventDescription)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Google Calendar
                </a>
              </Button>
            </div>
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
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
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
        {submitting
          ? "Submitting…"
          : isFull
          ? "Join Waitlist"
          : "Confirm RSVP"}
      </Button>
    </form>
  );
}
