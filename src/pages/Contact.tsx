import { useState } from "react";
import { ArrowRight, CheckCircle, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { siteConfig } from "@/data/content";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { trackConversion, trackFormError } from "@/lib/analytics";
import { trackContactConversion } from "@/lib/adsConversions";
import { usePageMeta } from "@/lib/usePageMeta";
import { useSpamGuard } from "@/lib/spamGuard";
import { HoneypotField } from "@/components/HoneypotField";
import { AttachmentPreviewList } from "@/components/inquiry/AttachmentPreviewList";
import { useAttachmentUpload } from "@/hooks/useAttachmentUpload";




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
  { id: "ground-systems", label: "Ground Stabilisation" },
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
  id,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  id: string;
  testId?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono"
      >
        {label}
      </label>
      <select
        id={id}
        data-testid={testId}
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
  usePageMeta({
    title: "Contact — Peninsula Equine",
    description: "Brief a covered arena, stable precinct or full equine facility build with Peninsula Equine. Direct enquiries and site assessment requests across the Mornington Peninsula.",
    path: "/contact",
  });
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
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const spamGuard = useSpamGuard();

  const MAX_FILES = 5;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB per file
  const ALLOWED = /\.(pdf|jpe?g|png|webp|heic|dwg|dxf|doc|docx|xls|xlsx)$/i;
  // Flip to true (or wire to form state) to require attachments before submit.
  const REQUIRE_ATTACHMENTS = false;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFileError(null);
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= MAX_FILES) { setFileError(`Maximum ${MAX_FILES} files.`); break; }
      if (f.size > MAX_SIZE) { setFileError(`${f.name} exceeds 10MB.`); continue; }
      if (!ALLOWED.test(f.name)) { setFileError(`${f.name}: file type not supported.`); continue; }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      next.push(f);
    }
    setFiles(next);
    uploader.syncFiles(next);
  };
  // (moved below) uploader defined after addFiles closure to keep prior structure
  const _addFilesEnd = null;
  };

  const uploader = useAttachmentUpload();

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      uploader.syncFiles(next);
      return next;
    });
  };

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
    // Silent spam short-circuit: pretend success so bots don't retry.
    const guard = spamGuard.check();
    if (!guard.ok) {
      setSubmitted(true);
      return;
    }
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
    if (REQUIRE_ATTACHMENTS && files.length === 0) {
      setFileError("Please attach at least one file before submitting.");
      return;
    }
    setErrors({});
    setFileError(null);
    setSubmitting(true);

    try {
      // 1. Upload attachments (if any) via the server-side validated edge
      // function BEFORE creating the inquiry row.
      let attachment_urls: string[] = [];
      let attachment_ids: string[] = [];
      let attachments: import("@/lib/uploadInquiryAttachment").AttachmentRecord[] = [];
      if (files.length > 0) {
        const { uploadInquiryAttachments } = await import("@/lib/uploadInquiryAttachment");
        const result = await uploadInquiryAttachments(files);
        attachment_urls = result.paths;
        attachment_ids = result.ids;
        attachments = result.records;
      }

      const { data: submitResp, error } = await supabase.functions.invoke(
        "submit-inquiry",
        {
          body: {
            name: form.name.trim().slice(0, 100),
            email: form.email.trim().slice(0, 255),
            phone: form.phone.trim().slice(0, 30) || null,
            services: form.scopes,
            budget_range: form.budget || null,
            preferred_start: form.timeline || null,
            project_details: form.details.trim().slice(0, 2000) || null,
            attachment_urls,
            attachment_ids,
            attachments,
            notes: [
              form.propertyLocation.trim() ? `Location: ${form.propertyLocation.trim()}` : "",
              form.propertyType ? `Type: ${form.propertyType}` : "",
              form.timeline ? `Timeline: ${form.timeline}` : "",
              form.budget ? `Investment range: ${form.budget}` : "",
            ]
              .filter(Boolean)
              .join(" | "),
            source: "contact-assessment",
            hp: spamGuard.honeypotProps.value,
            elapsed_ms: spamGuard.elapsedMs(),
          },
        },
      );
      if (error || !submitResp?.ok) throw error ?? new Error(submitResp?.code ?? "persist_failed");

      if (attachment_ids.length && submitResp?.id) {
        const { linkAttachmentsToInquiry } = await import("@/lib/uploadInquiryAttachment");
        await linkAttachmentsToInquiry(attachment_ids, submitResp.id).catch(() => {});
      }

      supabase.functions
        .invoke("send-inquiry-notification", {
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            services: form.scopes,
            budgetRange: form.budget || undefined,
            goals: form.details.trim() || "Site assessment request",
            attachmentCount: attachment_urls.length,
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

      trackConversion("contact_assessment", {
        services: form.scopes,
        budget_range: form.budget || undefined,
        timeline: form.timeline || undefined,
        property_type: form.propertyType || undefined,
        property_location: form.propertyLocation.trim() || undefined,
        service_count: form.scopes.length,
      });
      trackContactConversion();
      setSubmitted(true);
      toast({
        title: "Brief received",
        description: "We'll read the details and respond within two business days.",
      });
    } catch (err) {
      const { UploadValidationError } = await import("@/lib/uploadInquiryAttachment");
      if (err instanceof UploadValidationError) {
        trackFormError("contact_assessment", `upload_${err.code}`);
        setFileError(err.message);
        toast({
          title: "Attachment rejected",
          description: err.message,
          variant: "destructive",
        });
      } else {
        trackFormError("contact_assessment", "insert_failed");
        toast({
          title: "Submission failed",
          description: "Please try again or call the office directly.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  return (
    <Layout>
      <div className="type-architectural">
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-overline text-[hsl(var(--accent-light))]/95">Begin the brief</p>
            <div className="w-8 h-px bg-accent/40" />
          </div>
          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            The first conversation starts with the ground.
          </h1>
          <p
            className="mt-8 text-[hsl(var(--footer-muted))] text-sm sm:text-base max-w-lg mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Tell us where the property sits, what needs to be built, and what the horses need from the space.
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
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--accent-light))]/95 mb-6">
                    Site Assessment
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground/90 leading-[1.25]">
                    Our process begins<br />with an on-site assessment.
                  </h2>
                </RevealOnScroll>
              </div>
              <div>
                <RevealOnScroll direction="up" delay={100}>
                  <div className="space-y-5 text-sm text-[hsl(var(--footer-muted))] leading-[1.9]">
                    <p>This allows us to properly evaluate:</p>
                    <div className="space-y-3">
                      {["Ground conditions", "Drainage pathways", "Site layout", "Long-term performance requirements"].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="w-px h-4 bg-accent/40 shrink-0" />
                          <span className="text-foreground/80 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[hsl(var(--footer-muted))] italic pt-2">
                      Assessment fees apply and are credited toward your project if you proceed.
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
              <p className="text-overline text-center mb-6">What happens next</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <div className="space-y-0">
                {[
                  { num: "01", text: "We read the terrain and listen to the intent" },
                  { num: "02", text: "A site-specific recommendation is drafted" },
                  { num: "03", text: "System, scope and sequence are defined together" },
                  { num: "04", text: "A structured brief becomes the build contract" },
                  { num: "05", text: "Ground breaks on schedule" },
                ].map((step, i) => (
                  <div key={step.num} className="flex items-center gap-5 py-4 border-b border-border/15 last:border-b-0">
                    <span className="text-[9px] font-mono tracking-[0.3em] text-[hsl(var(--accent-light))]/95 uppercase w-6 shrink-0">{step.num}</span>
                    <span className="text-sm text-foreground/80">{step.text}</span>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
            {/* removed — redundant with steps above */}
          </div>
        </div>
      </section>

      {/* ═══ FORM ════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-16 sm:py-24 relative">
          <div className="section-container max-w-2xl mx-auto">
            {submitted ? (
              <RevealOnScroll direction="up">
                <div className="text-center py-16 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="heading-section text-foreground">
                    The brief is in.
                  </h2>
                  <p className="text-muted-foreground text-sm leading-[1.8] max-w-md mx-auto">
                    We read every submission against current scope and availability.<br /><br />
                    If the fit is right, we'll be in touch within two business days.
                  </p>
                  <div className="pt-6 flex flex-col sm:flex-row gap-8 justify-center">
                    <a
                      href={`tel:${siteConfig.phone}`}
                      className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/80 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                    >
                      <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                      {siteConfig.phone}
                    </a>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/80 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                    >
                      <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                      {siteConfig.email}
                    </a>
                  </div>
                </div>
              </RevealOnScroll>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-16">
                <HoneypotField guard={spamGuard} />
                {/* Section 1 — Contact Details */}
                <RevealOnScroll direction="up">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[hsl(var(--accent-light))]/95 mb-2">
                        01
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Your Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="contact-name"
                          className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono"
                        >
                          Full Name *
                        </label>
                        <Input
                          id="contact-name"
                          data-testid="contact-name"
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="Your name"
                          maxLength={100}
                        />
                        {errors.name && (
                          <p className="text-destructive text-xs mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono"
                        >
                          Email Address *
                        </label>
                        <Input
                          id="contact-email"
                          data-testid="contact-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="name@yourdomain.com"
                          maxLength={255}
                        />
                        {errors.email && (
                          <p className="text-destructive text-xs mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono"
                        >
                          Phone Number
                        </label>
                        <Input
                          id="contact-phone"
                          data-testid="contact-phone"
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
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[hsl(var(--accent-light))]/95 mb-2">
                        02
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Property Overview
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="contact-property-location"
                          className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono"
                        >
                          <MapPin className="inline h-3 w-3 mr-1" />
                          Property Location
                        </label>
                        <Input
                          id="contact-property-location"
                          value={form.propertyLocation}
                          onChange={(e) =>
                            set("propertyLocation", e.target.value)
                          }
                          placeholder="e.g. Mornington Peninsula, VIC"
                          maxLength={200}
                        />
                      </div>
                      <SelectField
                        id="contact-property-type"
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
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[hsl(var(--accent-light))]/95 mb-2">
                        03
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Project Type
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0">
                      {PROJECT_SCOPES.map((scope) => {
                        const selected = form.scopes.includes(scope.id);
                        return (
                          <button
                            key={scope.id}
                            type="button"
                            onClick={() => toggleScope(scope.id)}
                            className={cn(
                              "group flex items-center gap-4 py-4 text-left border-b border-border/15 transition-colors duration-500",
                              selected ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground"
                            )}
                          >
                            <span
                              className={cn(
                                "h-px transition-all duration-700",
                                selected ? "w-10 bg-accent" : "w-5 bg-accent/30 group-hover:w-8 group-hover:bg-accent/60"
                              )}
                            />
                            <span className="text-[13px] tracking-[0.02em]">{scope.label}</span>
                          </button>
                        );
                      })}
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
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[hsl(var(--accent-light))]/95 mb-2">
                        04
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Project Description
                      </h3>
                    </div>
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2 block font-mono"
                      >
                        Project notes
                      </label>
                      <textarea
                        id="contact-message"
                        data-testid="contact-message"
                        value={form.details}
                        onChange={(e) => set("details", e.target.value)}
                        maxLength={2000}
                        rows={5}
                        placeholder="What the horses need from the space, any known ground conditions, and the intent behind the build."
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
                        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[hsl(var(--accent-light))]/95 mb-2">
                          05
                        </p>
                        <h3 className="font-serif text-xl font-medium text-foreground">
                          Timeline
                        </h3>
                      </div>
                      <SelectField
                        id="contact-timeline"
                        label="When does the ground need to be ready?"
                        value={form.timeline}
                        onChange={(v) => set("timeline", v)}
                        options={TIMELINES}
                        placeholder="Select timeline"
                      />

                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[hsl(var(--accent-light))]/95 mb-2">
                          06
                        </p>
                        <h3 className="font-serif text-xl font-medium text-foreground">
                          Investment Range
                        </h3>
                        <p className="text-[11px] text-[hsl(var(--footer-muted))] mt-1">Optional</p>
                      </div>
                      <SelectField
                        id="contact-budget"
                        label="Indicative investment range"
                        value={form.budget}
                        onChange={(v) => set("budget", v)}
                        options={BUDGET_RANGES}
                        placeholder="Select range"
                      />
                    </div>
                  </div>
                </RevealOnScroll>

                <div className="w-12 h-px bg-border mx-auto" />

                {/* Attachments (optional) */}
                <RevealOnScroll>
                  <div className="grid md:grid-cols-[220px_1fr] gap-8 md:gap-12">
                    <div className="md:pt-1">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[hsl(var(--footer-muted))] font-mono mb-2">
                        07
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        Attachments
                      </h3>
                      <p className="text-[11px] text-[hsl(var(--footer-muted))] mt-1">Optional</p>
                    </div>
                    <div className="space-y-3">
                      <label
                        htmlFor="contact-files"
                        className="flex flex-col items-center justify-center rounded-md border border-dashed border-input bg-background/40 px-4 py-8 text-center cursor-pointer hover:border-accent/60 transition-colors"
                      >
                        <span className="text-sm text-foreground/80">
                          Drop files or click to upload
                        </span>
                        <span className="mt-1 text-[11px] text-[hsl(var(--footer-muted))]">
                          Site plans, photos, drawings · PDF, JPG, PNG, DWG, DOCX, XLSX · max 5 files · 10MB each
                        </span>
                        <input
                          id="contact-files"
                          data-testid="contact-files"
                          type="file"
                          multiple
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.dwg,.dxf,.doc,.docx,.xls,.xlsx"
                          onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }}
                        />
                      </label>
                      {files.length > 0 && (
                        <AttachmentPreviewList files={files} onRemove={removeFile} />
                      )}
                      {fileError && (
                        <p className="text-xs text-destructive">{fileError}</p>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>

                <div className="w-12 h-px bg-border mx-auto" />


                {/* Submit */}
                <div className="text-center space-y-3">
                  <Button
                    type="submit"
                    data-testid="contact-submit"
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
                        Send the brief{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-[hsl(var(--footer-muted))] text-[10px] tracking-[0.15em] uppercase mt-4">
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
                Rather speak first?
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={100}>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/80 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  {siteConfig.phone}
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/80 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  {siteConfig.email}
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
      </div>
    </Layout>
  );
}
