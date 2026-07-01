import { useState, useEffect, useCallback, useId, useMemo, useRef } from "react";
import { X, Paperclip, Trash2 } from "lucide-react";
import { useIntake } from "@/hooks/useIntake";
import { supabase } from "@/integrations/supabase/client";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { trackConversion } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useSiteChrome } from "@/hooks/useSiteChrome";
import {
  linkAttachmentsToInquiry,
  UploadValidationError,
  type AttachmentRecord,
} from "@/lib/uploadInquiryAttachment";
import { z } from "zod";
import { useSpamGuard } from "@/lib/spamGuard";
import { HoneypotField } from "@/components/HoneypotField";
import { AttachmentPreviewList } from "@/components/inquiry/AttachmentPreviewList";
import { useAttachmentUpload } from "@/hooks/useAttachmentUpload";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;


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
  const { showGuidedIntake } = useSiteChrome();
  const { isOpen, close } = useIntake();

  /* Force-close + unmount if a private route opens while modal was open */
  useEffect(() => {
    if (!showGuidedIntake && isOpen) close();
  }, [showGuidedIntake, isOpen, close]);
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
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const spamGuard = useSpamGuard();
  const attachmentFolder = useMemo(() => crypto.randomUUID(), [isOpen]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploader = useAttachmentUpload();

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
        setFiles([]);
        uploader.reset();
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

  const handleDetailsContinue = () => {
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
    setStep(5);
  };

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const next: File[] = [...files];
    const nextErrors: string[] = [];
    for (const f of arr) {
      if (next.length >= MAX_FILES) {
        nextErrors.push(`Only ${MAX_FILES} files allowed.`);
        break;
      }
      if (f.size === 0) {
        nextErrors.push(`"${f.name}" is empty.`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        nextErrors.push(`"${f.name}" exceeds 10 MB.`);
        continue;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      next.push(f);
    }
    setFiles(next);
    uploader.syncFiles(next);
    setErrors((prev) => ({
      ...prev,
      files: nextErrors.join(" ") || "",
    }));
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const nxt = prev.filter((_, i) => i !== idx);
      uploader.syncFiles(nxt);
      return nxt;
    });
  };

  const handleSubmit = async () => {
    // Re-validate details defensively in case the user navigated back.
    const result = detailsSchema.safeParse({ name, email, phone, location, notes });
    if (!result.success) {
      setStep(4);
      return;
    }
    setErrors({});
    if (uploader.isUploading) {
      setErrors({ files: "Please wait for uploads to finish before submitting." });
      return;
    }
    if (uploader.hasErrors) {
      setErrors({
        files:
          uploader.errorSummary ??
          "Some attachments failed. Retry or remove them before submitting.",
      });
      return;
    }
    // Silent spam guard: pretend success and skip the database write.
    const guard = spamGuard.check();
    if (!guard.ok) {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);

    try {
      // Slug-aligned services so trigger auto_tag_inquiry + ApplicationsInbox both match.
      const services: string[] = [];
      if (intent === "performance" || intent === "reining") services.push("arena-construction");
      else if (intent === "estate") services.push("full-facility");
      else services.push("infrastructure");

      // 1. Upload attachments first (server-side validated). If any file
      // fails, surface the friendly error and keep the user on step 5.
      let attachmentRecords: AttachmentRecord[] = [];
      let attachmentIds: string[] = [];
      let attachmentPaths: string[] = [];
      if (files.length) {
        const records = await uploader.uploadAll(files);
        attachmentRecords = records;
        attachmentIds = records.map((r) => r.id);
        attachmentPaths = records.map((r) => r.path);
      }

      // 2. Persist the inquiry row (returning id so we can link attachments).
      const { data: inserted, error: insertError } = await supabase
        .from("inquiries")
        .insert({
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
          attachment_urls: attachmentPaths,
          attachments: attachmentRecords as unknown as never,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("[GuidedIntake] insert failed", insertError);
        throw insertError ?? new Error("insert failed");
      }

      // 3. Link uploaded attachment rows to the new inquiry.
      if (attachmentIds.length) {
        await linkAttachmentsToInquiry(attachmentIds, inserted.id).catch(() => {});
      }

      // Fire admin notification email. Non-blocking.
      supabase.functions
        .invoke("send-inquiry-notification", {
          body: {
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone || undefined,
            services,
            inquiryId: inserted.id,
            attachmentIds,
            additionalNotes: [
              `Intent: ${intent}`,
              `Land: ${land}`,
              `Stage: ${stage}`,
              `Values: ${values}`,
              location ? `Location: ${location}` : null,
              notes ? `Notes: ${notes}` : null,
              attachmentPaths.length ? `Attachments: ${attachmentPaths.length}` : null,
            ].filter(Boolean).join(" | "),
          },
        })
        .catch((e) => console.warn("[GuidedIntake] notification invoke failed", e));

      trackCtaClick("guided_intake_submit", { intent, land, stage, values });
      trackConversion("guided_intake", {
        intent,
        land,
        stage,
        values,
        attachmentCount: attachmentPaths.length,
      });
      setSubmitted(true);
      setStep(6);
    } catch (err) {
      if (err instanceof UploadValidationError) {
        setErrors({ files: err.message });
        return;
      }
      const message =
        err instanceof Error && err.message
          ? `We couldn't lodge your application — ${err.message}. Please try again or email info@peninsulaequine.systems.`
          : "We couldn't lodge your application. Please try again or email info@peninsulaequine.systems.";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };


  if (!showGuidedIntake) return null;

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
      <HoneypotField guard={spamGuard} />

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
        {/* Step -1 — Qualification Gate */}
        <StepWrapper visible={step === -1 && isOpen}>
          <div className="w-full text-center space-y-8 max-w-md">
            <p className="font-serif text-xl sm:text-2xl text-foreground/70 tracking-tight leading-[1.3]">
              Not every project is the right fit.
            </p>
            <div className="w-8 h-px bg-accent/20 mx-auto" />
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/15 leading-relaxed">
              We work with a limited number of clients each season.
            </p>
            <button
              onClick={() => setStep(0)}
              disabled={!gateReady}
              className={cn(
                "mt-6 px-10 py-4 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-700",
                gateReady
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 opacity-100"
                  : "bg-accent/10 text-accent-foreground/20 cursor-default opacity-0"
              )}
            >
              Continue
            </button>
          </div>
        </StepWrapper>

        {/* Step 0 — Intent */}
        <StepWrapper visible={step === 0}>
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
              onClick={handleDetailsContinue}
              className="w-full py-4 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-500 mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continue
            </button>
          </div>
        </StepWrapper>

        {/* Step 5 — Attachments (optional) */}
        <StepWrapper visible={step === 5}>
          <div className="w-full space-y-6 max-w-md">
            <div className="space-y-2">
              <p className="font-serif text-lg sm:text-xl text-foreground/70 tracking-tight">
                Attach anything relevant.
              </p>
              <p className="font-serif text-[12px] text-foreground/35 italic leading-relaxed">
                Site photos, sketches, surveys, or briefs. Optional — up to {MAX_FILES} files, 10 MB each.
              </p>
            </div>

            <label
              htmlFor="guided-intake-files"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer?.files ?? null);
              }}
              className="block cursor-pointer border border-dashed border-border/30 hover:border-accent/40 transition-colors duration-500 px-6 py-8 text-center"
            >
              <Paperclip className="mx-auto w-4 h-4 text-foreground/30 mb-3" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                Drop files or click to browse
              </p>
              <p className="font-serif text-[11px] text-foreground/25 italic mt-2">
                PDF, images, or common office formats
              </p>
              <input
                ref={fileInputRef}
                id="guided-intake-files"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="sr-only"
                onChange={(e) => {
                  addFiles(e.target.files);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
            </label>

            <AttachmentPreviewList
              files={files}
              onRemove={removeFile}
              statuses={uploader.statuses}
              onRetry={() => uploader.uploadAll(files).catch(() => {})}
              busy={uploader.isUploading || submitting}
            />

            {errors.files && (
              <p className="text-xs text-destructive/70">{errors.files}</p>
            )}
            {errors.form && (
              <p className="text-xs text-destructive/70">{errors.form}</p>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={submitting}
                className="flex-1 py-4 text-xs uppercase tracking-[0.2em] font-medium border border-border/25 text-foreground/60 hover:text-foreground/90 transition-colors duration-500"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || uploader.isUploading || uploader.hasErrors}
                className={cn(
                  "flex-[2] py-4 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-500",
                  submitting || uploader.isUploading
                    ? "bg-accent/20 text-accent-foreground/30 cursor-wait"
                    : uploader.hasErrors
                      ? "bg-accent/10 text-accent-foreground/40 cursor-not-allowed"
                      : "bg-accent text-accent-foreground hover:bg-accent/90"
                )}
              >
                {submitting
                  ? files.length
                    ? "Uploading…"
                    : "Submitting…"
                  : uploader.isUploading
                    ? "Uploading…"
                    : uploader.hasErrors
                      ? "Fix attachments to continue"
                      : "Apply for Consideration"}
              </button>
            </div>
          </div>
        </StepWrapper>

        {/* Step 6 — Confirmation */}
        <StepWrapper visible={step === 6}>

          <div className="w-full text-center space-y-6 max-w-md">
            <p className="font-serif text-xl sm:text-2xl text-foreground/70 tracking-tight">
              Application received.
            </p>
            <div className="w-8 h-px bg-accent/25 mx-auto" />
            <p className="font-serif text-[13px] sm:text-sm text-foreground/30 italic leading-relaxed">
              We'll review your project and respond if aligned.
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
  const fieldId = useId();
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/25 mb-2"
      >
        {label}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          "w-full bg-transparent border px-4 py-3 text-sm text-foreground/70 placeholder:text-foreground/15 focus:outline-none transition-colors duration-500",
          error ? "border-destructive/30 focus:border-destructive/50" : "border-border/20 focus:border-accent/30"
        )}
      />
      {error && <p className="mt-1 text-[10px] text-destructive/60">{error}</p>}
    </div>
  );
}
