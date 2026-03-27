import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useIntake } from "@/hooks/useIntake";
import { supabase } from "@/integrations/supabase/client";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { cn } from "@/lib/utils";
import { z } from "zod";

/* ── Step data ── */
const INTENT_OPTIONS = [
  { id: "performance", label: "Performance Arena" },
  { id: "reining", label: "Reining Setup" },
  { id: "estate", label: "Full Estate" },
  { id: "unsure", label: "Not sure yet" },
];

const LAND_OPTIONS = [
  { id: "flat", label: "Flat" },
  { id: "gentle", label: "Gentle Slope" },
  { id: "complex", label: "Complex Terrain" },
  { id: "unsure", label: "Not sure" },
];

const STAGE_OPTIONS = [
  { id: "exploring", label: "Exploring Ideas" },
  { id: "planning", label: "Planning" },
  { id: "ready", label: "Ready to Build" },
];

const VALUES_OPTIONS = [
  { id: "performance", label: "Long-term Performance" },
  { id: "finish", label: "Visual Finish" },
  { id: "cost", label: "Cost Efficiency" },
  { id: "balanced", label: "Balanced Approach" },
];

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30).optional(),
  location: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/* ── Tile selector ── */
function OptionTile({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-6 py-5 border transition-all duration-500 cursor-pointer",
        "font-serif text-sm tracking-wide",
        selected
          ? "border-accent/40 bg-accent/[0.06] text-foreground"
          : "border-border/20 bg-transparent text-foreground/40 hover:border-accent/20 hover:text-foreground/60"
      )}
    >
      {label}
    </button>
  );
}

