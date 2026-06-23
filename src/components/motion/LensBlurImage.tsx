import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  /** Wrapper className (the <img> still receives className). */
  wrapperClassName?: string;
  /** Blur intensity in px. Default 18. */
  blurPx?: number;
};

/**
 * Drop-in <img> wrapper that lens-blurs in as the element enters the viewport.
 * Honours prefers-reduced-motion (resolves immediately to crisp).
 */
export function LensBlurImage({
  wrapperClassName,
  blurPx = 18,
  className,
  onLoad,
  style,
  ...img
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setRevealed(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const active = revealed && loaded;
  const blur = reduce ? 0 : active ? 0 : blurPx;
  const sat = active ? 1 : 0.65;

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden", wrapperClassName)}>
      <img
        {...img}
        className={cn("block w-full h-full", className)}
        style={{
          ...style,
          filter: `blur(${blur}px) saturate(${sat})`,
          transform: active ? "scale(1)" : "scale(1.04)",
          transition: reduce
            ? "none"
            : "filter 1100ms cubic-bezier(0.45,0,0.15,1), transform 1400ms cubic-bezier(0.45,0,0.15,1)",
          willChange: active ? "auto" : "filter, transform",
        }}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </div>
  );
}
