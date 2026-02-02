import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If user prefers reduced motion, skip the transition
    if (prefersReducedMotion) {
      setDisplayChildren(children);
      setIsVisible(true);
      return;
    }

    // Start fade out
    setIsVisible(false);
    
    // After fade out, swap content and fade in
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150); // Match the CSS transition duration

    return () => clearTimeout(timeout);
  }, [location.pathname, prefersReducedMotion]);

  // Initial mount - fade in immediately
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), prefersReducedMotion ? 0 : 50);
    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  return (
    <div
      className={`${
        prefersReducedMotion 
          ? "" 
          : `transition-opacity duration-300 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`
      }`}
    >
      {displayChildren}
    </div>
  );
}
