import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, User, Mail, Phone, MessageSquare, CalendarIcon, Edit2, ShieldCheck, RotateCcw, Save, Trash2 } from "lucide-react";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const SERVICE_OPTIONS = [
  { id: "arena-construction", label: "Arena Construction" },
  { id: "barn-construction", label: "Barn & Stables" },
  { id: "fencing", label: "Equine Fencing" },
  { id: "round-pens", label: "Round Pens & Paddocks" },
  { id: "full-facility", label: "Full Facility Build" },
  { id: "ground-systems", label: "Ground Systems (GroundLock™)" },
  { id: "renovations", label: "Renovations & Repairs" },
  { id: "design-consultancy", label: "Design & Consultancy" },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "professional", label: "Professional" },
];

const BUDGET_RANGES = [
  { id: "under-25k", label: "Under $25K" },
  { id: "25k-75k", label: "$25K – $75K" },
  { id: "75k-150k", label: "$75K – $150K" },
  { id: "150k-plus", label: "$150K+" },
  { id: "not-sure", label: "Not Sure Yet" },
];

const TIMELINE_OPTIONS = [
  { id: "asap", label: "As Soon as Possible" },
  { id: "1-3-months", label: "1–3 Months" },
  { id: "3-6-months", label: "3–6 Months" },
  { id: "6-12-months", label: "6–12 Months" },
  { id: "planning", label: "Just Planning" },
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().max(30).optional(),
});

const TOTAL_STEPS = 4;
const DRAFT_KEY = "pe_inquiry_draft";

interface DraftState {
  step: number;
  selectedServices: string[];
  preferredService: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  budget: string;
  message: string;
  savedAt: number;
}

