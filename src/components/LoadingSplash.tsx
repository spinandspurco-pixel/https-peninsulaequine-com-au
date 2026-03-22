import { useEffect, useState, useRef, useCallback } from "react";
import logoPeMark from "@/assets/logo-pe-mark.webp";
import imgReveal from "@/assets/mainridge-aerial-hero.jpg";

interface LoadingSplashProps {
  minDuration?: number;
  onComplete?: () => void;
  onLogoSettled?: () => void;
}

/** Preload an image, resolving immediately if cached */
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

/* ── Constants ──────────────────────────────────────── */
const EASE_ARCH = "cubic-bezier(0.45, 0, 0.15, 1)";
const BG_DARK = "#0B0D10";

/* ── PE Monogram — minimal, muted gold ──────────────── */
function PEMonogramSVG({ visible, className }: { visible: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className}
      style={{ opacity: visible ? 1 : 0, transition: `opacity 800ms ${EASE_ARCH}` }}>
      {/* Outer reference circle */}
      <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"
        style={{ opacity: 0.12 }} />
      {/* "P" */}
      <path d="M38 85 V35 H55 C62 35 68 38 68 46 C68 54 62 57 55 57 H38"
        fill="none" stroke="hsl(var(--accent))" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }} />
      {/* "E" */}
      <path d="M74 85 H56 V35 H74 M56 60 H70"
        fill="none" stroke="hsl(var(--accent))" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }} />
    </svg>
  );
}

/**
 * "From Blueprint to Built Form" — controlled moment of arrival.
 *
 * Phases: dark → blueprint → logo → tagline → transition → hold → exit → done
 */
