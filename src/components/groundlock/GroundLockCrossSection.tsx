/**
 * GroundLock™ Cross-Section — Interactive layer build-up with panel detail view.
 *
 * Scroll-triggered sequential reveal from subgrade → panel.
 * Click on panel layer to reveal interlocking detail overlay.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";
import { X } from "lucide-react";

/* ── Layer definitions ── */
const LAYERS = [
  {
    id: "panel",
    label: "Panel + Infill",
    depth: "75–100mm",
    desc: "Interlocking horseshoe panels distribute load across the surface and prevent lateral movement.",
    y: 0,
    h: 38,
    fill: "hsl(var(--accent) / 0.14)",
    activeFill: "hsl(var(--accent) / 0.22)",
    stroke: "hsl(var(--accent) / 0.35)",
    activeStroke: "hsl(var(--accent) / 0.55)",
    hasDetail: true,
  },
  {
    id: "bedding",
    label: "Bedding Layer",
    depth: "25–50mm",
    desc: "Creates a stable, level base for long-term panel performance.",
    y: 38,
    h: 18,
    fill: "hsl(var(--foreground) / 0.04)",
    activeFill: "hsl(var(--foreground) / 0.07)",
    stroke: "hsl(var(--foreground) / 0.08)",
    activeStroke: "hsl(var(--foreground) / 0.15)",
    hasDetail: false,
  },
  {
    id: "subbase",
    label: "Sub-Base",
    depth: "100–150mm",
    desc: "Compacted aggregate allowing water to drain while maintaining structural strength.",
    y: 56,
    h: 28,
    fill: "hsl(var(--foreground) / 0.03)",
    activeFill: "hsl(var(--foreground) / 0.06)",
    stroke: "hsl(var(--foreground) / 0.06)",
    activeStroke: "hsl(var(--foreground) / 0.12)",
    hasDetail: false,
  },
  {
    id: "geotextile",
    label: "Geotextile",
    depth: "~1mm",
    desc: "Separates layers to prevent contamination and migration.",
    y: 84,
    h: 3,
    fill: "hsl(var(--accent) / 0.10)",
    activeFill: "hsl(var(--accent) / 0.18)",
    stroke: "hsl(var(--accent) / 0.20)",
    activeStroke: "hsl(var(--accent) / 0.40)",
    hasDetail: false,
  },
  {
    id: "subgrade",
    label: "Subgrade",
    depth: "Native",
    desc: "Trimmed and compacted native soil — the foundation of everything above.",
    y: 87,
    h: 33,
    fill: "hsl(var(--foreground) / 0.025)",
    activeFill: "hsl(var(--foreground) / 0.05)",
    stroke: "hsl(var(--foreground) / 0.05)",
    activeStroke: "hsl(var(--foreground) / 0.10)",
    hasDetail: false,
  },
];

