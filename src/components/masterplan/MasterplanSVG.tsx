import { zones, flowPaths, getCenter, type BuildLayer } from "./masterplanData";
import { EASE } from "@/lib/motion";

const SVG_W = 740;
const SVG_H = 820;

/* ── Per-layer visual tuning ── */
const layerStyles: Record<BuildLayer, {
  zoneOpacity: number; labelOpacity: number; fillAlpha: string; strokeW: number;
  materialAlpha: number; shadowAlpha: number; gridAlpha: number; terrainAlpha: number;
}> = {
  structure: { zoneOpacity: 0.04, labelOpacity: 0.08, fillAlpha: "0.005", strokeW: 0.4, materialAlpha: 0.08, shadowAlpha: 0.06, gridAlpha: 0.035, terrainAlpha: 0.15 },
  envelope:  { zoneOpacity: 0.06, labelOpacity: 0.1, fillAlpha: "0.01", strokeW: 0.35, materialAlpha: 0.35, shadowAlpha: 0.25, gridAlpha: 0.02, terrainAlpha: 0.25 },
  finished:  { zoneOpacity: 0.07, labelOpacity: 0.1, fillAlpha: "0.015", strokeW: 0.3, materialAlpha: 0.7, shadowAlpha: 0.6, gridAlpha: 0.012, terrainAlpha: 0.4 },
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
  const T = "500ms";
  const T_EASE = "cubic-bezier(0.45, 0, 0.15, 1)";
  const isViewing = activeZone === "viewing-loft";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full h-auto"
      aria-label="Main Ridge Estate — ground floor plan"
      style={{ maxWidth: 560 }}
    >
      <defs>
        {/* Drafting grid */}
        <pattern id="mp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.1" opacity={ls.gridAlpha} />
        </pattern>

        {/* Paper grain */}
        <filter id="mp-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feBlend in="SourceGraphic" in2="mono" mode="multiply" />
        </filter>

        {/* Terrain — finer, more subtle */}
        <pattern id="mp-terrain" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="18" cy="15" r="0.3" fill="hsl(35 12% 28%)" opacity="0.02" />
          <circle cx="55" cy="32" r="0.2" fill="hsl(35 10% 26%)" opacity="0.015" />
          <circle cx="10" cy="58" r="0.25" fill="hsl(35 14% 24%)" opacity="0.015" />
          <circle cx="65" cy="68" r="0.2" fill="hsl(35 8% 30%)" opacity="0.012" />
          <circle cx="38" cy="42" r="0.15" fill="hsl(35 10% 28%)" opacity="0.01" />
        </pattern>
        {/* Contour lines — gentler curves */}
        <pattern id="mp-contour" width="160" height="160" patternUnits="userSpaceOnUse">
          <path d="M 0 50 Q 40 46, 80 49 T 160 47" fill="none" stroke="hsl(35 8% 32%)" strokeWidth="0.15" opacity="0.018" />
          <path d="M 0 100 Q 50 95, 100 98 T 160 96" fill="none" stroke="hsl(35 8% 32%)" strokeWidth="0.12" opacity="0.012" />
          <path d="M 0 140 Q 35 137, 70 139 T 160 136" fill="none" stroke="hsl(35 8% 32%)" strokeWidth="0.1" opacity="0.008" />
        </pattern>

        {/* Materials — refined */}
        <pattern id="mp-sand" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="hsl(35 18% 16% / 0.2)" />
          <circle cx="1" cy="1" r="0.2" fill="hsl(35 12% 22% / 0.04)" />
          <circle cx="3" cy="3" r="0.15" fill="hsl(35 12% 20% / 0.03)" />
        </pattern>
        <pattern id="mp-bldg" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="hsl(30 10% 14% / 0.28)" />
          <line x1="0" y1="8" x2="8" y2="8" stroke="hsl(30 8% 20% / 0.018)" strokeWidth="0.25" />
        </pattern>
        <pattern id="mp-pave" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="hsl(25 6% 13% / 0.16)" />
          <line x1="3" y1="0" x2="3" y2="6" stroke="hsl(25 6% 18% / 0.015)" strokeWidth="0.15" />
          <line x1="0" y1="3" x2="6" y2="3" stroke="hsl(25 6% 18% / 0.015)" strokeWidth="0.15" />
        </pattern>
        <pattern id="mp-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="hsl(var(--accent))" strokeWidth="0.14" opacity="0.014" />
        </pattern>

        {/* Filters — refined: no glow, just shadow + subtle lift */}
        <filter id="mp-active" x="-6%" y="-6%" width="115%" height="118%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="sb" />
          <feFlood floodColor="hsl(0 0% 0%)" floodOpacity="0.15" result="sc" />
          <feComposite in="sc" in2="sb" operator="in" result="s" />
          <feOffset in="s" dx="0.8" dy="1.5" result="so" />
          <feMerge><feMergeNode in="so" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="mp-viewing" x="-8%" y="-8%" width="120%" height="124%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="sb" />
          <feFlood floodColor="hsl(0 0% 0%)" floodOpacity="0.2" result="sc" />
          <feComposite in="sc" in2="sb" operator="in" result="s" />
          <feOffset in="s" dx="1" dy="2" result="so" />
          <feMerge><feMergeNode in="so" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="mp-elev" x="-4%" y="-4%" width="112%" height="116%">
          <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="hsl(0 0% 0%)" floodOpacity="0.1" />
        </filter>

        {/* Flow fade mask */}
        <linearGradient id="flow-fade-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="6%" stopColor="white" stopOpacity="1" />
          <stop offset="94%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="flow-mask-v">
          <rect x="0" y="60" width={SVG_W} height="700" fill="url(#flow-fade-v)" />
        </mask>

        {/* Terrain gradient — grounding */}
        <radialGradient id="grad-terrain" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0%" stopColor="hsl(35 10% 25%)" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(35 6% 12%)" stopOpacity="0.025" />
        </radialGradient>

        {/* Edge vignette */}
        <radialGradient id="mp-vignette" cx="0.5" cy="0.48" r="0.55">
          <stop offset="0%" stopColor="transparent" stopOpacity="0" />
          <stop offset="85%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* ── Terrain base ── */}
      <g style={{ opacity: ls.terrainAlpha, transition: "opacity 600ms ease" }}>
        <rect width={SVG_W} height={SVG_H} fill="url(#mp-terrain)" />
        <rect width={SVG_W} height={SVG_H} fill="url(#mp-contour)" />
        <rect width={SVG_W} height={SVG_H} fill="url(#grad-terrain)" />
      </g>

      {/* Grid */}
      <rect width={SVG_W} height={SVG_H} fill="url(#mp-grid)" />

      {/* ── Material fills ── */}
      <g style={{ opacity: ls.materialAlpha, transition: "opacity 500ms ease" }}>
        <rect x="185" y="95" width="370" height="70" fill="url(#mp-bldg)" rx="0.5" />
        <rect x="185" y="165" width="90" height="175" fill="url(#mp-bldg)" rx="0.5" />
        <rect x="465" y="165" width="90" height="175" fill="url(#mp-bldg)" rx="0.5" />
        <rect x="275" y="165" width="190" height="175" fill="url(#mp-pave)" rx="0.5" />
        <rect x="185" y="340" width="370" height="85" fill="url(#mp-bldg)" rx="0.5" />
        <rect x="330" y="425" width="80" height="45" fill="url(#mp-pave)" rx="0.5" />
        <rect x="245" y="470" width="250" height="230" fill="url(#mp-sand)" rx="0.5" />
        <rect x="245" y="700" width="250" height="40" fill="url(#mp-hatch)" />
        <rect x="345" y="95" width="50" height="70" fill="hsl(25 6% 12% / 0.14)" />
      </g>

      {/* ── Depth shadows — consistent NW light ── */}
      <g style={{ opacity: ls.shadowAlpha, transition: "opacity 500ms ease" }}>
        <rect x="185" y="95" width="370" height="330" fill="none" filter="url(#mp-elev)" rx="0.5" />
        <rect x="245" y="470" width="250" height="230" fill="none" filter="url(#mp-elev)" rx="0.5" />
        {/* Ground contact shadows */}
        <rect x="184" y="423" width="372" height="4" fill="hsl(0 0% 0% / 0.025)" rx="2" />
        <rect x="244" y="698" width="252" height="4" fill="hsl(0 0% 0% / 0.025)" rx="2" />
      </g>

      {/* ── Property boundary ── */}
      <rect x="145" y="55" width="450" height="720" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.02" strokeDasharray="12 8" />

      {/* ── STABLE ROW — minimal dividers only ── */}
      {[235, 345, 395, 505].map(x => (
        <line key={`sd${x}`} x1={x} y1="95" x2={x} y2="165" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.025" />
      ))}
      <text x="370" y="134" textAnchor="middle" fontSize="2.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.4} fontFamily="monospace" letterSpacing="0.18em">ENTRY</text>

      {/* Central axis */}
      <line x1="370" y1="95" x2="370" y2="165" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.02" strokeDasharray="3 5" />

      {/* ── WEST WING ── */}
      <line x1="185" y1="252" x2="275" y2="252" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.02" />

      {/* ── SERVICE WING ── */}
      <line x1="465" y1="220" x2="555" y2="220" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.02" />
      <line x1="465" y1="278" x2="555" y2="278" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.02" />

      {/* ── BOTTOM ROW ── */}
      {[275, 400].map(x => (
        <line key={`br${x}`} x1={x} y1="340" x2={x} y2="425" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.02" />
      ))}
      <text x="370" y="385" textAnchor="middle" fontSize="2.5" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.35} fontFamily="monospace" letterSpacing="0.12em">TACK</text>

      {/* ── VIEWING LOFT (upper level) ── */}
      <rect
        x="310" y="355" width="120" height="65"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.2"
        opacity={ls.labelOpacity * 0.25}
        strokeDasharray="4 4"
      />

      {/* ── ARENA CORRIDOR ── */}
      <line x1="370" y1="425" x2="370" y2="470" stroke="hsl(var(--accent))" strokeWidth="0.15" opacity="0.02" strokeDasharray="3 4" />

      {/* ── ARENA LABELS ── */}
      <text x="370" y="585" textAnchor="middle" fontSize="3.8" fill="hsl(var(--accent))" opacity={ls.labelOpacity * 0.3} fontFamily="monospace" letterSpacing="0.25em">INDOOR ARENA</text>

      {/* ── STRUCTURE LAYER ── */}
      {buildLayer === "structure" && (
        <g style={{ opacity: 1, animation: "fade-in 0.3s ease-out" }}>
          {/* Stable block column grid */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <g key={`sc${i}`}>
              <rect x={183 + i * 42} y="93" width="2" height="2" fill="hsl(var(--accent))" opacity="0.12" rx="0.3" />
              <rect x={183 + i * 42} y="163" width="2" height="2" fill="hsl(var(--accent))" opacity="0.12" rx="0.3" />
            </g>
          ))}
          {[0, 1, 2, 3].map(i => (
            <g key={`lwc${i}`}>
              <rect x="183" y={165 + i * 45} width="2" height="2" fill="hsl(var(--accent))" opacity="0.1" rx="0.3" />
              <rect x="273" y={165 + i * 45} width="2" height="2" fill="hsl(var(--accent))" opacity="0.1" rx="0.3" />
            </g>
          ))}
          {[0, 1, 2, 3].map(i => (
            <g key={`rwc${i}`}>
              <rect x="463" y={165 + i * 45} width="2" height="2" fill="hsl(var(--accent))" opacity="0.1" rx="0.3" />
              <rect x="553" y={165 + i * 45} width="2" height="2" fill="hsl(var(--accent))" opacity="0.1" rx="0.3" />
            </g>
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <g key={`ac${i}`}>
              <rect x="243" y={472 + i * 30} width="2" height="2" fill="hsl(var(--accent))" opacity="0.1" rx="0.3" />
              <rect x="493" y={472 + i * 30} width="2" height="2" fill="hsl(var(--accent))" opacity="0.1" rx="0.3" />
            </g>
          ))}
          {/* Load paths */}
          <line x1="185" y1="95" x2="185" y2="425" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="2 3" />
          <line x1="555" y1="95" x2="555" y2="425" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="2 3" />
          <line x1="245" y1="470" x2="245" y2="700" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="2 3" />
          <line x1="495" y1="470" x2="495" y2="700" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.06" strokeDasharray="2 3" />
          {/* Tie lines */}
          <line x1="185" y1="95" x2="555" y2="95" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" strokeDasharray="4 6" />
          <line x1="185" y1="340" x2="555" y2="340" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" strokeDasharray="4 6" />
          <line x1="245" y1="470" x2="495" y2="470" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" strokeDasharray="4 6" />
        </g>
      )}

      {/* ── ENVELOPE LAYER ── */}
      {buildLayer === "envelope" && (
        <g style={{ opacity: 1, animation: "fade-in 0.3s ease-out" }}>
          <path d="M 185 90 L 370 78 L 555 90" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.1" strokeDasharray="6 4" />
          <rect x="185" y="95" width="370" height="330" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.7" opacity="0.08" />
          <rect x="185" y="165" width="90" height="175" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.05" />
          <rect x="465" y="165" width="90" height="175" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.05" />
          <path d="M 245 465 L 370 452 L 495 465" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.1" strokeDasharray="6 4" />
          <rect x="245" y="470" width="250" height="230" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.7" opacity="0.08" />
          {/* Eave overhangs */}
          <line x1="180" y1="95" x2="560" y2="95" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.03" />
          <line x1="240" y1="470" x2="500" y2="470" stroke="hsl(var(--accent))" strokeWidth="0.2" opacity="0.03" />
          <rect x="330" y="425" width="80" height="45" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.35" opacity="0.04" />
        </g>
      )}

      {/* ── MOVEMENT FLOWS — refined with taper ── */}
      <g mask="url(#flow-mask-v)">
        {showFlows.map(flowId => {
          const flow = flowPaths.find(f => f.id === flowId);
          if (!flow) return null;
          return (
            <g key={flow.id} style={{ animation: "fade-in 0.3s ease-out" }}>
              {/* Soft halo */}
              <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="3.5" opacity="0.02" strokeLinecap="round" />
              {/* Core line */}
              <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="1" opacity="0.14" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 6">
                <animate attributeName="stroke-dashoffset" from="28" to="0" dur="4s" repeatCount="indefinite" />
              </path>
              {/* Pulse dots */}
              <path d={flow.d} fill="none" stroke={flow.color} strokeWidth="1.8" opacity="0.06" strokeLinecap="round" strokeDasharray="0.5 20">
                <animate attributeName="stroke-dashoffset" from="41" to="0" dur="4s" repeatCount="indefinite" />
              </path>
            </g>
          );
        })}
      </g>

      {/* ── ZONE INTELLIGENCE OVERLAYS — subtle technical reveals ── */}
      {/* Arena: surface grid system */}
      <g
        className="pointer-events-none"
        style={{
          opacity: activeZone === "indoor-arena" ? 0.065 : 0,
          transition: `opacity 180ms ${T_EASE}`,
        }}
      >
        {/* GroundLock panel grid */}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`ag-h${i}`} x1="255" y1={480 + i * 20} x2="485" y2={480 + i * 20} stroke="hsl(38 50% 50%)" strokeWidth="0.3" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`ag-v${i}`} x1={255 + i * 20.9} y1="480" x2={255 + i * 20.9} y2="690" stroke="hsl(38 50% 50%)" strokeWidth="0.3" />
        ))}
        <text x="370" y="608" textAnchor="middle" fontSize="3" fontFamily="monospace" fill="hsl(38 50% 50%)" opacity="0.6" letterSpacing="0.15em">GROUNDLOCK SURFACE SYSTEM</text>
        <text x="370" y="665" textAnchor="middle" fontSize="2.6" fontFamily="monospace" fill="hsl(var(--accent))" letterSpacing="0.1em"
          style={{ opacity: activeZone === "indoor-arena" ? 0.14 : 0, transition: `opacity 260ms ${T_EASE} 200ms` }}>
          Consistent footing. Reduced fatigue.
        </text>
      </g>

      {/* Drainage: contour flow lines */}
      <g
        className="pointer-events-none"
        style={{
          opacity: activeZone === "courtyard" ? 0.07 : 0,
          transition: `opacity 180ms ${T_EASE}`,
        }}
      >
        {/* Flow direction arrows showing drainage away from courtyard */}
        <path d="M 310 200 Q 290 210, 270 230" fill="none" stroke="hsl(200 40% 50%)" strokeWidth="0.4" strokeDasharray="3 2" />
        <path d="M 430 200 Q 450 210, 470 230" fill="none" stroke="hsl(200 40% 50%)" strokeWidth="0.4" strokeDasharray="3 2" />
        <path d="M 310 300 Q 290 310, 270 320" fill="none" stroke="hsl(200 40% 50%)" strokeWidth="0.4" strokeDasharray="3 2" />
        <path d="M 430 300 Q 450 310, 470 320" fill="none" stroke="hsl(200 40% 50%)" strokeWidth="0.4" strokeDasharray="3 2" />
        <path d="M 370 320 L 370 335" fill="none" stroke="hsl(200 40% 50%)" strokeWidth="0.4" strokeDasharray="3 2" />
        {/* Small directional chevrons */}
        <polygon points="268,232 272,228 272,232" fill="hsl(200 40% 50%)" opacity="0.5" />
        <polygon points="472,232 468,228 468,232" fill="hsl(200 40% 50%)" opacity="0.5" />
        <polygon points="370,337 368,332 372,332" fill="hsl(200 40% 50%)" opacity="0.5" />
        <text x="370" y="265" textAnchor="middle" fontSize="2.5" fontFamily="monospace" fill="hsl(200 40% 50%)" opacity="0.5" letterSpacing="0.12em">GRADED FALL</text>
        <text x="370" y="280" textAnchor="middle" fontSize="2.4" fontFamily="monospace" fill="hsl(var(--accent))" letterSpacing="0.1em"
          style={{ opacity: activeZone === "courtyard" ? 0.13 : 0, transition: `opacity 260ms ${T_EASE} 200ms` }}>
          Water moves. Surface holds.
        </text>
      </g>

      {/* Access: path highlighting with direction */}
      <g
        className="pointer-events-none"
        style={{
          opacity: activeZone === "stable-row" ? 0.06 : 0,
          transition: `opacity 180ms ${T_EASE}`,
        }}
      >
        {/* Main entry flow through breezeway */}
        <path d="M 370 75 L 370 95 L 370 165" fill="none" stroke="hsl(0 0% 65%)" strokeWidth="1.2" strokeDasharray="5 4">
          <animate attributeName="stroke-dashoffset" from="18" to="0" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Float bay entry paths */}
        <path d="M 160 130 L 185 130" fill="none" stroke="hsl(0 0% 65%)" strokeWidth="0.8" strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" from="12" to="0" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M 580 130 L 555 130" fill="none" stroke="hsl(0 0% 65%)" strokeWidth="0.8" strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" from="12" to="0" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Directional chevrons */}
        <polygon points="370,167 367,160 373,160" fill="hsl(0 0% 65%)" opacity="0.4" />
        <text x="370" y="84" textAnchor="middle" fontSize="2.5" fontFamily="monospace" fill="hsl(0 0% 65%)" opacity="0.45" letterSpacing="0.12em">ENTRY FLOW</text>
        <text x="370" y="96" textAnchor="middle" fontSize="2.4" fontFamily="monospace" fill="hsl(var(--accent))" letterSpacing="0.1em"
          style={{ opacity: activeZone === "stable-row" ? 0.13 : 0, transition: `opacity 260ms ${T_EASE} 200ms` }}>
          Flow without congestion.
        </text>
      </g>

      {/* Stables west wing: layout outline emphasis */}
      <g
        className="pointer-events-none"
        style={{
          opacity: activeZone === "west-wing" ? 0.06 : 0,
          transition: `opacity 180ms ${T_EASE}`,
        }}
      >
        {/* Individual stable outlines */}
        <rect x="190" y="170" width="80" height="82" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeDasharray="4 2" />
        <rect x="190" y="257" width="80" height="78" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeDasharray="4 2" />
        {/* Door openings */}
        <line x1="275" y1="195" x2="275" y2="225" stroke="hsl(38 50% 55%)" strokeWidth="1" opacity="0.6" />
        <line x1="275" y1="280" x2="275" y2="310" stroke="hsl(38 50% 55%)" strokeWidth="1" opacity="0.6" />
        {/* Paddock access arrows */}
        <path d="M 185 210 L 165 210" fill="none" stroke="hsl(120 20% 45%)" strokeWidth="0.6" strokeDasharray="3 2" />
        <path d="M 185 295 L 165 295" fill="none" stroke="hsl(120 20% 45%)" strokeWidth="0.6" strokeDasharray="3 2" />
        <polygon points="163,210 168,208 168,212" fill="hsl(120 20% 45%)" opacity="0.5" />
        <polygon points="163,295 168,293 168,297" fill="hsl(120 20% 45%)" opacity="0.5" />
        <text x="157" y="253" textAnchor="middle" fontSize="2.2" fontFamily="monospace" fill="hsl(120 20% 45%)" opacity="0.5" letterSpacing="0.1em" transform="rotate(-90, 157, 253)">PADDOCK ACCESS</text>
        <text x="230" y="225" textAnchor="middle" fontSize="2.4" fontFamily="monospace" fill="hsl(var(--accent))" letterSpacing="0.1em"
          style={{ opacity: activeZone === "west-wing" ? 0.14 : 0, transition: `opacity 260ms ${T_EASE} 200ms` }}>
          Movement designed, not forced.
        </text>
      </g>

      {/* Service wing: function zones */}
      <g
        className="pointer-events-none"
        style={{
          opacity: activeZone === "service-wing" ? 0.06 : 0,
          transition: `opacity 180ms ${T_EASE}`,
        }}
      >
        {/* Drainage flow in wash bay */}
        <path d="M 490 195 Q 510 200, 510 215 L 510 218" fill="none" stroke="hsl(200 40% 50%)" strokeWidth="0.5" strokeDasharray="2 2" />
        <polygon points="510,220 508,215 512,215" fill="hsl(200 40% 50%)" opacity="0.5" />
        {/* Workflow arrows */}
        <path d="M 510 220 L 510 250" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" strokeDasharray="2 2" />
        <path d="M 510 278 L 510 310" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" strokeDasharray="2 2" />
        <text x="545" y="252" textAnchor="middle" fontSize="2" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.4" letterSpacing="0.1em" transform="rotate(90, 545, 252)">WORKFLOW</text>
      </g>

      {/* Tack rooms: connection to arena */}
      <g
        className="pointer-events-none"
        style={{
          opacity: activeZone === "tack-rooms" ? 0.06 : 0,
          transition: `opacity 180ms ${T_EASE}`,
        }}
      >
        {/* Stair connection arrow */}
        <path d="M 370 425 L 370 470" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.8" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="14" to="0" dur="3s" repeatCount="indefinite" />
        </path>
        <polygon points="370,472 367,465 373,465" fill="hsl(var(--accent))" opacity="0.4" />
        <text x="395" y="448" fontSize="2.2" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.4" letterSpacing="0.1em">TO ARENA</text>
        {/* Upper level indicator */}
        <path d="M 370 385 L 370 360" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="395" y="370" fontSize="2" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.35" letterSpacing="0.08em">UPPER LEVEL</text>
      </g>

      {/* Arena zone: clear-span emphasis */}
      <g
        className="pointer-events-none"
        style={{
          opacity: activeZone === "indoor-arena" ? 0.055 : 0,
          transition: `opacity 180ms ${T_EASE}`,
        }}
      >
        {/* No-column indicators */}
        <text x="370" y="625" textAnchor="middle" fontSize="2.5" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.5" letterSpacing="0.15em">CLEAR-SPAN — NO COLUMNS</text>
        {/* Span dimension */}
        <line x1="255" y1="640" x2="485" y2="640" stroke="hsl(var(--accent))" strokeWidth="0.3" />
        <line x1="255" y1="636" x2="255" y2="644" stroke="hsl(var(--accent))" strokeWidth="0.25" />
        <line x1="485" y1="636" x2="485" y2="644" stroke="hsl(var(--accent))" strokeWidth="0.25" />
        <text x="370" y="650" textAnchor="middle" fontSize="2.5" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.4" letterSpacing="0.08em">24 m CLEAR</text>
      </g>

      {/* ── INTERACTIVE ZONES — fade + focus, weighted hover ── */}
      {zones.map(z => {
        const isActive = activeZone === z.id;
        const isDimmed = activeZone !== null && !isActive;
        const center = getCenter(z.path);
        const elevShift = isActive ? z.elevation * -1.5 : 0;
        const dimOpacity = (isViewing && !isActive) ? 0.06 : 0.08;
        const isViewingZone = z.id === "viewing-loft";

        return (
          <g
            key={z.id}
            style={{
              opacity: isDimmed ? dimOpacity : 1,
              transform: `translateY(${elevShift}px)`,
              transition: `opacity ${T} ${T_EASE} ${isDimmed ? '0ms' : '150ms'}, transform ${T} ${T_EASE} ${isActive ? '150ms' : '0ms'}`,
              willChange: "opacity, transform",
            }}
            filter={undefined}
          >
            {/* Outline trace on active — draws in */}
            {isActive && (
              <path
                d={z.path}
                fill="none"
                stroke="hsl(var(--accent) / 0.08)"
                strokeWidth="0.6"
                strokeDasharray="400"
                strokeDashoffset="0"
                className="pointer-events-none"
                style={{ animation: "mp-trace 0.7s cubic-bezier(0.45, 0, 0.15, 1) forwards" }}
              />
            )}
            <path
              d={z.path}
              fill={isActive ? "hsl(var(--accent) / 0.06)" : `hsl(var(--accent) / ${ls.fillAlpha})`}
              stroke={isActive ? "hsl(var(--accent) / 0.35)" : `hsl(var(--accent) / ${ls.zoneOpacity})`}
              strokeWidth={isActive ? ls.strokeW * 1.6 : ls.strokeW}
              style={{ transition: `fill ${T} ${T_EASE}, stroke ${T} ${T_EASE}, stroke-width ${T} ${T_EASE}`, cursor: "pointer" }}
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={onLeave}
              onClick={() => onTap(z.id)}
            />
            <text
              x={center.x}
              y={center.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isActive ? (isViewingZone ? "6" : "5.5") : "4.5"}
              fontFamily="monospace"
              letterSpacing="0.15em"
              fill="hsl(var(--accent))"
              className="pointer-events-none uppercase"
              style={{ opacity: isActive ? (isViewingZone ? 0.55 : 0.4) : ls.labelOpacity * 0.5, transition: `opacity ${T} ${T_EASE} ${isActive ? '180ms' : '0ms'}, font-size ${T} ${T_EASE}` }}
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
              <rect x={243} y={475 + i * 28} width="2" height="2" fill="hsl(var(--accent))" opacity="0.03" rx="0.3" />
              <rect x={493} y={475 + i * 28} width="2" height="2" fill="hsl(var(--accent))" opacity="0.03" rx="0.3" />
            </g>
          ))}
        </>
      )}

      {/* ── DIMENSIONS — minimal ── */}
      <g opacity="0.025" fontSize="3" fontFamily="monospace" fill="hsl(var(--accent))" letterSpacing="0.06em">
        <line x1="245" y1="748" x2="495" y2="748" stroke="hsl(var(--accent))" strokeWidth="0.15" />
        <line x1="245" y1="744" x2="245" y2="752" stroke="hsl(var(--accent))" strokeWidth="0.15" />
        <line x1="495" y1="744" x2="495" y2="752" stroke="hsl(var(--accent))" strokeWidth="0.15" />
        <text x="370" y="747" textAnchor="middle">24 m</text>
      </g>

      {/* ── SCALE BAR ── */}
      <g opacity="0.02" transform="translate(600, 760)">
        <line x1="0" y1="0" x2="40" y2="0" stroke="hsl(var(--accent))" strokeWidth="0.25" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="hsl(var(--accent))" strokeWidth="0.2" />
        <line x1="40" y1="-2" x2="40" y2="2" stroke="hsl(var(--accent))" strokeWidth="0.2" />
        <text x="20" y="7" fontSize="2.5" fill="hsl(var(--accent))" fontFamily="monospace" textAnchor="middle">10m</text>
      </g>

      {/* ── NORTH ARROW ── */}
      <g opacity="0.03" transform="translate(670, 120)">
        <line x1="0" y1="12" x2="0" y2="-12" stroke="hsl(var(--accent))" strokeWidth="0.2" />
        <polygon points="0,-14 -1.5,-9 1.5,-9" fill="hsl(var(--accent))" opacity="0.2" />
        <text x="0" y="-18" textAnchor="middle" fontSize="3.5" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.1em">N</text>
      </g>

      {/* ── DRAWING TITLE BLOCK — minimal ── */}
      <g opacity="0.025" transform="translate(555, 792)">
        <text x="0" y="0" fontSize="3" fill="hsl(var(--accent))" fontFamily="monospace" letterSpacing="0.08em">MAIN RIDGE ESTATE</text>
        <text x="0" y="7" fontSize="2.2" fill="hsl(var(--accent))" fontFamily="monospace" opacity="0.5" letterSpacing="0.06em">A03 — GROUND FLOOR</text>
      </g>

      {/* ── Edge vignette ── */}
      <rect width={SVG_W} height={SVG_H} fill="url(#mp-vignette)" className="pointer-events-none" />

      {/* ── Outline trace keyframe (inline via style element) ── */}
      <style>{`
        @keyframes mp-trace {
          from { stroke-dashoffset: 400; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}
