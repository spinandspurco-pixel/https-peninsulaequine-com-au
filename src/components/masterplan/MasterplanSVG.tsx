import { zones, flowPaths, getCenter, type BuildLayer, type FlowPath } from "./masterplanData";
import { DURATION, EASE } from "@/lib/motion";

const SVG_W = 740;
const SVG_H = 700;

/* ── Building layer visual styles ── */
const layerStyles: Record<BuildLayer, { zoneOpacity: number; labelOpacity: number; fillSuffix: string; strokeW: number }> = {
  structure: { zoneOpacity: 0.06, labelOpacity: 0.12, fillSuffix: "0.015", strokeW: 0.8 },
  envelope: { zoneOpacity: 0.09, labelOpacity: 0.15, fillSuffix: "0.025", strokeW: 0.6 },
  finished: { zoneOpacity: 0.12, labelOpacity: 0.18, fillSuffix: "0.04", strokeW: 0.5 },
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

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full h-auto"
      aria-label="Main Ridge Estate — architectural masterplan"
    >
      <defs>
        {/* Grid */}
        <pattern id="mp3-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.03" />
        </pattern>
        {/* Sand texture */}
        <pattern id="mp3-sand" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={`hsl(35 20% 18% / ${buildLayer === "structure" ? "0.15" : "0.28"})`} />
          <circle cx="1" cy="1" r="0.3" fill="hsl(35 15% 25% / 0.08)" />
          <circle cx="3" cy="3" r="0.2" fill="hsl(35 15% 22% / 0.05)" />
        </pattern>
        {/* Building fill */}
        <pattern id="mp3-building" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={`hsl(30 12% 16% / ${buildLayer === "structure" ? "0.18" : "0.35"})`} />
          <line x1="0" y1="8" x2="8" y2="8" stroke="hsl(30 10% 22% / 0.03)" strokeWidth="0.3" />
        </pattern>
        {/* Paving */}
        <pattern id="mp3-paving" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="hsl(25 8% 15% / 0.22)" />
          <line x1="3" y1="0" x2="3" y2="6" stroke="hsl(25 8% 20% / 0.025)" strokeWidth="0.2" />
          <line x1="0" y1="3" x2="6" y2="3" stroke="hsl(25 8% 20% / 0.025)" strokeWidth="0.2" />
        </pattern>
        {/* Hatch */}
        <pattern id="mp3-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.02" />
        </pattern>
        {/* Active zone glow */}
        <filter id="mp3-glow" x="-10%" y="-10%" width="125%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="sb" />
          <feFlood floodColor="hsl(0 0% 0%)" floodOpacity="0.2" result="sc" />
          <feComposite in="sc" in2="sb" operator="in" result="s" />
          <feOffset in="s" dx="1.5" dy="2.5" result="so" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="gb" />
          <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.1" result="gc" />
          <feComposite in="gc" in2="gb" operator="in" result="g" />
          <feMerge>
            <feMergeNode in="so" />
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Elevation shadow */}
        <filter id="mp3-elev" x="-5%" y="-5%" width="115%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3.5" floodColor="hsl(0 0% 0%)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background grid */}
      <rect width={SVG_W} height={SVG_H} fill="url(#mp3-grid)" />

      {/* ── Material fills ── */}
      <rect x="200" y="440" width="340" height="160" fill="url(#mp3-sand)" rx="1" />
      <rect x="200" y="130" width="340" height="140" fill="url(#mp3-building)" rx="1" />
      <rect x="200" y="270" width="75" height="170" fill="url(#mp3-building)" rx="0.5" />
      <rect x="465" y="270" width="75" height="120" fill="url(#mp3-building)" rx="0.5" />
      <rect x="275" y="270" width="190" height="120" fill="url(#mp3-paving)" rx="0.5" />
      <rect x="350" y="130" width="40" height="140" fill="hsl(25 8% 14% / 0.2)" />
      <rect x="465" y="390" width="75" height="50" fill="url(#mp3-paving)" rx="0.5" />
      <rect x="200" y="600" width="340" height="35" fill="url(#mp3-hatch)" />

      {/* ── Elevation shadows for depth ── */}
      <g style={{ opacity: buildLayer === "structure" ? 0.4 : 1, transition: "opacity 500ms ease" }}>
        <rect x="200" y="440" width="340" height="160" fill="none" filter="url(#mp3-elev)" rx="1" />
        <rect x="200" y="130" width="340" height="140" fill="none" filter="url(#mp3-elev)" rx="1" />
      </g>

      {/* Property boundary */}
      <rect x="160" y="85" width="420" height="570" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.05" strokeDasharray="10 5" />

      {/* ── STABLES DETAIL ── */}
      {/* Float bays */}
      <rect x="200" y="100" width="55" height="28" fill="url(#mp3-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity={ls.zoneOpacity} />
      <text x="227" y="118" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>
      <rect x="485" y="100" width="55" height="28" fill="url(#mp3-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity={ls.zoneOpacity} />
      <text x="512" y="118" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>

      {/* Entry */}
      <text x="370" y="115" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.8} fontFamily="monospace" letterSpacing="0.15em">ENTRY</text>

      {/* Central corridor */}
      <line x1="370" y1="135" x2="370" y2="265" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.05" strokeDasharray="4 4" />

      {/* Stable dividers */}
      {[0, 1, 2].map(i => (
        <line key={`sl${i}`} x1={250 + i * 45} y1="135" x2={250 + i * 45} y2="265" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.05" />
      ))}
      {[0, 1, 2].map(i => (
        <line key={`sr${i}`} x1={415 + i * 45} y1="135" x2={415 + i * 45} y2="265" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.05" />
      ))}

      {/* Stable labels */}
      {[1, 2, 3].map((n, i) => (
        <text key={`sln${n}`} x={272 + i * 45} y="205" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.7} fontFamily="monospace">S{n}</text>
      ))}
      {[4, 5, 6].map((n, i) => (
        <text key={`srn${n}`} x={437 + i * 45} y="205" textAnchor="middle" fontSize="4" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.7} fontFamily="monospace">S{n}</text>
      ))}

      {/* ── SERVICE WING labels ── */}
      <line x1="202" y1="330" x2="273" y2="330" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.05" />
      <line x1="202" y1="390" x2="273" y2="390" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.05" />
      <text x="237" y="305" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace">TACK</text>
      <text x="237" y="360" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace">WC</text>
      <text x="237" y="420" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace">STORE</text>

      {/* ── VIEWING label ── */}
      <text x="502" y="335" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace">VIEWING</text>

      {/* ── WASH BAY label ── */}
      <text x="502" y="418" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace">WASH BAY</text>

      {/* ── ARENA STORE label ── */}
      <text x="370" y="621" textAnchor="middle" fontSize="4.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity} fontFamily="monospace" letterSpacing="0.1em">ARENA STORE</text>

      {/* ── Structure layer: column grid ── */}
      {buildLayer === "structure" && (
        <g className="animate-fade-in">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <g key={`col-l${i}`}>
              <rect x={198} y={445 + i * 22} width="3" height="3" fill="hsl(var(--accent))" opacity="0.15" rx="0.5" />
              <rect x={539} y={445 + i * 22} width="3" height="3" fill="hsl(var(--accent))" opacity="0.15" rx="0.5" />
            </g>
          ))}
          {/* Load path lines */}
          <line x1="200" y1="445" x2="200" y2="598" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.08" strokeDasharray="2 3" />
          <line x1="540" y1="445" x2="540" y2="598" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.08" strokeDasharray="2 3" />
          <line x1="370" y1="135" x2="370" y2="265" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.08" strokeDasharray="2 3" />
        </g>
      )}

      {/* ── Envelope layer: roof lines ── */}
      {buildLayer === "envelope" && (
        <g className="animate-fade-in">
          <path d="M 200 125 L 370 108 L 540 125" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.1" strokeDasharray="6 4" />
          <path d="M 200 435 L 370 425 L 540 435" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.1" strokeDasharray="6 4" />
          {/* Wall outlines */}
          <rect x="200" y="130" width="340" height="140" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8" opacity="0.08" />
          <rect x="200" y="440" width="340" height="160" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8" opacity="0.08" />
        </g>
      )}

      {/* ── Movement flow overlays ── */}
      {showFlows.map(flowId => {
        const flow = flowPaths.find(f => f.id === flowId);
        if (!flow) return null;
        return (
          <g key={flow.id}>
            <path
              d={flow.d}
              fill="none"
              stroke={flow.color}
              strokeWidth="1.8"
              opacity="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 4"
              className="animate-fade-in"
            >
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite" />
            </path>
            {/* Subtle glow underneath */}
            <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="4" opacity="0.06" strokeLinecap="round" />
          </g>
        );
      })}

      {/* ── Interactive zone shapes ── */}
      {zones.map(z => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        const center = getCenter(z.path);
        const elevShift = isActive ? z.elevation * -2 : 0;

        return (
          <g
            key={z.id}
            style={{
              opacity: isDimmed ? 0.18 : 1,
              transform: `translate(0, ${elevShift}px) scale(${isActive ? 1.012 : 1})`,
              transformOrigin: `${center.x}px ${center.y}px`,
              transition: `opacity 400ms ${EASE.default}, transform 500ms ${EASE.default}`,
              willChange: "opacity, transform",
            }}
            filter={isActive ? "url(#mp3-glow)" : undefined}
          >
            <path
              d={z.path}
              fill={isActive ? `hsl(var(--accent) / 0.1)` : `hsl(var(--accent) / ${ls.fillSuffix})`}
              stroke={isActive ? "hsl(var(--accent) / 0.6)" : `hsl(var(--accent) / ${ls.zoneOpacity})`}
              strokeWidth={isActive ? ls.strokeW * 2 : ls.strokeW}
              style={{ transition: `fill 400ms ease, stroke 400ms ease, stroke-width 400ms ease`, cursor: "pointer" }}
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={onLeave}
              onClick={() => onTap(z.id)}
            />
            {/* Soft outer glow ring */}
            {isActive && (
              <path d={z.path} fill="none" stroke="hsl(var(--accent) / 0.06)" strokeWidth="6" className="pointer-events-none" />
            )}
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isActive ? "7" : "6"}
              fontFamily="monospace"
              letterSpacing="0.12em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{ opacity: isActive ? 0.65 : ls.labelOpacity * 0.8, transition: "opacity 400ms ease" }}
            >
              {z.shortLabel}
            </text>
          </g>
        );
      })}

      {/* ── Structural columns (finished layer) ── */}
      {buildLayer === "finished" && (
        <>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <g key={`cf${i}`}>
              <rect x={198} y={448 + i * 25} width="3" height="3" fill="hsl(var(--accent))" opacity="0.06" rx="0.5" />
              <rect x={539} y={448 + i * 25} width="3" height="3" fill="hsl(var(--accent))" opacity="0.06" rx="0.5" />
            </g>
          ))}
        </>
      )}

      {/* ── Dimension annotations ── */}
      <g opacity="0.06" fontSize="4.5" fontFamily="monospace" fill="hsl(var(--accent))">
        <line x1="200" y1="650" x2="540" y2="650" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <line x1="200" y1="646" x2="200" y2="654" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <line x1="540" y1="646" x2="540" y2="654" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <text x="370" y="662" textAnchor="middle" fontSize="4.5">48 m</text>

        <line x1="168" y1="130" x2="168" y2="600" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <line x1="164" y1="130" x2="172" y2="130" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <line x1="164" y1="600" x2="172" y2="600" stroke="hsl(var(--accent))" strokeWidth="0.35" />
      </g>

      {/* ── Compass ── */}
      <g opacity="0.08" transform="translate(660, 140)">
        <line x1="0" y1="-16" x2="0" y2="16" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <line x1="-16" y1="0" x2="16" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.4" />
        <polygon points="0,-18 -3,-12 3,-12" fill="hsl(var(--accent))" opacity="0.25" />
        <text x="0" y="-22" textAnchor="middle" fontSize="5.5" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
      </g>

      {/* ── Paddock access ── */}
      <text x="182" y="360" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity="0.06" fontFamily="monospace" transform="rotate(-90, 182, 360)">PADDOCK ACCESS</text>

      {/* ── Drawing reference ── */}
      <g opacity="0.08" transform="translate(540, 670)">
        <text x="0" y="0" fontSize="5.5" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.08em">MAIN RIDGE ESTATE</text>
        <text x="0" y="10" fontSize="4" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.6">PROPOSED GROUND FLOOR — A03</text>
      </g>
    </svg>
  );
}
