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
        <GroundLockPanelSVG x={20} y={28} scale={1.07} active showTabs defsId="sp" />
      </svg>
      <p className="text-2xs font-mono text-muted-foreground/20 text-center mt-5 tracking-wider">
        Horseshoe geometry · Interlocking tabs
      </p>
    </div>
  );
}

/* ── 02 — The System ──────────────────────────────────── */
export function PanelArray({ className }: { className?: string }) {
  const s = 0.38;
  const gapX = 38;
  const gapY = 30;

  const panels: { x: number; y: number; rot: number; row: number }[] = [];

  for (let c = 0; c < 5; c++) {
    panels.push({ x: 18 + c * gapX, y: 8, rot: 0, row: 0 });
  }
  for (let c = 0; c < 4; c++) {
    panels.push({ x: 37 + c * gapX, y: 8 + gapY, rot: 180, row: 1 });
  }
  for (let c = 0; c < 5; c++) {
    panels.push({ x: 18 + c * gapX, y: 8 + gapY * 2, rot: 0, row: 2 });
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
            showTabs
            defsId="ar"
          />
        ))}
      </svg>
      <p className="text-2xs font-mono text-muted-foreground/20 text-center mt-5 tracking-wider">
        Alternating rows nest and interlock
      </p>
    </div>
  );
}

/* ── 03 — The Layout ──────────────────────────────────── */
export function PanelSiteLayout({ className }: { className?: string }) {
  const cx = 200;
  const cy = 150;
  const s = 0.22;

  const panels: { x: number; y: number; rot: number; zone: string }[] = [];

  // Outer horseshoe arc
  const outerArc = arcPositions(cx, cy - 10, 120, Math.PI, 2 * Math.PI, 11);
  outerArc.forEach((p) => {
    panels.push({ x: p.x - 10, y: p.y - 12, rot: p.angle, zone: "perimeter" });
  });

  // Inner arc
  const innerArc = arcPositions(cx, cy - 10, 82, Math.PI, 2 * Math.PI, 7);
  innerArc.forEach((p) => {
    panels.push({ x: p.x - 10, y: p.y - 12, rot: p.angle + 180, zone: "inner" });
  });

  // Left access column
  for (let j = 0; j < 4; j++) {
    panels.push({ x: cx - 130, y: cy - 10 + j * 26, rot: 0, zone: "access" });
    panels.push({ x: cx - 105, y: cy + 3 + j * 26, rot: 180, zone: "access" });
  }

  // Right access column
  for (let j = 0; j < 4; j++) {
    panels.push({ x: cx + 90, y: cy - 10 + j * 26, rot: 0, zone: "access" });
    panels.push({ x: cx + 65, y: cy + 3 + j * 26, rot: 180, zone: "access" });
  }

  // Entry threshold
  for (let col = 0; col < 5; col++) {
    panels.push({ x: cx - 55 + col * 28, y: cy + 95, rot: 0, zone: "entry" });
    panels.push({ x: cx - 41 + col * 28, y: cy + 112, rot: 180, zone: "entry" });
  }

  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.25em] text-accent/30 mb-6">
        The Layout
      </p>
      <svg viewBox="0 0 400 290" className="w-full max-w-lg h-auto mx-auto">
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
