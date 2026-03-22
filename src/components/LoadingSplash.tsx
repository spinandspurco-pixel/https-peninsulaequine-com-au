import { useEffect, useState, useRef, useCallback } from "react";
import logoPeMark from "@/assets/logo-pe-mark.webp";
import imgReveal from "@/assets/mainridge-aerial-hero.jpg";

interface LoadingSplashProps {
  minDuration?: number;
  onComplete?: () => void;
  onLogoSettled?: () => void;
}

/** Preload images so they're ready for their phase */
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

/* ── Inline SVG "PE" monogram ───────────────────────── */
function PEMonogramSVG({ phase, className }: { phase: string; className?: string }) {
  const isRevealed = phase !== "enter";
  const isResolved = phase === "resolve" || phase === "drift" || phase === "image" || phase === "hold" || phase === "exit";

  return (
    <svg viewBox="0 0 120 120" className={className} style={{ opacity: isRevealed ? 1 : 0, transition: "opacity 1s cubic-bezier(0.22, 1, 0.36, 1)" }}>
      <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6"
        style={{ strokeDasharray: 340, strokeDashoffset: isRevealed ? 0 : 340, opacity: isResolved ? 0.15 : 0.25, transition: "stroke-dashoffset 2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease-out" }} />
      <circle cx="60" cy="60" r="46" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4"
        style={{ strokeDasharray: 290, strokeDashoffset: isRevealed ? 0 : 290, opacity: isResolved ? 0.08 : 0.12, transition: "stroke-dashoffset 2.2s cubic-bezier(0.22, 1, 0.36, 1) 0.2s, opacity 0.8s ease-out" }} />
      {/* "P" */}
      <path d="M38 85 V35 H55 C62 35 68 38 68 46 C68 54 62 57 55 57 H38" fill="none"
        stroke={isResolved ? "hsl(var(--foreground))" : "hsl(var(--accent))"}
        strokeWidth={isResolved ? "2.2" : "1.2"} strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 180, strokeDashoffset: isRevealed ? 0 : 180, opacity: isResolved ? 0.9 : 0.5, transition: "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s, stroke 0.6s ease-out, stroke-width 0.6s ease-out, opacity 0.6s ease-out" }} />
      {/* "E" */}
      <path d="M74 85 H56 V35 H74 M56 60 H70" fill="none"
        stroke={isResolved ? "hsl(var(--foreground))" : "hsl(var(--accent))"}
        strokeWidth={isResolved ? "2.2" : "1.2"} strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 200, strokeDashoffset: isRevealed ? 0 : 200, opacity: isResolved ? 0.9 : 0.5, transition: "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s, stroke 0.6s ease-out, stroke-width 0.6s ease-out, opacity 0.6s ease-out" }} />
      {/* Crosshair marks */}
      {[{ x: 60, y: 12 }, { x: 60, y: 108 }, { x: 12, y: 60 }, { x: 108, y: 60 }].map((pt, i) => (
        <g key={i} style={{ opacity: isResolved ? 0 : isRevealed ? 0.2 : 0, transition: `opacity 0.8s ease-out ${0.8 + i * 0.1}s` }}>
          <line x1={pt.x - 3} y1={pt.y} x2={pt.x + 3} y2={pt.y} stroke="hsl(var(--accent))" strokeWidth="0.5" />
          <line x1={pt.x} y1={pt.y - 3} x2={pt.x} y2={pt.y + 3} stroke="hsl(var(--accent))" strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

/**
 * "From Blueprint to Built" cinematic intro.
 *
 * Phases: enter → grid → structure → resolve → drift → image → hold → exit → done
 *
 * - enter/grid/structure: blueprint linework draws in
 * - resolve: PE monogram solidifies
 * - drift: logo moves to header position
 * - image: architectural photo crossfades in beneath fading blueprint
 * - hold: resolved image, no motion
 * - exit: dissolve to main site
 */
export function LoadingSplash({ minDuration = 5200, onComplete, onLogoSettled }: LoadingSplashProps) {
  type Phase = "enter" | "grid" | "structure" | "resolve" | "drift" | "image" | "hold" | "exit" | "done";
  const [phase, setPhase] = useState<Phase>("enter");
  const svgRef = useRef<SVGSVGElement>(null);
  const logoReady = usePreloadedImage(logoPeMark);
  const imageReady = usePreloadedImage(imgReveal);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Skip on click/tap ─────────────────────────────── */
  const skipToEnd = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("exit");
    onLogoSettled?.();
    setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, 600);
  }, [onComplete, onLogoSettled]);

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
          p.style.animation = `splash-draw 2s ${i * 0.08}s cubic-bezier(0.22, 1, 0.36, 1) forwards`;
        });
      }
    });

    // Phase timeline
    const t = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timersRef.current.push(id); return id; };

    t(() => setPhase("grid"), 100);           // 0.1s — dark field ends
    t(() => setPhase("structure"), 500);       // 0.5s — blueprint emerges
    t(() => setPhase("resolve"), 1700);        // 1.7s — logo solidifies
    t(() => {
      setPhase("drift");
      onLogoSettled?.();
    }, 2500);                                   // 2.5s — logo drifts to header
    t(() => setPhase("image"), 3200);          // 3.2s — architectural image crossfade
    t(() => setPhase("hold"), 4200);           // 4.2s — resolved, no motion
    t(() => setPhase("exit"), minDuration - 600);
    t(() => {
      setPhase("done");
      onComplete?.();
    }, minDuration);

    return () => { timersRef.current.forEach(clearTimeout); };
  }, [minDuration, onComplete, onLogoSettled, prefersReduced]);

  if (phase === "done") return null;

  const isDrift = phase === "drift" || phase === "image" || phase === "hold" || phase === "exit";
  const isStructure = phase === "structure" || phase === "resolve" || isDrift;
  const showRasterLogo = logoReady && isDrift;
  const showImage = phase === "image" || phase === "hold" || phase === "exit";
  const blueprintFading = phase === "image" || phase === "hold" || phase === "exit";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background cursor-pointer"
      aria-hidden="true"
      onClick={skipToEnd}
      role="button"
      tabIndex={-1}
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes splash-draw { to { stroke-dashoffset: 0; } }
        @keyframes rasterFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes imgRevealIn { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* ── Grain texture ────────────────────────────── */}
      <div className="absolute inset-0 grain-texture pointer-events-none" style={{ opacity: 0.04 }} />

      {/* ── Architectural image crossfade ─────────────── */}
      {imageReady && (
        <div
          className="absolute inset-0"
          style={{
            opacity: showImage ? 1 : 0,
            transition: "opacity 1.4s cubic-bezier(0.45, 0, 0.15, 1)",
          }}
        >
          <img
            src={imgReveal}
            alt=""
            className="w-full h-full object-cover"
            style={{
              filter: "brightness(0.3) saturate(0.82) contrast(1.06) sepia(0.04)",
              transform: showImage ? "scale(1)" : "scale(1.04)",
              transition: "transform 2s cubic-bezier(0.45, 0, 0.15, 1)",
            }}
          />
        </div>
      )}

      {/* ── Blueprint grid ───────────────────────────── */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          opacity: blueprintFading ? 0 : isDrift ? 0.6 : 1,
          transition: "opacity 1.4s cubic-bezier(0.45, 0, 0.15, 1)",
        }}
      >
        {[100, 200, 300, 400, 500, 600, 700].map((y) => (
          <path key={`h${y}`} className="draw-line" d={`M0 ${y} H1200`} stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.08" />
        ))}
        {[150, 300, 450, 600, 750, 900, 1050].map((x) => (
          <path key={`v${x}`} className="draw-line" d={`M${x} 0 V800`} stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.08" />
        ))}
        <g style={{ opacity: isStructure ? 1 : 0, transition: "opacity 1s cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <path className="draw-line" d="M350 320 L600 180 L850 320" stroke="hsl(var(--accent))" strokeWidth="0.8" fill="none" opacity="0.18" />
          <path className="draw-line" d="M380 320 V530 H820 V320" stroke="hsl(var(--accent))" strokeWidth="0.7" fill="none" opacity="0.14" />
          <path className="draw-line" d="M540 530 V400 H660 V530" stroke="hsl(var(--accent))" strokeWidth="0.6" fill="none" opacity="0.12" />
          <path className="draw-line" d="M600 180 V320" stroke="hsl(var(--accent))" strokeWidth="0.4" fill="none" opacity="0.08" />
          <path className="draw-line" d="M350 550 H850" stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.1" />
          <path className="draw-line" d="M380 570 H820" stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.06" />
          <path className="draw-line" d="M380 565 V575" stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.06" />
          <path className="draw-line" d="M820 565 V575" stroke="hsl(var(--accent))" strokeWidth="0.3" fill="none" opacity="0.06" />
        </g>
      </svg>

      {/* ── Radial vignette ──────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 50% at 50% 48%, transparent 10%, hsl(222 20% 4% / 0.85) 100%)",
          opacity: blueprintFading ? 0.4 : isDrift ? 0.6 : 1,
          transition: "opacity 1.2s ease-out",
        }}
      />

      {/* ── PE Monogram ──────────────────────────────── */}
      <div
        className="fixed z-10"
        style={{
          ...(isDrift
            ? { top: "18px", left: "clamp(16px, 4vw, 48px)", width: "36px", height: "36px", opacity: phase === "exit" ? 0 : 0.9 }
            : { top: "50%", left: "50%", width: "clamp(80px, 12vw, 120px)", height: "clamp(80px, 12vw, 120px)", transform: "translate(-50%, -50%)", opacity: 1 }),
          transition: isDrift
            ? "top 1.1s cubic-bezier(0.22, 1, 0.36, 1), left 1.1s cubic-bezier(0.22, 1, 0.36, 1), width 1.1s cubic-bezier(0.22, 1, 0.36, 1), height 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease-out"
            : "opacity 0.8s ease-out",
        }}
      >
        <PEMonogramSVG phase={phase} className="w-full h-full" />
        {showRasterLogo && (
          <img src={logoPeMark} alt="" className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: 0, filter: "brightness(0) invert(1) drop-shadow(0 0 20px rgba(255,255,255,0.06))", animation: "rasterFadeIn 0.8s 0.15s ease-out forwards" }} />
        )}
      </div>

      {/* ── Tagline ──────────────────────────────────── */}
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
            From Blueprint to Built Form
          </p>
        </div>
      </div>

      {/* ── Progress line ────────────────────────────── */}
      <div
        className="fixed bottom-[36%] left-1/2 -translate-x-1/2 w-12 h-px bg-foreground/8 overflow-hidden"
        style={{ opacity: isDrift ? 0 : phase === "enter" ? 0 : 1, transition: "opacity 0.7s ease-out" }}
      >
        <div className="h-full bg-accent/40"
          style={{
            width: phase === "enter" || phase === "grid" ? "0%" : phase === "structure" ? "35%" : phase === "resolve" ? "65%" : "100%",
            transition: `width ${minDuration * 0.4}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />
      </div>

      {/* ── Skip hint ────────────────────────────────── */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          opacity: phase === "structure" || phase === "resolve" ? 0.15 : 0,
          transition: "opacity 1s ease-out",
        }}
      >
        <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-mono">
          Click to skip
        </p>
      </div>
    </div>
  );
}
