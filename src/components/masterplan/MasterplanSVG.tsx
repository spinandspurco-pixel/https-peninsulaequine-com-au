import { zones, flowPaths, getCenter, type BuildLayer } from "./masterplanData";
import { EASE } from "@/lib/motion";

const SVG_W = 740;
const SVG_H = 700;

/* ── Per-layer visual tuning ── */
const layerStyles: Record<BuildLayer, {
  zoneOpacity: number; labelOpacity: number; fillAlpha: string; strokeW: number;
  materialAlpha: number; shadowAlpha: number;
}> = {
  structure: { zoneOpacity: 0.06, labelOpacity: 0.14, fillAlpha: "0.012", strokeW: 0.7, materialAlpha: 0.5, shadowAlpha: 0.35 },
  envelope:  { zoneOpacity: 0.09, labelOpacity: 0.16, fillAlpha: "0.02",  strokeW: 0.55, materialAlpha: 0.75, shadowAlpha: 0.65 },
  finished:  { zoneOpacity: 0.12, labelOpacity: 0.18, fillAlpha: "0.035", strokeW: 0.45, materialAlpha: 1, shadowAlpha: 1 },
};

interface Props {
  activeZone: string | null;
  buildLayer: BuildLayer;
  showFlows: string[];
  onHover: (id: string) => void;
  onLeave: () => void;
  onTap: (id: string) => void;
}

