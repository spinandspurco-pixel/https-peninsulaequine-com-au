/**
 * GroundLock™ System Visuals — Three modes:
 *
 * 1. PanelSpecimen    — Hero / beauty visual (cinematic single panel)
 * 2. LockSequence     — Step-by-step: single → approach → locked → extended
 * 3. SystemDiagram    — Full interlocking system showing alternating rhythm
 */

import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";

/* ── 01 — Hero / Beauty Visual ─────────────────────────── */
export function PanelSpecimen({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/28 mb-5">
        The Panel
      </p>
      <svg viewBox="0 0 140 130" className="w-full max-w-[220px] h-auto mx-auto">
        <PanelDefs id="sp" />
        <GroundLockPanelSVG x={20} y={10} scale={1.1} active showTabs defsId="sp" direction="up" />
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground/18 text-center mt-4 tracking-[0.12em]">
        Horseshoe geometry · Directional interlock
      </p>
    </div>
  );
}

/* ── 02 — Lock Sequence (step-by-step) ─────────────────── */
export function LockSequence({ className }: { className?: string }) {
  /*
   * Four steps shown left-to-right:
   * Step 1: Single panel A (up)
   * Step 2: Panel B (down) approaching
   * Step 3: Panels A+B locked together
   * Step 4: Extended system A-B-A-B
   */

  const s = 0.38;
  const panelW = 100 * s; // ~38
  const gap = 6;
  const stepW = panelW + gap;
  const stageGap = 28;

  // Each stage gets its own group
  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/28 mb-5">
        The Lock Sequence
      </p>
      <svg viewBox="0 0 420 120" className="w-full max-w-xl h-auto mx-auto">
        <PanelDefs id="ls" />

        {/* Step 1 — Single panel A */}
        <g>
          <GroundLockPanelSVG x={4} y={10} scale={s} direction="up" active showTabs defsId="ls" />
          <text x={4 + panelW / 2} y={108} textAnchor="middle" className="fill-muted-foreground/20" style={{ fontSize: "6px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            1 · Panel A
          </text>
        </g>

        {/* Step 2 — Panel B approaching (offset, with gap showing approach) */}
        <g>
          <GroundLockPanelSVG x={4 + stageGap + stepW} y={10} scale={s} direction="up" showTabs defsId="ls" />
          <GroundLockPanelSVG x={4 + stageGap + stepW + panelW * 0.55} y={14} scale={s} direction="down" active showTabs defsId="ls" opacity={0.7} />
          <text x={4 + stageGap + stepW + panelW * 0.6} y={108} textAnchor="middle" className="fill-muted-foreground/20" style={{ fontSize: "6px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            2 · Opposing
          </text>
        </g>

        {/* Step 3 — Locked pair */}
        <g>
          {(() => {
            const ox = 4 + (stageGap + stepW) * 2 + panelW * 0.3;
            return (
              <>
                <GroundLockPanelSVG x={ox} y={10} scale={s} direction="up" active showTabs defsId="ls" />
                <GroundLockPanelSVG x={ox + panelW * 0.52} y={10} scale={s} direction="down" active showTabs defsId="ls" />
              </>
            );
          })()}
          <text x={4 + (stageGap + stepW) * 2 + panelW * 0.9} y={108} textAnchor="middle" className="fill-muted-foreground/20" style={{ fontSize: "6px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            3 · Interlocked
          </text>
        </g>

        {/* Step 4 — Extended A-B-A-B */}
        <g>
          {(() => {
            const ox = 4 + (stageGap + stepW) * 3 + panelW * 0.1;
            const offset = panelW * 0.48;
            return (
              <>
                <GroundLockPanelSVG x={ox} y={10} scale={s * 0.85} direction="up" active showTabs defsId="ls" />
                <GroundLockPanelSVG x={ox + offset * 0.85} y={10} scale={s * 0.85} direction="down" active showTabs defsId="ls" />
                <GroundLockPanelSVG x={ox + offset * 0.85 * 2} y={10} scale={s * 0.85} direction="up" active showTabs defsId="ls" />
                <GroundLockPanelSVG x={ox + offset * 0.85 * 3} y={10} scale={s * 0.85} direction="down" active showTabs defsId="ls" />
              </>
            );
          })()}
          <text x={4 + (stageGap + stepW) * 3 + panelW * 0.9} y={108} textAnchor="middle" className="fill-muted-foreground/20" style={{ fontSize: "6px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            4 · System
          </text>
        </g>
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground/18 text-center mt-4 tracking-[0.12em]">
        Opposing panels nest and lock into a continuous surface
      </p>
    </div>
  );
}

/* ── 03 — Full System Diagram (alternating A↑ B↓ rhythm) ── */
export function SystemDiagram({ className }: { className?: string }) {
  const s = 0.32;
  const panelW = 100 * s;
  const nestOffset = panelW * 0.50; // horizontal nesting distance
  const rowH = 110 * s * 0.65;     // vertical row spacing

  const cols = 8;
  const rows = 4;

  const panels: { x: number; y: number; dir: "up" | "down"; isCenter: boolean }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dir: "up" | "down" = (r + c) % 2 === 0 ? "up" : "down";
      const x = 8 + c * nestOffset;
      const y = 6 + r * rowH;
      const isCenter = r >= 1 && r <= 2 && c >= 2 && c <= 5;
      panels.push({ x, y, dir, isCenter });
    }
  }

  const svgW = Math.round(8 + cols * nestOffset + panelW * 0.5 + 8);
  const svgH = Math.round(6 + rows * rowH + 110 * s * 0.4 + 6);

  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/28 mb-5">
        The System
      </p>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-lg h-auto mx-auto"
      >
        <PanelDefs id="sd" />
        {panels.map((p, i) => (
          <GroundLockPanelSVG
            key={i}
            x={p.x}
            y={p.y}
            scale={s}
            direction={p.dir}
            active={p.isCenter}
            showTabs
            defsId="sd"
          />
        ))}
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground/18 text-center mt-4 tracking-[0.12em]">
        Alternating interlock · Continuous stabilisation surface
      </p>
    </div>
  );
}

/* ── Legacy exports for backward compatibility ── */
export const PanelArray = SystemDiagram;
export const PanelSiteLayout = LockSequence;
