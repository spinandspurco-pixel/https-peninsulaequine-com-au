import { useState, useCallback, useEffect, useRef } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

/* ── Zone images ──────────────────────────────────── */
import imgIndoor from "@/assets/walk-arena.jpg";
import imgStables from "@/assets/walk-stables.jpg";
import imgCourtyard from "@/assets/walk-courtyard.jpg";
import imgLoft from "@/assets/walk-loft.jpg";

const ZONE_IMAGES: Record<string, string> = {
  "indoor-arena": imgIndoor,
  stables: imgStables,
  courtyard: imgCourtyard,
  "viewing-area": imgLoft,
  "service-wing": imgCourtyard,
};

/* ── Zone data — Main Ridge architectural plans A01–A14 ── */
interface Zone {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  path: string;
}

const zones: Zone[] = [
  {
    id: "indoor-arena",
    label: "Indoor Arena",
    shortLabel: "Arena",
    description: "24 × 48m fully enclosed riding space with store below — designed for year-round consistency under load.",
    path: "M 195 430 L 545 430 L 545 590 L 195 590 Z",
  },
  {
    id: "stables",
    label: "Stable Block",
    shortLabel: "Stables",
    description: "Six stables across two wings with float/garage access at each entry — structured for airflow and daily workflow.",
    path: "M 195 120 L 545 120 L 545 260 L 195 260 Z",
  },
  {
    id: "courtyard",
    label: "Central Courtyard",
    shortLabel: "Courtyard",
    description: "The operational spine connecting stables, service areas, and arena through one controlled axis.",
    path: "M 270 260 L 470 260 L 470 380 L 270 380 Z",
  },
  {
    id: "viewing-area",
    label: "Upstairs Viewing Area",
    shortLabel: "Viewing",
    description: "Elevated mezzanine overlooking the arena — with dormer windows positioned for natural light and oversight.",
    path: "M 470 260 L 545 260 L 545 380 L 470 380 Z",
  },
  {
    id: "service-wing",
    label: "Tack & Service Rooms",
    shortLabel: "Tack / WC",
    description: "Tack rooms, wash bay, WC, and storage — positioned between stables and arena for efficient daily operations.",
    path: "M 195 260 L 270 260 L 270 430 L 195 430 Z",
  },
];

/* ── Preload ─────────────────────────────────────── */
function usePreloadImages(srcs: string[]) {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    srcs.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);
}

/* ── Detail card ─────────────────────────────────── */
function DetailCard({ zone, visible }: { zone: Zone | null; visible: boolean }) {
  const imgSrc = zone ? ZONE_IMAGES[zone.id] : null;
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [zone?.id]);

  return (
    <div
      className="pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${DISTANCE.sm}px)`,
        transition: `opacity ${DURATION.fast}ms ${EASE.interactive}, transform ${DURATION.fast}ms ${EASE.interactive}`,
        willChange: "opacity, transform",
      }}
    >
      {zone && (
        <div
          className="border border-accent/12 bg-card/85 backdrop-blur-md rounded-sm p-5 sm:p-6 max-w-[260px]"
          style={{ boxShadow: "0 8px 32px -8px hsl(var(--accent) / 0.08), 0 2px 8px -2px hsl(var(--background) / 0.4)" }}
        >
          <div className="w-full aspect-[16/10] bg-accent/[0.03] border border-accent/8 rounded-sm mb-3.5 overflow-hidden relative">
            {imgSrc && !imgError ? (
              <img src={imgSrc} alt={zone.label} className="absolute inset-0 w-full h-full object-cover" onError={() => setImgError(true)} loading="eager" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25">{zone.label}</span>
              </div>
            )}
          </div>
          <h3 className="font-serif text-base sm:text-lg text-foreground/90 tracking-[0.02em] mb-1.5">{zone.label}</h3>
          <p className="text-xs sm:text-[13px] text-muted-foreground/40 leading-relaxed font-serif italic">{zone.description}</p>
        </div>
      )}
    </div>
  );
}

