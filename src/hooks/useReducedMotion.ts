import { useState, useEffect } from "react";

/**
 * Hook that detects if the user prefers reduced motion
 * Returns true if the user has enabled "Reduce motion" in their OS/browser settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return false;
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Listen for changes to the preference
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
