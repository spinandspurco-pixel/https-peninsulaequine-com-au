import { useState, useCallback, useEffect, useRef } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE } from "@/lib/motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { zones, TOUR_ORDER, TOUR_DWELL, TOUR_DISSOLVE } from "./masterplanData";
import { MasterplanSVG } from "./MasterplanSVG";
import { MasterplanDetailCard } from "./MasterplanDetailCard";

/* ── Image preload ── */
import imgIndoor from "@/assets/walk-arena.jpg";
import imgStables from "@/assets/walk-stables.jpg";
import imgCourtyard from "@/assets/walk-courtyard.jpg";
import imgLoft from "@/assets/walk-loft.jpg";

const PRELOAD = [imgIndoor, imgStables, imgCourtyard, imgLoft];

function usePreloadImages(srcs: string[]) {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    srcs.forEach(src => { const img = new Image(); img.src = src; });
  }, []);
}

/* ── Camera wrapper ── */
const SVG_W = 740;
const SVG_H = 820;
const CAMERA_SCALE = 1.028;

function getCenter(path: string): { x: number; y: number } {
  const nums = path.match(/[\d.]+/g)?.map(Number) || [];
  if (nums.length < 4) return { x: 0, y: 0 };
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}

function CameraWrapper({ activeZone, children }: { activeZone: string | null; children: React.ReactNode }) {
  const zone = activeZone ? zones.find(z => z.id === activeZone) : null;
  const center = zone ? getCenter(zone.path) : null;
  const originX = center ? (center.x / SVG_W) * 100 : 50;
  const originY = center ? (center.y / SVG_H) * 100 : 50;

  return (
    <div
      className="w-full"
      style={{
        transform: zone ? `scale(${CAMERA_SCALE})` : "scale(1)",
        transformOrigin: `${originX}% ${originY}%`,
        transition: "transform 700ms cubic-bezier(0.45, 0, 0.15, 1), transform-origin 700ms cubic-bezier(0.45, 0, 0.15, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/* ── Touch detection ── */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => { setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0); }, []);
  return isTouch;
}

/* ── Mobile zone list ── */
function MobileZoneList({ activeZone, onTap }: { activeZone: string | null; onTap: (id: string) => void }) {
  return (
    <div className="space-y-0.5 mt-6">
      {zones.map(z => {
        const isActive = activeZone === z.id;
        return (
          <button
            key={z.id}
            onClick={() => onTap(z.id)}
            className={`w-full text-left py-2.5 px-4 transition-opacity duration-300 bg-transparent border-0 ${
              isActive ? "opacity-100" : "opacity-35"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-accent/22 w-14 shrink-0">{z.shortLabel}</span>
              <div className="w-2.5 h-px bg-accent/8" />
              <span className={`text-[10px] font-serif italic text-muted-foreground/22 transition-colors duration-300 ${isActive ? "text-foreground/40" : ""}`}>
                {z.tagline}
              </span>
            </div>
            {isActive && (
              <p className="mt-1.5 ml-[4.5rem] text-[10px] text-muted-foreground/18 font-serif leading-relaxed">
                {z.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Main export ── */
interface MasterplanProps {
  onZoneHover?: () => void;
  onZoneLeave?: () => void;
  onZoneChange?: (zoneId: string | null) => void;
}

export function InteractiveMasterplan({ onZoneHover, onZoneLeave, onZoneChange }: MasterplanProps = {}) {
  usePreloadImages(PRELOAD);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  const [activeZone, _setActiveZone] = useState<string | null>(null);
  const setActiveZone = useCallback((id: string | null) => {
    _setActiveZone(id);
    onZoneChange?.(id);
  }, [onZoneChange]);

  const activeZoneData = zones.find(z => z.id === activeZone) || null;

  /* ── Interaction — delayed hover for weighted feel ── */
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = useCallback((id: string) => {
    if (isTouch) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setActiveZone(id);
      onZoneHover?.();
    }, 150);
  }, [isTouch, onZoneHover]);

  const handleLeave = useCallback(() => {
    if (isTouch) return;
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    setActiveZone(null);
    onZoneLeave?.();
  }, [isTouch, onZoneLeave]);

  const handleTap = useCallback((id: string) => {
    setActiveZone(prev => prev === id ? null : id);
  }, []);

  /* ── Entrance ── */
  const sectionRef = useRef<HTMLElement>(null);
  const [planVisible, setPlanVisible] = useState(false);
  const entranceDone = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || entranceDone.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entranceDone.current = true;
          observer.disconnect();
          setPlanVisible(true);
          if (reducedMotion) return;
          setTimeout(() => setActiveZone("indoor-arena"), 1000);
          setTimeout(() => setActiveZone(null), 3200);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Header */}
        <RevealOnScroll direction="up" duration={DURATION.normal}>
          <div className="text-center mb-16 sm:mb-22">
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="w-6 h-px bg-accent/12" />
              <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/18 font-mono">Masterplan</p>
              <div className="w-6 h-px bg-accent/12" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/75 tracking-[0.04em] leading-tight">
              Main Ridge — Ground Floor
            </h2>
            <p className="mt-4 text-[13px] text-muted-foreground/22 font-serif italic max-w-sm mx-auto leading-relaxed tracking-[0.02em]">
              Movement resolved before construction
            </p>
          </div>
        </RevealOnScroll>

        {/* Plan */}
        <div
          style={{
            opacity: planVisible ? 1 : 0,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic}`,
            willChange: "opacity",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
            {/* SVG */}
            <div className="lg:col-span-7 flex justify-center overflow-hidden">
              <CameraWrapper activeZone={activeZone}>
                <MasterplanSVG
                  activeZone={activeZone}
                  buildLayer="finished"
                  showFlows={[]}
                  onHover={handleHover}
                  onLeave={handleLeave}
                  onTap={handleTap}
                />
              </CameraWrapper>
            </div>

            {/* Connector */}
            <div className="hidden lg:flex items-stretch justify-center">
              <div
                className="w-px"
                style={{
                  background: `linear-gradient(to bottom, transparent 10%, hsl(var(--accent) / ${activeZone ? 0.1 : 0.03}) 30%, hsl(var(--accent) / ${activeZone ? 0.1 : 0.03}) 70%, transparent 90%)`,
                  transition: `background ${DURATION.normal}ms ${EASE.default}`,
                  minHeight: "200px",
                }}
              />
            </div>

            {/* Right panel */}
            <div className="lg:col-span-4 flex flex-col justify-start pt-4 lg:pt-10">
              {/* Idle state */}
              <div
                style={{
                  opacity: activeZone ? 0 : 1,
                  position: activeZone ? "absolute" : "relative",
                  pointerEvents: activeZone ? "none" : "auto",
                  transition: `opacity ${DURATION.normal}ms ${EASE.default}`,
                }}
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/15">
                  {isTouch ? "Tap a zone to explore" : "Hover to explore"}
                </p>
              </div>

              {/* Detail */}
              <MasterplanDetailCard zone={activeZoneData} visible={!!activeZone} />

              {/* Authority */}
              <p className="mt-10 text-[9px] font-mono text-accent/8 tracking-[0.2em] uppercase leading-relaxed">
                All circulation resolved at plan level
              </p>
            </div>
          </div>

          {/* Mobile */}
          {isMobile && (
            <MobileZoneList activeZone={activeZone} onTap={handleTap} />
          )}
        </div>
      </div>
    </section>
  );
}
