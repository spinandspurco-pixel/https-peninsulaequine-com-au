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
  "service-wing": imgLoft,
};

/* ── Zone data — based on real Main Ridge architectural plans ── */
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
    description: "A fully enclosed performance arena positioned at the south of the complex — designed for year-round consistency.",
    path: "M 180 420 L 560 420 L 560 560 L 180 560 Z",
  },
  {
    id: "stables",
    label: "Stable Block",
    shortLabel: "Stables",
    description: "Six stables across two wings flanking the central corridor — structured for airflow, access, and daily workflow.",
    path: "M 180 140 L 560 140 L 560 280 L 180 280 Z",
  },
  {
    id: "courtyard",
    label: "Central Courtyard",
    shortLabel: "Courtyard",
    description: "The operational spine — connecting stables, arena, and service areas through one controlled axis.",
    path: "M 260 280 L 480 280 L 480 420 L 260 420 Z",
  },
  {
    id: "service-wing",
    label: "Service Wing",
    shortLabel: "Services",
    description: "Tack rooms, wash bay, veterinary access, and storage — positioned for efficient daily operations.",
    path: "M 180 280 L 260 280 L 260 420 L 180 420 Z",
  },
];

/* ── Preload zone images on mount ─────────────────── */
function usePreloadImages(srcs: string[]) {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    srcs.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);
}

/* ── Floating detail card ─────────────────────────── */
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
  activeZone,
  onHover,
  onLeave,
  onTap,
}: {
  activeZone: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  onTap: (id: string) => void;
}) {
  return (
    <svg viewBox="0 0 740 640" className="w-full h-auto max-w-[560px] mx-auto" aria-label="Main Ridge Estate — ground floor plan">
      <defs>
        <pattern id="masterplan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.05" />
        </pattern>
        <pattern id="masterplan-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect width="740" height="640" fill="url(#masterplan-grid)" />

      {/* Property boundary */}
      <rect x="140" y="100" width="460" height="500" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.08" strokeDasharray="8 4" />

      {/* Float/Garage entries — top left and right */}
      <rect x="180" y="108" width="60" height="32" fill="url(#masterplan-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.12" />
      <rect x="500" y="108" width="60" height="32" fill="url(#masterplan-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.12" />
      <text x="210" y="128" textAnchor="middle" fontSize="6" fill="hsl(var(--accent))" opacity="0.18" fontFamily="monospace" letterSpacing="0.12em">FLOAT</text>
      <text x="530" y="128" textAnchor="middle" fontSize="6" fill="hsl(var(--accent))" opacity="0.18" fontFamily="monospace" letterSpacing="0.12em">FLOAT</text>

      {/* Central corridor axis */}
      <line x1="370" y1="140" x2="370" y2="420" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" strokeDasharray="4 4" />

      {/* Stable dividers — left wing */}
      {[0, 1, 2].map((i) => (
        <line key={`sl${i}`} x1={230 + i * 45} y1="140" x2={230 + i * 45} y2="280" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.06" />
      ))}
      {/* Stable dividers — right wing */}
      {[0, 1, 2].map((i) => (
        <line key={`sr${i}`} x1={415 + i * 45} y1="140" x2={415 + i * 45} y2="280" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.06" />
      ))}

      {/* Right service column */}
      <rect x="480" y="280" width="80" height="140" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.06" />
      <text x="520" y="355" textAnchor="middle" fontSize="6" fill="hsl(var(--accent))" opacity="0.12" fontFamily="monospace" letterSpacing="0.1em">WASH / STORE</text>

      {/* Zone shapes — interactive */}
      {zones.map((z) => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        return (
          <g key={z.id} style={{ opacity: isDimmed ? 0.35 : 1, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}>
            <path
              d={z.path}
              fill={isActive ? "hsl(var(--accent) / 0.08)" : "hsl(var(--accent) / 0.015)"}
              stroke={isActive ? "hsl(var(--accent) / 0.5)" : "hsl(var(--accent) / 0.1)"}
              strokeWidth={isActive ? "1" : "0.5"}
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
              fontSize="8"
              fontFamily="monospace"
              letterSpacing="0.12em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{ opacity: isActive ? 0.55 : 0.18, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            >
              {z.shortLabel}
            </text>
          </g>
        );
      })}

      {/* Dimension annotations */}
      <g opacity="0.1" fontSize="6" fontFamily="monospace" fill="hsl(var(--accent))">
        <line x1="180" y1="575" x2="560" y2="575" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="180" y1="572" x2="180" y2="578" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="560" y1="572" x2="560" y2="578" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="155" y1="140" x2="155" y2="560" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="152" y1="140" x2="158" y2="140" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="152" y1="560" x2="158" y2="560" stroke="hsl(var(--accent))" strokeWidth="0.3" />
      </g>

      {/* Drawing reference */}
      <g opacity="0.12" transform="translate(560, 600)">
        <text x="0" y="0" fontSize="6" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.08em">MAIN RIDGE</text>
        <text x="0" y="10" fontSize="5" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.6">PROPOSED GROUND FLOOR</text>
      </g>

      {/* Compass */}
      <g opacity="0.1" transform="translate(660, 140)">
        <line x1="0" y1="-16" x2="0" y2="16" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <line x1="-16" y1="0" x2="16" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <text x="0" y="-20" textAnchor="middle" fontSize="7" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
      </g>
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

/* ── Touch detection ──────────────────────────────────── */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => { setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0); }, []);
  return isTouch;
}

/* ── Main export ──────────────────────────────────────── */
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
