/**
 * LandIntelligence — Interactive property masterplan
 *
 * Hoverable zones reveal micro-text about how PE thinks
 * about land before building. Architectural grid aesthetic
 * with thin lines and subtle motion.
 */

import { useState, useCallback } from "react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { cn } from "@/lib/utils";

interface Zone {
  id: string;
  label: string;
  insight: string;
  /** SVG path or polygon points */
  path: string;
  /** Label anchor position (% from top-left of SVG viewBox) */
  labelX: number;
  labelY: number;
}

const ZONES: Zone[] = [
  {
    id: "arena",
    label: "Arena",
    insight: "Positioned for light, drainage, and performance.",
    path: "M 180 120 L 420 120 L 420 280 L 180 280 Z",
    labelX: 300,
    labelY: 200,
  },
  {
    id: "stables",
    label: "Stables",
    insight: "Airflow corridors aligned to prevailing wind.",
    path: "M 480 140 L 580 140 L 580 260 L 480 260 Z",
    labelX: 530,
    labelY: 200,
  },
  {
    id: "access",
    label: "Access Routes",
    insight: "Heavy movement without surface compromise.",
    path: "M 60 320 L 540 320 L 540 360 L 60 360 Z",
    labelX: 300,
    labelY: 340,
  },
  {
    id: "drainage",
    label: "Drainage",
    insight: "Water moves before it becomes a problem.",
    path: "M 100 80 L 140 80 L 140 310 L 100 310 Z",
    labelX: 120,
    labelY: 195,
  },
  {
    id: "circulation",
    label: "Circulation",
    insight: "Flow designed around the horse, not the fence.",
    path: "M 160 380 L 580 380 L 580 420 L 160 420 Z",
    labelX: 370,
    labelY: 400,
  },
];

/** Thin architectural grid lines */
function GridLines() {
  const lines = [];
  // Vertical grid
  for (let x = 60; x <= 580; x += 40) {
    lines.push(
      <line key={`v-${x}`} x1={x} y1={40} x2={x} y2={460} stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
    );
  }
  // Horizontal grid
  for (let y = 40; y <= 460; y += 40) {
    lines.push(
      <line key={`h-${y}`} x1={60} y1={y} x2={580} y2={y} stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
    );
  }
  return <g className="text-foreground">{lines}</g>;
}

/** Property boundary */
function PropertyBoundary() {
  return (
    <rect
      x={60}
      y={60}
      width={520}
      height={380}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      strokeDasharray="4 6"
      className="text-accent/20"
    />
  );
}

/** North indicator */
function NorthIndicator() {
  return (
    <g className="text-muted-foreground" opacity="0.2">
      <line x1={600} y1={90} x2={600} y2={60} stroke="currentColor" strokeWidth="0.8" />
      <polygon points="596,68 600,56 604,68" fill="currentColor" />
      <text x={600} y={52} textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" letterSpacing="0.15em">N</text>
    </g>
  );
}

/** Scale bar */
function ScaleBar() {
  return (
    <g className="text-muted-foreground" opacity="0.15">
      <line x1={60} y1={470} x2={180} y2={470} stroke="currentColor" strokeWidth="0.5" />
      <line x1={60} y1={466} x2={60} y2={474} stroke="currentColor" strokeWidth="0.5" />
      <line x1={180} y1={466} x2={180} y2={474} stroke="currentColor" strokeWidth="0.5" />
      <text x={120} y={482} textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="monospace" letterSpacing="0.1em">30m</text>
    </g>
  );
}