function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as DraftState;
    // Expire drafts after 7 days
    if (Date.now() - draft.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

interface MultiStepInquiryFormProps {
  className?: string;
}

export function MultiStepInquiryForm({ className }: MultiStepInquiryFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-fill from URL params
  const preService = searchParams.get("service") || "";
  const preServices = searchParams.get("services")?.split(",").filter(Boolean) || [];
  const initialServices = preService ? [preService] : preServices;
  const preName = searchParams.get("name") || "";
  const preEmail = searchParams.get("email") || "";
  const prePhone = searchParams.get("phone") || "";

  // Load saved draft (only if no URL params override)
  const existingDraft = loadDraft();
  const hasDraft = !!existingDraft && initialServices.length === 0;

  const [step, setStep] = useState(initialServices.length > 0 ? 2 : hasDraft ? existingDraft!.step : 1);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialServices.length > 0 ? initialServices : hasDraft ? existingDraft!.selectedServices : []
  );
  const [preferredService, setPreferredService] = useState(hasDraft ? existingDraft!.preferredService || "" : initialServices[0] || "");
  const [name, setName] = useState(preName || (hasDraft ? existingDraft!.name : ""));
  const [email, setEmail] = useState(preEmail || (hasDraft ? existingDraft!.email : ""));
  const [phone, setPhone] = useState(prePhone || (hasDraft ? existingDraft!.phone : ""));
  const [experience, setExperience] = useState(hasDraft ? existingDraft!.experience : "");
  const [budget, setBudget] = useState(hasDraft ? existingDraft!.budget : "");
  const [message, setMessage] = useState(hasDraft ? existingDraft!.message : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(hasDraft);
  const [lastSaved, setLastSaved] = useState<Date | null>(hasDraft ? new Date(existingDraft!.savedAt) : null);

  // Auto-save draft on changes
  const saveDraft = useCallback(() => {
    if (submitted) return;
    const draft: DraftState = {
      step,
      selectedServices,
      preferredService,
      name,
      email,
      phone,
      experience,
      budget,
      message,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setLastSaved(new Date());
  }, [step, selectedServices, preferredService, name, email, phone, experience, budget, message, submitted]);

  // Debounced auto-save
  useEffect(() => {
    if (submitted) return;
    const timeout = setTimeout(saveDraft, 800);
    return () => clearTimeout(timeout);
  }, [saveDraft, submitted]);

  const handleClearDraft = () => {
    clearDraft();
    setStep(1);
    setSelectedServices([]);
    setPreferredService("");
    setName("");
    setEmail("");
    setPhone("");
    setExperience("");
    setBudget("");
    setMessage("");
    setShowDraftBanner(false);
    setLastSaved(null);
    toast({ title: "Draft cleared", description: "Starting fresh." });
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setErrors((prev) => ({ ...prev, services: "" }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (selectedServices.length === 0) {
        newErrors.services = "Please select at least one service.";
      }
    }

    if (s === 2) {
      const result = contactSchema.safeParse({ name, email, phone: phone || undefined });
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          newErrors[issue.path[0] as string] = issue.message;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 255),
        phone: phone.trim().slice(0, 30) || null,
        services: selectedServices,
        preferred_service: preferredService || null,
        experience_level: experience || null,
        budget_range: budget || null,
        project_details: message.trim().slice(0, 1000) || null,
        notes: "Multi-step inquiry from homepage",
        status: "new",
      });

      if (error) throw error;

      supabase.functions
        .invoke("send-inquiry-notification", {
          body: {
            name: name.trim(),
            email: email.trim(),
            services: selectedServices,
            budgetRange: budget || undefined,
            goals: message.trim() || "Multi-step homepage inquiry",
          },
        })
        .catch(() => {});

      // Trigger welcome series step 1 (fire-and-forget)
      supabase.functions
        .invoke("send-welcome-series", {
          body: { email: email.trim(), name: name.trim(), source: "multi-step-inquiry" },
        })
        .catch(() => {});

      clearDraft();
      setSubmitted(true);
      trackCtaClick("inquiry_funnel_convert", { services: selectedServices, budget });
      toast({ title: "Inquiry sent!", description: "We'll be in touch within 1–2 business days." });
      const tyParams = new URLSearchParams();
      if (selectedServices.length) tyParams.set("services", selectedServices.join(","));
      if (name.trim()) tyParams.set("name", name.trim());
      if (email.trim()) tyParams.set("email", email.trim());
      navigate(`/thank-you?${tyParams.toString()}`);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  /** Navigate to booking page with pre-filled data from the quote form */
  const handleBookConsultation = () => {
    const params = new URLSearchParams();
    if (name.trim()) params.set("name", name.trim());
    if (email.trim()) params.set("email", email.trim());
    if (phone.trim()) params.set("phone", phone.trim());
    navigate(`/book-lesson?${params.toString()}`);
  };

  const serviceLabels = selectedServices
    .map((id) => SERVICE_OPTIONS.find((s) => s.id === id)?.label)
    .filter(Boolean);

  const budgetLabel = BUDGET_RANGES.find((b) => b.id === budget)?.label;
  const experienceLabel = EXPERIENCE_LEVELS.find((e) => e.id === experience)?.label;

  if (submitted) {
    const scheduleParams = new URLSearchParams({
      ...(selectedServices.length ? { services: selectedServices.join(",") } : {}),
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
    });
    return (
      <div className={cn("rounded-2xl border border-border bg-card p-8 sm:p-12 text-center", className)}>
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">Thank You!</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
          Your inquiry has been received. We'll get back to you within 1–2 business days.
        </p>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <a href={`/schedule?${scheduleParams.toString()}`}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Book Your Consultation Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      {/* Draft resume banner */}
      {showDraftBanner && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-accent/10 border-b border-accent/20">
          <div className="flex items-center gap-2 min-w-0">
            <RotateCcw className="h-4 w-4 text-accent flex-shrink-0" />
            <p className="text-sm text-foreground truncate">
              <span className="font-medium">Draft restored</span>
              <span className="text-muted-foreground"> — pick up where you left off</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleClearDraft}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
            <button
              onClick={() => setShowDraftBanner(false)}
              className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex border-b border-border">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 flex flex-col items-center relative">
            <div
              className={cn(
                "w-full h-1 transition-colors duration-300",
                s <= step ? "bg-accent" : "bg-muted"
              )}
            />
            <div className="py-3 px-2 text-center">
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.2em] font-medium transition-colors",
                  s <= step ? "text-accent" : "text-muted-foreground"
                )}
              >
                {s === 1 ? "Service" : s === 2 ? "Contact" : s === 3 ? "Details" : "Review"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {/* Auto-save indicator */}
        {lastSaved && !submitted && (
          <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
            <Save className="h-3 w-3" />
            <span>Draft auto-saved — you can close and resume anytime</span>
          </div>
        )}
        {/* Step 1: Service selection */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-foreground mb-1">What are you interested in?</h3>
              <p className="text-sm text-muted-foreground">Select one or more services below.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {SERVICE_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium border transition-all text-left",
                    selectedServices.includes(s.id)
                      ? "bg-accent/10 border-accent text-foreground ring-1 ring-accent/30"
                      : "bg-background border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.services && <p className="text-destructive text-xs">{errors.services}</p>}

            {/* Preferred service qualifier */}
            {selectedServices.length > 1 && (
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">
                  Primary Interest
                </label>
                <p className="text-xs text-muted-foreground mb-2">Which service is your top priority?</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((id) => {
                    const label = SERVICE_OPTIONS.find((s) => s.id === id)?.label || id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPreferredService(id)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                          preferredService === id
                            ? "bg-accent/10 border-accent text-foreground ring-1 ring-accent/30"
                            : "bg-background border-border text-muted-foreground hover:border-accent/40"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Contact details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-foreground mb-1">Your Contact Details</h3>
              <p className="text-sm text-muted-foreground">So we can get back to you quickly.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Name *
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" maxLength={100} />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email *
                </label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={255} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Phone (optional)
                </label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" maxLength={30} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Experience & message */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-foreground mb-1">Tell Us More</h3>
              <p className="text-sm text-muted-foreground">Help us prepare for your consultation.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">
                  Experience Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperience(lvl.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        experience === lvl.id
                          ? "bg-accent/10 border-accent text-foreground ring-1 ring-accent/30"
                          : "bg-background border-border text-muted-foreground hover:border-accent/40"
                      )}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">
                  Budget Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        budget === b.id
                          ? "bg-accent/10 border-accent text-foreground ring-1 ring-accent/30"
                          : "bg-background border-border text-muted-foreground hover:border-accent/40"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe your project, goals, or any questions…"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Checkout-style review */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-foreground mb-1">Review Your Quote Request</h3>
              <p className="text-sm text-muted-foreground">Confirm everything looks right, then submit.</p>
            </div>

            {/* Services summary */}
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Services</span>
                <button onClick={() => setStep(1)} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {serviceLabels.map((label) => (
                  <span key={label} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact summary */}
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Contact</span>
                <button onClick={() => setStep(2)} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-foreground">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-foreground">{email}</span>
                </div>
                {phone.trim() && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-foreground">{phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details summary */}
            {(experienceLabel || budgetLabel || message.trim()) && (
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Details</span>
                  <button onClick={() => setStep(3)} className="text-xs text-accent hover:underline flex items-center gap-1">
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  {experienceLabel && (
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-muted-foreground">Experience:</span> {experienceLabel}
                    </div>
                  )}
                  {budgetLabel && (
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-muted-foreground">Budget:</span> {budgetLabel}
                    </div>
                  )}
                  {message.trim() && (
                    <p className="text-foreground/80 leading-relaxed line-clamp-3">{message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Trust signal */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              No obligation — we'll prepare a custom estimate and reach out within 1–2 business days.
            </div>

            {/* Dual CTA: Submit + Book Consultation */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
                ) : (
                  <>Submit Quote Request <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleBookConsultation}
                disabled={submitting}
                className="border-accent/30 text-accent hover:bg-accent/10 w-full"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book a Consultation
              </Button>
            </div>
          </div>
        )}

        {/* Navigation (steps 1-3) */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            <Button onClick={nextStep} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Back button for step 4 */}
        {step === 4 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
