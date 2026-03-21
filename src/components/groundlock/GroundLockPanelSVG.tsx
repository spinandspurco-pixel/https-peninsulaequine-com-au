/**
 * GroundLock horseshoe panel — a single reusable SVG unit.
 *
 * 3D-engineered appearance with visible depth, curvature,
 * and thickness — reads as a physical cast product, not a flat diagram.
 */

import { cn } from "@/lib/utils";

/* ── Top face — horseshoe silhouette (viewed slightly from above) ── */
const TOP_FACE = [
  "M 74 95",
  "L 80 95",
  "L 80 87",
  "L 78 70",
  "L 76 52",
  "A 30 32 0 0 0 24 52",
  "L 22 70",
  "L 20 87",
  "L 20 95",
  "L 26 95",
  "L 26 87",
  "L 30 70",
  "L 32 54",
  "A 20 22 0 0 1 68 54",
  "L 70 70",
  "L 74 87",
  "Z",
].join(" ");

/* ── Side/depth face — extruded bottom edge for 3D thickness ── */
const DEPTH = 8;
const SIDE_LEFT = `M 20 87 L 20 95 L 20 ${95 + DEPTH} L 14 ${88 + DEPTH} L 14 88 L 20 88 L 20 87 Z`;
const SIDE_RIGHT = `M 80 87 L 80 95 L 80 ${95 + DEPTH} L 86 ${88 + DEPTH} L 86 88 L 80 88 L 80 87 Z`;
const SIDE_BOTTOM = `M 20 95 L 26 95 L 26 ${95 + DEPTH} L 20 ${95 + DEPTH} Z`;
const SIDE_BOTTOM_R = `M 74 95 L 80 95 L 80 ${95 + DEPTH} L 74 ${95 + DEPTH} Z`;
const SIDE_OUTER = [
  `M 20 95 L 20 ${95 + DEPTH}`,
  `L 22 ${70 + DEPTH} L 24 ${52 + DEPTH}`,
  `A 30 32 0 0 1 76 ${52 + DEPTH}`,
  `L 78 ${70 + DEPTH} L 80 ${95 + DEPTH}`,
  "L 80 95",
  "L 78 70 L 76 52",
  "A 30 32 0 0 0 24 52",
  "L 22 70 L 20 95 Z",
].join(" ");

/* ── Interlocking tabs ─── */
const TAB_LEFT = "M 20 82 L 14 82 L 14 88 L 20 88 Z";
const TAB_RIGHT = "M 80 82 L 86 82 L 86 88 L 80 88 Z";
const TOE_CLIP = "M 46 24 L 50 16 L 54 24 Z";

/* ── Inner groove lines for curvature detail ── */
const INNER_GROOVE = [
  "M 34 56 A 16 18 0 0 1 66 56",
].join(" ");
const OUTER_GROOVE = [
  "M 25 54 A 27 29 0 0 1 75 54",
].join(" ");

/* ── Shared gradient defs ───── */
export function PanelDefs({ id = "gl" }: { id?: string }) {
  return (
    <defs>
      {/* Top face active */}
      <linearGradient id={`${id}-top-active`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.30" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.08" />
      </linearGradient>
      {/* Top face idle */}
      <linearGradient id={`${id}-top-idle`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.14" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0.08" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.03" />
      </linearGradient>
      {/* Side depth — darker */}
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.12" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id={`${id}-side-active`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.6" />
      </linearGradient>
      {/* Top edge highlight — beveled look */}
      <linearGradient id={`${id}-bevel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
        <stop offset="30%" stopColor="hsl(var(--accent))" stopOpacity="0.06" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
      </linearGradient>
      {/* Drop shadow */}
      <filter id={`${id}-shadow`} x="-20%" y="-10%" width="150%" height="150%">
        <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="hsl(var(--background))" floodOpacity="0.7" />
      </filter>
      {/* Active glow */}
      <filter id={`${id}-glow`} x="-25%" y="-20%" width="150%" height="150%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
        <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.12" />
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
  rotation?: number;
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
  rotation = 0,
  x = 0,
  y = 0,
  scale = 1,
  opacity = 1,
  active = false,
  showTabs = false,
  defsId = "gl",
}: PanelProps) {
  const strokeColor = active ? "hsl(var(--accent) / 0.55)" : "hsl(var(--accent) / 0.18)";
  const strokeW = active ? 1.0 : 0.6;
  const sideGrad = active ? `${defsId}-side-active` : `${defsId}-side`;
  const topGrad = active ? `${defsId}-top-active` : `${defsId}-top-idle`;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, 50, 60) scale(${scale})`}
      opacity={opacity}
      className={cn(className)}
    >
      {/* Shadow beneath */}
      <path
        d={TOP_FACE}
        fill="hsl(var(--background))"
        opacity={0.35}
        transform="translate(1.5, 2.5)"
        filter={`url(#${defsId}-shadow)`}
      />

      {/* Side depth — extruded walls for 3D thickness */}
      <path d={SIDE_OUTER} fill={`url(#${sideGrad})`} stroke={strokeColor} strokeWidth={0.3} strokeLinejoin="round" />
      <path d={SIDE_LEFT} fill={`url(#${sideGrad})`} stroke={strokeColor} strokeWidth={0.3} />
      <path d={SIDE_RIGHT} fill={`url(#${sideGrad})`} stroke={strokeColor} strokeWidth={0.3} />
      <path d={SIDE_BOTTOM} fill={`url(#${sideGrad})`} stroke={strokeColor} strokeWidth={0.3} />
      <path d={SIDE_BOTTOM_R} fill={`url(#${sideGrad})`} stroke={strokeColor} strokeWidth={0.3} />

      {/* Top face — main horseshoe body */}
      <path
        d={TOP_FACE}
        fill={`url(#${topGrad})`}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        filter={active ? `url(#${defsId}-glow)` : undefined}
      />

      {/* Bevel highlight on top face */}
      <path
        d={TOP_FACE}
        fill={`url(#${defsId}-bevel)`}
        stroke="none"
        transform="translate(0, -0.4) scale(0.97)"
        style={{ transformOrigin: "50px 60px" }}
      />

      {/* Inner curvature grooves — show the horseshoe curve */}
      <path
        d={INNER_GROOVE}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.25)" : "hsl(var(--accent) / 0.08)"}
        strokeWidth={0.5}
        strokeLinecap="round"
      />
      <path
        d={OUTER_GROOVE}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.18)" : "hsl(var(--accent) / 0.06)"}
        strokeWidth={0.4}
        strokeLinecap="round"
      />

      {/* Interlocking tabs + toe clip */}
      {showTabs && (
        <>
          <path d={TAB_LEFT} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.5} />
          <path d={TAB_RIGHT} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.5} />
          <path d={TOE_CLIP} fill={`url(#${topGrad})`} stroke={strokeColor} strokeWidth={0.5} />
        </>
      )}

      {/* Inner edge detail line for depth */}
      <path
        d={TOP_FACE}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.12)" : "hsl(var(--accent) / 0.04)"}
        strokeWidth={0.3}
        transform="translate(0, -0.3) scale(0.95)"
        style={{ transformOrigin: "50px 60px" }}
      />
    </g>
  );
}

/** Standalone panel preview */
export function GroundLockPanelPreview({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={cn("w-full h-auto", className)}
      aria-label="GroundLock horseshoe panel — single unit"
    >
      <PanelDefs id="gl" />
      <GroundLockPanelSVG active showTabs />
    </svg>
  );
}

export { TOP_FACE as PANEL_PATH, TOE_CLIP };
