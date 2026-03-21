/**
 * GroundLockProductEducation — 4-hotspot interactive product storytelling module.
 *
 * Hotspots:
 *  1. Horseshoe Geometry
 *  2. Interlocking Structure
 *  3. Load + Drainage Performance
 *  4. Finished Surface Outcome
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";
import { DURATION, EASE } from "@/lib/motion";

interface Hotspot {
  id: string;
  label: string;
  description: string;
  /** SVG highlight region */
  highlight: React.ReactNode;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "geometry",
    label: "Horseshoe Geometry",
    description:
      "The signature U-shape isn't decorative — it's structural. The curved crown distributes compressive force while open legs allow directional water flow and interlocking with adjacent units.",
    highlight: (
      <path
        d="M 78 100 L 78 45 A 28 28 0 0 0 22 45 L 22 100 L 30 100 L 30 50 A 20 20 0 0 1 70 50 L 70 100 Z"
        fill="hsl(var(--accent) / 0.12)"
        stroke="hsl(var(--accent) / 0.5)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    ),
  },
  {
    id: "interlocking",
    label: "Interlocking Structure",
    description:
      "Side tabs key into adjacent panels. Alternating rows nest inversely — creating a continuous surface that resists lateral movement under equine and vehicle traffic.",
    highlight: (
      <>
        {/* Highlight the tab zones */}
        <rect x="14" y="66" width="10" height="20" rx="1" fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent) / 0.5)" strokeWidth="1.2" />
        <rect x="76" y="66" width="10" height="20" rx="1" fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent) / 0.5)" strokeWidth="1.2" />
        {/* Arrow indicators */}
        <line x1="10" y1="76" x2="16" y2="76" stroke="hsl(var(--accent) / 0.6)" strokeWidth="0.8" markerEnd="url(#edu-arrow)" />
        <line x1="90" y1="76" x2="84" y2="76" stroke="hsl(var(--accent) / 0.6)" strokeWidth="0.8" markerEnd="url(#edu-arrow)" />
      </>
    ),
  },
  {
    id: "performance",
    label: "Load + Drainage",
    description:
      "The open channel between inner and outer walls acts as a sub-surface drainage corridor. Under load, the curved form redirects force outward to the base — preventing point-loading and surface deformation.",
    highlight: (
      <>
        {/* Inner channel highlight */}
        <rect x="32" y="52" width="36" height="46" rx="2" fill="hsl(var(--accent) / 0.08)" stroke="hsl(var(--accent) / 0.4)" strokeWidth="0.8" strokeDasharray="3 2" />
        {/* Flow indicators */}
        <line x1="50" y1="55" x2="50" y2="93" stroke="hsl(var(--accent) / 0.35)" strokeWidth="0.6" strokeDasharray="2 3" />
        <line x1="42" y1="55" x2="42" y2="93" stroke="hsl(var(--accent) / 0.2)" strokeWidth="0.4" strokeDasharray="2 3" />
        <line x1="58" y1="55" x2="58" y2="93" stroke="hsl(var(--accent) / 0.2)" strokeWidth="0.4" strokeDasharray="2 3" />
      </>
    ),
  },
  {
    id: "finish",
    label: "Finished Surface",
    description:
      "Once filled with aggregate or stone, the panel disappears beneath a premium, resolved surface. The result is stable, draining, and architecturally finished — not rough, temporary, or industrial.",
    highlight: (
      <>
        {/* Surface fill overlay */}
        <path
          d="M 78 100 L 78 45 A 28 28 0 0 0 22 45 L 22 100 L 30 100 L 30 50 A 20 20 0 0 1 70 50 L 70 100 Z"
          fill="hsl(var(--accent) / 0.06)"
          stroke="none"
        />
        {/* Aggregate dots */}
        {[
          [35, 60], [45, 55], [55, 58], [65, 62], [40, 70], [50, 68], [60, 72],
          [37, 80], [47, 78], [57, 82], [63, 88], [42, 90], [52, 92],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.2" fill="hsl(var(--accent) / 0.25)" />
        ))}
      </>
    ),
  },
];

export function GroundLockProductEducation() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = useCallback((id: string) => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setActiveId(id);
  }, []);

  const onLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => { setActiveId(null); leaveTimer.current = null; }, 80);
  }, []);

  const onTap = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);

  const activeHotspot = HOTSPOTS.find((h) => h.id === activeId) || null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Panel visual with highlight overlays */}
        <div className="flex justify-center">
          <svg viewBox="0 0 100 120" className="w-full max-w-[280px] h-auto">
            <PanelDefs id="edu" />
            <defs>
              <marker id="edu-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M 0 0 L 5 2.5 L 0 5" fill="none" stroke="hsl(var(--accent) / 0.6)" strokeWidth="0.6" />
              </marker>
            </defs>

            {/* Base panel */}
            <GroundLockPanelSVG active={!activeId} showTabs defsId="edu" />

            {/* Active highlight overlay */}
            {activeHotspot && (
              <g
                style={{
                  opacity: 1,
                  transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
                }}
              >
                {activeHotspot.highlight}
              </g>
            )}
          </svg>
        </div>

        {/* Hotspot cards */}
        <div className="space-y-2">
          {HOTSPOTS.map((h) => {
            const isActive = activeId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                className={cn(
                  "w-full text-left p-5 sm:p-6 border rounded-sm cursor-pointer transition-all",
                  isActive
                    ? "border-accent/30 bg-accent/[0.04]"
                    : "border-border/20 bg-transparent hover:border-accent/15"
                )}
                style={{ transition: `all ${DURATION.fast}ms ${EASE.interactive}` }}
                onMouseEnter={() => onEnter(h.id)}
                onMouseLeave={onLeave}
                onClick={() => onTap(h.id)}
              >
                <p className={cn(
                  "text-xs sm:text-[13px] font-medium tracking-[0.02em] transition-colors",
                  isActive ? "text-accent/80" : "text-foreground/60"
                )}
                  style={{ transition: `color ${DURATION.fast}ms ${EASE.interactive}` }}
                >
                  {h.label}
                </p>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isActive ? "120px" : "0px",
                    opacity: isActive ? 1 : 0,
                    marginTop: isActive ? "8px" : "0px",
                    transition: `max-height ${DURATION.normal}ms ${EASE.default}, opacity ${DURATION.fast}ms ${EASE.interactive}, margin ${DURATION.fast}ms ${EASE.interactive}`,
                  }}
                >
                  <p className="text-[12px] sm:text-[13px] text-muted-foreground/40 leading-[1.8]">
                    {h.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
