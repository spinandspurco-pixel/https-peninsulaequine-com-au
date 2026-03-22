import { useState, useCallback, useEffect, useRef } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE } from "@/lib/motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { zones, TOUR_ORDER, TOUR_DWELL, TOUR_DISSOLVE, type BuildLayer } from "./masterplanData";
import { MasterplanSVG } from "./MasterplanSVG";
import { MasterplanDetailCard } from "./MasterplanDetailCard";
import { MasterplanControls } from "./MasterplanControls";

/* ── Image preload ─────────────────────────────────── */
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

/* ── Camera wrapper — subtle zoom toward active zone ── */
const SVG_W = 740;
const SVG_H = 700;
const CAMERA_SCALE = 1.035;

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
        transition: "transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1), transform-origin 700ms cubic-bezier(0.22, 0.61, 0.36, 1)",
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

/* ── Mobile zone cards ── */
function MobileZoneCards({ activeZone, onTap }: { activeZone: string | null; onTap: (id: string) => void }) {
  return (
    <div className="space-y-2 mt-6">
      {zones.map(z => {
        const isActive = activeZone === z.id;
        return (
          <button
            key={z.id}
            onClick={() => onTap(z.id)}
            className={`w-full text-left p-4 border transition-all duration-300 ${
              isActive
                ? "border-accent/20 bg-accent/5"
                : "border-border/30 bg-transparent"
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/25">{z.shortLabel}</span>
              {isActive && <div className="w-4 h-px bg-accent/20" />}
            </div>
            {isActive && (
              <div className="mt-2">
                <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-accent/35 mb-1">{z.tagline}</p>
                <p className="text-xs text-muted-foreground/30 font-serif italic leading-relaxed">{z.description}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Main export ── */
export function InteractiveMasterplan() {
  usePreloadImages(PRELOAD);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [buildLayer, setBuildLayer] = useState<BuildLayer>("finished");
  const [activeFlows, setActiveFlows] = useState<string[]>([]);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const tourTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeZoneData = zones.find(z => z.id === activeZone) || null;

  /* ── Tour logic ── */
  const clearTimer = useCallback(() => {
    if (tourTimer.current) { clearTimeout(tourTimer.current); tourTimer.current = null; }
  }, []);

  const stopTour = useCallback(() => {
    setTourActive(false);
    clearTimer();
  }, [clearTimer]);

  const startTour = useCallback(() => {
    setTourStep(0);
    setActiveZone(TOUR_ORDER[0]);
    setTourActive(true);
  }, []);

  useEffect(() => {
    if (!tourActive) return;
    tourTimer.current = setTimeout(() => {
      const next = tourStep + 1;
      if (next >= TOUR_ORDER.length) {
        setActiveZone(null);
        tourTimer.current = setTimeout(stopTour, TOUR_DISSOLVE);
        return;
      }
      setActiveZone(null);
      tourTimer.current = setTimeout(() => {
        setTourStep(next);
        setActiveZone(TOUR_ORDER[next]);
      }, TOUR_DISSOLVE);
    }, TOUR_DWELL);
    return clearTimer;
  }, [tourActive, tourStep, stopTour, clearTimer]);

  const jumpToStep = useCallback((idx: number) => {
    clearTimer();
    setActiveZone(null);
    tourTimer.current = setTimeout(() => {
      setTourStep(idx);
      setActiveZone(TOUR_ORDER[idx]);
    }, TOUR_DISSOLVE / 2);
  }, [clearTimer]);

  /* ── Hover / tap ── */
  const handleHover = useCallback((id: string) => {
    if (tourActive || isTouch) return;
    setActiveZone(id);
  }, [isTouch, tourActive]);

  const handleLeave = useCallback(() => {
    if (tourActive || isTouch) return;
    setActiveZone(null);
  }, [isTouch, tourActive]);

  const handleTap = useCallback((id: string) => {
    if (tourActive) stopTour();
    setActiveZone(prev => prev === id ? null : id);
  }, [tourActive, stopTour]);

  const toggleFlow = useCallback((id: string) => {
    setActiveFlows(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  /* ── Entrance sequence ── */
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
          // Cinematic entrance: flash two primary zones
          const FADE_IN = 1200;
          const ZONE_DWELL = 2400;
          const DISSOLVE = 600;
          let offset = FADE_IN;
          setTimeout(() => setActiveZone("indoor-arena"), offset);
          offset += ZONE_DWELL;
          setTimeout(() => setActiveZone(null), offset);
          offset += DISSOLVE;
          setTimeout(() => setActiveZone("stables"), offset);
          offset += ZONE_DWELL;
          setTimeout(() => setActiveZone(null), offset);
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

        {/* Plan container */}
        <div
          style={{
            opacity: planVisible ? 1 : 0,
            transition: `opacity 1100ms ${EASE.default}`,
            willChange: "opacity",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
            {/* SVG plan */}
            <div className="lg:col-span-7 flex justify-center overflow-hidden">
              <CameraWrapper activeZone={activeZone}>
                <MasterplanSVG
                  activeZone={activeZone}
                  buildLayer={buildLayer}
                  showFlows={activeFlows}
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
                  background: `linear-gradient(to bottom, transparent 10%, hsl(var(--accent) / ${activeZone ? 0.12 : 0.04}) 30%, hsl(var(--accent) / ${activeZone ? 0.12 : 0.04}) 70%, transparent 90%)`,
                  transition: `background ${DURATION.normal}ms ${EASE.default}`,
                  minHeight: "200px",
                }}
              />
            </div>

            {/* Right panel */}
            <div className="lg:col-span-4 flex flex-col justify-start pt-4 lg:pt-6">
              {/* Idle / tour trigger */}
              <div
                style={{
                  opacity: activeZone ? 0 : 1,
                  position: activeZone ? "absolute" : "relative",
                  pointerEvents: activeZone ? "none" : "auto",
                  transition: `opacity ${DURATION.normal}ms ${EASE.default}`,
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

              {/* Detail card */}
              <MasterplanDetailCard zone={activeZoneData} visible={!!activeZone} />

              {/* Tour progress */}
              {tourActive && (
                <div className="mt-6">
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
                          className="absolute inset-y-0 left-0 w-full rounded-full"
                          style={{
                            transform: idx <= tourStep ? "scaleX(1)" : "scaleX(0)",
                            transformOrigin: "left",
                            background: idx <= tourStep ? "hsl(var(--accent) / 0.3)" : "transparent",
                            transition: `transform ${DURATION.normal}ms ${EASE.default}`,
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

              {/* Controls — build layers & flow toggles */}
              <div className="mt-8 pt-6 border-t border-border/20">
                <MasterplanControls
                  buildLayer={buildLayer}
                  onBuildLayerChange={setBuildLayer}
                  activeFlows={activeFlows}
                  onToggleFlow={toggleFlow}
                />
              </div>
            </div>
          </div>

          {/* Mobile zone cards */}
          {isMobile && (
            <MobileZoneCards activeZone={activeZone} onTap={handleTap} />
          )}
        </div>
      </div>
    </section>
  );
}
