import { useState, useEffect } from "react";

const SESSION_KEY = "pe-brand-intro-seen";

export function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"black" | "title" | "sub" | "done">("black");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      onComplete();
      return;
    }

    // Step 1: Black screen — 1000ms silence
    const t1 = setTimeout(() => setPhase("title"), 1000);
    // Step 2: Title fades in, hold 1400ms then reveal subtext
    const t2 = setTimeout(() => setPhase("sub"), 2400);
    // Step 3: Subtext holds 1200ms then hard cut (instant removal)
    const t3 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none"
      style={{ background: "#000" }}
    >
      {/* Faint structural linework — subliminal, not decorative */}
      <div
        className="absolute inset-0"
        style={{
          opacity: phase === "sub" ? 0.025 : 0,
          transition: "opacity 1400ms ease-in",
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 44px,
            hsl(var(--accent) / 0.12) 44px,
            hsl(var(--accent) / 0.12) 45px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 44px,
            hsl(var(--accent) / 0.12) 44px,
            hsl(var(--accent) / 0.12) 45px
          )`,
        }}
        aria-hidden
      />

      {/* Brand name — warm off-white, restrained */}
      <h1
        className="font-serif font-light tracking-[0.1em]"
        style={{
          fontSize: "clamp(1.15rem, 0.5rem + 2.5vw, 2rem)",
          color: "hsl(36 10% 85%)",
          opacity: phase === "black" ? 0 : 1,
          transition: "opacity 800ms ease-in",
        }}
      >
        Peninsula Equine
      </h1>

      {/* Subtext — architectural, barely there */}
      <p
        className="mt-4 font-mono uppercase"
        style={{
          fontSize: "clamp(0.5rem, 0.35rem + 0.45vw, 0.65rem)",
          letterSpacing: "0.4em",
          color: "hsl(36 8% 45%)",
          opacity: phase === "sub" ? 1 : 0,
          transition: "opacity 600ms ease-in",
        }}
      >
        Engineered Infrastructure
      </p>
    </div>
  );
}
