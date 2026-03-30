import { useState, useCallback, useEffect, useRef } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE } from "@/lib/motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { zones } from "./masterplanData";
import { MasterplanSVG } from "./MasterplanSVG";

/* ── Touch detection ── */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => { setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0); }, []);
  return isTouch;
}

/* ── Main export ── */
interface MasterplanProps {
  onZoneHover?: () => void;
  onZoneLeave?: () => void;
  onZoneChange?: (zoneId: string | null) => void;
  externalActiveZone?: string | null;
}

export function InteractiveMasterplan({ onZoneHover, onZoneLeave, onZoneChange, externalActiveZone }: MasterplanProps = {}) {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  const [internalZone, _setActiveZone] = useState<string | null>(null);
  const activeZone = externalActiveZone !== undefined ? externalActiveZone : internalZone;
  const setActiveZone = useCallback((id: string | null) => {
    _setActiveZone(id);
    onZoneChange?.(id);
  }, [onZoneChange]);

  const activeZoneData = zones.find(z => z.id === activeZone) || null;

  /* ── Interaction — delayed hover ── */
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = useCallback((id: string) => {
    if (isTouch) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setActiveZone(id);
      onZoneHover?.();
    }, 120);
  }, [isTouch, onZoneHover]);

  const handleLeave = useCallback(() => {
    if (isTouch) return;
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    setActiveZone(null);
    onZoneLeave?.();
  }, [isTouch, onZoneLeave]);

  const handleTap = useCallback((id: string) => {
    _setActiveZone(prev => {
      const next = prev === id ? null : id;
      onZoneChange?.(next);
      return next;
    });
  }, [onZoneChange]);

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
      { threshold: 0.15 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="relative z-10 px-4 sm:px-6">
        {/* Header */}
        <RevealOnScroll direction="up" duration={DURATION.normal}>
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="w-6 h-px bg-accent/12" />
              <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/18 font-mono">Masterplan</p>
              <div className="w-6 h-px bg-accent/12" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/75 tracking-[0.04em] leading-tight">
              Main Ridge — Ground Floor
            </h2>
          </div>
        </RevealOnScroll>

        {/* Full-width masterplan */}
        <div
          className="max-w-5xl mx-auto"
          style={{
            opacity: planVisible ? 1 : 0,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic}`,
          }}
        >
          <MasterplanSVG
            activeZone={activeZone}
            buildLayer="finished"
            showFlows={[]}
            onHover={handleHover}
            onLeave={handleLeave}
            onTap={handleTap}
          />

          {/* Zone label — appears below plan on hover */}
          <div
            className="text-center mt-8"
            style={{
              opacity: activeZoneData ? 1 : 0,
              transform: activeZoneData ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 400ms cubic-bezier(0.45,0,0.15,1), transform 400ms cubic-bezier(0.45,0,0.15,1)",
              minHeight: "2.5rem",
            }}
          >
            {activeZoneData && (
              <>
                <p className="font-serif text-sm sm:text-base text-foreground/45 tracking-[0.04em]">
                  {activeZoneData.label}
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-accent/15">
                  {activeZoneData.tagline}
                </p>
              </>
            )}
          </div>

          {/* Idle hint */}
          <div
            className="text-center mt-4"
            style={{
              opacity: activeZoneData ? 0 : 0.6,
              transition: "opacity 400ms ease",
            }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/12">
              {isTouch ? "Tap a zone to explore" : "Hover to explore"}
            </p>
          </div>

          {/* Mobile zone list */}
          {isMobile && (
            <div className="space-y-0.5 mt-8">
              {zones.map(z => {
                const isActive = activeZone === z.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => handleTap(z.id)}
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
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
