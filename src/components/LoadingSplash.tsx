import { useEffect, useState, useRef } from "react";
import logoPeMark from "@/assets/logo-pe-mark.png";

interface LoadingSplashProps {
  minDuration?: number;
  onComplete?: () => void;
  onLogoSettled?: () => void;
}

/** Preload the raster logo so it's ready for the resolve phase */
function usePreloadedImage(src: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
    img.src = src;
    if (img.complete) setLoaded(true);
  }, [src]);
  return loaded;
}

/**
 * Inline SVG "PE" monogram rendered as blueprint linework.
 * Always visible — never relies on an external image load.
 */
function PEMonogramSVG({
  phase,
  className,
}: {
  phase: string;
  className?: string;
}) {
  const isRevealed = phase !== "enter";
  const isResolved = phase === "resolve" || phase === "drift" || phase === "exit";

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={{
        opacity: isRevealed ? 1 : 0,
        transition: "opacity 1s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Outer circle — drafting reference */}
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.6"
        style={{
          strokeDasharray: 340,
          strokeDashoffset: isRevealed ? 0 : 340,
          opacity: isResolved ? 0.15 : 0.25,
          transition: "stroke-dashoffset 2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease-out",
        }}
      />
      {/* Inner circle — tighter reference line */}
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.4"
        style={{
          strokeDasharray: 290,
          strokeDashoffset: isRevealed ? 0 : 290,
          opacity: isResolved ? 0.08 : 0.12,
          transition: "stroke-dashoffset 2.2s cubic-bezier(0.22, 1, 0.36, 1) 0.2s, opacity 0.8s ease-out",
        }}
      />
      {/* "P" letterform — serif-inspired */}
      <path
        d="M38 85 V35 H55 C62 35 68 38 68 46 C68 54 62 57 55 57 H38"
        fill="none"
        stroke={isResolved ? "hsl(var(--foreground))" : "hsl(var(--accent))"}
        strokeWidth={isResolved ? "2.2" : "1.2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 180,
          strokeDashoffset: isRevealed ? 0 : 180,
          opacity: isResolved ? 0.9 : 0.5,
          transition:
            "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s, stroke 0.6s ease-out, stroke-width 0.6s ease-out, opacity 0.6s ease-out",
        }}
      />
      {/* "E" letterform */}
      <path
        d="M74 85 H56 V35 H74 M56 60 H70"
        fill="none"
        stroke={isResolved ? "hsl(var(--foreground))" : "hsl(var(--accent))"}
        strokeWidth={isResolved ? "2.2" : "1.2"}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 200,
          strokeDashoffset: isRevealed ? 0 : 200,
          opacity: isResolved ? 0.9 : 0.5,
          transition:
            "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s, stroke 0.6s ease-out, stroke-width 0.6s ease-out, opacity 0.6s ease-out",
        }}
      />
      {/* Small crosshair marks — drafting detail */}
      {[
        { x: 60, y: 12 },
        { x: 60, y: 108 },
        { x: 12, y: 60 },
        { x: 108, y: 60 },
      ].map((pt, i) => (
        <g key={i} style={{
          opacity: isResolved ? 0 : isRevealed ? 0.2 : 0,
          transition: `opacity 0.8s ease-out ${0.8 + i * 0.1}s`,
        }}>
          <line x1={pt.x - 3} y1={pt.y} x2={pt.x + 3} y2={pt.y} stroke="hsl(var(--accent))" strokeWidth="0.5" />
          <line x1={pt.x} y1={pt.y - 3} x2={pt.x} y2={pt.y + 3} stroke="hsl(var(--accent))" strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Cinematic intro: blueprint grid → structure traces → PE monogram draws →
 * identity resolves → drift to header → page settles.
 *
 * Phases: enter → grid → structure → resolve → drift → exit → done
 */
export function LoadingSplash({
  minDuration = 4400,
  onComplete,
  onLogoSettled,
}: LoadingSplashProps) {
  type Phase = "enter" | "grid" | "structure" | "resolve" | "drift" | "exit" | "done";
  const [phase, setPhase] = useState<Phase>("enter");
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

    // Kick off SVG line-draw on grid paths
    requestAnimationFrame(() => {
      const svg = svgRef.current;
      if (svg) {
        const paths = svg.querySelectorAll<SVGPathElement>(".draw-line");
        paths.forEach((p, i) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
          p.style.animation = `splash-draw 2s ${i * 0.08}s cubic-bezier(0.22, 1, 0.36, 1) forwards`;
        });
      }
    });

    // Phase timeline
    const t1 = setTimeout(() => setPhase("grid"), 150);
    const t2 = setTimeout(() => setPhase("structure"), 800);
    const t3 = setTimeout(() => setPhase("resolve"), 2600);
    const t4 = setTimeout(() => {
      setPhase("drift");
      onLogoSettled?.();
    }, 3500);
    const t5 = setTimeout(() => setPhase("exit"), minDuration - 600);
    const t6 = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, minDuration);

    return () => {
      [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    };
  }, [minDuration, onComplete, onLogoSettled, prefersReduced]);

  if (phase === "done") return null;

  const isDrift = phase === "drift" || phase === "exit";
  const isStructure = phase === "structure" || phase === "resolve" || isDrift;
  const showRasterLogo = logoReady && isDrift;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      aria-hidden="true"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes splash-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ── Blueprint grid ────────────────────────── */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          opacity: isDrift ? 0 : 1,
          transition: "opacity 1.2s ease-out",
        }}
      >
        {/* Fine grid lines */}
        {[100, 200, 300, 400, 500, 600, 700].map((y) => (
          <path key={`h${y}`} className="draw-line" d={`M0 ${y} H1200`} stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.08" />
        ))}
        {[150, 300, 450, 600, 750, 900, 1050].map((x) => (
          <path key={`v${x}`} className="draw-line" d={`M${x} 0 V800`} stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.08" />
        ))}

        {/* Structure — barn/stable geometry */}
        <g style={{
          opacity: isStructure ? 1 : 0,
          transition: "opacity 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          {/* Roofline */}
          <path className="draw-line" d="M350 320 L600 180 L850 320" stroke="hsl(var(--accent))" strokeWidth="0.8" fill="none" opacity="0.18" />
          {/* Walls */}
          <path className="draw-line" d="M380 320 V530 H820 V320" stroke="hsl(var(--accent))" strokeWidth="0.7" fill="none" opacity="0.14" />
          {/* Door */}
          <path className="draw-line" d="M540 530 V400 H660 V530" stroke="hsl(var(--accent))" strokeWidth="0.6" fill="none" opacity="0.12" />
          {/* Roof ridge */}
          <path className="draw-line" d="M600 180 V320" stroke="hsl(var(--accent))" strokeWidth="0.4" fill="none" opacity="0.08" />
          {/* Foundation line */}
          <path className="draw-line" d="M350 550 H850" stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.1" />
          {/* Dimension marks */}
          <path className="draw-line" d="M380 570 H820" stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.06" />
          <path className="draw-line" d="M380 565 V575" stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.06" />
          <path className="draw-line" d="M820 565 V575" stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.06" />
        </g>
      </svg>

      {/* ── Radial vignette ───────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 50% at 50% 48%, transparent 10%, hsl(222 20% 4% / 0.85) 100%)",
          opacity: isDrift ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
      />

      {/* ── PE Monogram — inline SVG, always visible ─ */}
      <div
        className="fixed z-10"
        style={{
          ...(isDrift
            ? {
                top: "18px",
                left: "clamp(16px, 4vw, 48px)",
                width: "36px",
                height: "36px",
                opacity: phase === "exit" ? 0 : 0.9,
              }
            : {
                top: "50%",
                left: "50%",
                width: "clamp(80px, 12vw, 120px)",
                height: "clamp(80px, 12vw, 120px)",
                transform: "translate(-50%, -50%)",
                opacity: 1,
              }),
          transition: isDrift
            ? "top 1.1s cubic-bezier(0.22, 1, 0.36, 1), left 1.1s cubic-bezier(0.22, 1, 0.36, 1), width 1.1s cubic-bezier(0.22, 1, 0.36, 1), height 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease-out"
            : "opacity 0.8s ease-out",
        }}
      >
        {/* SVG monogram — visible throughout, never a blank box */}
        <PEMonogramSVG
          phase={phase}
          className="w-full h-full"
        />

        {/* Raster logo — only shown once preloaded, fades in over SVG */}
        {showRasterLogo && (
          <img
            src={logoPeMark}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              opacity: 0,
              filter: "brightness(0) invert(1) drop-shadow(0 0 20px rgba(255,255,255,0.06))",
              animation: "rasterFadeIn 0.8s 0.15s ease-out forwards",
            }}
          />
        )}
      </div>

      {/* ── Tagline — appears in structure phase, fades before resolve ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          opacity: phase === "structure" ? 1 : phase === "resolve" ? 0.4 : 0,
          transform: phase === "enter" || phase === "grid" ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.9s ease-out, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="text-center mt-32 sm:mt-36">
          <p className="text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-muted-foreground/25 font-mono">
            From blueprint to built form
          </p>
        </div>
      </div>

      {/* ── Subtle progress line ──────────────────── */}
      <div
        className="fixed bottom-[36%] left-1/2 -translate-x-1/2 w-12 h-px bg-foreground/8 overflow-hidden"
        style={{
          opacity: isDrift ? 0 : phase === "enter" ? 0 : 1,
          transition: "opacity 0.7s ease-out",
        }}
      >
        <div
          className="h-full bg-accent/40"
          style={{
            width:
              phase === "enter" || phase === "grid" ? "0%" :
              phase === "structure" ? "45%" :
              phase === "resolve" ? "80%" :
              "100%",
            transition: `width ${minDuration * 0.5}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />
      </div>
    </div>
  );
}
