import { useState, useEffect } from "react";

const SESSION_KEY = "pe-brand-intro-seen";

export function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"black" | "title" | "sub" | "exit" | "done">("black");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      onComplete();
      return;
    }

    // Step 1: Black screen 1000ms
    const t1 = setTimeout(() => setPhase("title"), 1000);
    // Step 2: Title fades in, hold 1200ms then show subtext
    const t2 = setTimeout(() => setPhase("sub"), 2200);
    // Step 3: Subtext visible, hold 1000ms then hard cut
    const t3 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
      onComplete();
    }, 3400);

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
      {/* Faint GroundLock pattern — emerges at low opacity */}
      <div
        className="absolute inset-0"
        style={{
          opacity: phase === "sub" ? 0.03 : 0,
          transition: "opacity 1200ms ease-in",
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 38px,
            hsl(var(--accent) / 0.15) 38px,
            hsl(var(--accent) / 0.15) 40px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 38px,
            hsl(var(--accent) / 0.15) 38px,
            hsl(var(--accent) / 0.15) 40px
          )`,
        }}
        aria-hidden
      />

      {/* Title: Peninsula Equine */}
      <h1
        className="font-serif font-light tracking-[0.12em] text-white/80"
        style={{
          fontSize: "clamp(1.2rem, 0.6rem + 2.5vw, 2.2rem)",
          opacity: phase === "black" ? 0 : 1,
          transition: "opacity 800ms ease-in",
        }}
      >
        Peninsula Equine
      </h1>

      {/* Subtext: Engineered Infrastructure */}
      <p
        className="mt-4 font-mono uppercase tracking-[0.35em] text-white/20"
        style={{
          fontSize: "clamp(0.55rem, 0.4rem + 0.5vw, 0.7rem)",
          opacity: phase === "sub" ? 1 : 0,
          transition: "opacity 600ms ease-in",
        }}
      >
        Engineered Infrastructure
      </p>
    </div>
  );
}
