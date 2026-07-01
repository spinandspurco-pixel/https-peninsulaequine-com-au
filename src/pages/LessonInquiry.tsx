import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePageMeta } from "@/lib/usePageMeta";
import { useSpamGuard } from "@/lib/spamGuard";
import { HoneypotField } from "@/components/HoneypotField";

// ── Schema ────────────────────────────────────────────

const inquiryTypeEnum = z.enum(["lesson", "consult"]);
const levelEnum = z.enum(["foundation", "development", "performance", "professional"]);
const contactEnum = z.enum(["email", "phone", "either"]);
const timingEnum = z.enum(["this_week", "next_2_weeks", "this_month", "flexible"]);

const step1Schema = z.object({
  inquiry_type: inquiryTypeEnum,
  level: levelEnum,
});

const step2Schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(40, "Phone is too long")
    .regex(/^[0-9 +()\-]{6,}$/i, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  preferred_contact: contactEnum,
});

const step3Schema = z.object({
  horse_name: z.string().trim().max(80).optional().or(z.literal("")),
  horse_breed: z.string().trim().max(80).optional().or(z.literal("")),
  goals: z
    .string()
    .trim()
    .min(20, "Give us at least a sentence about what you'd like to work on")
    .max(1200, "Please keep this under 1200 characters"),
});

