import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isBefore, startOfDay, isSameDay } from "date-fns";
import {
  ArrowRight,
  CalendarIcon,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  Target,
  Award,
  Users,
  Quote,
  ExternalLink,
  Zap,
} from "lucide-react";
import { PECalendar, PEHorseshoe, PERider } from "@/components/icons/PEIcons";
import { CalendarSyncButtons } from "@/components/CalendarSyncButtons";
import { supabase } from "@/integrations/supabase/client";
import { EventRSVPForm } from "@/components/events/EventRSVPForm";
import { EventGuestList } from "@/components/events/EventGuestList";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { glennBrowitt, lessonInfo, siteConfig } from "@/data/content";
import equitanaArena4 from "@/assets/equitana-arena-4.jpg";

// ── Program Data ─────────────────────────────────────

const PROGRAMS = [
  {
    value: "beginner",
    label: "Foundation",
    icon: Star,
    tagline: "Build confidence from the ground up",
    description:
      "Perfect for newcomers or riders returning after a break. Focus on seat, balance, and building a trusting relationship with your horse.",
    topics: [
      "Mounting & dismounting safely",
      "Walk & rising trot fundamentals",
      "Groundwork & horse handling",
      "Basic arena etiquette",
    ],
    price: "$95",
    pricePer: "per session",
    duration: "45 min",
    frequency: "Weekly recommended",
    bestFor: "Beginners & returners",
    featured: false,
  },
  {
    value: "intermediate",
    label: "Development",
    icon: Target,
    tagline: "Refine your skills, deepen your partnership",
    description:
      "For riders comfortable at walk, trot, and canter who are ready to develop more refined aids, lateral work, and jumping basics.",
    topics: [
      "Canter transitions & lead changes",
      "Introduction to lateral movements",
      "Pole work & ground lines",
      "Developing an independent seat",
    ],
    price: "$120",
    pricePer: "per session",
    duration: "60 min",
    frequency: "Weekly or fortnightly",
    bestFor: "Confident walk/trot/canter",
    featured: true,
  },
  {
    value: "advanced",
    label: "Performance",
    icon: Award,
    tagline: "Precision training for serious riders",
    description:
      "Tailored sessions for experienced riders working on competition preparation, advanced dressage movements, or complex jumping courses.",
    topics: [
      "Collection & extension",
      "Advanced lateral work",
      "Course building & show prep",
      "Rider biomechanics analysis",
    ],
    price: "$150",
    pricePer: "per session",
    duration: "60 min",
    frequency: "As needed",
    bestFor: "Competitors & advanced riders",
    featured: false,
  },
];

const LESSON_FAQS = [
  {
    q: "Do I need my own horse?",
    a: "Lessons are available on your own horse only at this stage. If you don't have a horse, contact us and we can discuss options.",
  },
  {
    q: "What should I wear?",
    a: "An approved riding helmet is mandatory. We recommend close-fitting trousers, boots with a small heel, and gloves. No loose clothing or open-toed shoes.",
  },
  {
    q: "How long is each lesson?",
    a: "Sessions run 45–60 minutes depending on the program level and rider fitness. Beginners typically start with shorter sessions.",
  },
  {
    q: "What's the cancellation policy?",
    a: "We require 24 hours notice for cancellations. Late cancellations may incur a fee. Weather-related cancellations are handled on a case-by-case basis.",
  },
  {
    q: "Can I book a trial lesson?",
    a: "Absolutely. Your first session is treated as an assessment so we can place you in the right program level. No long-term commitment required.",
  },
  {
    q: "Are group lessons available?",
    a: "Currently all lessons are private (one-on-one). Small group clinics may be offered seasonally — join our mailing list to stay updated.",
  },
];

// ── Components ───────────────────────────────────────

