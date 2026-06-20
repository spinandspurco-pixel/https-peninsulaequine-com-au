import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Cinematic page transition — smooth fade with subtle scale.
 * Luxurious and controlled, no harsh wipes.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"idle" | "fade-out" | "fade-in">("idle");
  const prevPath = useRef(location.pathname);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPath.current = location.pathname;
      return;
    }

    if (location.pathname === prevPath.current) {
      setDisplayChildren(children);
      return;
    }

    prevPath.current = location.pathname;

    if (prefersReducedMotion) {
      setDisplayChildren(children);
      return;
    }

    // Fade out — quick token (--bp-quick = 420ms), shaved to 360ms for swap headroom
    setPhase("fade-out");

    const swapTimer = setTimeout(() => {
      window.scrollTo(0, 0);
      setDisplayChildren(children);
      setPhase("fade-in");
    }, 360);

    // Resolve — --bp-resolve = 900ms
    const doneTimer = setTimeout(() => {
      setPhase("idle");
    }, 1260);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(doneTimer);
    };
  }, [location.pathname, prefersReducedMotion]);

  useEffect(() => {
    if (phase === "idle" && location.pathname === prevPath.current) {
      setDisplayChildren(children);
    }
  }, [children]);

  return (
    <div
      className="relative"
      style={{
        opacity: phase === "fade-out" ? 0 : 1,
        transform:
          phase === "fade-out"
            ? "scale(0.997)"
            : phase === "fade-in"
              ? "scale(1)"
              : "none",
        transition:
          phase === "idle"
            ? "none"
            : phase === "fade-out"
              ? "opacity 360ms var(--bp-ease-draw), transform 360ms var(--bp-ease-draw)"
              : "opacity var(--bp-resolve) var(--bp-ease-settle), transform var(--bp-resolve) var(--bp-ease-settle)",
      }}
    >
      {displayChildren}
    </div>
  );
}
