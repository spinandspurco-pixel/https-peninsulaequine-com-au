/**
 * GroundLock™ Interlocking Panel System
 *
 * True alternating-direction horseshoe panels that mechanically
 * interlock: Panel A faces up, Panel B faces down and nests into A.
 *
 * Optimised for mobile legibility: thicker strokes, higher contrast,
 * simplified linework with prominent join-point markers.
 */

import { cn } from "@/lib/utils";

/* ── Panel path — horseshoe open at bottom ── */
const PANEL_UP = [
  "M 20 90", "L 20 70", "L 22 55",
  "A 28 30 0 0 1 78 55",
  "L 80 70", "L 80 90",
  "L 74 90", "L 74 72", "L 72 58",
  "A 20 22 0 0 0 28 58",
  "L 26 72", "L 26 90", "Z",
].join(" ");

/* ── Panel path — horseshoe open at top (inverted) ── */
const PANEL_DOWN = [
  "M 20 20", "L 20 40", "L 22 55",
  "A 28 30 0 0 0 78 55",
  "L 80 40", "L 80 20",
  "L 74 20", "L 74 38", "L 72 52",
  "A 20 22 0 0 1 28 52",
  "L 26 38", "L 26 20", "Z",
].join(" ");

/* ── Interlocking tabs — thicker for visibility ── */
const TAB_UP_LEFT = "M 20 76 L 13 76 L 13 84 L 20 84 Z";
const TAB_UP_RIGHT = "M 80 76 L 87 76 L 87 84 L 80 84 Z";
const TAB_DOWN_LEFT = "M 20 26 L 13 26 L 13 34 L 20 34 Z";
const TAB_DOWN_RIGHT = "M 80 26 L 87 26 L 87 34 L 80 34 Z";
const TOE_UP = "M 44 32 L 50 22 L 56 32 Z";
const TOE_DOWN = "M 44 78 L 50 88 L 56 78 Z";

/* ── Join-point markers — small circles at lock locations ── */
const JOIN_UP = [
  { cx: 13, cy: 80 },
  { cx: 87, cy: 80 },
  { cx: 50, cy: 24 },
];
const JOIN_DOWN = [
  { cx: 13, cy: 30 },
  { cx: 87, cy: 30 },
  { cx: 50, cy: 86 },
];

/* ── Inner groove for curvature ── */
const GROOVE_UP = "M 32 59 A 16 18 0 0 1 68 59";
const GROOVE_DOWN = "M 32 51 A 16 18 0 0 0 68 51";

/* ── Shared gradient defs ── */
export function PanelDefs({ id = "gl" }: { id?: string }) {
  return (
    <defs>
      {/* Active fill — stronger opacity for mobile */}
      <linearGradient id={`${id}-top-active`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
      </linearGradient>
      {/* Idle fill */}
      <linearGradient id={`${id}-top-idle`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.04" />
      </linearGradient>
      {/* Depth side */}
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.14" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id={`${id}-side-active`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.26" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.5" />
      </linearGradient>
      {/* Shadow — simpler, less GPU-heavy */}
      <filter id={`${id}-shadow`} x="-15%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="hsl(var(--background))" floodOpacity="0.5" />
      </filter>
    </defs>
  );
}

interface PanelProps {
  className?: string;
  /** "up" = open at bottom (default), "down" = open at top */
  direction?: "up" | "down";
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  active?: boolean;
  showTabs?: boolean;
  defsId?: string;
  /** Show join-point markers */
  showJoins?: boolean;
}

export function GroundLockPanelSVG({
  className,
  direction = "up",
  x = 0,
  y = 0,
  scale = 1,
  opacity = 1,
  active = false,
  showTabs = false,
  showJoins = false,
  defsId = "gl",
}: PanelProps) {
  const isUp = direction === "up";
  const panelPath = isUp ? PANEL_UP : PANEL_DOWN;
  const groove = isUp ? GROOVE_UP : GROOVE_DOWN;
  const tabL = isUp ? TAB_UP_LEFT : TAB_DOWN_LEFT;
  const tabR = isUp ? TAB_UP_RIGHT : TAB_DOWN_RIGHT;
  const toe = isUp ? TOE_UP : TOE_DOWN;
  const joins = isUp ? JOIN_UP : JOIN_DOWN;

  /* Higher contrast strokes for mobile legibility */
  const strokeColor = active ? "hsl(var(--accent) / 0.65)" : "hsl(var(--accent) / 0.25)";
  const strokeW = active ? 1.2 : 0.8;
  const topGrad = active ? `${defsId}-top-active` : `${defsId}-top-idle`;
  const depthOffset = isUp ? 4 : -4;

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      opacity={opacity}
      className={cn(className)}
    >
      {/* Shadow */}
      <path
        d={panelPath}
        fill="hsl(var(--background))"
        opacity={0.25}
        transform={`translate(1, ${isUp ? 2 : -2})`}
        filter={`url(#${defsId}-shadow)`}
      />

      {/* Depth extrusion */}
      <path
        d={panelPath}
        fill={`url(#${active ? `${defsId}-side-active` : `${defsId}-side`})`}
        stroke={strokeColor}
        strokeWidth={0.4}
        transform={`translate(0, ${depthOffset * 0.5})`}
        opacity={0.45}
      />

      {/* Main body */}
      <path
        d={panelPath}
        fill={`url(#${topGrad})`}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />

      {/* Inner curvature groove */}
      <path
        d={groove}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.30)" : "hsl(var(--accent) / 0.12)"}
        strokeWidth={0.6}
        strokeLinecap="round"
      />

      {/* Interlocking tabs — thicker strokes */}
      {showTabs && (
        <>
          <path d={tabL} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.7} />
          <path d={tabR} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.7} />
          <path d={toe} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.7} />
        </>
      )}

      {/* Join-point markers — small dots at lock locations */}
      {showJoins && showTabs && joins.map((j, i) => (
        <circle
          key={i}
          cx={j.cx}
          cy={j.cy}
          r={1.8}
          fill={active ? "hsl(var(--accent) / 0.50)" : "hsl(var(--accent) / 0.20)"}
          stroke="none"
        />
      ))}
    </g>
  );
}

/** Standalone preview — single panel */
export function GroundLockPanelPreview({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 110"
      className={cn("w-full h-auto", className)}
      aria-label="GroundLock horseshoe panel — single unit"
    >
      <PanelDefs id="gl" />
      <GroundLockPanelSVG active showTabs showJoins />
    </svg>
  );
}

export { PANEL_UP as PANEL_PATH, TOE_UP as TOE_CLIP };
