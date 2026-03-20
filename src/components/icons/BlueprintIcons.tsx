import { type SVGProps, useState } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; animated?: boolean };

const base = (props: IconProps, size = 48) => ({
  width: props.size || size,
  height: props.size || size,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
  className: cn("shrink-0", props.className),
});

/**
 * Wrapper that adds a CSS-based "draw-in" effect on hover.
 * Each path uses stroke-dasharray / dashoffset for the sketch reveal.
 */
function BlueprintWrap({
  children,
  props,
  label,
}: {
  children: React.ReactNode;
  props: IconProps;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <svg
      {...base(props)}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...props.style,
      }}
      className={cn(
        "shrink-0 blueprint-icon",
        hovered && "blueprint-icon--active",
        props.className,
      )}
    >
      {children}
    </svg>
  );
}

/** Arena — top-down rectangle with grid + centreline */
export function BPArena(props: IconProps) {
  return (
    <BlueprintWrap props={props} label="Arena">
      {/* Outer rectangle */}
      <rect x="4" y="10" width="40" height="28" rx="2" className="bp-line" />
      {/* Centre line */}
      <line x1="24" y1="10" x2="24" y2="38" className="bp-line" strokeDasharray="2 3" />
      {/* Grid lines horizontal */}
      <line x1="4" y1="18" x2="44" y2="18" className="bp-line" strokeDasharray="1 4" />
      <line x1="4" y1="24" x2="44" y2="24" className="bp-line" />
      <line x1="4" y1="30" x2="44" y2="30" className="bp-line" strokeDasharray="1 4" />
      {/* Corner marks */}
      <line x1="2" y1="10" x2="4" y2="10" className="bp-line" />
      <line x1="4" y1="8" x2="4" y2="10" className="bp-line" />
      <line x1="44" y1="8" x2="44" y2="10" className="bp-line" />
      <line x1="44" y1="10" x2="46" y2="10" className="bp-line" />
    </BlueprintWrap>
  );
}

/** Stables — front elevation barn outline */
export function BPStables(props: IconProps) {
  return (
    <BlueprintWrap props={props} label="Stables">
      {/* Roof */}
      <path d="M4 22 L24 6 L44 22" className="bp-line" />
      {/* Walls */}
      <rect x="8" y="22" width="32" height="20" className="bp-line" />
      {/* Door */}
      <rect x="18" y="30" width="12" height="12" className="bp-line" />
      {/* Door split */}
      <line x1="24" y1="30" x2="24" y2="42" className="bp-line" />
      {/* Window left */}
      <rect x="10" y="26" width="5" height="4" className="bp-line" />
      {/* Window right */}
      <rect x="33" y="26" width="5" height="4" className="bp-line" />
      {/* Roof peak detail */}
      <line x1="24" y1="6" x2="24" y2="14" className="bp-line" strokeDasharray="1 2" />
    </BlueprintWrap>
  );
}

/** Ground Systems — layered cross-section */
export function BPGroundSystems(props: IconProps) {
  return (
    <BlueprintWrap props={props} label="Ground Systems">
      {/* Surface */}
      <path d="M4 14 L44 14" className="bp-line" />
      {/* Layer 1 — grid panels */}
      <rect x="4" y="14" width="40" height="6" className="bp-line" />
      <line x1="12" y1="14" x2="12" y2="20" className="bp-line" />
      <line x1="20" y1="14" x2="20" y2="20" className="bp-line" />
      <line x1="28" y1="14" x2="28" y2="20" className="bp-line" />
      <line x1="36" y1="14" x2="36" y2="20" className="bp-line" />
      {/* Layer 2 — bedding */}
      <rect x="4" y="20" width="40" height="4" className="bp-line" strokeDasharray="2 2" />
      {/* Layer 3 — sub-base */}
      <rect x="4" y="24" width="40" height="6" className="bp-line" />
      {/* Aggregate dots */}
      <circle cx="10" cy="27" r="0.8" fill="currentColor" className="bp-line" stroke="none" />
      <circle cx="18" cy="27" r="0.8" fill="currentColor" className="bp-line" stroke="none" />
      <circle cx="26" cy="27" r="0.8" fill="currentColor" className="bp-line" stroke="none" />
      <circle cx="34" cy="27" r="0.8" fill="currentColor" className="bp-line" stroke="none" />
      {/* Layer 4 — geotextile */}
      <line x1="4" y1="30" x2="44" y2="30" className="bp-line" strokeDasharray="4 2" />
      {/* Subgrade */}
      <path d="M4 34 C12 32 20 35 28 33 C36 31 40 34 44 33" className="bp-line" />
      {/* Dimension line */}
      <line x1="46" y1="14" x2="46" y2="34" className="bp-line" strokeDasharray="1 2" />
    </BlueprintWrap>
  );
}

/** Infrastructure — laneway / pathway system */
export function BPInfrastructure(props: IconProps) {
  return (
    <BlueprintWrap props={props} label="Infrastructure">
      {/* Main laneway */}
      <path d="M4 24 L20 24 L20 10 L44 10" className="bp-line" />
      <path d="M4 28 L16 28 L16 14 L44 14" className="bp-line" />
      {/* Branch path */}
      <path d="M20 24 L20 38 L36 38" className="bp-line" />
      <path d="M16 28 L16 42 L36 42" className="bp-line" />
      {/* Fence posts */}
      <circle cx="8" cy="24" r="1" className="bp-line" />
      <circle cx="14" cy="24" r="1" className="bp-line" />
      <circle cx="20" cy="18" r="1" className="bp-line" />
      <circle cx="20" cy="32" r="1" className="bp-line" />
      <circle cx="32" cy="10" r="1" className="bp-line" />
      {/* Gate marker */}
      <line x1="28" y1="38" x2="28" y2="42" className="bp-line" />
    </BlueprintWrap>
  );
}

/** Design & Consultancy — compass + layout grid */
export function BPDesign(props: IconProps) {
  return (
    <BlueprintWrap props={props} label="Design">
      {/* Compass circle */}
      <circle cx="24" cy="24" r="16" className="bp-line" />
      <circle cx="24" cy="24" r="2" className="bp-line" />
      {/* Compass arms */}
      <line x1="24" y1="8" x2="24" y2="12" className="bp-line" />
      <line x1="24" y1="36" x2="24" y2="40" className="bp-line" />
      <line x1="8" y1="24" x2="12" y2="24" className="bp-line" />
      <line x1="36" y1="24" x2="40" y2="24" className="bp-line" />
      {/* Diagonal marks */}
      <line x1="12.7" y1="12.7" x2="15.5" y2="15.5" className="bp-line" />
      <line x1="32.5" y1="32.5" x2="35.3" y2="35.3" className="bp-line" />
      <line x1="35.3" y1="12.7" x2="32.5" y2="15.5" className="bp-line" />
      <line x1="15.5" y1="32.5" x2="12.7" y2="35.3" className="bp-line" />
      {/* N marker */}
      <text x="24" y="7" textAnchor="middle" fontSize="4" fill="currentColor" stroke="none" className="bp-line" fontFamily="monospace">N</text>
    </BlueprintWrap>
  );
}
