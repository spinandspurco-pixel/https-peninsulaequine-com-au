import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarIcon, Clock, CheckCircle, ArrowRight, Send, Star, Award, Target, ChevronDown, ExternalLink, Quote, Users, Sparkles, Play, Printer, CircleDot, Mail, Phone, MapPin, User, Edit2 } from "lucide-react";
import { z } from "zod";
import { format, startOfMonth, endOfMonth, addMonths, isBefore, startOfDay } from "date-fns";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { BlueprintDivider } from "@/components/BlueprintDivider";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { LessonAvailabilityCalendar } from "@/components/LessonAvailabilityCalendar";
import { DepositPaymentPolicy } from "@/components/DepositPaymentPolicy";
import { PolicyDownloadCenter } from "@/components/PolicyDownloadCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { lessonInfo, glennBrowitt } from "@/data/content";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
import blueprintBarn from "@/assets/blueprint-barn.png";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import ciroWithHorse from "@/assets/ciro-with-horse.png";

// ── Data ──────────────────────────────────────────────

const PROGRAM_LEVELS = [
  {
    value: "beginner",
    label: "Foundation",
    icon: Star,
    tagline: "Build confidence from the ground up",
    description: "Perfect for newcomers or riders returning after a break. Focus on seat, balance, and building a trusting relationship with your horse.",
    topics: ["Mounting & dismounting safely", "Walk & rising trot fundamentals", "Groundwork & horse handling", "Basic arena etiquette"],
    price: "$95",
    pricePer: "per session",
    duration: "45 min",
    frequency: "Weekly recommended",
    bestFor: "Beginners & returners",
    availability: "Open",
    featured: false,
  },
  {
    value: "intermediate",
    label: "Development",
    icon: Target,
    tagline: "Refine your skills, deepen your partnership",
    description: "For riders comfortable at walk, trot, and canter who are ready to develop more refined aids, lateral work, and jumping basics.",
    topics: ["Canter transitions & lead changes", "Introduction to lateral movements", "Pole work & ground lines", "Developing an independent seat"],
    price: "$120",
    pricePer: "per session",
    duration: "60 min",
    frequency: "Weekly or fortnightly",
    bestFor: "Confident walk/trot/canter",
    availability: "Open",
    featured: true,
  },
  {
    value: "advanced",
    label: "Performance",
    icon: Award,
    tagline: "Precision training for serious riders",
    description: "Tailored sessions for experienced riders working on competition preparation, advanced dressage movements, or complex jumping courses.",
    topics: ["Collection & extension", "Advanced lateral work", "Course building & show prep", "Rider biomechanics analysis"],
    price: "$150",
    pricePer: "per session",
    duration: "60 min",
    frequency: "As needed",
    bestFor: "Competitors & advanced riders",
    availability: "Limited spots",
    featured: false,
  },
];

import faqRidingGear from "@/assets/videos/faq-riding-gear.mp4";
import faqLessonSession from "@/assets/videos/faq-lesson-session.mp4";
import faqTrialLesson from "@/assets/videos/faq-trial-lesson.mp4";

const LESSON_FAQS: { question: string; answer: string; video?: string }[] = [
  {
    question: "Do I need my own horse?",
    answer: "Lessons are available on your own horse only at this stage. If you don't have a horse, contact us and we can discuss options.",
  },
  {
    question: "What should I wear?",
    answer: "An approved riding helmet is mandatory. We recommend close-fitting trousers, boots with a small heel, and gloves. No loose clothing or open-toed shoes.",
    video: faqRidingGear,
  },
  {
    question: "How long is each lesson?",
    answer: "Sessions run 45–60 minutes depending on the program level and rider fitness. Beginners typically start with shorter sessions.",
    video: faqLessonSession,
  },
  {
    question: "What's the cancellation policy?",
    answer: "We require 24 hours notice for cancellations. Late cancellations may incur a fee. Weather-related cancellations are handled on a case-by-case basis.",
  },
  {
    question: "Can I book a trial lesson?",
    answer: "Absolutely. Your first session is treated as an assessment so we can place you in the right program level. No long-term commitment required.",
    video: faqTrialLesson,
  },
  {
    question: "Are group lessons available?",
    answer: "Currently all lessons are private (one-on-one). Small group clinics may be offered seasonally—join our mailing list to stay updated.",
  },
];

