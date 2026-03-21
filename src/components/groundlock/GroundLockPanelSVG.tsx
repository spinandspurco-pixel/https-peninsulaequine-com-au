/**
 * GroundLock horseshoe panel — a single reusable SVG unit.
 *
 * The path describes a top-down U / horseshoe shape:
 *   ┌─────────────┐
 *   │  ┌───────┐  │
 *   │  │       │  │
 *   │  │       │  │
 *   │  └───┘   │  │  ← open bottom
 *   └─────────────┘
 *
 * viewBox is 100×120 so the shape is taller than wide (U orientation).
 * Outer radius ≈ 40, inner radius ≈ 24, wall ≈ 16, leg length ≈ 60.
 */

import { cn } from "@/lib/utils";

/* ── The horseshoe path (open at bottom) ──────────────── */
// Centered at (50, 30) for the arc, legs extend downward to y≈95
const PANEL_PATH = [
  "M 10 95",           // bottom-left outer
  "L 10 30",           // left leg up
  "A 40 40 0 1 1 90 30", // outer arc (semicircle top)
  "L 90 95",           // right leg down
  "A 8 8 0 0 1 74 95", // right foot round
  "L 74 30",           // right inner leg up
  "A 24 24 0 1 0 26 30", // inner arc (reversed)
  "L 26 95",           // left inner leg down
  "A 8 8 0 0 1 10 95", // left foot round
  "Z",
].join(" ");

interface PanelProps {
  className?: string;
  /** Rotation in degrees */
  rotation?: number;
  /** Translate x,y */
  x?: number;
  y?: number;
  /** Scale factor */
  scale?: number;
  /** Fill override */
  fill?: string;
  /** Stroke override */
  stroke?: string;
  /** Opacity */
  opacity?: number;
  /** Whether panel is highlighted */
  active?: boolean;
}

export function GroundLockPanelSVG({
  className,
  rotation = 0,
  x = 0,
  y = 0,
  scale = 1,
  fill,
  stroke,
  opacity = 1,
  active = false,
}: PanelProps) {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, 50, 60) scale(${scale})`}
      opacity={opacity}
      className={cn("transition-opacity duration-300", className)}
    >
      {/* Shadow */}
      <path
        d={PANEL_PATH}
        fill="hsl(var(--background))"
        opacity={0.4}
        transform="translate(2, 2)"
      />
      {/* Main panel */}
      <path
        d={PANEL_PATH}
        fill={fill ?? (active ? "hsl(var(--accent) / 0.18)" : "hsl(var(--accent) / 0.08)")}
        stroke={stroke ?? (active ? "hsl(var(--accent) / 0.5)" : "hsl(var(--accent) / 0.2)")}
        strokeWidth={1.2}
      />
      {/* Inner highlight edge */}
      <path
        d={PANEL_PATH}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.3)" : "hsl(var(--accent) / 0.06)"}
        strokeWidth={0.5}
        transform="translate(0, -0.5) scale(0.98)"
        style={{ transformOrigin: "50px 60px" }}
      />
    </g>
  );
}

/** Standalone panel preview — shows one panel with its viewBox */
export function GroundLockPanelPreview({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={cn("w-full h-auto", className)}
      aria-label="GroundLock horseshoe panel — single unit"
    >
      <GroundLockPanelSVG active />
    </svg>
  );
}

export { PANEL_PATH };
