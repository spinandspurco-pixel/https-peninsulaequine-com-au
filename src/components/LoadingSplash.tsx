import { useEffect, useState, useRef } from "react";
import logoPeMark from "@/assets/logo-pe-mark.png";

interface LoadingSplashProps {
  minDuration?: number;
  onComplete?: () => void;
  /** Called when the logo begins its journey to the header position */
  onLogoSettled?: () => void;
}

/** Preload the logo image so it's ready before the stamp phase */
function usePreloadedImage(src: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true); // proceed anyway
    img.src = src;
    if (img.complete) setLoaded(true);
  }, [src]);
  return loaded;
}

/**
 * Cinematic intro splash — SVG blueprint line-draw → logo stamp reveal →
 * logo drifts to header position → page settles.
 *
 * Phases: enter → build → stamp → drift → exit → done
 */
export function LoadingSplash({
  minDuration = 4200,
  onComplete,
  onLogoSettled,
}: LoadingSplashProps) {
  const [phase, setPhase] = useState<
    "enter" | "build" | "stamp" | "drift" | "exit" | "done"
  >("enter");
  const svgRef = useRef<SVGSVGElement>(null);

  const logoReady = usePreloadedImage(logoPeMark);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) {
      setPhase("done");
      onLogoSettled?.();
      onComplete?.();
      return;
    }

    // Kick off SVG line-draw
    requestAnimationFrame(() => {
      const svg = svgRef.current;
      if (svg) {
        const paths = svg.querySelectorAll<SVGPathElement>(".draw-line");
        paths.forEach((p, i) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
          p.style.animation = `splash-draw 1.6s ${i * 0.12}s cubic-bezier(0.22, 1, 0.36, 1) forwards`;
        });
      }
    });

    // Phase timeline (ms from start)
    const t1 = setTimeout(() => setPhase("build"), 200);     // grid + structure drawing
    const t2 = setTimeout(() => setPhase("stamp"), 2400);    // logo appears as stamp
    const t3 = setTimeout(() => {
      setPhase("drift");                                      // logo drifts to header
      onLogoSettled?.();
    }, 3400);
    const t4 = setTimeout(() => setPhase("exit"), minDuration - 500);
    const t5 = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, minDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [minDuration, onComplete, onLogoSettled, prefersReduced]);

  if (phase === "done") return null;

  const isStampOrLater = phase === "stamp" || phase === "drift" || phase === "exit";
  const isDrift = phase === "drift" || phase === "exit";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      aria-hidden="true"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
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
        style={{
          opacity: isDrift ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
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
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, hsl(222 20% 4% / 0.75) 100%)",
          opacity: isDrift ? 0 : 1,
          transition: "opacity 0.8s ease-out",
        }}
      />

      {/* Center tagline — fades before drift */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: phase === "build" ? 1 : phase === "stamp" ? 0.6 : 0,
          transform: phase === "enter" ? "translateY(6px)" : "translateY(0)",
          transition: "opacity 0.8s ease-out 0.4s, transform 0.7s ease-out 0.4s",
        }}
      >
        <div className="text-center">
          <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-foreground/80">
            Peninsula<span className="text-accent"> Equine</span>
          </p>
          <p className="mt-2 text-[10px] sm:text-xs tracking-[0.3em] uppercase text-muted-foreground/40">
            From Dirt to Dynasty
          </p>
        </div>
      </div>

      {/* Logo — stamp reveal, then drifts to top-left header position */}
      <div
        className="fixed z-10"
        style={{
          // Center position → header position transition
          ...(isDrift
            ? {
                top: "18px",
                left: "clamp(16px, 4vw, 48px)",
                transform: "scale(0.72)",
                opacity: phase === "exit" ? 0 : 0.9,
              }
            : {
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${isStampOrLater ? 1 : 0.88})`,
                opacity: isStampOrLater ? 1 : 0,
              }),
          transition: isDrift
            ? "top 1s cubic-bezier(0.22, 1, 0.36, 1), left 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease-out"
            : "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <img
          src={logoPeMark}
          alt="Peninsula Equine"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain brightness-0 invert drop-shadow-[0_0_40px_rgba(255,255,255,0.12)]"
        />
        {/* Accent bar — stamp accent */}
        <span
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-accent"
          style={{
            height: isStampOrLater ? "60%" : "0%",
            opacity: isDrift ? 0 : 1,
            transition: "height 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, opacity 0.5s ease-out",
          }}
        />
      </div>

      {/* Progress bar */}
      <div
        className="fixed bottom-[38%] left-1/2 -translate-x-1/2 w-14 h-[1.5px] bg-foreground/10 rounded-full overflow-hidden"
        style={{
          opacity: isDrift ? 0 : phase === "enter" ? 0 : 1,
          transition: "opacity 0.6s ease-out",
        }}
      >
        <div
          className="h-full bg-accent rounded-full"
          style={{
            width:
              phase === "enter" ? "0%" :
              phase === "build" ? "55%" :
              phase === "stamp" ? "85%" :
              "100%",
            transition: `width ${minDuration * 0.55}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />
      </div>
    </div>
  );
}
