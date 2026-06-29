import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, MapPin, Calendar, Check } from "lucide-react";
import { format } from "date-fns";
import {
  BlueprintField,
  BronzeRule,
} from "@/components/hq/HqPrimitives";

const PROJECT_TYPES = [
  "Arena Construction",
  "Barn / Stable Build",
  "Full Facility",
  "Fencing & Infrastructure",
  "Round Pen",
  "Renovation",
  "LumenArc Recovery System",
  "Other",
];

interface AvailableSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
}

// ───────────────────────────────────────────────────────────
// Editorial form primitives — bronze, mono, serif. No shadcn cards.
// ───────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block font-mono text-[9px] uppercase tracking-[0.32em] text-accent/65 mb-2">
      {children}
      {required && <span className="text-accent/45 ml-1">*</span>}
    </label>
  );
}

const fieldClass =
  "w-full bg-transparent border-0 border-b border-border/35 px-0 py-2.5 text-[14px] font-light text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/70 transition-colors";

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Brief" },
    { n: 2, label: "Time" },
    { n: 3, label: "Confirmed" },
  ];
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-1.5 h-1.5 rotate-45 border ${
                  done || active ? "border-accent bg-accent/70" : "border-border/40"
                }`}
                aria-hidden
              />
              <span
                className={`font-mono text-[9.5px] uppercase tracking-[0.32em] ${
                  active
                    ? "text-accent/85"
                    : done
                      ? "text-foreground/55"
                      : "text-muted-foreground/40"
                }`}
              >
                <span className="text-accent/55 mr-2">0{s.n}</span>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span aria-hidden className="w-6 sm:w-10 h-px bg-border/35" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SiteAssessment() {
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectNotes, setProjectNotes] = useState("");

  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  useEffect(() => {
    document.title = "Apply to Build | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Book a paid site assessment with Peninsula Equine. We walk your land, confirm feasibility, and produce a build-ready plan for your arena, stables or full facility."
    );
    return () => {
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  useEffect(() => {
    if (step === 2) fetchSlots();
  }, [step]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    const { data } = await supabase
      .from("assessment_availability")
      .select("id, slot_date, start_time, end_time")
      .eq("is_blocked", false)
      .gte("slot_date", new Date().toISOString().split("T")[0])
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(30);
    setSlots((data as AvailableSlot[]) || []);
    setLoadingSlots(false);
  };

  const canProceedStep1 = name.trim() && email.trim() && location.trim() && projectType;

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    const { error } = await supabase.from("site_assessments").insert({
      client_name: name.trim(),
      client_email: email.trim(),
      client_phone: phone.trim() || null,
      location: location.trim(),
      project_type: projectType,
      project_notes: projectNotes.trim() || null,
      slot_id: selectedSlot.id,
      slot_date: selectedSlot.slot_date,
      slot_time: selectedSlot.start_time,
      status: "confirmed",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Booking failed. Please try again.");
      return;
    }
    setStep(3);
  };

  const slotsByDate = slots.reduce<Record<string, AvailableSlot[]>>((acc, s) => {
    (acc[s.slot_date] = acc[s.slot_date] || []).push(s);
    return acc;
  }, {});

  return (
    <Layout>
      {/* ── Editorial hero ─────────────────────────────────── */}
      <header className="relative pt-28 sm:pt-36 pb-10 sm:pb-14 border-b border-border/10">
        <BlueprintField intensity="soft">
          <div className="max-w-3xl mx-auto px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-accent/70 mb-6">
              Apply to Build · Peninsula Equine
            </p>
            <h1 className="font-serif font-light tracking-tight leading-[0.98] text-foreground text-[clamp(2rem,1.4rem+2.6vw,3.6rem)]">
              The first conversation begins
              <br className="hidden sm:block" /> with the ground.
            </h1>
            <div className="mt-8 max-w-xl space-y-4 text-[14px] sm:text-[15px] font-light leading-[1.85] text-foreground/65">
              <p>
                Every Peninsula Equine project starts with a site assessment — a structured visit
                that reads terrain, access, drainage and intent before a single line is drawn.
              </p>
              <p className="text-muted-foreground/55 text-[13px]">
                Assessment fees apply and are credited toward your project if you proceed.
              </p>
            </div>
            <div className="mt-10">
              <BronzeRule label="Begin brief" />
            </div>
          </div>
        </BlueprintField>
      </header>

      {/* ── Form panel ─────────────────────────────────────── */}
      <section className="bg-background py-12 sm:py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 sm:mb-14">
            <StepIndicator step={step} />
          </div>

          {/* Architectural frame around the active step */}
          <div className="relative border border-border/15 bg-background overflow-hidden">
            {/* Top blueprint band */}
            <BlueprintField intensity="soft" className="border-b border-border/10">
              <div className="px-6 sm:px-10 py-5 flex items-center gap-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/65">
                  0{step} · {step === 1 ? "Brief" : step === 2 ? "Schedule" : "Confirmed"}
                </span>
                <div className="w-6 h-px bg-accent/30" />
                <p className="font-serif text-base sm:text-lg font-light text-foreground/90 leading-tight">
                  {step === 1
                    ? "Project details"
                    : step === 2
                      ? "Select an assessment time"
                      : "Assessment confirmed"}
                </p>
              </div>
            </BlueprintField>

            {/* Step body */}
            <div className="px-6 sm:px-10 py-8 sm:py-10">
              {step === 1 && (
                <div className="space-y-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                    <div>
                      <FieldLabel required>Name</FieldLabel>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Email</FieldLabel>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Phone</FieldLabel>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="04xx xxx xxx"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Property location</FieldLabel>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Suburb, VIC"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Project type</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map((t) => {
                        const active = projectType === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setProjectType(t)}
                            className={`font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-2 border transition-colors ${
                              active
                                ? "border-accent/70 text-accent bg-accent/[0.06]"
                                : "border-border/30 text-foreground/65 hover:border-accent/40 hover:text-foreground"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Notes for the brief</FieldLabel>
                    <textarea
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      placeholder="Anything we should know about the site, the horses, or the intent."
                      rows={4}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!canProceedStep1}
                      className="group inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-accent/85 hover:text-accent disabled:text-muted-foreground/35 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>Continue to schedule</span>
                      <span
                        aria-hidden
                        className="h-px w-10 bg-accent/55 group-hover:w-16 group-disabled:bg-muted-foreground/30 transition-all"
                      />
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  {loadingSlots ? (
                    <p className="text-center py-10 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/50">
                      Loading available windows…
                    </p>
                  ) : Object.keys(slotsByDate).length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <Calendar className="h-6 w-6 text-accent/40 mx-auto" />
                      <p className="font-serif text-base text-foreground/80">
                        No windows are open in the current cycle.
                      </p>
                      <p className="text-[13px] text-muted-foreground/60 max-w-sm mx-auto">
                        Email{" "}
                        <a
                          href="mailto:info@peninsulaequine.systems?subject=Site%20assessment%20request"
                          className="text-accent/85 underline underline-offset-4 hover:text-accent"
                        >
                          info@peninsulaequine.systems
                        </a>{" "}
                        and we will open a slot directly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-7 max-h-[440px] overflow-y-auto pr-1">
                      {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                        <div key={date}>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-accent/70">
                              {format(new Date(date + "T00:00:00"), "EEEE · d MMM")}
                            </span>
                            <span className="flex-1 h-px bg-border/25" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {dateSlots.map((slot) => {
                              const active = selectedSlot?.id === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`font-mono text-[11px] tracking-[0.12em] px-3 py-3 border text-center transition-colors ${
                                    active
                                      ? "border-accent text-accent bg-accent/[0.07]"
                                      : "border-border/25 text-foreground/75 hover:border-accent/45"
                                  }`}
                                >
                                  {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="group inline-flex items-center justify-center sm:justify-start gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/55 hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to brief</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedSlot || submitting}
                      className="group inline-flex items-center justify-center sm:justify-end gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-accent/85 hover:text-accent disabled:text-muted-foreground/35 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>{submitting ? "Confirming…" : "Confirm assessment"}</span>
                      <span
                        aria-hidden
                        className="h-px w-10 bg-accent/55 group-hover:w-16 group-disabled:bg-muted-foreground/30 transition-all"
                      />
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && selectedSlot && (
                <div className="py-8 sm:py-10 text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 border border-accent/40 rotate-45">
                    <Check className="h-4 w-4 -rotate-45 text-accent" />
                  </div>
                  <div className="space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-accent/70">
                      Assessment confirmed
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground/95 tracking-tight">
                      The ground reads first.
                    </h2>
                  </div>
                  <div className="space-y-2 text-[14px] font-light text-foreground/70">
                    <p className="flex items-center justify-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-accent/60" />
                      {format(new Date(selectedSlot.slot_date + "T00:00:00"), "EEEE, d MMMM")}
                      {" · "}
                      {selectedSlot.start_time.slice(0, 5)}
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-accent/60" />
                      {location}
                    </p>
                  </div>
                  <p className="text-[13px] text-muted-foreground/60 max-w-md mx-auto leading-[1.8] pt-2">
                    A written confirmation will reach{" "}
                    <span className="text-foreground/80">{email}</span>. Ciro will attend in person to
                    read terrain, access and the practical constraints that shape the brief.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* What to expect — quiet footer */}
          {step === 1 && (
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8">
              {[
                {
                  idx: "01",
                  title: "Read the ground",
                  body: "Terrain, drainage, access and orientation surveyed in person.",
                },
                {
                  idx: "02",
                  title: "Shape the brief",
                  body: "What the property is for. What the horses need. What the build must resolve.",
                },
                {
                  idx: "03",
                  title: "Return a plan",
                  body: "A written response with scope, sequencing and an honest budget envelope.",
                },
              ].map((s) => (
                <div key={s.idx} className="space-y-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-accent/65">
                    {s.idx}
                  </p>
                  <p className="font-serif text-base font-light text-foreground/90">{s.title}</p>
                  <p className="text-[13px] font-light leading-[1.75] text-muted-foreground/65">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
