import { ReactNode, useEffect, useState } from "react";
import peRopeRing from "@/assets/pe-rope-ring.png";
import blueprintLogoReference from "@/assets/pe-blueprint-gold-logo-reference.png";
import blueprintDrawingLoop from "@/assets/videos/blueprint-drawing-loop.mp4";
import blueprintConstructionLoop from "@/assets/videos/blueprint-construction-loop.mp4";
import { BlueprintScene } from "@/components/BlueprintScene";

interface StaffPortalFrameProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function StaffPortalFrame({ title, subtitle, children }: StaffPortalFrameProps) {
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveLayer((prev) => (prev === 0 ? 1 : 0));
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-primary">
      {/* Dual video crossfade */}
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${activeLayer === 0 ? "opacity-30" : "opacity-0"}`}
        autoPlay muted loop playsInline preload="metadata"
      >
        <source src={blueprintDrawingLoop} type="video/mp4" />
      </video>
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${activeLayer === 1 ? "opacity-30" : "opacity-0"}`}
        autoPlay muted loop playsInline preload="metadata"
      >
        <source src={blueprintConstructionLoop} type="video/mp4" />
      </video>

      {/* Gold logo watermark */}
      <img
        src={blueprintLogoReference}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.04]"
        loading="lazy"
      />

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-primary/60" />

      {/* Blueprint line system */}
      <BlueprintScene
        preset="hero"
        className="absolute inset-0"
        gradient="linear-gradient(180deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.45))"
      />

      {/* Content */}
      <div className="relative z-10 section-container section-padding-lg grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-5 text-primary-foreground max-w-xl">
          <p className="text-overline text-accent">From Dirt to Dynasty</p>
          <h1 className="heading-section text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{title}</h1>
          <p className="text-body-lg text-primary-foreground/80">{subtitle}</p>

          {/* Animated layer indicator */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setActiveLayer(0)}
              className={`h-1.5 rounded-full transition-all duration-500 ${activeLayer === 0 ? "w-8 bg-accent" : "w-4 bg-primary-foreground/30"}`}
              aria-label="Blueprint drawing layer"
            />
            <button
              onClick={() => setActiveLayer(1)}
              className={`h-1.5 rounded-full transition-all duration-500 ${activeLayer === 1 ? "w-8 bg-accent" : "w-4 bg-primary-foreground/30"}`}
              aria-label="Construction layer"
            />
          </div>

          <img
            src={peRopeRing}
            alt="Decorative rope emblem"
            className="h-24 w-24 object-contain animate-rope-drift"
            loading="lazy"
          />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