function InfoCards() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const cards = [
    { Icon: PECalendar, title: "Available Days", detail: "Thursdays & Fridays" },
    { Icon: PEHorseshoe, title: "Session Length", detail: "45–60 minutes" },
    { Icon: PERider, title: "All Levels", detail: "Beginner to advanced" },
  ];

  return (
    <div ref={ref} className="grid sm:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={cn(
            "text-center p-6 rounded-xl bg-card border border-border card-hover-glow transition-all duration-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: `${i * 120}ms` }}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <card.Icon size={24} className="text-accent" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{card.title}</h3>
          <p className="text-sm text-muted-foreground">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

function ProgramCard({
  program,
  index,
}: {
  program: (typeof PROGRAMS)[number];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const Icon = program.icon;

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl border bg-card overflow-hidden transition-all duration-600",
        program.featured
          ? "border-accent shadow-[0_0_30px_-8px_hsl(var(--accent)/0.25)]"
          : "border-border",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {program.featured && (
        <div className="bg-accent text-accent-foreground text-[11px] font-semibold uppercase tracking-widest text-center py-1.5">
          Most Popular
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">{program.label}</h3>
            <p className="text-sm text-muted-foreground">{program.tagline}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          <span className="text-3xl font-serif font-bold text-foreground">{program.price}</span>
          <span className="text-sm text-muted-foreground ml-1.5">/ {program.pricePer}</span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
            <Clock className="h-3 w-3" /> {program.duration}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
            <Users className="h-3 w-3" /> {program.bestFor}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{program.description}</p>

        {/* Topics */}
        <ul className="space-y-2 mb-6">
          {program.topics.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          asChild
          className={cn(
            "w-full",
            program.featured
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Link to={`/book-lesson?type=${program.value}`}>
            Book {program.label} Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ── Calendar helpers ──
// Calendar helpers removed — using shared CalendarSyncButtons component

// ── Upcoming Clinics Section ─────────────────────────

type ClinicEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  capacity: number | null;
  price: string | null;
  early_bird_price: string | null;
  early_bird_deadline: string | null;
};

function ClinicCard({ event }: { event: ClinicEvent }) {
  const [showRSVP, setShowRSVP] = useState(false);
  const [remainingSpots, setRemainingSpots] = useState(event.capacity || 100);
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  const earlyBirdActive = event.early_bird_deadline && isBefore(startOfDay(new Date()), startOfDay(parseISO(event.early_bird_deadline)));

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden transition-all duration-600",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">{event.title}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5 text-accent" />
                {format(parseISO(event.event_date), "EEE d MMM yyyy")}
              </span>
              {event.event_time && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  {event.event_time}
                </span>
              )}
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          {/* Pricing */}
          <div className="text-right flex-shrink-0">
            {earlyBirdActive && event.early_bird_price ? (
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                  <Zap className="h-3 w-3" /> {event.early_bird_price}
                </span>
                <p className="text-xs text-muted-foreground line-through">{event.price}</p>
              </div>
            ) : event.price ? (
              <span className="text-sm font-semibold text-foreground">{event.price}</span>
            ) : (
              <span className="text-xs text-accent font-medium">Free</span>
            )}
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        )}

        {/* Guest list / capacity */}
        <EventGuestList
          eventId={event.id}
          totalSpots={event.capacity || 100}
          onSpotsChange={(r) => setRemainingSpots(r)}
        />

        {/* Calendar sync */}
        <CalendarSyncButtons
          compact
          event={{
            title: event.title,
            date: event.event_date,
            startTime: event.event_time || undefined,
            durationMinutes: 120,
            description: event.description || undefined,
            location: event.location || undefined,
          }}
        />

        {/* RSVP */}
        {!showRSVP ? (
          <button
            onClick={() => setShowRSVP(true)}
            className={cn(
              "w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
              remainingSpots <= 0
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            {remainingSpots <= 0 ? "Join Waitlist" : "RSVP Now"}
          </button>
        ) : (
          <div className="border-t border-border pt-4">
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
      </div>
    </div>
  );
}

function UpcomingClinics() {
  const today = new Date().toISOString().split("T")[0];

  const { data: events = [], isLoading } = useQuery<ClinicEvent[]>({
    queryKey: ["lessons-upcoming-clinics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_events")
        .select("id, title, description, event_date, event_time, location, capacity, price, early_bird_price, early_bird_deadline")
        .eq("active", true)
        .gte("event_date", today)
        .order("event_date")
        .limit(4);
      if (error) throw error;
      return (data as unknown as ClinicEvent[]) || [];
    },
    staleTime: 60_000,
  });

  if (isLoading) return null;
  if (events.length === 0) return null;

  return (
    <section className="section-padding bg-muted/30">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
            Clinics & Events
          </p>
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">
            Upcoming Clinics
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Intensive group sessions and special events to accelerate your riding. RSVP below or sync to your calendar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {events.map((event) => (
            <ClinicCard key={event.id} event={event} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Inline Booking Flow ──────────────────────────────

type LessonSlot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_bookings: number;
  current_bookings: number;
  slot_type: string;
};

function InlineBookingFlow() {
  const { toast } = useToast();
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[1].value);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<LessonSlot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const program = PROGRAMS.find((p) => p.value === selectedProgram) || PROGRAMS[1];

  // Fetch available lesson slots
  const today = new Date().toISOString().split("T")[0];
  const { data: slots = [] } = useQuery<LessonSlot[]>({
    queryKey: ["lesson-slots-calendar"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_slots")
        .select("id, slot_date, start_time, end_time, max_bookings, current_bookings, slot_type")
        .gte("slot_date", today)
        .order("slot_date")
        .order("start_time");
      return (data as LessonSlot[]) || [];
    },
    staleTime: 30_000,
  });

  // Dates that have available slots
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    slots.forEach((s) => {
      if (s.current_bookings < s.max_bookings) dates.add(s.slot_date);
    });
    return dates;
  }, [slots]);

  // Slots for the selected date
  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    return slots.filter(
      (s) =>
        isSameDay(parseISO(s.slot_date), selectedDate) &&
        s.current_bookings < s.max_bookings
    );
  }, [slots, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimName = name.trim();
    const trimEmail = email.trim();
    if (!trimName || !trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      toast({ title: "Please fill in your name and a valid email.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await supabase.from("inquiries").insert({
        name: trimName.slice(0, 100),
        email: trimEmail.slice(0, 255),
        phone: phone.trim().slice(0, 30) || null,
        services: [program.value],
        project_vision: `Lesson booking: ${program.label} (${program.price}/${program.pricePer})${
          selectedDate ? ` — Preferred date: ${format(selectedDate, "EEE d MMM yyyy")}` : ""
        }${selectedSlot ? ` at ${selectedSlot.start_time}–${selectedSlot.end_time}` : ""}`,
        status: "new",
      });
      setSubmitted(true);
      toast({ title: "Booking request sent!", description: "We'll confirm your lesson within 24 hours." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="book-inline" className="section-padding bg-card border-y border-border">
        <div className="section-container max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">Request Received!</h2>
          <p className="text-muted-foreground mb-2">
            We'll confirm your <strong>{program.label}</strong> lesson within 24 hours.
          </p>
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              Preferred: {format(selectedDate, "EEEE d MMMM yyyy")}
              {selectedSlot && ` at ${selectedSlot.start_time}`}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="book-inline" className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
            Book Now
          </p>
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">
            Reserve Your Lesson
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose your program, pick a date, and we'll confirm your spot within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left: program selector + calendar */}
          <div className="space-y-6">
            {/* Program selector */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Select Program</Label>
              <div className="grid grid-cols-3 gap-2">
                {PROGRAMS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedProgram(p.value)}
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all",
                      selectedProgram === p.value
                        ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                        : "border-border hover:border-accent/30"
                    )}
                  >
                    <p.icon className={cn("h-5 w-5 mx-auto mb-1", selectedProgram === p.value ? "text-accent" : "text-muted-foreground")} />
                    <p className="text-xs font-medium text-foreground">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground">{p.duration}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Inline price quote */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-serif text-lg font-semibold text-foreground">{program.label} Lesson</h3>
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-accent">{program.price}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {program.pricePer}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background border border-border">
                  <Clock className="h-3 w-3" /> {program.duration}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background border border-border">
                  <Users className="h-3 w-3" /> {program.bestFor}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background border border-border">
                  <CalendarIcon className="h-3 w-3" /> {program.frequency}
                </span>
              </div>
            </div>

            {/* Calendar */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Choose a Date</Label>
              <div className="rounded-xl border border-border bg-background p-3 inline-block">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setSelectedSlot(null);
                  }}
                  disabled={(date) => {
                    if (isBefore(date, startOfDay(new Date()))) return true;
                    const key = format(date, "yyyy-MM-dd");
                    return !availableDates.has(key);
                  }}
                  className="pointer-events-auto"
                  modifiers={{
                    available: (date) => availableDates.has(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersClassNames={{
                    available: "font-bold text-accent",
                  }}
                />
              </div>
              {availableDates.size === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No slots published yet — submit your details and we'll schedule you in.
                </p>
              )}
            </div>

            {/* Time slots for selected date */}
            {selectedDate && daySlots.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Available Times — {format(selectedDate, "EEE d MMM")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSlot(s)}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm transition-all",
                        selectedSlot?.id === s.id
                          ? "border-accent bg-accent/10 text-accent font-medium"
                          : "border-border text-foreground hover:border-accent/40"
                      )}
                    >
                      {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {s.max_bookings - s.current_bookings} left
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: lead capture form */}
          <div>
            <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-6 sm:p-8 space-y-5 sticky top-28">
              <h3 className="font-serif text-xl font-semibold text-foreground">Your Details</h3>
              <p className="text-sm text-muted-foreground">
                Fill in your info and we'll confirm your{" "}
                <span className="font-medium text-foreground">{program.label}</span> lesson
                {selectedDate && (
                  <> on <span className="font-medium text-foreground">{format(selectedDate, "EEE d MMM")}</span></>
                )}
                {selectedSlot && (
                  <> at <span className="font-medium text-foreground">{selectedSlot.start_time.slice(0, 5)}</span></>
                )}
                .
              </p>

              <div className="space-y-2">
                <Label htmlFor="book-name">Name *</Label>
                <Input
                  id="book-name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                  className="input-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-email">Email *</Label>
                <Input
                  id="book-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  required
                  className="input-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-phone">Phone (optional)</Label>
                <Input
                  id="book-phone"
                  type="tel"
                  placeholder="0400 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                  className="input-glow"
                />
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program</span>
                  <span className="font-medium text-foreground">{program.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{program.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium text-accent">{program.price}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">{format(selectedDate, "EEE d MMM yyyy")}</span>
                  </div>
                )}
                {selectedSlot && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{selectedSlot.start_time.slice(0, 5)} – {selectedSlot.end_time.slice(0, 5)}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                {submitting ? (
                  "Sending..."
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Request Lesson — {program.price}
                  </>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                No payment required now. We'll confirm availability and contact you.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────

export default function Lessons() {
  const { ref: trainerRef, isVisible: trainerVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  return (
    <Layout>
      <StickySubpageCTA ctaLabel="Book a Lesson" ctaHref="/book-lesson" />

      <PageHeader
        title="Riding Lessons"
        description="Expert tuition for every level — from first sit to show ring"
      />

      {/* Quick-info cards */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <InfoCards />
        </div>
      </section>

      {/* Program levels with pricing */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
              Program Levels
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3">
              Find Your Level
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every rider's journey is different. Choose the program that matches where you are
              now — your first session doubles as an assessment so we place you perfectly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {PROGRAMS.map((p, i) => (
              <ProgramCard key={p.value} program={p} index={i} />
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            All prices are starting-at rates. Prices may vary for specialised sessions or extended durations.
          </p>
        </div>
      </section>

      {/* Inline booking flow */}
      <InlineBookingFlow />

      {/* Trainer spotlight */}
      <section ref={trainerRef} className="section-padding bg-background overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden aspect-[4/3] transition-all duration-700",
                trainerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              )}
            >
              <img
                src={equitanaArena4}
                alt="Riding lesson at Peninsula Equine arena"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs uppercase tracking-widest text-white/70">Your Trainer</span>
                <h3 className="font-serif text-xl text-white font-semibold">{glennBrowitt.name}</h3>
                <p className="text-sm text-white/80">{glennBrowitt.title}</p>
              </div>
            </div>

            {/* Bio */}
            <div
              className={cn(
                "transition-all duration-700 delay-200",
                trainerVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              )}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
                Meet Your Instructor
              </p>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
                {glennBrowitt.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{glennBrowitt.bio[0]}</p>

              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Specialties
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                {glennBrowitt.specialties.slice(0, 6).map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/book-lesson">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Book a Lesson
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={glennBrowitt.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Glenn's Website
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {glennBrowitt.testimonials.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="section-container">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
                Student Stories
              </p>
              <h2 className="font-serif text-3xl font-semibold text-foreground">
                What Our Riders Say
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {glennBrowitt.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col"
                >
                  <Quote className="h-5 w-5 text-accent/40 mb-3" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="section-padding bg-background">
        <div className="section-container max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
              Common Questions
            </p>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Lesson FAQs</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {LESSON_FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 bg-card"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:text-accent py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Upcoming Clinics & Events */}
      <UpcomingClinics />

      {/* Bottom CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="section-container text-center max-w-2xl">
          <div className="w-12 h-px bg-accent mx-auto mb-8" />
          <h2 className="font-serif text-3xl font-semibold mb-4">Ready to Ride?</h2>
          <p className="text-primary-foreground/70 mb-8">
            Book your first session today — no long-term commitment required. Your initial lesson
            doubles as an assessment so we find the perfect program for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/book-lesson">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Book a Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href={`tel:${siteConfig.phone}`}>
                Call {siteConfig.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
