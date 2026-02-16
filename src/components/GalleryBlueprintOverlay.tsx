import { ReactNode, useEffect, useRef, useState } from "react";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";

interface GalleryBlueprintOverlayProps {
  /** Which blueprint image to use as the base layer */
  layer?: "elevation" | "facility" | "barn";
  /** Background tone for the gradient overlay */
  bg?: "background" | "card";
  /** Line overlay color scheme */
  lineColor?: "light" | "dark";
  children: ReactNode;
  className?: string;
}

const blueprintImages = {
  elevation: blueprintElevation,
  facility: blueprintFacility,
  barn: blueprintBarn,
};

const directions: Record<string, "left-to-right" | "right-to-left" | "bottom-to-top"> = {
  elevation: "bottom-to-top",
  facility: "left-to-right",
  barn: "right-to-left",
};

/**
 * Unified blueprint overlay system for all Gallery page sections.
 * Gradient overlay auto-resizes via CSS custom properties resolved at paint time,
 * so it adapts instantly to any viewport change without JS resize listeners.
 */
export function GalleryBlueprintOverlay({
  layer = "elevation",
  bg = "background",
  lineColor = "dark",
  children,
  className = "",
}: GalleryBlueprintOverlayProps) {
  /* CSS variable name that resolves to the section's background HSL value */
  const hslVar = bg === "card" ? "var(--card)" : "var(--background)";

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Layer 1: Blueprint background image with parallax */}
      <BlueprintBackground
        image={blueprintImages[layer]}
        opacity={0.025}
        direction={directions[layer]}
        duration={3200}
        parallaxSpeed={0.045}
      />
      {/* Layer 2: Gallery viewfinder SVG line overlay */}
      <BlueprintLineOverlay variant="gallery" color={lineColor} />
      {/* Layer 3: Gradient lightening overlay — uses live CSS vars so it
          auto-adapts when viewport changes trigger theme / layout shifts */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `linear-gradient(to bottom, hsl(${hslVar} / 0.6), hsl(${hslVar} / 0.9), hsl(${hslVar}))`,
        }}
      />
      {/* Layer 4: Content */}
      <div className="relative z-[2]">{children}</div>
    </section>
  );
}
