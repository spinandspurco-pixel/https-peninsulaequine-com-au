import { useEffect, useRef } from "react";

/**
 * Architectural backdrop — blueprint grid with subtle scroll parallax + grain.
 */
export function GlobalCinematicBackdrop() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY * 0.04;
        el.style.transform = `translateY(${y}px)`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Blueprint grid — moves subtly with scroll */}
      <div ref={gridRef} className="absolute inset-0 engineering-grid" style={{ willChange: "transform" }} />

      {/* Grain texture for tactile depth */}
      <div className="absolute inset-0 grain-texture" />

      {/* Subtle warm vignette at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, hsl(222 20% 3% / 0.4) 100%)`,
        }}
      />
    </div>
  );
}