export function MasterplanSVG({ activeZone, buildLayer, showFlows, onHover, onLeave, onTap }: Props) {
  const ls = layerStyles[buildLayer];
  const T = "350ms";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full h-auto"
      aria-label="Main Ridge Estate — ground floor plan"
      style={{ maxWidth: 560 }}
    >
      <defs>
        <pattern id="mp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.18" opacity="0.025" />
        </pattern>
        <pattern id="mp-sand" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="hsl(35 20% 18% / 0.25)" />
          <circle cx="1" cy="1" r="0.25" fill="hsl(35 15% 25% / 0.06)" />
          <circle cx="3" cy="3" r="0.2" fill="hsl(35 15% 22% / 0.04)" />
        </pattern>
        <pattern id="mp-bldg" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="hsl(30 12% 16% / 0.32)" />
          <line x1="0" y1="8" x2="8" y2="8" stroke="hsl(30 10% 22% / 0.025)" strokeWidth="0.3" />
        </pattern>
        <pattern id="mp-pave" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="hsl(25 8% 15% / 0.2)" />
          <line x1="3" y1="0" x2="3" y2="6" stroke="hsl(25 8% 20% / 0.02)" strokeWidth="0.2" />
          <line x1="0" y1="3" x2="6" y2="3" stroke="hsl(25 8% 20% / 0.02)" strokeWidth="0.2" />
        </pattern>
        <pattern id="mp-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="hsl(var(--accent))" strokeWidth="0.18" opacity="0.018" />
        </pattern>
        {/* Active zone — elevation + subtle warm glow */}
        <filter id="mp-active" x="-8%" y="-8%" width="120%" height="125%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="sb" />
          <feFlood floodColor="hsl(0 0% 0%)" floodOpacity="0.18" result="sc" />
          <feComposite in="sc" in2="sb" operator="in" result="s" />
          <feOffset in="s" dx="1.2" dy="2" result="so" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="gb" />
          <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.08" result="gc" />
          <feComposite in="gc" in2="gb" operator="in" result="g" />
          <feMerge>
            <feMergeNode in="so" />
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Architectural elevation shadow */}
        <filter id="mp-elev" x="-4%" y="-4%" width="112%" height="116%">
          <feDropShadow dx="1.5" dy="2.5" stdDeviation="3" floodColor="hsl(0 0% 0%)" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Background grid */}
      <rect width={SVG_W} height={SVG_H} fill="url(#mp-grid)" />

      {/* ── Material fills — opacity tied to build layer ── */}
      <g style={{ opacity: ls.materialAlpha, transition: `opacity 500ms ease` }}>
        <rect x="200" y="440" width="340" height="160" fill="url(#mp-sand)" rx="1" />
        <rect x="200" y="130" width="340" height="140" fill="url(#mp-bldg)" rx="1" />
        <rect x="200" y="270" width="75" height="170" fill="url(#mp-bldg)" rx="0.5" />
        <rect x="465" y="270" width="75" height="120" fill="url(#mp-bldg)" rx="0.5" />
        <rect x="275" y="270" width="190" height="120" fill="url(#mp-pave)" rx="0.5" />
        <rect x="350" y="130" width="40" height="140" fill="hsl(25 8% 14% / 0.18)" />
        <rect x="465" y="390" width="75" height="50" fill="url(#mp-pave)" rx="0.5" />
        <rect x="200" y="600" width="340" height="32" fill="url(#mp-hatch)" />
      </g>

      {/* ── Depth shadows ── */}
      <g style={{ opacity: ls.shadowAlpha, transition: `opacity 500ms ease` }}>
        <rect x="200" y="440" width="340" height="160" fill="none" filter="url(#mp-elev)" rx="1" />
        <rect x="200" y="130" width="340" height="140" fill="none" filter="url(#mp-elev)" rx="1" />
      </g>

      {/* Property boundary */}
      <rect x="160" y="88" width="420" height="565" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.04" strokeDasharray="10 5" />

      {/* ── STABLES ── */}
      <rect x="200" y="100" width="50" height="28" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity={ls.zoneOpacity * 0.8} />
      <text x="225" y="118" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.8} fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>
      <rect x="490" y="100" width="50" height="28" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity={ls.zoneOpacity * 0.8} />
      <text x="515" y="118" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.8} fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>

      <text x="370" y="116" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.65} fontFamily="monospace" letterSpacing="0.15em">ENTRY</text>

      {/* Central corridor axis */}
      <line x1="370" y1="134" x2="370" y2="266" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" strokeDasharray="3 4" />

      {/* Stable dividers */}
      {[0, 1, 2].map(i => (
        <line key={`sl${i}`} x1={250 + i * 45} y1="134" x2={250 + i * 45} y2="266" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      ))}
      {[0, 1, 2].map(i => (
        <line key={`sr${i}`} x1={415 + i * 45} y1="134" x2={415 + i * 45} y2="266" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      ))}

      {/* Stable labels */}
      {[1, 2, 3].map((n, i) => (
        <text key={`sln${n}`} x={272 + i * 45} y="205" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S{n}</text>
      ))}
      {[4, 5, 6].map((n, i) => (
        <text key={`srn${n}`} x={437 + i * 45} y="205" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S{n}</text>
      ))}

      {/* ── SERVICE WING ── */}
      <line x1="202" y1="330" x2="273" y2="330" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      <line x1="202" y1="390" x2="273" y2="390" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      <text x="237" y="305" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">TACK</text>
      <text x="237" y="360" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">WC</text>
      <text x="237" y="420" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">STORE</text>

      {/* ── VIEWING ── */}
      <text x="502" y="335" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">VIEWING</text>

      {/* ── WASH BAY ── */}
      <text x="502" y="418" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">WASH</text>

      {/* ── ARENA STORE ── */}
      <text x="370" y="620" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.7} fontFamily="monospace" letterSpacing="0.08em">ARENA STORE</text>

      {/* ── Structure layer: column grid + load paths ── */}
      {buildLayer === "structure" && (
        <g style={{ opacity: 1, animation: "fade-in 0.3s ease-out" }}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <g key={`col${i}`}>
              <rect x={198} y={445 + i * 22} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
              <rect x={539.5} y={445 + i * 22} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
            </g>
          ))}
          <line x1="200" y1="445" x2="200" y2="598" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.06" strokeDasharray="2 3" />
          <line x1="540" y1="445" x2="540" y2="598" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.06" strokeDasharray="2 3" />
          <line x1="370" y1="134" x2="370" y2="266" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.06" strokeDasharray="2 3" />
        </g>
      )}

      {/* ── Envelope layer: roof + wall outlines ── */}
      {buildLayer === "envelope" && (
        <g style={{ opacity: 1, animation: "fade-in 0.3s ease-out" }}>
          <path d="M 200 126 L 370 110 L 540 126" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.08" strokeDasharray="6 4" />
          <path d="M 200 436 L 370 426 L 540 436" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.08" strokeDasharray="6 4" />
          <rect x="200" y="130" width="340" height="140" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.06" />
          <rect x="200" y="440" width="340" height="160" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.06" />
        </g>
      )}

      {/* ── Movement flow overlays ── */}
      {showFlows.map(flowId => {
        const flow = flowPaths.find(f => f.id === flowId);
        if (!flow) return null;
        return (
          <g key={flow.id} style={{ animation: "fade-in 0.3s ease-out" }}>
            <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="3" opacity="0.04" strokeLinecap="round" />
            <path
              d={flow.d}
              fill="none"
              stroke={flow.color}
              strokeWidth="1.4"
              opacity="0.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 4"
            >
              <animate attributeName="stroke-dashoffset" from="18" to="0" dur="2.5s" repeatCount="indefinite" />
            </path>
          </g>
        );
      })}

      {/* ── Interactive zone shapes ── */}
      {zones.map(z => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        const center = getCenter(z.path);
        const elevShift = isActive ? z.elevation * -1.5 : 0;

        return (
          <g
            key={z.id}
            style={{
              opacity: isDimmed ? 0.2 : 1,
              transform: `translate(0, ${elevShift}px) scale(${isActive ? 1.008 : 1})`,
              transformOrigin: `${center.x}px ${center.y}px`,
              transition: `opacity ${T} ${EASE.default}, transform ${T} ${EASE.default}`,
              willChange: "opacity, transform",
            }}
            filter={isActive ? "url(#mp-active)" : undefined}
          >
            <path
              d={z.path}
              fill={isActive ? "hsl(var(--accent) / 0.08)" : `hsl(var(--accent) / ${ls.fillAlpha})`}
              stroke={isActive ? "hsl(var(--accent) / 0.5)" : `hsl(var(--accent) / ${ls.zoneOpacity})`}
              strokeWidth={isActive ? ls.strokeW * 1.8 : ls.strokeW}
              style={{ transition: `fill ${T} ease, stroke ${T} ease, stroke-width ${T} ease`, cursor: "pointer" }}
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={onLeave}
              onClick={() => onTap(z.id)}
            />
            {isActive && (
              <path d={z.path} fill="none" stroke="hsl(var(--accent) / 0.04)" strokeWidth="5" className="pointer-events-none" />
            )}
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isActive ? "6.5" : "5.5"}
              fontFamily="monospace"
              letterSpacing="0.12em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{ opacity: isActive ? 0.55 : ls.labelOpacity * 0.7, transition: `opacity ${T} ease` }}
            >
              {z.shortLabel}
            </text>
          </g>
        );
      })}

      {/* ── Columns (finished layer) ── */}
      {buildLayer === "finished" && (
        <>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <g key={`cf${i}`}>
              <rect x={198} y={448 + i * 25} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.05" rx="0.4" />
              <rect x={539.5} y={448 + i * 25} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.05" rx="0.4" />
            </g>
          ))}
        </>
      )}

      {/* ── Dimensions ── */}
      <g opacity="0.05" fontSize="4" fontFamily="monospace" fill="hsl(var(--accent))">
        <line x1="200" y1="648" x2="540" y2="648" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="200" y1="644" x2="200" y2="652" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="540" y1="644" x2="540" y2="652" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <text x="370" y="660" textAnchor="middle">48 m</text>
        <line x1="170" y1="130" x2="170" y2="600" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="166" y1="130" x2="174" y2="130" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="166" y1="600" x2="174" y2="600" stroke="hsl(var(--accent))" strokeWidth="0.3" />
      </g>

      {/* ── Compass ── */}
      <g opacity="0.06" transform="translate(660, 140)">
        <line x1="0" y1="-14" x2="0" y2="14" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <line x1="-14" y1="0" x2="14" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <polygon points="0,-16 -2.5,-11 2.5,-11" fill="hsl(var(--accent))" opacity="0.2" />
        <text x="0" y="-20" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
      </g>

      {/* ── Paddock ── */}
      <text x="182" y="360" textAnchor="middle" fontSize="3.2" fill="hsl(var(--accent))" opacity="0.04" fontFamily="monospace" transform="rotate(-90, 182, 360)">PADDOCK</text>

      {/* ── Drawing ref ── */}
      <g opacity="0.06" transform="translate(540, 672)">
        <text x="0" y="0" fontSize="5" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.06em">MAIN RIDGE ESTATE</text>
        <text x="0" y="9" fontSize="3.5" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.6">GROUND FLOOR — A03</text>
      </g>
    </svg>
  );
}
