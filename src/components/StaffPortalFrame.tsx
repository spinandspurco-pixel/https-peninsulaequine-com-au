import { ReactNode, useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after paint
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveLayer((prev) => (prev === 0 ? 1 : 0));
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-primary">
      {/* Dual video crossfade — smoother cubic bezier */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: activeLayer === 0 ? 0.25 : 0,
          transition: "opacity 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        autoPlay muted loop playsInline preload="metadata"
      >
        <source src={blueprintDrawingLoop} type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: activeLayer === 1 ? 0.25 : 0,
          transition: "opacity 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
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
          {/* Overline with entrance animation */}
          <p
            className="text-overline text-accent"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.7s ease-out 0.2s, transform 0.7s ease-out 0.2s",
            }}
          >
            From Dirt to Dynasty
          </p>

          {/* Title with stagger */}
          <h1
            className="heading-section text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s ease-out 0.35s, transform 0.7s ease-out 0.35s",
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="text-body-lg text-primary-foreground/80"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.7s ease-out 0.5s, transform 0.7s ease-out 0.5s",
            }}
          >
            {subtitle}
          </p>

          {/* Layer indicator pills */}
          <div
            className="flex items-center gap-3 pt-2"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.6s ease-out 0.65s",
            }}
          >
            <button
              onClick={() => setActiveLayer(0)}
              className="h-1.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: activeLayer === 0 ? "2rem" : "1rem",
                backgroundColor: activeLayer === 0
                  ? "hsl(var(--accent))"
                  : "hsl(var(--primary-foreground) / 0.25)",
              }}
              aria-label="Blueprint drawing layer"
            />
            <button
              onClick={() => setActiveLayer(1)}
              className="h-1.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: activeLayer === 1 ? "2rem" : "1rem",
                backgroundColor: activeLayer === 1
                  ? "hsl(var(--accent))"
                  : "hsl(var(--primary-foreground) / 0.25)",
              }}
              aria-label="Construction layer"
            />
          </div>

          {/* Rope emblem with PE inside — blended into dark bg */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 1s ease-out 0.8s",
            }}
          >
            <RopeEmblem size="lg" opacity={0.18} />
          </div>
        </div>

        {/* Card slot */}
        <div
          className="w-full"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
            transition: "opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
