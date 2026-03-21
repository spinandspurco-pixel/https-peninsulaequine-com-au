/**
 * GroundLockSystemSVG — premium product presentation.
 *
 * Three stages: The Panel → The System → The Layout
 */

import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";

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

/* ── 03 — The Layout (proper modular grid, not scattered arcs) ── */
export function PanelSiteLayout({ className }: { className?: string }) {
  const s = 0.18;
  const colW = 18;   // horizontal spacing between panels
  const rowH = 16;   // vertical spacing between rows

  const cols = 11;
  const rowPairs = 5; // pairs of upright + inverted rows

  const panels: { x: number; y: number; rot: number; isHero: boolean; row: number }[] = [];

  for (let pair = 0; pair < rowPairs; pair++) {
    const baseY = 8 + pair * rowH * 2;
    // Upright row
    for (let c = 0; c < cols; c++) {
      panels.push({ x: 8 + c * colW, y: baseY, rot: 0, isHero: false, row: pair * 2 });
    }
    // Inverted row — offset half a column
    for (let c = 0; c < cols - 1; c++) {
      panels.push({ x: 8 + colW * 0.5 + c * colW, y: baseY + rowH, rot: 180, isHero: false, row: pair * 2 + 1 });
    }
  }

  // Mark centre panel as hero
  const cx = Math.floor(cols / 2);
  const heroIdx = panels.findIndex(
    (p) => p.row === 4 && Math.abs(p.x - (8 + cx * colW)) < 2
  );
  if (heroIdx >= 0) panels[heroIdx].isHero = true;

  const svgW = 8 + cols * colW + 20;
  const svgH = 8 + rowPairs * rowH * 2 + 12;

  return (
    <div className={className}>
      <p className="text-2xs font-mono uppercase tracking-[0.25em] text-accent/30 mb-6">
        The Layout
      </p>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-lg h-auto mx-auto"
      >
        <PanelDefs id="sl" />
        {panels.map((p, i) => (
          <GroundLockPanelSVG
            key={i}
            x={p.x}
            y={p.y}
            scale={s}
            rotation={p.rot}
            active={p.isHero}
            showTabs
            defsId="sl"
          />
        ))}
      </svg>
      <p className="text-2xs font-mono text-muted-foreground/20 text-center mt-5 tracking-wider">
        Modular surface coverage · Repeatable installation grid
      </p>
    </div>
  );
}
