import peRopeRing from "@/assets/pe-rope-ring.png";
import logoPeMark from "@/assets/logo-pe-mark.png";

interface RopeEmblemProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** 0–1 opacity for the whole emblem */
  opacity?: number;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const logoSizes = {
  sm: "w-7 h-7",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

/**
 * Composite emblem: PE mark centered inside the rope ring.
 * Uses mix-blend-mode for a natural blended look on any background.
 */
export function RopeEmblem({ size = "md", className = "", opacity = 0.3 }: RopeEmblemProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center animate-rope-drift ${sizes[size]} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Rope ring */}
      <img
        src={peRopeRing}
        alt=""
        className="absolute inset-0 w-full h-full object-contain mix-blend-luminosity"
        loading="lazy"
        draggable={false}
      />
      {/* PE mark centered */}
      <img
        src={logoPeMark}
        alt=""
        className={`relative ${logoSizes[size]} object-contain brightness-0 invert mix-blend-overlay`}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}
