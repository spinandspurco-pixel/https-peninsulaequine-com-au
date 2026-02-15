import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BlueprintBackgroundProps {
  image: string;
  opacity?: number;
  className?: string;
  direction?: "left-to-right" | "right-to-left" | "bottom-to-top";
  duration?: number;
  /** Parallax speed: 0 = static, 0.1 = subtle, 0.3 = noticeable */
  parallaxSpeed?: number;
}

export function BlueprintBackground({
  image,
  opacity = 0.06,
  className = "",
  direction = "left-to-right",
  duration = 1500,
  parallaxSpeed = 0.08,
}: BlueprintBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Parallax scroll tracking
  useEffect(() => {
    if (prefersReducedMotion || parallaxSpeed === 0) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const vh = window.innerHeight;
            const center = rect.top + rect.height / 2;
            const offset = (center - vh / 2) * parallaxSpeed;
            setParallaxY(offset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallaxSpeed, prefersReducedMotion]);

  const clipPathHidden = {
    "left-to-right": "inset(0 100% 0 0)",
    "right-to-left": "inset(0 0 0 100%)",
    "bottom-to-top": "inset(100% 0 0 0)",
  }[direction];

  return (
    <div
      ref={ref}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        style={{
          opacity: isRevealed ? opacity : 0,
          clipPath: isRevealed ? "inset(0 0 0 0)" : clipPathHidden,
          transform: prefersReducedMotion
            ? "scale(1.05)"
            : `translateY(${parallaxY}px) scale(1.05)`,
          transition: prefersReducedMotion
            ? "none"
            : `clip-path ${duration}ms ease-out, opacity ${duration * 0.6}ms ease-out`,
          willChange: isRevealed ? "auto" : "clip-path",
        }}
      />
    </div>
  );
}
