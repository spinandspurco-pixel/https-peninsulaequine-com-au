import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LAYERS = [
  {
    label: "Panel + Infill",
    depth: "75–100mm",
    desc: "Interlocking structure distributes load and prevents surface breakdown.",
    color: "bg-accent/10 border-accent/20",
    activeColor: "bg-accent/20 border-accent/50",
    isPanel: true,
  },
  {
    label: "Bedding Layer",
    depth: "25–50mm",
    desc: "Creates a stable, level base for long-term performance.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
    isPanel: false,
  },
  {
    label: "Sub-Base",
    depth: "100–150mm",
    desc: "Compacted aggregate allowing water to drain while maintaining strength.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
    isPanel: false,
  },
  {
    label: "Geotextile",
    depth: "~1mm",
    desc: "Separates layers to prevent contamination and movement.",
    color: "bg-accent/8 border-accent/15",
    activeColor: "bg-accent/15 border-accent/40",
    isPanel: false,
  },
  {
    label: "Subgrade",
    depth: "Native",
    desc: "Trimmed and compacted native soil — the foundation of everything above.",
    color: "bg-foreground/[0.03] border-border",
    activeColor: "bg-foreground/[0.06] border-border/60",
    isPanel: false,
  },
];

/* Panel lock keyframes injected once */
const LOCK_STYLE_ID = "gl-lock-keyframes";
function ensureLockStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(LOCK_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = LOCK_STYLE_ID;
  style.textContent = `
    @keyframes gl-lock-settle {
      0%   { transform: translateY(12px); opacity: 0; }
      55%  { transform: translateY(-1.5px); opacity: 1; }
      72%  { transform: translateY(0.8px); }
      85%  { transform: translateY(-0.4px); }
      100% { transform: translateY(0); }
    }
    @keyframes gl-dust-l {
      0%   { transform: translate(0, 0) scale(1); opacity: 0.25; }
      100% { transform: translate(-8px, -3px) scale(0.3); opacity: 0; }
    }
    @keyframes gl-dust-r {
      0%   { transform: translate(0, 0) scale(1); opacity: 0.25; }
      100% { transform: translate(8px, -3px) scale(0.3); opacity: 0; }
    }
    @keyframes gl-resolve {
      0%   { box-shadow: inset 0 1px 0 hsl(var(--accent) / 0); }
      60%  { box-shadow: inset 0 1px 0 hsl(var(--accent) / 0.08); }
      100% { box-shadow: inset 0 1px 0 hsl(var(--accent) / 0.04); }
    }
  `;
  document.head.appendChild(style);
}

export function InteractiveLayerStack() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [panelLocked, setPanelLocked] = useState(false);
  const [panelResolved, setPanelResolved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { ensureLockStyles(); }, []);

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
          const total = LAYERS.length;
          let count = 0;
          const interval = setInterval(() => {
            count++;
            setVisibleCount(count);
            if (count >= total) {
              clearInterval(interval);
              // Trigger lock moment after panel settles
              setTimeout(() => setPanelLocked(true), 80);
            }
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
        const isPanelLayer = layer.isPanel;
        const showLockAnimation = isPanelLayer && isVisible;

        return (
          <div key={i} className="relative">
            {/* Dust displacement particles — only on panel lock */}
            {isPanelLayer && panelLocked && (
              <>
                <span
                  className="absolute left-2 bottom-0 w-1.5 h-1 rounded-full bg-accent/15 pointer-events-none"
                  style={{ animation: "gl-dust-l 300ms cubic-bezier(0.2, 0, 0.6, 1) forwards" }}
                />
                <span
                  className="absolute left-6 bottom-0.5 w-1 h-0.5 rounded-full bg-accent/10 pointer-events-none"
                  style={{ animation: "gl-dust-l 350ms cubic-bezier(0.2, 0, 0.6, 1) 40ms forwards" }}
                />
                <span
                  className="absolute right-2 bottom-0 w-1.5 h-1 rounded-full bg-accent/15 pointer-events-none"
                  style={{ animation: "gl-dust-r 300ms cubic-bezier(0.2, 0, 0.6, 1) forwards" }}
                />
                <span
                  className="absolute right-5 bottom-0.5 w-1 h-0.5 rounded-full bg-accent/10 pointer-events-none"
                  style={{ animation: "gl-dust-r 350ms cubic-bezier(0.2, 0, 0.6, 1) 60ms forwards" }}
                />
              </>
            )}
            <button
              type="button"
              className={cn(
                "w-full text-left flex items-center gap-4 p-4 border cursor-pointer",
                isActive ? layer.activeColor : layer.color,
                !showLockAnimation && (isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3"),
                !showLockAnimation && "transition-all duration-700 ease-out"
              )}
              style={showLockAnimation ? {
                animation: "gl-lock-settle 480ms cubic-bezier(0.32, 0, 0.15, 1) forwards",
              } : undefined}
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
          </div>
        );
      })}
    </div>
  );
}