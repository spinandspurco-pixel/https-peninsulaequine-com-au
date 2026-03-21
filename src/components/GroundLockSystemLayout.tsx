import { useState, useCallback, useRef, useEffect } from "react";
import { DURATION, EASE } from "@/lib/motion";
import { PanelSpecimen, PanelArray, PanelSiteLayout } from "@/components/groundlock/GroundLockSystemSVG";

type ViewMode = "system" | "panels";

/* ── Zone data ────────────────────────────────────────── */
interface Zone {
  id: string;
  label: string;
  sublabel: string;
}

const zones: Zone[] = [
  { id: "entry", label: "Entry Threshold", sublabel: "Arrival & access control" },
  { id: "arena", label: "Performance Arena", sublabel: "Primary circulation surface" },
  { id: "stables", label: "Stable Block", sublabel: "Daily movement corridor" },
  { id: "courtyard", label: "Central Spine", sublabel: "Connective axis" },
  { id: "exit", label: "Service Exit", sublabel: "Egress & utility access" },
];

/* ── Preload the real-world image ─────────────────────── */
function usePreload(src: string) {
  useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);
}

/* ── Stable hover hook (debounced leave) ──────────────── */
function useStableHover() {
  const [active, setActive] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnter = useCallback((id: string) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setActive(id);
  }, []);

  const onLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setActive(null);
      leaveTimer.current = null;
    }, 60);
  }, []);

  const onTap = useCallback((id: string) => {
    setActive((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  return { active, onEnter, onLeave, onTap };
}

/* ── Floating label ───────────────────────────────────── */
function FloatingLabel({ zone, x, y, visible }: { zone: Zone | null; x: number; y: number; visible: boolean }) {
  if (!zone) return null;
  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
      }}
      className="pointer-events-none"
    >
      <rect
        x="-70" y="-32" width="140" height="38" rx="2"
        fill="hsl(var(--card))" fillOpacity="0.92"
        stroke="hsl(var(--accent))" strokeWidth="0.5" strokeOpacity="0.2"
      />
      <text
        x="0" y="-16" textAnchor="middle" dominantBaseline="central"
        fontSize="8.5" fontFamily="serif" letterSpacing="0.04em"
        fill="hsl(var(--foreground))" fillOpacity="0.85"
      >
        {zone.label}
      </text>
      <text
        x="0" y="-4" textAnchor="middle" dominantBaseline="central"
        fontSize="6.5" fontFamily="monospace" letterSpacing="0.08em"
        fill="hsl(var(--accent))" fillOpacity="0.4"
      >
        {zone.sublabel.toUpperCase()}
      </text>
    </g>
  );
}

/* ── Label positions per zone ─────────────────────────── */
const labelPositions: Record<string, { x: number; y: number }> = {
  entry: { x: 300, y: 430 },
  arena: { x: 300, y: 160 },
  stables: { x: 120, y: 240 },
  courtyard: { x: 300, y: 310 },
  exit: { x: 480, y: 240 },
};

