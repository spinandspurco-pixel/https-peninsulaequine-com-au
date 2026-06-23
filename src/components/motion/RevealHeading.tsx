import { ElementType, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  /** Stagger between word reveals (ms). Default 60ms. */
  stagger?: number;
  /** Per-word duration (ms). Default 900ms. */
  duration?: number;
};

/**
 * Splits a heading string into word spans that fade + rise as the
 * heading enters the viewport. Pure CSS transforms, no layout shift —
 * each word is inline-block with a leading non-breaking glue.
 */
export function RevealHeading({
  children,
  as: Tag = "h2",
  className,
  stagger = 60,
  duration = 900,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const reduce = useReducedMotion();

  const words = useMemo(() => children.split(/(\s+)/), [children]);

  useEffect(() => {
    if (reduce) {
      setActive(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <Tag ref={ref as never} className={className} aria-label={children}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
        const idx = Math.floor(i / 2);
        return (
          <span
            key={i}
            aria-hidden="true"
            className={cn("inline-block")}
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(16px)",
              transition: reduce
                ? "none"
                : `opacity ${duration}ms cubic-bezier(0.45,0,0.15,1), transform ${duration}ms cubic-bezier(0.45,0,0.15,1)`,
              transitionDelay: reduce ? "0ms" : `${idx * stagger}ms`,
              willChange: active ? "auto" : "opacity, transform",
            }}
          >
            {w}
          </span>
        );
      })}
    </Tag>
  );
}