/* ── Architectural plan SVG ──────────────────────────── */
function SitePlan({
  activeZone, onHover, onLeave, onTap,
}: {
  activeZone: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  onTap: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 740 680" className="w-full h-auto max-w-[560px] mx-auto" aria-label="Main Ridge Estate — ground floor plan">
      <defs>
        <pattern id="mp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.05" />
        </pattern>
        <pattern id="mp-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.035" />
        </pattern>
        <pattern id="mp-hatch-dense" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.04" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect width="740" height="680" fill="url(#mp-grid)" />

      {/* Property boundary */}
      <rect x="155" y="80" width="430" height="560" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.07" strokeDasharray="8 4" />

      {/* ── STABLES WING (top) ── */}
      {/* Left float/garage */}
      <rect x="195" y="95" width="55" height="25" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.15" />
      <text x="222" y="111" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.15" fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>

      {/* Right float/garage */}
      <rect x="490" y="95" width="55" height="25" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.15" />
      <text x="517" y="111" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.15" fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>

      {/* Entry marker */}
      <text x="370" y="110" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.12" fontFamily="monospace" letterSpacing="0.15em">ENTRY</text>

      {/* Central corridor axis */}
      <line x1="370" y1="120" x2="370" y2="430" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.05" strokeDasharray="3 3" />

      {/* Stable dividers — left wing (S1–S3) */}
      {[0, 1, 2, 3].map((i) => (
        <line key={`sl${i}`} x1={245 + i * 40} y1="120" x2={245 + i * 40} y2="260" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.05" />
      ))}
      {/* Stable dividers — right wing (S4–S6) */}
      {[0, 1, 2, 3].map((i) => (
        <line key={`sr${i}`} x1={405 + i * 40} y1="120" x2={405 + i * 40} y2="260" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.05" />
      ))}

      {/* Stable number labels */}
      {[1, 2, 3].map((n, i) => (
        <text key={`sln${n}`} x={265 + i * 40} y="195" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">S{n}</text>
      ))}
      {[4, 5, 6].map((n, i) => (
        <text key={`srn${n}`} x={425 + i * 40} y="195" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">S{n}</text>
      ))}

      {/* ── SERVICE WING (left middle) ── */}
      {/* Internal room dividers */}
      <line x1="195" y1="310" x2="270" y2="310" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.05" />
      <line x1="195" y1="350" x2="270" y2="350" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.05" />
      <line x1="195" y1="390" x2="270" y2="390" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.05" />
      <text x="232" y="290" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">TACK 1</text>
      <text x="232" y="335" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">WC</text>
      <text x="232" y="375" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">STORE</text>
      <text x="232" y="415" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">TACK 2</text>

      {/* ── VIEWING AREA (right middle) ── */}
      {/* Upstairs viewing loft indicator — dormer hatching */}
      <rect x="475" y="265" width="65" height="50" fill="url(#mp-hatch-dense)" stroke="none" opacity="0.3" />
      {/* Stair indicator */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`stair${i}`} x1={475} y1={325 + i * 8} x2={540} y2={325 + i * 8} stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.06" />
      ))}
      <text x="507" y="290" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">VIEWING</text>
      <text x="507" y="296" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity="0.06" fontFamily="monospace">UPSTAIRS</text>

      {/* ── WASH / TIE-UP (right of courtyard) ── */}
      <rect x="470" y="380" width="75" height="50" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.05" />
      <text x="507" y="408" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace">WASH BAY</text>

      {/* ── ARENA STORE (below arena) ── */}
      <rect x="195" y="590" width="350" height="35" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.1" />
      <text x="370" y="611" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.12" fontFamily="monospace" letterSpacing="0.1em">ARENA STORE</text>

      {/* ── ARENA WALKWAY markers ── */}
      <line x1="270" y1="380" x2="270" y2="430" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.04" strokeDasharray="2 2" />
      <line x1="470" y1="380" x2="470" y2="430" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.04" strokeDasharray="2 2" />

      {/* ── INTERACTIVE ZONE SHAPES ── */}
      {zones.map((z) => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        return (
          <g key={z.id} style={{ opacity: isDimmed ? 0.3 : 1, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}>
            <path
              d={z.path}
              fill={isActive ? "hsl(var(--accent) / 0.08)" : "hsl(var(--accent) / 0.012)"}
              stroke={isActive ? "hsl(var(--accent) / 0.5)" : "hsl(var(--accent) / 0.08)"}
              strokeWidth={isActive ? "1" : "0.4"}
              style={{ transition: `fill ${DURATION.fast}ms ${EASE.interactive}, stroke ${DURATION.fast}ms ${EASE.interactive}` }}
              className="cursor-pointer"
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={onLeave}
              onClick={() => onTap(z.id)}
            />
            <text
              x={getCenter(z.path).x}
              y={getCenter(z.path).y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7"
              fontFamily="monospace"
              letterSpacing="0.12em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{ opacity: isActive ? 0.5 : 0.15, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            >
              {z.shortLabel}
            </text>
          </g>
        );
      })}

      {/* ── STRUCTURAL COLUMNS — from A07 axonometric ── */}
      {/* Arena columns — left row */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={`cal${i}`} x={193} y={440 + i * 25} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.06" />
      ))}
      {/* Arena columns — right row */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={`car${i}`} x={544} y={440 + i * 25} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.06" />
      ))}
      {/* Stable columns */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={`cst${i}`} x={210 + i * 45} y={118} width="2" height="2" fill="hsl(var(--accent))" opacity="0.05" />
      ))}

      {/* ── DIMENSION ANNOTATIONS ── */}
      <g opacity="0.08" fontSize="5" fontFamily="monospace" fill="hsl(var(--accent))">
        {/* Arena width dimension */}
        <line x1="195" y1="605" x2="545" y2="605" stroke="hsl(var(--accent))" strokeWidth="0.25" />
        <line x1="195" y1="602" x2="195" y2="608" stroke="hsl(var(--accent))" strokeWidth="0.25" />
        <line x1="545" y1="602" x2="545" y2="608" stroke="hsl(var(--accent))" strokeWidth="0.25" />

        {/* Overall height */}
        <line x1="170" y1="120" x2="170" y2="590" stroke="hsl(var(--accent))" strokeWidth="0.25" />
        <line x1="167" y1="120" x2="173" y2="120" stroke="hsl(var(--accent))" strokeWidth="0.25" />
        <line x1="167" y1="590" x2="173" y2="590" stroke="hsl(var(--accent))" strokeWidth="0.25" />
      </g>

      {/* ── ROOF LINE HINTS — from elevations A06 ── */}
      <path
        d="M 195 115 L 370 98 L 545 115"
        fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" strokeDasharray="4 3"
      />

      {/* ── DRAWING REFERENCE ── */}
      <g opacity="0.1" transform="translate(545, 645)">
        <text x="0" y="0" fontSize="6" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.08em">MAIN RIDGE</text>
        <text x="0" y="10" fontSize="4.5" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.6">PROPOSED GROUND FLOOR</text>
        <text x="0" y="18" fontSize="4" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.4">A 03</text>
      </g>

      {/* ── COMPASS ── */}
      <g opacity="0.08" transform="translate(660, 130)">
        <line x1="0" y1="-16" x2="0" y2="16" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <line x1="-16" y1="0" x2="16" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <polygon points="0,-18 -3,-12 3,-12" fill="hsl(var(--accent))" opacity="0.3" />
        <text x="0" y="-22" textAnchor="middle" fontSize="6" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
      </g>

      {/* ── PADDOCK ACCESS (left) ── */}
      <text x="182" y="350" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.07" fontFamily="monospace" transform="rotate(-90, 182, 350)">PADDOCK</text>

      {/* ── TIE-UP AREA markers ── */}
      <g opacity="0.06">
        <circle cx="290" cy="415" r="1.5" fill="hsl(var(--accent))" />
        <circle cx="310" cy="415" r="1.5" fill="hsl(var(--accent))" />
        <circle cx="430" cy="415" r="1.5" fill="hsl(var(--accent))" />
        <circle cx="450" cy="415" r="1.5" fill="hsl(var(--accent))" />
      </g>
      <text x="370" y="422" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity="0.06" fontFamily="monospace">TIE-UP</text>
    </svg>
  );
}

