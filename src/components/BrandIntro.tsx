import { useState, useEffect, useMemo } from "react";
import logoImage from "@/assets/logo-pe-mark.webp";

const SESSION_KEY = "pe-brand-intro-seen";

/**
 * Cinematic brand entrance — plays once per session, respects reduced motion.
 *
 * Sequence (total ≈ 2700ms):
 *   0      black + monogram glow fades up
 *   400    PENINSULA EQUINE
 *   1000   PREMIUM EQUINE ENVIRONMENTS
 *   1600   BUILT BY RIDERS. CRAFTED FOR PERFORMANCE.
 *   2300   soft dissolve to homepage
 *   2700   removed from DOM
 */
type Phase = "mark" | "title" | "sub" | "tag" | "dissolve" | "done";

export function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("mark");

  // Pre-compute particle positions so they don't re-shuffle on re-render.
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 30 + Math.random() * 50,
        size: 1 + Math.random() * 1.8,
        delay: Math.random() * 1200,
        duration: 4000 + Math.random() * 3500,
        drift: -8 + Math.random() * 16,
        opacity: 0.18 + Math.random() * 0.32,
      })),
    [],
  );

  useEffect(() => {
    // Already played this session — skip entirely.
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      onComplete();
      return;
    }

    // Reduced motion — skip the show, but still mark as seen.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setPhase("done");
      onComplete();
      return;
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("title"), 400));
    timers.push(window.setTimeout(() => setPhase("sub"), 1000));
    timers.push(window.setTimeout(() => setPhase("tag"), 1600));
    timers.push(window.setTimeout(() => setPhase("dissolve"), 2300));
    timers.push(
      window.setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
        setPhase("done");
        onComplete();
      }, 2700),
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const visible = (after: Phase) => {
    const order: Phase[] = ["mark", "title", "sub", "tag", "dissolve"];
    return order.indexOf(phase) >= order.indexOf(after);
  };

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{
        background: "#0a0907",
        opacity: phase === "dissolve" ? 0 : 1,
        transition: "opacity 600ms cubic-bezier(0.45, 0, 0.15, 1)",
      }}
    >
      {/* Warm bronze radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(36 45% 35% / 0.28) 0%, hsl(36 30% 20% / 0.12) 35%, transparent 70%)",
          opacity: visible("mark") ? 1 : 0,
          transition: "opacity 900ms ease-out",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)",
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
          transition:
            "opacity 900ms cubic-bezier(0.45,0,0.15,1), transform 900ms cubic-bezier(0.45,0,0.15,1)",
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
          transition:
            "opacity 800ms cubic-bezier(0.45,0,0.15,1), transform 800ms cubic-bezier(0.45,0,0.15,1)",
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
          transition: "width 900ms cubic-bezier(0.45,0,0.15,1)",
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
          transition:
            "opacity 700ms cubic-bezier(0.45,0,0.15,1), transform 700ms cubic-bezier(0.45,0,0.15,1)",
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
          transition:
            "opacity 700ms cubic-bezier(0.45,0,0.15,1), transform 700ms cubic-bezier(0.45,0,0.15,1)",
        }}
      >
        Built by Riders · Crafted for Performance
      </p>
    </div>
  );
}
