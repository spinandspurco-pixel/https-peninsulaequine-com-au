import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * AnimatedBlueprintHero — A fully procedural, self-drawing architectural
 * blueprint that replaces the static hero image. Uses SVG path animations,
 * CSS keyframes, and requestAnimationFrame for a premium construction-tech feel.
 *
 * Layers:
 *  1. Animated grid (fades in)
 *  2. Structural wireframe barn (draws itself)
 *  3. Dimension lines + annotations (stagger in)
 *  4. Scan-line sweep (continuous)
 *  5. Floating measurement nodes (pulse)
 */

/* ── Grid pattern ─────────────────────────────────── */
function BlueprintGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Major grid */}
      <svg className="absolute inset-0 w-full h-full opacity-0 animate-[gridFadeIn_2s_0.3s_ease-out_forwards]">
        <defs>
          <pattern id="hero-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.12" />
          </pattern>
          <pattern id="hero-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.06" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid-minor)" />
        <rect width="100%" height="100%" fill="url(#hero-grid-major)" />
      </svg>
    </div>
  );
}

/* ── Self-drawing barn structure ──────────────────── */
function StructuralWireframe() {
  const pathRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = pathRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGPathElement>("[data-draw]");
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
  }, []);

  return (
    <svg
      ref={pathRef}
      viewBox="0 0 1200 600"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Foundation line */}
      <path
        data-draw
        d="M 100 480 L 1100 480"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="1.5"
        opacity="0.25"
        className="animate-[drawLine_1.8s_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]"
      />
      {/* Left wall */}
      <path
        data-draw
        d="M 200 480 L 200 220"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="1"
        opacity="0.2"
        className="animate-[drawLine_1.2s_1s_cubic-bezier(0.22,1,0.36,1)_forwards]"
      />
      {/* Right wall */}
      <path
        data-draw
        d="M 1000 480 L 1000 220"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="1"
        opacity="0.2"
        className="animate-[drawLine_1.2s_1.1s_cubic-bezier(0.22,1,0.36,1)_forwards]"
      />
      {/* Roof left */}
      <path
        data-draw
        d="M 150 220 L 600 80"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="1.2"
        opacity="0.22"
        className="animate-[drawLine_1.4s_1.6s_cubic-bezier(0.22,1,0.36,1)_forwards]"
      />
      {/* Roof right */}
      <path
        data-draw
        d="M 1050 220 L 600 80"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="1.2"
        opacity="0.22"
        className="animate-[drawLine_1.4s_1.7s_cubic-bezier(0.22,1,0.36,1)_forwards]"
      />
      {/* Ridge beam */}
      <path
        data-draw
        d="M 600 80 L 600 480"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.5"
        opacity="0.1"
        strokeDasharray="4 8"
        className="animate-[drawLine_1s_2s_ease-out_forwards]"
      />
      {/* Stall dividers */}
      {[350, 500, 650, 800].map((x, i) => (
        <path
          key={x}
          data-draw
          d={`M ${x} 480 L ${x} 280`}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.6"
          opacity="0.12"
          className="animate-[drawLine_0.8s_ease-out_forwards]"
          style={{ animationDelay: `${2.2 + i * 0.15}s` }}
        />
      ))}
      {/* Cross bracing */}
      <path
        data-draw
        d="M 200 280 L 1000 280"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.6"
        opacity="0.1"
        className="animate-[drawLine_1.2s_2.5s_ease-out_forwards]"
      />
      {/* Truss details */}
      {[300, 450, 750, 900].map((x, i) => (
        <path
          key={`truss-${x}`}
          data-draw
          d={`M ${x} 280 L ${x + (i % 2 === 0 ? 75 : -75)} 180`}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.4"
          opacity="0.08"
          className="animate-[drawLine_0.6s_ease-out_forwards]"
          style={{ animationDelay: `${2.8 + i * 0.12}s` }}
        />
      ))}
      {/* Door opening */}
      <rect
        x="560" y="360" width="80" height="120"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.8"
        opacity="0"
        className="animate-[fadeElement_0.6s_3s_ease-out_forwards]"
      />
    </svg>
  );
}

/* ── Dimension annotations ────────────────────────── */
function DimensionAnnotations() {
  const annotations = [
    { x: "17%", y: "86%", label: "12.0m", delay: 2.8 },
    { x: "78%", y: "16%", label: "RIDGE: 8.4m", delay: 3.2 },
    { x: "88%", y: "50%", label: "EAVE: 4.2m", delay: 3.0 },
    { x: "8%", y: "50%", label: "SEC A-A", delay: 3.4 },
    { x: "50%", y: "92%", label: "FLOOR: FRL 100.00", delay: 3.6 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {annotations.map((a, i) => (
        <div
          key={i}
          className="absolute opacity-0 animate-[fadeElement_0.8s_ease-out_forwards]"
          style={{
            left: a.x,
            top: a.y,
            animationDelay: `${a.delay}s`,
          }}
        >
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.15em] text-accent/40 uppercase">
            <span className="w-1 h-1 rounded-full bg-accent/30" />
            {a.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Scan line sweep ──────────────────────────────── */
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
        style={{
          animation: "scanSweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          animationDelay: "3s",
        }}
      />
    </div>
  );
}

/* ── Floating measurement nodes ───────────────────── */
function MeasurementNodes() {
  const nodes = [
    { x: "17%", y: "42%", delay: 3.5 },
    { x: "83%", y: "42%", delay: 3.7 },
    { x: "50%", y: "15%", delay: 3.9 },
    { x: "29%", y: "82%", delay: 4.1 },
    { x: "71%", y: "82%", delay: 4.3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {nodes.map((n, i) => (
        <div
          key={i}
          className="absolute opacity-0 animate-[fadeElement_0.6s_ease-out_forwards]"
          style={{ left: n.x, top: n.y, animationDelay: `${n.delay}s` }}
        >
          <div className="relative">
            <span className="block w-2 h-2 rounded-full border border-accent/30 bg-accent/10 animate-[nodePulse_3s_ease-in-out_infinite]" style={{ animationDelay: `${n.delay + 1}s` }} />
            <span className="absolute inset-0 w-2 h-2 rounded-full bg-accent/5 animate-[nodeRing_3s_ease-out_infinite]" style={{ animationDelay: `${n.delay + 1}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main export ──────────────────────────────────── */
export function AnimatedBlueprintHero({ className }: { className?: string }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (reducedMotion) {
    return (
      <div className={cn("absolute inset-0 bg-primary", className)} aria-hidden="true">
        <BlueprintGrid />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0", className)} aria-hidden="true">
      <BlueprintGrid />
      <StructuralWireframe />
      <DimensionAnnotations />
      <ScanLine />
      <MeasurementNodes />
    </div>
  );
}
