import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Layers, Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PRIMARY_USE_OPTIONS = [
  { value: "arena", label: "Arena" },
  { value: "access", label: "Access Routes" },
  { value: "mixed", label: "Mixed Use" },
];

const TRAFFIC_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function GroundLockSetup() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);

  const [form, setForm] = useState({
    project_location: "",
    ground_conditions: "",
    primary_use: "arena",
    traffic_level: "medium",
    estimated_area: "",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !user) return;
    setUploading(true);

    const uploaded: { name: string; path: string }[] = [];

    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("groundlock-attachments")
        .upload(path, file);

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
      } else {
        uploaded.push({ name: file.name, path });
      }
    }

    setFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!form.project_location.trim() || !form.ground_conditions.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("groundlock_project_setups").insert({
      user_id: user.id,
      project_location: form.project_location.trim(),
      ground_conditions: form.ground_conditions.trim(),
      primary_use: form.primary_use,
      traffic_level: form.traffic_level,
      estimated_area: form.estimated_area.trim() || null,
      notes: form.notes.trim() || null,
      attachment_urls: files.map((f) => f.path),
    });

    setSubmitting(false);

    if (error) {
      toast.error("Submission failed. Please try again.");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Layout>
        <section className="relative pt-44 sm:pt-52 pb-32 sm:pb-44 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-10 text-center max-w-md mx-auto flex flex-col items-center gap-8">
            <CheckCircle2 className="w-10 h-10 text-accent/60" strokeWidth={1.25} />
            <h1 className="heading-section text-foreground">Submission Received</h1>
            <p className="text-sm text-muted-foreground/45 leading-[1.9]">
              We'll review your project details and be in touch to discuss system specification and next steps.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="relative pt-44 sm:pt-52 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />

        <div className="section-container relative z-10 text-center max-w-xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-5 opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1200ms" }}>
            <div className="w-8 h-px bg-accent/30" />
            <Layers className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/60">Partner Workflow</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1 className="heading-display text-foreground opacity-0 animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1400ms" }}>
            GroundLock Project Setup
          </h1>

          <p className="text-sm text-muted-foreground/40 max-w-md mx-auto opacity-0 animate-fade-in leading-[1.9]" style={{ animationDelay: "1000ms", animationFillMode: "both", animationDuration: "1000ms" }}>
            Provide project details so we can prepare the right system specification for your build.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Project Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
                    Project Location <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Address or region"
                    value={form.project_location}
                    onChange={(e) => update("project_location", e.target.value)}
                    className="bg-background border-border/50 focus:border-accent/40"
                    required
                  />
                </div>

                {/* Ground Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="ground" className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
                    Ground Conditions <span className="text-accent">*</span>
                  </Label>
                  <Textarea
                    id="ground"
                    placeholder="Describe existing soil type, drainage behaviour, known issues…"
                    value={form.ground_conditions}
                    onChange={(e) => update("ground_conditions", e.target.value)}
                    className="bg-background border-border/50 focus:border-accent/40 min-h-[100px] resize-none"
                    required
                  />
                </div>

                {/* Primary Use & Traffic — side by side */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
                      Primary Use
                    </Label>
                    <Select value={form.primary_use} onValueChange={(v) => update("primary_use", v)}>
                      <SelectTrigger className="bg-background border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIMARY_USE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
                      Traffic Level
                    </Label>
                    <Select value={form.traffic_level} onValueChange={(v) => update("traffic_level", v)}>
                      <SelectTrigger className="bg-background border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAFFIC_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Estimated Area */}
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
                    Estimated Area
                  </Label>
                  <Input
                    id="area"
                    placeholder="e.g. 40×60m arena + 200m access"
                    value={form.estimated_area}
                    onChange={(e) => update("estimated_area", e.target.value)}
                    className="bg-background border-border/50 focus:border-accent/40"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Anything else relevant to the project…"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="bg-background border-border/50 focus:border-accent/40 min-h-[80px] resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <Label className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
                    Plans or Site Photos
                  </Label>

                  <label className="flex items-center justify-center gap-3 py-6 border border-dashed border-border/40 rounded-sm cursor-pointer hover:border-accent/30 transition-colors bg-background/50">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.dwg,.dxf"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-accent/50" />
                    ) : (
                      <Upload className="w-4 h-4 text-muted-foreground/30" strokeWidth={1.5} />
                    )}
                    <span className="text-xs text-muted-foreground/40">
                      {uploading ? "Uploading…" : "Click to upload files"}
                    </span>
                  </label>

                  {files.length > 0 && (
                    <ul className="space-y-2">
                      {files.map((file, i) => (
                        <li key={file.path} className="flex items-center justify-between gap-3 py-2 px-3 bg-background rounded-sm border border-border/20">
                          <span className="text-xs text-foreground/60 truncate">{file.name}</span>
                          <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {submitting ? "Submitting…" : "Submit Project Setup"}
                  </Button>
                </div>

                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/20 text-center pt-2">
                  Submitted details are reviewed by Peninsula Equine before system specification.
                </p>
              </form>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
