/**
 * GroundLockComparison — Standard vs GroundLock visual comparison
 * with sequential panel reveal animation on the GroundLock side.
 */

import { useEffect, useRef, useState } from "react";
import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";

/* ── Panel build order: A → B → lock → extend ── */
const PANEL_SEQUENCE: { c: number; r: number; dir: "up" | "down" }[] = [
  // Step 1: Panel A
  { c: 1, r: 0, dir: "up" },
  // Step 2: Opposing Panel B
  { c: 2, r: 0, dir: "down" },
  // Step 3: Lock — second row beneath
  { c: 1, r: 1, dir: "down" },
  { c: 2, r: 1, dir: "up" },
  // Step 4: Extend outward
  { c: 0, r: 0, dir: "down" },
  { c: 0, r: 1, dir: "up" },
  { c: 3, r: 0, dir: "up" },
  { c: 3, r: 1, dir: "down" },
];

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

/* ── Animated GroundLock visual ── */
function AnimatedGroundLockGrid({ inView }: { inView: boolean }) {
  /* Each panel gets a staggered delay:
     Step 1 (Panel A): 0ms
     Step 2 (Panel B): 500ms
     Step 3 (Lock):    1000ms
     Step 4 (Extend):  1500ms */
  const getDelay = (index: number): number => {
    if (index === 0) return 0;
    if (index === 1) return 500;
    if (index <= 3) return 1000;
    return 1500 + (index - 4) * 120;
  };

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[220px] h-auto">
      <PanelDefs id="cmp" />
      {PANEL_SEQUENCE.map((p, i) => {
        const delay = getDelay(i);
        const isFirst = i <= 1; // join-point markers on first pair
        return (
          <g
            key={`${p.r}-${p.c}`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(4px)",
              transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
            }}
          >
            <GroundLockPanelSVG
              x={6 + p.c * 38}
              y={4 + p.r * 42}
              scale={0.42}
              direction={p.dir}
              active
              showTabs
              showJoins={isFirst}
              defsId="cmp"
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ── Static flat grid visual ── */
function StandardGridVisual({ inView }: { inView: boolean }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className="w-full max-w-[200px] h-auto"
      style={{
        filter: "blur(0.4px)",
        opacity: inView ? 1 : 0,
        transition: "opacity 600ms ease 100ms",
      }}
    >
      <defs>
        <linearGradient id="std-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.06" />
          <stop offset="100%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 5 }).map((_, c) => (
          <rect
            key={`${r}-${c}`}
            x={4 + c * 31}
            y={4 + r * 24}
            width={28}
            height={20}
            rx={1.5}
            fill="url(#std-fill)"
            stroke="hsl(var(--primary-foreground) / 0.08)"
            strokeWidth={0.5}
          />
        ))
      )}
    </svg>
  );
}

/* ── Bullet points ── */
const STANDARD_POINTS = [
  "Repetitive grid layout",
  "Limited structural intelligence",
  "Surface-level modularity",
];

const GROUNDLOCK_POINTS = [
  "Alternating interlock geometry",
  "Engineered load distribution",
  "Designed for system integrity",
];

function PointList({
  points,
  inView,
  baseDelay,
  dotClass,
  textClass,
}: {
  points: string[];
  inView: boolean;
  baseDelay: number;
  dotClass: string;
  textClass: string;
}) {
  return (
    <div className="space-y-4">
      {points.map((point, i) => (
        <div
          key={point}
          className="flex items-start gap-3"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(6px)",
            transition: `opacity 450ms ease ${baseDelay + i * 120}ms, transform 450ms ease ${baseDelay + i * 120}ms`,
          }}
        >
          <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
          <p className={`text-[11px] sm:text-xs leading-[1.6] ${textClass}`}>
            {point}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Main export ── */
export function GroundLockComparison() {
  const { ref, inView } = useInView(0.2);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-0 relative">
      {/* Vertical divider — desktop */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-primary-foreground/6" />

      {/* LEFT — Standard (static fade-in only) */}
      <div className="p-8 sm:p-10 lg:p-12 md:pr-14">
        <div className="mb-8 flex justify-center">
          <StandardGridVisual inView={inView} />
        </div>
        <p
          className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-foreground/25 mb-6"
          style={{
            opacity: inView ? 1 : 0,
            transition: "opacity 500ms ease 200ms",
          }}
        >
          Standard Systems
        </p>
        <PointList
          points={STANDARD_POINTS}
          inView={inView}
          baseDelay={300}
          dotClass="bg-primary-foreground/12"
          textClass="text-primary-foreground/25"
        />
      </div>

      {/* Horizontal divider — mobile */}
      <div className="md:hidden w-3/4 mx-auto h-px bg-primary-foreground/6" />

      {/* RIGHT — GroundLock (sequential panel reveal) */}
      <div className="p-8 sm:p-10 lg:p-12 md:pl-14">
        <div className="mb-8 flex justify-center">
          <AnimatedGroundLockGrid inView={inView} />
        </div>
        <p
          className="text-[10px] font-mono uppercase tracking-[0.18em] text-accent/50 mb-6"
          style={{
            opacity: inView ? 1 : 0,
            transition: "opacity 500ms ease 1800ms",
          }}
        >
          GroundLock™ System
        </p>
        <PointList
          points={GROUNDLOCK_POINTS}
          inView={inView}
          baseDelay={2000}
          dotClass="bg-accent/35"
          textClass="text-primary-foreground/45"
        />
      </div>
    </div>
  );
}
