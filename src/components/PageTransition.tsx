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

    // Fade out
    setPhase("fade-out");

    const swapTimer = setTimeout(() => {
      window.scrollTo(0, 0);
      setDisplayChildren(children);
      setPhase("fade-in");
    }, 400);

    const doneTimer = setTimeout(() => {
      setPhase("idle");
    }, 900);

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
        transform: phase === "fade-out" ? "scale(0.995)" : phase === "fade-in" ? "scale(1)" : "none",
        transition: phase === "idle" ? "none" : phase === "fade-out"
          ? "opacity 400ms cubic-bezier(0.4, 0, 1, 1), transform 400ms cubic-bezier(0.4, 0, 1, 1)"
          : "opacity 500ms cubic-bezier(0, 0, 0.2, 1), transform 500ms cubic-bezier(0, 0, 0.2, 1)",
      }}
    >
      {displayChildren}
    </div>
  );
}
