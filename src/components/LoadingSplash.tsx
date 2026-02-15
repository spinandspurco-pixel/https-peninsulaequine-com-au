import { useEffect, useState } from "react";
import peBanner from "@/assets/pe-banner.png";
import blueprintFacility from "@/assets/blueprint-facility.png";

interface LoadingSplashProps {
  /** Minimum display time in ms */
  minDuration?: number;
  onComplete?: () => void;
}

/**
 * Cinematic loading splash screen featuring the PE Banner
 * with animated blueprint watermark background.
 */
export function LoadingSplash({ minDuration = 2200, onComplete }: LoadingSplashProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 300);
    const holdTimer = setTimeout(() => setPhase("exit"), minDuration - 600);
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
      {/* Blueprint watermark background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${blueprintFacility})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: phase === "hold" ? "scale(1.02)" : "scale(1)",
          transition: prefersReduced ? "none" : `transform ${minDuration}ms ease-out`,
        }}
      />

      {/* Subtle radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--primary)/0.6)_100%)]" />

      {/* Decorative accent lines */}
      <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-1/3 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

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
