/**
 * MainRidgeLivingOutcome — Emotional resolution section.
 *
 * Full-bleed lifestyle image with subtle parallax,
 * minimal copy overlay, and warm atmospheric tone.
 * Transitions from technical authority to felt result.
 */

import { useRef, useEffect, useState } from "react";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";
import livingImg from "@/assets/living-hero-wide.jpg";

export function MainRidgeLivingOutcome() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [sectionTop, setSectionTop] = useState(0);

  // Intersection observer for reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Subtle parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setSectionTop(rect.top);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const parallaxOffset = Math.max(-30, Math.min(30, sectionTop * -0.025));

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: "85vh" }}
    >
      {/* Background image with parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallaxOffset}px) scale(1.06)`,
          transition: "transform 100ms linear",
        }}
      >
        <img
          src={livingImg}
          alt="Horses in motion at golden hour — Main Ridge Estate, completed equestrian facility"
          className="w-full h-full object-cover"
          loading="lazy"
          style={{
            filter: "saturate(0.85) contrast(1.04) sepia(0.03)",
          }}
        />
      </div>

      {/* Gradient overlays for depth and text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(var(--background) / 0.6) 0%, hsl(var(--background) / 0.25) 35%, hsl(var(--background) / 0.15) 55%, hsl(var(--background) / 0.55) 85%, hsl(var(--background) / 0.85) 100%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 25%, hsl(var(--background) / 0.4) 100%)",
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 grain-hero pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-[85vh] pb-20 sm:pb-28 lg:pb-36 px-6">
        <div className="text-center max-w-lg">
          {/* Primary copy — two lines */}
          <p
            className="font-serif text-2xl sm:text-3xl lg:text-4xl italic leading-relaxed tracking-[0.02em]"
            style={{
              color: "hsl(var(--foreground) / 0.8)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : `translateY(${DISTANCE.md}px)`,
              transition: `opacity ${DURATION.extended}ms ${EASE.cinematic} 400ms, transform ${DURATION.extended}ms ${EASE.cinematic} 400ms`,
            }}
          >
            Held to perform.
            <br />
            Built to last.
          </p>

          {/* Tagline */}
          <p
            className="mt-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.42em]"
            style={{
              color: "hsl(var(--accent))",
              opacity: visible ? 0.28 : 0,
              transform: visible ? "translateY(0)" : `translateY(${DISTANCE.sm}px)`,
              transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 1200ms, transform ${DURATION.cinematic}ms ${EASE.cinematic} 1200ms`,
            }}
          >
            From Dirt to Dynasty
          </p>

          {/* Location whisper */}
          <p
            className="mt-10 font-mono text-[9px] uppercase tracking-[0.45em]"
            style={{
              color: "hsl(var(--accent) / 0.12)",
              opacity: visible ? 1 : 0,
              transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 1800ms`,
            }}
          >
            Main Ridge Estate — Mornington Peninsula
          </p>

          {/* Legacy thread */}
          <p
            className="mt-8 font-mono text-[9px] uppercase tracking-[0.3em]"
            style={{
              color: "hsl(var(--accent) / 0.1)",
              opacity: visible ? 1 : 0,
              transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 2800ms`,
            }}
          >
            Built to perform — year after year.
          </p>
        </div>
      </div>
    </section>
  );
}
