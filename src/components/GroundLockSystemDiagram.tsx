import { useState } from "react";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

const LAYERS = [
  {
    label: "Panel + Infill",
    depth: "75–100mm",
    summary: "Interlocking structure distributes load and prevents surface breakdown.",
    detail:
      "High-density polyethylene panels lock together to form a continuous load-bearing surface. Infill material — typically recycled rubber or aggregate — fills each cell, creating a permeable yet stable riding and working surface.",
    heightClass: "h-14 sm:h-16",
    color: "bg-accent/10 border-accent/25",
    activeColor: "bg-accent/20 border-accent/50",
    diagramFill: "bg-accent/15",
    activeDiagramFill: "bg-accent/30",
  },
  {
    label: "Bedding Layer",
    depth: "25–50mm",
    summary: "Creates a stable, level base for long-term performance.",
    detail:
      "A fine crushed-rock or coarse-sand bedding course, screeded to level, ensures full contact between the panel system and the sub-base. This prevents point-loading and eliminates rocking under traffic.",
    heightClass: "h-8 sm:h-10",
    color: "bg-muted/40 border-border/30",
    activeColor: "bg-muted/60 border-border/50",
    diagramFill: "bg-muted/30",
    activeDiagramFill: "bg-muted/60",
  },
  {
    label: "Sub-Base",
    depth: "100–150mm",
    summary: "Compacted aggregate allowing water to drain while maintaining strength.",
    detail:
      "Class-3 or Class-4 crushed rock, compacted in lifts to ≥ 95% Modified Proctor density. This structural layer carries the imposed loads and channels water laterally to perimeter drainage, preventing pooling and softening.",
    heightClass: "h-16 sm:h-20",
    color: "bg-muted/30 border-border/25",
    activeColor: "bg-muted/50 border-border/45",
    diagramFill: "bg-muted/20",
    activeDiagramFill: "bg-muted/50",
  },
  {
    label: "Geotextile",
    depth: "~1mm",
    summary: "Separates layers to prevent contamination and movement.",
    detail:
      "A non-woven geotextile membrane placed between the sub-base and the subgrade. It prevents fine soil particles from migrating upward into the aggregate, preserving drainage capacity and structural integrity over decades.",
    heightClass: "h-3 sm:h-4",
    color: "bg-accent/8 border-accent/15",
    activeColor: "bg-accent/15 border-accent/35",
    diagramFill: "bg-accent/10",
    activeDiagramFill: "bg-accent/25",
  },
  {
    label: "Subgrade",
    depth: "Native",
    summary: "Trimmed & compacted native soil — the foundation of everything above.",
    detail:
      "The existing ground is stripped of organic material, graded to a 1–2% fall for drainage, and compacted. This is the most critical layer — every millimetre of preparation here multiplies the lifespan of the entire system.",
    heightClass: "h-20 sm:h-24",
    color: "bg-primary-foreground/[0.03] border-primary-foreground/8",
    activeColor: "bg-primary-foreground/[0.06] border-primary-foreground/15",
    diagramFill: "bg-primary-foreground/[0.04]",
    activeDiagramFill: "bg-primary-foreground/[0.08]",
  },
];

export function GroundLockSystemDiagram() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeLayer = activeIndex !== null ? LAYERS[activeIndex] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      {/* LEFT — Visual Diagram */}
      <div className="space-y-3">
        <h3 className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 flex items-center gap-2 mb-4">
          <Layers className="w-3 h-3" /> System Cross-Section
        </h3>

        <div className="relative">
          {/* Depth annotation line */}
          <div className="absolute -right-6 top-0 bottom-0 hidden sm:flex flex-col items-center">
            <div className="w-px h-full bg-border/30" />
            <span className="font-mono text-[8px] text-muted-foreground/40 mt-1 whitespace-nowrap">
              total depth
            </span>
          </div>

          <div className="space-y-[2px]">
            {LAYERS.map((layer, i) => {
              const isActive = activeIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "w-full flex items-center justify-between px-4 border transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer relative overflow-hidden",
                    layer.heightClass,
                    isActive ? layer.activeColor : layer.color,
                    isActive && "shadow-[0_0_24px_-8px_hsl(var(--accent)/0.12)]",
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={() => setActiveIndex(isActive ? null : i)}
                  aria-pressed={isActive}
                >
                  {/* Subtle texture lines */}
                  {i === 2 && (
                    <div className="absolute inset-0 opacity-[0.04]">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className="absolute w-1 h-1 rounded-full bg-foreground"
                          style={{ left: `${15 + j * 14}%`, top: "50%" }}
                        />
                      ))}
                    </div>
                  )}
                  {i === 3 && (
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-accent/20" />
                    </div>
                  )}

                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-[600ms] relative z-10",
                      isActive ? "text-accent" : "text-foreground/60",
                    )}
                  >
                    {layer.label}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums relative z-10">
                    {layer.depth}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/35 italic mt-4 px-1">
          Hover or tap any layer to explore.
        </p>
      </div>

      {/* RIGHT — Text Panel */}
      <div className="relative min-h-[260px] flex flex-col justify-center">
        {/* Default state */}
        <div
          className={cn(
            "transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            activeLayer ? "opacity-0 translate-y-2 absolute inset-0 pointer-events-none" : "opacity-100 translate-y-0",
          )}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/40 mb-3">
            Engineered Ground System
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl text-foreground/90 mb-4 leading-snug">
            Five layers.<br />
            One system.
          </h3>
          <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-md">
            Every GroundLock™ installation is a fully engineered cross-section — each layer
            purpose-built to support the one above. Select a layer to understand how it works.
          </p>
        </div>

        {/* Active layer detail */}
        {LAYERS.map((layer, i) => (
          <div
            key={i}
            className={cn(
              "transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              activeIndex === i
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3 absolute inset-0 pointer-events-none",
            )}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/70 mb-3">
              Layer {i + 1} of 5
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl text-foreground/90 mb-2 leading-snug">
              {layer.label}
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground/50 mb-4 tabular-nums">
              Depth: {layer.depth}
            </p>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-md mb-4">
              {layer.summary}
            </p>
            <p className="text-xs text-muted-foreground/50 leading-relaxed max-w-md">
              {layer.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
