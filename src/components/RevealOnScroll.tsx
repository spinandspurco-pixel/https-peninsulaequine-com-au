import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

type RevealDirection = "up" | "down" | "left" | "right" | "none" | "scale";

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
}

const transforms: Record<RevealDirection, (distance: number) => string> = {
  up: (d) => `translateY(${d}px)`,
  down: (d) => `translateY(-${d}px)`,
  left: (d) => `translateX(${d}px)`,
  right: (d) => `translateX(-${d}px)`,
  none: () => "none",
  scale: () => "scale(0.92)",
};

export function RevealOnScroll({
  children,
  direction = "up",
  delay = 0,
  duration = DURATION.normal,
  distance = DISTANCE.md,
  className,
  as: Tag = "div",
  threshold = 0.15,
  once = true,
  stagger,
  staggerInterval = 100,
}: RevealOnScrollProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold, once });

  const computedDelay = stagger !== undefined ? stagger * staggerInterval : delay;

  const style: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate(0, 0) scale(1)" : transforms[direction](distance),
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
        transition: `transform ${DURATION.parallax}ms ${EASE.default} ${delay}ms`,
      }}
    />
  );
}
