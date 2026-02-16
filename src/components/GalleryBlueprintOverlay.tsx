import { ReactNode } from "react";
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
 * Provides consistent layering: blueprint image → gallery line overlay → gradient → content.
 */
export function GalleryBlueprintOverlay({
  layer = "elevation",
  bg = "background",
  lineColor = "dark",
  children,
  className = "",
}: GalleryBlueprintOverlayProps) {
  const bgVar = bg === "card" ? "card" : "background";

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
      {/* Layer 3: Gradient to blend into section bg */}
      <div
        className={`absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-${bgVar}/60 via-${bgVar}/90 to-${bgVar}`}
      />
      {/* Layer 4: Content */}
      <div className="relative z-[2]">{children}</div>
    </section>
  );
}
