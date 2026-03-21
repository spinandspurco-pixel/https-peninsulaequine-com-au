/**
 * GroundLockProductEducation — 4-hotspot interactive product storytelling module.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";
import { DURATION, EASE } from "@/lib/motion";

interface Hotspot {
  id: string;
  label: string;
  description: string;
  highlight: React.ReactNode;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "geometry",
    label: "Horseshoe Geometry",
    description:
      "The curved crown distributes compressive force while open legs allow directional water flow and unit interlocking.",
    highlight: (
      <path
        d="M 74 105 L 74 97 L 80 97 L 80 105 L 80 97 L 78 80 L 76 60 A 30 32 0 0 0 24 60 L 22 80 L 20 97 L 20 105 L 26 105 L 26 97 L 30 80 L 32 62 A 20 22 0 0 1 68 62 L 70 80 L 74 97 L 74 105 Z"
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
      "Side tabs key into adjacent panels. Alternating rows nest inversely — creating a continuous surface that resists lateral movement.",
    highlight: (
      <>
        <rect x="18" y="86" width="10" height="14" rx="1" fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent) / 0.5)" strokeWidth="1.2" />
        <rect x="72" y="86" width="10" height="14" rx="1" fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent) / 0.5)" strokeWidth="1.2" />
        <path d="M 44 30 L 50 18 L 56 30 Z" fill="hsl(var(--accent) / 0.15)" stroke="hsl(var(--accent) / 0.5)" strokeWidth="1.2" />
        <line x1="10" y1="93" x2="18" y2="93" stroke="hsl(var(--accent) / 0.6)" strokeWidth="0.8" markerEnd="url(#edu-arrow)" />
        <line x1="90" y1="93" x2="82" y2="93" stroke="hsl(var(--accent) / 0.6)" strokeWidth="0.8" markerEnd="url(#edu-arrow)" />
        <line x1="50" y1="12" x2="50" y2="20" stroke="hsl(var(--accent) / 0.6)" strokeWidth="0.8" markerEnd="url(#edu-arrow)" />
      </>
    ),
  },
  {
    id: "performance",
    label: "Load + Drainage",
    description:
      "The inner channel acts as a sub-surface drainage corridor. Under load, the curved form redirects force outward — preventing point-loading.",
    highlight: (
      <>
        <rect x="34" y="64" width="32" height="32" rx="2" fill="hsl(var(--accent) / 0.08)" stroke="hsl(var(--accent) / 0.4)" strokeWidth="0.8" strokeDasharray="3 2" />
        <line x1="50" y1="65" x2="50" y2="93" stroke="hsl(var(--accent) / 0.35)" strokeWidth="0.6" strokeDasharray="2 3" />
        <line x1="42" y1="65" x2="42" y2="93" stroke="hsl(var(--accent) / 0.2)" strokeWidth="0.4" strokeDasharray="2 3" />
        <line x1="58" y1="65" x2="58" y2="93" stroke="hsl(var(--accent) / 0.2)" strokeWidth="0.4" strokeDasharray="2 3" />
      </>
    ),
  },
  {
    id: "finish",
    label: "Finished Surface",
    description:
      "Once filled with aggregate, the panel disappears beneath a stable, draining, architecturally finished surface.",
    highlight: (
      <>
        <path
          d="M 74 105 L 74 97 L 80 97 L 80 105 L 80 97 L 78 80 L 76 60 A 30 32 0 0 0 24 60 L 22 80 L 20 97 L 20 105 L 26 105 L 26 97 L 30 80 L 32 62 A 20 22 0 0 1 68 62 L 70 80 L 74 97 L 74 105 Z"
          fill="hsl(var(--accent) / 0.06)"
          stroke="none"
        />
        {[
          [35, 70], [45, 65], [55, 68], [65, 72], [40, 78], [50, 76], [60, 80],
          [37, 88], [47, 86], [57, 90], [63, 94], [42, 96], [52, 93],
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

  // 100ms exit delay to prevent flicker
  const onLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => { setActiveId(null); leaveTimer.current = null; }, 100);
  }, []);

  const onTap = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);

  const activeHotspot = HOTSPOTS.find((h) => h.id === activeId) || null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
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
            <GroundLockPanelSVG active={!activeId} showTabs defsId="edu" direction="up" />

            {/* Active highlight overlay — opacity-only transition */}
            <g
              style={{
                opacity: activeHotspot ? 1 : 0,
                transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
                pointerEvents: "none",
              }}
            >
              {activeHotspot?.highlight}
            </g>
          </svg>
        </div>

        {/* Hotspot cards */}
        <div className="space-y-1.5">
          {HOTSPOTS.map((h) => {
            const isActive = activeId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                className={cn(
                  "w-full text-left p-4 sm:p-5 border rounded-sm cursor-pointer",
                  isActive
                    ? "border-accent/25 bg-accent/[0.03]"
                    : "border-border/15 bg-transparent hover:border-accent/12"
                )}
                style={{ transition: `all ${DURATION.normal}ms ${EASE.interactive}` }}
                onMouseEnter={() => onEnter(h.id)}
                onMouseLeave={onLeave}
                onClick={() => onTap(h.id)}
              >
                <p className={cn(
                  "text-[12px] sm:text-[13px] font-medium tracking-[0.02em]",
                  isActive ? "text-accent/75" : "text-foreground/55"
                )}
                  style={{ transition: `color ${DURATION.fast}ms ${EASE.interactive}` }}
                >
                  {h.label}
                </p>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isActive ? "100px" : "0px",
                    opacity: isActive ? 1 : 0,
                    marginTop: isActive ? "6px" : "0px",
                    transition: `max-height ${DURATION.normal}ms ${EASE.default}, opacity ${DURATION.fast}ms ${EASE.interactive}, margin ${DURATION.fast}ms ${EASE.interactive}`,
                  }}
                >
                  <p className="text-[11px] sm:text-[12px] text-muted-foreground/35 leading-[1.7]">
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
