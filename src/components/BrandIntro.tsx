import { useState, useEffect } from "react";

const SESSION_KEY = "pe-brand-intro-seen";

export function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"mark" | "text" | "exit" | "done">("mark");

  useEffect(() => {
    // Already seen this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      onComplete();
      return;
    }

    // mark visible immediately, text fades in at 200ms, exit at 800ms, done at 1200ms
    const t1 = setTimeout(() => setPhase("text"), 200);
    const t2 = setTimeout(() => setPhase("exit"), 800);
    const t3 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem(SESSION_KEY, "1");
      onComplete();
    }, 1200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
      style={{
        background: "hsl(222 20% 4% / 0.97)",
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 400ms ease-out",
      }}
    >
      {/* PE Mark — subtle slow pulse */}
      <svg
        viewBox="0 0 40 40"
        className="w-8 h-8 mb-6"
        style={{
          opacity: phase === "exit" ? 0 : 0.4,
          transform: phase === "exit" ? "scale(0.92)" : "scale(1)",
          transition: "opacity 400ms ease-out, transform 400ms ease-out",
          animation: "brand-pulse 3s ease-in-out infinite",
        }}
        aria-hidden
      >
        <rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.5" />
        <text x="20" y="25" textAnchor="middle" fontSize="12" fontFamily="serif" fill="hsl(var(--accent))" opacity="0.6">PE</text>
      </svg>

      {/* Tagline */}
      <p
        className="font-serif text-sm sm:text-base tracking-[0.08em] text-primary-foreground/40 italic"
        style={{
          opacity: phase === "text" ? 1 : phase === "exit" ? 0 : 0,
          transform: phase === "text" ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}
      >
        From Dirt to Dynasty
      </p>

      <style>{`
        @keyframes brand-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
