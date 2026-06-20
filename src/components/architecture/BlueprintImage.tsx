import * as React from "react";
import { useInView } from "./useInView";

/**
 * Image wrapper that emerges from a blueprint underlay into a finished
 * photograph. The underlay is a CSS-only drafting grid + corner brackets
 * — no extra network request — so we get a consistent "plan resolving
 * into place" arrival across every hero, card and handoff image.
 *
 * Aspect ratio is reserved up-front to eliminate layout shift, and the
 * photograph fades in only once it has actually decoded.
 */
export function BlueprintImage({
  src,
  alt,
  aspect = "16 / 10",
  className = "",
  imgClassName = "",
  loading = "lazy",
  fetchPriority,
  sizes,
  rounded = false,
}: {
  src: string;
  alt: string;
  aspect?: string;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  rounded?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [loaded, setLoaded] = React.useState(false);
  const armed = inView && loaded;

  return (
    <div
      ref={ref}
      data-bp-armed={String(armed)}
      className={`relative overflow-hidden bg-background ${rounded ? "rounded-sm" : ""} ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {/* Blueprint underlay — drafting grid + thin border */}
      <div
        aria-hidden
        className="bp-image-underlay absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--accent) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--accent) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          boxShadow: "inset 0 0 0 1px hsl(var(--accent) / 0.2)",
        }}
      />
      {/* Photograph */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        className={`bp-image-photo absolute inset-0 w-full h-full object-cover ${imgClassName}`}
        style={{ opacity: armed ? undefined : 0 }}
      />
    </div>
  );
}
