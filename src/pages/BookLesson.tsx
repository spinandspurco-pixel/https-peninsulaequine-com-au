import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, Clock, CheckCircle, ArrowRight, Send, Star, Award, Target, ChevronDown } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { lessonInfo } from "@/data/content";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
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
  },
  {
    value: "intermediate",
    label: "Development",
    icon: Target,
    tagline: "Refine your skills, deepen your partnership",
    description: "For riders comfortable at walk, trot, and canter who are ready to develop more refined aids, lateral work, and jumping basics.",
    topics: ["Canter transitions & lead changes", "Introduction to lateral movements", "Pole work & ground lines", "Developing an independent seat"],
  },
  {
    value: "advanced",
    label: "Performance",
    icon: Award,
    tagline: "Precision training for serious riders",
    description: "Tailored sessions for experienced riders working on competition preparation, advanced dressage movements, or complex jumping courses.",
    topics: ["Collection & extension", "Advanced lateral work", "Course building & show prep", "Rider biomechanics analysis"],
  },
];

const LESSON_FAQS = [
  {
    question: "Do I need my own horse?",
    answer: "Lessons are available on your own horse only at this stage. If you don't have a horse, contact us and we can discuss options.",
  },
  {
    question: "What should I wear?",
    answer: "An approved riding helmet is mandatory. We recommend close-fitting trousers, boots with a small heel, and gloves. No loose clothing or open-toed shoes.",
  },
  {
    question: "How long is each lesson?",
    answer: "Sessions run 45–60 minutes depending on the program level and rider fitness. Beginners typically start with shorter sessions.",
  },
  {
    question: "What's the cancellation policy?",
    answer: "We require 24 hours notice for cancellations. Late cancellations may incur a fee. Weather-related cancellations are handled on a case-by-case basis.",
  },
  {
    question: "Can I book a trial lesson?",
    answer: "Absolutely. Your first session is treated as an assessment so we can place you in the right program level. No long-term commitment required.",
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
    <section className="section-padding bg-card">
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
          <h2 className="heading-section text-foreground mb-4">Program Levels</h2>
          <p className="text-muted-foreground">
            Our structured programs meet you where you are and take you where you want to go.
          </p>
        </div>

        <div ref={containerRef} className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PROGRAM_LEVELS.map((level, index) => (
            <div
              key={level.value}
              className={`group relative rounded-xl border border-border bg-background p-6 sm:p-8 card-hover-glow transition-all duration-700 ${
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                <level.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1 transition-colors duration-300 group-hover:text-accent">
                {level.label}
              </h3>
              <p className="text-sm text-accent font-medium mb-3">{level.tagline}</p>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{level.description}</p>
              <ul className="space-y-2 mb-6">
                {level.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <a href="#book">
                  Book {level.label} Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
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
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// ── Booking Form (unchanged logic) ───────────────────

type BookingFormData = {
  name: string;
  email: string;
  phone?: string;
  horseName?: string;
  experienceLevel: string;
  lessonGoals: string;
  preferredDay: string;
  preferredDate?: Date;
  additionalNotes?: string;
};

function BookingForm() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    name: "", email: "", phone: "", horseName: "", experienceLevel: "",
    lessonGoals: "", preferredDay: "", preferredDate: undefined, additionalNotes: "",
  });

  const updateField = <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!formData.experienceLevel) newErrors.experienceLevel = "Please select your experience level";
      if (!formData.lessonGoals?.trim()) newErrors.lessonGoals = "Please describe your goals";
      if (!formData.preferredDay) newErrors.preferredDay = "Please select a preferred day";
    }
    if (s === 2) {
      if (!formData.name?.trim()) newErrors.name = "Name is required";
      if (!formData.email?.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep2 = () => { if (validateStep(1)) setStep(2); };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: formData.name?.trim() || "",
        email: formData.email?.trim() || "",
        phone: formData.phone?.trim() || null,
        preferred_contact: "email",
        services: ["lessons"],
        horse_name: formData.horseName?.trim() || null,
        experience_level: formData.experienceLevel || null,
        project_vision: formData.lessonGoals?.trim() || null,
        project_details: `Preferred day: ${formData.preferredDay}${formData.preferredDate ? ` | Preferred date: ${format(formData.preferredDate, "yyyy-MM-dd")}` : ""}${formData.additionalNotes?.trim() ? ` | Notes: ${formData.additionalNotes.trim()}` : ""}`,
        preferred_start: formData.preferredDate ? format(formData.preferredDate, "yyyy-MM-dd") : null,
      });
      if (error) throw error;

      supabase.functions.invoke("send-inquiry-notification", {
        body: {
          name: formData.name?.trim(), email: formData.email?.trim(), phone: formData.phone?.trim(),
          services: ["lessons"], horseName: formData.horseName?.trim(), experienceLevel: formData.experienceLevel,
          goals: formData.lessonGoals?.trim(),
          additionalNotes: `Preferred day: ${formData.preferredDay}. ${formData.additionalNotes?.trim() || ""}`,
        },
      }).catch(() => {});

      setIsSubmitted(true);
      toast({ title: "Lesson inquiry sent!", description: "We'll be in touch to confirm your booking." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us directly.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">Booking Request Received!</h3>
        <p className="text-muted-foreground mb-2 max-w-md mx-auto">We'll confirm your lesson time within 1–2 business days.</p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Check your email for a confirmation shortly.</p>
        <Button onClick={() => { setIsSubmitted(false); setStep(1); setFormData({ name: "", email: "", phone: "", horseName: "", experienceLevel: "", lessonGoals: "", preferredDay: "", preferredDate: undefined, additionalNotes: "" }); }} variant="outline">
          Book Another Lesson
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all", step >= 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
          {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
        </div>
        <div className={cn("h-0.5 w-12 rounded-full transition-all", step > 1 ? "bg-accent" : "bg-muted")} />
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all", step === 2 ? "bg-accent text-accent-foreground ring-2 ring-accent/20" : "bg-muted text-muted-foreground")}>
          2
        </div>
        <span className="text-sm text-muted-foreground ml-2">
          {step === 1 ? "Lesson Details" : "Your Info"}
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Your Riding Experience</Label>
            <RadioGroup value={formData.experienceLevel} onValueChange={(v) => updateField("experienceLevel", v)} className="grid sm:grid-cols-3 gap-3">
              {PROGRAM_LEVELS.map((level) => (
                <Label
                  key={level.value}
                  htmlFor={`exp-${level.value}`}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-accent/50",
                    formData.experienceLevel === level.value ? "border-accent bg-accent/5" : "border-border"
                  )}
                >
                  <RadioGroupItem value={level.value} id={`exp-${level.value}`} className="sr-only" />
                  <span className="font-medium text-foreground">{level.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{level.tagline}</span>
                </Label>
              ))}
            </RadioGroup>
            {errors.experienceLevel && <p className="text-sm text-destructive mt-1">{errors.experienceLevel}</p>}
          </div>

          <div>
            <Label htmlFor="horseName">Horse Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="horseName" value={formData.horseName || ""} onChange={(e) => updateField("horseName", e.target.value)} placeholder="Your horse's name" maxLength={100} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="goals">What do you want to work on?</Label>
            <Textarea id="goals" value={formData.lessonGoals || ""} onChange={(e) => updateField("lessonGoals", e.target.value)} placeholder="E.g. improve my seat at canter, build confidence jumping, introduce my young horse to arena work..." maxLength={1000} rows={4} className="mt-1" />
            {errors.lessonGoals && <p className="text-sm text-destructive mt-1">{errors.lessonGoals}</p>}
            <p className="text-xs text-muted-foreground mt-1">{(formData.lessonGoals?.length || 0)}/1000</p>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Preferred Day</Label>
            <div className="flex gap-3">
              {["Thursday", "Friday"].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => updateField("preferredDay", day.toLowerCase())}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                    formData.preferredDay === day.toLowerCase()
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.preferredDay && <p className="text-sm text-destructive mt-1">{errors.preferredDay}</p>}
          </div>

          <div>
            <Label>Preferred Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !formData.preferredDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.preferredDate ? format(formData.preferredDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.preferredDate}
                  onSelect={(d) => updateField("preferredDate", d)}
                  disabled={(date) => {
                    const day = date.getDay();
                    return date < new Date() || (day !== 4 && day !== 5);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={goToStep2} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={formData.name || ""} onChange={(e) => updateField("name", e.target.value)} placeholder="Your name" maxLength={100} className="mt-1" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" maxLength={255} className="mt-1" />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="phone" type="tel" value={formData.phone || ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="04XX XXX XXX" maxLength={20} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="notes">Anything else? <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea id="notes" value={formData.additionalNotes || ""} onChange={(e) => updateField("additionalNotes", e.target.value)} placeholder="Any additional info..." maxLength={500} rows={3} className="mt-1" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? "Sending..." : "Book Lesson"}
              {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────

export default function BookLesson() {
  return (
    <Layout>
      <PageHeader
        title="Training & Lessons"
        description="Structured riding programs for every level. Learn from an experienced trainer at our purpose-built facility, available Thursdays and Fridays."
        backgroundImage={aberdeenBarnInterior}
      />

      {/* Quick info + intro */}
      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintFacility} opacity={0.04} direction="right-to-left" duration={2000} parallaxSpeed={0.06} />
        <BlueprintBackground image={blueprintDetail} opacity={0.025} direction="bottom-to-top" duration={2400} parallaxSpeed={0.1} className="scale-110" />
        <BlueprintLineOverlay variant="dimensions" color="dark" />

        <div className="section-container relative z-10">
          <LessonInfoCards />

          <div className="max-w-2xl mx-auto text-center mb-4">
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground leading-relaxed">{lessonInfo.description}</p>
          </div>
        </div>
      </section>

      {/* Program Levels */}
      <ProgramLevelsSection />

      {/* FAQ */}
      <LessonFAQSection />

      {/* Booking Form */}
      <section id="book" className="section-padding bg-card scroll-mt-20">
        <div className="section-container">
          <div className="max-w-xl mx-auto">
            <div className="bg-background rounded-xl p-6 sm:p-8 border border-border">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Book Your Lesson</h2>
              <p className="text-muted-foreground mb-8 text-sm">Fill out the form below and we'll confirm your booking within 1–2 business days.</p>
              <BookingForm />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
