import { useEffect, useState } from "react";
import peBanner from "@/assets/pe-banner.png";

interface LoadingSplashProps {
  /** Minimum display time in ms */
  minDuration?: number;
  onComplete?: () => void;
}

/**
 * Cinematic loading splash screen featuring the PE Banner.
 * Fades in, holds, then lifts away like a curtain.
 */
export function LoadingSplash({ minDuration = 2200, onComplete }: LoadingSplashProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");

  useEffect(() => {
    // Enter → Hold
    const enterTimer = setTimeout(() => setPhase("hold"), 300);
    // Hold → Exit
    const holdTimer = setTimeout(() => setPhase("exit"), minDuration - 600);
    // Exit → Done
    const exitTimer = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, minDuration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [minDuration, onComplete]);

  // Check reduced motion
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "translateY(-8px)" : "translateY(0)",
        transition: prefersReduced
          ? "opacity 0.1s"
          : "opacity 0.6s ease-in-out, transform 0.6s ease-in-out",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      {/* Subtle radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--primary)/0.6)_100%)]" />

      <div
        className="relative z-10 flex flex-col items-center gap-6 px-8"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.95)" : "scale(1)",
          transition: prefersReduced
            ? "none"
            : "opacity 0.5s ease-out, transform 0.5s ease-out",
        }}
      >
        <img
          src={peBanner}
          alt="Peninsula Equine — From Dirt to Dynasty"
          className="w-[280px] sm:w-[400px] md:w-[500px] h-auto object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
        />

        {/* Minimal loading bar */}
        <div className="w-24 h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full"
            style={{
              width: phase === "enter" ? "0%" : phase === "hold" ? "80%" : "100%",
              transition: prefersReduced
                ? "none"
                : `width ${minDuration * 0.7}ms ease-out`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
