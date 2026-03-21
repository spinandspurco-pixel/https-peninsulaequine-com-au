/**
 * GroundLock™ System Visuals — Three modes with staged reveal animations.
 *
 * 1. PanelSpecimen  — Hero / beauty visual (cinematic single panel)
 * 2. LockSequence   — Step-by-step: single → approach → locked → extended
 * 3. SystemDiagram  — Full interlocking system showing alternating rhythm
 *
 * All animations are opacity-only, lightweight, and work as static on touch.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";
import { cn } from "@/lib/utils";

/* ── Intersection observer hook for staged reveals ── */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ── Staged opacity helper ── */
function stageStyle(inView: boolean, delay: number): React.CSSProperties {
  return {
    opacity: inView ? 1 : 0,
    transition: `opacity 450ms ease ${delay}ms`,
  };
}

/* ══════════════════════════════════════════════════════════
   01 — Hero / Beauty Visual
   ══════════════════════════════════════════════════════════ */
export function PanelSpecimen({ className }: { className?: string }) {
  const { ref, inView } = useInView();

  return (
    <div className={cn("text-center", className)} ref={ref}>
      <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-5" style={stageStyle(inView, 0)}>
        The Panel
      </p>
      <div style={stageStyle(inView, 150)}>
        <svg viewBox="0 0 100 110" className="w-full max-w-[180px] sm:max-w-[220px] h-auto mx-auto">
          <PanelDefs id="sp" />
          <GroundLockPanelSVG active showTabs showJoins defsId="sp" direction="up" />
        </svg>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground/20 mt-4 tracking-[0.12em]" style={stageStyle(inView, 300)}>
        Horseshoe geometry · Directional interlock
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   02 — Lock Sequence (step-by-step with staged reveals)
   ══════════════════════════════════════════════════════════ */
export function LockSequence({ className }: { className?: string }) {
  const { ref, inView } = useInView(0.2);

  /*
   * Mobile: stack vertically as a 2×2 grid
   * Desktop: horizontal 4-step strip
   *
   * Each step has its own SVG for clean responsive scaling.
   */
  const s = 0.45;

  const steps = [
    {
      label: "Panel A",
      step: "01",
      render: () => (
        <svg viewBox="0 0 100 110" className="w-full h-auto max-w-[140px] mx-auto">
          <PanelDefs id="ls1" />
          <GroundLockPanelSVG direction="up" active showTabs showJoins defsId="ls1" />
        </svg>
      ),
    },
    {
      label: "Opposing",
      step: "02",
      render: () => (
        <svg viewBox="0 0 130 110" className="w-full h-auto max-w-[160px] mx-auto">
          <PanelDefs id="ls2" />
          <GroundLockPanelSVG x={0} direction="up" showTabs defsId="ls2" />
          <GroundLockPanelSVG x={48} y={2} direction="down" active showTabs showJoins defsId="ls2" opacity={0.75} />
        </svg>
      ),
    },
    {
      label: "Interlocked",
      step: "03",
      render: () => (
        <svg viewBox="0 0 140 110" className="w-full h-auto max-w-[160px] mx-auto">
          <PanelDefs id="ls3" />
          <GroundLockPanelSVG x={0} direction="up" active showTabs showJoins defsId="ls3" />
          <GroundLockPanelSVG x={46} direction="down" active showTabs showJoins defsId="ls3" />
        </svg>
      ),
    },
    {
      label: "System",
      step: "04",
      render: () => (
        <svg viewBox="0 0 200 110" className="w-full h-auto max-w-[180px] mx-auto">
          <PanelDefs id="ls4" />
          {[0, 1, 2, 3].map((i) => (
            <GroundLockPanelSVG
              key={i}
              x={i * 42}
              direction={i % 2 === 0 ? "up" : "down"}
              active
              showTabs
              showJoins={i < 2}
              defsId="ls4"
              scale={0.88}
            />
          ))}
        </svg>
      ),
    },
  ];

  return (
    <div className={cn("text-center", className)} ref={ref}>
      <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-6 sm:mb-8" style={stageStyle(inView, 0)}>
        The Lock Sequence
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 max-w-2xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} style={stageStyle(inView, 200 + i * 350)}>
            <div className="mb-3">
              {step.render()}
            </div>
            <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground/25 tracking-[0.1em]">
              <span className="text-accent/35">{step.step}</span> · {step.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono text-muted-foreground/18 mt-6 tracking-[0.12em]" style={stageStyle(inView, 1600)}>
        Opposing panels nest and lock into a continuous surface
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   03 — Full System Diagram (alternating A↑ B↓ rhythm)
   ══════════════════════════════════════════════════════════ */
export function SystemDiagram({ className }: { className?: string }) {
  const { ref, inView } = useInView(0.2);

  /* Responsive: fewer columns on mobile */
  const cols = 6;
  const rows = 3;
  const s = 0.36;
  const nestX = 100 * s * 0.52; // horizontal nesting
  const nestY = 110 * s * 0.58; // vertical row spacing

  const panels: { x: number; y: number; dir: "up" | "down"; isCenter: boolean; delay: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dir: "up" | "down" = (r + c) % 2 === 0 ? "up" : "down";
      const x = 6 + c * nestX;
      const y = 6 + r * nestY;
      const isCenter = r === 1 && c >= 1 && c <= 4;
      // Stagger: centre row reveals first, then edges
      const delay = isCenter ? 200 + c * 80 : 600 + (Math.abs(c - 3) + Math.abs(r - 1)) * 60;
      panels.push({ x, y, dir, isCenter, delay });
    }
  }

  const svgW = Math.round(6 + cols * nestX + 100 * s * 0.5 + 6);
  const svgH = Math.round(6 + rows * nestY + 110 * s * 0.45 + 6);

  return (
    <div className={cn("text-center", className)} ref={ref}>
      <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-5" style={stageStyle(inView, 0)}>
        The System
      </p>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto mx-auto"
      >
        <PanelDefs id="sd" />
        {panels.map((p, i) => (
          <g key={i} style={stageStyle(inView, p.delay)}>
            <GroundLockPanelSVG
              x={p.x}
              y={p.y}
              scale={s}
              direction={p.dir}
              active={p.isCenter}
              showTabs
              showJoins={p.isCenter}
              defsId="sd"
            />
          </g>
        ))}
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground/18 mt-4 tracking-[0.12em]" style={stageStyle(inView, 1200)}>
        Alternating interlock · Continuous stabilisation surface
      </p>
    </div>
  );
}

/* ── Legacy exports for backward compatibility ── */
export const PanelArray = SystemDiagram;
export const PanelSiteLayout = LockSequence;
