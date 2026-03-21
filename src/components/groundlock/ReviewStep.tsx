import { Clock } from "lucide-react";
import type { ProjectSetup } from "@/pages/GroundLockOnboarding";

interface Props {
  project: ProjectSetup;
}

export function ReviewStep({ project }: Props) {
  return (
    <div className="text-center flex flex-col items-center gap-8">
      <Clock className="w-8 h-8 text-accent/40" strokeWidth={1.25} />

      <div className="space-y-3">
        <h2 className="text-lg font-serif text-foreground/80">Under Review</h2>
        <p className="text-sm text-muted-foreground/40 leading-[1.9] max-w-sm mx-auto">
          Your project details are being reviewed. We'll prepare a system recommendation based on your site conditions and usage requirements.
        </p>
      </div>

      {/* Summary of submitted data */}
      <div className="w-full space-y-4 text-left">
        <div className="border border-border/20 rounded-sm p-4 bg-card/50 space-y-3">
          <Row label="Location" value={project.project_location} />
          <Row label="Primary Use" value={project.primary_use} />
          <Row label="Traffic" value={project.traffic_level} />
          {project.estimated_area && <Row label="Area" value={project.estimated_area} />}
        </div>
      </div>

      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/20">
        You'll be notified when the review is complete.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40 shrink-0">{label}</span>
      <span className="text-xs text-foreground/60 text-right capitalize">{value}</span>
    </div>
  );
}
