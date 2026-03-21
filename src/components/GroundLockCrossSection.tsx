import { useState, useCallback } from "react";
import { DURATION, EASE } from "@/lib/motion";

import foundationPour from "@/assets/main-ridge-foundation-pour.jpg";
import rebarDeep from "@/assets/rebar-foundation-deep.jpg";

type ViewMode = "system" | "realworld";

/* ── Layer data (bottom → top) ────────────────────────── */
interface Layer {
  id: string;
  label: string;
  description: string;
  y: number;
  height: number;
  fill: string;
  activeFill: string;
  pattern?: "dots" | "lines" | "grid" | "gravel";
}

const layers: Layer[] = [
  {
    id: "subgrade",
    label: "Natural Subgrade",
    description: "Prepared to eliminate instability at source",
    y: 300, height: 70,
    fill: "hsl(var(--accent) / 0.03)",
    activeFill: "hsl(var(--accent) / 0.07)",
    pattern: "dots",
  },
  {
    id: "base",
    label: "Compacted Base",
    description: "Compacted for controlled load transfer",
    y: 240, height: 60,
    fill: "hsl(var(--accent) / 0.04)",
    activeFill: "hsl(var(--accent) / 0.09)",
    pattern: "lines",
  },
  {
    id: "groundlock",
    label: "GroundLock™ Grid",
    description: "Prevents movement under load",
    y: 200, height: 40,
    fill: "hsl(var(--accent) / 0.06)",
    activeFill: "hsl(var(--accent) / 0.12)",
    pattern: "grid",
  },
  {
    id: "infill",
    label: "Aggregate Infill",
    description: "Locks structure in place",
    y: 165, height: 35,
    fill: "hsl(var(--accent) / 0.04)",
    activeFill: "hsl(var(--accent) / 0.09)",
    pattern: "gravel",
  },
  {
    id: "surface",
    label: "Finished Surface",
    description: "Maintains consistent performance",
    y: 140, height: 25,
    fill: "hsl(var(--accent) / 0.05)",
    activeFill: "hsl(var(--accent) / 0.1)",
  },
];

/* ── Pattern renderers ────────────────────────────────── */
function LayerPatterns() {
  return (
    <defs>
      <pattern id="cs-dots" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="0.8" fill="hsl(var(--accent))" opacity="0.06" />
        <circle cx="9" cy="9" r="0.6" fill="hsl(var(--accent))" opacity="0.04" />
      </pattern>
      <pattern id="cs-lines" width="20" height="6" patternUnits="userSpaceOnUse">
        <line x1="0" y1="3" x2="20" y2="3" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" />
      </pattern>
      <pattern id="cs-grid" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect x="1" y="1" width="14" height="14" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.1" />
        <line x1="8" y1="1" x2="8" y2="15" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" />
        <line x1="1" y1="8" x2="15" y2="8" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" />
      </pattern>
      <pattern id="cs-gravel" width="14" height="10" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1.2" fill="hsl(var(--accent))" opacity="0.05" />
        <circle cx="10" cy="7" r="1" fill="hsl(var(--accent))" opacity="0.04" />
        <circle cx="7" cy="2" r="0.7" fill="hsl(var(--accent))" opacity="0.03" />
      </pattern>
    </defs>
  );
}

const patternMap: Record<string, string> = {
  dots: "url(#cs-dots)",
  lines: "url(#cs-lines)",
  grid: "url(#cs-grid)",
  gravel: "url(#cs-gravel)",
};

