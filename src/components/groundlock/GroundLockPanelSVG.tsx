/**
 * GroundLock horseshoe panel — a single reusable SVG unit.
 *
 * Premium engineered appearance with:
 *   - multi-layer depth (shadow, body, highlight, edge bevel)
 *   - material tone variation via gradient fills
 *   - clean inner/outer curves
 */

import { cn } from "@/lib/utils";

/* ── The horseshoe path (open at bottom) ──────────────── */
const PANEL_PATH = [
  "M 10 95",
  "L 10 30",
  "A 40 40 0 1 1 90 30",
  "L 90 95",
  "A 8 8 0 0 1 74 95",
  "L 74 30",
  "A 24 24 0 1 0 26 30",
  "L 26 95",
  "A 8 8 0 0 1 10 95",
  "Z",
].join(" ");

/* ── Shared gradient defs (rendered once per SVG) ─────── */
export function PanelDefs({ id = "gl" }: { id?: string }) {
  return (
    <defs>
      {/* Active panel body gradient — slight warm-to-cool shift */}
      <linearGradient id={`${id}-panel-active`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
      </linearGradient>
      {/* Inactive panel body */}
      <linearGradient id={`${id}-panel-idle`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.09" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.04" />
      </linearGradient>
      {/* Top bevel highlight */}
      <linearGradient id={`${id}-bevel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.18" />
        <stop offset="40%" stopColor="hsl(var(--accent))" stopOpacity="0" />
      </linearGradient>
      {/* Soft drop shadow filter */}
      <filter id={`${id}-shadow`} x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" floodColor="hsl(var(--background))" floodOpacity="0.55" />
      </filter>
      {/* Subtle inner glow for active */}
      <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
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
  fill?: string;
  stroke?: string;
  opacity?: number;
  active?: boolean;
  /** ID prefix for gradient refs — must match a <PanelDefs id> */
  defsId?: string;
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
  defsId = "gl",
}: PanelProps) {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, 50, 60) scale(${scale})`}
      opacity={opacity}
      className={cn("transition-opacity duration-300", className)}
    >
      {/* Drop shadow layer */}
      <path
        d={PANEL_PATH}
        fill="hsl(var(--background))"
        opacity={0.5}
        transform="translate(1.5, 2)"
        filter={`url(#${defsId}-shadow)`}
      />

      {/* Main panel body */}
      <path
        d={PANEL_PATH}
        fill={fill ?? `url(#${defsId}-panel-${active ? "active" : "idle"})`}
        stroke={stroke ?? (active ? "hsl(var(--accent) / 0.55)" : "hsl(var(--accent) / 0.2)")}
        strokeWidth={active ? 1.4 : 0.9}
        filter={active ? `url(#${defsId}-glow)` : undefined}
      />

      {/* Top bevel highlight — gives thickness illusion */}
      <path
        d={PANEL_PATH}
        fill={`url(#${defsId}-bevel)`}
        stroke="none"
        transform="translate(0, -0.6) scale(0.97)"
        style={{ transformOrigin: "50px 60px" }}
      />

      {/* Inner edge line — secondary weight */}
      <path
        d={PANEL_PATH}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.22)" : "hsl(var(--accent) / 0.06)"}
        strokeWidth={0.4}
        transform="translate(0, -0.4) scale(0.96)"
        style={{ transformOrigin: "50px 60px" }}
      />

      {/* Outer edge bevel — top-left light catch */}
      <path
        d={PANEL_PATH}
        fill="none"
        stroke="hsl(var(--foreground) / 0.04)"
        strokeWidth={0.3}
        transform="translate(-0.3, -0.3) scale(1.005)"
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
      <GroundLockPanelSVG active />
    </svg>
  );
}

export { PANEL_PATH };
