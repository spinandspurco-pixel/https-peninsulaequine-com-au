import { ReactNode } from "react";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";
import blueprintHorseBarn from "@/assets/blueprint-horse-barn.png";
import blueprintDoorDetail from "@/assets/blueprint-door-detail.png";
import blueprintDetail from "@/assets/blueprint-detail.png";

/* ── Image registry ─────────────────────────────────── */
const images = {
  elevation: blueprintElevation,
  facility: blueprintFacility,
  barn: blueprintBarn,
  "horse-barn": blueprintHorseBarn,
  "door-detail": blueprintDoorDetail,
  detail: blueprintDetail,
} as const;

export type BlueprintImage = keyof typeof images;

type LineVariant =
  | "barn"
  | "detail"
  | "dimensions"
  | "front-elevation"
  | "about-elevation"
  | "story-blueprint"
  | "values-blueprint"
  | "horsemanship-blueprint"
  | "gallery";

/* ── Layer config ───────────────────────────────────── */
export interface LayerConfig {
  image: BlueprintImage;
  opacity?: number;
  direction?: "left-to-right" | "right-to-left" | "bottom-to-top";
  duration?: number;
  parallaxSpeed?: number;
  className?: string;
}

/* ── Props ──────────────────────────────────────────── */
export interface BlueprintSceneProps {
  /**
   * Quick preset — applies a curated multi-layer stack
   * with matching line overlays.
   */
  preset?:
    | "hero"
    | "elevation"
    | "facility"
    | "barn"
    | "gallery"
    | "page-header"
    | "intro"
    | "services";
  /** Fine-grained layer list — overrides preset. */
  layers?: LayerConfig[];
  /** SVG line overlay variant(s) rendered on top of image layers. */
  lineOverlays?: { variant: LineVariant; color?: "light" | "dark" }[];
  /** Gradient overlay to blend into section background. */
  gradient?: string;
  /** Wrap children inside the scene. */
  children?: ReactNode;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** HTML tag for the wrapper. */
  as?: "section" | "div";
}

/* ── Presets ─────────────────────────────────────────── */
type PresetConfig = {
  layers: LayerConfig[];
  lineOverlays: { variant: LineVariant; color: "light" | "dark" }[];
};

const presets: Record<string, PresetConfig> = {
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
  gallery: {
    layers: [
      { image: "elevation", opacity: 0.025, direction: "bottom-to-top", duration: 3200, parallaxSpeed: 0.045 },
    ],
    lineOverlays: [{ variant: "gallery", color: "dark" }],
  },
  /** Subpage headers — single dark layer + front-elevation drawing */
  "page-header": {
    layers: [
      { image: "horse-barn", opacity: 0.06, direction: "left-to-right", duration: 2000, parallaxSpeed: 0.04 },
    ],
    lineOverlays: [{ variant: "front-elevation", color: "light" }],
  },
  /** Home intro section — lighter background */
  intro: {
    layers: [
      { image: "horse-barn", opacity: 0.05, direction: "bottom-to-top", duration: 2200, parallaxSpeed: 0.05 },
    ],
    lineOverlays: [{ variant: "dimensions", color: "dark" }],
  },
  /** Home services section — dark background */
  services: {
    layers: [
      { image: "door-detail", opacity: 0.07, direction: "right-to-left", duration: 2000, parallaxSpeed: 0.06 },
    ],
    lineOverlays: [{ variant: "front-elevation", color: "light" }],
  },
};

/**
 * BlueprintScene — unified composable blueprint layer system.
 *
 * Combines background image layers with SVG line overlays.
 * Replaces the former AnimatedBlueprintBg, BlueprintKit, and
 * manual BlueprintBackground + BlueprintLineOverlay combos.
 *
 * Quick usage:
 *   <BlueprintScene preset="hero">…</BlueprintScene>
 *
 * Custom usage:
 *   <BlueprintScene
 *     layers={[{ image: "facility", opacity: 0.06, parallaxSpeed: 0.05 }]}
 *     lineOverlays={[{ variant: "dimensions", color: "dark" }]}
 *   >
 *     <YourContent />
 *   </BlueprintScene>
 */
export function BlueprintScene({
  preset,
  layers: customLayers,
  lineOverlays: customLineOverlays,
  gradient,
  children,
  className = "",
  as: Tag = "div",
}: BlueprintSceneProps) {
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

      {/* SVG line overlays — draw-in on scroll */}
      {lineOverlays.map((lo, i) => (
        <BlueprintLineOverlay
          key={`lo-${i}`}
          variant={lo.variant}
          color={lo.color ?? "dark"}
        />
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
