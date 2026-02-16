import { useState, useEffect, useRef, RefObject } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { useParallaxDepthStore } from "@/stores/parallaxDepthStore";

interface ParallaxOptions {
  speed?: number; // 0.1 = slow, 0.5 = medium, 1 = same as scroll
  direction?: "up" | "down";
  disabled?: boolean;
}

export function useParallax<T extends HTMLElement>(
  options: ParallaxOptions = {}
): { ref: RefObject<T>; offset: number } {
  const { speed = 0.3, direction = "up", disabled = false } = options;
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const depthEnabled = useParallaxDepthStore((s) => s.enabled);

  useEffect(() => {
    // Disable parallax when toggled off or OS reduced-motion is on
    if (disabled || prefersReducedMotion || !depthEnabled) return;

    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from the center of the viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Calculate parallax offset
      const parallaxOffset = distanceFromCenter * speed * (direction === "up" ? 1 : -1);
      
      setOffset(parallaxOffset);
    };

    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", onScroll);
  }, [speed, direction, disabled, prefersReducedMotion, depthEnabled]);

  return { ref, offset };
}

// Hook for parallax background images
export function useBackgroundParallax(speed: number = 0.5): {
  ref: RefObject<HTMLDivElement>;
  style: React.CSSProperties;
} {
  const { ref, offset } = useParallax<HTMLDivElement>({ speed });
  const prefersReducedMotion = useReducedMotion();
  const depthEnabled = useParallaxDepthStore((s) => s.enabled);

  return {
    ref,
    style: (prefersReducedMotion || !depthEnabled)
      ? {} 
      : {
          transform: `translateY(${offset}px)`,
          willChange: "transform",
        },
  };
}
