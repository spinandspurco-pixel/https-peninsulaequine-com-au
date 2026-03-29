import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE } from "@/lib/motion";

/* ── Sequence assets — same site, same angle, 4 phases ── */
import imgStep1 from "@/assets/sequence-1-bare-ground.jpg";
import imgStep2 from "@/assets/sequence-2-base-formation.jpg";
import imgStep3 from "@/assets/sequence-3-system-install.jpg";
import imgStep4 from "@/assets/sequence-4-completed.jpg";

interface Phase {
  id: string;
  label: string;
  step: string;
  image: string;
}

const phases: Phase[] = [
  { id: "site-prep", label: "Site Preparation", step: "01", image: imgStep1 },
  { id: "base", label: "Base Formation", step: "02", image: imgStep2 },
  { id: "system", label: "System Installation", step: "03", image: imgStep3 },
  { id: "complete", label: "Surface Completion", step: "04", image: imgStep4 },
];

/* ── Phase scene ── */
function PhaseScene({ phase, index }: { phase: Phase; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "75vh" }}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <img
          src={phase.image}
          alt={phase.label}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          style={{
            filter: "brightness(0.6) saturate(0.85)",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(1.04)",
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} ${index * 100}ms, transform ${DURATION.cinematic}ms ${EASE.cinematic} ${index * 100}ms`,
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, hsl(var(--background) / 0.75) 0%, hsl(var(--background) / 0.2) 40%, transparent 70%)",
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 grain-texture pointer-events-none" style={{ opacity: 0.4 }} />

      {/* Step label — bottom left, minimal */}
      <div className="absolute bottom-8 left-6 sm:bottom-12 sm:left-10 z-10">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/15 mb-2"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.slow}ms ${EASE.cinematic} 600ms`,
          }}
        >
          {phase.step}
        </p>
        <p
          className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.25em] text-foreground/40"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: `opacity ${DURATION.slow}ms ${EASE.cinematic} 800ms, transform ${DURATION.slow}ms ${EASE.cinematic} 800ms`,
          }}
        >
          {phase.label}
        </p>
      </div>
    </div>
  );
}

/* ── Main export ── */
export function BuildTimeline() {
  return (
    <div className="relative">
      {phases.map((phase, i) => (
        <PhaseScene key={phase.id} phase={phase} index={i} />
      ))}
    </div>
  );
}
