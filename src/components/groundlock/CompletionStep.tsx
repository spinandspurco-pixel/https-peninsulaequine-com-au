import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, CheckCircle2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { ProjectSetup } from "@/pages/GroundLockOnboarding";

interface Props {
  project: ProjectSetup;
  onComplete: () => void;
}

export function CompletionStep({ project, onComplete }: Props) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<{ name: string; path: string }[]>([]);

  const isCompleted = !!project.completed_at;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !user) return;
    setUploading(true);
    const uploaded: { name: string; path: string }[] = [];

    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/completion-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("groundlock-attachments").upload(path, file);
      if (error) toast.error(`Failed to upload ${file.name}`);
      else uploaded.push({ name: file.name, path });
    }

    setPhotos((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  async function handleComplete() {
    if (!photos.length) {
      toast.error("Please upload at least one completion photo.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("groundlock_project_setups")
      .update({
        completion_photo_urls: [...(project.completion_photo_urls ?? []), ...photos.map((p) => p.path)],
        completed_at: new Date().toISOString(),
        workflow_step: "completion",
        status: "completed",
      })
      .eq("id", project.id);

    setSubmitting(false);

    if (error) {
      toast.error("Failed to complete. Please try again.");
    } else {
      toast.success("Project marked as complete.");
      onComplete();
    }
  }

  if (isCompleted) {
    return (
      <div className="text-center flex flex-col items-center gap-8">
        <CheckCircle2 className="w-10 h-10 text-accent/60" strokeWidth={1.25} />
        <div className="space-y-3">
          <h2 className="text-lg font-serif text-foreground/80">Project Complete</h2>
          <p className="text-sm text-muted-foreground/40 leading-[1.9] max-w-sm mx-auto">
            This GroundLock project has been completed and recorded.
          </p>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/20">
          {project.completion_photo_urls?.length ?? 0} completion photo{(project.completion_photo_urls?.length ?? 0) !== 1 ? "s" : ""} uploaded
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center flex flex-col items-center gap-4">
        <Camera className="w-8 h-8 text-accent/40" strokeWidth={1.25} />
        <h2 className="text-lg font-serif text-foreground/80">Completion Check</h2>
        <p className="text-sm text-muted-foreground/40 leading-[1.9] max-w-sm mx-auto">
          Upload photos of the completed installation to finalise this project.
        </p>
      </div>

      {/* Photo Upload */}
      <div className="space-y-3">
        <Label className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">Installation Photos</Label>
        <label className="flex items-center justify-center gap-3 py-6 border border-dashed border-border/40 rounded-sm cursor-pointer hover:border-accent/30 transition-colors bg-card/50">
          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-accent/50" /> : <Upload className="w-4 h-4 text-muted-foreground/30" strokeWidth={1.5} />}
          <span className="text-xs text-muted-foreground/40">{uploading ? "Uploading…" : "Click to upload photos"}</span>
        </label>
        {photos.length > 0 && (
          <ul className="space-y-2">
            {photos.map((photo, i) => (
              <li key={photo.path} className="flex items-center justify-between gap-3 py-2 px-3 bg-card rounded-sm border border-border/20">
                <span className="text-xs text-foreground/60 truncate">{photo.name}</span>
                <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button variant="gold" size="lg" className="w-full" disabled={submitting || !photos.length} onClick={handleComplete}>
        {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {submitting ? "Completing…" : "Mark as Complete"}
      </Button>

      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/20 text-center">
        Completion photos are stored for quality assurance records.
      </p>
    </div>
  );
}
