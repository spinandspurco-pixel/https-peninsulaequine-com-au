import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealOnScrollProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
  threshold?: number;
  once?: boolean;
  /** Stagger index — auto-calculates delay based on position */
  stagger?: number;
  staggerInterval?: number;
  /** Enable cinematic scale (1.02 → 1.0) — ideal for image containers */
  scaleReveal?: boolean;
}

const transforms: Record<RevealDirection, (distance: number, scale: boolean) => string> = {
  up: (d, s) => `translateY(${d}px)${s ? " scale(1.02)" : ""}`,
  down: (d, s) => `translateY(-${d}px)${s ? " scale(1.02)" : ""}`,
  left: (d, s) => `translateX(${d}px)${s ? " scale(1.02)" : ""}`,
  right: (d, s) => `translateX(-${d}px)${s ? " scale(1.02)" : ""}`,
  none: (_, s) => s ? "scale(1.02)" : "none",
};

/** Base entrance delay — creates intentional pause before arrival */
const BASE_REVEAL_DELAY = 600;

export function RevealOnScroll({
  children,
  direction = "up",
  delay = 0,
  duration = DURATION.normal, // 800ms arrival
  distance = DISTANCE.md,
  className,
  as: Tag = "div",
  threshold = 0.15,
  once = true,
  stagger,
  staggerInterval = 100,
  scaleReveal = false,
}: RevealOnScrollProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold, once });

  const computedDelay =
    BASE_REVEAL_DELAY + (stagger !== undefined ? stagger * staggerInterval : delay);

  const style: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? "translate3d(0,0,0) scale(1)"
      : transforms[direction](distance, scaleReveal),
    transition: `opacity ${duration}ms ${EASE.default} ${computedDelay}ms, transform ${duration}ms ${EASE.default} ${computedDelay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <Tag ref={ref as any} className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Image-specific reveal — fades in with subtle scale-down (1.02 → 1.0).
 * Use this to wrap image containers for cinematic scroll behaviour.
 */
export function RevealImage({
  children,
  className,
  delay = 0,
  duration = 600,
  threshold = 0.12,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold });
  const totalDelay = BASE_REVEAL_DELAY + delay;

  const style: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "scale(1)" : "scale(1.02)",
    transition: `opacity ${duration}ms ${EASE.cinematic} ${totalDelay}ms, transform ${duration}ms ${EASE.cinematic} ${totalDelay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={cn("overflow-hidden", className)} style={style}>
      {children}
    </div>
  );
}

/**
 * Line that grows from left on scroll — for section dividers.
 */
export function RevealLine({
  className,
  delay = 0,
  width = "w-16",
}: {
  className?: string;
  delay?: number;
  width?: string;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      className={cn(width, "h-px bg-accent origin-left", className)}
      style={{
        transform: isVisible ? "scaleX(1)" : "scaleX(0)",
        transition: `transform ${DURATION.parallax}ms ${EASE.default} ${BASE_REVEAL_DELAY + delay}ms`,
      }}
    />
  );
}
