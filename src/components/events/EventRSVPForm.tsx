import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
}

export function EventRSVPForm({ eventId, eventTitle, remainingSpots }: EventRSVPFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", guests: 1, notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const maxGuests = Math.min(10, remainingSpots);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.guests > remainingSpots) {
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
    const { error } = await supabase.from("event_rsvps").insert({
      event_id: eventId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      guests: parsed.data.guests,
      notes: parsed.data.notes || null,
    });

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

  if (remainingSpots <= 0) {
    return (
      <div className="text-center py-8">
        <p className="font-serif text-xl text-foreground mb-1">Sold Out</p>
        <p className="text-muted-foreground text-sm">All spots have been taken for this event.</p>
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
        {submitting ? "Submitting…" : "Confirm RSVP"}
      </Button>
    </form>
  );
}