const step4Schema = z.object({
  timing: timingEnum,
  notes: z.string().trim().max(600, "Please keep notes under 600 characters").optional().or(z.literal("")),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);
type FormState = z.infer<typeof fullSchema>;

const DEFAULTS: FormState = {
  inquiry_type: "lesson",
  level: "foundation",
  name: "",
  email: "",
  phone: "",
  preferred_contact: "email",
  horse_name: "",
  horse_breed: "",
  goals: "",
  timing: "flexible",
  notes: "",
};

const STEPS = ["Focus", "Contact", "Horse & goals", "Timing"] as const;

// ── Component ─────────────────────────────────────────

export type InquiryPageProps = {
  lockedType?: "lesson" | "consult";
  metaTitle?: string;
  metaDescription?: string;
  headerOverline?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  backLink?: { to: string; label: string };
  requireAttachments?: boolean;
};

export default function LessonInquiry({
  lockedType,
  metaTitle = "Lesson & consult inquiry — Peninsula Equine",
  metaDescription = "Request a riding lesson or horsemanship consult on the Mornington Peninsula. Guided intake with confirmation.",
  headerOverline,
  headerTitle = "Request a lesson or consult",
  headerSubtitle = "A short guided intake. Under two minutes.",
  backLink = { to: "/lessons", label: "Back to lessons" },
  requireAttachments = false,
}: InquiryPageProps = {}) {
  usePageMeta({ title: metaTitle, description: metaDescription });

  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>({
    ...DEFAULTS,
    inquiry_type: lockedType ?? DEFAULTS.inquiry_type,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const spamGuard = useSpamGuard();

  const MAX_FILES = 5;
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB per file
  const ALLOWED = /\.(jpe?g|png|webp|heic|pdf|doc|docx)$/i;

  const addFiles = (incoming: FileList | File[]) => {
    setFileError(null);
    const list = Array.from(incoming);
    const merged = [...files];
    for (const f of list) {
      if (merged.length >= MAX_FILES) {
        setFileError(`Up to ${MAX_FILES} files.`);
        break;
      }
      if (!ALLOWED.test(f.name)) {
        setFileError(`${f.name}: unsupported file type.`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        setFileError(`${f.name}: exceeds 10 MB.`);
        continue;
      }
      if (f.size === 0) {
        setFileError(`${f.name}: empty file.`);
        continue;
      }
      if (!merged.some((m) => m.name === f.name && m.size === f.size)) merged.push(f);
    }
    setFiles(merged);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const validateStep = (index: number): boolean => {
    const schema = [step1Schema, step2Schema, step3Schema, step4Schema][index];
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }
    const flat = result.error.flatten().fieldErrors;
    const next: Partial<Record<keyof FormState, string>> = {};
    for (const [k, v] of Object.entries(flat)) {
      if (v?.[0]) next[k as keyof FormState] = v[0];
    }
    setErrors(next);
    return false;
  };

  const goNext = () => {
    if (!validateStep(step)) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep(step)) return;
    const parsed = fullSchema.safeParse(data);
    if (!parsed.success) {
      toast.error("Please review the form for errors");
      return;
    }
    // Flip to true (or pass via props) when attachments must be included.
    const REQUIRE_ATTACHMENTS = false;
    if (REQUIRE_ATTACHMENTS && files.length === 0) {
      setFileError("Please attach at least one file before submitting.");
      toast.error("Please attach at least one file before submitting.");
      return;
    }
    setFileError(null);
    // Silent spam short-circuit — mimic success without writing to DB.
    const guardResult = spamGuard.check();
    if (!guardResult.ok) {
      setConfirmation({ id: "spam-suppressed" });
      return;
    }
    setSubmitting(true);
    try {
      // Upload attachments via the server-side validated edge function
      // (enforces size, MIME/extension, and magic-byte checks).
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

      const services: string[] =
        parsed.data.inquiry_type === "lesson" ? ["riding-lessons"] : ["consultation"];
      const { data: inserted, error } = await supabase
        .from("inquiries")
        .insert({
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          preferred_contact: parsed.data.preferred_contact,
          services,
          preferred_service: parsed.data.inquiry_type,
          experience_level: parsed.data.level,
          horse_name: parsed.data.horse_name || null,
          horse_breed: parsed.data.horse_breed || null,
          project_vision: parsed.data.goals,
          project_details: parsed.data.notes || null,
          preferred_start: parsed.data.timing,
          attachment_urls,
          attachments: attachments as unknown as never,
          status: "new",
        })
        .select("id")
        .single();

      if (error) throw error;
      if (attachment_ids.length) {
        const { linkAttachmentsToInquiry } = await import("@/lib/uploadInquiryAttachment");
        await linkAttachmentsToInquiry(attachment_ids, inserted.id).catch(() => {});
      }
      setConfirmation({ id: inserted.id });
      // Fire-and-forget: internal alert to team + client acknowledgement email.
      // Requires full name/email/services so the notification function can
      // render both messages (it validates required fields server-side).
      const inquiryLabel =
        parsed.data.inquiry_type === "lesson" ? "Lesson request" : "Consult request";
      supabase.functions
        .invoke("send-inquiry-notification", {
          body: {
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone || undefined,
            services,
            experienceLevel: parsed.data.level,
            horseName: parsed.data.horse_name || undefined,
            horseBreed: parsed.data.horse_breed || undefined,
            goals: parsed.data.goals || inquiryLabel,
            preferredDate: parsed.data.timing || undefined,
            additionalNotes: parsed.data.notes || undefined,
            attachmentCount: attachment_urls.length,
            source: `lesson-inquiry:${parsed.data.inquiry_type}`,
          },
        })
        .catch(() => {});
      supabase.functions
        .invoke("send-welcome-series", {
          body: {
            email: parsed.data.email,
            name: parsed.data.name,
            source: `lesson-inquiry:${parsed.data.inquiry_type}`,
          },
        })
        .catch(() => {});
    } catch (err) {
      console.error(err);
      const { UploadValidationError } = await import("@/lib/uploadInquiryAttachment");
      if (err instanceof UploadValidationError) {
        setFileError(err.message);
        toast.error(err.message);
      } else {
        toast.error("Submission failed. Please try again or email us directly.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation ──
  if (confirmation) {
    return (
      <Layout>
        <PageHeader
          overline="Received"
          title="Your inquiry is with us"
          subtitle="A member of the team will be in touch within one business day."
        />
        <section className="max-w-2xl mx-auto px-6 py-16">
          <div className="border-l border-foreground/10 pl-6 space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-foreground/50">
              Reference · {confirmation.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="font-serif text-2xl leading-snug text-foreground/85">
              {data.inquiry_type === "lesson" ? "Lesson request" : "Consult request"} — {" "}
              <span className="text-foreground/60">{data.name}</span>
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-lg">
              We'll confirm timing via {data.preferred_contact === "phone" ? "phone" : "email"} shortly.
              If you'd like to add site photos or paperwork, reply to our confirmation with attachments.
            </p>
            <div className="flex gap-6 pt-4 text-xs uppercase tracking-[0.3em]">
              <Link to={backLink.to} className="text-foreground/70 hover:text-foreground border-b border-foreground/20 pb-1">
                {backLink.label}
              </Link>
              <Link to="/" className="text-foreground/70 hover:text-foreground border-b border-foreground/20 pb-1">
                Return home
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Form ──
  return (
    <Layout>
      <PageHeader
        overline={headerOverline ?? `Step ${step + 1} of ${STEPS.length}`}
        title={headerTitle}
        subtitle={headerSubtitle}
      />
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <Stepper current={step} />

        <form
          className="mt-12 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < STEPS.length - 1) goNext();
            else submit();
          }}
        >
          <HoneypotField guard={spamGuard} />
          {step === 0 && <StepFocus data={data} set={set} errors={errors} lockedType={lockedType} />}


          {step === 1 && <StepContact data={data} set={set} errors={errors} />}
          {step === 2 && <StepGoals data={data} set={set} errors={errors} />}
          {step === 3 && (
            <StepTiming
              data={data}
              set={set}
              errors={errors}
              files={files}
              fileError={fileError}
              onAddFiles={addFiles}
              onRemoveFile={removeFile}
              maxFiles={MAX_FILES}
            />
          )}

          <div className="flex items-center justify-between pt-6 border-t border-foreground/10">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || submitting}
              className="text-xs uppercase tracking-[0.3em] text-foreground/60 hover:text-foreground disabled:opacity-30"
            >
              ← Back
            </button>
            <Button type="submit" disabled={submitting} variant="default">
              {step === STEPS.length - 1
                ? submitting
                  ? "Sending…"
                  : "Submit inquiry"
                : "Continue →"}
            </Button>
          </div>
        </form>
      </section>
    </Layout>
  );
}

// ── Stepper ───────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex gap-4">
      {STEPS.map((label, i) => (
        <li key={label} className="flex-1">
          <div
            className={`h-px w-full transition-colors ${
              i <= current ? "bg-foreground/70" : "bg-foreground/15"
            }`}
          />
          <p
            className={`mt-2 text-[10px] uppercase tracking-[0.3em] transition-colors ${
              i === current ? "text-foreground/80" : "text-foreground/40"
            }`}
          >
            {label}
          </p>
        </li>
      ))}
    </ol>
  );
}

// ── Step content ──────────────────────────────────────

type StepProps = {
  data: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: Partial<Record<keyof FormState, string>>;
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

function StepFocus({ data, set, errors, lockedType }: StepProps & { lockedType?: "lesson" | "consult" }) {
  return (
    <div className="space-y-8">
      {!lockedType && (
        <div>
          <Label className="text-xs uppercase tracking-[0.3em] text-foreground/60">What do you need?</Label>
          <RadioGroup
            value={data.inquiry_type}
            onValueChange={(v) => set("inquiry_type", v as FormState["inquiry_type"])}
            className="mt-4 grid grid-cols-2 gap-3"
          >
            {[
              { v: "lesson", label: "Riding lesson", sub: "Weekly or one-off." },
              { v: "consult", label: "Horsemanship consult", sub: "Behaviour, groundwork, plan." },
            ].map((opt) => (
              <label
                key={opt.v}
                className={`cursor-pointer border p-4 transition-colors ${
                  data.inquiry_type === opt.v
                    ? "border-foreground/40 bg-foreground/[0.03]"
                    : "border-foreground/10 hover:border-foreground/25"
                }`}
              >
                <RadioGroupItem value={opt.v} className="sr-only" />
                <p className="font-serif text-lg">{opt.label}</p>
                <p className="text-xs text-foreground/50 mt-1">{opt.sub}</p>
              </label>
            ))}
          </RadioGroup>
          <FieldError msg={errors.inquiry_type} />
        </div>
      )}


      <div>
        <Label className="text-xs uppercase tracking-[0.3em] text-foreground/60">Rider level</Label>
        <RadioGroup
          value={data.level}
          onValueChange={(v) => set("level", v as FormState["level"])}
          className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2"
        >
          {[
            { v: "foundation", label: "Foundation" },
            { v: "development", label: "Development" },
            { v: "performance", label: "Performance" },
            { v: "professional", label: "Professional" },
          ].map((opt) => (
            <label
              key={opt.v}
              className={`cursor-pointer border px-3 py-2 text-sm text-center transition-colors ${
                data.level === opt.v
                  ? "border-foreground/40 bg-foreground/[0.03]"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
            >
              <RadioGroupItem value={opt.v} className="sr-only" />
              {opt.label}
            </label>
          ))}
        </RadioGroup>
        <FieldError msg={errors.level} />
      </div>
    </div>
  );
}

function StepContact({ data, set, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-xs uppercase tracking-[0.3em] text-foreground/60">Full name</Label>
        <Input id="name" value={data.name} onChange={(e) => set("name", e.target.value)} className="mt-2" />
        <FieldError msg={errors.name} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-foreground/60">Email</Label>
          <Input id="email" type="email" value={data.email} onChange={(e) => set("email", e.target.value)} className="mt-2" />
          <FieldError msg={errors.email} />
        </div>
        <div>
          <Label htmlFor="phone" className="text-xs uppercase tracking-[0.3em] text-foreground/60">Phone <span className="text-foreground/40 normal-case tracking-normal">(optional)</span></Label>
          <Input id="phone" value={data.phone} onChange={(e) => set("phone", e.target.value)} className="mt-2" />
          <FieldError msg={errors.phone} />
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-[0.3em] text-foreground/60">Preferred contact</Label>
        <RadioGroup
          value={data.preferred_contact}
          onValueChange={(v) => set("preferred_contact", v as FormState["preferred_contact"])}
          className="mt-3 flex gap-3"
        >
          {["email", "phone", "either"].map((v) => (
            <label
              key={v}
              className={`cursor-pointer border px-4 py-2 text-sm capitalize transition-colors ${
                data.preferred_contact === v
                  ? "border-foreground/40 bg-foreground/[0.03]"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
            >
              <RadioGroupItem value={v} className="sr-only" />
              {v}
            </label>
          ))}
        </RadioGroup>
        <FieldError msg={errors.preferred_contact} />
      </div>
    </div>
  );
}

function StepGoals({ data, set, errors }: StepProps) {
  const remaining = 1200 - data.goals.length;
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="hname" className="text-xs uppercase tracking-[0.3em] text-foreground/60">Horse name <span className="text-foreground/40 normal-case tracking-normal">(optional)</span></Label>
          <Input id="hname" value={data.horse_name} onChange={(e) => set("horse_name", e.target.value)} className="mt-2" />
          <FieldError msg={errors.horse_name} />
        </div>
        <div>
          <Label htmlFor="hbreed" className="text-xs uppercase tracking-[0.3em] text-foreground/60">Breed / type <span className="text-foreground/40 normal-case tracking-normal">(optional)</span></Label>
          <Input id="hbreed" value={data.horse_breed} onChange={(e) => set("horse_breed", e.target.value)} className="mt-2" />
          <FieldError msg={errors.horse_breed} />
        </div>
      </div>
      <div>
        <Label htmlFor="goals" className="text-xs uppercase tracking-[0.3em] text-foreground/60">What would you like to work on?</Label>
        <Textarea
          id="goals"
          value={data.goals}
          onChange={(e) => set("goals", e.target.value)}
          className="mt-2 min-h-[140px]"
          placeholder="e.g. Building confidence at canter, retraining an OTT thoroughbred, preparing for eventing."
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-destructive">{errors.goals}</span>
          <span className={remaining < 0 ? "text-destructive" : "text-foreground/40"}>
            {remaining} left
          </span>
        </div>
      </div>
    </div>
  );
}

type TimingProps = StepProps & {
  files: File[];
  fileError: string | null;
  onAddFiles: (list: FileList | File[]) => void;
  onRemoveFile: (i: number) => void;
  maxFiles: number;
};

function StepTiming({ data, set, errors, files, fileError, onAddFiles, onRemoveFile, maxFiles }: TimingProps) {
  const summary = useMemo(() => {
    return [
      `${data.inquiry_type === "lesson" ? "Lesson" : "Consult"} · ${data.level}`,
      `${data.name} · ${data.email}${data.phone ? ` · ${data.phone}` : ""}`,
      data.horse_name ? `Horse: ${data.horse_name}${data.horse_breed ? ` (${data.horse_breed})` : ""}` : null,
    ].filter(Boolean) as string[];
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-[0.3em] text-foreground/60">When would you like to start?</Label>
        <RadioGroup
          value={data.timing}
          onValueChange={(v) => set("timing", v as FormState["timing"])}
          className="mt-3 grid grid-cols-2 gap-2"
        >
          {[
            { v: "this_week", label: "This week" },
            { v: "next_2_weeks", label: "Next 2 weeks" },
            { v: "this_month", label: "This month" },
            { v: "flexible", label: "Flexible" },
          ].map((opt) => (
            <label
              key={opt.v}
              className={`cursor-pointer border px-3 py-2 text-sm text-center transition-colors ${
                data.timing === opt.v
                  ? "border-foreground/40 bg-foreground/[0.03]"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
            >
              <RadioGroupItem value={opt.v} className="sr-only" />
              {opt.label}
            </label>
          ))}
        </RadioGroup>
        <FieldError msg={errors.timing} />
      </div>

      <div>
        <Label htmlFor="notes" className="text-xs uppercase tracking-[0.3em] text-foreground/60">Anything else? <span className="text-foreground/40 normal-case tracking-normal">(optional)</span></Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="mt-2 min-h-[100px]"
          placeholder="Location constraints, injuries, scheduling notes."
        />
        <FieldError msg={errors.notes} />
      </div>

      <div>
        <Label htmlFor="attachments" className="text-xs uppercase tracking-[0.3em] text-foreground/60">
          Attachments <span className="text-foreground/40 normal-case tracking-normal">(optional)</span>
        </Label>
        <label
          htmlFor="attachments"
          className="mt-2 flex cursor-pointer flex-col items-center justify-center border border-dashed border-foreground/20 px-4 py-6 text-center transition-colors hover:border-foreground/40"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) onAddFiles(e.dataTransfer.files);
          }}
        >
          <p className="text-sm text-foreground/70">Drop files or click to upload</p>
          <p className="mt-1 text-xs text-foreground/40">
            Up to {maxFiles} · 10 MB each · JPG, PNG, WEBP, HEIC, PDF, DOC
          </p>
          <input
            id="attachments"
            type="file"
            multiple
            className="sr-only"
            accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.doc,.docx"
            onChange={(e) => {
              if (e.target.files?.length) onAddFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {fileError && <p className="mt-2 text-xs text-destructive">{fileError}</p>}
        {files.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-foreground/70">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between border-b border-foreground/10 py-1">
                <span className="truncate pr-3">
                  {f.name} <span className="text-foreground/40">· {(f.size / 1024 / 1024).toFixed(2)} MB</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(i)}
                  className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 hover:text-destructive"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>


      <div className="border-t border-foreground/10 pt-6">
        <p className="text-[10px] uppercase tracking-[0.35em] text-foreground/50">Review</p>
        <ul className="mt-3 space-y-1 text-sm text-foreground/70">
          {summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
