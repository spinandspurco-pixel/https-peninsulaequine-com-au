/**
 * GroundLock™ Interlocking Panel — Canonical Geometry
 *
 * True horseshoe (U-shaped) panel with:
 * - Clear negative space in the open end
 * - Crisp, engineering-grade edge definition
 * - Consistent wall thickness
 * - Flat stable base geometry
 * - Visible interlocking tab logic
 *
 * This file is the SINGLE SOURCE OF TRUTH for panel geometry.
 */

import { cn } from "@/lib/utils";

/*
 * Geometry — precision horseshoe
 *
 * Centre axis:  x = 50
 * Arc centre:   y = 48 (raised slightly for better negative-space read)
 * Outer edges:  x = 18, x = 82  (width 64)   → outer arc rx/ry = 32
 * Inner edges:  x = 26, x = 74  (width 48)   → inner arc rx/ry = 24
 * Wall thickness: 8 px uniform
 * Base (open end): y = 92 (up) / y = 18 (down)
 * Arc sweep top:  y = 16 (up) / y = 94 (down)
 */

/* ── Panel path — horseshoe open at bottom ── */
const PANEL_UP = [
  "M 18 92",       // outer-left base
  "L 18 48",       // up outer-left wall
  "A 32 32 0 0 1 82 48", // outer arc (top of U)
  "L 82 92",       // down outer-right wall
  "L 74 92",       // step inward (right base)
  "L 74 48",       // up inner-right wall
  "A 24 24 0 0 0 26 48", // inner arc
  "L 26 92",       // down inner-left wall
  "Z",
].join(" ");

/* ── Panel path — horseshoe open at top (inverted) ── */
const PANEL_DOWN = [
  "M 18 18",       // outer-left base
  "L 18 62",       // down outer-left wall
  "A 32 32 0 0 0 82 62", // outer arc (bottom of inverted U)
  "L 82 18",       // up outer-right wall
  "L 74 18",       // step inward (right base)
  "L 74 62",       // down inner-right wall
  "A 24 24 0 0 1 26 62", // inner arc
  "L 26 18",       // up inner-left wall
  "Z",
].join(" ");

/* ── Interlocking tabs — crisp rectangular geometry ── */
const TAB_UP_LEFT   = "M 18 74 L 10 74 L 10 84 L 18 84 Z";
const TAB_UP_RIGHT  = "M 82 74 L 90 74 L 90 84 L 82 84 Z";
const TAB_DOWN_LEFT  = "M 18 26 L 10 26 L 10 36 L 18 36 Z";
const TAB_DOWN_RIGHT = "M 82 26 L 90 26 L 90 36 L 82 36 Z";

/* ── Crown interlock — triangular key ── */
const TOE_UP   = "M 43 26 L 50 14 L 57 26 Z";
const TOE_DOWN = "M 43 84 L 50 96 L 57 84 Z";

/* ── Join-point markers ── */
const JOIN_UP   = [{ cx: 10, cy: 79 }, { cx: 90, cy: 79 }, { cx: 50, cy: 16 }];
const JOIN_DOWN = [{ cx: 10, cy: 31 }, { cx: 90, cy: 31 }, { cx: 50, cy: 94 }];

/* ── Inner groove — traces inner arc ── */
const GROOVE_UP   = "M 26 48 A 24 24 0 0 1 74 48";
const GROOVE_DOWN = "M 26 62 A 24 24 0 0 0 74 62";

/* ── Shared gradient defs ── */
export function PanelDefs({ id = "gl" }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-top-active`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
      </linearGradient>
      <linearGradient id={`${id}-top-idle`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.14" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id={`${id}-side-active`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.26" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.5" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-15%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="hsl(var(--background))" floodOpacity="0.5" />
      </filter>
    </defs>
  );
}

interface PanelProps {
  className?: string;
  direction?: "up" | "down";
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  active?: boolean;
  showTabs?: boolean;
  defsId?: string;
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

  const strokeColor = active ? "hsl(var(--accent) / 0.65)" : "hsl(var(--accent) / 0.25)";
  const strokeW = active ? 1.4 : 0.9;
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
        strokeLinejoin="miter"
        strokeLinecap="square"
      />

      {/* Inner curvature groove */}
      <path
        d={groove}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.30)" : "hsl(var(--accent) / 0.12)"}
        strokeWidth={0.7}
        strokeLinecap="square"
      />

      {/* Interlocking tabs */}
      {showTabs && (
        <>
          <path d={tabL} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.8} strokeLinejoin="miter" />
          <path d={tabR} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.8} strokeLinejoin="miter" />
          <path d={toe} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.8} strokeLinejoin="miter" />
        </>
      )}

      {/* Join-point markers */}
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

export { PANEL_UP as PANEL_PATH, TOE_UP as TOE_CLIP };
