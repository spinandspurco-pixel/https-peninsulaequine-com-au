import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BlueprintLineOverlayProps {
  variant?: "barn" | "detail" | "dimensions";
  color?: "light" | "dark";
  className?: string;
}

export function BlueprintLineOverlay({
  variant = "barn",
  color = "dark",
  className = "",
}: BlueprintLineOverlayProps) {
  const ref = useRef<SVGSVGElement>(null);
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
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const strokeColor =
    color === "light"
      ? "hsl(42 30% 92% / 0.12)"
      : "hsl(30 15% 18% / 0.06)";

  const textColor =
    color === "light"
      ? "hsl(42 30% 92% / 0.15)"
      : "hsl(30 15% 18% / 0.08)";

  const lineStyle = (delay: number = 0): React.CSSProperties => ({
    strokeDasharray: 1000,
    strokeDashoffset: isVisible ? 0 : 1000,
    transition: prefersReducedMotion
      ? "none"
      : `stroke-dashoffset 2.5s ease-out ${delay}ms`,
  });

  const textStyle = (delay: number = 0): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(4px)",
    transition: prefersReducedMotion
      ? "none"
      : `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
  });

  return (
    <svg
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {variant === "barn" && (
        <>
          {/* Horizontal structure lines */}
          <line x1="100" y1="200" x2="1100" y2="200" stroke={strokeColor} strokeWidth="1" style={lineStyle(0)} />
          <line x1="100" y1="600" x2="1100" y2="600" stroke={strokeColor} strokeWidth="1" style={lineStyle(200)} />
          
          {/* Vertical posts */}
          <line x1="200" y1="150" x2="200" y2="650" stroke={strokeColor} strokeWidth="1" style={lineStyle(400)} />
          <line x1="600" y1="100" x2="600" y2="650" stroke={strokeColor} strokeWidth="1" style={lineStyle(600)} />
          <line x1="1000" y1="150" x2="1000" y2="650" stroke={strokeColor} strokeWidth="1" style={lineStyle(800)} />
          
          {/* Roof pitch lines */}
          <line x1="200" y1="200" x2="600" y2="100" stroke={strokeColor} strokeWidth="0.75" style={lineStyle(1000)} />
          <line x1="1000" y1="200" x2="600" y2="100" stroke={strokeColor} strokeWidth="0.75" style={lineStyle(1200)} />
          
          {/* Dimension lines */}
          <line x1="200" y1="680" x2="600" y2="680" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(1400)} />
          <line x1="600" y1="680" x2="1000" y2="680" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(1500)} />
          
          {/* Dimension markers */}
          <line x1="200" y1="670" x2="200" y2="690" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(1400)} />
          <line x1="600" y1="670" x2="600" y2="690" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(1500)} />
          <line x1="1000" y1="670" x2="1000" y2="690" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(1500)} />

          {/* Dimension text */}
          <text x="400" y="710" textAnchor="middle" fill={textColor} fontSize="14" fontFamily="monospace" style={textStyle(2000)}>
            12'-0"
          </text>
          <text x="800" y="710" textAnchor="middle" fill={textColor} fontSize="14" fontFamily="monospace" style={textStyle(2200)}>
            12'-0"
          </text>
          <text x="600" y="80" textAnchor="middle" fill={textColor} fontSize="12" fontFamily="monospace" style={textStyle(2400)}>
            RIDGE
          </text>
        </>
      )}

      {variant === "detail" && (
        <>
          {/* Door frame outline */}
          <rect x="350" y="150" width="500" height="500" fill="none" stroke={strokeColor} strokeWidth="1" style={lineStyle(0)} />
          <rect x="380" y="180" width="440" height="440" fill="none" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(300)} />
          
          {/* Hardware detail lines */}
          <line x1="380" y1="400" x2="430" y2="400" stroke={strokeColor} strokeWidth="1" style={lineStyle(600)} />
          <circle cx="410" cy="400" r="8" fill="none" stroke={strokeColor} strokeWidth="0.75" style={lineStyle(800)} />
          
          {/* Hinge details */}
          <line x1="350" y1="280" x2="380" y2="280" stroke={strokeColor} strokeWidth="1" style={lineStyle(1000)} />
          <line x1="350" y1="520" x2="380" y2="520" stroke={strokeColor} strokeWidth="1" style={lineStyle(1200)} />
          
          {/* Dimension annotations */}
          <text x="600" y="690" textAnchor="middle" fill={textColor} fontSize="13" fontFamily="monospace" style={textStyle(1800)}>
            3'-6" × 6'-8"
          </text>
          <text x="600" y="130" textAnchor="middle" fill={textColor} fontSize="11" fontFamily="monospace" style={textStyle(2000)}>
            DOOR FRAME DETAIL
          </text>
        </>
      )}

      {variant === "dimensions" && (
        <>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`h${i}`} x1="50" y1={160 + i * 130} x2="1150" y2={160 + i * 130} stroke={strokeColor} strokeWidth="0.5" style={lineStyle(i * 150)} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={`v${i}`} x1={100 + i * 200} y1="130" x2={100 + i * 200} y2="700" stroke={strokeColor} strokeWidth="0.5" style={lineStyle(i * 120)} />
          ))}
          
          {/* Grid labels */}
          {["A", "B", "C", "D", "E", "F"].map((label, i) => (
            <text key={label} x={100 + i * 200} y="120" textAnchor="middle" fill={textColor} fontSize="12" fontFamily="monospace" style={textStyle(1200 + i * 100)}>
              {label}
            </text>
          ))}
          {["1", "2", "3", "4", "5"].map((label, i) => (
            <text key={label} x="35" y={165 + i * 130} textAnchor="middle" fill={textColor} fontSize="12" fontFamily="monospace" style={textStyle(1200 + i * 100)}>
              {label}
            </text>
          ))}
          
          {/* Scale notation */}
          <text x="1100" y="750" textAnchor="end" fill={textColor} fontSize="10" fontFamily="monospace" style={textStyle(2200)}>
            SCALE: 1/4" = 1'-0"
          </text>
        </>
      )}
    </svg>
  );
}