/* ── Step wrapper with fade transition ── */
function StepWrapper({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-10"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 400ms cubic-bezier(0.45, 0, 0.15, 1), transform 400ms cubic-bezier(0.45, 0, 0.15, 1)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

/* ── Main overlay ── */
export function GuidedIntake() {
  const { isOpen, close } = useIntake();
  const [step, setStep] = useState(-1); // -1 = qualification gate
  const [gateReady, setGateReady] = useState(false);
  const [intent, setIntent] = useState("");
  const [land, setLand] = useState("");
  const [stage, setStage] = useState("");
  const [values, setValues] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* Reset on close */
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(-1);
        setGateReady(false);
        setIntent("");
        setLand("");
        setStage("");
        setValues("");
        setName("");
        setEmail("");
        setPhone("");
        setLocation("");
        setNotes("");
        setErrors({});
        setSubmitted(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // 1.5s pause before interaction is enabled on the gate
      const t = setTimeout(() => setGateReady(true), 1500);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const advance = useCallback((selection: string, setter: (v: string) => void) => {
    setter(selection);
    setTimeout(() => setStep((s) => s + 1), 300);
  }, []);

  const handleSubmit = async () => {
    const result = detailsSchema.safeParse({ name, email, phone, location, notes });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const services: string[] = [];
      if (intent === "performance") services.push("Arena Construction");
      else if (intent === "reining") services.push("Arena Construction");
      else if (intent === "estate") services.push("Full Property Infrastructure");
      else services.push("Design & Site Planning");

      await supabase.from("inquiries").insert({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        services,
        project_details: [
          `Intent: ${intent}`,
          `Land: ${land}`,
          `Stage: ${stage}`,
          `Values: ${values}`,
          location ? `Location: ${location}` : null,
          notes ? `Notes: ${notes}` : null,
        ].filter(Boolean).join(" | "),
        status: "new",
      });

      trackCtaClick("guided_intake_submit", { intent, land, stage, values });
      setSubmitted(true);
      setStep(5);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 400ms cubic-bezier(0.45, 0, 0.15, 1)",
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/98" />

      {/* Close */}
      <button
        onClick={close}
        className="absolute top-6 right-6 sm:top-10 sm:right-10 z-10 text-foreground/20 hover:text-foreground/50 transition-colors duration-500"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Steps container */}
      <div className="relative w-full h-full max-w-lg mx-auto">
        {/* Step 0 — Intent */}
        <StepWrapper visible={step === 0 && isOpen}>
          <div className="w-full space-y-8">
            <p className="font-serif text-lg sm:text-xl text-foreground/70 tracking-tight">
              What are you looking to create?
            </p>
            <div className="space-y-3">
              {INTENT_OPTIONS.map((opt) => (
                <OptionTile
                  key={opt.id}
                  label={opt.label}
                  selected={intent === opt.id}
                  onClick={() => advance(opt.id, setIntent)}
                />
              ))}
            </div>
          </div>
        </StepWrapper>

        {/* Step 1 — Land */}
        <StepWrapper visible={step === 1}>
          <div className="w-full space-y-8">
            <div className="space-y-3">
              <p className="font-serif text-lg sm:text-xl text-foreground/70 tracking-tight">
                What is your land like?
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/30">
                We design around ground, not assumptions.
              </p>
            </div>
            <div className="space-y-3">
              {LAND_OPTIONS.map((opt) => (
                <OptionTile
                  key={opt.id}
                  label={opt.label}
                  selected={land === opt.id}
                  onClick={() => advance(opt.id, setLand)}
                />
              ))}
            </div>
          </div>
        </StepWrapper>

        {/* Step 2 — Stage */}
        <StepWrapper visible={step === 2}>
          <div className="w-full space-y-8">
            <p className="font-serif text-lg sm:text-xl text-foreground/70 tracking-tight">
              What stage are you at?
            </p>
            <div className="space-y-3">
              {STAGE_OPTIONS.map((opt) => (
                <OptionTile
                  key={opt.id}
                  label={opt.label}
                  selected={stage === opt.id}
                  onClick={() => advance(opt.id, setStage)}
                />
              ))}
            </div>
          </div>
        </StepWrapper>

        {/* Step 3 — Values */}
        <StepWrapper visible={step === 3}>
          <div className="w-full space-y-8">
            <p className="font-serif text-lg sm:text-xl text-foreground/70 tracking-tight">
              What matters most to you?
            </p>
            <div className="space-y-3">
              {VALUES_OPTIONS.map((opt) => (
                <OptionTile
                  key={opt.id}
                  label={opt.label}
                  selected={values === opt.id}
                  onClick={() => advance(opt.id, setValues)}
                />
              ))}
            </div>
          </div>
        </StepWrapper>

        {/* Step 4 — Details */}
        <StepWrapper visible={step === 4}>
          <div className="w-full space-y-6 max-w-md">
            <p className="font-serif text-lg sm:text-xl text-foreground/70 tracking-tight mb-2">
              Tell us about your project.
            </p>
            <div className="space-y-4">
              <IntakeField label="Name" value={name} onChange={setName} error={errors.name} />
              <IntakeField label="Email" value={email} onChange={setEmail} type="email" error={errors.email} />
              <IntakeField label="Phone" value={phone} onChange={setPhone} type="tel" />
              <IntakeField label="Location" value={location} onChange={setLocation} placeholder="Suburb or region" />
              <div>
                <label className="block font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/25 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="w-full bg-transparent border border-border/20 px-4 py-3 text-sm text-foreground/70 placeholder:text-foreground/15 focus:border-accent/30 focus:outline-none transition-colors duration-500 resize-none"
                  placeholder="Anything we should know"
                />
              </div>
              {errors.form && (
                <p className="text-xs text-destructive/70">{errors.form}</p>
              )}
            </div>
            <p className="font-serif text-[10px] text-foreground/15 italic text-center mt-6">
              We take on a limited number of projects each season.
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                "w-full py-4 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-500 mt-4",
                submitting
                  ? "bg-accent/20 text-accent-foreground/30 cursor-wait"
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </StepWrapper>

        {/* Step 5 — Confirmation */}
        <StepWrapper visible={step === 5}>
          <div className="w-full text-center space-y-6 max-w-md">
            <p className="font-serif text-xl sm:text-2xl text-foreground/70 tracking-tight">
              Your project has been received.
            </p>
            <div className="w-8 h-px bg-accent/25 mx-auto" />
            <p className="font-serif text-[13px] sm:text-sm text-foreground/30 italic leading-relaxed">
              We review each project carefully before moving forward.
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/25">
              If aligned, we'll reach out to discuss next steps.
            </p>
          </div>
        </StepWrapper>
      </div>
    </div>
  );
}

/* ── Input field ── */
function IntakeField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/25 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-transparent border px-4 py-3 text-sm text-foreground/70 placeholder:text-foreground/15 focus:outline-none transition-colors duration-500",
          error ? "border-destructive/30 focus:border-destructive/50" : "border-border/20 focus:border-accent/30"
        )}
      />
      {error && <p className="mt-1 text-[10px] text-destructive/60">{error}</p>}
    </div>
  );
}
