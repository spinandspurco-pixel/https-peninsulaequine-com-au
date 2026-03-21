import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import walkArrival from "@/assets/walk-arrival.jpg";
import walkCourtyard from "@/assets/walk-courtyard.jpg";
import walkArena from "@/assets/walk-arena.jpg";
import walkStables from "@/assets/walk-stables.jpg";
import walkLoft from "@/assets/walk-loft.jpg";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

/* ── Panel data ───────────────────────────────────────── */
const panels = [
  { label: "Arrival", line: "A property shaped by movement.", image: walkArrival },
  { label: "Courtyard", line: "Designed to centre the experience.", image: walkCourtyard },
  { label: "Arena", line: "Engineered for performance.", image: walkArena },
  { label: "Stables", line: "Where craftsmanship meets comfort.", image: walkStables },
  { label: "Viewing Loft", line: "Built to watch everything unfold.", image: walkLoft },
];

/* ── Single panel ─────────────────────────────────────── */
function Panel({
  label,
  line,
  image,
  index,
  reducedMotion,
}: {
  label: string;
  line: string;
  image: string;
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
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
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
          setParallaxY((center - viewCenter) * 0.06);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden"
    >
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: reducedMotion
            ? "scale(1.06)"
            : `translateY(${parallaxY}px) scale(1.06)`,
          transition: `transform ${DURATION.parallax}ms ${EASE.default}`,
        }}
      >
        <img
          src={image}
          alt={label}
          className="w-full h-full object-cover"
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
        />
      </div>

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, hsl(222 20% 6% / 0.25) 0%, hsl(222 20% 6% / 0.45) 50%, hsl(222 20% 6% / 0.7) 100%)",
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      {/* Content — bottom-left, minimal */}
      <div className="absolute inset-0 flex items-end z-10">
        <div className="section-container pb-14 sm:pb-20 lg:pb-24">
          <div
            className="max-w-md"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : `translateY(${DISTANCE.md}px)`,
              transition: `opacity ${DURATION.normal}ms ${EASE.default} 100ms, transform ${DURATION.normal}ms ${EASE.default} 100ms`,
              willChange: "opacity, transform",
            }}
          >
            {/* Step counter + label */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-accent/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="w-6 h-px bg-accent/15" />
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-accent/45">
                {label}
              </span>
            </div>

            {/* Description */}
            <p className="font-serif text-lg sm:text-xl lg:text-2xl italic leading-relaxed tracking-[0.01em] text-foreground/60">
              "{line}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────── */
export function WalkTheProject() {
  const reducedMotion = useReducedMotion();

  return (
    <section>
      {/* Section intro */}
      <div className="py-20 sm:py-28 text-center">
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="w-8 h-px bg-accent/25" />
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
            Walk the Project
          </p>
          <div className="w-8 h-px bg-accent/25" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em]">
          Main Ridge Estate
        </h2>
      </div>

      {/* Panels */}
      {panels.map((p, i) => (
        <Panel
          key={p.label}
          label={p.label}
          line={p.line}
          image={p.image}
          index={i}
          reducedMotion={reducedMotion}
        />
      ))}
    </section>
  );
}
