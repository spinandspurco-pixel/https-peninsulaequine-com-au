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
  features: string[];
  path: string;
}

const zones: Zone[] = [
  {
    id: "indoor-arena",
    label: "Indoor Arena",
    shortLabel: "Arena",
    description: "Fully enclosed riding space — year-round consistency under load.",
    features: ["24 × 48m clear span", "Arena store below", "Column-free interior"],
    path: "M 195 430 L 545 430 L 545 590 L 195 590 Z",
  },
  {
    id: "stables",
    label: "Stable Block",
    shortLabel: "Stables",
    description: "Two wings with central corridor — structured for airflow and workflow.",
    features: ["Six stables across two wings", "Float access at each entry", "Cross-ventilation design"],
    path: "M 195 120 L 545 120 L 545 260 L 195 260 Z",
  },
  {
    id: "courtyard",
    label: "Central Courtyard",
    shortLabel: "Courtyard",
    description: "The operational spine connecting every zone through one controlled axis.",
    features: ["Tie-up stations", "Direct arena access", "Wash bay adjacent"],
    path: "M 270 260 L 470 260 L 470 380 L 270 380 Z",
  },
  {
    id: "viewing-area",
    label: "Upstairs Viewing",
    shortLabel: "Viewing",
    description: "Elevated mezzanine overlooking the arena with natural light.",
    features: ["Full arena oversight", "Dormer windows", "Internal stair access"],
    path: "M 470 260 L 545 260 L 545 380 L 470 380 Z",
  },
  {
    id: "service-wing",
    label: "Tack & Service",
    shortLabel: "Tack / WC",
    description: "Positioned between stables and arena for efficient daily operations.",
    features: ["Dual tack rooms", "WC and storage", "Direct courtyard access"],
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
  return (
    <div
      className="pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${DISTANCE.sm}px)`,
        transition: `opacity 350ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 350ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
        willChange: "opacity, transform",
      }}
    >
      {zone && (
        <div className="max-w-[280px]">
          {/* Zone label tag */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-accent/30" />
            <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-accent/35">Zone</span>
          </div>

          {/* Zone name */}
          <h3 className="font-serif text-xl sm:text-2xl text-foreground/90 tracking-[0.02em] leading-tight mb-2.5">
            {zone.label}
          </h3>

          {/* Purpose statement */}
          <p className="text-[13px] text-muted-foreground/40 font-serif italic leading-relaxed mb-5">
            {zone.description}
          </p>

          {/* Divider */}
          <div className="w-8 h-px bg-accent/12 mb-4" />

          {/* Feature points */}
          <ul className="space-y-2.5">
            {zone.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1 h-1 rounded-full bg-accent/25 mt-[7px] shrink-0" />
                <span className="text-xs text-muted-foreground/35 font-mono tracking-wide leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
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
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.035" />
        </pattern>
        <pattern id="mp-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.025" />
        </pattern>
        <pattern id="mp-hatch-dense" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.028" />
        </pattern>
        {/* Material fills — arena sand texture */}
        <pattern id="mp-sand" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="hsl(35 20% 18% / 0.28)" />
          <circle cx="1" cy="1" r="0.3" fill="hsl(35 15% 25% / 0.1)" />
          <circle cx="3" cy="3" r="0.25" fill="hsl(35 15% 22% / 0.07)" />
        </pattern>
        {/* Material fills — building solid warm */}
        <pattern id="mp-building" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="hsl(30 12% 16% / 0.35)" />
          <line x1="0" y1="8" x2="8" y2="8" stroke="hsl(30 10% 22% / 0.04)" strokeWidth="0.3" />
        </pattern>
        {/* Material fills — courtyard paving */}
        <pattern id="mp-paving" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="hsl(25 8% 15% / 0.25)" />
          <line x1="3" y1="0" x2="3" y2="6" stroke="hsl(25 8% 20% / 0.028)" strokeWidth="0.2" />
          <line x1="0" y1="3" x2="6" y2="3" stroke="hsl(25 8% 20% / 0.028)" strokeWidth="0.2" />
        </pattern>
        <filter id="mp-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.15" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="mp-zone-active" x="-10%" y="-10%" width="125%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="shadow-blur" />
          <feFlood floodColor="hsl(0 0% 0%)" floodOpacity="0.25" result="shadow-color" />
          <feComposite in="shadow-color" in2="shadow-blur" operator="in" result="shadow" />
          <feOffset in="shadow" dx="1.5" dy="2.5" result="shadow-offset" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow-blur" />
          <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.12" result="glow-color" />
          <feComposite in="glow-color" in2="glow-blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="shadow-offset" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Architectural drop shadow — light from top-left */}
        <filter id="mp-shadow-lg" x="-5%" y="-5%" width="115%" height="120%">
          <feDropShadow dx="2.5" dy="3.5" stdDeviation="4" floodColor="hsl(0 0% 0%)" floodOpacity="0.18" />
        </filter>
        <filter id="mp-shadow-md" x="-5%" y="-5%" width="115%" height="118%">
          <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" floodColor="hsl(0 0% 0%)" floodOpacity="0.12" />
        </filter>
        <filter id="mp-shadow-sm" x="-5%" y="-5%" width="115%" height="115%">
          <feDropShadow dx="1" dy="1.2" stdDeviation="1.5" floodColor="hsl(0 0% 0%)" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Background grid */}
      <rect width="740" height="680" fill="url(#mp-grid)" />

      {/* ── Material zone fills (rendered behind everything) ── */}
      {/* Arena — sand texture, warm */}
      <rect x="195" y="430" width="350" height="160" fill="url(#mp-sand)" rx="1" />
      {/* Stables — solid building tone */}
      <rect x="195" y="120" width="350" height="140" fill="url(#mp-building)" rx="1" />
      {/* Service wing — building tone */}
      <rect x="195" y="260" width="75" height="170" fill="url(#mp-building)" rx="0.5" />
      {/* Viewing area — building tone */}
      <rect x="470" y="260" width="75" height="120" fill="url(#mp-building)" rx="0.5" />
      {/* Courtyard — paving */}
      <rect x="270" y="260" width="200" height="120" fill="url(#mp-paving)" rx="0.5" />
      {/* Central corridor — pathway contrast */}
      <rect x="350" y="120" width="40" height="140" fill="hsl(25 8% 14% / 0.25)" />

      {/* ── Ground plane elevation shadows ── */}
      <rect x="195" y="430" width="350" height="160" fill="hsl(0 0% 0% / 0.06)" filter="url(#mp-shadow-lg)" rx="1" />
      <rect x="195" y="120" width="350" height="140" fill="hsl(0 0% 0% / 0.04)" filter="url(#mp-shadow-md)" rx="1" />
      <rect x="195" y="260" width="75" height="170" fill="hsl(0 0% 0% / 0.03)" filter="url(#mp-shadow-sm)" rx="0.5" />
      <rect x="470" y="260" width="75" height="120" fill="hsl(0 0% 0% / 0.03)" filter="url(#mp-shadow-sm)" rx="0.5" />

      {/* Property boundary */}
      <rect x="155" y="80" width="430" height="560" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.06" strokeDasharray="10 5" />

      {/* ── STABLES WING (top) ── */}
      {/* Float bays */}
      <rect x="195" y="95" width="55" height="25" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.12" />
      <text x="222" y="111" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.15" fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>
      <rect x="490" y="95" width="55" height="25" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.12" />
      <text x="517" y="111" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.15" fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>

      {/* Entry marker */}
      <text x="370" y="110" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.12" fontFamily="monospace" letterSpacing="0.15em">ENTRY</text>

      {/* Central corridor axis */}
      <line x1="370" y1="125" x2="370" y2="255" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="4 4" />

      {/* Stable dividers — left wing */}
      {[0, 1, 2].map((i) => (
        <line key={`sl${i}`} x1={245 + i * 45} y1="125" x2={245 + i * 45} y2="255" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" />
      ))}
      {/* Stable dividers — right wing */}
      {[0, 1, 2].map((i) => (
        <line key={`sr${i}`} x1={415 + i * 45} y1="125" x2={415 + i * 45} y2="255" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" />
      ))}

      {/* Stable number labels */}
      {[1, 2, 3].map((n, i) => (
        <text key={`sln${n}`} x={267 + i * 45} y="195" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity="0.1" fontFamily="monospace">S{n}</text>
      ))}
      {[4, 5, 6].map((n, i) => (
        <text key={`srn${n}`} x={437 + i * 45} y="195" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity="0.1" fontFamily="monospace">S{n}</text>
      ))}

      {/* ── SERVICE WING (left middle) ── */}
      <line x1="197" y1="320" x2="268" y2="320" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" />
      <line x1="197" y1="380" x2="268" y2="380" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" />
      <text x="232" y="295" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.1" fontFamily="monospace">TACK</text>
      <text x="232" y="350" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.1" fontFamily="monospace">WC</text>
      <text x="232" y="410" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.1" fontFamily="monospace">STORE</text>

      {/* ── VIEWING AREA (right middle) ── */}
      <rect x="475" y="265" width="65" height="50" fill="url(#mp-hatch-dense)" stroke="none" opacity="0.25" />
      <text x="507" y="292" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.1" fontFamily="monospace">VIEWING</text>

      {/* ── WASH BAY ── */}
      <rect x="470" y="380" width="75" height="50" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" />
      <text x="507" y="408" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.1" fontFamily="monospace">WASH BAY</text>

      {/* ── ARENA STORE (below arena) ── */}
      <rect x="195" y="590" width="350" height="35" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.08" />
      <text x="370" y="611" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity="0.12" fontFamily="monospace" letterSpacing="0.1em">ARENA STORE</text>

      {/* ── INTERACTIVE ZONE SHAPES ── */}
      {zones.map((z) => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        const center = getCenter(z.path);
        return (
          <g
            key={z.id}
            style={{
              opacity: isDimmed ? 0.2 : 1,
              transform: isActive ? `scale(1.015)` : "scale(1)",
              transformOrigin: `${center.x}px ${center.y}px`,
              transition: "opacity 350ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 350ms cubic-bezier(0.25, 0.1, 0.25, 1)",
              willChange: "opacity, transform",
            }}
            filter={isActive ? "url(#mp-zone-active)" : undefined}
          >
            <path
              d={z.path}
              fill={isActive ? "hsl(var(--accent) / 0.12)" : "hsl(var(--accent) / 0.012)"}
              stroke={isActive ? "hsl(var(--accent) / 0.65)" : "hsl(var(--accent) / 0.1)"}
              strokeWidth={isActive ? "1.4" : "0.6"}
              style={{ transition: "fill 350ms ease, stroke 350ms ease, stroke-width 350ms ease" }}
              className="cursor-pointer"
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={onLeave}
              onClick={() => onTap(z.id)}
            />
            {isActive && (
              <path
                d={z.path}
                fill="none"
                stroke="hsl(var(--accent) / 0.08)"
                strokeWidth="6"
                className="pointer-events-none"
              />
            )}
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isActive ? "7.5" : "7"}
              fontFamily="monospace"
              letterSpacing="0.12em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{ opacity: isActive ? 0.7 : 0.15, transition: "opacity 350ms ease, font-size 350ms ease" }}
            >
              {z.shortLabel}
            </text>
          </g>
        );
      })}

      {/* ── STRUCTURAL COLUMNS ── */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={`cal${i}`} x={193} y={440 + i * 25} width="3" height="3" fill="hsl(var(--accent))" opacity="0.08" rx="0.5" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={`car${i}`} x={544} y={440 + i * 25} width="3" height="3" fill="hsl(var(--accent))" opacity="0.08" rx="0.5" />
      ))}

      {/* ── DIMENSION ANNOTATIONS ── */}
      <g opacity="0.08" fontSize="5" fontFamily="monospace" fill="hsl(var(--accent))">
        <line x1="195" y1="635" x2="545" y2="635" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <line x1="195" y1="631" x2="195" y2="639" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <line x1="545" y1="631" x2="545" y2="639" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <line x1="165" y1="120" x2="165" y2="590" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <line x1="161" y1="120" x2="169" y2="120" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <line x1="161" y1="590" x2="169" y2="590" stroke="hsl(var(--accent))" strokeWidth="0.4" />
      </g>

      {/* ── ROOF LINE ── */}
      <path
        d="M 195 115 L 370 100 L 545 115"
        fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.06" strokeDasharray="6 4"
      />

      {/* ── DRAWING REFERENCE ── */}
      <g opacity="0.1" transform="translate(545, 650)">
        <text x="0" y="0" fontSize="6" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.08em">MAIN RIDGE</text>
        <text x="0" y="10" fontSize="4.5" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.6">PROPOSED GROUND FLOOR</text>
        <text x="0" y="18" fontSize="4" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.4">A 03</text>
      </g>

      {/* ── COMPASS ── */}
      <g opacity="0.1" transform="translate(660, 130)">
        <line x1="0" y1="-16" x2="0" y2="16" stroke="hsl(var(--accent))" strokeWidth="0.5" />
        <line x1="-16" y1="0" x2="16" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.5" />
        <polygon points="0,-18 -3,-12 3,-12" fill="hsl(var(--accent))" opacity="0.3" />
        <text x="0" y="-22" textAnchor="middle" fontSize="6" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
      </g>

      {/* ── PADDOCK ACCESS ── */}
      <text x="178" y="350" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity="0.08" fontFamily="monospace" transform="rotate(-90, 178, 350)">PADDOCK</text>
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

/* ── Camera wrapper — subtle zoom toward active zone ── */
const CAMERA_SCALE = 1.035;
const CAMERA_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const SVG_W = 740;
const SVG_H = 680;

function CameraWrapper({ activeZone, children }: { activeZone: string | null; children: React.ReactNode }) {
  const zone = activeZone ? zones.find((z) => z.id === activeZone) : null;
  const center = zone ? getCenter(zone.path) : null;

  // Convert zone centre to percentage of viewBox for transform-origin
  const originX = center ? (center.x / SVG_W) * 100 : 50;
  const originY = center ? (center.y / SVG_H) * 100 : 50;

  return (
    <div
      className="w-full max-w-[560px]"
      style={{
        transform: zone ? `scale(${CAMERA_SCALE})` : "scale(1)",
        transformOrigin: `${originX}% ${originY}%`,
        transition: `transform 700ms ${CAMERA_EASE}, transform-origin 700ms ${CAMERA_EASE}`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/* ── Tour sequence order ── */
const TOUR_ORDER = ["stables", "courtyard", "service-wing", "viewing-area", "indoor-arena"];
const TOUR_DWELL = 3200;    // time spent on each zone
const TOUR_DISSOLVE = 600;  // fade gap between zones

/* ── Main export ── */
export function InteractiveMasterplan() {
  usePreloadImages(Object.values(ZONE_IMAGES));
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourTransitioning, setTourTransitioning] = useState(false);
  const tourTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeZoneData = zones.find((z) => z.id === activeZone) || null;
  const isTouch = useIsTouchDevice();

  const clearTimer = useCallback(() => {
    if (tourTimer.current) { clearTimeout(tourTimer.current); tourTimer.current = null; }
  }, []);

  const stopTour = useCallback(() => {
    setTourActive(false);
    setTourTransitioning(false);
    clearTimer();
  }, [clearTimer]);

  const startTour = useCallback(() => {
    setTourStep(0);
    setActiveZone(TOUR_ORDER[0]);
    setTourActive(true);
    setTourTransitioning(false);
  }, []);

  useEffect(() => {
    if (!tourActive) return;

    // Phase 1: dwell on current zone, then start dissolve
    tourTimer.current = setTimeout(() => {
      const next = tourStep + 1;
      if (next >= TOUR_ORDER.length) {
        // End of tour — fade out gracefully
        setTourTransitioning(true);
        setActiveZone(null);
        tourTimer.current = setTimeout(() => {
          stopTour();
        }, TOUR_DISSOLVE);
        return;
      }

      // Phase 2: brief dissolve — clear zone, pause, then reveal next
      setTourTransitioning(true);
      setActiveZone(null);

      tourTimer.current = setTimeout(() => {
        setTourStep(next);
        setActiveZone(TOUR_ORDER[next]);
        setTourTransitioning(false);
      }, TOUR_DISSOLVE);
    }, TOUR_DWELL);

    return clearTimer;
  }, [tourActive, tourStep, stopTour, clearTimer]);

  const handleHover = useCallback((id: string) => {
    if (tourActive) return;
    if (!isTouch) setActiveZone(id);
  }, [isTouch, tourActive]);

  const handleLeave = useCallback(() => {
    if (tourActive) return;
    if (!isTouch) setActiveZone(null);
  }, [isTouch, tourActive]);

  const handleTap = useCallback((id: string) => {
    if (tourActive) stopTour();
    setActiveZone((prev) => (prev === id ? null : id));
  }, [tourActive, stopTour]);

  const jumpToStep = useCallback((idx: number) => {
    clearTimer();
    setTourTransitioning(true);
    setActiveZone(null);
    tourTimer.current = setTimeout(() => {
      setTourStep(idx);
      setActiveZone(TOUR_ORDER[idx]);
      setTourTransitioning(false);
    }, TOUR_DISSOLVE / 2);
  }, [clearTimer]);

  /* ── Entrance sequence — fade in, flash primary zone, return to neutral ── */
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [planVisible, setPlanVisible] = useState(false);
  const entranceDone = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || entranceDone.current) return;
    const ENTRANCE_ZONES = ["indoor-arena", "stables"];
    const FADE_IN = 1200;
    const ZONE_DWELL = 2600;
    const DISSOLVE = 700;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entranceDone.current = true;
          observer.disconnect();
          // Phase 1: fade in the plan
          setPlanVisible(true);

          // Phase 2: deliberate two-zone introduction
          let offset = FADE_IN;

          // First zone
          setTimeout(() => {
            setActiveZone(ENTRANCE_ZONES[0]);
            setHasEntered(true);
          }, offset);
          offset += ZONE_DWELL;

          // Dissolve to second zone
          setTimeout(() => setActiveZone(null), offset);
          offset += DISSOLVE;
          setTimeout(() => setActiveZone(ENTRANCE_ZONES[1]), offset);
          offset += ZONE_DWELL;

          // Phase 3: dissolve to neutral and stop
          setTimeout(() => setActiveZone(null), offset);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
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

        <div
          style={{
            opacity: planVisible ? 1 : 0,
            transition: "opacity 1100ms cubic-bezier(0.22, 0.61, 0.36, 1)",
            willChange: "opacity",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8 flex justify-center overflow-hidden rounded-sm">
              <CameraWrapper activeZone={activeZone}>
                <SitePlan activeZone={activeZone} onHover={handleHover} onLeave={handleLeave} onTap={handleTap} />
              </CameraWrapper>
            </div>
            <div className="lg:col-span-4 flex flex-col justify-start pt-4 lg:pt-10">
              {/* Idle state / tour trigger */}
              <div
                style={{
                  opacity: activeZone ? 0 : 1,
                  position: activeZone ? "absolute" : "relative",
                  pointerEvents: activeZone ? "none" : "auto",
                  transition: "opacity 350ms ease",
                }}
              >
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent/25 mb-5">
                  {isTouch ? "Tap a zone to explore" : "Hover a zone to explore"}
                </p>
                {!tourActive && (
                  <button
                    onClick={startTour}
                    className="group flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.25em] text-accent/30 transition-opacity duration-300 hover:text-accent/50"
                  >
                    <span className="w-6 h-px bg-accent/20 group-hover:bg-accent/40 transition-colors duration-300" />
                    Explore the Ridge
                  </button>
                )}
              </div>

              {/* Zone detail card */}
              <DetailCard zone={activeZoneData} visible={!!activeZone} />

              {/* Tour progress / controls */}
              {tourActive && (
                <div
                  className="mt-6"
                  style={{ opacity: 1, transition: "opacity 350ms ease" }}
                >
                  {/* Step indicators */}
                  <div className="flex items-center gap-2 mb-4">
                    {TOUR_ORDER.map((id, idx) => (
                      <button
                        key={id}
                        onClick={() => jumpToStep(idx)}
                        className="relative h-1 flex-1 rounded-full overflow-hidden"
                        style={{ background: "hsl(var(--accent) / 0.08)" }}
                        aria-label={`Go to ${zones.find(z => z.id === id)?.label}`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: idx < tourStep ? "100%" : idx === tourStep ? "100%" : "0%",
                            background: idx <= tourStep ? "hsl(var(--accent) / 0.3)" : "transparent",
                            transition: "width 350ms ease, background 350ms ease",
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent/20">
                      {tourStep + 1} / {TOUR_ORDER.length}
                    </span>
                    <button
                      onClick={() => { stopTour(); setActiveZone(null); }}
                      className="text-[9px] font-mono uppercase tracking-[0.25em] text-accent/20 transition-opacity duration-300 hover:text-accent/40"
                    >
                      Exit tour
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
