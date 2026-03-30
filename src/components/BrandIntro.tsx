import { useState, useEffect } from "react";

const SESSION_KEY = "pe-brand-intro-seen";

export function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"black" | "title" | "sub" | "cut" | "done">("black");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      onComplete();
      return;
    }

    // 1. Pure black — 1000ms of silence
    const t1 = setTimeout(() => setPhase("title"), 1000);

    // 2. Title fades in over 700ms, holds for 1200ms, then subtext
    const t2 = setTimeout(() => setPhase("sub"), 2900);

    // 3. Subtext holds 1000ms, then hard cut
    const t3 = setTimeout(() => {
      setPhase("cut");
    }, 3900);

    // 4. Instant removal after cut frame renders
    const t4 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
      onComplete();
    }, 3950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none"
      style={{
        background: "#000",
        opacity: phase === "cut" ? 0 : 1,
        transition: phase === "cut" ? "opacity 80ms linear" : "none",
      }}
    >
      {/* Faint structural linework — subliminal */}
      <div
        className="absolute inset-0"
        style={{
          opacity: phase === "sub" || phase === "cut" ? 0.02 : 0,
          transition: "opacity 1800ms ease-in",
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 48px,
            hsl(var(--accent) / 0.08) 48px,
            hsl(var(--accent) / 0.08) 49px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 48px,
            hsl(var(--accent) / 0.08) 48px,
            hsl(var(--accent) / 0.08) 49px
          )`,
        }}
        aria-hidden
      />

      {/* Brand name */}
      <h1
        className="font-serif font-light tracking-[0.12em]"
        style={{
          fontSize: "clamp(1.1rem, 0.5rem + 2.5vw, 1.9rem)",
          color: "hsl(36 10% 84%)",
          opacity: phase === "black" ? 0 : 1,
          transition: "opacity 700ms ease-in",
        }}
      >
        Peninsula Equine
      </h1>

      {/* Subtext */}
      <p
        className="mt-5 font-mono uppercase"
        style={{
          fontSize: "clamp(0.45rem, 0.3rem + 0.4vw, 0.6rem)",
          letterSpacing: "0.45em",
          color: "hsl(36 6% 40%)",
          opacity: phase === "sub" || phase === "cut" ? 1 : 0,
          transition: "opacity 500ms ease-in",
        }}
      >
        Built environments for equine performance
      </p>
    </div>
  );
}
