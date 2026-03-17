import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import blueprintDrawingLoop from "@/assets/videos/blueprint-drawing-loop.mp4";
import blueprintConstructionLoop from "@/assets/videos/blueprint-construction-loop.mp4";

const hiddenPrefixes = ["/admin", "/employee", "/bookings", "/staff", "/trainer"];

/**
 * Ultra-subtle cinematic backdrop — blueprint video crossfade.
 * Kept at very low opacity so it adds texture without competing with content.
 */
export function GlobalCinematicBackdrop() {
  const { pathname } = useLocation();
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveLayer((prev) => (prev === 0 ? 1 : 0));
    }, 12000);

    return () => window.clearInterval(timer);
  }, []);

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: activeLayer === 0 ? 0.06 : 0,
          transition: "opacity 2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        autoPlay muted loop playsInline preload="metadata"
      >
        <source src={blueprintDrawingLoop} type="video/mp4" />
      </video>

      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: activeLayer === 1 ? 0.06 : 0,
          transition: "opacity 2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        autoPlay muted loop playsInline preload="metadata"
      >
        <source src={blueprintConstructionLoop} type="video/mp4" />
      </video>

      {/* Heavy overlay to keep it barely perceptible */}
      <div className="absolute inset-0 bg-background/95" />
    </div>
  );
}
