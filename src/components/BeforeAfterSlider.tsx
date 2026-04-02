import { useRef, useState, useCallback, useEffect } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  alt?: string;
}

export function BeforeAfterSlider({ before, after, alt = "Transformation" }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  /* ── Reveal on scroll ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Auto-sweep hint when first visible ── */
  useEffect(() => {
    if (!isVisible || hasInteracted) return;
    let frame: number;
    const start = performance.now();
    const duration = 2200;

    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-in-out sweep from 50 → 30 → 70 → 50
      const eased = t < 0.33
        ? 50 - 20 * (t / 0.33)
        : t < 0.66
        ? 30 + 40 * ((t - 0.33) / 0.33)
        : 70 - 20 * ((t - 0.66) / 0.34);
      setPosition(eased);
      if (t < 1) frame = requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => { frame = requestAnimationFrame(animate); }, 600);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [isVisible, hasInteracted]);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    setHasInteracted(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    updatePosition(e.clientX);
  }, [dragging, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const imgFilter = "brightness(1.0) contrast(1.1) saturate(0.85)";

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden cursor-col-resize select-none group"
      style={{
        aspectRatio: "16 / 9",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 1s ease-out, transform 1s ease-out",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After (full) */}
      <img
        src={after}
        alt={`${alt} — after`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: imgFilter }}
        loading="lazy"
        draggable={false}
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before}
          alt={`${alt} — before`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            width: `${containerRef.current?.offsetWidth || 100}px`,
            maxWidth: "none",
            filter: imgFilter,
          }}
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Grain overlay for texture consistency */}
      <div className="absolute inset-0 grain-texture opacity-[0.015] pointer-events-none" />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, hsl(222 20% 3% / 0.35) 100%)",
        }}
      />

      {/* Divider line — architectural */}
      <div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          left: `${position}%`,
          background: "linear-gradient(to bottom, transparent, hsl(var(--accent) / 0.5) 20%, hsl(var(--accent) / 0.5) 80%, transparent)",
        }}
      />

      {/* Handle — minimal */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300"
        style={{
          left: `${position}%`,
          opacity: dragging ? 1 : 0.7,
        }}
      >
        <div className="w-9 h-9 rounded-full border border-accent/40 bg-background/40 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/20">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent/70">
            <path d="M4 7L1 7M1 7L3.5 4.5M1 7L3.5 9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M10 7L13 7M13 7L10.5 4.5M13 7L10.5 9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span
        className="absolute top-5 left-5 font-mono text-[9px] uppercase tracking-[0.35em] pointer-events-none transition-opacity duration-500"
        style={{ color: "hsl(var(--accent) / 0.45)" }}
      >
        Raw
      </span>
      <span
        className="absolute top-5 right-5 font-mono text-[9px] uppercase tracking-[0.35em] pointer-events-none transition-opacity duration-500"
        style={{ color: "hsl(var(--accent) / 0.45)" }}
      >
        Resolved
      </span>
    </div>
  );
}
