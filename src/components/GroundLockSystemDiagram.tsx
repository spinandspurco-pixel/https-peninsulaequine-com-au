import { useState } from "react";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

const LAYERS = [
  {
    label: "Panel + Infill",
    depth: "75–100 mm",
    summary: "Interlocking structure distributes load and prevents surface breakdown.",
    detail:
      "High-density polyethylene panels lock together to form a continuous load-bearing surface. Infill material — recycled rubber or aggregate — fills each cell, creating a permeable yet stable working surface.",
    heightClass: "h-[52px] sm:h-[60px]",
    idle: "bg-accent/[0.06] border-accent/15",
    active: "bg-accent/[0.14] border-accent/40",
  },
  {
    label: "Bedding Layer",
    depth: "25–50 mm",
    summary: "Creates a stable, level base for long-term performance.",
    detail:
      "Fine crushed rock or coarse sand, screeded to level. Ensures full contact between the panel system and sub-base — eliminating point-loading and rocking under traffic.",
    heightClass: "h-[32px] sm:h-[36px]",
    idle: "bg-muted/30 border-border/20",
    active: "bg-muted/50 border-border/40",
  },
  {
    label: "Sub-Base",
    depth: "100–150 mm",
    summary: "Compacted aggregate — drainage and structural strength.",
    detail:
      "Class-3 or Class-4 crushed rock, compacted to ≥ 95 % Modified Proctor density. Carries imposed loads and channels water laterally to perimeter drainage.",
    heightClass: "h-[64px] sm:h-[72px]",
    idle: "bg-muted/20 border-border/15",
    active: "bg-muted/40 border-border/35",
  },
  {
    label: "Geotextile",
    depth: "~1 mm",
    summary: "Prevents layer contamination and movement over time.",
    detail:
      "Non-woven geotextile membrane separating sub-base from subgrade. Prevents fine soil migrating upward, preserving drainage capacity and structural integrity over decades.",
    heightClass: "h-[14px] sm:h-[16px]",
    idle: "bg-accent/[0.04] border-accent/10",
    active: "bg-accent/[0.10] border-accent/30",
  },
  {
    label: "Subgrade",
    depth: "Native",
    summary: "Prepared natural ground — the foundation of everything above.",
    detail:
      "Stripped of organic material, graded to 1–2 % fall for drainage, and compacted. Every millimetre of preparation here multiplies the lifespan of the entire system.",
    heightClass: "h-[72px] sm:h-[84px]",
    idle: "bg-foreground/[0.02] border-foreground/[0.06]",
    active: "bg-foreground/[0.04] border-foreground/[0.12]",
  },
];

export function GroundLockSystemDiagram() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeLayer = activeIndex !== null ? LAYERS[activeIndex] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
      {/* LEFT — Visual Diagram */}
      <div>
        <h3 className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/40 flex items-center gap-2 mb-6">
          <Layers className="w-3 h-3" /> System Cross-Section
        </h3>

        <div className="space-y-px">
          {LAYERS.map((layer, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={i}
                type="button"
                className={cn(
                  "w-full flex items-center justify-between px-5 border transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer relative overflow-hidden",
                  layer.heightClass,
                  isActive ? layer.active : layer.idle,
                  isActive && "shadow-[0_0_20px_-6px_hsl(var(--accent)/0.1)]",
                )}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(isActive ? null : i)}
                aria-pressed={isActive}
              >
                {/* Geotextile dashed indicator */}
                {i === 3 && (
                  <div className="absolute inset-0 flex items-center pointer-events-none">
                    <div className="w-full border-t border-dashed border-accent/15" />
                  </div>
                )}

                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-[600ms] relative z-10",
                    isActive ? "text-accent" : "text-foreground/50",
                  )}
                >
                  {layer.label}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/30 tabular-nums relative z-10">
                  {layer.depth}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground/25 italic mt-5 px-1">
          Hover or tap any layer.
        </p>
      </div>

      {/* RIGHT — Detail Panel */}
      <div className="relative min-h-[280px] flex flex-col justify-center">
        {/* Default state */}
        <div
          className={cn(
            "transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            activeLayer ? "opacity-0 translate-y-2 absolute inset-0 pointer-events-none" : "opacity-100 translate-y-0",
          )}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/35 mb-4">
            Engineered Ground System
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl text-foreground/85 mb-5 leading-snug">
            Five Layers.<br />
            One System.
          </h3>
          <p className="text-sm text-muted-foreground/50 leading-[1.9] max-w-md">
            Every GroundLock™ installation is a fully engineered cross-section —
            each layer purpose-built to support the one above.
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
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/60 mb-4">
              Layer {i + 1} of 5
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl text-foreground/85 mb-3 leading-snug">
              {layer.label}
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground/40 mb-5 tabular-nums">
              Depth: {layer.depth}
            </p>
            <p className="text-sm text-muted-foreground/60 leading-[1.9] max-w-md mb-5">
              {layer.summary}
            </p>
            <p className="text-[13px] text-muted-foreground/40 leading-[1.9] max-w-md">
              {layer.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
