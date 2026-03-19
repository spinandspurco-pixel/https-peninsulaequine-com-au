import { useState } from "react";
import { Phone, Mail, ArrowRight, CheckCircle, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { siteConfig } from "@/data/content";
import { cn } from "@/lib/utils";
import { z } from "zod";

import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

/* ── Constants ──────────────────────────────────────── */
const PROPERTY_TYPES = [
  "Private Property",
  "Performance / Competition Facility",
  "Agistment / Commercial",
  "Other",
];

const PROJECT_SCOPES = [
  { id: "arena-construction", label: "Arena Construction" },
  { id: "stables-barn", label: "Stables / Barn" },
  { id: "ground-systems", label: "Ground Stabilisation (GroundLock™)" },
  { id: "drainage-civil", label: "Drainage / Civil Works" },
  { id: "full-infrastructure", label: "Full Property Infrastructure" },
  { id: "design-planning", label: "Design & Site Planning" },
];

const TIMELINES = [
  "Ready to start",
  "Within 3 months",
  "3–6 months",
  "Planning stage",
];

const BUDGET_RANGES = [
  "Under $25K",
  "$25K – $75K",
  "$75K – $150K",
  "$150K+",
];

const formSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30).optional(),
});

/* ── Select Component ─────────────────────────────── */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(120,120,120,0.5)' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────── */
export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    propertyLocation: "",
    propertyType: "",
    scopes: [] as string[],
    details: "",
    timeline: "",
    budget: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleScope = (id: string) =>
    setForm((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(id)
        ? prev.scopes.filter((s) => s !== id)
        : [...prev.scopes, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
    });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        newErrors[i.path[0] as string] = i.message;
      });
      setErrors(newErrors);
      return;
    }
    if (form.scopes.length === 0) {
      setErrors({ scopes: "Please select at least one." });
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: form.name.trim().slice(0, 100),
        email: form.email.trim().slice(0, 255),
        phone: form.phone.trim().slice(0, 30) || null,
        services: form.scopes,
        budget_range: form.budget || null,
        preferred_start: form.timeline || null,
        project_details: form.details.trim().slice(0, 2000) || null,
        notes: [
          form.propertyLocation.trim() ? `Location: ${form.propertyLocation.trim()}` : "",
          form.propertyType ? `Type: ${form.propertyType}` : "",
          form.timeline ? `Timeline: ${form.timeline}` : "",
          form.budget ? `Investment range: ${form.budget}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
        status: "new",
      });
      if (error) throw error;

      supabase.functions
        .invoke("send-inquiry-notification", {
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            services: form.scopes,
            budgetRange: form.budget || undefined,
            goals: form.details.trim() || "Site assessment request",
          },
        })
        .catch(() => {});

      supabase.functions
        .invoke("send-welcome-series", {
          body: {
            email: form.email.trim(),
            name: form.name.trim(),
            source: "contact-assessment",
          },
        })
        .catch(() => {});

      setSubmitted(true);
      toast({
        title: "Request received",
        description: "We'll review your enquiry and be in touch shortly.",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3] contrast-[1.1] saturate-[0.6]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/65" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%, transparent 20%, hsl(222 20% 4% / 0.7) 80%)" }}
        />
        <div className="absolute inset-0 grain-texture" />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-overline text-accent/70">Get Started</p>
            <div className="w-8 h-px bg-accent/40" />
          </div>
          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Request Site Assessment
          </h1>
          <p
            className="mt-8 text-muted-foreground/45 text-sm sm:text-base max-w-lg mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Each project is assessed individually to ensure correct<br />
            system specification and long-term performance.
          </p>
        </div>
      </section>

      {/* ═══ SITE ASSESSMENT POSITIONING ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-2xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
              <div>
                <RevealOnScroll direction="up">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/60 mb-6">
                    Site Assessment
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground/90 leading-[1.25]">
                    Our process begins<br />with an on-site assessment.
                  </h2>
                </RevealOnScroll>
              </div>
              <div>
                <RevealOnScroll direction="up" delay={100}>
                  <div className="space-y-5 text-sm text-muted-foreground/60 leading-[1.9]">
                    <p>This allows us to properly evaluate:</p>
                    <div className="space-y-3">
                      {["Ground conditions", "Drainage pathways", "Site layout", "Long-term performance requirements"].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="w-px h-4 bg-accent/40 shrink-0" />
                          <span className="text-foreground/60 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground/40 italic pt-2">
                      Assessment fees apply and are credited<br />
                      toward your project investment if you proceed.
                    </p>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT TO EXPECT ════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-12" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <p className="text-overline text-center mb-6">What to Expect</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <div className="space-y-0">
                {[
                  { num: "01", text: "Initial assessment and discussion" },
                  { num: "02", text: "Site-specific recommendations" },
                  { num: "03", text: "System and scope definition" },
                  { num: "04", text: "Structured project brief" },
                  { num: "05", text: "Project scheduling and delivery" },
                ].map((step, i) => (
                  <div key={step.num} className="flex items-center gap-5 py-4 border-b border-border/15 last:border-b-0">
                    <span className="text-[9px] font-mono tracking-[0.3em] text-accent/25 uppercase w-6 shrink-0">{step.num}</span>
                    <span className="text-sm text-foreground/60">{step.text}</span>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <p className="text-center text-[11px] text-muted-foreground/25 italic mt-8">
                Projects are carefully planned prior to commencement.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ FORM ════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-16 sm:py-24 bg-card relative">
          <div className="section-container max-w-2xl mx-auto">
            {submitted ? (
              <RevealOnScroll direction="up">
                <div className="text-center py-16 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="heading-section text-foreground">
                    Request Received
                  </h2>
                  <p className="text-muted-foreground text-sm leading-[1.8] max-w-md mx-auto">
                    We'll review your enquiry and be in touch shortly.<br /><br />
                    Each project is assessed based on scope,<br />
                    location, and current availability.
                  </p>
                  <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href={`tel:${siteConfig.phone}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-sm font-medium text-foreground hover:border-accent/30 hover:text-accent transition-all duration-500"
                    >
                      <Phone className="h-4 w-4 text-accent" />
                      {siteConfig.phone}
                    </a>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-sm font-medium text-foreground hover:border-accent/30 hover:text-accent transition-all duration-500"
                    >
                      <Mail className="h-4 w-4 text-accent" />
                      {siteConfig.email}
                    </a>
                  </div>
                </div>
              </RevealOnScroll>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-16">
                {/* Section 1 — Contact Details */}
                <RevealOnScroll direction="up">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent/50 mb-2">
                        01
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Your Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono">
                          Full Name *
                        </label>
                        <Input
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="Your full name"
                          maxLength={100}
                        />
                        {errors.name && (
                          <p className="text-destructive text-xs mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="you@example.com"
                          maxLength={255}
                        />
                        {errors.email && (
                          <p className="text-destructive text-xs mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="04XX XXX XXX"
                          maxLength={30}
                        />
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>

                <div className="w-12 h-px bg-border mx-auto" />

                {/* Section 2 — Property Details */}
                <RevealOnScroll direction="up" delay={50}>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent/50 mb-2">
                        02
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Property Overview
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          Property Location
                        </label>
                        <Input
                          value={form.propertyLocation}
                          onChange={(e) =>
                            set("propertyLocation", e.target.value)
                          }
                          placeholder="e.g. Mornington Peninsula, VIC"
                          maxLength={200}
                        />
                      </div>
                      <SelectField
                        label="Property Type"
                        value={form.propertyType}
                        onChange={(v) => set("propertyType", v)}
                        options={PROPERTY_TYPES}
                        placeholder="Select type"
                      />
                    </div>
                  </div>
                </RevealOnScroll>

                <div className="w-12 h-px bg-border mx-auto" />

                {/* Section 3 — Project Scope */}
                <RevealOnScroll direction="up" delay={100}>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent/50 mb-2">
                        03
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Project Type
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PROJECT_SCOPES.map((scope) => (
                        <button
                          key={scope.id}
                          type="button"
                          onClick={() => toggleScope(scope.id)}
                          className={cn(
                            "px-4 py-3 rounded-md text-sm font-medium border transition-all text-left",
                            form.scopes.includes(scope.id)
                              ? "bg-accent/10 border-accent text-foreground ring-1 ring-accent/30"
                              : "bg-background border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                          )}
                        >
                          {scope.label}
                        </button>
                      ))}
                    </div>
                    {errors.scopes && (
                      <p className="text-destructive text-xs">
                        {errors.scopes}
                      </p>
                    )}
                  </div>
                </RevealOnScroll>

                <div className="w-12 h-px bg-border mx-auto" />

                {/* Section 4 — Project Description */}
                <RevealOnScroll direction="up" delay={150}>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent/50 mb-2">
                        04
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Project Description
                      </h3>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono">
                        Tell us about your project
                      </label>
                      <textarea
                        value={form.details}
                        onChange={(e) => set("details", e.target.value)}
                        maxLength={2000}
                        rows={5}
                        placeholder="Describe what you're looking to build — include any known issues, goals, or requirements."
                        className={cn(inputClass, "resize-none")}
                      />
                    </div>
                  </div>
                </RevealOnScroll>

                <div className="w-12 h-px bg-border mx-auto" />

                {/* Section 5 & 6 — Timeline + Investment Range */}
                <RevealOnScroll direction="up" delay={200}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent/50 mb-2">
                          05
                        </p>
                        <h3 className="font-serif text-xl font-medium text-foreground">
                          Timeline
                        </h3>
                      </div>
                      <SelectField
                        label="When are you looking to start?"
                        value={form.timeline}
                        onChange={(v) => set("timeline", v)}
                        options={TIMELINES}
                        placeholder="Select timeline"
                      />
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent/50 mb-2">
                          06
                        </p>
                        <h3 className="font-serif text-xl font-medium text-foreground">
                          Investment Range
                        </h3>
                        <p className="text-[11px] text-muted-foreground/40 mt-1">Optional</p>
                      </div>
                      <SelectField
                        label="Approximate project investment"
                        value={form.budget}
                        onChange={(v) => set("budget", v)}
                        options={BUDGET_RANGES}
                        placeholder="Select range"
                      />
                    </div>
                  </div>
                </RevealOnScroll>

                <div className="w-12 h-px bg-border mx-auto" />

                {/* Before You Submit */}
                <RevealOnScroll direction="up" delay={250}>
                  <div className="bg-background rounded-lg border border-border p-6 sm:p-8 text-center space-y-4">
                    <h3 className="font-serif text-lg font-medium text-foreground">
                      Before You Submit
                    </h3>
                    <p className="text-sm text-muted-foreground leading-[1.8] max-w-md mx-auto">
                      We approach every project as a long-term investment —<br />
                      designed properly, built once, and specified for durability.
                    </p>
                    <p className="text-sm text-foreground/50 italic">
                      If that aligns with how you want to build,<br />
                      we look forward to hearing from you.
                    </p>
                  </div>
                </RevealOnScroll>

                {/* Submit */}
                <div className="text-center space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    variant="gold"
                    className="uppercase tracking-[0.14em] text-xs font-medium px-10"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit Assessment Request{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-muted-foreground/25 text-[10px] tracking-[0.15em] uppercase mt-4">
                    Assessment availability is limited.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══ DIRECT CONTACT ══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-16 sm:py-20 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-md mx-auto text-center relative z-[1] space-y-6">
            <RevealOnScroll direction="up">
              <p className="text-sm text-muted-foreground">
                Prefer to speak directly?
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={100}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-sm font-medium text-foreground hover:border-accent/30 hover:text-accent transition-all duration-500"
                >
                  <Phone className="h-4 w-4 text-accent" />
                  {siteConfig.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-sm font-medium text-foreground hover:border-accent/30 hover:text-accent transition-all duration-500"
                >
                  <Mail className="h-4 w-4 text-accent" />
                  {siteConfig.email}
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
