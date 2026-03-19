import { useState } from "react";
import { cn } from "@/lib/utils";

const LAYERS = [
  {
    label: "Panel + Infill",
    depth: "75–100mm",
    desc: "Interlocking structure distributes load and prevents surface breakdown.",
    color: "bg-accent/10 border-accent/20",
    activeColor: "bg-accent/20 border-accent/50",
  },
  {
    label: "Bedding Layer",
    depth: "25–50mm",
    desc: "Creates a stable, level base for long-term performance.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
  },
  {
    label: "Sub-Base",
    depth: "100–150mm",
    desc: "Compacted aggregate allowing water to drain while maintaining strength.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
  },
  {
    label: "Geotextile",
    depth: "~1mm",
    desc: "Separates layers to prevent contamination and movement.",
    color: "bg-accent/8 border-accent/15",
    activeColor: "bg-accent/15 border-accent/40",
  },
  {
    label: "Subgrade",
    depth: "Native",
    desc: "Trimmed and compacted native soil — the foundation of everything above.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
  },
];

export function InteractiveLayerStack() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {LAYERS.map((layer, i) => {
        const isActive = activeIndex === i;
        return (
          <button
            key={i}
            type="button"
            className={cn(
              "w-full text-left flex items-center gap-4 p-4 border transition-all duration-500 cursor-pointer",
              isActive ? layer.activeColor : layer.color,
              isActive && "scale-[1.01] shadow-lg shadow-accent/10"
            )}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => setActiveIndex(isActive ? null : i)}
          >
            <span className="text-[10px] font-mono text-muted-foreground/50 w-20 tabular-nums shrink-0">
              {layer.depth}
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wider transition-colors duration-500",
                isActive ? "text-accent" : "text-foreground"
              )}>
                {layer.label}
              </p>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-500",
                  isActive ? "max-h-20 opacity-100 mt-1.5" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                  {layer.desc}
                </p>
              </div>
            </div>
            <div className={cn(
              "w-1 h-8 rounded-full transition-all duration-500 shrink-0",
              isActive ? "bg-accent" : "bg-border"
            )} />
          </button>
        );
      })}
    </div>
  );
}
