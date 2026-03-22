import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LAYERS = [
  {
    label: "Panel + Infill",
    depth: "75–100mm",
    desc: "Interlocking structure distributes load and prevents surface breakdown.",
    color: "bg-accent/10 border-accent/20",
    activeColor: "bg-accent/20 border-accent/50",
  },
  {
    label: "Bedding Layer",
    depth: "25–50mm",
    desc: "Creates a stable, level base for long-term performance.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
  },
  {
    label: "Sub-Base",
    depth: "100–150mm",
    desc: "Compacted aggregate allowing water to drain while maintaining strength.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
  },
  {
    label: "Geotextile",
    depth: "~1mm",
    desc: "Separates layers to prevent contamination and movement.",
    color: "bg-accent/8 border-accent/15",
    activeColor: "bg-accent/15 border-accent/40",
  },
  {
    label: "Subgrade",
    depth: "Native",
    desc: "Trimmed and compacted native soil — the foundation of everything above.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
  },
];

export function InteractiveLayerStack() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((i: number) => {
    setActiveIndex((prev) => (prev === i ? null : i));
  }, []);

  // Scroll-triggered sequential reveal: bottom layer first, top layer last
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reveal layers from bottom (Subgrade) to top (Panel + Infill)
          const reversed = LAYERS.length;
          let count = 0;
          const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= reversed) clearInterval(interval);
          }, 180);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      {LAYERS.map((layer, i) => {
        const isActive = activeIndex === i;
        // Reverse order: bottom layer (index 4) appears first
        const revealIndex = LAYERS.length - 1 - i;
        const isVisible = visibleCount > revealIndex;

        return (
          <button
            key={i}
            type="button"
            className={cn(
              "w-full text-left flex items-center gap-4 p-4 border cursor-pointer",
              "transition-all duration-700 ease-out",
              isActive ? layer.activeColor : layer.color,
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            )}
            onClick={() => handleClick(i)}
          >
            <span className="text-[10px] font-mono text-muted-foreground/50 w-20 tabular-nums shrink-0">
              {layer.depth}
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isActive ? "text-accent" : "text-foreground"
              )}>
                {layer.label}
              </p>
              {isActive && (
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed mt-1.5">
                  {layer.desc}
                </p>
              )}
            </div>
            <div className={cn(
              "w-1 h-8 rounded-full shrink-0",
              isActive ? "bg-accent" : "bg-border"
            )} />
          </button>
        );
      })}
    </div>
  );
}
