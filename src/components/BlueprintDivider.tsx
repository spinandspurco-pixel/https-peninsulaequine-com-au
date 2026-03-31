import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BlueprintDividerProps {
  className?: string;
  variant?: "structural" | "elevation" | "grid" | "floorplan" | "contact";
}

/**
 * Architectural section divider with rich SVG line-draw animations.
 * Lines, arrowheads, dimension markers, and labels all draw in
 * sequentially as the user scrolls into view.
 */
export function BlueprintDivider({
  className = "",
  variant = "structural",
}: BlueprintDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mouseX, setMouseX] = useState(0.5);
  const scrollProgressRef = useRef(0);
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
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Mouse tracking for glow spotlight
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMouseX((e.clientX - rect.left) / rect.width);
  }, [prefersReducedMotion]);

  // Scroll-based parallax drift
  useEffect(() => {
    if (prefersReducedMotion) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const vh = window.innerHeight;
            const progress = 1 - (rect.top / vh);
            setScrollProgress(Math.max(0, Math.min(1, progress)));
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

  const stroke = "hsl(30 15% 45% / 0.18)";
  const strokeFaint = "hsl(30 15% 45% / 0.10)";
  const text = "hsl(30 15% 45% / 0.25)";
  const accent = "hsl(42 60% 50% / 0.14)";

  const draw = (delay: number = 0, len: number = 2000): React.CSSProperties => ({
    strokeDasharray: len,
    strokeDashoffset: isVisible ? 0 : len,
    transition: prefersReducedMotion
      ? "none"
      : `stroke-dashoffset 2s cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`,
  });

  const fade = (delay: number = 0): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(3px)",
    transition: prefersReducedMotion
      ? "none"
      : `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
  });

  // Parallax horizontal drift based on scroll
  const driftX = prefersReducedMotion ? 0 : (scrollProgress - 0.5) * 12;

  return (
    <div
      ref={ref}
      className={`relative w-full h-20 sm:h-28 md:h-32 overflow-hidden group ${className}`}
      aria-hidden="true"
      onMouseMove={handleMouseMove}
    >
      {/* Mouse-tracking spotlight glow */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle 200px at ${mouseX * 100}% 50%, hsl(42 60% 50% / 0.06), transparent 70%)`,
          }}
        />
      )}

      {/* Animated scan line */}
      {!prefersReducedMotion && isVisible && (
        <div
          className="absolute top-0 h-full w-[2px] pointer-events-none animate-blueprint-scan"
          style={{
            background: "linear-gradient(to bottom, transparent, hsl(42 60% 50% / 0.12), transparent)",
          }}
        />
      )}

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1600 120"
        preserveAspectRatio="none"
        style={{
          transform: prefersReducedMotion ? "none" : `translateX(${driftX}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {/* Shared: arrowhead markers */}
        <defs>
          <marker id="arrow-r" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="none" stroke={stroke} strokeWidth="0.6" />
          </marker>
          <marker id="arrow-l" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M8,0 L0,3 L8,6" fill="none" stroke={stroke} strokeWidth="0.6" />
          </marker>
          <marker id="tick" markerWidth="1" markerHeight="10" refX="0.5" refY="5" orient="auto">
            <line x1="0.5" y1="0" x2="0.5" y2="10" stroke={stroke} strokeWidth="0.5" />
          </marker>
        </defs>

        {variant === "structural" && (
          <>
            {/* Primary centre beam */}
            <line x1="0" y1="60" x2="1600" y2="60" stroke={stroke} strokeWidth="0.8" style={draw(0)} />
            {/* Secondary parallel lines */}
            <line x1="0" y1="56" x2="1600" y2="56" stroke={strokeFaint} strokeWidth="0.3" style={draw(100)} />
            <line x1="0" y1="64" x2="1600" y2="64" stroke={strokeFaint} strokeWidth="0.3" style={draw(100)} />

            {/* Vertical tick posts with serifs */}
            {[120, 320, 520, 720, 920, 1120, 1320, 1480].map((x, i) => (
              <g key={x}>
                <line x1={x} y1="40" x2={x} y2="80" stroke={stroke} strokeWidth="0.5" style={draw(250 + i * 70, 60)} />
                {/* Small serif caps */}
                <line x1={x - 4} y1="40" x2={x + 4} y2="40" stroke={strokeFaint} strokeWidth="0.4" style={draw(350 + i * 70, 12)} />
                <line x1={x - 4} y1="80" x2={x + 4} y2="80" stroke={strokeFaint} strokeWidth="0.4" style={draw(350 + i * 70, 12)} />
              </g>
            ))}

            {/* Dimension arrows with arrowheads */}
            <line x1="120" y1="95" x2="520" y2="95" stroke={stroke} strokeWidth="0.4"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(900, 400)} />
            <line x1="520" y1="95" x2="920" y2="95" stroke={stroke} strokeWidth="0.4"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1000, 400)} />
            <line x1="920" y1="95" x2="1320" y2="95" stroke={stroke} strokeWidth="0.4"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1100, 400)} />

            {/* Dimension labels */}
            <text x="320" y="110" textAnchor="middle" fill={text} fontSize="8" fontFamily="monospace" style={fade(1400)}>
              12'-0"
            </text>
            <text x="720" y="110" textAnchor="middle" fill={text} fontSize="8" fontFamily="monospace" style={fade(1550)}>
              12'-0"
            </text>
            <text x="1120" y="110" textAnchor="middle" fill={text} fontSize="8" fontFamily="monospace" style={fade(1700)}>
              12'-0"
            </text>

            {/* Stall partition indicators */}
            {[420, 620, 820, 1020].map((x, i) => (
              <line key={`p${x}`} x1={x} y1="52" x2={x} y2="68" stroke={accent} strokeWidth="0.6" style={draw(800 + i * 100, 20)} />
            ))}

            {/* Section label */}
            <text x="80" y="35" textAnchor="start" fill={text} fontSize="7" fontFamily="monospace" letterSpacing="2" style={fade(1800)}>
              STRUCTURAL PLAN
            </text>
            <text x="1520" y="35" textAnchor="end" fill={text} fontSize="6" fontFamily="monospace" style={fade(2000)}>
              DWG-S01
            </text>
          </>
        )}

        {variant === "elevation" && (
          <>
            {/* Double beam lines */}
            <line x1="0" y1="50" x2="1600" y2="50" stroke={stroke} strokeWidth="0.6" style={draw(0)} />
            <line x1="0" y1="70" x2="1600" y2="70" stroke={stroke} strokeWidth="0.6" style={draw(120)} />

            {/* Cross-bracing with full X marks */}
            {[160, 480, 800, 1120, 1440].map((x, i) => (
              <g key={x}>
                <line x1={x} y1="28" x2={x + 80} y2="92" stroke={strokeFaint} strokeWidth="0.4" style={draw(300 + i * 140, 100)} />
                <line x1={x + 80} y1="28" x2={x} y2="92" stroke={strokeFaint} strokeWidth="0.4" style={draw(380 + i * 140, 100)} />
                {/* Small centre circle at cross point */}
                <circle cx={x + 40} cy="60" r="3" fill="none" stroke={accent} strokeWidth="0.4" style={draw(450 + i * 140, 20)} />
              </g>
            ))}

            {/* Roof pitch angle indicator */}
            <path d="M 700,28 L 760,8 L 820,28" fill="none" stroke={stroke} strokeWidth="0.5" style={draw(1200, 200)} />
            <path d="M 730,28 L 760,14 L 790,28" fill="none" stroke={strokeFaint} strokeWidth="0.3" style={draw(1350, 120)} />

            {/* Elevation labels */}
            <text x="760" y="6" textAnchor="middle" fill={text} fontSize="7" fontFamily="monospace" style={fade(1500)}>
              RIDGE 8.4m
            </text>
            <text x="80" y="115" textAnchor="start" fill={text} fontSize="7" fontFamily="monospace" letterSpacing="2" style={fade(1700)}>
              FRONT ELEVATION
            </text>
            <text x="1520" y="115" textAnchor="end" fill={text} fontSize="6" fontFamily="monospace" style={fade(1900)}>
              SECTION A-A
            </text>

            {/* Height dimension on the right */}
            <line x1="1560" y1="28" x2="1560" y2="92" stroke={stroke} strokeWidth="0.4"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1000, 80)} />
            <text x="1575" y="64" textAnchor="start" fill={text} fontSize="6" fontFamily="monospace" style={fade(1600)}>
              3.2m
            </text>
          </>
        )}

        {variant === "grid" && (
          <>
            {/* Grid baseline with heavier weight */}
            <line x1="40" y1="60" x2="1560" y2="60" stroke={stroke} strokeWidth="0.7" style={draw(0)} />

            {/* Grid columns with circle markers */}
            {Array.from({ length: 16 }, (_, i) => 40 + i * 100).map((x, i) => (
              <g key={x}>
                <line x1={x} y1="30" x2={x} y2="90" stroke={strokeFaint} strokeWidth="0.35" style={draw(80 + i * 50, 80)} />
                {/* Column circle at top */}
                <circle cx={x} cy="24" r="6" fill="none" stroke={stroke} strokeWidth="0.4" style={draw(200 + i * 50, 40)} />
              </g>
            ))}

            {/* Column labels inside circles */}
            {["1", "2", "3", "4", "5", "6", "7", "8"].map((label, i) => (
              <text key={label} x={40 + i * 200} y="27" textAnchor="middle" fill={text} fontSize="6" fontFamily="monospace" style={fade(800 + i * 80)}>
                {label}
              </text>
            ))}

            {/* Row labels */}
            {["A", "B", "C"].map((label, i) => (
              <g key={label}>
                <circle cx="20" cy={40 + i * 20} r="5" fill="none" stroke={strokeFaint} strokeWidth="0.3" style={draw(600 + i * 100, 35)} />
                <text x="20" y={43 + i * 20} textAnchor="middle" fill={text} fontSize="5" fontFamily="monospace" style={fade(900 + i * 100)}>
                  {label}
                </text>
              </g>
            ))}

            {/* Dimension arrows below */}
            <line x1="40" y1="100" x2="540" y2="100" stroke={stroke} strokeWidth="0.35"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1200, 500)} />
            <line x1="540" y1="100" x2="1040" y2="100" stroke={stroke} strokeWidth="0.35"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1300, 500)} />
            <line x1="1040" y1="100" x2="1540" y2="100" stroke={stroke} strokeWidth="0.35"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1400, 500)} />

            {/* Dimension text */}
            <text x="290" y="113" textAnchor="middle" fill={text} fontSize="7" fontFamily="monospace" style={fade(1700)}>
              15.2m
            </text>
            <text x="790" y="113" textAnchor="middle" fill={text} fontSize="7" fontFamily="monospace" style={fade(1800)}>
              15.2m
            </text>
            <text x="1290" y="113" textAnchor="middle" fill={text} fontSize="7" fontFamily="monospace" style={fade(1900)}>
              15.2m
            </text>

            {/* Drawing label */}
            <text x="80" y="12" textAnchor="start" fill={text} fontSize="7" fontFamily="monospace" letterSpacing="2" style={fade(2000)}>
              COLUMN GRID PLAN
            </text>
            <text x="1520" y="12" textAnchor="end" fill={text} fontSize="6" fontFamily="monospace" style={fade(2100)}>
              SCALE 1:200
            </text>
          </>
        )}

        {variant === "floorplan" && (
          <>
            {/* Outer wall outline */}
            <rect x="80" y="15" width="1440" height="90" fill="none" stroke={stroke} strokeWidth="0.9" rx="1" style={draw(0, 3200)} />
            {/* Inner wall offset */}
            <rect x="95" y="22" width="1410" height="76" fill="none" stroke={strokeFaint} strokeWidth="0.35" rx="1" style={draw(200, 3100)} />

            {/* Room partitions */}
            {[360, 640, 960, 1240].map((x, i) => (
              <g key={`wall${x}`}>
                <line x1={x} y1="15" x2={x} y2="105" stroke={stroke} strokeWidth="0.6" style={draw(400 + i * 120, 100)} />
                {/* Door swing arc */}
                <path
                  d={`M ${x + 2},70 A 18,18 0 0,1 ${x + 20},52`}
                  fill="none" stroke={accent} strokeWidth="0.5" style={draw(700 + i * 120, 30)}
                />
              </g>
            ))}

            {/* Room labels */}
            {[
              { x: 220, label: "TACK" },
              { x: 500, label: "STALL 1" },
              { x: 800, label: "STALL 2" },
              { x: 1100, label: "WASH" },
              { x: 1380, label: "FEED" },
            ].map((room, i) => (
              <text key={room.label} x={room.x} y="65" textAnchor="middle" fill={text} fontSize="7" fontFamily="monospace" letterSpacing="1.5" style={fade(1200 + i * 100)}>
                {room.label}
              </text>
            ))}

            {/* Window marks on top wall */}
            {[440, 560, 760, 880, 1060, 1160].map((x, i) => (
              <g key={`win${x}`}>
                <line x1={x} y1="13" x2={x} y2="18" stroke={strokeFaint} strokeWidth="0.4" style={draw(600 + i * 60, 8)} />
                <line x1={x + 20} y1="13" x2={x + 20} y2="18" stroke={strokeFaint} strokeWidth="0.4" style={draw(620 + i * 60, 8)} />
                <line x1={x} y1="15" x2={x + 20} y2="15" stroke={accent} strokeWidth="0.3" style={draw(640 + i * 60, 22)} />
              </g>
            ))}

            {/* Overall dimension arrow */}
            <line x1="80" y1="112" x2="1520" y2="112" stroke={stroke} strokeWidth="0.35"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1600, 1500)} />
            <text x="800" y="120" textAnchor="middle" fill={text} fontSize="7" fontFamily="monospace" style={fade(2000)}>
              45'-0" OVERALL
            </text>

            {/* Bay dimensions */}
            {[
              { x1: 80, x2: 360, label: "8'-6\"" },
              { x1: 360, x2: 640, label: "8'-6\"" },
              { x1: 640, x2: 960, label: "9'-8\"" },
              { x1: 960, x2: 1240, label: "8'-6\"" },
              { x1: 1240, x2: 1520, label: "8'-6\"" },
            ].map((dim, i) => (
              <text key={`dim${i}`} x={(dim.x1 + dim.x2) / 2} y="8" textAnchor="middle" fill={text} fontSize="5.5" fontFamily="monospace" style={fade(1800 + i * 80)}>
                {dim.label}
              </text>
            ))}

            {/* Drawing title */}
            <text x="80" y="8" textAnchor="start" fill={text} fontSize="6" fontFamily="monospace" letterSpacing="2" style={fade(2200)}>
              FLOOR PLAN
            </text>
            <text x="1520" y="120" textAnchor="end" fill={text} fontSize="5.5" fontFamily="monospace" style={fade(2300)}>
              DWG-FP01
            </text>
          </>
        )}

        {variant === "contact" && (
          <>
            {/* Central double line — like a section cut through a wall */}
            <line x1="0" y1="55" x2="1600" y2="55" stroke={stroke} strokeWidth="0.7" style={draw(0)} />
            <line x1="0" y1="65" x2="1600" y2="65" stroke={stroke} strokeWidth="0.7" style={draw(80)} />
            {/* Fill hatching between the double lines */}
            {Array.from({ length: 40 }, (_, i) => i * 40).map((x, i) => (
              <line key={`ch${i}`} x1={x} y1="55" x2={x + 10} y2="65" stroke={strokeFaint} strokeWidth="0.3" style={draw(150 + i * 20, 15)} />
            ))}

            {/* Connection nodes — representing contact channels */}
            {[240, 560, 880, 1200].map((x, i) => (
              <g key={`cn${i}`}>
                {/* Vertical stub */}
                <line x1={x} y1="30" x2={x} y2="90" stroke={stroke} strokeWidth="0.5" style={draw(300 + i * 120, 70)} />
                {/* Node circle */}
                <circle cx={x} cy="30" r="8" fill="none" stroke={accent} strokeWidth="0.5" style={draw(500 + i * 120, 55)} />
                {/* Inner dot */}
                <circle cx={x} cy="30" r="2.5" fill="none" stroke={stroke} strokeWidth="0.4" style={draw(600 + i * 120, 18)} />
                {/* Bottom serif */}
                <line x1={x - 6} y1="90" x2={x + 6} y2="90" stroke={strokeFaint} strokeWidth="0.4" style={draw(550 + i * 120, 14)} />
              </g>
            ))}

            {/* Connection labels */}
            {[
              { x: 240, label: "PHONE" },
              { x: 560, label: "EMAIL" },
              { x: 880, label: "VISIT" },
              { x: 1200, label: "CONSULT" },
            ].map((item, i) => (
              <text key={item.label} x={item.x} y="18" textAnchor="middle" fill={text} fontSize="5.5" fontFamily="monospace" letterSpacing="1.5" style={fade(1200 + i * 100)}>
                {item.label}
              </text>
            ))}

            {/* Linking arcs between nodes */}
            {[
              { x1: 248, x2: 552 },
              { x1: 568, x2: 872 },
              { x1: 888, x2: 1192 },
            ].map((arc, i) => (
              <path key={`arc${i}`}
                d={`M ${arc.x1},30 Q ${(arc.x1 + arc.x2) / 2},6 ${arc.x2},30`}
                fill="none" stroke={strokeFaint} strokeWidth="0.3" strokeDasharray="4 3"
                style={draw(900 + i * 150, 300)}
              />
            ))}

            {/* Dimension arrow spanning all nodes */}
            <line x1="240" y1="105" x2="1200" y2="105" stroke={stroke} strokeWidth="0.3"
              markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)" style={draw(1400, 1000)} />
            <text x="720" y="116" textAnchor="middle" fill={text} fontSize="7" fontFamily="monospace" style={fade(1900)}>
              ALL CHANNELS OPEN
            </text>

            {/* Title block */}
            <text x="80" y="10" textAnchor="start" fill={text} fontSize="6" fontFamily="monospace" letterSpacing="2" style={fade(2000)}>
              CONTACT ALIGNMENT
            </text>
            <text x="1520" y="116" textAnchor="end" fill={text} fontSize="5.5" fontFamily="monospace" style={fade(2100)}>
              DWG-C01
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
