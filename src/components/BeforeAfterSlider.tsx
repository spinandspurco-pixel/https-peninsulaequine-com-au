import { useRef, useState, useCallback } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  alt?: string;
}

export function BeforeAfterSlider({ before, after, alt = "Transformation" }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
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

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[14/9] overflow-hidden cursor-col-resize select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After (full) */}
      <img
        src={after}
        alt={`${alt} — after`}
        className="absolute inset-0 w-full h-full object-cover"
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
          style={{ width: `${containerRef.current?.offsetWidth || 100}px`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-foreground/30"
        style={{ left: `${position}%` }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-foreground/30 bg-background/60 backdrop-blur-sm flex items-center justify-center"
        style={{ left: `${position}%` }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-foreground/50">
          <path d="M3 6L1 6M1 6L3 4M1 6L3 8" stroke="currentColor" strokeWidth="1" />
          <path d="M9 6L11 6M11 6L9 4M11 6L9 8" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Labels */}
      <span className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
        Before
      </span>
      <span className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
        After
      </span>
    </div>
  );
}
