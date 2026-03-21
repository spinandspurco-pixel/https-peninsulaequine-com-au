import { FileText } from "lucide-react";
import type { ProjectSetup } from "@/pages/GroundLockOnboarding";

interface Props {
  project: ProjectSetup;
}

export function SummaryStep({ project }: Props) {
  const zones = project.system_zones?.length ? project.system_zones : ["No zones specified yet"];

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center flex flex-col items-center gap-4">
        <FileText className="w-8 h-8 text-accent/40" strokeWidth={1.25} />
        <h2 className="text-lg font-serif text-foreground/80">System Summary</h2>
        <p className="text-sm text-muted-foreground/40 leading-[1.9] max-w-sm mx-auto">
          Your project has been reviewed. Below is the system specification overview.
        </p>
      </div>

      {/* Project Overview */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent/60">Project Overview</h3>
        <div className="border border-border/20 rounded-sm p-4 bg-card/50 space-y-3">
          <Row label="Location" value={project.project_location} />
          <Row label="Use" value={project.primary_use} />
          <Row label="Traffic" value={project.traffic_level} />
          {project.estimated_area && <Row label="Area" value={project.estimated_area} />}
        </div>
      </div>

      {/* System Application Zones */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent/60">System Application Zones</h3>
        <ul className="space-y-2">
          {zones.map((zone) => (
            <li key={zone} className="flex items-center gap-3 py-2 px-3 bg-card/50 border border-border/20 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/30 shrink-0" />
              <span className="text-xs text-foreground/60">{zone}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* System Summary */}
      {project.system_summary && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent/60">System Recommendation</h3>
          <p className="text-sm text-muted-foreground/40 leading-[1.9] bg-card/50 border border-border/20 rounded-sm p-4">
            {project.system_summary}
          </p>
        </div>
      )}

      {/* Key Notes */}
      {project.key_notes && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent/60">Key Notes</h3>
          <p className="text-sm text-muted-foreground/40 leading-[1.9] bg-card/50 border border-border/20 rounded-sm p-4">
            {project.key_notes}
          </p>
        </div>
      )}

      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/20 text-center">
        Proceed with installation based on this specification.
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
