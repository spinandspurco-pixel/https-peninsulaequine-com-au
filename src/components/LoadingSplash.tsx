import { useEffect, useState, useRef } from "react";
import logoPeMark from "@/assets/logo-pe-mark.png";

interface LoadingSplashProps {
  minDuration?: number;
  onComplete?: () => void;
}

/**
 * Cinematic intro splash — SVG blueprint line-draw + logo reveal + accent bar.
 * Renders over everything at z-9999, then fades out.
 */
export function LoadingSplash({ minDuration = 2800, onComplete }: LoadingSplashProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");
  const svgRef = useRef<SVGSVGElement>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) {
      setPhase("done");
      onComplete?.();
      return;
    }

    requestAnimationFrame(() => {
      const svg = svgRef.current;
      if (svg) {
        const paths = svg.querySelectorAll<SVGPathElement>(".draw-line");
        paths.forEach((p, i) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
          p.style.animation = `splash-draw 1.2s ${i * 0.1}s cubic-bezier(0.22, 1, 0.36, 1) forwards`;
        });
      }
    });

    const t1 = setTimeout(() => setPhase("hold"), 180);
    const t2 = setTimeout(() => setPhase("exit"), minDuration - 700);
    const t3 = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, minDuration);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [minDuration, onComplete, prefersReduced]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      aria-hidden="true"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes splash-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Blueprint grid SVG */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {[100, 200, 300, 400, 500, 600, 700].map((y) => (
          <path key={`h${y}`} className="draw-line" d={`M0 ${y} H1200`} stroke="hsl(var(--accent))" strokeWidth="0.4" fill="none" opacity="0.12" />
        ))}
        {[150, 300, 450, 600, 750, 900, 1050].map((x) => (
          <path key={`v${x}`} className="draw-line" d={`M${x} 0 V800`} stroke="hsl(var(--accent))" strokeWidth="0.4" fill="none" opacity="0.12" />
        ))}
        <path className="draw-line" d="M350 550 L350 250 L600 120 L850 250 L850 550 Z" stroke="hsl(var(--accent))" strokeWidth="1" fill="none" opacity="0.2" />
        <path className="draw-line" d="M520 550 V380 H680 V550" stroke="hsl(var(--accent))" strokeWidth="0.8" fill="none" opacity="0.16" />
        <path className="draw-line" d="M350 400 H850" stroke="hsl(var(--accent))" strokeWidth="0.6" fill="none" opacity="0.1" />
        <path className="draw-line" d="M475 250 V550" stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.08" />
        <path className="draw-line" d="M725 250 V550" stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.08" />
        <path className="draw-line" d="M350 580 H850" stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.12" />
      </svg>

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 20%, hsl(222 20% 4% / 0.75) 100%)" }}
      />

      {/* Center content */}
      <div
        className="relative z-10 flex flex-col items-center gap-5"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.94)" : "scale(1)",
          transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s",
        }}
      >
        <div className="relative">
          <img
            src={logoPeMark}
            alt="Peninsula Equine"
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain brightness-0 invert drop-shadow-[0_0_40px_rgba(255,255,255,0.12)]"
          />
          <span
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-accent"
            style={{
              height: phase === "enter" ? 0 : "70%",
              transition: "height 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.4s",
            }}
          />
        </div>

        <div
          style={{
            opacity: phase === "enter" ? 0 : 1,
            transform: phase === "enter" ? "translateY(6px)" : "translateY(0)",
            transition: "opacity 0.6s ease-out 0.5s, transform 0.6s ease-out 0.5s",
          }}
        >
          <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-foreground">
            Peninsula<span className="text-accent"> Equine</span>
          </p>
          <p className="mt-2 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-muted-foreground/40">
            From Dirt to Dynasty
          </p>
        </div>

        <div className="w-16 h-[1.5px] bg-foreground/10 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-accent rounded-full"
            style={{
              width: phase === "enter" ? "0%" : phase === "hold" ? "85%" : "100%",
              transition: `width ${minDuration * 0.65}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
