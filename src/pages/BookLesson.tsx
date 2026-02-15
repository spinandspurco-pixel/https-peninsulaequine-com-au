import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, Clock, CheckCircle, ArrowRight, Send } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { lessonInfo } from "@/data/content";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  horseName: z.string().trim().max(100).optional(),
  experienceLevel: z.string().min(1, "Please select your experience level"),
  lessonGoals: z.string().trim().min(1, "Please describe your goals").max(1000, "Keep goals under 1000 characters"),
  preferredDay: z.string().min(1, "Please select a preferred day"),
  preferredDate: z.date().optional(),
  additionalNotes: z.string().trim().max(500).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to riding or horses" },
  { value: "intermediate", label: "Intermediate", description: "Comfortable at walk, trot, canter" },
  { value: "advanced", label: "Advanced", description: "Experienced rider refining skills" },
];

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

function BookingForm() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    name: "",
    email: "",
    phone: "",
    horseName: "",
    experienceLevel: "",
    lessonGoals: "",
    preferredDay: "",
    preferredDate: undefined,
    additionalNotes: "",
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

      // Send notification (non-blocking)
      supabase.functions.invoke("send-inquiry-notification", {
        body: {
          name: formData.name?.trim(),
          email: formData.email?.trim(),
          phone: formData.phone?.trim(),
          services: ["lessons"],
          horseName: formData.horseName?.trim(),
          experienceLevel: formData.experienceLevel,
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
          {/* Experience Level */}
          <div>
            <Label className="text-base font-medium mb-3 block">Your Riding Experience</Label>
            <RadioGroup value={formData.experienceLevel} onValueChange={(v) => updateField("experienceLevel", v)} className="grid sm:grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
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
                  <span className="text-xs text-muted-foreground text-center">{level.description}</span>
                </Label>
              ))}
            </RadioGroup>
            {errors.experienceLevel && <p className="text-sm text-destructive mt-1">{errors.experienceLevel}</p>}
          </div>

          {/* Horse Name */}
          <div>
            <Label htmlFor="horseName">Horse Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="horseName" value={formData.horseName || ""} onChange={(e) => updateField("horseName", e.target.value)} placeholder="Your horse's name" maxLength={100} className="mt-1" />
          </div>

          {/* Goals */}
          <div>
            <Label htmlFor="goals">What do you want to work on?</Label>
            <Textarea id="goals" value={formData.lessonGoals || ""} onChange={(e) => updateField("lessonGoals", e.target.value)} placeholder="E.g. improve my seat at canter, build confidence jumping, introduce my young horse to arena work..." maxLength={1000} rows={4} className="mt-1" />
            {errors.lessonGoals && <p className="text-sm text-destructive mt-1">{errors.lessonGoals}</p>}
            <p className="text-xs text-muted-foreground mt-1">{(formData.lessonGoals?.length || 0)}/1000</p>
          </div>

          {/* Preferred Day */}
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

          {/* Preferred Date (optional) */}
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
                    return date < new Date() || (day !== 4 && day !== 5); // Only Thu/Fri
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

export default function BookLesson() {
  return (
    <Layout>
      <PageHeader
        title="Book a Lesson"
        description="Learn from an experienced trainer right here at our facility. Available Thursdays and Fridays for riders of all levels."
        backgroundImage={aberdeenBarnInterior}
      />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintFacility} opacity={0.04} direction="right-to-left" duration={2000} parallaxSpeed={0.06} />
        <BlueprintBackground image={blueprintDetail} opacity={0.025} direction="bottom-to-top" duration={2400} parallaxSpeed={0.1} className="scale-110" />
        <BlueprintLineOverlay variant="dimensions" color="dark" />

        <div className="section-container relative z-10">
          <LessonInfoCards />

          {/* About the program */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground leading-relaxed">{lessonInfo.description}</p>
          </div>

          {/* Booking Form */}
          <div className="max-w-xl mx-auto">
            <div className="bg-card rounded-xl p-6 sm:p-8 border border-border">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Request a Lesson</h2>
              <p className="text-muted-foreground mb-8 text-sm">Fill out the form below and we'll confirm your booking.</p>
              <BookingForm />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
