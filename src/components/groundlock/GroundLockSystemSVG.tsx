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
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/28 mb-5">
        The Panel
      </p>
      <svg viewBox="0 0 140 180" className="w-full max-w-[200px] h-auto mx-auto">
        <PanelDefs id="sp" />
        <GroundLockPanelSVG x={20} y={28} scale={1.07} active showTabs defsId="sp" />
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground/18 text-center mt-4 tracking-[0.12em]">
        Horseshoe geometry · Interlocking tabs
      </p>
    </div>
  );
}

/* ── 02 — The System (tight tessellation) ─────────────── */
export function PanelArray({ className }: { className?: string }) {
  const s = 0.42;
  const colW = 56 * s;
  const rowH = 40 * s;

  const panels: { x: number; y: number; rot: number; row: number }[] = [];

  const uprightCols = 7;
  const invertedCols = 6;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < uprightCols; c++) {
      panels.push({ x: 4 + c * colW, y: 4 + r * rowH * 2, rot: 0, row: r * 2 });
    }
    if (r < 2) {
      for (let c = 0; c < invertedCols; c++) {
        panels.push({
          x: 4 + colW * 0.5 + c * colW,
          y: 4 + r * rowH * 2 + rowH,
          rot: 180,
          row: r * 2 + 1,
        });
      }
    }
  }

  const svgW = 4 + uprightCols * colW + 10;
  const svgH = 4 + 4 * rowH + 42 * s + 4;

  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/28 mb-5">
        The System
      </p>
      <svg viewBox={`0 0 ${Math.round(svgW)} ${Math.round(svgH)}`} className="w-full max-w-md h-auto mx-auto">
        <PanelDefs id="ar" />
        {panels.map((p, i) => (
          <GroundLockPanelSVG
            key={i}
            x={p.x}
            y={p.y}
            scale={s}
            rotation={p.rot}
            active={p.row === 1 || p.row === 2}
            showTabs
            defsId="ar"
          />
        ))}
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground/18 text-center mt-4 tracking-[0.12em]">
        Alternating rows nest and interlock into continuous surface
      </p>
    </div>
  );
}

/* ── 03 — The Layout (dense modular installation grid) ── */
export function PanelSiteLayout({ className }: { className?: string }) {
  const s = 0.20;
  const colW = 56 * s;
  const rowH = 40 * s;

  const uprightCols = 15;
  const invertedCols = 14;
  const rowPairs = 5;

  const panels: { x: number; y: number; rot: number; isHero: boolean; row: number; col: number }[] = [];

  for (let pair = 0; pair < rowPairs; pair++) {
    const baseY = 6 + pair * rowH * 2;
    for (let c = 0; c < uprightCols; c++) {
      panels.push({ x: 6 + c * colW, y: baseY, rot: 0, isHero: false, row: pair * 2, col: c });
    }
    if (pair < rowPairs - 1) {
      for (let c = 0; c < invertedCols; c++) {
        panels.push({
          x: 6 + colW * 0.5 + c * colW,
          y: baseY + rowH,
          rot: 180,
          isHero: false,
          row: pair * 2 + 1,
          col: c,
        });
      }
    }
  }

  const midRow = 4;
  const midCol = Math.floor(uprightCols / 2);
  const heroIdx = panels.findIndex((p) => p.row === midRow && p.col === midCol);
  if (heroIdx >= 0) panels[heroIdx].isHero = true;

  const svgW = Math.round(6 + uprightCols * colW + 12);
  const svgH = Math.round(6 + (rowPairs * 2 - 1) * rowH + 20 * s + 6);

  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/28 mb-5">
        The Layout
      </p>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-xl h-auto mx-auto"
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
      <p className="text-[10px] font-mono text-muted-foreground/18 text-center mt-4 tracking-[0.12em]">
        Modular surface coverage · Repeatable installation grid
      </p>
    </div>
  );
}
