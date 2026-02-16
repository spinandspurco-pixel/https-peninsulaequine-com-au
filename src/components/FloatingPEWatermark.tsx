import { useState, useEffect } from "react";
import logoPeMark from "@/assets/logo-pe-mark.png";

/**
 * Site-wide floating PE rope-mark watermark.
 * Fades in after a short delay on page load and lingers briefly
 * before dissolving, reinforcing brand presence post-splash.
 */
export function FloatingPEWatermark() {
  const [phase, setPhase] = useState<"wait" | "show" | "fade" | "gone">("wait");

  useEffect(() => {
    // Delay appearance so it follows any splash screen
    const showTimer = setTimeout(() => setPhase("show"), 2600);
    const fadeTimer = setTimeout(() => setPhase("fade"), 5600);
    const goneTimer = setTimeout(() => setPhase("gone"), 7200);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone" || phase === "wait") return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
      style={{
        opacity: phase === "show" ? 0.06 : 0,
        transition: "opacity 1.6s ease-in-out",
      }}
    >
      <img
        src={logoPeMark}
        alt=""
        aria-hidden="true"
        className="w-[30vw] max-w-[220px] h-auto object-contain select-none"
        style={{ filter: "grayscale(0.4) brightness(1.3)" }}
      />
    </div>
  );
}
