import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BlueprintDividerProps {
  className?: string;
  variant?: "structural" | "elevation" | "grid";
}

/**
 * A thin horizontal architectural strip between sections.
 * SVG lines draw in as the user scrolls past, creating
 * a blueprint section-divider effect.
 */
export function BlueprintDivider({
  className = "",
  variant = "structural",
}: BlueprintDividerProps) {
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const strokeColor = "hsl(30 15% 40% / 0.12)";
  const textColor = "hsl(30 15% 40% / 0.18)";

  const lineStyle = (delay: number = 0): React.CSSProperties => ({
    strokeDasharray: 2000,
    strokeDashoffset: isVisible ? 0 : 2000,
    transition: prefersReducedMotion
      ? "none"
      : `stroke-dashoffset 1.8s ease-out ${delay}ms`,
  });

  const textStyle = (delay: number = 0): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transition: prefersReducedMotion
      ? "none"
      : `opacity 0.6s ease-out ${delay}ms`,
  });

  return (
    <div
      ref={ref}
      className={`relative w-full h-16 sm:h-20 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1400 80"
        preserveAspectRatio="none"
      >
        {variant === "structural" && (
          <>
            {/* Main horizontal beam */}
            <line x1="0" y1="40" x2="1400" y2="40" stroke={strokeColor} strokeWidth="0.75" style={lineStyle(0)} />
            
            {/* Vertical tick marks at intervals */}
            {[100, 300, 500, 700, 900, 1100, 1300].map((x, i) => (
              <line key={x} x1={x} y1="30" x2={x} y2="50" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(200 + i * 80)} />
            ))}
            
            {/* Dimension markers */}
            <line x1="100" y1="60" x2="500" y2="60" stroke={strokeColor} strokeWidth="0.4" style={lineStyle(800)} />
            <line x1="900" y1="60" x2="1300" y2="60" stroke={strokeColor} strokeWidth="0.4" style={lineStyle(900)} />
            
            {/* Small dimension text */}
            <text x="300" y="72" textAnchor="middle" fill={textColor} fontSize="8" fontFamily="monospace" style={textStyle(1200)}>
              24'-0"
            </text>
            <text x="1100" y="72" textAnchor="middle" fill={textColor} fontSize="8" fontFamily="monospace" style={textStyle(1400)}>
              24'-0"
            </text>
          </>
        )}

        {variant === "elevation" && (
          <>
            {/* Double line */}
            <line x1="0" y1="35" x2="1400" y2="35" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(0)} />
            <line x1="0" y1="45" x2="1400" y2="45" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(150)} />
            
            {/* Cross-bracing marks */}
            {[200, 600, 1000].map((x, i) => (
              <g key={x}>
                <line x1={x} y1="20" x2={x + 50} y2="60" stroke={strokeColor} strokeWidth="0.4" style={lineStyle(400 + i * 150)} />
                <line x1={x + 50} y1="20" x2={x} y2="60" stroke={strokeColor} strokeWidth="0.4" style={lineStyle(500 + i * 150)} />
              </g>
            ))}
            
            {/* Label */}
            <text x="700" y="16" textAnchor="middle" fill={textColor} fontSize="7" fontFamily="monospace" style={textStyle(1200)}>
              SECTION A-A
            </text>
          </>
        )}

        {variant === "grid" && (
          <>
            {/* Grid baseline */}
            <line x1="50" y1="40" x2="1350" y2="40" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(0)} />
            
            {/* Grid columns */}
            {Array.from({ length: 14 }, (_, i) => 50 + i * 100).map((x, i) => (
              <line key={x} x1={x} y1="25" x2={x} y2="55" stroke={strokeColor} strokeWidth="0.3" style={lineStyle(100 + i * 60)} />
            ))}
            
            {/* Column labels */}
            {["A", "B", "C", "D", "E", "F", "G"].map((label, i) => (
              <text key={label} x={50 + i * 200} y="18" textAnchor="middle" fill={textColor} fontSize="7" fontFamily="monospace" style={textStyle(1000 + i * 80)}>
                {label}
              </text>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