/* ── Main component ───────────────────────────────────── */
export function GroundLockCrossSection() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("system");

  const onHover = useCallback((id: string) => setActiveLayer(id), []);
  const onLeave = useCallback(() => setActiveLayer(null), []);
  const onTap = useCallback((id: string) => {
    setActiveLayer((prev) => (prev === id ? null : id));
  }, []);

  const activeData = layers.find((l) => l.id === activeLayer) || null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sub-label */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-5 mb-3">
          <div className="w-6 h-px bg-accent/20" />
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/30 font-mono">
            Layer Structure
          </p>
          <div className="w-6 h-px bg-accent/20" />
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground/30 font-mono tracking-wide">
          Prevents movement under load
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3">
        {([
          { key: "system" as ViewMode, label: "System View" },
          { key: "realworld" as ViewMode, label: "Real World" },
        ]).map((v) => {
          const isActive = viewMode === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className="relative px-5 sm:px-7 py-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-mono cursor-pointer bg-transparent border-0"
              style={{
                color: isActive ? "hsl(var(--accent) / 0.7)" : "hsl(var(--accent) / 0.25)",
                transition: `color ${DURATION.fast}ms ${EASE.interactive}`,
              }}
            >
              {v.label}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
                style={{
                  width: isActive ? "60%" : "0%",
                  backgroundColor: "hsl(var(--accent) / 0.35)",
                  transition: `width ${DURATION.fast}ms ${EASE.interactive}`,
                }}
              />
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/25 font-mono text-center mb-10 tracking-wide">
        Built and installed in real projects
      </p>

      <div className="relative" style={{ aspectRatio: "700 / 420" }}>
        {/* System View */}
        <div
          className="absolute inset-0"
          style={{
            opacity: viewMode === "system" ? 1 : 0,
            pointerEvents: viewMode === "system" ? "auto" : "none",
            transition: `opacity ${DURATION.normal}ms ${EASE.default}`,
          }}
        >
          <svg
            viewBox="0 0 700 420"
            className="w-full h-full"
            aria-label="GroundLock cross-section diagram"
          >
            <LayerPatterns />

            {/* Background grid */}
            <defs>
              <pattern id="cs-bg" width="35" height="35" patternUnits="userSpaceOnUse">
                <path d="M 35 0 L 0 0 0 35" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.04" />
              </pattern>
            </defs>
            <rect width="700" height="420" fill="url(#cs-bg)" />

            {/* Ground surface line */}
            <line
              x1="60" y1="138" x2="640" y2="138"
              stroke="hsl(var(--accent))" strokeWidth="0.4" strokeOpacity="0.12"
              strokeDasharray="6 4"
            />
            <text x="650" y="140" fontSize="6" fontFamily="monospace" fill="hsl(var(--accent))" fillOpacity="0.15" dominantBaseline="central">
              GL
            </text>

            {/* Layers */}
            {layers.map((layer) => {
              const isActive = activeLayer === layer.id;
              const isDimmed = activeLayer !== null && !isActive;

              return (
                <g
                  key={layer.id}
                  className="cursor-pointer"
                  onMouseEnter={() => onHover(layer.id)}
                  onMouseLeave={onLeave}
                  onClick={() => onTap(layer.id)}
                  style={{
                    opacity: isDimmed ? 0.35 : 1,
                    transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
                  }}
                >
                  <rect
                    x="80" y={layer.y} width="540" height={layer.height}
                    rx="1"
                    fill={isActive ? layer.activeFill : layer.fill}
                    stroke={isActive ? "hsl(var(--accent) / 0.35)" : "hsl(var(--accent) / 0.08)"}
                    strokeWidth={isActive ? "0.8" : "0.4"}
                    style={{ transition: `fill ${DURATION.fast}ms ${EASE.interactive}, stroke ${DURATION.fast}ms ${EASE.interactive}` }}
                  />

                  {layer.pattern && (
                    <rect
                      x="80" y={layer.y} width="540" height={layer.height}
                      rx="1" fill={patternMap[layer.pattern]}
                      className="pointer-events-none"
                    />
                  )}

                  <line
                    x1="80" y1={layer.y} x2="620" y2={layer.y}
                    stroke="hsl(var(--background))" strokeWidth="0.6" strokeOpacity="0.3"
                    className="pointer-events-none"
                  />

                  <text
                    x="68" y={layer.y + layer.height / 2}
                    textAnchor="end" dominantBaseline="central"
                    fontSize="7" fontFamily="monospace" letterSpacing="0.1em"
                    fill="hsl(var(--accent))"
                    className="pointer-events-none"
                    style={{
                      opacity: isActive ? 0.5 : 0.15,
                      transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
                    }}
                  >
                    {String(layers.indexOf(layer) + 1).padStart(2, "0")}
                  </text>
                </g>
              );
            })}

            {/* Dimension bracket */}
            <line x1="635" y1="140" x2="635" y2="370" stroke="hsl(var(--accent))" strokeWidth="0.3" strokeOpacity="0.08" />
            <line x1="632" y1="140" x2="638" y2="140" stroke="hsl(var(--accent))" strokeWidth="0.3" strokeOpacity="0.08" />
            <line x1="632" y1="370" x2="638" y2="370" stroke="hsl(var(--accent))" strokeWidth="0.3" strokeOpacity="0.08" />

            {/* Active label */}
            {activeData && (
              <g
                style={{
                  opacity: activeLayer ? 1 : 0,
                  transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
                }}
              >
                <line
                  x1="620" y1={activeData.y + activeData.height / 2}
                  x2="640" y2={activeData.y + activeData.height / 2}
                  stroke="hsl(var(--accent))" strokeWidth="0.5" strokeOpacity="0.3"
                />
                <rect
                  x="80" y="82" width="540" height="42" rx="2"
                  fill="hsl(var(--card))" fillOpacity="0.92"
                  stroke="hsl(var(--accent))" strokeWidth="0.5" strokeOpacity="0.2"
                />
                <text
                  x="350" y="97"
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="10" fontFamily="serif" letterSpacing="0.03em"
                  fill="hsl(var(--foreground))" fillOpacity="0.85"
                >
                  {activeData.label}
                </text>
                <text
                  x="350" y="113"
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="7.5" fontFamily="monospace" letterSpacing="0.06em"
                  fill="hsl(var(--accent))" fillOpacity="0.4"
                >
                  {activeData.description}
                </text>
              </g>
            )}

            {/* Prompt when no layer active */}
            {!activeLayer && (
              <text
                x="350" y="100"
                textAnchor="middle" dominantBaseline="central"
                fontSize="7" fontFamily="monospace" letterSpacing="0.2em"
                fill="hsl(var(--accent))" fillOpacity="0.2"
                className="uppercase"
              >
                Hover or tap a layer to explore
              </text>
            )}
          </svg>
        </div>

        {/* Real World View */}
        <div
          className="absolute inset-0"
          style={{
            opacity: viewMode === "realworld" ? 1 : 0,
            pointerEvents: viewMode === "realworld" ? "auto" : "none",
            transition: `opacity ${DURATION.normal}ms ${EASE.default}`,
          }}
        >
          <div className="w-full h-full grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-sm">
              <img
                src={foundationPour}
                alt="Foundation pour — real build"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(var(--background) / 0.6) 0%, transparent 50%)" }}
              />
              <div className="absolute bottom-3 left-3">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/50">Base & Foundation</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-sm">
              <img
                src={rebarDeep}
                alt="GroundLock grid installation"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(var(--background) / 0.6) 0%, transparent 50%)" }}
              />
              <div className="absolute bottom-3 left-3">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/50">Grid & Reinforcement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
