import { useEffect, useRef } from "react";

/**
 * Attaches a radial spotlight that follows the cursor on dark sections.
 * Uses direct DOM manipulation for zero React re-renders.
 */
export function useCursorSpotlight(
  containerRef: React.RefObject<HTMLElement | null>,
  options: { radius?: number; opacity?: number; color?: string } = {}
) {
  const { radius = 350, opacity = 0.07 } = options;
  const spotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Ensure container has relative/absolute positioning
    const pos = getComputedStyle(container).position;
    if (pos === "static") container.style.position = "relative";

    // Create spotlight element
    const spot = document.createElement("div");
    spot.style.position = "absolute";
    spot.style.width = `${radius * 2}px`;
    spot.style.height = `${radius * 2}px`;
    spot.style.borderRadius = "50%";
    spot.style.background = `radial-gradient(circle, hsl(${color} / ${opacity}) 0%, transparent 70%)`;
    spot.style.pointerEvents = "none";
    spot.style.transform = "translate(-50%, -50%)";
    spot.style.opacity = "0";
    spot.style.transition = "opacity 0.4s ease";
    spot.style.zIndex = "1";
    spot.style.willChange = "left, top";
    container.appendChild(spot);
    spotRef.current = spot;

    let raf: number;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      raf = requestAnimationFrame(() => {
        spot.style.left = `${x}px`;
        spot.style.top = `${y}px`;
      });
    };

    const onEnter = () => {
      spot.style.opacity = "1";
    };

    const onLeave = () => {
      spot.style.opacity = "0";
    };

    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      spot.remove();
    };
  }, [containerRef, radius, opacity, color]);
}
