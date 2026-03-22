import { useRef, useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

/* ── Assets ──────────────────────────────────────────── */
import imgSitePrep from "@/assets/mainridge-phase-site.jpg";
import imgGroundlock from "@/assets/mainridge-phase-ground.jpg";
import imgStructure from "@/assets/mainridge-phase-structure.jpg";
import imgEnvelope from "@/assets/mainridge-phase-envelope.jpg";
import imgFinished from "@/assets/mainridge-phase-finished.jpg";
import imgBefore from "@/assets/mainridge-phase-site.jpg";
import imgAfter from "@/assets/mainridge-phase-finished.jpg";

/* ── Phase data ──────────────────────────────────────── */
interface Phase {
  id: string;
  label: string;
  step: string;
  line: string;
  image: string;
  brightness: number;
  scale: number;
  overlayOpacity: number;
}

const phases: Phase[] = [
  {
    id: "site-prep",
    label: "Site Preparation",
    step: "01",
    line: "Starts below the surface",
    image: imgSitePrep,
    brightness: 0.72,
    scale: 1.06,
    overlayOpacity: 0.5,
  },
  {
    id: "groundlock",
    label: "Ground System",
    step: "02",
    line: "Stability, locked in early",
    image: imgGroundlock,
    brightness: 0.78,
    scale: 1.05,
    overlayOpacity: 0.45,
  },
  {
    id: "structure",
    label: "Structure",
    step: "03",
    line: "Load paths defined",
    image: imgStructure,
    brightness: 0.82,
    scale: 1.07,
    overlayOpacity: 0.4,
  },
  {
    id: "envelope",
    label: "Envelope",
    step: "04",
    line: "Form takes shape",
    image: imgEnvelope,
    brightness: 0.75,
    scale: 1.06,
    overlayOpacity: 0.45,
  },
  {
    id: "finished",
    label: "Finished System",
    step: "05",
    line: "Ready for use. Built to last",
    image: imgFinished,
    brightness: 0.68,
    scale: 1.04,
    overlayOpacity: 0.52,
  },
];

/* ── Phase scene ─────────────────────────────────────── */
function PhaseScene({
  phase,
  index,
  reducedMotion,
}: {
  phase: Phase;
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          setParallaxY((center - viewCenter) * 0.04);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return (
    <div ref={ref} className="relative w-full h-[75vh] sm:h-[85vh] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: reducedMotion
            ? `scale(${phase.scale})`
            : `translateY(${parallaxY}px) scale(${phase.scale})`,
          transition: `transform ${DURATION.parallax}ms ${EASE.cinematic}`,
        }}
      >
        <img
          src={phase.image}
          alt={phase.label}
          className="w-full h-full object-cover"
          style={{ filter: `brightness(${phase.brightness})` }}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--background) / 0.15) 0%, hsl(var(--background) / ${phase.overlayOpacity}) 45%, hsl(var(--background) / 0.8) 100%)`,
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-end">
        <div className="section-container pb-16 sm:pb-24 lg:pb-28">
          <div className="max-w-lg">
            {/* Phase label */}
            <div
              className="flex items-center gap-4 mb-5"
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity ${DURATION.slow}ms ${EASE.cinematic} 400ms`,
                willChange: "opacity",
              }}
            >
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-accent/20">
                {phase.step}
              </span>
              <div className="w-8 h-px bg-accent/10" />
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.35em] uppercase text-accent/30">
                {phase.label}
              </span>
            </div>

            {/* Quote */}
            <p
              className="font-serif text-xl sm:text-2xl lg:text-3xl italic leading-relaxed tracking-[0.01em] text-foreground/55"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : `translateY(${DISTANCE.sm}px)`,
                transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 800ms, transform ${DURATION.cinematic}ms ${EASE.cinematic} 800ms`,
                willChange: "opacity, transform",
              }}
            >
              "{phase.line}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Before/After comparison ─────────────────────────── */
function BeforeAfter({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Auto-toggle after becoming visible */
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setShowAfter(true), 1800);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <div ref={ref} className="relative w-full h-[65vh] sm:h-[75vh] overflow-hidden">
      {/* Before image */}
      <div className="absolute inset-0">
        <img
          src={imgBefore}
          alt="Raw site before construction"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.65)" }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* After image crossfade */}
      <div
        className="absolute inset-0"
        style={{
          opacity: showAfter ? 1 : 0,
          transition: `opacity ${reducedMotion ? 300 : 1200}ms ${EASE.cinematic}`,
        }}
      >
        <img
          src={imgAfter}
          alt="Finished Main Ridge Estate"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.7)" }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--background) / 0.2) 0%, hsl(var(--background) / 0.55) 50%, hsl(var(--background) / 0.8) 100%)`,
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div
          className="text-center max-w-md px-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : `translateY(${DISTANCE.md}px)`,
            transition: `opacity ${DURATION.slow}ms ${EASE.default} 300ms, transform ${DURATION.slow}ms ${EASE.default} 300ms`,
          }}
        >
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent/20 mb-6">
            {showAfter ? "After" : "Before"}
          </p>
          <p className="font-serif text-xl sm:text-2xl italic text-foreground/50 leading-relaxed mb-8">
            "Ground to system"
          </p>

          {/* Toggle */}
          <button
            onClick={() => setShowAfter((v) => !v)}
            className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/25 transition-opacity duration-300 hover:text-accent/40"
          >
            {showAfter ? "View Before" : "View After"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step navigation ─────────────────────────────────── */
function TimelineNav({
  activeIndex,
  total,
  onNavigate,
}: {
  activeIndex: number;
  total: number;
  onNavigate: (idx: number) => void;
}) {
  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className="group flex items-center gap-2"
          aria-label={`Go to phase ${i + 1}`}
        >
          <div
            className="w-px transition-all duration-500"
            style={{
              height: i === activeIndex ? "22px" : "8px",
              background:
                i === activeIndex
                  ? "hsl(var(--accent) / 0.35)"
                  : i < activeIndex
                  ? "hsl(var(--accent) / 0.12)"
                  : "hsl(var(--accent) / 0.05)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────── */
export function BuildTimeline() {
  const reducedMotion = useReducedMotion();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activePhase, setActivePhase] = useState(0);
  const totalSections = phases.length + 1; // +1 for before/after

  /* Track active section */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, idx) => {
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActivePhase(idx);
        },
        { threshold: 0.5 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const setRef = useCallback(
    (idx: number) => (el: HTMLDivElement | null) => {
      sectionRefs.current[idx] = el;
    },
    []
  );

  const navigateTo = useCallback((idx: number) => {
    const el = sectionRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  /* Preload first 2 */
  useEffect(() => {
    phases.slice(0, 2).forEach((p) => {
      const img = new Image();
      img.src = p.image;
    });
  }, []);

  return (
    <section className="relative">
      {/* Header */}
      <div className="py-24 sm:py-32 text-center">
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="w-10 h-px bg-accent/15" />
          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/22 font-mono">
            Build Timeline
          </p>
          <div className="w-10 h-px bg-accent/15" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/85 tracking-[0.04em]">
          Construction Sequence
        </h2>
        <p className="mt-4 text-[11px] sm:text-[12px] text-muted-foreground/25 font-serif italic max-w-xs mx-auto leading-relaxed tracking-[0.02em]">
          Engineered layer by layer
        </p>
      </div>

      {/* Progress nav */}
      <TimelineNav
        activeIndex={activePhase}
        total={totalSections}
        onNavigate={navigateTo}
      />

      {/* Phase scenes */}
      {phases.map((phase, i) => (
        <div key={phase.id} ref={setRef(i)}>
          <PhaseScene phase={phase} index={i} reducedMotion={reducedMotion} />
        </div>
      ))}

      {/* Before/After */}
      <div ref={setRef(phases.length)}>
        <BeforeAfter reducedMotion={reducedMotion} />
      </div>

      {/* Authority close */}
      <div className="py-20 sm:py-28 text-center">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent/12 leading-relaxed">
          Performance held in every layer
        </p>
      </div>
    </section>
  );
}
