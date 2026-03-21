/**
 * GroundLock horseshoe panel — a single reusable SVG unit.
 *
 * The panel silhouette is an unmistakable horseshoe / U-shape:
 *   - wide open base
 *   - curved top
 *   - visible thickness on inner and outer walls
 *   - interlocking tabs on outer edges
 */

import { cn } from "@/lib/utils";

/* ── The horseshoe path — true farrier horseshoe silhouette ── */
const PANEL_PATH = [
  // Start at right heel calk (bottom-right)
  "M 74 105",
  // Right heel calk notch
  "L 74 97",
  "L 80 97",
  "L 80 105",
  "L 80 97",
  // Outer right leg — slight taper inward toward crown
  "L 78 80",
  "L 76 60",
  // Wide crown arc (top-right → top-left)
  "A 30 32 0 0 0 24 60",
  // Outer left leg — tapers outward toward heel
  "L 22 80",
  "L 20 97",
  // Left heel calk notch
  "L 20 105",
  "L 26 105",
  "L 26 97",
  // Inner left leg (rises back up)
  "L 30 80",
  "L 32 62",
  // Inner crown arc
  "A 20 22 0 0 1 68 62",
  // Inner right leg (descends)
  "L 70 80",
  "L 74 97",
  // Close back at right heel
  "L 74 105",
  "Z",
].join(" ");

/* ── Interlocking tab paths (heel calks + toe clip) ─── */
const TAB_LEFT = "M 20 88 L 14 88 L 14 97 L 20 97 Z";
const TAB_RIGHT = "M 80 88 L 86 88 L 86 97 L 80 97 Z";
const TOE_CLIP = "M 46 28 L 50 20 L 54 28 Z";

/* ── Shared gradient defs (rendered once per SVG) ───── */
export function PanelDefs({ id = "gl" }: { id?: string }) {
  return (
    <defs>
      {/* Active panel body */}
      <linearGradient id={`${id}-panel-active`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.24" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
      </linearGradient>
      {/* Idle panel body */}
      <linearGradient id={`${id}-panel-idle`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.10" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.04" />
      </linearGradient>
      {/* Top bevel */}
      <linearGradient id={`${id}-bevel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.16" />
        <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0" />
      </linearGradient>
      {/* Drop shadow */}
      <filter id={`${id}-shadow`} x="-15%" y="-15%" width="140%" height="140%">
        <feDropShadow dx="1.5" dy="2" stdDeviation="3" floodColor="hsl(var(--background))" floodOpacity="0.65" />
      </filter>
      {/* Active glow */}
      <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
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
  const strokeColor = active ? "hsl(var(--accent) / 0.5)" : "hsl(var(--accent) / 0.18)";
  const strokeW = active ? 1.2 : 0.7;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, 50, 65) scale(${scale})`}
      opacity={opacity}
      className={cn("transition-opacity duration-300", className)}
    >
      {/* Shadow */}
      <path
        d={PANEL_PATH}
        fill="hsl(var(--background))"
        opacity={0.4}
        transform="translate(1.2, 1.8)"
        filter={`url(#${defsId}-shadow)`}
      />

      {/* Body */}
      <path
        d={PANEL_PATH}
        fill={`url(#${defsId}-panel-${active ? "active" : "idle"})`}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        filter={active ? `url(#${defsId}-glow)` : undefined}
      />

      {/* Interlocking tabs + toe clip */}
      {showTabs && (
        <>
          <path d={TAB_LEFT} fill={`url(#${defsId}-panel-${active ? "active" : "idle"})`} stroke={strokeColor} strokeWidth={0.5} />
          <path d={TAB_RIGHT} fill={`url(#${defsId}-panel-${active ? "active" : "idle"})`} stroke={strokeColor} strokeWidth={0.5} />
          <path d={TOE_CLIP} fill={`url(#${defsId}-panel-${active ? "active" : "idle"})`} stroke={strokeColor} strokeWidth={0.5} />
        </>
      )}

      {/* Bevel highlight */}
      <path
        d={PANEL_PATH}
        fill={`url(#${defsId}-bevel)`}
        stroke="none"
        transform="translate(0, -0.5) scale(0.97)"
        style={{ transformOrigin: "50px 65px" }}
      />

      {/* Inner edge detail */}
      <path
        d={PANEL_PATH}
        fill="none"
        stroke={active ? "hsl(var(--accent) / 0.18)" : "hsl(var(--accent) / 0.05)"}
        strokeWidth={0.35}
        transform="translate(0, -0.3) scale(0.96)"
        style={{ transformOrigin: "50px 65px" }}
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

export { PANEL_PATH, TOE_CLIP };
