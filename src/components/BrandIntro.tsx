import { useState, useEffect, useMemo, useCallback } from "react";
import logoImage from "@/assets/logo-pe-mark.webp";

const SESSION_KEY = "pe-brand-intro-seen";

/**
 * Cinematic brand entrance — opening title sequence for Peninsula Equine.
 *
 * Direction: charcoal/black plate, blueprint lines drafting in, gold dust drift,
 * warm amber light moving across, ground dust at the base, then a clean
 * dissolve into the homepage hero. Plays once per session. Respects
 * prefers-reduced-motion. "Skip" affordance available throughout.
 *
 * Timeline (total ≈ 3100ms):
 *   0     charcoal plate, blueprint lines begin drafting
 *   300   amber sweep begins traveling
 *   500   PE monogram resolves
 *   1100  PENINSULA EQUINE fades in
 *   1700  hairline draws, "From Dirt to Dynasty" fades in
 *   2600  full dissolve begins
 *   3100  removed from DOM
 */
type Phase = "idle" | "mark" | "title" | "tag" | "dissolve" | "done";

const EASE = "cubic-bezier(0.45, 0, 0.15, 1)";

export function BrandIntro({ onComplete }: { onComplete?: () => void }) {
  const initialPhase: Phase = useMemo(() => {
    if (typeof window === "undefined") return "done";
    if (sessionStorage.getItem(SESSION_KEY)) return "done";
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return "done";
    }
    return "idle";
  }, []);

  const [phase, setPhase] = useState<Phase>(initialPhase);

  // Pre-compute gold dust positions so they don't reshuffle on re-render.
  const dust = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 25 + Math.random() * 55,
        size: 0.8 + Math.random() * 1.6,
        delay: Math.random() * 1600,
        duration: 4800 + Math.random() * 3200,
        drift: -10 + Math.random() * 20,
        opacity: 0.18 + Math.random() * 0.28,
      })),
    [],
  );

  // Ground dust band — heavier, lower, slower
  const ground = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1.4 + Math.random() * 2.2,
        delay: Math.random() * 1800,
        duration: 5200 + Math.random() * 2800,
        drift: -16 + Math.random() * 32,
        opacity: 0.18 + Math.random() * 0.22,
      })),
    [],
  );

  const finish = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("done");
    onComplete?.();
  }, [onComplete]);

  const skip = useCallback(() => {
    setPhase("dissolve");
    window.setTimeout(finish, 450);
  }, [finish]);

  useEffect(() => {
    if (initialPhase === "done") {
      onComplete?.();
      return;
    }
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));

    at(500, () => setPhase("mark"));
    at(1100, () => setPhase("title"));
    at(1700, () => setPhase("tag"));
    at(2600, () => setPhase("dissolve"));
    at(3100, finish);

    return () => timers.forEach(clearTimeout);
  }, [initialPhase, onComplete, finish]);

  if (phase === "done") return null;

  const visible = (after: Phase) => {
    const order: Phase[] = ["idle", "mark", "title", "tag", "dissolve"];
    return order.indexOf(phase) >= order.indexOf(after);
  };

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        background: "#08070a",
        opacity: phase === "dissolve" ? 0 : 1,
        transition: `opacity 700ms ${EASE}`,
      }}
    >
      {/* Local keyframes scoped to the intro */}
      <style>{`
        @keyframes peDraft { to { stroke-dashoffset: 0; } }
        @keyframes peAmberSweep {
          0%   { transform: translateX(-40%); opacity: 0; }
          18%  { opacity: 0.85; }
          82%  { opacity: 0.85; }
          100% { transform: translateX(40%); opacity: 0; }
        }
        @keyframes peGroundDrift {
          0%   { transform: translate3d(0,0,0); opacity: 0; }
          25%  { opacity: var(--pe-ground-opacity, 0.3); }
          75%  { opacity: var(--pe-ground-opacity, 0.3); }
          100% { transform: translate3d(var(--pe-ground-drift, 0), -8vh, 0); opacity: 0; }
        }
      `}</style>

      {/* Warm amber radial — base mood */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 52%, hsl(36 48% 32% / 0.32) 0%, hsl(36 30% 18% / 0.14) 38%, transparent 72%)",
        }}
      />

      {/* Slow amber light sweep traveling left → right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, transparent 30%, hsl(36 55% 50% / 0.10) 48%, hsl(38 70% 62% / 0.14) 50%, hsl(36 55% 50% / 0.10) 52%, transparent 70%)",
          mixBlendMode: "screen",
          animation: "peAmberSweep 3000ms cubic-bezier(0.45, 0, 0.15, 1) 200ms forwards",
        }}
      />

      {/* Blueprint draft lines — full-bleed, drafting in */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="peLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(38 50% 60%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(38 55% 65%)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(38 50% 60%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Horizontal rules */}
        {[160, 400, 640].map((y, i) => (
          <line
            key={`h${y}`}
            x1="0"
            y1={y}
            x2="1200"
            y2={y}
            stroke="url(#peLine)"
            strokeWidth="1"
            style={{
              strokeDasharray: 1400,
              strokeDashoffset: 1400,
              animation: `peDraft 1800ms cubic-bezier(0.45, 0, 0.15, 1) ${100 + i * 180}ms forwards`,
            }}
          />
        ))}
        {/* Vertical threads */}
        {[260, 600, 940].map((x, i) => (
          <line
            key={`v${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="800"
            stroke="hsl(38 45% 55%)"
            strokeOpacity="0.22"
            strokeWidth="1"
            style={{
              strokeDasharray: 900,
              strokeDashoffset: 900,
              animation: `peDraft 1600ms cubic-bezier(0.45, 0, 0.15, 1) ${250 + i * 160}ms forwards`,
            }}
          />
        ))}
        {/* Central plate frame — subtle */}
        <rect
          x="220"
          y="220"
          width="760"
          height="360"
          fill="none"
          stroke="hsl(38 45% 55%)"
          strokeOpacity="0.18"
          strokeWidth="1"
          style={{
            strokeDasharray: 2240,
            strokeDashoffset: 2240,
            animation: `peDraft 2200ms cubic-bezier(0.45, 0, 0.15, 1) 400ms forwards`,
          }}
        />
        {/* Corner tick marks */}
        {[
          [220, 220, 24, 0],
          [980, 220, -24, 0],
          [220, 580, 24, 0],
          [980, 580, -24, 0],
        ].map(([x, y, dx], i) => (
          <line
            key={`tick${i}`}
            x1={x as number}
            y1={y as number}
            x2={(x as number) + (dx as number)}
            y2={y as number}
            stroke="hsl(38 55% 62%)"
            strokeOpacity="0.5"
            strokeWidth="1"
            style={{
              strokeDasharray: 30,
              strokeDashoffset: 30,
              animation: `peDraft 700ms cubic-bezier(0.45, 0, 0.15, 1) ${1100 + i * 80}ms forwards`,
            }}
          />
        ))}
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 95% 90% at 50% 50%, transparent 42%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* Drifting gold dust */}
      <div className="absolute inset-0 pointer-events-none">
        {dust.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "hsl(38 60% 76%)",
              opacity: 0,
              animation: `peDust ${p.duration}ms ease-in-out ${p.delay}ms infinite`,
              boxShadow: "0 0 4px hsl(38 65% 70% / 0.55)",
              ["--pe-dust-opacity" as never]: p.opacity,
              ["--pe-dust-drift" as never]: `${p.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Ground dust band — arena footing reference */}
      <div className="absolute inset-x-0 bottom-0 h-[28vh] pointer-events-none overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-full"
          style={{
            background:
              "linear-gradient(0deg, hsl(36 40% 30% / 0.22) 0%, hsl(36 35% 25% / 0.08) 45%, transparent 100%)",
          }}
        />
        {ground.map((g) => (
          <span
            key={g.id}
            className="absolute rounded-full"
            style={{
              left: `${g.left}%`,
              bottom: `${4 + Math.random() * 14}%`,
              width: `${g.size}px`,
              height: `${g.size}px`,
              background: "hsl(36 45% 62%)",
              opacity: 0,
              filter: "blur(0.5px)",
              boxShadow: "0 0 5px hsl(36 55% 55% / 0.45)",
              animation: `peGroundDrift ${g.duration}ms ease-out ${g.delay}ms infinite`,
              ["--pe-ground-opacity" as never]: g.opacity,
              ["--pe-ground-drift" as never]: `${g.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Monogram */}
      <img
        src={logoImage}
        alt=""
        width={64}
        height={64}
        className="relative mb-9"
        style={{
          width: "clamp(40px, 3.6vw, 58px)",
          height: "auto",
          opacity: visible("mark") ? 0.94 : 0,
          transform: visible("mark") ? "translateY(0) scale(1)" : "translateY(6px) scale(0.985)",
          transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
          filter: "drop-shadow(0 0 22px hsl(38 55% 55% / 0.45))",
        }}
      />

      {/* Brand name */}
      <h1
        className="relative font-serif font-light text-center"
        style={{
          fontSize: "clamp(1.15rem, 0.5rem + 2.4vw, 1.95rem)",
          letterSpacing: "0.42em",
          paddingLeft: "0.42em",
          color: "hsl(36 24% 90%)",
          opacity: visible("title") ? 1 : 0,
          transform: visible("title") ? "translateY(0)" : "translateY(8px)",
          transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
          textShadow: "0 0 30px hsl(38 40% 30% / 0.55)",
        }}
      >
        PENINSULA EQUINE
      </h1>

      {/* Hairline */}
      <span
        className="relative mt-6 mb-5 block h-px"
        style={{
          width: visible("tag") ? "56px" : "0px",
          background: "hsl(38 55% 60% / 0.55)",
          transition: `width 1100ms ${EASE}`,
        }}
      />

      {/* Tagline */}
      <p
        className="relative font-mono uppercase text-center"
        style={{
          fontSize: "clamp(0.55rem, 0.36rem + 0.48vw, 0.72rem)",
          letterSpacing: "0.5em",
          paddingLeft: "0.5em",
          color: "hsl(38 50% 68% / 0.95)",
          opacity: visible("tag") ? 1 : 0,
          transform: visible("tag") ? "translateY(0)" : "translateY(6px)",
          transition: `opacity 1000ms ${EASE}, transform 1000ms ${EASE}`,
        }}
      >
        From Dirt to Dynasty
      </p>

      {/* Skip intro */}
      <button
        type="button"
        onClick={skip}
        className="absolute top-6 right-6 font-mono uppercase text-foreground/45 hover:text-foreground/85 transition-colors duration-500"
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.4em",
          opacity: phase === "dissolve" ? 0 : 1,
          transition: "opacity 500ms ease, color 500ms ease",
        }}
      >
        Skip
      </button>
    </div>
  );
}
