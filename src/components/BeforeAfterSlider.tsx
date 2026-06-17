import { useRef, useState, useCallback, useEffect } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  alt?: string;
}

export function BeforeAfterSlider({ before, after, alt = "Transformation" }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    let next = position;
    switch (e.key) {
      case "ArrowLeft": next = Math.max(0, position - step); break;
      case "ArrowRight": next = Math.min(100, position + step); break;
      case "Home": next = 0; break;
      case "End": next = 100; break;
      case "PageUp": next = Math.min(100, position + 10); break;
      case "PageDown": next = Math.max(0, position - 10); break;
      default: return;
    }
    e.preventDefault();
    setHasInteracted(true);
    setPosition(next);
  }, [position]);

  const imgFilter = "brightness(1.0) contrast(1.1) saturate(0.85)";
  // Blur reveal: edge transition zone gets blurred briefly during drag
  const edgeBlur = dragging ? 1.5 : 0;

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
      role="group"
      aria-label={`${alt} — before and after comparison`}
    >
      {/* Screen reader live region */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Showing {Math.round(position)}% raw, {Math.round(100 - position)}% resolved
      </span>

      {/* After (full) */}
      <img
        src={after}
        alt={`${alt} — resolved`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: imgFilter }}
        loading="lazy"
        draggable={false}
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%`, transition: dragging ? "none" : "width 120ms ease-out" }}
      >
        <img
          src={before}
          alt={`${alt} — raw`}
          className="absolute inset-0 h-full object-cover"
          style={{
            width: containerRef.current?.offsetWidth ? `${containerRef.current.offsetWidth}px` : "100%",
            maxWidth: "none",
            filter: imgFilter,
          }}
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Blur reveal mask along divider edge */}
      {edgeBlur > 0 && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `calc(${position}% - 18px)`,
            width: "36px",
            backdropFilter: `blur(${edgeBlur}px)`,
            WebkitBackdropFilter: `blur(${edgeBlur}px)`,
            maskImage: "linear-gradient(to right, transparent, black 50%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 50%, transparent)",
          }}
        />
      )}

      {/* Grain overlay */}
      <div className="absolute inset-0 grain-texture opacity-[0.015] pointer-events-none" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, hsl(222 20% 3% / 0.35) 100%)",
        }}
      />

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          left: `${position}%`,
          background: "linear-gradient(to bottom, transparent, hsl(var(--accent) / 0.5) 20%, hsl(var(--accent) / 0.5) 80%, transparent)",
          transition: dragging ? "none" : "left 120ms ease-out",
        }}
      />

      {/* Draggable handle — keyboard focusable */}
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={`${alt} comparison slider`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)} percent raw, ${Math.round(100 - position)} percent resolved`}
        onKeyDown={handleKeyDown}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 rounded-full transition-opacity duration-300"
        style={{
          left: `${position}%`,
          opacity: dragging ? 1 : 0.85,
          transition: dragging ? "none" : "left 120ms ease-out, opacity 200ms ease-out",
        }}
      >
        <div className="w-11 h-11 rounded-full border border-accent/50 bg-background/50 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/30 group-hover:border-accent/70 transition-colors">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="text-accent/80">
            <path d="M4 7L1 7M1 7L3.5 4.5M1 7L3.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 7L13 7M13 7L10.5 4.5M13 7L10.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span
        className="absolute top-5 left-5 font-mono text-[9px] uppercase tracking-[0.35em] pointer-events-none"
        style={{ color: "hsl(var(--accent) / 0.45)" }}
      >
        Raw
      </span>
      <span
        className="absolute top-5 right-5 font-mono text-[9px] uppercase tracking-[0.35em] pointer-events-none"
        style={{ color: "hsl(var(--accent) / 0.45)" }}
      >
        Resolved
      </span>
    </div>
  );
}
