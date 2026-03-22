import { useState, useCallback, useEffect, useRef } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE } from "@/lib/motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { zones, TOUR_ORDER, TOUR_DWELL, TOUR_DISSOLVE, type BuildLayer } from "./masterplanData";
import { MasterplanSVG } from "./MasterplanSVG";
import { MasterplanDetailCard } from "./MasterplanDetailCard";
import { MasterplanControls } from "./MasterplanControls";

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
        transition: "transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1), transform-origin 600ms cubic-bezier(0.22, 0.61, 0.36, 1)",
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
    <div className="space-y-1 mt-6">
      {zones.map(z => {
        const isActive = activeZone === z.id;
        return (
          <button
            key={z.id}
            onClick={() => onTap(z.id)}
            className={`w-full text-left py-3 px-4 transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/30 w-14 shrink-0">{z.shortLabel}</span>
              <div className="w-3 h-px bg-accent/10" />
              <span className={`text-[11px] font-serif italic text-muted-foreground/30 transition-colors duration-300 ${isActive ? "text-foreground/50" : ""}`}>
                {z.tagline}
              </span>
            </div>
            {isActive && (
              <p className="mt-2 ml-[4.5rem] text-[11px] text-muted-foreground/25 font-serif leading-relaxed">
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

  /* ── Tour ── */
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

  /* ── Interaction ── */
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
              The Layout Defines Everything
            </h2>
            <p className="mt-4 text-[13px] text-muted-foreground/22 font-serif italic max-w-sm mx-auto leading-relaxed tracking-[0.02em]">
              Consistency is designed long before it is ridden.
            </p>
          </div>
        </RevealOnScroll>

        {/* Plan */}
        <div
          style={{
            opacity: planVisible ? 1 : 0,
            transition: `opacity 1000ms ${EASE.default}`,
            willChange: "opacity",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
            {/* SVG */}
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
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/15 mb-4">
                  {isTouch ? "Tap a zone" : "Hover to explore"}
                </p>
                {!tourActive && (
                  <button
                    onClick={startTour}
                    className="group flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-accent/18 transition-opacity duration-300 hover:text-accent/30"
                  >
                    <span className="w-4 h-px bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300" />
                    Explore the Ridge
                  </button>
                )}
              </div>

              {/* Detail */}
              <MasterplanDetailCard zone={activeZoneData} visible={!!activeZone} />

              {/* Tour progress */}
              {tourActive && (
                <div className="mt-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    {TOUR_ORDER.map((id, idx) => (
                      <button
                        key={id}
                        onClick={() => jumpToStep(idx)}
                        className="relative h-0.5 flex-1 rounded-full overflow-hidden"
                        style={{ background: "hsl(var(--accent) / 0.06)" }}
                        aria-label={`Go to ${zones.find(z => z.id === id)?.label}`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 w-full rounded-full"
                          style={{
                            transform: idx <= tourStep ? "scaleX(1)" : "scaleX(0)",
                            transformOrigin: "left",
                            background: idx <= tourStep ? "hsl(var(--accent) / 0.25)" : "transparent",
                            transition: `transform ${DURATION.normal}ms ${EASE.default}`,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-accent/15">
                      {tourStep + 1} / {TOUR_ORDER.length}
                    </span>
                    <button
                      onClick={() => { stopTour(); setActiveZone(null); }}
                      className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/15 transition-opacity duration-300 hover:text-accent/30"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="mt-8 pt-4 border-t border-border/8">
                <MasterplanControls
                  buildLayer={buildLayer}
                  onBuildLayerChange={setBuildLayer}
                  activeFlows={activeFlows}
                  onToggleFlow={toggleFlow}
                />
              </div>

              {/* Authority */}
              <p className="mt-8 text-[9px] font-mono text-accent/8 tracking-[0.2em] uppercase leading-relaxed">
                Every movement resolved before the first post goes in.
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
