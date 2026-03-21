import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ArrowRight, Upload, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROPERTY_TYPES = [
  "Private property",
  "Training facility",
  "Commercial / agistment",
  "Other",
];

const PROJECT_TYPES = [
  "Arena",
  "Yard / paddock",
  "Stable base",
  "Full system",
];

const SIZE_OPTIONS = [
  { label: "Small", detail: "<100m²" },
  { label: "Medium", detail: "100–500m²" },
  { label: "Large", detail: "500m²+" },
];

export function GroundLockProjectForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    projectType: "",
    size: "",
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  const removeFile = (i: number) =>
    setFiles((f) => f.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setSubmitting(true);

    try {
      // Upload files if any
      const attachmentUrls: string[] = [];
      for (const file of files) {
        const path = `groundlock/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("inquiry-attachments")
          .upload(path, file);
        if (!error) attachmentUrls.push(path);
      }

      const services = [form.projectType || "groundlock"].filter(Boolean);
      const details = [
        form.propertyType && `Property: ${form.propertyType}`,
        form.size && `Size: ${form.size}`,
        form.message,
      ]
        .filter(Boolean)
        .join("\n");

      const { error } = await supabase.from("inquiries").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        services,
        project_details: details || null,
        preferred_service: "groundlock",
        attachment_urls: attachmentUrls.length ? attachmentUrls : [],
        budget_range: null,
      });

      if (error) throw error;

      // Send email notification
      supabase.functions.invoke("send-groundlock-enquiry", {
        body: {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          propertyType: form.propertyType || undefined,
          projectType: form.projectType || undefined,
          size: form.size || undefined,
          message: form.message || undefined,
          attachmentUrls: attachmentUrls.length ? attachmentUrls : undefined,
        },
      }).catch((err) => console.error("Email notification failed:", err));

      setSubmitted(true);
      toast.success("Thanks — we've received your project. We'll be in touch shortly.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-accent/20 mb-6">
          <Check className="w-5 h-5 text-accent" />
        </div>
        <h3 className="font-serif text-lg text-foreground mb-2">
          Request Received
        </h3>
        <p className="text-[13px] text-muted-foreground/50 leading-relaxed max-w-xs mx-auto">
          We'll review your details and be in touch within 48 hours to discuss your system plan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
            Name *
          </label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            className="bg-background/60 border-border/40 text-foreground placeholder:text-muted-foreground/25 text-sm h-11"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
            Email *
          </label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="your@email.com"
            className="bg-background/60 border-border/40 text-foreground placeholder:text-muted-foreground/25 text-sm h-11"
            required
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
          Phone
        </label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="Optional"
          className="bg-background/60 border-border/40 text-foreground placeholder:text-muted-foreground/25 text-sm h-11"
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
          Property Type
        </label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("propertyType", form.propertyType === t ? "" : t)}
              className={`px-4 py-2 text-[12px] font-mono tracking-wide border transition-all duration-200 ${
                form.propertyType === t
                  ? "border-accent/40 bg-accent/8 text-accent"
                  : "border-border/30 text-muted-foreground/40 hover:border-border/60 hover:text-muted-foreground/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
          Project Type
        </label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("projectType", form.projectType === t ? "" : t)}
              className={`px-4 py-2 text-[12px] font-mono tracking-wide border transition-all duration-200 ${
                form.projectType === t
                  ? "border-accent/40 bg-accent/8 text-accent"
                  : "border-border/30 text-muted-foreground/40 hover:border-border/60 hover:text-muted-foreground/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
          Approximate Size
          <span className="ml-2 text-muted-foreground/20">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => set("size", form.size === s.label ? "" : s.label)}
              className={`px-4 py-2 text-[12px] font-mono tracking-wide border transition-all duration-200 ${
                form.size === s.label
                  ? "border-accent/40 bg-accent/8 text-accent"
                  : "border-border/30 text-muted-foreground/40 hover:border-border/60 hover:text-muted-foreground/60"
              }`}
            >
              {s.label}
              <span className="ml-1.5 text-[10px] opacity-50">{s.detail}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
          Tell us about your space
        </label>
        <Textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Ground conditions, usage patterns, goals..."
          rows={3}
          className="bg-background/60 border-border/40 text-foreground placeholder:text-muted-foreground/25 text-sm resize-none"
        />
      </div>

      {/* Upload */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
          Photos or Plans
          <span className="ml-2 text-muted-foreground/20">(optional)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFiles}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-border/30 hover:border-border/50 py-4 flex items-center justify-center gap-2 text-[12px] font-mono text-muted-foreground/35 hover:text-muted-foreground/55 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload files
        </button>
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[11px] text-muted-foreground/40 px-2 py-1 bg-background/40 border border-border/20"
              >
                <span className="truncate mr-2">{f.name}</span>
                <button type="button" onClick={() => removeFile(i)}>
                  <X className="w-3 h-3 hover:text-destructive transition-colors" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Request System Plan"}
        {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>

      <p className="text-[10px] font-mono text-center text-muted-foreground/18 tracking-wide">
        We respond within 48 hours · No obligation
      </p>
    </form>
  );
}
