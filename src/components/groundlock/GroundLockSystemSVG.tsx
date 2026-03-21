/**
 * GroundLockSystemSVG — premium engineered panel system presentation.
 *
 * Three stages: Specimen → Interlocking Array → Site Layout
 * Each uses shared PanelDefs for consistent gradient/shadow rendering.
 */

import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";

/* ── Helper: arc positions ────────────────────────────── */
function arcPositions(
  cx: number, cy: number, radius: number,
  startAngle: number, endAngle: number, count: number
) {
  const positions: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const angle = startAngle + (endAngle - startAngle) * t;
    positions.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      angle: (angle * 180) / Math.PI + 90,
    });
  }
  return positions;
}

/* ── 01 — Single Panel Specimen ───────────────────────── */
export function PanelSpecimen({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.2em] text-accent/40 mb-5">
        01 — Unit Geometry
      </p>
      <svg viewBox="0 0 200 240" className="w-full max-w-[180px] h-auto mx-auto">
        <PanelDefs id="sp" />
        <GroundLockPanelSVG x={50} y={50} scale={1} active defsId="sp" />

        {/* Dimension lines */}
        <g opacity="0.3">
          {/* Width */}
          <line x1={42} y1={168} x2={158} y2={168} stroke="hsl(var(--accent))" strokeWidth={0.4} />
          <line x1={42} y1={164} x2={42} y2={172} stroke="hsl(var(--accent))" strokeWidth={0.4} />
          <line x1={158} y1={164} x2={158} y2={172} stroke="hsl(var(--accent))" strokeWidth={0.4} />
          <text x={100} y={178} textAnchor="middle" fill="hsl(var(--accent))" fontSize={5.5} fontFamily="monospace">420mm</text>

          {/* Height */}
          <line x1={168} y1={48} x2={168} y2={148} stroke="hsl(var(--accent))" strokeWidth={0.4} />
          <line x1={164} y1={48} x2={172} y2={48} stroke="hsl(var(--accent))" strokeWidth={0.4} />
          <line x1={164} y1={148} x2={172} y2={148} stroke="hsl(var(--accent))" strokeWidth={0.4} />
          <text x={178} y={100} textAnchor="middle" fill="hsl(var(--accent))" fontSize={5.5} fontFamily="monospace" transform="rotate(90, 178, 100)">520mm</text>

          {/* Wall thickness callout */}
          <line x1={24} y1={80} x2={42} y2={80} stroke="hsl(var(--accent))" strokeWidth={0.3} strokeDasharray="2 2" />
          <text x={14} y={82} textAnchor="middle" fill="hsl(var(--accent))" fontSize={4.5} fontFamily="monospace">16</text>
        </g>

        {/* Material indicator dot */}
        <circle cx={100} cy={200} r={2.5} fill="hsl(var(--accent) / 0.12)" stroke="hsl(var(--accent) / 0.25)" strokeWidth={0.4} />
        <text x={100} y={212} textAnchor="middle" fill="hsl(var(--accent) / 0.25)" fontSize={4} fontFamily="monospace" letterSpacing="0.1em">HDPE COMPOSITE</text>
      </svg>
    </div>
  );
}

/* ── 02 — Interlocking Array ──────────────────────────── */
export function PanelArray({ className }: { className?: string }) {
  const s = 0.4;
  const gapX = 42;
  const gapY = 32;

  const panels: { x: number; y: number; rot: number; row: number }[] = [];

  for (let c = 0; c < 5; c++) {
    panels.push({ x: 20 + c * gapX, y: 10, rot: 0, row: 0 });
  }
  for (let c = 0; c < 4; c++) {
    panels.push({ x: 41 + c * gapX, y: 10 + gapY, rot: 180, row: 1 });
  }
  for (let c = 0; c < 5; c++) {
    panels.push({ x: 20 + c * gapX, y: 10 + gapY * 2, rot: 0, row: 2 });
  }

  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.2em] text-accent/40 mb-5">
        02 — Interlocking Array
      </p>
      <svg viewBox="0 0 240 140" className="w-full max-w-sm h-auto mx-auto">
        <PanelDefs id="ar" />

        {/* Connection point indicators — where panels nest */}
        {panels.filter(p => p.row === 1).map((p, i) => (
          <g key={`conn-${i}`} opacity="0.15">
            <circle cx={p.x + 20} cy={p.y + 8} r={1.8} fill="none" stroke="hsl(var(--accent))" strokeWidth={0.5} />
            <circle cx={p.x + 20} cy={p.y + 8} r={0.6} fill="hsl(var(--accent))" />
          </g>
        ))}

        {panels.map((p, i) => (
          <GroundLockPanelSVG
            key={i}
            x={p.x}
            y={p.y}
            scale={s}
            rotation={p.rot}
            active={p.row === 1}
            defsId="ar"
          />
        ))}

        {/* Load direction arrow */}
        <g opacity="0.2" transform="translate(218, 70)">
          <line x1="0" y1="-12" x2="0" y2="12" stroke="hsl(var(--accent))" strokeWidth={0.5} />
          <path d="M -3 8 L 0 14 L 3 8" fill="none" stroke="hsl(var(--accent))" strokeWidth={0.5} />
          <text x="0" y="22" textAnchor="middle" fill="hsl(var(--accent))" fontSize={3.5} fontFamily="monospace" letterSpacing="0.1em">LOAD</text>
        </g>
      </svg>
      <p className="text-2xs font-mono text-muted-foreground/20 text-center mt-3 tracking-wide">
        Alternating rows nest and lock under load
      </p>
    </div>
  );
}