function getCenter(path: string): { x: number; y: number } {
  const nums = path.match(/[\d.]+/g)?.map(Number) || [];
  if (nums.length < 4) return { x: 0, y: 0 };
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}

/* ── Touch detection ── */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => { setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0); }, []);
  return isTouch;
}

/* ── Main export ── */
export function InteractiveMasterplan() {
  usePreloadImages(Object.values(ZONE_IMAGES));
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const activeZoneData = zones.find((z) => z.id === activeZone) || null;
  const isTouch = useIsTouchDevice();

  const handleHover = useCallback((id: string) => { if (!isTouch) setActiveZone(id); }, [isTouch]);
  const handleLeave = useCallback(() => { if (!isTouch) setActiveZone(null); }, [isTouch]);
  const handleTap = useCallback((id: string) => { setActiveZone((prev) => (prev === id ? null : id)); }, []);

  return (
    <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        <RevealOnScroll direction="up" duration={DURATION.normal}>
          <div className="text-center mb-14 sm:mb-18 lg:mb-20">
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="w-8 h-px bg-accent/25" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">Masterplan</p>
              <div className="w-8 h-px bg-accent/25" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em] leading-tight">
              The Layout Defines Everything
            </h2>
            <p className="mt-4 text-sm text-muted-foreground/35 font-serif italic max-w-lg mx-auto leading-relaxed">
              Every movement — horse, rider, vehicle — is considered before a single post goes in the ground.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="up" duration={DURATION.normal} delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8 flex justify-center">
              <SitePlan activeZone={activeZone} onHover={handleHover} onLeave={handleLeave} onTap={handleTap} />
            </div>
            <div className="lg:col-span-4 flex flex-col justify-start pt-4 lg:pt-10">
              <div
                style={{
                  opacity: activeZone ? 0 : 0.35,
                  transform: activeZone ? `translateY(-${DISTANCE.sm}px)` : "translateY(0)",
                  position: activeZone ? "absolute" : "relative",
                  pointerEvents: "none",
                  transition: `opacity ${DURATION.fast}ms ${EASE.interactive}, transform ${DURATION.fast}ms ${EASE.interactive}`,
                }}
              >
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent/25">
                  {isTouch ? "Tap a zone to explore" : "Hover a zone to explore"}
                </p>
              </div>
              <DetailCard zone={activeZoneData} visible={!!activeZone} />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
