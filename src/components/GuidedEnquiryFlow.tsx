import { useState, useCallback } from "react";
import { DURATION, EASE } from "@/lib/motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ProjectType } from "./ProjectQualification";

/* ── Step definitions ────────────────────────────────── */
const TOTAL_STEPS = 6;

const scaleOptions = [
  { value: "under-50k", label: "Under $50K" },
  { value: "50k-150k", label: "$50K – $150K" },
  { value: "150k-500k", label: "$150K – $500K" },
  { value: "500k-plus", label: "$500K+" },
];

const timelineOptions = [
  { value: "planning", label: "Planning stage" },
  { value: "within-3-months", label: "Ready within 3 months" },
  { value: "3-12-months", label: "3–12 months" },
  { value: "long-term", label: "Long-term planning" },
];

const projectTypeLabels: Record<ProjectType, string> = {
  "full-property": "Full Property Build",
  "arena": "Arena Construction",
  "ground-systems": "Ground Systems & Access",
};

/* ── Component ───────────────────────────────────────── */
interface Props {
  projectType: ProjectType;
  onClose: () => void;
}

export function GuidedEnquiryFlow({ projectType, onClose }: Props) {
  const [step, setStep] = useState(1); // starts at 2 visually (type already selected = step 1)
  const [scale, setScale] = useState("");
  const [timeline, setTimeline] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canAdvance = useCallback(() => {
    switch (step) {
      case 1: return !!scale;
      case 2: return !!timeline;
      case 3: return location.trim().length > 2;
      case 4: return true; // notes optional
      case 5: return name.trim().length > 1 && email.includes("@") && email.includes(".");
      default: return false;
    }
  }, [step, scale, timeline, location, name, email]);

  const next = () => { if (canAdvance() && step < 5) setStep((s) => s + 1); };
  const prev = () => { if (step > 1) setStep((s) => s - 1); };

  const submit = async () => {
    if (!canAdvance()) return;
    setSubmitting(true);

    const budgetMap: Record<string, string> = {
      "under-50k": "15k-50k",
      "50k-150k": "50k-100k",
      "150k-500k": "100k-plus",
      "500k-plus": "250k-plus",
    };

    const serviceMap: Record<ProjectType, string[]> = {
      "full-property": ["full-facility"],
      "arena": ["arena-construction"],
      "ground-systems": ["infrastructure", "fencing"],
    };

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        services: serviceMap[projectType] || ["full-facility"],
        budget_range: budgetMap[scale] || null,
        preferred_start: timeline || null,
        project_details: location.trim(),
        project_vision: notes.trim() || null,
        preferred_service: projectType,
        status: "new",
      });

      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Shared transition style ────────────────────────── */
  const fadeStyle: React.CSSProperties = {
    transition: `opacity ${DURATION.fast}ms ${EASE.interactive}, transform ${DURATION.fast}ms ${EASE.interactive}`,
  };

  /* ── Submitted state ────────────────────────────────── */
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "hsl(var(--background) / 0.97)" }}>
        <div className="absolute inset-0 grain-texture pointer-events-none" />
        <div className="relative z-10 text-center max-w-md px-6">
          <div
            className="w-12 h-12 rounded-full border border-accent/20 flex items-center justify-center mx-auto mb-8"
            style={{ animation: "blueprintFade 0.6s ease-out forwards" }}
          >
            <Check size={20} className="text-accent/60" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground/90 tracking-[0.03em] mb-4">
            Your project has been received.
          </h2>
          <p className="text-sm text-muted-foreground/35 font-serif italic leading-relaxed mb-10">
            We'll review the details and respond if it aligns with our current build schedule.
          </p>
          <button
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.25em] font-mono text-accent/40 hover:text-accent/70 transition-colors duration-300 cursor-pointer bg-transparent border-0"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  /* ── Progress bar ───────────────────────────────────── */
  const progressPercent = ((step) / 5) * 100;

  /* ── Option button helper ───────────────────────────── */
  const OptionButton = ({ value, label, selected, onClick }: { value: string; label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full text-left p-4 sm:p-5 border rounded-sm cursor-pointer bg-transparent"
      style={{
        borderColor: selected ? "hsl(var(--accent) / 0.3)" : "hsl(var(--accent) / 0.08)",
        backgroundColor: selected ? "hsl(var(--accent) / 0.04)" : "transparent",
        transition: `all ${DURATION.fast}ms ${EASE.interactive}`,
      }}
    >
      <span
        className="text-sm sm:text-base font-serif"
        style={{ color: selected ? "hsl(var(--foreground) / 0.85)" : "hsl(var(--foreground) / 0.5)" }}
      >
        {label}
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "hsl(var(--background) / 0.97)" }}>
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[10px] uppercase tracking-[0.25em] font-mono text-accent/30 hover:text-accent/60 transition-colors duration-300 cursor-pointer bg-transparent border-0 z-20"
      >
        Close
      </button>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Progress */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase tracking-[0.3em] font-mono text-accent/25">
              {projectTypeLabels[projectType]}
            </p>
            <p className="text-[9px] uppercase tracking-[0.3em] font-mono text-accent/20">
              {step} / 5
            </p>
          </div>
          <div className="w-full h-px bg-accent/8 relative">
            <div
              className="absolute top-0 left-0 h-full bg-accent/25"
              style={{
                width: `${progressPercent}%`,
                transition: `width ${DURATION.fast}ms ${EASE.interactive}`,
              }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[280px] flex flex-col" style={fadeStyle}>
          {/* STEP 1: Scale */}
          {step === 1 && (
            <div key="scale">
              <h3 className="font-serif text-xl sm:text-2xl text-foreground/85 tracking-[0.02em] mb-2">
                Project Scale
              </h3>
              <p className="text-xs text-muted-foreground/30 font-serif italic mb-8">
                This helps us understand scope — not commitment.
              </p>
              <div className="space-y-3">
                {scaleOptions.map((o) => (
                  <OptionButton key={o.value} {...o} selected={scale === o.value} onClick={() => setScale(o.value)} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Timeline */}
          {step === 2 && (
            <div key="timeline">
              <h3 className="font-serif text-xl sm:text-2xl text-foreground/85 tracking-[0.02em] mb-2">
                Timeline
              </h3>
              <p className="text-xs text-muted-foreground/30 font-serif italic mb-8">
                Where are you in the process?
              </p>
              <div className="space-y-3">
                {timelineOptions.map((o) => (
                  <OptionButton key={o.value} {...o} selected={timeline === o.value} onClick={() => setTimeline(o.value)} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {step === 3 && (
            <div key="location">
              <h3 className="font-serif text-xl sm:text-2xl text-foreground/85 tracking-[0.02em] mb-2">
                Location
              </h3>
              <p className="text-xs text-muted-foreground/30 font-serif italic mb-8">
                Where is the property?
              </p>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mornington Peninsula, VIC"
                className="w-full bg-transparent border-b border-accent/12 text-sm text-foreground/70 placeholder:text-muted-foreground/20 py-3 focus:outline-none focus:border-accent/30 transition-colors duration-300 font-serif"
              />
            </div>
          )}

          {/* STEP 4: Notes */}
          {step === 4 && (
            <div key="notes">
              <h3 className="font-serif text-xl sm:text-2xl text-foreground/85 tracking-[0.02em] mb-2">
                Project Overview
              </h3>
              <p className="text-xs text-muted-foreground/30 font-serif italic mb-8">
                Tell us what you're planning.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe the build you have in mind…"
                rows={4}
                className="w-full bg-transparent border border-accent/8 rounded-sm text-sm text-foreground/70 placeholder:text-muted-foreground/20 p-4 focus:outline-none focus:border-accent/20 transition-colors duration-300 font-serif resize-none"
              />
            </div>
          )}

          {/* STEP 5: Contact */}
          {step === 5 && (
            <div key="contact">
              <h3 className="font-serif text-xl sm:text-2xl text-foreground/85 tracking-[0.02em] mb-2">
                Your Details
              </h3>
              <p className="text-xs text-muted-foreground/30 font-serif italic mb-8">
                So we can follow up personally.
              </p>
              <div className="space-y-5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-transparent border-b border-accent/12 text-sm text-foreground/70 placeholder:text-muted-foreground/20 py-3 focus:outline-none focus:border-accent/30 transition-colors duration-300 font-serif"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-transparent border-b border-accent/12 text-sm text-foreground/70 placeholder:text-muted-foreground/20 py-3 focus:outline-none focus:border-accent/30 transition-colors duration-300 font-serif"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full bg-transparent border-b border-accent/12 text-sm text-foreground/70 placeholder:text-muted-foreground/20 py-3 focus:outline-none focus:border-accent/30 transition-colors duration-300 font-serif"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-10 sm:mt-12 flex items-center justify-between">
          <button
            onClick={prev}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono cursor-pointer bg-transparent border-0"
            style={{
              color: step > 1 ? "hsl(var(--accent) / 0.4)" : "transparent",
              pointerEvents: step > 1 ? "auto" : "none",
              transition: `color ${DURATION.fast}ms ${EASE.interactive}`,
            }}
          >
            <ArrowLeft size={12} />
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={next}
              disabled={!canAdvance()}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono cursor-pointer bg-transparent border-0"
              style={{
                color: canAdvance() ? "hsl(var(--accent) / 0.7)" : "hsl(var(--accent) / 0.15)",
                transition: `color ${DURATION.fast}ms ${EASE.interactive}`,
              }}
            >
              Continue
              <ArrowRight size={12} />
            </button>
          ) : (
            <div className="text-right">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/20 mb-3">
                We review every enquiry before taking on new work.
              </p>
              <button
                onClick={submit}
                disabled={!canAdvance() || submitting}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono cursor-pointer bg-transparent border-0 ml-auto"
                style={{
                  color: canAdvance() && !submitting ? "hsl(var(--accent) / 0.7)" : "hsl(var(--accent) / 0.2)",
                  transition: `color ${DURATION.fast}ms ${EASE.interactive}`,
                }}
              >
                {submitting ? "Submitting…" : "Submit Project Enquiry"}
                {!submitting && <ArrowRight size={12} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