export function LoadingSplash({
  minDuration = 6400,
  onComplete,
  onLogoSettled,
}: LoadingSplashProps) {
  type Phase = "dark" | "blueprint" | "logo" | "tagline" | "transition" | "hold" | "exit" | "done";
  const [phase, setPhase] = useState<Phase>("dark");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const imageReady = usePreloadedImage(imgReveal);
  usePreloadedImage(logoPeMark);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Skip on click/tap ─────────────────────────────── */
  const skipToEnd = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    onLogoSettled?.();
    setPhase("exit");
    const id = setTimeout(() => { setPhase("done"); onComplete?.(); }, 800);
    timersRef.current.push(id);
  }, [onComplete, onLogoSettled]);

  useEffect(() => {
    if (prefersReduced) {
      setPhase("done");
      onLogoSettled?.();
      onComplete?.();
      return;
    }

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    //  dark:       0 –  700ms   (pause)
    //  blueprint:  700 – 1900ms (linework fades in)
    //  logo:       1900 – 2800ms (PE mark fades in)
    //  tagline:    2800 – 3500ms (text fades in)
    //  transition: 3500 – 4900ms (drawing → real image)
    //  hold:       4900 – 6400ms (resolved, no motion)
    //  exit:       6400+         (dissolve to site)

    t(() => setPhase("blueprint"), 700);
    t(() => setPhase("logo"), 1900);
    t(() => setPhase("tagline"), 2800);
    t(() => {
      setPhase("transition");
      onLogoSettled?.();
    }, 3500);
    t(() => setPhase("hold"), 4900);
    t(() => setPhase("exit"), minDuration - 800);
    t(() => {
      setPhase("done");
      onComplete?.();
    }, minDuration);

    return () => { timersRef.current.forEach(clearTimeout); };
  }, [minDuration, onComplete, onLogoSettled, prefersReduced]);

  if (phase === "done") return null;

  /* ── Derived state ─────────────────────────────────── */
  const phaseIndex = ["dark", "blueprint", "logo", "tagline", "transition", "hold", "exit"].indexOf(phase);
  const blueprintVisible = phaseIndex >= 1; // blueprint+
  const logoVisible = phaseIndex >= 2;      // logo+
  const taglineVisible = phaseIndex >= 3 && phaseIndex <= 4; // tagline + transition only
  const imageVisible = phaseIndex >= 4 && imageReady; // transition+
  const blueprintFading = phaseIndex >= 4;  // transition+
  const isExit = phase === "exit";
  const isHoldOrAfter = phaseIndex >= 5;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-hidden="true"
      onClick={skipToEnd}
      style={{
        backgroundColor: BG_DARK,
        opacity: isExit ? 0 : 1,
        transition: `opacity 900ms ${EASE_ARCH}`,
        pointerEvents: isExit ? "none" : "auto",
        cursor: "default",
      }}
    >
      {/* ── Grain ────────────────────────────────────── */}
      <div className="absolute inset-0 grain-texture pointer-events-none" style={{ opacity: 0.03 }} />

      {/* ── Architectural image (fades in during transition) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: imageVisible ? 1 : 0,
          transition: `opacity 1400ms ${EASE_ARCH}`,
        }}
      >
        <img
          src={imgReveal}
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: "brightness(0.25) saturate(0.82) contrast(1.06) sepia(0.04)",
            transform: imageVisible ? "scale(1)" : "scale(1.025)",
            transition: `transform 2s ${EASE_ARCH}`,
          }}
        />
      </div>

      {/* ── Blueprint grid — barely perceptible ──────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          opacity: blueprintFading ? 0 : blueprintVisible ? 1 : 0,
          transition: `opacity ${blueprintFading ? 1400 : 1100}ms ${EASE_ARCH}`,
        }}
      >
        {/* Fine grid — 4% opacity */}
        {[100, 200, 300, 400, 500, 600, 700].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="1200" y2={y}
            stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
        ))}
        {[150, 300, 450, 600, 750, 900, 1050].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="800"
            stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.04" />
        ))}

        {/* Partial structure — cropped, not full drawing */}
        <g style={{
          opacity: blueprintVisible ? 1 : 0,
          transition: `opacity 1000ms ${EASE_ARCH} 200ms`,
        }}>
          {/* Roofline fragment */}
          <line x1="420" y1="310" x2="600" y2="210" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.12" />
          <line x1="600" y1="210" x2="780" y2="310" stroke="hsl(var(--accent))" strokeWidth="0.6" opacity="0.12" />
          {/* Wall lines */}
          <line x1="440" y1="310" x2="440" y2="500" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.09" />
          <line x1="760" y1="310" x2="760" y2="500" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.09" />
          {/* Foundation */}
          <line x1="420" y1="500" x2="780" y2="500" stroke="hsl(var(--accent))" strokeWidth="0.4" opacity="0.07" />
          {/* Internal division */}
          <line x1="600" y1="310" x2="600" y2="500" stroke="hsl(var(--accent))" strokeWidth="0.3" opacity="0.05" />
          {/* Dimension line */}
          <line x1="440" y1="530" x2="760" y2="530" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.04" />
          <line x1="440" y1="525" x2="440" y2="535" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.04" />
          <line x1="760" y1="525" x2="760" y2="535" stroke="hsl(var(--accent))" strokeWidth="0.25" opacity="0.04" />
        </g>
      </svg>

      {/* ── Vignette ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 48%, transparent 10%, ${BG_DARK} 100%)`,
          opacity: blueprintFading ? 0.5 : 1,
          transition: `opacity 1200ms ${EASE_ARCH}`,
        }}
      />

      {/* ── PE Monogram — centered, fade only ────────── */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: isExit ? 0 : logoVisible ? 1 : 0,
          transition: `opacity ${isExit ? 600 : 800}ms ${EASE_ARCH}`,
        }}
      >
        <div style={{ width: "clamp(72px, 10vw, 100px)", height: "clamp(72px, 10vw, 100px)" }}>
          <PEMonogramSVG visible={logoVisible} className="w-full h-full" />
        </div>

        {/* ── Tagline ────────────────────────────────── */}
        <div
          style={{
            marginTop: "24px",
            opacity: taglineVisible ? 1 : 0,
            transition: `opacity 600ms ${EASE_ARCH}`,
          }}
        >
          <p
            className="text-center font-mono uppercase text-muted-foreground"
            style={{
              fontSize: "10px",
              letterSpacing: "0.38em",
              opacity: 0.3,
            }}
          >
            From Blueprint to Built Form
          </p>
        </div>
      </div>
    </div>
  );
}
