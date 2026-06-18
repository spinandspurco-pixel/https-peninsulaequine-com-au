/**
 * CropSafeImage — hard-enforced crop-safety contract
 * -----------------------------------------------------------------
 * Use this component for any image whose focal points sit near the
 * edges of the frame (boots in the corner, steel at the right, etc.)
 * and MUST never be clipped on any breakpoint.
 *
 * The four contract rules from src/config/projectImagery.ts are
 * enforced here in code, not in comments:
 *
 *   1. The container's aspectRatio is locked to the prop you pass
 *      (e.g. "3 / 2"). It is applied via inline style and CANNOT
 *      be overridden by a className.
 *   2. The <img> always renders with `object-contain object-center`.
 *      Callers cannot pass className/style to the <img> itself, so
 *      no future edit can swap to object-cover or push the focal
 *      window toward an edge.
 *   3. Intrinsic `width` and `height` (matching the native pixel
 *      dimensions of the largest variant) are required props so the
 *      browser reserves the correct box before decode (no CLS, no
 *      transient cropping during load).
 *   4. Filter / overlay content lives OUTSIDE the <img> via the
 *      `filter` prop and `children` slot — they can never mutate
 *      the fit or position rules above.
 *
 * If you need object-cover with directional positioning (e.g. a
 * decorative hero where some crop is acceptable), DO NOT extend
 * this component — use a plain <img>. This component exists
 * specifically to make cropping impossible.
 * -----------------------------------------------------------------
 */
import type { CSSProperties, ReactNode } from "react";
import type { ResponsiveAsset } from "@/config/projectImagery";

export interface CropSafeImageProps {
  /** Responsive asset bundle from getProjectResponsive(). */
  responsive: ResponsiveAsset;
  /** Required alt text. */
  alt: string;
  /**
   * Aspect ratio of the SOURCE image, e.g. "3 / 2" for a 1536x1024
   * photo. Locking this to the native ratio is what guarantees
   * `object-contain` and `object-cover` produce identical pixels at
   * the natural state.
   */
  aspectRatio: `${number} / ${number}`;
  /** Intrinsic pixel width of the largest variant. */
  width: number;
  /** Intrinsic pixel height of the largest variant. */
  height: number;
  /** CSS filter string applied to the <img>, e.g. "brightness(0.86)". */
  filter?: string;
  /** "lazy" by default. Pass "eager" for above-the-fold heroes. */
  loading?: "lazy" | "eager";
  /** "async" by default. Pass "sync" only for LCP-critical images. */
  decoding?: "async" | "sync" | "auto";
  /** fetchpriority hint. */
  fetchPriority?: "high" | "low" | "auto";
  /** Optional override for the responsive sizes attribute. */
  sizes?: string;
  /** Optional className on the OUTER container (never the <img>). */
  containerClassName?: string;
  /**
   * Overlay slot — gradients, copy, badges. Rendered as siblings of
   * the <img>, never able to mutate fit/position.
   */
  children?: ReactNode;
}

export function CropSafeImage({
  responsive,
  alt,
  aspectRatio,
  width,
  height,
  filter,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  sizes,
  containerClassName,
  children,
}: CropSafeImageProps) {
  // The contract: these styles are NOT spreadable from props.
  const imgStyle: CSSProperties | undefined = filter ? { filter } : undefined;
  const containerStyle: CSSProperties = { aspectRatio };

  return (
    <div
      className={`relative w-full overflow-hidden bg-background ${containerClassName ?? ""}`.trim()}
      style={containerStyle}
    >
      <img
        src={responsive.src}
        srcSet={responsive.srcSet}
        sizes={sizes ?? responsive.sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        // @ts-expect-error fetchpriority is valid HTML, missing in older React types
        fetchpriority={fetchPriority}
        // Hard-coded — DO NOT accept overrides from props.
        className="absolute inset-0 h-full w-full object-contain object-center"
        style={imgStyle}
      />
      {children}
    </div>
  );
}
