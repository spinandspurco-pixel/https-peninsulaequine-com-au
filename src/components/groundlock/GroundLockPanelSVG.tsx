/**
 * GroundLock™ Interlocking Panel System
 *
 * True alternating-direction horseshoe panels that mechanically
 * interlock: Panel A faces up, Panel B faces down and nests into A.
 * The "U" opening of one panel receives the crown of the opposing panel.
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

/* ── Interlocking tabs — mechanical join features ── */
const TAB_UP_LEFT = "M 20 78 L 14 78 L 14 84 L 20 84 Z";
const TAB_UP_RIGHT = "M 80 78 L 86 78 L 86 84 L 80 84 Z";
const TAB_DOWN_LEFT = "M 20 26 L 14 26 L 14 32 L 20 32 Z";
const TAB_DOWN_RIGHT = "M 80 26 L 86 26 L 86 32 L 80 32 Z";
const TOE_UP = "M 46 30 L 50 22 L 54 30 Z";
const TOE_DOWN = "M 46 80 L 50 88 L 54 80 Z";

/* ── Inner grooves for curvature detail ── */
const GROOVE_UP = "M 30 58 A 18 20 0 0 1 70 58";
const GROOVE_DOWN = "M 30 52 A 18 20 0 0 0 70 52";

/* ── Shared gradient defs ── */
export function PanelDefs({ id = "gl" }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-top-active`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.30" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id={`${id}-top-idle`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.14" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.08" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.03" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.12" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id={`${id}-side-active`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id={`${id}-bevel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
        <stop offset="30%" stopColor="hsl(var(--accent))" stopOpacity="0.06" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-10%" width="150%" height="150%">
        <feDropShadow dx="1.5" dy="2.5" stdDeviation="3.5" floodColor="hsl(var(--background))" floodOpacity="0.6" />
      </filter>
      <filter id={`${id}-glow`} x="-25%" y="-20%" width="150%" height="150%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
        <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.10" />
        <feComposite in2="blur" operator="in" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
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
  defsId = "gl",
}: PanelProps) {
  const isUp = direction === "up";
  const panelPath = isUp ? PANEL_UP : PANEL_DOWN;
  const groove = isUp ? GROOVE_UP : GROOVE_DOWN;
  const tabL = isUp ? TAB_UP_LEFT : TAB_DOWN_LEFT;
  const tabR = isUp ? TAB_UP_RIGHT : TAB_DOWN_RIGHT;
  const toe = isUp ? TOE_UP : TOE_DOWN;

  const strokeColor = active ? "hsl(var(--accent) / 0.55)" : "hsl(var(--accent) / 0.18)";
  const strokeW = active ? 0.9 : 0.55;
  const topGrad = active ? `${defsId}-top-active` : `${defsId}-top-idle`;

  /* Depth extrusion — offset shadow of the panel body */
  const depthOffset = isUp ? 5 : -5;

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
        opacity={0.3}
        transform={`translate(1, ${isUp ? 2 : -2})`}
        filter={`url(#${defsId}-shadow)`}
      />

      {/* Depth extrusion */}
      <path
        d={panelPath}
        fill={`url(#${active ? `${defsId}-side-active` : `${defsId}-side`})`}
        stroke={strokeColor}
        strokeWidth={0.3}
        transform={`translate(0, ${depthOffset * 0.6})`}
        opacity={0.5}
      />

      {/* Main body */}
      <path
        d={panelPath}
        fill={`url(#${topGrad})`}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        filter={active ? `url(#${defsId}-glow)` : undefined}
      />

      {/* Bevel highlight */}
      <path
        d={panelPath}
        fill={`url(#${defsId}-bevel)`}
        stroke="none"
        transform={`translate(0, ${isUp ? -0.3 : 0.3}) scale(0.97)`}
        style={{ transformOrigin: "50px 55px" }}
      />

      {/* Inner curvature groove */}
      <path
        d={groove}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.22)" : "hsl(var(--accent) / 0.07)"}
        strokeWidth={0.5}
        strokeLinecap="round"
      />

      {/* Interlocking tabs */}
      {showTabs && (
        <>
          <path d={tabL} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.5} />
          <path d={tabR} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.5} />
          <path d={toe} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.5} />
        </>
      )}

      {/* Inner edge detail */}
      <path
        d={panelPath}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.10)" : "hsl(var(--accent) / 0.03)"}
        strokeWidth={0.3}
        transform={`translate(0, ${isUp ? -0.2 : 0.2}) scale(0.95)`}
        style={{ transformOrigin: "50px 55px" }}
      />
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
      <GroundLockPanelSVG active showTabs />
    </svg>
  );
}

export { PANEL_UP as PANEL_PATH, TOE_UP as TOE_CLIP };
