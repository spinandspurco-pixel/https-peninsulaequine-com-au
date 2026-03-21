import { useState, useCallback } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

/* ── Zone data ────────────────────────────────────────── */
interface Zone {
  id: string;
  label: string;
  description: string;
  /** SVG path for the zone hotspot */
  path: string;
}

const zones: Zone[] = [
  {
    id: "indoor-arena",
    label: "Indoor Arena",
    description:
      "24×64 enclosed performance arena engineered for all-weather riding.",
    path: "M 120 140 L 340 140 L 340 310 L 120 310 Z",
  },
  {
    id: "outdoor-arena",
    label: "Outdoor Arena",
    description:
      "60×30 competition-grade surface with engineered drainage and GroundLock base.",
    path: "M 380 100 L 620 100 L 620 290 L 380 290 Z",
  },
  {
    id: "stables",
    label: "Stables",
    description:
      "Six premium loose boxes with breezeway aisle and automated ventilation.",
    path: "M 120 350 L 310 350 L 310 480 L 120 480 Z",
  },
  {
    id: "courtyard",
    label: "Courtyard",
    description:
      "Central hardscape courtyard connecting all facilities with flush drainage.",
    path: "M 340 310 L 460 310 L 460 440 L 340 440 Z",
  },
  {
    id: "viewing-loft",
    label: "Viewing Loft",
    description:
      "Elevated observation lounge with full arena sightlines and climate control.",
    path: "M 490 320 L 620 320 L 620 420 L 490 420 Z",
  },
];

/* ── Floating detail card ─────────────────────────────── */
function DetailCard({
  zone,
  visible,
}: {
  zone: Zone | null;
  visible: boolean;
}) {
  return (
    <div
      className="pointer-events-none transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {zone && (
        <div className="border border-accent/15 bg-card/90 backdrop-blur-sm rounded-sm p-5 sm:p-6 max-w-[280px]">
          {/* Image placeholder */}
          <div className="w-full aspect-[16/10] bg-accent/[0.04] border border-accent/10 rounded-sm mb-4 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-accent/20"
            >
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg text-foreground tracking-[0.02em] mb-2">
            {zone.label}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-muted-foreground/50 leading-relaxed font-serif italic">
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
}: {
  activeZone: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  return (
    <svg
      viewBox="0 0 740 560"
      className="w-full h-auto max-w-[600px] mx-auto"
      aria-label="Main Ridge Estate site plan"
    >
      {/* Background grid — faint architectural reference */}
      <defs>
        <pattern
          id="masterplan-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="0.3"
            opacity="0.08"
          />
        </pattern>
      </defs>
      <rect width="740" height="560" fill="url(#masterplan-grid)" />

      {/* Property boundary */}
      <rect
        x="80"
        y="60"
        width="580"
        height="460"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.5"
        opacity="0.12"
        strokeDasharray="6 4"
      />

      {/* Access road */}
      <path
        d="M 80 500 L 80 520 L 400 520 L 400 500"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.6"
        opacity="0.1"
      />
      <text
        x="240"
        y="540"
        textAnchor="middle"
        fontSize="8"
        fill="hsl(var(--accent))"
        opacity="0.2"
        fontFamily="monospace"
      >
        ACCESS
      </text>

      {/* Laneway connectors */}
      <path
        d="M 310 310 L 340 310 M 340 370 L 340 440 M 460 370 L 490 370"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.4"
        opacity="0.1"
        strokeDasharray="3 3"
      />

      {/* Zone shapes */}
      {zones.map((z) => {
        const isActive = activeZone === z.id;
        return (
          <g key={z.id}>
            <path
              d={z.path}
              fill={isActive ? "rgba(198,168,107,0.08)" : "rgba(198,168,107,0.02)"}
              stroke={
                isActive
                  ? "rgba(198,168,107,0.5)"
                  : "rgba(198,168,107,0.12)"
              }
              strokeWidth={isActive ? "1.2" : "0.6"}
              className="transition-all duration-300 ease-out cursor-pointer"
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={onLeave}
            />
            {/* Zone label */}
            <text
              x={getCenter(z.path).x}
              y={getCenter(z.path).y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.1em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase transition-opacity duration-300"
              opacity={isActive ? 0.7 : 0.25}
            >
              {z.label}
            </text>
          </g>
        );
      })}

      {/* Compass rose */}
      <g opacity="0.15" transform="translate(660, 100)">
        <line
          x1="0"
          y1="-18"
          x2="0"
          y2="18"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
        />
        <line
          x1="-18"
          y1="0"
          x2="18"
          y2="0"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
        />
        <text
          x="0"
          y="-22"
          textAnchor="middle"
          fontSize="7"
          fill="hsl(var(--accent))"
          fontFamily="monospace"
        >
          N
        </text>
      </g>
    </svg>
  );
}

/** Extract centre point from a simple rect-like path */
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

  return (
    <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      {/* Grain */}
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Section header */}
        <RevealOnScroll direction="up" duration={700}>
          <div className="text-center mb-16 sm:mb-20">
            <div className="flex items-center justify-center gap-5 mb-6">
              <div className="w-8 h-px bg-accent/30" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/40 font-mono">
                Masterplan
              </p>
              <div className="w-8 h-px bg-accent/30" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-[0.03em] leading-tight">
              Main Ridge Estate
            </h2>
            <p className="mt-4 text-sm text-muted-foreground/35 font-serif italic max-w-md mx-auto">
              Five integrated zones, one seamless property
            </p>
          </div>
        </RevealOnScroll>

        {/* Plan + Card layout */}
        <RevealOnScroll direction="up" duration={800} delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Site plan — center */}
            <div className="lg:col-span-8 flex justify-center">
              <SitePlan
                activeZone={activeZone}
                onHover={handleHover}
                onLeave={handleLeave}
              />
            </div>

            {/* Detail card — right */}
            <div className="lg:col-span-4 flex flex-col justify-start pt-4 lg:pt-12">
              {/* Default state */}
              <div
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: activeZone ? 0 : 0.4,
                  transform: activeZone ? "translateY(-4px)" : "translateY(0)",
                  position: activeZone ? "absolute" : "relative",
                  pointerEvents: "none",
                }}
              >
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent/30">
                  Hover a zone to explore
                </p>
              </div>

              {/* Active card */}
              <DetailCard zone={activeZoneData} visible={!!activeZone} />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
