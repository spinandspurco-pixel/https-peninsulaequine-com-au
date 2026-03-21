/**
 * GroundLockSystemSVG — the full horseshoe system built from repeated panel units.
 *
 * Three sections visible:
 *   1. Single panel (specimen)
 *   2. Interlocking array (how panels repeat)
 *   3. Horseshoe site layout (system in context)
 */

import { GroundLockPanelSVG } from "./GroundLockPanelSVG";

/* ── Helper: generate arc positions ───────────────────── */
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

/* ── Single Panel Specimen ────────────────────────────── */
export function PanelSpecimen({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/40 mb-4">
        01 — Unit Geometry
      </p>
      <svg viewBox="0 0 200 240" className="w-full max-w-[160px] h-auto mx-auto">
        <GroundLockPanelSVG x={50} y={60} scale={1} active />
        {/* Dimension lines */}
        <line x1={45} y1={168} x2={155} y2={168} stroke="hsl(var(--accent) / 0.3)" strokeWidth={0.5} />
        <line x1={45} y1={164} x2={45} y2={172} stroke="hsl(var(--accent) / 0.3)" strokeWidth={0.5} />
        <line x1={155} y1={164} x2={155} y2={172} stroke="hsl(var(--accent) / 0.3)" strokeWidth={0.5} />
        <text x={100} y={180} textAnchor="middle" fill="hsl(var(--accent) / 0.35)" fontSize={6} fontFamily="monospace">420mm</text>
      </svg>
    </div>
  );
}

/* ── Interlocking Array ───────────────────────────────── */
export function PanelArray({ className }: { className?: string }) {
  const s = 0.4; // scale
  const gapX = 42;
  const gapY = 32;

  const panels: { x: number; y: number; rot: number }[] = [];

  // Row 1: upright
  for (let c = 0; c < 5; c++) {
    panels.push({ x: 20 + c * gapX, y: 10, rot: 0 });
  }
  // Row 2: inverted, offset — nesting into row 1
  for (let c = 0; c < 4; c++) {
    panels.push({ x: 41 + c * gapX, y: 10 + gapY, rot: 180 });
  }
  // Row 3: upright, nesting into row 2
  for (let c = 0; c < 5; c++) {
    panels.push({ x: 20 + c * gapX, y: 10 + gapY * 2, rot: 0 });
  }

  return (
    <div className={className}>
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/40 mb-4">
        02 — Interlocking Array
      </p>
      <svg viewBox="0 0 240 130" className="w-full max-w-sm h-auto mx-auto">
        {panels.map((p, i) => (
          <GroundLockPanelSVG
            key={i}
            x={p.x}
            y={p.y}
            scale={s}
            rotation={p.rot}
            active={i >= 4 && i < 9} // highlight middle row
          />
        ))}
      </svg>
      <p className="text-[9px] font-mono text-muted-foreground/25 text-center mt-3">
        Alternating rows nest and lock under load
      </p>
    </div>
  );
}

/* ── Horseshoe Site Layout ────────────────────────────── */
export function PanelSiteLayout({ className }: { className?: string }) {
  const cx = 200;
  const cy = 160;
  const s = 0.22;

  const panels: { x: number; y: number; rot: number; zone: string }[] = [];

  // Arc perimeter (top of horseshoe)
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

  // Arena fill — tighter grid
  for (let row = 0; row < 4; row++) {
    const cols = row % 2 === 0 ? 4 : 3;
    const ox = row % 2 === 0 ? 0 : 16;
    for (let col = 0; col < cols; col++) {
      const px = cx - 50 + ox + col * 32;
      const py = cy - 10 + row * 24;
      const rot = (row + col) % 2 === 0 ? 0 : 180;
      panels.push({ x: px, y: py, rot, zone: "arena" });
    }
  }

  // Entry zone — denser packing
  for (let col = 0; col < 5; col++) {
    panels.push({ x: cx - 60 + col * 30, y: cy + 100, rot: 0, zone: "entry" });
    panels.push({ x: cx - 45 + col * 30, y: cy + 118, rot: 180, zone: "entry" });
  }

  return (
    <div className={className}>
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/40 mb-4">
        03 — Horseshoe Site Layout
      </p>
      <svg viewBox="0 0 400 300" className="w-full max-w-lg h-auto mx-auto">
        {panels.map((p, i) => (
          <GroundLockPanelSVG
            key={i}
            x={p.x}
            y={p.y}
            scale={s}
            rotation={p.rot}
            fill={
              p.zone === "entry"
                ? "hsl(var(--accent) / 0.14)"
                : p.zone === "arena"
                  ? "hsl(var(--accent) / 0.06)"
                  : "hsl(var(--accent) / 0.09)"
            }
            stroke={
              p.zone === "entry"
                ? "hsl(var(--accent) / 0.35)"
                : "hsl(var(--accent) / 0.18)"
            }
          />
        ))}
        {/* Zone labels */}
        <text x={cx} y={cy - 60} textAnchor="middle" fill="hsl(var(--accent) / 0.2)" fontSize={5} fontFamily="monospace" letterSpacing={1}>ARENA</text>
        <text x={cx - 135} y={cy + 40} textAnchor="middle" fill="hsl(var(--accent) / 0.15)" fontSize={4} fontFamily="monospace" letterSpacing={1}>ACCESS</text>
        <text x={cx + 135} y={cy + 40} textAnchor="middle" fill="hsl(var(--accent) / 0.15)" fontSize={4} fontFamily="monospace" letterSpacing={1}>ACCESS</text>
        <text x={cx} y={cy + 155} textAnchor="middle" fill="hsl(var(--accent) / 0.2)" fontSize={4.5} fontFamily="monospace" letterSpacing={1}>HIGH-TRAFFIC ENTRY</text>
      </svg>
    </div>
  );
}
