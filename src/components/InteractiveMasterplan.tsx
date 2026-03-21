import { useState, useCallback, useEffect, useRef } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

/* ── Zone images ──────────────────────────────────── */
import imgArena from "@/assets/main-ridge-arena-grading.jpg";
import imgStables from "@/assets/walk-stables.jpg";
import imgCourtyard from "@/assets/walk-courtyard.jpg";
import imgLoft from "@/assets/walk-loft.jpg";
import imgOutdoor from "@/assets/walk-arena.jpg";

const ZONE_IMAGES: Record<string, string> = {
  "indoor-arena": imgArena,
  "outdoor-arena": imgOutdoor,
  stables: imgStables,
  courtyard: imgCourtyard,
  "viewing-loft": imgLoft,
};

/* ── Zone data ────────────────────────────────────── */
interface Zone {
  id: string;
  label: string;
  description: string;
  path: string;
}

const zones: Zone[] = [
  {
    id: "indoor-arena",
    label: "Indoor Performance Arena",
    description: "A fully enclosed 24 × 64m riding space designed for consistency, safety, and year-round use.",
    path: "M 120 140 L 340 140 L 340 310 L 120 310 Z",
  },
  {
    id: "outdoor-arena",
    label: "Outdoor Arena",
    description: "A 70 × 30m open arena positioned for drainage, light, and natural riding conditions.",
    path: "M 380 100 L 620 100 L 620 290 L 380 290 Z",
  },
  {
    id: "stables",
    label: "Stable Block",
    description: "A structured, breathable environment with integrated drainage, access, and daily workflow efficiency.",
    path: "M 120 350 L 310 350 L 310 480 L 120 480 Z",
  },
  {
    id: "courtyard",
    label: "Central Courtyard Spine",
    description: "The operational core — connecting stables, movement, and access through one controlled axis.",
    path: "M 340 310 L 460 310 L 460 440 L 340 440 Z",
  },
  {
    id: "viewing-loft",
    label: "Viewing Loft",
    description: "An elevated perspective across the arena — built for oversight, atmosphere, and experience.",
    path: "M 490 320 L 620 320 L 620 420 L 490 420 Z",
  },
];

/* ── Preload zone images on mount ─────────────────── */
function usePreloadImages(srcs: string[]) {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    srcs.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
}

/* ── Floating detail card ─────────────────────────── */
function DetailCard({ zone, visible }: { zone: Zone | null; visible: boolean }) {
  const imgSrc = zone ? ZONE_IMAGES[zone.id] : null;
  const [imgError, setImgError] = useState(false);

  // Reset error state when zone changes
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
              <img
                src={imgSrc}
                alt={zone.label}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImgError(true)}
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25">{zone.label}</span>
              </div>
            )}
          </div>
          <h3 className="font-serif text-base sm:text-lg text-foreground/90 tracking-[0.02em] mb-1.5">
            {zone.label}
          </h3>
          <p className="text-xs sm:text-[13px] text-muted-foreground/40 leading-relaxed font-serif italic">
            {zone.description}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Site plan SVG ────────────────────────────────────── */
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
    <svg viewBox="0 0 740 560" className="w-full h-auto max-w-[560px] mx-auto" aria-label="Main Ridge Estate site plan" style={{
      filter: activeZone ? "none" : "none",
      transition: `filter ${DURATION.fast}ms ${EASE.interactive}`,
    }}>
      <defs>
        <pattern id="masterplan-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" />
        </pattern>
      </defs>
      <rect width="740" height="560" fill="url(#masterplan-grid)" />

      {/* Property boundary */}
      <rect x="80" y="60" width="580" height="460" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.1" strokeDasharray="6 4" />

      {/* Access road */}
      <path d="M 80 500 L 80 520 L 400 520 L 400 500" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.08" />
      <text x="240" y="540" textAnchor="middle" fontSize="8" fill="hsl(var(--accent))" opacity="0.15" fontFamily="monospace">ACCESS</text>

      {/* Laneway connectors */}
      <path d="M 310 310 L 340 310 M 340 370 L 340 440 M 460 370 L 490 370" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.08" strokeDasharray="3 3" />

      {/* Zone shapes */}
      {zones.map((z) => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        return (
          <g key={z.id} style={{ opacity: isDimmed ? 0.4 : 1, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}>
            <path
              d={z.path}
              fill={isActive ? "hsl(var(--accent) / 0.07)" : "hsl(var(--accent) / 0.015)"}
              stroke={isActive ? "hsl(var(--accent) / 0.45)" : "hsl(var(--accent) / 0.1)"}
              strokeWidth={isActive ? "1" : "0.5"}
              style={{ transition: `fill ${DURATION.fast}ms ${EASE.interactive}, stroke ${DURATION.fast}ms ${EASE.interactive}, stroke-width ${DURATION.fast}ms ${EASE.interactive}` }}
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
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.1em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{
                opacity: isActive ? 0.6 : 0.2,
                transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
              }}
            >
              {z.label}
            </text>
          </g>
        );
      })}

      {/* Compass rose */}
      <g opacity="0.12" transform="translate(660, 100)">
        <line x1="0" y1="-18" x2="0" y2="18" stroke="hsl(var(--accent))" strokeWidth="0.5" />
        <line x1="-18" y1="0" x2="18" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.5" />
        <text x="0" y="-22" textAnchor="middle" fontSize="7" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
      </g>
    </svg>
  );
}

function getCenter(path: string): { x: number; y: number } {
  const nums = path.match(/[\d.]+/g)?.map(Number) || [];
  if (nums.length < 4) return { x: 0, y: 0 };
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

/* ── Main export ──────────────────────────────────────── */
export function InteractiveMasterplan() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const activeZoneData = zones.find((z) => z.id === activeZone) || null;

  const handleHover = useCallback((id: string) => setActiveZone(id), []);
  const handleLeave = useCallback(() => setActiveZone(null), []);
  const handleTap = useCallback((id: string) => {
    setActiveZone((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Section header */}
        <RevealOnScroll direction="up" duration={DURATION.normal}>
          <div className="text-center mb-14 sm:mb-18 lg:mb-20">
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="w-8 h-px bg-accent/25" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
                Masterplan
              </p>
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

        {/* Plan + Card layout */}
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
                  Tap or hover a zone to explore
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