// ── Quick-Info Cards ──────────────────────────────────

function LessonInfoCards() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const cards = [
    { icon: CalendarIcon, title: "Available Days", detail: "Thursdays & Fridays" },
    { icon: Clock, title: "Session Length", detail: "45–60 minutes" },
    { icon: CheckCircle, title: "All Levels", detail: "Beginner to advanced" },
  ];

  return (
    <div ref={ref} className="grid sm:grid-cols-3 gap-6 mb-16">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={`text-center p-6 rounded-xl bg-card border border-border card-hover-glow transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: `${i * 120}ms` }}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <card.icon className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{card.title}</h3>
          <p className="text-muted-foreground text-sm">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

// ── Program Levels Section ────────────────────────────

function ProgramLevelsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(PROGRAM_LEVELS.length);

  return (
    <section id="program-levels" className="section-padding bg-card">
      <div className="section-container">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">Program Levels & Pricing</h2>
          <p className="text-muted-foreground">
            Compare our three training paths to find the right fit. All sessions are private, one-on-one with Glenn.
          </p>
        </div>

        <div ref={containerRef} className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PROGRAM_LEVELS.map((level, index) => (
            <div
              key={level.value}
              className={cn(
                "group relative rounded-xl border bg-background p-6 sm:p-8 transition-all duration-700 flex flex-col",
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                level.featured
                  ? "border-accent shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.25)] ring-1 ring-accent/20"
                  : "border-border card-hover-glow"
              )}
            >
              {/* Featured badge */}
              {level.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon + title */}
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                <level.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1 transition-colors duration-300 group-hover:text-accent">
                {level.label}
              </h3>
              <p className="text-sm text-accent font-medium mb-4">{level.tagline}</p>

              {/* Price block */}
              <div className="mb-5 pb-5 border-b border-border">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-foreground">{level.price}</span>
                  <span className="text-sm text-muted-foreground">{level.pricePer}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    {level.duration}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5 text-accent" />
                    {level.frequency}
                  </span>
                </div>
              </div>

              {/* Best for */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/5 border border-accent/10 mb-5 self-start">
                <Users className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-foreground">{level.bestFor}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{level.description}</p>

              {/* Topics */}
              <ul className="space-y-2 mb-6 flex-1">
                {level.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>

              {/* Availability + CTA */}
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    level.availability === "Open" ? "bg-green-500" : "bg-amber-500"
                  )} />
                  <span className="text-xs text-muted-foreground">{level.availability}</span>
                </div>
                <Button
                  asChild
                  className={cn(
                    "w-full",
                    level.featured
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm"
                      : "bg-accent hover:bg-accent/90 text-accent-foreground"
                  )}
                >
                  <Link to={`/book-lesson?type=${level.value}`}>
                    Book {level.label} Lesson
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison note */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
          Not sure which level is right for you? Your first session doubles as an assessment — Glenn will recommend the best path forward.
        </p>
      </div>
    </section>
  );
}

// ── FAQ Section ───────────────────────────────────────

function LessonFAQSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-10">
            <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`} />
            <h2 className="heading-section text-foreground mb-4">Lesson FAQs</h2>
            <p className="text-muted-foreground">Common questions about our training program.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {LESSON_FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 data-[state=open]:bg-card transition-colors"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-accent hover:no-underline py-4 text-sm sm:text-base">
                  <span className="flex items-center gap-2">
                    {faq.video && <Play className="h-4 w-4 text-accent shrink-0" />}
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed space-y-4">
                  <p className="text-muted-foreground">{faq.answer}</p>
                  {faq.video && (
                    <div className="rounded-lg overflow-hidden border border-border bg-background">
                      <video
                        src={faq.video}
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// ── Prep Checklist ────────────────────────────────────

const PREP_CHECKLIST = [
  {
    category: "What to Wear",
    items: [
      "Approved riding helmet (AS/NZS 3838 or equivalent)",
      "Close-fitting trousers or jodhpurs",
      "Boots with a small heel (no sneakers or open-toed shoes)",
      "Riding gloves",
      "No loose scarves, jewellery, or baggy clothing",
    ],
  },
  {
    category: "For Your Horse",
    items: [
      "Horse groomed and hooves picked out",
      "Saddle and bridle fitted and clean",
      "Saddle pad / numnah",
      "Boots or bandages if required",
      "Water bucket and hay net for after the session",
    ],
  },
  {
    category: "On the Day",
    items: [
      "Arrive 15 minutes early for warm-up",
      "Bring a water bottle for yourself",
      "Sunscreen and hat for waiting periods",
      "Any veterinary notes or special instructions for Glenn",
      "Phone for emergency contact (kept in car/bag during lesson)",
    ],
  },
  {
    category: "Safety Reminders",
    items: [
      "Let Glenn know about any injuries or medical conditions",
      "Inform staff of your horse's quirks or behavioural notes",
      "Walk the arena perimeter before mounting if it's your first visit",
      "Emergency contacts saved in your phone",
    ],
  },
];

function PrepChecklistSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="section-padding bg-background" id="prep-checklist">
      <div className="section-container">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-10">
            <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`} />
            <h2 className="heading-section text-foreground mb-4">Rider Prep Checklist</h2>
            <p className="text-muted-foreground mb-6">
              Everything you need to bring and know before your lesson. Print or save this page to prepare.
            </p>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Checklist
            </Button>
          </div>

          <div className="space-y-8">
            {PREP_CHECKLIST.map((group, gi) => (
              <div
                key={group.category}
                className={`rounded-xl border border-border bg-card p-6 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${gi * 100 + 200}ms` }}
              >
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CircleDot className="h-5 w-5 text-accent" />
                  {group.category}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-3 text-sm text-foreground/80">
                      <div className="mt-0.5 w-5 h-5 rounded border-2 border-accent/40 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 4-Step Booking Wizard ─────────────────────────────

type WizardData = {
  lessonType: string;
  horseName: string;
  lessonGoals: string;
  slotId: string;
  slotDate: string;
  slotTime: string;
  slotEndTime: string;
  name: string;
  email: string;
  phone: string;
  additionalNotes: string;
};

const DEPOSIT_MAP: Record<string, { full: number; deposit: number; label: string; duration: string }> = {
  beginner:     { full: 95,   deposit: 47.50,  label: "Foundation Lesson",   duration: "45 min" },
  intermediate: { full: 120,  deposit: 60.00,  label: "Development Lesson",  duration: "60 min" },
  advanced:     { full: 150,  deposit: 75.00,  label: "Performance Lesson",  duration: "60 min" },
};

function formatTimeSimple(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

function BookingWizard() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for success / cancel from Stripe redirect
  const isSuccess = searchParams.get("success") === "true";
  const isCancelled = searchParams.get("cancelled") === "true";

  // Pre-fill from URL
  const prefilledLevel = searchParams.get("type") || "";
  const validLevels = PROGRAM_LEVELS.map((l) => l.value);

  const [data, setData] = useState<WizardData>({
    lessonType: validLevels.includes(prefilledLevel) ? prefilledLevel : "",
    horseName: "",
    lessonGoals: "",
    slotId: "",
    slotDate: "",
    slotTime: "",
    slotEndTime: "",
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    phone: searchParams.get("phone") || "",
    additionalNotes: "",
  });

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const pricing = DEPOSIT_MAP[data.lessonType];

  // ── Slot fetching for Step 2 ──
  const [slots, setSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const to = format(endOfMonth(addMonths(currentMonth, 1)), "yyyy-MM-dd");
      const { data: slotData } = await supabase
        .from("lesson_slots")
        .select("*")
        .gte("slot_date", from)
        .lte("slot_date", to)
        .order("slot_date")
        .order("start_time");
      setSlots(slotData || []);
      setSlotsLoading(false);
    };
    if (step === 2) fetchSlots();
  }, [step, currentMonth]);

  const slotsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const slot of slots) {
      if (!map[slot.slot_date]) map[slot.slot_date] = [];
      map[slot.slot_date].push(slot);
    }
    return map;
  }, [slots]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const slot of slots) {
      if (slot.current_bookings < slot.max_bookings) {
        // Filter by lesson type if applicable
        if (slot.slot_type === "lesson" || slot.slot_type === data.lessonType) {
          dates.add(slot.slot_date);
        }
      }
    }
    return dates;
  }, [slots, data.lessonType]);

  const fullDates = useMemo(() => {
    const dates = new Set<string>();
    for (const [date, dateSlots] of Object.entries(slotsByDate)) {
      const relevantSlots = dateSlots.filter(
        (s: any) => s.slot_type === "lesson" || s.slot_type === data.lessonType
      );
      if (relevantSlots.length > 0 && relevantSlots.every((s: any) => s.current_bookings >= s.max_bookings)) {
        dates.add(date);
      }
    }
    return dates;
  }, [slotsByDate, data.lessonType]);

  const selectedDateSlots = selectedSlotDate
    ? (slotsByDate[format(selectedSlotDate, "yyyy-MM-dd")] || []).filter(
        (s: any) => (s.slot_type === "lesson" || s.slot_type === data.lessonType) && s.current_bookings < s.max_bookings
      )
    : [];

  // ── Validation ──
  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!data.lessonType) newErrors.lessonType = "Please select a lesson type";
    }
    if (s === 2) {
      if (!data.slotId) newErrors.slotId = "Please select a time slot";
    }
    if (s === 3) {
      if (!data.name.trim()) newErrors.name = "Name is required";
      if (!data.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  };

  // ── Submit / Checkout ──
  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("create-lesson-checkout", {
        body: {
          slot_id: data.slotId,
          lesson_type: data.lessonType,
          client_name: data.name.trim(),
          client_email: data.email.trim(),
          client_phone: data.phone.trim() || null,
          horse_name: data.horseName.trim() || null,
          experience_level: data.lessonType,
          lesson_goals: data.lessonGoals.trim() || null,
        },
      });

      if (error) throw new Error("Failed to create checkout");

      if (result.mode === "stripe" && result.url) {
        window.location.href = result.url;
      } else if (result.mode === "no_payment") {
        toast({ title: "Booking confirmed!", description: "Your lesson has been booked. We'll send a confirmation email shortly." });
        setStep(5); // success state
      }
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ──
  if (isSuccess || step === 5) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">You're All Set!</h3>
        <p className="text-muted-foreground mb-2 max-w-md mx-auto">
          {isSuccess ? "Your deposit has been received and your lesson is confirmed." : "Your lesson booking has been confirmed."}
        </p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Check your email for a confirmation with all the details.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/book-lesson">Book Another Lesson</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/lessons">View All Programs</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Cancelled state ──
  if (isCancelled) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <CalendarIcon className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">Payment Cancelled</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          No worries — your spot hasn't been charged. You can try again when you're ready.
        </p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to="/book-lesson">Try Again</Link>
        </Button>
      </div>
    );
  }

  const STEP_LABELS = ["Lesson Type", "Pick a Slot", "Your Details", "Review & Pay"];

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <div className={cn("h-0.5 w-6 sm:w-10 rounded-full transition-all", isDone ? "bg-accent" : "bg-muted")} />}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  isActive ? "bg-accent text-accent-foreground ring-2 ring-accent/20" :
                  isDone ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span className={cn("text-xs hidden sm:inline", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Lesson Type ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Select Your Program</Label>
            <RadioGroup value={data.lessonType} onValueChange={(v) => update("lessonType", v)} className="grid gap-3">
              {PROGRAM_LEVELS.map((level) => (
                <Label
                  key={level.value}
                  htmlFor={`wiz-${level.value}`}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-accent/50",
                    data.lessonType === level.value ? "border-accent bg-accent/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={level.value} id={`wiz-${level.value}`} className="sr-only" />
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", data.lessonType === level.value ? "bg-accent/20" : "bg-accent/10")}>
                      <level.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.tagline}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-accent">{level.price}</span>
                    <span className="text-xs text-muted-foreground block">{level.duration}</span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            {errors.lessonType && <p className="text-sm text-destructive mt-1">{errors.lessonType}</p>}
          </div>

          <div>
            <Label htmlFor="wiz-horse">Horse Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="wiz-horse" value={data.horseName} onChange={(e) => update("horseName", e.target.value)} placeholder="Your horse's name" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="wiz-goals">What do you want to work on? <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea id="wiz-goals" value={data.lessonGoals} onChange={(e) => update("lessonGoals", e.target.value)} placeholder="E.g. improve my seat at canter, build jumping confidence..." rows={3} className="mt-1" />
          </div>

          <Button onClick={nextStep} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Continue to Slot Selection <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Pick a Slot ── */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Showing available slots for <span className="font-medium text-foreground">{pricing?.label}</span>. Select a date then pick a time.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Calendar */}
            <div className="bg-card rounded-xl border border-border p-4">
              {slotsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedSlotDate}
                  onSelect={(d) => { setSelectedSlotDate(d); update("slotId", ""); }}
                  onMonthChange={setCurrentMonth}
                  disabled={(date) => {
                    const day = date.getDay();
                    const dateStr = format(date, "yyyy-MM-dd");
                    return isBefore(date, startOfDay(new Date())) || (day !== 4 && day !== 5) || fullDates.has(dateStr);
                  }}
                  modifiers={{
                    available: (date) => availableDates.has(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersClassNames={{
                    available: "!bg-accent/15 !text-accent font-semibold hover:!bg-accent/25 relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-accent",
                  }}
                  className={cn("p-3 pointer-events-auto")}
                />
              )}
            </div>

            {/* Time slots */}
            <div className="bg-card rounded-xl border border-border p-4">
              {!selectedSlotDate ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <CalendarIcon className="h-7 w-7 text-accent mb-3" />
                  <p className="text-sm text-muted-foreground">Select a date to see available times</p>
                </div>
              ) : selectedDateSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <p className="font-medium text-foreground mb-1">{format(selectedSlotDate, "EEEE, MMMM d")}</p>
                  <p className="text-sm text-muted-foreground">No available slots for this date.</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-foreground mb-3">{format(selectedSlotDate, "EEEE, MMMM d")}</p>
                  <div className="space-y-2">
                    {selectedDateSlots.map((slot: any) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          update("slotId", slot.id);
                          update("slotDate", slot.slot_date);
                          update("slotTime", slot.start_time);
                          update("slotEndTime", slot.end_time);
                        }}
                        className={cn(
                          "w-full text-left rounded-lg border p-3 transition-all",
                          data.slotId === slot.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                            : "border-border hover:border-accent/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            <span className="text-sm font-medium text-foreground">
                              {formatTimeSimple(slot.start_time)} – {formatTimeSimple(slot.end_time)}
                            </span>
                          </div>
                          {data.slotId === slot.id && <CheckCircle className="h-4 w-4 text-accent" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {slot.max_bookings - slot.current_bookings} spot{slot.max_bookings - slot.current_bookings !== 1 ? "s" : ""} left
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {errors.slotId && <p className="text-sm text-destructive">{errors.slotId}</p>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button onClick={nextStep} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Your Details ── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Summary card */}
          {pricing && data.slotDate && (
            <div className="rounded-lg bg-accent/5 border border-accent/15 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <CalendarIcon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{pricing.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(data.slotDate + "T00:00:00"), "EEEE, MMMM d")} · {formatTimeSimple(data.slotTime)} – {formatTimeSimple(data.slotEndTime)}
                  </p>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <p className="text-sm font-semibold text-accent">${pricing.deposit.toFixed(2)} deposit</p>
                  <p className="text-[10px] text-muted-foreground">of ${pricing.full} total</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="wiz-name">Full Name *</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="wiz-name" value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className="pl-9" />
            </div>
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="wiz-email">Email *</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="wiz-email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" className="pl-9" />
            </div>
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="wiz-phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="wiz-phone" type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="04XX XXX XXX" className="pl-9" />
            </div>
          </div>
          <div>
            <Label htmlFor="wiz-notes">Additional Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea id="wiz-notes" value={data.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} placeholder="Anything else Glenn should know..." rows={3} className="mt-1" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
            <Button onClick={nextStep} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              Review Booking <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Review & Pay ── */}
      {step === 4 && pricing && (
        <div className="space-y-6">
          {/* Lesson summary */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Lesson</span>
              <button onClick={() => setStep(1)} className="text-xs text-accent hover:underline flex items-center gap-1">
                <Edit2 className="h-3 w-3" /> Edit
              </button>
            </div>
            <div className="flex items-center gap-3">
              {(() => { const P = PROGRAM_LEVELS.find(l => l.value === data.lessonType); return P ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <P.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{P.label}</p>
                    <p className="text-xs text-muted-foreground">{P.price} · {P.duration}</p>
                  </div>
                </>
              ) : null; })()}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-accent shrink-0" />
                <span className="text-foreground">{format(new Date(data.slotDate + "T00:00:00"), "EEE, MMM d")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                <span className="text-foreground">{formatTimeSimple(data.slotTime)} – {formatTimeSimple(data.slotEndTime)}</span>
              </div>
            </div>
            {data.horseName.trim() && (
              <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
                <Star className="h-4 w-4 text-accent shrink-0" />
                <span className="text-foreground">{data.horseName}</span>
              </div>
            )}
          </div>

          {/* Contact summary */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Your Details</span>
              <button onClick={() => setStep(3)} className="text-xs text-accent hover:underline flex items-center gap-1">
                <Edit2 className="h-3 w-3" /> Edit
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-accent shrink-0" /><span className="text-foreground">{data.name}</span></div>
              <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-accent shrink-0" /><span className="text-foreground">{data.email}</span></div>
              {data.phone.trim() && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-accent shrink-0" /><span className="text-foreground">{data.phone}</span></div>}
            </div>
          </div>

          {/* Deposit breakdown */}
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-5 space-y-3">
            <span className="text-xs uppercase tracking-widest text-accent font-medium">Payment Summary</span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground">{pricing.label}</span>
                <span className="text-foreground">${pricing.full.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-accent border-t border-accent/15 pt-2">
                <span>50% Deposit Due Now</span>
                <span>${pricing.deposit.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Remaining ${(pricing.full - pricing.deposit).toFixed(2)} due on the day of your lesson.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
            <Button onClick={handleCheckout} disabled={isSubmitting} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? "Processing..." : `Pay $${pricing.deposit.toFixed(2)} Deposit`}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            You'll be redirected to secure checkout. Your booking is confirmed once payment is received.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Glenn Browitt Trainer Profile ─────────────────────

function TrainerProfileSection() {
  const { ref: bioRef, isVisible: bioVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const { ref: specRef, isVisible: specVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="section-padding bg-background overflow-hidden relative">
      <BlueprintBackground image={blueprintBarn} opacity={0.025} direction="right-to-left" duration={2000} />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Bio content */}
          <div
            ref={bioRef}
            className={`lg:col-span-7 transition-all duration-700 ${
              bioVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <AnimatedDivider className="mb-8" />
            
            <SectionTransition variant="fade-right" delay={100}>
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-4">
                Your Trainer
              </p>
            </SectionTransition>

            <SectionTransition variant="fade-right" delay={200}>
              <h2 className="heading-editorial text-foreground mb-2">
                {glennBrowitt.name}
              </h2>
              <p className="text-lg text-accent font-serif italic mb-8">
                {glennBrowitt.title}
              </p>
            </SectionTransition>

            {glennBrowitt.bio.map((paragraph, i) => (
              <SectionTransition key={i} variant="fade-up" delay={300 + i * 100}>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {paragraph}
                </p>
              </SectionTransition>
            ))}

            <SectionTransition variant="fade-up" delay={600}>
              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <a href="#book">
                    Book a Lesson with Glenn
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-accent/30 text-accent hover:bg-accent/10"
                >
                  <a href={glennBrowitt.website} target="_blank" rel="noopener noreferrer">
                    Glenn's Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </SectionTransition>
          </div>

          {/* Specialties card */}
          <div
            ref={specRef}
            className={`lg:col-span-5 transition-all duration-700 delay-200 ${
              specVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 card-hover-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">Specialties</h3>
                  <p className="text-sm text-muted-foreground">{glennBrowitt.yearsExperience}+ years experience</p>
                </div>
              </div>
              <ul className="space-y-3">
                {glennBrowitt.specialties.map((specialty, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm transition-all duration-500 ${
                      specVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    }`}
                    style={{ transitionDelay: `${300 + i * 60}ms` }}
                  >
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{specialty}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-px bg-border mt-6 rounded-xl overflow-hidden">
              {[
                { value: "25+", label: "Years Teaching" },
                { value: "All", label: "Levels Welcome" },
                { value: "1:1", label: "Private Lessons" },
                { value: "Thu–Fri", label: "Available Days" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`bg-card p-5 text-center transition-all duration-500 ${
                    specVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${500 + i * 80}ms` }}
                >
                  <span className="font-serif text-2xl text-foreground font-semibold block">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Student Success & Testimonials ──────────────────────────────

// ── Weekly Progress Tracker ────────────────────────────

const WEEKLY_MILESTONES = [
  {
    week: 1,
    title: "First Steps",
    foundation: "Safety, mounting, basic seat position",
    development: "Assess current level, set goals",
    performance: "Biomechanics analysis & baseline",
  },
  {
    week: 2,
    title: "Building Rhythm",
    foundation: "Walk rhythm, steering & stopping",
    development: "Trot refinement, rein contact",
    performance: "Advanced flatwork drills",
  },
  {
    week: 4,
    title: "Growing Confidence",
    foundation: "Rising trot introduction, groundwork",
    development: "Canter transitions, lateral intro",
    performance: "Collected & extended gaits",
  },
  {
    week: 8,
    title: "Milestone Check-in",
    foundation: "Walk/trot confidence, arena etiquette",
    development: "Jumping basics, course patterns",
    performance: "Competition-ready sequences",
  },
  {
    week: 12,
    title: "Level Up",
    foundation: "Ready for Development path",
    development: "Ready for Performance path",
    performance: "Show prep & competition entry",
  },
];

function ProgressTrackerSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(WEEKLY_MILESTONES.length);
  const [activePath, setActivePath] = useState<"foundation" | "development" | "performance">("foundation");

  const pathConfig = {
    foundation: { label: "Foundation", price: "$95/session" },
    development: { label: "Development", price: "$120/session" },
    performance: { label: "Performance", price: "$150/session" },
  };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <BlueprintBackground image={blueprintDetail} opacity={0.03} direction="left-to-right" duration={2000} />
      <div className="section-container relative z-10">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-10 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-3">Your Weekly Journey</h2>
          <p className="text-muted-foreground text-sm">
            Track your progress from first ride to mastery. Each path follows a structured milestone roadmap.
          </p>
        </div>

        {/* Path selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {(Object.keys(pathConfig) as Array<keyof typeof pathConfig>).map((path) => (
            <button
              key={path}
              onClick={() => setActivePath(path)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300",
                activePath === path
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
              )}
            >
              {pathConfig[path].label}
              <span className="ml-1.5 opacity-70">{pathConfig[path].price}</span>
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div ref={containerRef} className="relative max-w-2xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {WEEKLY_MILESTONES.map((milestone, index) => (
              <div
                key={milestone.week}
                className={`relative pl-16 transition-all duration-700 ${
                  visibleItems[index] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                {/* Node */}
                <div className="absolute left-4 top-1 w-5 h-5 rounded-full border-2 border-accent bg-background flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>

                {/* Card */}
                <div className="rounded-xl border border-border bg-card p-5 hover:border-accent/30 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">
                      Week {milestone.week}
                    </span>
                    <h3 className="font-serif font-semibold text-foreground">{milestone.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {milestone[activePath]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="pl-16 mt-8">
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to={`/book-lesson?type=${activePath === "foundation" ? "beginner" : activePath === "development" ? "intermediate" : "advanced"}`}>
                Start {pathConfig[activePath].label} Path
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Student Progress & Testimonials ───────────────────

const STUDENT_PROGRESS = [
  { label: "Riders Trained", value: "200+", icon: Users },
  { label: "Years Teaching", value: "25+", icon: Award },
  { label: "Avg. Rating", value: "5.0", icon: Star },
];

function TrainerTestimonialsSection() {
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintDetail} opacity={0.03} direction="bottom-to-top" duration={1800} />
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8" />
          <SectionTransition variant="fade-up" delay={100}>
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
              Student Success Stories
            </p>
          </SectionTransition>
          <SectionTransition variant="scale-up" delay={200}>
            <h2 className="heading-section text-foreground mb-4">
              Real Progress, Real Riders
            </h2>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={300}>
            <p className="text-muted-foreground leading-relaxed">
              Every rider has a different starting point — but Glenn's students consistently achieve breakthroughs they didn't think were possible.
            </p>
          </SectionTransition>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12"
        >
          {STUDENT_PROGRESS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border border-border bg-background transition-all duration-700 ${
                statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <stat.icon className="h-5 w-5 text-accent" />
              <span className="font-serif text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div ref={gridRef} className="max-w-4xl mx-auto">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {glennBrowitt.testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2">
                  <div
                    className={`group relative rounded-xl border border-border bg-background p-6 sm:p-8 h-full transition-all duration-700 ease-out hover:border-accent/40 hover:shadow-lg hover:-translate-y-1 ${
                      gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 120}ms` }}
                  >
                    {/* Progress badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold uppercase tracking-wider mb-4">
                      <CheckCircle className="h-3 w-3" />
                      {testimonial.role}
                    </div>

                    {/* Quote icon */}
                    <Quote className="h-8 w-8 text-accent/20 mb-3" />

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-foreground leading-relaxed mb-6 font-serif italic">
                      "{testimonial.quote}"
                    </blockquote>

                    {/* Attribution */}
                    <div className="pt-4 border-t border-border flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-serif font-bold text-sm">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-serif font-semibold text-foreground text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="border-border text-foreground -left-12" />
              <CarouselNext className="border-border text-foreground -right-12" />
            </div>
          </Carousel>
        </div>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <a href="#book">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent/10">
            <Link to="/testimonials">
              Read All Reviews
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Sticky Booking CTA ────────────────────────────────

function StickyBookingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const programSection = document.getElementById("program-levels");
      const bookSection = document.getElementById("book");
      if (!programSection || !bookSection) return;

      const programBottom = programSection.getBoundingClientRect().bottom;
      const bookTop = bookSection.getBoundingClientRect().top;

      // Show when scrolled past program cards, hide when booking form is in view
      setVisible(programBottom < 0 && bookTop > window.innerHeight * 0.5);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <div className="bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_-4px_hsl(var(--foreground)/0.08)] pointer-events-auto">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-serif font-semibold text-foreground">Ready to ride?</p>
            <p className="text-xs text-muted-foreground">Sessions from $95 · Thursdays & Fridays</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
          >
            <a href="#book">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Book a Lesson
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────

export default function BookLesson() {
  return (
    <Layout>
      <PageHeader
        title="Training with Glenn Browitt"
        description="Over 25 years of riding tuition and horsemanship — from the nervous beginner to the competitive rider. Lessons run every Thursday and Friday at the Peninsula Equine arena."
        backgroundImage={aberdeenBarnInterior}
      />

      {/* Quick info + intro */}
      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="right-to-left" duration={2000} parallaxSpeed={0.06} />

        <div className="section-container relative z-10">
          <LessonInfoCards />

          <div className="max-w-2xl mx-auto text-center mb-4">
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground leading-relaxed">{lessonInfo.description}</p>
          </div>
        </div>
      </section>

      {/* Glenn Browitt Profile */}
      <BlueprintDivider variant="elevation" />
      <TrainerProfileSection />

      {/* Program Levels */}
      <ProgramLevelsSection />

      {/* Weekly Progress Tracker */}
      <ProgressTrackerSection />

      {/* Availability Calendar */}
      <section className="section-padding bg-background relative overflow-hidden">
        <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="left-to-right" duration={2200} parallaxSpeed={0.05} />
        <div className="section-container relative z-10">
          <LessonAvailabilityCalendar />
        </div>
      </section>

      {/* Glenn's Testimonials */}
      <TrainerTestimonialsSection />

      {/* FAQ */}
      <LessonFAQSection />

      {/* Prep Checklist */}
      <PrepChecklistSection />

      <DepositPaymentPolicy ctaHref="/book-lesson#book" ctaLabel="Book a Lesson" />

      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <PolicyDownloadCenter />
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="book" className="section-padding bg-card scroll-mt-20">
        <div className="section-container">
          <div className="max-w-xl mx-auto">
            <div className="bg-background rounded-xl p-6 sm:p-8 border border-border">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Book a Lesson with Glenn</h2>
              <p className="text-muted-foreground mb-8 text-sm">Choose your lesson, pick a slot, and secure your spot with a 50% deposit.</p>
              <BookingWizard />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky booking CTA */}
      <StickyBookingCTA />
    </Layout>
  );
}
