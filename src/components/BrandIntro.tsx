import { useState, useEffect, useMemo } from "react";
import logoImage from "@/assets/logo-pe-mark.webp";

const SESSION_KEY = "pe-brand-intro-seen";

/**
 * Cinematic brand entrance — plays once per session, respects reduced motion.
 *
 * Timeline (total ≈ 2700ms, fades through black into hero):
 *   0      charcoal screen + bronze radial glow
 *   400    PE monogram fades in
 *   900    PENINSULA EQUINE fades in
 *   1400   hairline + Premium Equine Environments fades in
 *   1900   Built by Riders · Crafted for Performance fades in
 *   2400   text + overlay begin fading through black
 *   2700   removed from DOM (hero already mounted underneath)
 */
type Phase = "idle" | "mark" | "title" | "sub" | "tag" | "dissolve" | "done";

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

  // Pre-compute particle positions so they don't re-shuffle on re-render.
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 30 + Math.random() * 50,
        size: 1 + Math.random() * 1.8,
        delay: Math.random() * 1400,
        duration: 4500 + Math.random() * 3500,
        drift: -8 + Math.random() * 16,
        opacity: 0.18 + Math.random() * 0.3,
      })),
    [],
  );

  useEffect(() => {
    if (initialPhase === "done") {
      onComplete?.();
      return;
    }

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));

    at(0, () => setPhase("mark"));
    at(500, () => setPhase("title"));
    at(1000, () => setPhase("sub"));
    at(1500, () => setPhase("tag"));
    at(2400, () => setPhase("dissolve"));
    at(2700, () => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setPhase("done");
      onComplete?.();
    });

    return () => timers.forEach(clearTimeout);
  }, [initialPhase, onComplete]);

  if (phase === "done") return null;

  const visible = (after: Phase) => {
    const order: Phase[] = ["idle", "mark", "title", "sub", "tag", "dissolve"];
    return order.indexOf(phase) >= order.indexOf(after);
  };

  const easing = "cubic-bezier(0.45, 0, 0.15, 1)";

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{
        background: "#0a0907",
        opacity: phase === "dissolve" ? 0 : 1,
        transition: `opacity 700ms ${easing}`,
      }}
    >
      {/* Warm bronze radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(36 45% 35% / 0.28) 0%, hsl(36 30% 20% / 0.12) 35%, transparent 70%)",
          opacity: 1,
          transition: `opacity 1100ms ease-out`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.88) 100%)",
        }}
      />

      {/* Drifting dust particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "hsl(38 50% 78%)",
              opacity: 0,
              animation: `peDust ${p.duration}ms ease-in-out ${p.delay}ms infinite`,
              boxShadow: "0 0 4px hsl(38 60% 70% / 0.6)",
              ["--pe-dust-opacity" as never]: p.opacity,
              ["--pe-dust-drift" as never]: `${p.drift}px`,
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
        className="relative mb-10"
        style={{
          width: "clamp(44px, 4vw, 64px)",
          height: "auto",
          opacity: visible("mark") ? 0.92 : 0,
          transform: visible("mark") ? "translateY(0)" : "translateY(6px)",
          transition: `opacity 1100ms ${easing}, transform 1100ms ${easing}`,
          filter: "drop-shadow(0 0 18px hsl(38 50% 55% / 0.4))",
        }}
      />

      {/* Line 1 — Brand name */}
      <h1
        className="relative font-serif font-light tracking-[0.14em] text-center"
        style={{
          fontSize: "clamp(1.15rem, 0.55rem + 2.4vw, 1.95rem)",
          color: "hsl(36 22% 88%)",
          opacity: visible("title") ? 1 : 0,
          transform: visible("title") ? "translateY(0)" : "translateY(8px)",
          transition: `opacity 1000ms ${easing}, transform 1000ms ${easing}`,
          textShadow: "0 0 30px hsl(38 40% 30% / 0.5)",
        }}
      >
        PENINSULA EQUINE
      </h1>

      {/* Hairline */}
      <span
        className="relative my-5 block h-px bg-[hsl(38_40%_60%/0.35)]"
        style={{
          width: visible("sub") ? "44px" : "0px",
          transition: `width 1100ms ${easing}`,
        }}
      />

      {/* Line 2 */}
      <p
        className="relative font-mono uppercase text-center"
        style={{
          fontSize: "clamp(0.5rem, 0.32rem + 0.45vw, 0.68rem)",
          letterSpacing: "0.45em",
          color: "hsl(36 18% 70%)",
          opacity: visible("sub") ? 1 : 0,
          transform: visible("sub") ? "translateY(0)" : "translateY(6px)",
          transition: `opacity 900ms ${easing}, transform 900ms ${easing}`,
        }}
      >
        Premium Equine Environments
      </p>

      {/* Line 3 — tagline */}
      <p
        className="relative mt-6 font-mono uppercase text-center px-4"
        style={{
          fontSize: "clamp(0.45rem, 0.3rem + 0.35vw, 0.6rem)",
          letterSpacing: "0.4em",
          color: "hsl(38 35% 55% / 0.85)",
          opacity: visible("tag") ? 1 : 0,
          transform: visible("tag") ? "translateY(0)" : "translateY(6px)",
          transition: `opacity 900ms ${easing}, transform 900ms ${easing}`,
        }}
      >
        Built by Riders · Crafted for Performance
      </p>
    </div>
  );
}
