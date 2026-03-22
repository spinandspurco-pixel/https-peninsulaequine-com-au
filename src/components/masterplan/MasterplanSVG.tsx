import { zones, flowPaths, getCenter, type BuildLayer } from "./masterplanData";
import { EASE } from "@/lib/motion";

const SVG_W = 740;
const SVG_H = 820;

/* ── Per-layer visual tuning ── */
const layerStyles: Record<BuildLayer, {
  zoneOpacity: number; labelOpacity: number; fillAlpha: string; strokeW: number;
  materialAlpha: number; shadowAlpha: number; gridAlpha: number; terrainAlpha: number;
}> = {
  structure: { zoneOpacity: 0.06, labelOpacity: 0.14, fillAlpha: "0.012", strokeW: 0.7, materialAlpha: 0.2, shadowAlpha: 0.15, gridAlpha: 0.06, terrainAlpha: 0.3 },
  envelope:  { zoneOpacity: 0.09, labelOpacity: 0.16, fillAlpha: "0.02",  strokeW: 0.55, materialAlpha: 0.6, shadowAlpha: 0.5, gridAlpha: 0.035, terrainAlpha: 0.5 },
  finished:  { zoneOpacity: 0.12, labelOpacity: 0.18, fillAlpha: "0.035", strokeW: 0.45, materialAlpha: 1, shadowAlpha: 1, gridAlpha: 0.025, terrainAlpha: 0.7 },
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
  const isViewing = activeZone === "viewing-loft";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full h-auto"
      aria-label="Main Ridge Estate — ground floor plan"
      style={{ maxWidth: 580 }}
    >
      <defs>
        {/* Grid */}
        <pattern id="mp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.18" opacity={ls.gridAlpha} />
        </pattern>

        {/* Terrain */}
        <pattern id="mp-terrain" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="12" r="0.4" fill="hsl(35 15% 30%)" opacity="0.03" />
          <circle cx="42" cy="28" r="0.3" fill="hsl(35 12% 28%)" opacity="0.025" />
          <circle cx="8" cy="45" r="0.35" fill="hsl(35 18% 25%)" opacity="0.02" />
          <circle cx="52" cy="50" r="0.25" fill="hsl(35 10% 32%)" opacity="0.02" />
        </pattern>
        <pattern id="mp-contour" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M 0 60 Q 30 55, 60 58 T 120 56" fill="none" stroke="hsl(35 10% 35%)" strokeWidth="0.2" opacity="0.025" />
          <path d="M 0 90 Q 40 84, 80 87 T 120 85" fill="none" stroke="hsl(35 10% 35%)" strokeWidth="0.15" opacity="0.018" />
        </pattern>

        {/* Materials */}
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

        {/* Filters */}
        <filter id="mp-active" x="-8%" y="-8%" width="120%" height="125%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="sb" />
          <feFlood floodColor="hsl(0 0% 0%)" floodOpacity="0.18" result="sc" />
          <feComposite in="sc" in2="sb" operator="in" result="s" />
          <feOffset in="s" dx="1.2" dy="2" result="so" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="gb" />
          <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.08" result="gc" />
          <feComposite in="gc" in2="gb" operator="in" result="g" />
          <feMerge><feMergeNode in="so" /><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="mp-viewing" x="-10%" y="-10%" width="125%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" result="sb" />
          <feFlood floodColor="hsl(0 0% 0%)" floodOpacity="0.22" result="sc" />
          <feComposite in="sc" in2="sb" operator="in" result="s" />
          <feOffset in="s" dx="1.5" dy="2.5" result="so" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="gb" />
          <feFlood floodColor="hsl(var(--accent))" floodOpacity="0.12" result="gc" />
          <feComposite in="gc" in2="gb" operator="in" result="g" />
          <feMerge><feMergeNode in="so" /><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="mp-elev" x="-4%" y="-4%" width="112%" height="116%">
          <feDropShadow dx="1.5" dy="2.5" stdDeviation="3" floodColor="hsl(0 0% 0%)" floodOpacity="0.12" />
        </filter>

        {/* Flow mask */}
        <linearGradient id="flow-fade-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="8%" stopColor="white" stopOpacity="1" />
          <stop offset="92%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="flow-mask-v">
          <rect x="0" y="60" width={SVG_W} height="700" fill="url(#flow-fade-v)" />
        </mask>

        {/* Terrain gradient */}
        <linearGradient id="grad-terrain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(35 12% 40%)" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(35 8% 20%)" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* ── Terrain base ── */}
      <g style={{ opacity: ls.terrainAlpha, transition: "opacity 600ms ease" }}>
        <rect width={SVG_W} height={SVG_H} fill="url(#mp-terrain)" />
        <rect width={SVG_W} height={SVG_H} fill="url(#mp-contour)" />
        <rect width={SVG_W} height={SVG_H} fill="url(#grad-terrain)" opacity="0.015" />
      </g>

      {/* Grid */}
      <rect width={SVG_W} height={SVG_H} fill="url(#mp-grid)" />

      {/* ── Material fills ── */}
      <g style={{ opacity: ls.materialAlpha, transition: "opacity 500ms ease" }}>
        {/* Stable row */}
        <rect x="185" y="95" width="370" height="70" fill="url(#mp-bldg)" rx="1" />
        {/* West wing */}
        <rect x="185" y="165" width="90" height="175" fill="url(#mp-bldg)" rx="0.5" />
        {/* East wing / service */}
        <rect x="465" y="165" width="90" height="175" fill="url(#mp-bldg)" rx="0.5" />
        {/* Courtyard — paving */}
        <rect x="275" y="165" width="190" height="175" fill="url(#mp-pave)" rx="0.5" />
        {/* Bottom row — tack & rooms */}
        <rect x="185" y="340" width="370" height="85" fill="url(#mp-bldg)" rx="0.5" />
        {/* Arena corridor */}
        <rect x="330" y="425" width="80" height="45" fill="url(#mp-pave)" rx="0.5" />
        {/* Arena */}
        <rect x="245" y="470" width="250" height="230" fill="url(#mp-sand)" rx="1" />
        {/* Arena store */}
        <rect x="245" y="700" width="250" height="40" fill="url(#mp-hatch)" />
        {/* Entry corridor */}
        <rect x="345" y="95" width="50" height="70" fill="hsl(25 8% 14% / 0.18)" />
      </g>

      {/* ── Depth shadows ── */}
      <g style={{ opacity: ls.shadowAlpha, transition: "opacity 500ms ease" }}>
        <rect x="185" y="95" width="370" height="330" fill="none" filter="url(#mp-elev)" rx="1" />
        <rect x="245" y="470" width="250" height="230" fill="none" filter="url(#mp-elev)" rx="1" />
        {/* Ground contact */}
        <rect x="183" y="422" width="374" height="6" fill="hsl(0 0% 0% / 0.03)" rx="2" />
        <rect x="243" y="697" width="254" height="6" fill="hsl(0 0% 0% / 0.03)" rx="2" />
      </g>

      {/* ── Property boundary ── */}
      <rect x="145" y="55" width="450" height="720" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.04" strokeDasharray="10 5" />

      {/* ── STABLE ROW DETAIL — dividers + labels ── */}
      {/* Float bays */}
      <rect x="185" y="95" width="50" height="70" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity={ls.zoneOpacity * 0.8} />
      <text x="210" y="134" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.7} fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>
      <rect x="505" y="95" width="50" height="70" fill="url(#mp-hatch)" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity={ls.zoneOpacity * 0.8} />
      <text x="530" y="134" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.7} fontFamily="monospace" letterSpacing="0.1em">FLOAT</text>

      {/* Stable dividers in top row */}
      {[235, 290, 345, 395, 450, 505].map(x => (
        <line key={`sd${x}`} x1={x} y1="95" x2={x} y2="165" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      ))}
      {/* Stable labels */}
      <text x="262" y="134" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S1</text>
      <text x="318" y="134" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S2</text>
      <text x="370" y="134" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.65} fontFamily="monospace" letterSpacing="0.15em">ENTRY</text>
      <text x="422" y="134" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S3</text>
      <text x="478" y="134" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S4</text>

      {/* Central corridor axis */}
      <line x1="370" y1="95" x2="370" y2="165" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" strokeDasharray="3 4" />

      {/* ── WEST WING — S5, S6 ── */}
      <line x1="185" y1="252" x2="275" y2="252" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      <text x="230" y="210" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S5</text>
      <text x="230" y="300" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">S6</text>
      {/* Paddock entry indicator */}
      <text x="168" y="310" textAnchor="middle" fontSize="3" fill="hsl(var(--accent))" opacity="0.04" fontFamily="monospace" transform="rotate(-90, 168, 310)">PADDOCK</text>

      {/* ── SERVICE WING — Wash, WC, Tie-up ── */}
      <line x1="465" y1="220" x2="555" y2="220" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      <line x1="465" y1="278" x2="555" y2="278" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      <text x="510" y="196" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">WASH</text>
      <text x="510" y="252" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">WC</text>
      <text x="510" y="312" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">TIE-UP</text>

      {/* ── BOTTOM ROW — Tack rooms, rooms, walkway ── */}
      {[275, 340, 400, 465].map(x => (
        <line key={`br${x}`} x1={x} y1="340" x2={x} y2="425" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
      ))}
      <text x="230" y="370" textAnchor="middle" fontSize="3.2" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.75} fontFamily="monospace">RM 1</text>
      <text x="230" y="405" textAnchor="middle" fontSize="3.2" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">RM 3</text>
      <text x="308" y="385" textAnchor="middle" fontSize="3.2" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">TACK 1</text>
      <text x="370" y="385" textAnchor="middle" fontSize="3.2" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.65} fontFamily="monospace" letterSpacing="0.08em">STAIR</text>
      <text x="433" y="385" textAnchor="middle" fontSize="3.2" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.85} fontFamily="monospace">TACK 2</text>
      <text x="510" y="385" textAnchor="middle" fontSize="3.2" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace">RM 4</text>

      {/* ── VIEWING LOFT (upper level — dashed outline) ── */}
      <rect
        x="310" y="355" width="120" height="65"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.4"
        opacity={ls.labelOpacity * 0.5}
        strokeDasharray="4 3"
      />
      <text x="370" y="395" textAnchor="middle" fontSize="3" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.5} fontFamily="monospace" letterSpacing="0.15em">VIEWING LOFT</text>
      <text x="370" y="402" textAnchor="middle" fontSize="2.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.35} fontFamily="monospace">(UPPER LEVEL)</text>

      {/* ── ARENA CORRIDOR ── */}
      <line x1="370" y1="425" x2="370" y2="470" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.05" strokeDasharray="3 3" />
      <text x="370" y="450" textAnchor="middle" fontSize="3" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.4} fontFamily="monospace">WALKWAY</text>

      {/* ── ARENA LABELS ── */}
      <text x="370" y="580" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.45} fontFamily="monospace" letterSpacing="0.2em">INDOOR ARENA</text>
      <text x="370" y="592" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.3} fontFamily="monospace">24 × 48 m</text>

      {/* ── ARENA STORE ── */}
      <text x="370" y="724" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.6} fontFamily="monospace" letterSpacing="0.08em">ARENA STORE</text>

      {/* ── STRUCTURE LAYER ── */}
      {buildLayer === "structure" && (
        <g style={{ opacity: 1, animation: "fade-in 0.3s ease-out" }}>
          {/* Stable block column grid */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <g key={`sc${i}`}>
              <rect x={183 + i * 42} y="93" width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.15" rx="0.4" />
              <rect x={183 + i * 42} y="163" width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.15" rx="0.4" />
            </g>
          ))}
          {/* Left wing columns */}
          {[0, 1, 2, 3].map(i => (
            <g key={`lwc${i}`}>
              <rect x="183" y={165 + i * 45} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
              <rect x="273" y={165 + i * 45} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
            </g>
          ))}
          {/* Right wing columns */}
          {[0, 1, 2, 3].map(i => (
            <g key={`rwc${i}`}>
              <rect x="463" y={165 + i * 45} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
              <rect x="553" y={165 + i * 45} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
            </g>
          ))}
          {/* Arena columns — clear span, only perimeter */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <g key={`ac${i}`}>
              <rect x="243" y={472 + i * 30} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
              <rect x="493" y={472 + i * 30} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.12" rx="0.4" />
            </g>
          ))}
          {/* Load path lines */}
          <line x1="185" y1="95" x2="185" y2="425" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.08" strokeDasharray="2 3" />
          <line x1="555" y1="95" x2="555" y2="425" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.08" strokeDasharray="2 3" />
          <line x1="245" y1="470" x2="245" y2="700" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.08" strokeDasharray="2 3" />
          <line x1="495" y1="470" x2="495" y2="700" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.08" strokeDasharray="2 3" />
          {/* Cross-bracing */}
          <line x1="185" y1="95" x2="555" y2="95" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="4 6" />
          <line x1="185" y1="340" x2="555" y2="340" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="4 6" />
          <line x1="245" y1="470" x2="495" y2="470" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="4 6" />
        </g>
      )}

      {/* ── ENVELOPE LAYER ── */}
      {buildLayer === "envelope" && (
        <g style={{ opacity: 1, animation: "fade-in 0.3s ease-out" }}>
          {/* Pitched roof ridge — stable block */}
          <path d="M 185 90 L 370 78 L 555 90" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.12" strokeDasharray="6 4" />
          {/* Wall outlines — stable complex */}
          <rect x="185" y="95" width="370" height="330" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8" opacity="0.1" />
          {/* Left wing enclosure */}
          <rect x="185" y="165" width="90" height="175" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.06" />
          {/* Right wing enclosure */}
          <rect x="465" y="165" width="90" height="175" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.06" />
          {/* Arena — large pitched roof */}
          <path d="M 245 465 L 370 452 L 495 465" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.12" strokeDasharray="6 4" />
          <rect x="245" y="470" width="250" height="230" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8" opacity="0.1" />
          {/* Eave overhangs */}
          <line x1="180" y1="95" x2="560" y2="95" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
          <line x1="240" y1="470" x2="500" y2="470" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
          {/* Connection corridor roof */}
          <rect x="330" y="425" width="80" height="45" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.05" />
        </g>
      )}

      {/* ── MOVEMENT FLOWS ── */}
      <g mask="url(#flow-mask-v)">
        {showFlows.map(flowId => {
          const flow = flowPaths.find(f => f.id === flowId);
          if (!flow) return null;
          return (
            <g key={flow.id} style={{ animation: "fade-in 0.3s ease-out" }}>
              <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="4" opacity="0.03" strokeLinecap="round" />
              <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="1.2" opacity="0.18" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 5">
                <animate attributeName="stroke-dashoffset" from="22" to="0" dur="3s" repeatCount="indefinite" />
              </path>
              <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="2.2" opacity="0.08" strokeLinecap="round" strokeDasharray="0.5 16">
                <animate attributeName="stroke-dashoffset" from="33" to="0" dur="3s" repeatCount="indefinite" />
              </path>
            </g>
          );
        })}
      </g>

      {/* ── INTERACTIVE ZONES ── */}
      {zones.map(z => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        const center = getCenter(z.path);
        const elevShift = isActive ? z.elevation * -1.5 : 0;
        const dimOpacity = (isViewing && !isActive) ? 0.14 : 0.2;
        const isViewingZone = z.id === "viewing-loft";

        return (
          <g
            key={z.id}
            style={{
              opacity: isDimmed ? dimOpacity : 1,
              transform: `translate(0, ${elevShift}px) scale(${isActive ? (isViewingZone ? 1.012 : 1.008) : 1})`,
              transformOrigin: `${center.x}px ${center.y}px`,
              transition: `opacity ${T} ${EASE.default}, transform ${T} ${EASE.default}`,
              willChange: "opacity, transform",
            }}
            filter={isActive ? (isViewingZone ? "url(#mp-viewing)" : "url(#mp-active)") : undefined}
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
              fontSize={isActive ? (isViewingZone ? "7" : "6") : "5"}
              fontFamily="monospace"
              letterSpacing="0.12em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{ opacity: isActive ? (isViewingZone ? 0.65 : 0.5) : ls.labelOpacity * 0.6, transition: `opacity ${T} ease` }}
            >
              {z.shortLabel}
            </text>
          </g>
        );
      })}

      {/* ── FINISHED LAYER — subtle columns ── */}
      {buildLayer === "finished" && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <g key={`fc${i}`}>
              <rect x={243} y={475 + i * 28} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.04" rx="0.4" />
              <rect x={493} y={475 + i * 28} width="2.5" height="2.5" fill="hsl(var(--accent))" opacity="0.04" rx="0.4" />
            </g>
          ))}
        </>
      )}

      {/* ── DIMENSIONS ── */}
      <g opacity="0.05" fontSize="4" fontFamily="monospace" fill="hsl(var(--accent))">
        {/* Stable complex width */}
        <line x1="185" y1="760" x2="555" y2="760" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="185" y1="756" x2="185" y2="764" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="555" y1="756" x2="555" y2="764" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <text x="370" y="772" textAnchor="middle">~50 m</text>
        {/* Arena width */}
        <line x1="245" y1="748" x2="495" y2="748" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="245" y1="744" x2="245" y2="752" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="495" y1="744" x2="495" y2="752" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <text x="370" y="747" textAnchor="middle">24 m</text>
        {/* Vertical */}
        <line x1="150" y1="95" x2="150" y2="700" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="146" y1="95" x2="154" y2="95" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="146" y1="700" x2="154" y2="700" stroke="hsl(var(--accent))" strokeWidth="0.3" />
      </g>

      {/* ── COMPASS ── */}
      <g opacity="0.06" transform="translate(670, 120)">
        <line x1="0" y1="-14" x2="0" y2="14" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <line x1="-14" y1="0" x2="14" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.35" />
        <polygon points="0,-16 -2.5,-11 2.5,-11" fill="hsl(var(--accent))" opacity="0.2" />
        <text x="0" y="-20" textAnchor="middle" fontSize="5" fill="hsl(var(--accent))" fontFamily="monospace">N</text>
      </g>

      {/* ── DRIVEWAY ── */}
      <text x="370" y="790" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" opacity="0.035" fontFamily="monospace" letterSpacing="0.15em">DRIVEWAY BELOW</text>

      {/* ── DRAWING REF ── */}
      <g opacity="0.06" transform="translate(545, 790)">
        <text x="0" y="0" fontSize="5" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.06em">MAIN RIDGE ESTATE</text>
        <text x="0" y="9" fontSize="3.5" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.6">GROUND FLOOR — A03</text>
      </g>
    </svg>
  );
}
