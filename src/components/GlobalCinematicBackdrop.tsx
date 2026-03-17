import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import blueprintDrawingLoop from "@/assets/videos/blueprint-drawing-loop.mp4";
import blueprintConstructionLoop from "@/assets/videos/blueprint-construction-loop.mp4";
import blueprintLogoReference from "@/assets/pe-blueprint-gold-logo-reference.png";
import { RopeEmblem } from "@/components/RopeEmblem";

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
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: activeLayer === 0 ? 0.18 : 0,
          transition: "opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        autoPlay muted loop playsInline preload="metadata"
      >
        <source src={blueprintDrawingLoop} type="video/mp4" />
      </video>

      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: activeLayer === 1 ? 0.18 : 0,
          transition: "opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        autoPlay muted loop playsInline preload="metadata"
      >
        <source src={blueprintConstructionLoop} type="video/mp4" />
      </video>

      <img
        src={blueprintLogoReference}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.05]"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-background/84" />

      {/* Rope + PE emblem — bottom-right, soft blend */}
      <div className="absolute right-6 bottom-6">
        <RopeEmblem size="sm" opacity={0.22} />
      </div>
    </div>
  );
}