export function LandIntelligence() {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const handleEnter = useCallback((id: string) => setActiveZone(id), []);
  const handleLeave = useCallback(() => setActiveZone(null), []);

  const activeData = ZONES.find((z) => z.id === activeZone);

  return (
    <section className="relative overflow-hidden cv-auto">
      <div className="py-32 sm:py-40 lg:py-52 relative">
        <div className="absolute inset-0 grain-texture opacity-15" />

        <div className="section-container max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-20 sm:mb-28">
            <RevealOnScroll direction="up">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-10 h-px bg-accent/20" />
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40">
                  Intelligence
                </p>
                <div className="w-10 h-px bg-accent/20" />
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={100}>
              <h2
                className="font-serif font-light text-foreground/80 leading-[1.2] max-w-lg mx-auto"
                style={{ fontSize: "clamp(1.6rem, 0.8rem + 3vw, 2.8rem)" }}
              >
                The Land Decides First.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <RevealLine className="mx-auto mt-8" width="w-12" />
            </RevealOnScroll>
          </div>

          {/* Masterplan + Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start">
            {/* SVG Masterplan */}
            <RevealOnScroll direction="up" delay={150} scaleReveal>
              <div className="relative border border-border/10 bg-card/30 p-4 sm:p-6">
                {/* Corner marks */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent/15" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/15" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-accent/15" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent/15" />

                <svg
                  viewBox="0 0 640 500"
                  className="w-full h-auto"
                  style={{ maxHeight: "500px" }}
                >
                  <GridLines />
                  <PropertyBoundary />
                  <NorthIndicator />
                  <ScaleBar />

                  {/* Zones */}
                  {ZONES.map((zone) => {
                    const isActive = activeZone === zone.id;
                    return (
                      <g key={zone.id}>
                        <path
                          d={zone.path}
                          fill={isActive ? "hsl(var(--accent) / 0.08)" : "transparent"}
                          stroke={isActive ? "hsl(var(--accent) / 0.5)" : "hsl(var(--foreground) / 0.08)"}
                          strokeWidth={isActive ? "1" : "0.5"}
                          className="transition-all duration-300 ease-in-out cursor-pointer"
                          onMouseEnter={() => handleEnter(zone.id)}
                          onMouseLeave={handleLeave}
                          onClick={() => setActiveZone(isActive ? null : zone.id)}
                        />
                        {/* Zone label */}
                        <text
                          x={zone.labelX}
                          y={zone.labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="7"
                          fontFamily="monospace"
                          letterSpacing="0.2em"
                          fill={isActive ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.2)"}
                          className="transition-all duration-300 ease-in-out pointer-events-none uppercase select-none"
                        >
                          {zone.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Drawing title */}
                  <text
                    x={320}
                    y={24}
                    textAnchor="middle"
                    fontSize="6"
                    fontFamily="monospace"
                    letterSpacing="0.3em"
                    fill="hsl(var(--muted-foreground) / 0.15)"
                    className="uppercase select-none"
                  >
                    Site Analysis — Conceptual Layout
                  </text>
                </svg>
              </div>
            </RevealOnScroll>

            {/* Insight Panel */}
            <RevealOnScroll direction="up" delay={300}>
              <div className="lg:sticky lg:top-32">
                {/* Active insight */}
                <div className="min-h-[160px] flex flex-col justify-center">
                  <div
                    className={cn(
                      "transition-all duration-500 ease-in-out",
                      activeData ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    )}
                  >
                    {activeData && (
                      <>
                        <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/50 mb-4">
                          {activeData.label}
                        </p>
                        <p
                          className="font-serif text-[15px] sm:text-base text-foreground/50 leading-[1.8] tracking-[0.01em]"
                        >
                          {activeData.insight}
                        </p>
                        <div className="w-8 h-px bg-accent/15 mt-6" />
                      </>
                    )}
                  </div>

                  {/* Default state */}
                  <div
                    className={cn(
                      "transition-all duration-500 ease-in-out",
                      !activeData ? "opacity-100" : "opacity-0 absolute"
                    )}
                  >
                    <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-muted-foreground/20 mb-4">
                      Hover to explore
                    </p>
                    <p className="text-[11px] text-muted-foreground/15 leading-[2] tracking-[0.04em]">
                      Every zone is positioned with intent —
                      light, drainage, movement, and longevity
                      inform every decision before ground is broken.
                    </p>
                  </div>
                </div>

                {/* Zone list */}
                <div className="mt-12 space-y-0">
                  {ZONES.map((zone) => (
                    <button
                      key={zone.id}
                      className={cn(
                        "w-full text-left py-3 border-b border-border/6 flex items-center gap-3 group transition-all duration-300 ease-in-out",
                        activeZone === zone.id
                          ? "text-accent/70"
                          : "text-muted-foreground/15 hover:text-muted-foreground/40"
                      )}
                      onMouseEnter={() => handleEnter(zone.id)}
                      onMouseLeave={handleLeave}
                      onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          activeZone === zone.id
                            ? "bg-accent/50 scale-100"
                            : "bg-muted-foreground/10 scale-75"
                        )}
                      />
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em]">
                        {zone.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>

      {/* Transition anchor */}
      <div className="py-20 sm:py-28 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="flex flex-col items-center gap-8 relative z-[1]">
          <RevealOnScroll direction="up">
            <p className="font-serif italic text-lg sm:text-xl text-foreground/40 tracking-wide">
              Every decision leads here.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-12 bg-accent/15" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/25" />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </>
  );
}
