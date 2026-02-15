import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BlueprintLineOverlayProps {
  variant?: "barn" | "detail" | "dimensions" | "front-elevation";
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Scroll-based parallax for depth
  const [driftY, setDriftY] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const vh = window.innerHeight;
            const offset = ((rect.top + rect.height / 2) - vh / 2) * 0.04;
            setDriftY(offset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReducedMotion]);

  const s = color === "light"
    ? "hsl(42 30% 92% / 0.12)"
    : "hsl(30 15% 18% / 0.07)";
  const sf = color === "light"
    ? "hsl(42 30% 92% / 0.07)"
    : "hsl(30 15% 18% / 0.04)";
  const t = color === "light"
    ? "hsl(42 30% 92% / 0.16)"
    : "hsl(30 15% 18% / 0.09)";
  const a = color === "light"
    ? "hsl(42 60% 60% / 0.10)"
    : "hsl(42 60% 50% / 0.06)";

  const draw = (delay: number = 0, len: number = 1200): React.CSSProperties => ({
    strokeDasharray: len,
    strokeDashoffset: isVisible ? 0 : len,
    transition: prefersReducedMotion
      ? "none"
      : `stroke-dashoffset 2.8s cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`,
  });

  const fade = (delay: number = 0): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(4px)",
    transition: prefersReducedMotion
      ? "none"
      : `opacity 0.9s ease-out ${delay}ms, transform 0.9s ease-out ${delay}ms`,
  });

  return (
    <svg
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        transform: prefersReducedMotion ? "none" : `translateY(${driftY}px)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      <defs>
        <marker id="ov-arr-r" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <path d="M0,0 L7,2.5 L0,5" fill="none" stroke={s} strokeWidth="0.5" />
        </marker>
        <marker id="ov-arr-l" markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <path d="M7,0 L0,2.5 L7,5" fill="none" stroke={s} strokeWidth="0.5" />
        </marker>
      </defs>

      {variant === "barn" && (
        <>
          {/* Foundation line */}
          <line x1="80" y1="620" x2="1120" y2="620" stroke={s} strokeWidth="1.2" style={draw(0, 1100)} />
          {/* Floor slab hatching */}
          {Array.from({ length: 8 }, (_, i) => 80 + i * 140).map((x, i) => (
            <line key={`fl${i}`} x1={x} y1="620" x2={x + 60} y2="640" stroke={sf} strokeWidth="0.4" style={draw(200 + i * 60, 80)} />
          ))}

          {/* Vertical posts */}
          {[180, 400, 600, 800, 1020].map((x, i) => (
            <g key={`post${x}`}>
              <line x1={x} y1="180" x2={x} y2="620" stroke={s} strokeWidth="0.9" style={draw(300 + i * 120, 500)} />
              {/* Post base plate */}
              <rect x={x - 8} y="612" width="16" height="8" fill="none" stroke={sf} strokeWidth="0.5" style={draw(500 + i * 120, 50)} />
            </g>
          ))}

          {/* Top beam / eave line */}
          <line x1="140" y1="200" x2="1060" y2="200" stroke={s} strokeWidth="0.8" style={draw(800, 1000)} />

          {/* Roof truss */}
          <path d="M 140,200 L 600,90 L 1060,200" fill="none" stroke={s} strokeWidth="0.8" style={draw(1000, 1200)} />
          {/* Inner truss */}
          <path d="M 240,200 L 600,120 L 960,200" fill="none" stroke={sf} strokeWidth="0.4" style={draw(1200, 1000)} />
          {/* King post */}
          <line x1="600" y1="90" x2="600" y2="200" stroke={s} strokeWidth="0.6" style={draw(1400, 120)} />
          {/* Ridge cap mark */}
          <circle cx="600" cy="90" r="4" fill="none" stroke={a} strokeWidth="0.6" style={draw(1500, 30)} />

          {/* Stall dividers */}
          {[300, 500, 700, 900].map((x, i) => (
            <g key={`stall${x}`}>
              <line x1={x} y1="380" x2={x} y2="620" stroke={sf} strokeWidth="0.5" strokeDasharray="4 4" style={draw(1200 + i * 80, 260)} />
              {/* Stall number */}
              <text x={x - 50} y="510" textAnchor="middle" fill={t} fontSize="11" fontFamily="monospace" style={fade(2000 + i * 100)}>
                {`S${i + 1}`}
              </text>
            </g>
          ))}

          {/* Dimension arrows below */}
          <line x1="180" y1="670" x2="600" y2="670" stroke={s} strokeWidth="0.4"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1600, 500)} />
          <line x1="600" y1="670" x2="1020" y2="670" stroke={s} strokeWidth="0.4"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1700, 500)} />

          {/* Dimension text */}
          <text x="390" y="695" textAnchor="middle" fill={t} fontSize="13" fontFamily="monospace" style={fade(2200)}>
            12'-6"
          </text>
          <text x="810" y="695" textAnchor="middle" fill={t} fontSize="13" fontFamily="monospace" style={fade(2400)}>
            12'-6"
          </text>

          {/* Height dimension */}
          <line x1="1100" y1="200" x2="1100" y2="620" stroke={s} strokeWidth="0.4"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1800, 500)} />
          <text x="1130" y="420" textAnchor="start" fill={t} fontSize="11" fontFamily="monospace" style={fade(2500)}>
            14'-0"
          </text>

          {/* Title block */}
          <text x="600" y="68" textAnchor="middle" fill={t} fontSize="12" fontFamily="monospace" letterSpacing="3" style={fade(2600)}>
            HORSE BARN — CROSS SECTION
          </text>
          <text x="1100" y="755" textAnchor="end" fill={t} fontSize="9" fontFamily="monospace" style={fade(2800)}>
            SCALE 1:50
          </text>
        </>
      )}

      {variant === "detail" && (
        <>
          {/* Outer door frame */}
          <rect x="320" y="130" width="560" height="540" fill="none" stroke={s} strokeWidth="1" rx="2" style={draw(0, 2300)} />
          {/* Inner reveal */}
          <rect x="350" y="160" width="500" height="480" fill="none" stroke={sf} strokeWidth="0.5" style={draw(400, 2000)} />

          {/* Panel divisions */}
          <line x1="600" y1="160" x2="600" y2="640" stroke={sf} strokeWidth="0.4" style={draw(600, 500)} />
          <line x1="350" y1="400" x2="850" y2="400" stroke={sf} strokeWidth="0.4" style={draw(700, 500)} />

          {/* Handle hardware */}
          <circle cx="430" cy="400" r="10" fill="none" stroke={s} strokeWidth="0.8" style={draw(900, 65)} />
          <circle cx="430" cy="400" r="4" fill="none" stroke={a} strokeWidth="0.5" style={draw(1000, 28)} />
          <line x1="430" y1="388" x2="430" y2="370" stroke={s} strokeWidth="0.6" style={draw(1050, 20)} />

          {/* Hinge plates */}
          {[220, 400, 560].map((y, i) => (
            <g key={`hinge${y}`}>
              <rect x="312" y={y - 8} width="8" height="16" fill="none" stroke={s} strokeWidth="0.5" style={draw(800 + i * 150, 50)} />
              <line x1="310" y1={y} x2="322" y2={y} stroke={a} strokeWidth="0.4" style={draw(900 + i * 150, 14)} />
            </g>
          ))}

          {/* Dimension arrows */}
          <line x1="320" y1="700" x2="880" y2="700" stroke={s} strokeWidth="0.4"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1200, 600)} />
          <line x1="280" y1="130" x2="280" y2="670" stroke={s} strokeWidth="0.4"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1300, 600)} />

          {/* Dimension text */}
          <text x="600" y="725" textAnchor="middle" fill={t} fontSize="13" fontFamily="monospace" style={fade(1800)}>
            3'-6"
          </text>
          <text x="260" y="405" textAnchor="end" fill={t} fontSize="13" fontFamily="monospace" style={fade(1900)}>
            6'-8"
          </text>

          {/* Detail callout circle */}
          <circle cx="760" cy="300" r="30" fill="none" stroke={a} strokeWidth="0.5" style={draw(1500, 200)} />
          <text x="760" y="304" textAnchor="middle" fill={t} fontSize="10" fontFamily="monospace" style={fade(2100)}>
            DTL-3
          </text>

          {/* Title */}
          <text x="600" y="105" textAnchor="middle" fill={t} fontSize="12" fontFamily="monospace" letterSpacing="3" style={fade(2200)}>
            DOOR FRAME DETAIL
          </text>
          <text x="850" y="760" textAnchor="end" fill={t} fontSize="9" fontFamily="monospace" style={fade(2400)}>
            FULL SCALE
          </text>
        </>
      )}

      {variant === "dimensions" && (
        <>
          {/* Grid lines - horizontal */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`h${i}`} x1="60" y1={160 + i * 130} x2="1140" y2={160 + i * 130}
              stroke={sf} strokeWidth="0.4" style={draw(i * 120, 1100)} />
          ))}
          {/* Grid lines - vertical */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={`v${i}`} x1={100 + i * 200} y1="120" x2={100 + i * 200} y2="700"
              stroke={sf} strokeWidth="0.4" style={draw(80 + i * 100, 600)} />
          ))}

          {/* Column circles at top */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={`col${i}`}>
              <circle cx={100 + i * 200} cy="105" r="10" fill="none" stroke={s} strokeWidth="0.5" style={draw(400 + i * 80, 65)} />
              <text x={100 + i * 200} y="109" textAnchor="middle" fill={t} fontSize="9" fontFamily="monospace" style={fade(800 + i * 80)}>
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}

          {/* Row circles on left */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={`row${i}`}>
              <circle cx="40" cy={160 + i * 130} r="10" fill="none" stroke={s} strokeWidth="0.5" style={draw(500 + i * 80, 65)} />
              <text x="40" y={164 + i * 130} textAnchor="middle" fill={t} fontSize="9" fontFamily="monospace" style={fade(900 + i * 80)}>
                {i + 1}
              </text>
            </g>
          ))}

          {/* Diagonal brace in one bay */}
          <line x1="100" y1="160" x2="300" y2="290" stroke={a} strokeWidth="0.4" style={draw(1000, 200)} />
          <line x1="300" y1="160" x2="100" y2="290" stroke={a} strokeWidth="0.4" style={draw(1100, 200)} />

          {/* Dimension arrows below grid */}
          <line x1="100" y1="730" x2="500" y2="730" stroke={s} strokeWidth="0.35"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1300, 500)} />
          <line x1="500" y1="730" x2="900" y2="730" stroke={s} strokeWidth="0.35"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1400, 500)} />

          {/* Dimension text */}
          <text x="300" y="750" textAnchor="middle" fill={t} fontSize="12" fontFamily="monospace" style={fade(1800)}>
            24'-0"
          </text>
          <text x="700" y="750" textAnchor="middle" fill={t} fontSize="12" fontFamily="monospace" style={fade(1900)}>
            24'-0"
          </text>

          {/* Scale notation */}
          <text x="1100" y="770" textAnchor="end" fill={t} fontSize="10" fontFamily="monospace" style={fade(2100)}>
            SCALE: 1/4" = 1'-0"
          </text>
          <text x="100" y="90" textAnchor="start" fill={t} fontSize="11" fontFamily="monospace" letterSpacing="3" style={fade(2200)}>
            COLUMN GRID PLAN
          </text>
        </>
      )}

      {variant === "front-elevation" && (
        <>
          {/* ── Ground line ── */}
          <line x1="40" y1="640" x2="1160" y2="640" stroke={s} strokeWidth="1.2" style={draw(0, 1200)} />

          {/* Grade hatching */}
          {Array.from({ length: 14 }, (_, i) => 40 + i * 80).map((x, i) => (
            <line key={`gr${i}`} x1={x} y1="640" x2={x + 40} y2="665" stroke={sf} strokeWidth="0.4" style={draw(100 + i * 40, 40)} />
          ))}

          {/* ── Structural grid – vertical columns ── */}
          {[140, 340, 540, 740, 940, 1060].map((x, i) => (
            <g key={`fecol${x}`}>
              <line x1={x} y1="190" x2={x} y2="640" stroke={s} strokeWidth="0.7" style={draw(200 + i * 100, 500)} />
              {/* Column base */}
              <rect x={x - 10} y="630" width="20" height="10" fill="none" stroke={sf} strokeWidth="0.5" style={draw(400 + i * 100, 60)} />
            </g>
          ))}

          {/* ── Horizontal grid lines ── */}
          {[190, 340, 490].map((y, i) => (
            <line key={`feh${i}`} x1="100" y1={y} x2="1100" y2={y} stroke={sf} strokeWidth="0.35" style={draw(600 + i * 120, 1000)} />
          ))}

          {/* ── Eave / top plate line ── */}
          <line x1="100" y1="210" x2="1100" y2="210" stroke={s} strokeWidth="0.9" style={draw(700, 1100)} />

          {/* ── Roof – gable front elevation ── */}
          <path d="M 100,210 L 600,60 L 1100,210" fill="none" stroke={s} strokeWidth="1" style={draw(900, 1400)} />
          {/* Inner roof line */}
          <path d="M 180,210 L 600,95 L 1020,210" fill="none" stroke={sf} strokeWidth="0.4" style={draw(1100, 1200)} />
          {/* Ridge detail */}
          <circle cx="600" cy="60" r="5" fill="none" stroke={a} strokeWidth="0.6" style={draw(1300, 35)} />
          <line x1="600" y1="60" x2="600" y2="210" stroke={s} strokeWidth="0.5" strokeDasharray="6 4" style={draw(1350, 160)} />

          {/* ── Barn doors ── */}
          <rect x="370" y="400" width="180" height="240" fill="none" stroke={s} strokeWidth="0.8" rx="1" style={draw(1000, 860)} />
          {/* Door panels */}
          <line x1="460" y1="400" x2="460" y2="640" stroke={sf} strokeWidth="0.4" style={draw(1200, 240)} />
          {/* Cross braces on doors */}
          <line x1="370" y1="400" x2="460" y2="520" stroke={sf} strokeWidth="0.3" style={draw(1300, 200)} />
          <line x1="460" y1="400" x2="550" y2="520" stroke={sf} strokeWidth="0.3" style={draw(1350, 200)} />
          {/* Door hardware */}
          <circle cx="445" cy="520" r="4" fill="none" stroke={a} strokeWidth="0.5" style={draw(1400, 28)} />

          {/* ── Windows ── */}
          {[680, 860].map((x, i) => (
            <g key={`win${x}`}>
              <rect x={x} y="310" width="80" height="100" fill="none" stroke={s} strokeWidth="0.6" style={draw(1100 + i * 150, 360)} />
              {/* Window muntins */}
              <line x1={x + 40} y1="310" x2={x + 40} y2="410" stroke={sf} strokeWidth="0.3" style={draw(1250 + i * 150, 100)} />
              <line x1={x} y1="360" x2={x + 80} y2="360" stroke={sf} strokeWidth="0.3" style={draw(1300 + i * 150, 80)} />
            </g>
          ))}

          {/* ── Hay loft opening ── */}
          <path d="M 520,150 L 600,110 L 680,150 L 680,200 L 520,200 Z" fill="none" stroke={sf} strokeWidth="0.5" style={draw(1500, 400)} />

          {/* ── Grid labels at top ── */}
          {[140, 340, 540, 740, 940, 1060].map((x, i) => (
            <g key={`felbl${i}`}>
              <circle cx={x} cy="175" r="9" fill="none" stroke={s} strokeWidth="0.4" style={draw(1600 + i * 60, 58)} />
              <text x={x} y="179" textAnchor="middle" fill={t} fontSize="8" fontFamily="monospace" style={fade(2000 + i * 60)}>
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}

          {/* ── Dimension lines ── */}
          {/* Width */}
          <line x1="140" y1="680" x2="1060" y2="680" stroke={s} strokeWidth="0.35"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1800, 1000)} />
          <text x="600" y="705" textAnchor="middle" fill={t} fontSize="12" fontFamily="monospace" style={fade(2400)}>
            60'-0"
          </text>

          {/* Height – eave */}
          <line x1="1130" y1="210" x2="1130" y2="640" stroke={s} strokeWidth="0.35"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(1900, 500)} />
          <text x="1155" y="430" textAnchor="start" fill={t} fontSize="10" fontFamily="monospace" style={fade(2500)}>
            14'-0"
          </text>

          {/* Height – ridge */}
          <line x1="60" y1="60" x2="60" y2="640" stroke={s} strokeWidth="0.35"
            markerStart="url(#ov-arr-l)" markerEnd="url(#ov-arr-r)" style={draw(2000, 600)} />
          <text x="35" y="360" textAnchor="end" fill={t} fontSize="10" fontFamily="monospace" writingMode="vertical-rl" style={fade(2600)}>
            22'-6"
          </text>

          {/* ── Title block ── */}
          <text x="600" y="38" textAnchor="middle" fill={t} fontSize="11" fontFamily="monospace" letterSpacing="4" style={fade(2700)}>
            FRONT ELEVATION
          </text>
          <text x="1100" y="755" textAnchor="end" fill={t} fontSize="9" fontFamily="monospace" style={fade(2900)}>
            SCALE 1:48
          </text>
        </>
      )}
    </svg>
  );
}
