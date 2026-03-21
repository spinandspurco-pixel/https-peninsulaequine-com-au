/**
 * GroundLockSystemSVG — premium product presentation.
 *
 * Three stages: The Panel → The System → The Layout
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

/* ── 01 — The Panel (Hero) ────────────────────────────── */
export function PanelSpecimen({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.25em] text-accent/30 mb-6">
        The Panel
      </p>
      <svg viewBox="0 0 140 180" className="w-full max-w-[220px] h-auto mx-auto">
        <PanelDefs id="sp" />
        <GroundLockPanelSVG x={20} y={28} scale={1.07} active defsId="sp" />
      </svg>
      <p className="text-2xs font-mono text-muted-foreground/20 text-center mt-5 tracking-wider">
        Horseshoe geometry · Engineered to interlock
      </p>
    </div>
  );
}

/* ── 02 — The System ──────────────────────────────────── */
export function PanelArray({ className }: { className?: string }) {
  const s = 0.4;
  const gapX = 40;
  const gapY = 28;

  const panels: { x: number; y: number; rot: number; row: number }[] = [];

  for (let c = 0; c < 5; c++) {
    panels.push({ x: 20 + c * gapX, y: 10, rot: 0, row: 0 });
  }
  for (let c = 0; c < 4; c++) {
    panels.push({ x: 40 + c * gapX, y: 10 + gapY, rot: 180, row: 1 });
  }
  for (let c = 0; c < 5; c++) {
    panels.push({ x: 20 + c * gapX, y: 10 + gapY * 2, rot: 0, row: 2 });
  }

  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.25em] text-accent/30 mb-6">
        The System
      </p>
      <svg viewBox="0 0 230 110" className="w-full max-w-sm h-auto mx-auto">
        <PanelDefs id="ar" />
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
      </svg>
      <p className="text-2xs font-mono text-muted-foreground/20 text-center mt-5 tracking-wider">
        Alternating rows nest and lock under load
      </p>
    </div>
  );
}

/* ── 03 — The Layout ──────────────────────────────────── */
export function PanelSiteLayout({ className }: { className?: string }) {
  const cx = 200;
  const cy = 160;
  const s = 0.24;

  const panels: { x: number; y: number; rot: number; zone: string }[] = [];

  const arcPanels = arcPositions(cx, cy - 20, 130, Math.PI, 2 * Math.PI, 12);
  arcPanels.forEach((p) => {
    panels.push({ x: p.x - 10, y: p.y - 12, rot: p.angle, zone: "perimeter" });
  });

  const innerArc = arcPositions(cx, cy - 20, 90, Math.PI, 2 * Math.PI, 8);
  innerArc.forEach((p) => {
    panels.push({ x: p.x - 10, y: p.y - 12, rot: p.angle + 180, zone: "inner" });
  });

  for (let j = 0; j < 5; j++) {
    panels.push({ x: cx - 140, y: cy - 20 + j * 28, rot: 0, zone: "access" });
    panels.push({ x: cx - 110, y: cy - 6 + j * 28, rot: 180, zone: "access" });
  }

  for (let j = 0; j < 5; j++) {
    panels.push({ x: cx + 100, y: cy - 20 + j * 28, rot: 0, zone: "access" });
    panels.push({ x: cx + 70, y: cy - 6 + j * 28, rot: 180, zone: "access" });
  }

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

  for (let col = 0; col < 5; col++) {
    panels.push({ x: cx - 60 + col * 30, y: cy + 100, rot: 0, zone: "entry" });
    panels.push({ x: cx - 45 + col * 30, y: cy + 118, rot: 180, zone: "entry" });
  }

  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.25em] text-accent/30 mb-6">
        The Layout
      </p>
      <svg viewBox="0 0 400 300" className="w-full max-w-lg h-auto mx-auto">
        <PanelDefs id="sl" />
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
      </svg>
    </div>
  );
}
