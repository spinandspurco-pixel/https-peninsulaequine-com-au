import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface RopeDividerProps {
  className?: string;
  /** Accent color variant */
  variant?: "gold" | "muted";
}

/**
 * RopeDivider — an elegant rope-loop motif section divider.
 * SVG draws in on scroll. Used sparingly (1–2× per page max).
 */
export function RopeDivider({ className, variant = "gold" }: RopeDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setIsVisible(true); obs.unobserve(el); }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [prefersReducedMotion]);

  const stroke = variant === "gold"
    ? "hsl(var(--accent) / 0.35)"
    : "hsl(var(--muted-foreground) / 0.2)";
  const strokeFaint = variant === "gold"
    ? "hsl(var(--accent) / 0.18)"
    : "hsl(var(--muted-foreground) / 0.1)";

  const draw = (delay: number, len: number): React.CSSProperties => ({
    strokeDasharray: len,
    strokeDashoffset: isVisible ? 0 : len,
    transition: prefersReducedMotion
      ? "none"
      : `stroke-dashoffset 1.8s cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`,
  });

  return (
    <div
      ref={ref}
      className={cn("relative w-full flex items-center justify-center py-4", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 40"
        className="w-48 sm:w-64 h-10"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Left line */}
        <line x1="0" y1="20" x2="120" y2="20" stroke={strokeFaint} strokeWidth="1" style={draw(0, 120)} />
        {/* Right line */}
        <line x1="280" y1="20" x2="400" y2="20" stroke={strokeFaint} strokeWidth="1" style={draw(100, 120)} />

        {/* Rope loop — a simple elegant oval twist */}
        <ellipse cx="200" cy="20" rx="28" ry="12" stroke={stroke} strokeWidth="1.5" style={draw(200, 130)} />
        {/* Inner twist cross */}
        <line x1="185" y1="14" x2="215" y2="26" stroke={stroke} strokeWidth="0.8" style={draw(400, 42)} />
        <line x1="215" y1="14" x2="185" y2="26" stroke={stroke} strokeWidth="0.8" style={draw(500, 42)} />

        {/* Small knot dots */}
        <circle cx="172" cy="20" r="2" stroke={stroke} strokeWidth="1" fill="none" style={draw(600, 14)} />
        <circle cx="228" cy="20" r="2" stroke={stroke} strokeWidth="1" fill="none" style={draw(650, 14)} />

        {/* Connecting arcs from lines to loop */}
        <path d="M 120,20 Q 145,8 172,20" stroke={strokeFaint} strokeWidth="0.8" fill="none" style={draw(150, 60)} />
        <path d="M 228,20 Q 255,32 280,20" stroke={strokeFaint} strokeWidth="0.8" fill="none" style={draw(250, 60)} />
      </svg>
    </div>
  );
}
