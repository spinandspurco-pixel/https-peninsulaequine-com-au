import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, User, Mail, Phone, MessageSquare } from "lucide-react";
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
  { id: "riding-lessons", label: "Riding Lessons" },
  { id: "renovations", label: "Renovations & Repairs" },
  { id: "general-inquiry", label: "General Inquiry" },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "professional", label: "Professional" },
];

const BUDGET_RANGES = [
  { id: "under-5k", label: "Under $5k" },
  { id: "5k-15k", label: "$5k – $15k" },
  { id: "15k-50k", label: "$15k – $50k" },
  { id: "50k-100k", label: "$50k – $100k" },
  { id: "100k-plus", label: "$100k+" },
  { id: "not-sure", label: "Not Sure Yet" },
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().max(30).optional(),
});

const TOTAL_STEPS = 3;

interface MultiStepInquiryFormProps {
  className?: string;
}

export function MultiStepInquiryForm({ className }: MultiStepInquiryFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

      setSubmitted(true);
      toast({ title: "Inquiry sent!", description: "We'll be in touch within 1–2 business days." });
      navigate("/thank-you");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={cn("rounded-2xl border border-border bg-card p-8 sm:p-12 text-center", className)}>
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">Thank You!</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your inquiry has been received. We'll get back to you within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      {/* Progress bar */}
      <div className="flex border-b border-border">
        {[1, 2, 3].map((s) => (
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
                {s === 1 ? "Service" : s === 2 ? "Contact" : "Details"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-8">
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

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
          {step > 1 ? (
            <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <Button onClick={nextStep} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Submit Inquiry <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
