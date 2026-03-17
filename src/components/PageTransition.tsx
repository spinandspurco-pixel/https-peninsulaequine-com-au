import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Cinematic page transition using clip-path mask wipe.
 * Sequence: overlay wipe in → swap content → overlay wipe out.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"idle" | "wipe-in" | "wipe-out">("idle");
  const prevPath = useRef(location.pathname);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // First mount — show immediately
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPath.current = location.pathname;
      return;
    }

    // Same path — no transition
    if (location.pathname === prevPath.current) {
      setDisplayChildren(children);
      return;
    }

    prevPath.current = location.pathname;

    if (prefersReducedMotion) {
      setDisplayChildren(children);
      return;
    }

    // Wipe-in overlay
    setPhase("wipe-in");

    const swapTimer = setTimeout(() => {
      setDisplayChildren(children);
      setPhase("wipe-out");
    }, 350);

    const doneTimer = setTimeout(() => {
      setPhase("idle");
    }, 750);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(doneTimer);
    };
  }, [location.pathname, prefersReducedMotion]);

  // Update children in place when path hasn't changed
  useEffect(() => {
    if (phase === "idle" && location.pathname === prevPath.current) {
      setDisplayChildren(children);
    }
  }, [children]);

  return (
    <div className="relative">
      {displayChildren}

      {/* Transition overlay — wipes across the screen */}
      {phase !== "idle" && (
        <div
          className="fixed inset-0 z-[9998] pointer-events-none bg-primary"
          style={{
            clipPath:
              phase === "wipe-in"
                ? "inset(0 0 0 0)"
                : "inset(0 0 100% 0)",
            transition:
              phase === "wipe-in"
                ? "clip-path 350ms cubic-bezier(0.65, 0, 0.35, 1)"
                : "clip-path 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Gold accent line that leads the wipe */}
          <div
            className="absolute left-0 right-0 h-[2px] bg-accent"
            style={{
              top: phase === "wipe-in" ? "100%" : "0%",
              transition: "top 350ms cubic-bezier(0.65, 0, 0.35, 1)",
              boxShadow: "0 0 20px 4px hsl(var(--accent) / 0.4)",
            }}
          />
        </div>
      )}
    </div>
  );
}