/* ── Main export ──────────────────────────────────────── */
export function GroundLockSystemLayout() {
  const { active: activeZone, onEnter: onHover, onLeave, onTap } = useStableHover();
  const [viewMode, setViewMode] = useState<ViewMode>("system");
  const activeData = zones.find((z) => z.id === activeZone) || null;

  const isActive = (id: string) => activeZone === id;
  const isDimmed = (id: string) => activeZone !== null && activeZone !== id;

  const zoneStyle = (id: string): React.CSSProperties => ({
    opacity: isDimmed(id) ? 0.35 : 1,
    transition: `opacity ${DURATION.fast}ms ${EASE.interactive}, fill ${DURATION.fast}ms ${EASE.interactive}, stroke ${DURATION.fast}ms ${EASE.interactive}`,
    cursor: "pointer",
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sub-label */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-5 mb-3">
          <div className="w-6 h-px bg-accent/20" />
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/30 font-mono">
            System Layout
          </p>
          <div className="w-6 h-px bg-accent/20" />
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground/30 font-mono tracking-wide">
          Controls movement and flow across all zones
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3">
        {([
          { key: "system" as ViewMode, label: "System View" },
          { key: "panels" as ViewMode, label: "Panel System" },
        ]).map((v) => {
          const active = viewMode === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className="relative px-5 sm:px-7 py-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-mono cursor-pointer bg-transparent border-0"
              style={{
                color: active ? "hsl(var(--accent) / 0.7)" : "hsl(var(--accent) / 0.25)",
                transition: `color ${DURATION.fast}ms ${EASE.interactive}`,
              }}
            >
              {v.label}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
                style={{
                  width: active ? "60%" : "0%",
                  backgroundColor: "hsl(var(--accent) / 0.35)",
                  transition: `width ${DURATION.fast}ms ${EASE.interactive}`,
                }}
              />
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/25 font-mono text-center mb-10 tracking-wide">
        {viewMode === "system" ? "Hover or tap zones to explore" : "Panel → Array → System"}
      </p>

      <div className="max-w-lg mx-auto relative" style={{ aspectRatio: "600 / 500" }}>
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
            viewBox="0 0 600 500"
            className="w-full h-auto"
            aria-label="GroundLock system layout diagram"
          >
            <defs>
              <pattern id="gl-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.05" />
              </pattern>
              <marker id="gl-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" strokeOpacity="0.3" />
              </marker>
            </defs>

            <style>{`
              @keyframes gl-flow {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
              .gl-flow-line {
                animation: gl-flow 3s linear infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .gl-flow-line { animation: none; }
              }
            `}</style>

            {/* Background grid */}
            <rect width="600" height="500" fill="url(#gl-grid)" />

            {/* Property boundary */}
            <rect
              x="60" y="60" width="480" height="380" rx="4"
              fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" strokeOpacity="0.08"
              strokeDasharray="8 5"
            />

            {/* Animated flow paths */}
            <path
              d="M 300 440 L 300 310 L 300 210 L 200 155 Q 170 140 170 180 L 130 270 L 180 340 L 300 350"
              fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6"
              strokeOpacity="0.12" strokeDasharray="4 20"
              className="gl-flow-line pointer-events-none"
            />
            <path
              d="M 300 440 L 300 310 L 400 310 L 470 270 L 470 200 Q 470 180 440 155 L 400 155"
              fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6"
              strokeOpacity="0.1" strokeDasharray="4 20"
              className="gl-flow-line pointer-events-none"
              style={{ animationDelay: "-1.5s" }}
            />

            {/* Static flow connectors */}
            <path
              d="M 300 420 L 300 340"
              fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8"
              strokeOpacity={activeZone === "entry" || activeZone === "courtyard" ? 0.5 : 0.15}
              strokeDasharray="4 3"
              markerEnd="url(#gl-arrow)"
              style={{ transition: `stroke-opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            />
            <path
              d="M 240 300 L 170 270"
              fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8"
              strokeOpacity={activeZone === "courtyard" || activeZone === "stables" ? 0.5 : 0.15}
              strokeDasharray="4 3"
              style={{ transition: `stroke-opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            />
            <path
              d="M 300 280 L 300 220"
              fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8"
              strokeOpacity={activeZone === "courtyard" || activeZone === "arena" ? 0.5 : 0.15}
              strokeDasharray="4 3"
              style={{ transition: `stroke-opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            />
            <path
              d="M 360 300 L 430 270"
              fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8"
              strokeOpacity={activeZone === "courtyard" || activeZone === "exit" ? 0.5 : 0.15}
              strokeDasharray="4 3"
              style={{ transition: `stroke-opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            />

            {/* ARENA */}
            <g style={zoneStyle("arena")}
              onPointerEnter={() => onHover("arena")}
              onPointerLeave={onLeave}
              onClick={() => onTap("arena")}
            >
              <rect
                x="170" y="100" width="260" height="110" rx="3"
                fill={isActive("arena") ? "hsl(var(--accent) / 0.06)" : "hsl(var(--accent) / 0.015)"}
                stroke={isActive("arena") ? "hsl(var(--accent) / 0.4)" : "hsl(var(--accent) / 0.1)"}
                strokeWidth={isActive("arena") ? "1" : "0.5"}
              />
              <line x1="190" y1="130" x2="410" y2="130" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" />
              <line x1="190" y1="155" x2="410" y2="155" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" />
              <line x1="190" y1="180" x2="410" y2="180" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" />
              <text x="300" y="155" textAnchor="middle" dominantBaseline="central"
                fontSize="7" fontFamily="monospace" letterSpacing="0.15em"
                fill="hsl(var(--accent))" className="pointer-events-none uppercase"
                style={{ opacity: isActive("arena") ? 0.55 : 0.18, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
              >
                Arena
              </text>
            </g>

            {/* STABLES */}
            <g style={zoneStyle("stables")}
              onPointerEnter={() => onHover("stables")}
              onPointerLeave={onLeave}
              onClick={() => onTap("stables")}
            >
              <rect
                x="80" y="200" width="100" height="140" rx="2"
                fill={isActive("stables") ? "hsl(var(--accent) / 0.06)" : "hsl(var(--accent) / 0.015)"}
                stroke={isActive("stables") ? "hsl(var(--accent) / 0.4)" : "hsl(var(--accent) / 0.1)"}
                strokeWidth={isActive("stables") ? "1" : "0.5"}
              />
              {[225, 250, 275, 300, 325].map((y) => (
                <line key={y} x1="85" y1={y} x2="175" y2={y} stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.06" />
              ))}
              <text x="130" y="270" textAnchor="middle" dominantBaseline="central"
                fontSize="7" fontFamily="monospace" letterSpacing="0.15em"
                fill="hsl(var(--accent))" className="pointer-events-none uppercase"
                style={{ opacity: isActive("stables") ? 0.55 : 0.18, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
              >
                Stables
              </text>
            </g>

            {/* EXIT */}
            <g style={zoneStyle("exit")}
              onPointerEnter={() => onHover("exit")}
              onPointerLeave={onLeave}
              onClick={() => onTap("exit")}
            >
              <rect
                x="420" y="200" width="100" height="140" rx="2"
                fill={isActive("exit") ? "hsl(var(--accent) / 0.06)" : "hsl(var(--accent) / 0.015)"}
                stroke={isActive("exit") ? "hsl(var(--accent) / 0.4)" : "hsl(var(--accent) / 0.1)"}
                strokeWidth={isActive("exit") ? "1" : "0.5"}
              />
              <line x1="425" y1="250" x2="515" y2="250" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.06" />
              <line x1="425" y1="290" x2="515" y2="290" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.06" />
              <text x="470" y="270" textAnchor="middle" dominantBaseline="central"
                fontSize="7" fontFamily="monospace" letterSpacing="0.15em"
                fill="hsl(var(--accent))" className="pointer-events-none uppercase"
                style={{ opacity: isActive("exit") ? 0.55 : 0.18, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
              >
                Service
              </text>
            </g>

            {/* COURTYARD */}
            <g style={zoneStyle("courtyard")}
              onPointerEnter={() => onHover("courtyard")}
              onPointerLeave={onLeave}
              onClick={() => onTap("courtyard")}
            >
              <rect
                x="210" y="270" width="180" height="80" rx="2"
                fill={isActive("courtyard") ? "hsl(var(--accent) / 0.06)" : "hsl(var(--accent) / 0.01)"}
                stroke={isActive("courtyard") ? "hsl(var(--accent) / 0.4)" : "hsl(var(--accent) / 0.08)"}
                strokeWidth={isActive("courtyard") ? "1" : "0.4"}
              />
              <line x1="300" y1="275" x2="300" y2="345" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.08" strokeDasharray="2 3" />
              <text x="300" y="310" textAnchor="middle" dominantBaseline="central"
                fontSize="6.5" fontFamily="monospace" letterSpacing="0.15em"
                fill="hsl(var(--accent))" className="pointer-events-none uppercase"
                style={{ opacity: isActive("courtyard") ? 0.55 : 0.15, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
              >
                Courtyard
              </text>
            </g>

            {/* ENTRY */}
            <g style={zoneStyle("entry")}
              onPointerEnter={() => onHover("entry")}
              onPointerLeave={onLeave}
              onClick={() => onTap("entry")}
            >
              <rect
                x="240" y="390" width="120" height="50" rx="2"
                fill={isActive("entry") ? "hsl(var(--accent) / 0.06)" : "hsl(var(--accent) / 0.01)"}
                stroke={isActive("entry") ? "hsl(var(--accent) / 0.4)" : "hsl(var(--accent) / 0.08)"}
                strokeWidth={isActive("entry") ? "1" : "0.4"}
              />
              <line x1="280" y1="390" x2="280" y2="440" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.08" />
              <line x1="320" y1="390" x2="320" y2="440" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.08" />
              <text x="300" y="415" textAnchor="middle" dominantBaseline="central"
                fontSize="6.5" fontFamily="monospace" letterSpacing="0.15em"
                fill="hsl(var(--accent))" className="pointer-events-none uppercase"
                style={{ opacity: isActive("entry") ? 0.55 : 0.15, transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
              >
                Entry
              </text>
            </g>

            {/* Horseshoe connectors */}
            <line
              x1="130" y1="200" x2="170" y2="210"
              stroke="hsl(var(--accent))" strokeWidth="0.5"
              strokeOpacity={activeZone === "stables" || activeZone === "arena" ? 0.35 : 0.08}
              style={{ transition: `stroke-opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            />
            <line
              x1="470" y1="200" x2="430" y2="210"
              stroke="hsl(var(--accent))" strokeWidth="0.5"
              strokeOpacity={activeZone === "exit" || activeZone === "arena" ? 0.35 : 0.08}
              style={{ transition: `stroke-opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            />

            {/* Compass */}
            <g opacity="0.1" transform="translate(545, 80)">
              <line x1="0" y1="-14" x2="0" y2="14" stroke="hsl(var(--accent))" strokeWidth="0.4" />
              <line x1="-14" y1="0" x2="14" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.4" />
              <text x="0" y="-18" textAnchor="middle" fontSize="6" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
            </g>

            {/* Floating label */}
            <FloatingLabel
              zone={activeData}
              x={activeZone ? labelPositions[activeZone]?.x ?? 300 : 300}
              y={activeZone ? labelPositions[activeZone]?.y ?? 300 : 300}
              visible={!!activeZone}
            />
          </svg>
        </div>

        {/* Panel System View */}
        <div
          className="absolute inset-0 overflow-y-auto"
          style={{
            opacity: viewMode === "panels" ? 1 : 0,
            pointerEvents: viewMode === "panels" ? "auto" : "none",
            transition: `opacity ${DURATION.normal}ms ${EASE.default}`,
          }}
        >
          <div className="space-y-10 py-4">
            <PanelSpecimen />
            <PanelArray />
            <PanelSiteLayout />
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="text-center mt-6">
        <p
          className="text-[10px] font-mono uppercase tracking-[0.3em]"
          style={{
            color: activeZone && viewMode === "system" ? "hsl(var(--accent) / 0.15)" : "hsl(var(--accent) / 0.25)",
            transition: `color ${DURATION.fast}ms ${EASE.interactive}`,
          }}
        >
          {viewMode === "system"
            ? (activeZone ? (activeData?.sublabel ?? "") : "Hover or tap a zone to explore")
            : "Used under arenas, access routes, and high-traffic zones"
          }
        </p>
      </div>
    </div>
  );
}
