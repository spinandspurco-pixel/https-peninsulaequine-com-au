import { useState } from "react";
import { CalendarIcon, CheckCircle, Loader2, Send, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(20).optional(),
  interest: z.string().min(1, "Please select an interest"),
  message: z.string().trim().max(500).optional(),
});

const INTERESTS = [
  { value: "lesson-beginner", label: "Beginner Lesson" },
  { value: "lesson-intermediate", label: "Intermediate Lesson" },
  { value: "lesson-advanced", label: "Advanced / Performance" },
  { value: "clinic", label: "Clinic or Group Event" },
  { value: "facility-tour", label: "Facility Tour" },
  { value: "consultation", label: "Free Consultation" },
  { value: "other", label: "Something Else" },
];

export function LeadCaptureForm() {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = leadSchema.safeParse({ name, email, phone: phone || undefined, interest, message: message || undefined });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        services: [parsed.data.interest],
        notes: parsed.data.message || null,
        status: "new",
      });
      if (error) throw error;

      // Trigger auto-respond email
      supabase.functions.invoke("send-inquiry-notification", {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          services: [parsed.data.interest],
          goals: parsed.data.message,
        },
      }).catch(() => {});

      setSubmitted(true);
      toast({ title: "You're in!", description: "Check your inbox — we've sent you a confirmation with next steps." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us directly.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div
        ref={ref}
        className="rounded-2xl border border-accent/20 bg-card p-8 sm:p-10 text-center animate-fade-in"
      >
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
          You're All Set!
        </h3>
        <p className="text-muted-foreground mb-2 max-w-sm mx-auto">
          We've sent a confirmation to <strong className="text-foreground">{email}</strong> with everything you need.
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Expect a personal reply within 1–2 business days.
        </p>

        {/* Scheduling CTA */}
        <div className="rounded-xl border border-border bg-background p-6 max-w-sm mx-auto mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CalendarIcon className="h-5 w-5 text-accent" />
            <span className="font-serif font-semibold text-foreground">Skip the Wait</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Book a call or visit directly on our calendar — pick a time that suits you.
          </p>
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/schedule">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-accent" /> Confirmation email sent
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-accent" /> 1–2 day response
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-accent/20 bg-card p-6 sm:p-8 transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-xl font-semibold text-foreground">
          Get Started in 30 Seconds
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Tell us what you're interested in and we'll follow up with a personalised email &amp; scheduling link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lead-name" className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="lead-email" className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lead-phone" className="text-sm font-medium text-foreground">
              Phone <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="lead-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
            />
          </div>
          <div>
            <Label htmlFor="lead-interest" className="text-sm font-medium text-foreground">
              I'm interested in <span className="text-destructive">*</span>
            </Label>
            <Select value={interest} onValueChange={setInterest}>
              <SelectTrigger id="lead-interest" className={cn(errors.interest && "border-destructive")}>
                <SelectValue placeholder="Choose one…" />
              </SelectTrigger>
              <SelectContent>
                {INTERESTS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.interest && <p className="text-xs text-destructive mt-1">{errors.interest}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="lead-message" className="text-sm font-medium text-foreground">
            Anything else? <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="lead-message"
            placeholder="Tell us about your goals, preferred dates, or questions…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={sending}
          className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground h-11 px-8"
        >
          {sending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
          ) : (
            <><Send className="mr-2 h-4 w-4" />Send &amp; Get My Schedule Link</>
          )}
        </Button>

        <p className="text-[11px] text-muted-foreground">
          You'll receive an instant confirmation email with a link to book a call or visit.
        </p>
      </form>
    </div>
  );
}
