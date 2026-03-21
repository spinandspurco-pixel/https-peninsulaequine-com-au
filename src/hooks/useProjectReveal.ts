import { useRef, useState, useEffect } from "react";
import { revealStyle, STAGGER } from "@/lib/motion";

/**
 * useProjectReveal — Projects-page IntersectionObserver hook
 * that returns a ref and style object using the unified motion system.
 *
 * Respects prefers-reduced-motion globally via CSS (index.css).
 */
export function useProjectReveal(opts: {
  threshold?: number;
  delay?: number;
  staggerIndex?: number;
  distance?: number;
  duration?: number;
  direction?: "up" | "down" | "none";
} = {}) {
  const {
    threshold = 0.15,
    delay = 0,
    staggerIndex,
    distance,
    duration,
    direction,
  } = opts;

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const computedDelay =
    staggerIndex !== undefined ? staggerIndex * STAGGER.card + delay : delay;

  const style = revealStyle(visible, {
    delay: computedDelay,
    distance,
    duration,
    direction,
  });

  return { ref, style, visible };
}
