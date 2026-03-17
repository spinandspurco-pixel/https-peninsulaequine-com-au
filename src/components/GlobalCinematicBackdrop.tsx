import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import blueprintDrawingLoop from "@/assets/videos/blueprint-drawing-loop.mp4";
import blueprintConstructionLoop from "@/assets/videos/blueprint-construction-loop.mp4";
import ropeRing from "@/assets/pe-rope-ring.png";
import blueprintLogoReference from "@/assets/pe-blueprint-gold-logo-reference.png";

const hiddenPrefixes = ["/admin", "/employee", "/bookings", "/staff", "/trainer"];

export function GlobalCinematicBackdrop() {
  const { pathname } = useLocation();
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveLayer((prev) => (prev === 0 ? 1 : 0));
    }, 9000);

    return () => window.clearInterval(timer);
  }, []);

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${activeLayer === 0 ? "opacity-20" : "opacity-0"}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={blueprintDrawingLoop} type="video/mp4" />
      </video>

      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${activeLayer === 1 ? "opacity-20" : "opacity-0"}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={blueprintConstructionLoop} type="video/mp4" />
      </video>

      <img
        src={blueprintLogoReference}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.06]"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-background/84" />

      <img
        src={ropeRing}
        alt=""
        className="absolute right-6 bottom-6 w-20 h-20 object-contain opacity-30 animate-rope-drift"
        loading="lazy"
      />
    </div>
  );
}