/* ── 03 — Horseshoe Site Layout ───────────────────────── */
export function PanelSiteLayout({ className }: { className?: string }) {
  const cx = 200;
  const cy = 160;
  const s = 0.22;

  const panels: { x: number; y: number; rot: number; zone: string }[] = [];

  // Arc perimeter
  const arcPanels = arcPositions(cx, cy - 20, 130, Math.PI, 2 * Math.PI, 12);
  arcPanels.forEach((p) => {
    panels.push({ x: p.x - 10, y: p.y - 12, rot: p.angle, zone: "perimeter" });
  });

  // Inner arc
  const innerArc = arcPositions(cx, cy - 20, 90, Math.PI, 2 * Math.PI, 8);
  innerArc.forEach((p) => {
    panels.push({ x: p.x - 10, y: p.y - 12, rot: p.angle + 180, zone: "inner" });
  });

  // Left leg
  for (let j = 0; j < 5; j++) {
    panels.push({ x: cx - 140, y: cy - 20 + j * 28, rot: 0, zone: "access" });
    panels.push({ x: cx - 110, y: cy - 6 + j * 28, rot: 180, zone: "access" });
  }

  // Right leg
  for (let j = 0; j < 5; j++) {
    panels.push({ x: cx + 100, y: cy - 20 + j * 28, rot: 0, zone: "access" });
    panels.push({ x: cx + 70, y: cy - 6 + j * 28, rot: 180, zone: "access" });
  }

  // Arena fill
  for (let row = 0; row < 4; row++) {
    const cols = row % 2 === 0 ? 4 : 3;
    const ox = row % 2 === 0 ? 0 : 16;
    for (let col = 0; col < cols; col++) {
      panels.push({
        x: cx - 50 + ox + col * 32,
        y: cy - 10 + row * 24,
        rot: (row + col) % 2 === 0 ? 0 : 180,
        zone: "arena",
      });
    }
  }

  // Entry zone — denser
  for (let col = 0; col < 5; col++) {
    panels.push({ x: cx - 60 + col * 30, y: cy + 100, rot: 0, zone: "entry" });
    panels.push({ x: cx - 45 + col * 30, y: cy + 118, rot: 180, zone: "entry" });
  }

  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.2em] text-accent/40 mb-5">
        03 — Horseshoe Site Layout
      </p>
      <svg viewBox="0 0 400 300" className="w-full max-w-lg h-auto mx-auto">
        <PanelDefs id="sl" />

        {/* Subtle ground plane */}
        <ellipse cx={cx} cy={cy + 40} rx={170} ry={120} fill="hsl(var(--accent) / 0.015)" stroke="none" />

        {panels.map((p, i) => (
          <GroundLockPanelSVG
            key={i}
            x={p.x}
            y={p.y}
            scale={s}
            rotation={p.rot}
            active={p.zone === "entry"}
            defsId="sl"
          />
        ))}

        {/* Zone labels — minimal, architectural */}
        <text x={cx} y={cy - 65} textAnchor="middle" fill="hsl(var(--accent) / 0.18)" fontSize={4.5} fontFamily="monospace" letterSpacing="0.15em">ARENA</text>
        <text x={cx - 138} y={cy + 42} textAnchor="middle" fill="hsl(var(--accent) / 0.13)" fontSize={3.5} fontFamily="monospace" letterSpacing="0.12em">ACCESS</text>
        <text x={cx + 138} y={cy + 42} textAnchor="middle" fill="hsl(var(--accent) / 0.13)" fontSize={3.5} fontFamily="monospace" letterSpacing="0.12em">ACCESS</text>
        <text x={cx} y={cy + 152} textAnchor="middle" fill="hsl(var(--accent) / 0.18)" fontSize={4} fontFamily="monospace" letterSpacing="0.12em">HIGH-TRAFFIC ENTRY</text>
      </svg>
    </div>
  );
}
