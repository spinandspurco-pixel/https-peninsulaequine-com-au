import { useInView } from "./useInView";

interface Props {
  orientation?: "horizontal" | "vertical";
  className?: string;
  /** length in tailwind units, e.g. "w-16" or "h-24". Default fills container. */
  length?: string;
  origin?: "left" | "right" | "top" | "bottom";
  delay?: number;
  tone?: "bronze" | "charcoal";
}

/**
 * Fine line that draws on when scrolled into view.
 * Construction-drawing aesthetic: 1px, low-opacity bronze or charcoal.
 */
export function DraftLine({
  orientation = "horizontal",
  className = "",
  length,
  origin,
  delay = 0,
  tone = "bronze",
}: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>();

  const isV = orientation === "vertical";
  const size = length ?? (isV ? "h-full" : "w-full");
  const dim = isV ? "w-px" : "h-px";
  const o = origin ?? (isV ? "top" : "left");
  const animClass = isV ? "animate-draw-y" : "animate-draw-x";
  const colour =
    tone === "bronze" ? "bg-accent/40" : "bg-foreground/15";

  return (
    <span
      ref={ref}
      aria-hidden
      className={`block ${dim} ${size} ${colour} origin-${o} ${
        inView ? animClass : ""
      } ${className}`}
      style={{
        transform: inView ? undefined : isV ? "scaleY(0)" : "scaleX(0)",
        animationDelay: inView ? `${delay}ms` : undefined,
      }}
    />
  );
}