/* ── Panel detail overlay SVG content ── */
function PanelDetailOverlay({ visible }: { visible: boolean }) {
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${DURATION.slow}ms ${EASE.cinematic}`,
        pointerEvents: "none",
      }}
    >
      {/* Interlocking geometry — horseshoe outlines */}
      <g transform="translate(20, 4) scale(0.32)">
        {/* Panel A — up */}
        <path
          d="M 22 90 L 22 55 A 28 28 0 0 1 78 55 L 78 90 L 72 90 L 72 55 A 22 22 0 0 0 28 55 L 28 90 Z"
          fill="hsl(var(--accent) / 0.08)"
          stroke="hsl(var(--accent) / 0.45)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Tabs */}
        <rect x="15" y="76" width="7" height="8" fill="hsl(var(--accent) / 0.10)" stroke="hsl(var(--accent) / 0.35)" strokeWidth="1" rx="0.5" />
        <rect x="78" y="76" width="7" height="8" fill="hsl(var(--accent) / 0.10)" stroke="hsl(var(--accent) / 0.35)" strokeWidth="1" rx="0.5" />
        {/* Crown */}
        <path d="M 44 32 L 50 22 L 56 32 Z" fill="hsl(var(--accent) / 0.10)" stroke="hsl(var(--accent) / 0.35)" strokeWidth="1" />
      </g>

      {/* Panel B — down, nested */}
      <g transform="translate(50, 4) scale(0.32)">
        <path
          d="M 22 20 L 22 55 A 28 28 0 0 0 78 55 L 78 20 L 72 20 L 72 55 A 22 22 0 0 1 28 55 L 28 20 Z"
          fill="hsl(var(--accent) / 0.06)"
          stroke="hsl(var(--accent) / 0.30)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="15" y="26" width="7" height="8" fill="hsl(var(--accent) / 0.08)" stroke="hsl(var(--accent) / 0.25)" strokeWidth="1" rx="0.5" />
        <rect x="78" y="26" width="7" height="8" fill="hsl(var(--accent) / 0.08)" stroke="hsl(var(--accent) / 0.25)" strokeWidth="1" rx="0.5" />
        <path d="M 44 78 L 50 88 L 56 78 Z" fill="hsl(var(--accent) / 0.08)" stroke="hsl(var(--accent) / 0.25)" strokeWidth="1" />
      </g>

      {/* Load distribution arrows — downward */}
      {[35, 50, 65, 80].map((x) => (
        <g key={x}>
          <line
            x1={x} y1={-4} x2={x} y2={6}
            stroke="hsl(var(--accent) / 0.25)"
            strokeWidth="0.8"
            strokeDasharray="2 1.5"
          />
          <polygon
            points={`${x - 1.5},4 ${x + 1.5},4 ${x},7`}
            fill="hsl(var(--accent) / 0.25)"
          />
        </g>
      ))}

      {/* Drainage flow — horizontal subtle lines within panel zone */}
      {[16, 22, 28].map((y) => (
        <line
          key={y}
          x1={18} y1={y} x2={95} y2={y}
          stroke="hsl(var(--accent) / 0.10)"
          strokeWidth="0.5"
          strokeDasharray="3 4"
        />
      ))}

      {/* Directional drainage arrows — right */}
      {[16, 22, 28].map((y) => (
        <polygon
          key={`arr-${y}`}
          points={`93,${y - 1.2} 93,${y + 1.2} 96,${y}`}
          fill="hsl(var(--accent) / 0.15)"
        />
      ))}

      {/* Label: Load */}
      <text x="50" y={-7} textAnchor="middle" fill="hsl(var(--accent) / 0.40)" fontSize="3.2" fontFamily="monospace" letterSpacing="0.15em">
        LOAD
      </text>

      {/* Label: Drainage */}
      <text x="97" y="22" textAnchor="start" fill="hsl(var(--accent) / 0.30)" fontSize="2.8" fontFamily="monospace" letterSpacing="0.1em" transform="rotate(90, 97, 22)">
        DRAIN
      </text>
    </g>
  );
}

export function GroundLockCrossSection({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [panelDetailOpen, setPanelDetailOpen] = useState(false);
  const [lockAnimating, setLockAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLayerClick = useCallback((i: number) => {
    if (LAYERS[i].hasDetail) {
      setPanelDetailOpen((prev) => !prev);
    }
    setActiveIndex((prev) => (prev === i ? null : i));
  }, []);

  // Scroll-triggered sequential reveal: bottom layer first
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const total = LAYERS.length;
          let count = 0;
          const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            // Trigger lock animation when panel layer appears (last one, index = total)
            if (count === total) {
              clearInterval(interval);
              setTimeout(() => {
                setLockAnimating(true);
                setTimeout(() => setLockAnimating(false), 600);
              }, 200);
            }
          }, 150);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const svgW = 115;
  const svgH = 120;

  return (
    <div ref={containerRef} className={cn("max-w-4xl mx-auto", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Cross-section SVG */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[340px]">
            <svg
              viewBox={`0 -10 ${svgW} ${svgH + 10}`}
              className="w-full h-auto"
              aria-label="GroundLock system cross-section — interactive layer build-up"
            >
              <defs>
                <linearGradient id="cs-depth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Render layers bottom-to-top */}
              {[...LAYERS].reverse().map((layer, ri) => {
                const i = LAYERS.length - 1 - ri;
                const revealIndex = LAYERS.length - 1 - i; // subgrade = 0, panel = 4
                const isVisible = visibleCount > revealIndex;
                const isActive = activeIndex === i;
                const isPanel = layer.id === "panel";
                const lockOffset = isPanel && lockAnimating ? 1.5 : 0;

                return (
                  <g
                    key={layer.id}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? `translateY(${lockOffset}px)`
                        : "translateY(6px)",
                      transition: `opacity 700ms ${EASE.cinematic} ${revealIndex * 40}ms, transform 700ms ${EASE.cinematic} ${revealIndex * 40}ms`,
                    }}
                    className="cursor-pointer"
                    onClick={() => handleLayerClick(i)}
                  >
                    <rect
                      x={5}
                      y={layer.y}
                      width={100}
                      height={layer.h}
                      rx={0.8}
                      fill={isActive ? layer.activeFill : layer.fill}
                      stroke={isActive ? layer.activeStroke : layer.stroke}
                      strokeWidth={isActive ? 0.8 : 0.4}
                      style={{ transition: `all ${DURATION.normal}ms ${EASE.interactive}` }}
                    />

                    {/* Layer label inside */}
                    <text
                      x={8}
                      y={layer.y + (layer.h < 8 ? layer.h / 2 + 1 : 10)}
                      fill={isActive ? "hsl(var(--accent) / 0.55)" : "hsl(var(--foreground) / 0.18)"}
                      fontSize={layer.h < 8 ? "2.5" : "3.2"}
                      fontFamily="monospace"
                      letterSpacing="0.08em"
                      style={{ transition: `fill ${DURATION.fast}ms ${EASE.interactive}` }}
                    >
                      {layer.label.toUpperCase()}
                    </text>

                    {/* Depth marker on right */}
                    <text
                      x={108}
                      y={layer.y + layer.h / 2 + 1.2}
                      fill={isActive ? "hsl(var(--accent) / 0.40)" : "hsl(var(--foreground) / 0.12)"}
                      fontSize="2.6"
                      fontFamily="monospace"
                      textAnchor="end"
                      style={{ transition: `fill ${DURATION.fast}ms ${EASE.interactive}` }}
                    >
                      {layer.depth}
                    </text>

                    {/* Horseshoe panel silhouettes inside panel layer */}
                    {isPanel && isVisible && (
                      <g
                        style={{
                          opacity: lockAnimating ? 0.7 : 0.4,
                          transition: `opacity 400ms ${EASE.cinematic}`,
                        }}
                      >
                        {[0, 1, 2].map((pi) => (
                          <g key={pi} transform={`translate(${15 + pi * 28}, ${layer.y + 6}) scale(0.22)`}>
                            <path
                              d={pi % 2 === 0
                                ? "M 22 90 L 22 55 A 28 28 0 0 1 78 55 L 78 90 L 72 90 L 72 55 A 22 22 0 0 0 28 55 L 28 90 Z"
                                : "M 22 20 L 22 55 A 28 28 0 0 0 78 55 L 78 20 L 72 20 L 72 55 A 22 22 0 0 1 28 55 L 28 20 Z"
                              }
                              fill="none"
                              stroke="hsl(var(--accent) / 0.30)"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </g>
                        ))}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Panel detail overlay — click to reveal */}
              <PanelDetailOverlay visible={panelDetailOpen} />
            </svg>

            {/* Click hint for panel */}
            {visibleCount >= LAYERS.length && !panelDetailOpen && (
              <p
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-accent/25 tracking-[0.2em] uppercase whitespace-nowrap"
                style={{
                  opacity: 1,
                  animation: "fade-in 800ms ease-out both",
                  animationDelay: "600ms",
                }}
              >
                Tap panel layer to explore
              </p>
            )}
          </div>
        </div>

        {/* Layer list + detail panel */}
        <div className="space-y-1.5">
          {LAYERS.map((layer, i) => {
            const isActive = activeIndex === i;
            const revealIndex = LAYERS.length - 1 - i;
            const isVisible = visibleCount > revealIndex;

            return (
              <button
                key={layer.id}
                type="button"
                className={cn(
                  "w-full text-left flex items-center gap-4 p-4 border cursor-pointer",
                  isActive
                    ? "border-accent/20 bg-accent/[0.03]"
                    : "border-border/10 bg-transparent hover:border-accent/8",
                )}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(8px)",
                  transition: `all 700ms ${EASE.cinematic}`,
                }}
                onClick={() => handleLayerClick(i)}
              >
                <span className="text-[10px] font-mono text-muted-foreground/40 w-20 tabular-nums shrink-0">
                  {layer.depth}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isActive ? "text-accent/70" : "text-foreground/50"
                  )}
                    style={{ transition: `color ${DURATION.fast}ms ${EASE.interactive}` }}
                  >
                    {layer.label}
                  </p>
                  <div
                    className="overflow-hidden"
                    style={{
                      maxHeight: isActive ? "80px" : "0px",
                      opacity: isActive ? 1 : 0,
                      marginTop: isActive ? "4px" : "0px",
                      transition: `max-height ${DURATION.normal}ms ${EASE.default}, opacity ${DURATION.fast}ms ${EASE.interactive}, margin ${DURATION.fast}ms ${EASE.interactive}`,
                    }}
                  >
                    <p className="text-[11px] text-muted-foreground/35 leading-[1.7]">
                      {layer.desc}
                    </p>
                    {layer.hasDetail && (
                      <p className="text-[9px] font-mono text-accent/30 mt-2 tracking-[0.15em] uppercase">
                        {panelDetailOpen ? "Click to close detail view" : "Click to see interlocking detail"}
                      </p>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "w-1 h-8 rounded-full shrink-0",
                  isActive ? "bg-accent/40" : "bg-border/30"
                )}
                  style={{ transition: `background-color ${DURATION.fast}ms ${EASE.interactive}` }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
