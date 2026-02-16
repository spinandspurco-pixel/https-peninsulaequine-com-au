import { ReactNode } from "react";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";

const images = {
  elevation: blueprintElevation,
  facility: blueprintFacility,
  barn: blueprintBarn,
} as const;

type LayerName = keyof typeof images;

type LineVariant = "barn" | "detail" | "dimensions" | "front-elevation" | "about-elevation" | "story-blueprint" | "values-blueprint" | "horsemanship-blueprint" | "gallery";

interface LayerConfig {
  /** Which blueprint image */
  image: LayerName;
  /** Opacity 0–1 (default 0.04) */
  opacity?: number;
  /** Reveal direction */
  direction?: "left-to-right" | "right-to-left" | "bottom-to-top";
  /** Reveal duration ms */
  duration?: number;
  /** Parallax speed 0–1 */
  parallaxSpeed?: number;
  /** Extra Tailwind classes on the layer */
  className?: string;
}

interface BlueprintKitProps {
  /**
   * Quick preset — applies a curated multi-layer stack.
   * Use `layers` for full control instead.
   */
  preset?: "elevation" | "facility" | "barn" | "hero" | "gallery";
  /**
   * Fine-grained per-section layer list. Overrides `preset`.
   * Each entry configures one BlueprintBackground instance.
   */
  layers?: LayerConfig[];
  /** SVG line overlay variant(s) rendered on top of the image layers */
  lineOverlays?: { variant: LineVariant; color?: "light" | "dark" }[];
  /** Gradient overlay to blend into section background */
  gradient?: string;
  /** Wrap children inside the kit */
  children?: ReactNode;
  /** Extra classes on the outer wrapper (e.g. section padding) */
  className?: string;
  /** HTML tag for the wrapper */
  as?: "section" | "div";
}

/* ── Presets ── */
const presets: Record<string, { layers: LayerConfig[]; lineOverlays: { variant: LineVariant; color: "light" | "dark" }[] }> = {
  elevation: {
    layers: [
      { image: "elevation", opacity: 0.07, direction: "left-to-right", duration: 2000, parallaxSpeed: 0.05 },
      { image: "facility", opacity: 0.035, direction: "right-to-left", duration: 2400, parallaxSpeed: 0.1, className: "scale-105" },
      { image: "barn", opacity: 0.025, direction: "bottom-to-top", duration: 2800, parallaxSpeed: 0.06 },
    ],
    lineOverlays: [{ variant: "dimensions", color: "light" }],
  },
  facility: {
    layers: [
      { image: "facility", opacity: 0.05, parallaxSpeed: 0.06 },
      { image: "barn", opacity: 0.03, direction: "right-to-left", parallaxSpeed: 0.12, duration: 2000, className: "scale-110" },
    ],
    lineOverlays: [{ variant: "barn", color: "dark" }],
  },
  barn: {
    layers: [
      { image: "barn", opacity: 0.03, direction: "right-to-left", duration: 3000, parallaxSpeed: 0.04 },
    ],
    lineOverlays: [{ variant: "detail", color: "dark" }],
  },
  hero: {
    layers: [
      { image: "facility", opacity: 0.08, direction: "left-to-right", duration: 2500, parallaxSpeed: 0.04 },
      { image: "elevation", opacity: 0.05, direction: "right-to-left", duration: 3000, parallaxSpeed: 0.08, className: "scale-110" },
      { image: "barn", opacity: 0.04, direction: "bottom-to-top", duration: 2800, parallaxSpeed: 0.06 },
    ],
    lineOverlays: [
      { variant: "dimensions", color: "light" },
      { variant: "barn", color: "light" },
    ],
  },
  gallery: {
    layers: [
      { image: "elevation", opacity: 0.025, direction: "bottom-to-top", duration: 3200, parallaxSpeed: 0.045 },
    ],
    lineOverlays: [{ variant: "gallery", color: "dark" }],
  },
};

/**
 * BlueprintKit — drop-in composable blueprint layer system.
 *
 * Quick usage with a preset:
 *   <BlueprintKit preset="elevation">…</BlueprintKit>
 *
 * Full customisation:
 *   <BlueprintKit
 *     layers={[
 *       { image: "facility", opacity: 0.06, parallaxSpeed: 0.05 },
 *       { image: "barn", opacity: 0.03, direction: "right-to-left", parallaxSpeed: 0.1 },
 *     ]}
 *     lineOverlays={[{ variant: "dimensions", color: "dark" }]}
 *     gradient="linear-gradient(to bottom, hsl(var(--background) / 0.6), hsl(var(--background)))"
 *   >
 *     <YourContent />
 *   </BlueprintKit>
 */
export function BlueprintKit({
  preset,
  layers: customLayers,
  lineOverlays: customLineOverlays,
  gradient,
  children,
  className = "",
  as: Tag = "div",
}: BlueprintKitProps) {
  const resolved = preset ? presets[preset] : undefined;
  const layers = customLayers ?? resolved?.layers ?? [];
  const lineOverlays = customLineOverlays ?? resolved?.lineOverlays ?? [];

  return (
    <Tag className={`relative overflow-hidden ${className}`}>
      {/* Blueprint image layers */}
      {layers.map((layer, i) => (
        <BlueprintBackground
          key={`bp-${i}`}
          image={images[layer.image]}
          opacity={layer.opacity ?? 0.04}
          direction={layer.direction ?? "left-to-right"}
          duration={layer.duration ?? 1500}
          parallaxSpeed={layer.parallaxSpeed ?? 0.08}
          className={layer.className}
        />
      ))}

      {/* SVG line overlays */}
      {lineOverlays.map((lo, i) => (
        <BlueprintLineOverlay key={`lo-${i}`} variant={lo.variant} color={lo.color ?? "dark"} />
      ))}

      {/* Optional gradient blend */}
      {gradient && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: gradient }}
        />
      )}

      {/* Content */}
      {children && <div className="relative z-[2]">{children}</div>}
    </Tag>
  );
}
