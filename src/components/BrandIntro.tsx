import { useState, useEffect } from "react";

const SESSION_KEY = "pe-brand-intro-seen";

export function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"show" | "exit" | "done">("show");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      onComplete();
      return;
    }

    // Text visible immediately with mark. Cut at 600ms. Gone at 800ms.
    const t1 = setTimeout(() => setPhase("exit"), 600);
    const t2 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
      onComplete();
    }, 800);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
      style={{
        background: "hsl(222 20% 4% / 0.97)",
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 150ms linear",
      }}
    >
      {/* PE Mark */}
      <svg
        viewBox="0 0 40 40"
        className="w-7 h-7 mb-5"
        style={{
          opacity: phase === "exit" ? 0 : 0.4,
          transform: phase === "exit" ? "scale(0.85)" : "scale(1)",
          transition: "opacity 120ms linear, transform 120ms linear",
        }}
        aria-hidden
      >
        <rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.5" />
        <text x="20" y="25" textAnchor="middle" fontSize="12" fontFamily="serif" fill="hsl(var(--accent))" opacity="0.6">PE</text>
      </svg>

      {/* Tagline — appears immediately, no linger */}
      <p
        className="font-serif text-sm sm:text-base tracking-[0.08em] text-primary-foreground/40 italic"
        style={{
          opacity: phase === "exit" ? 0 : 1,
          transition: "opacity 120ms linear",
        }}
      >
        From Dirt to Dynasty
      </p>
    </div>
  );
}
