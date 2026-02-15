import { useCallback, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Plays a subtle horse neigh + hooves sound effect for form completion celebration.
 * Respects reduced motion preferences and keeps volume low for subtlety.
 */
export function useCelebrationSound() {
  const prefersReducedMotion = useReducedMotion();
  const hasPlayedRef = useRef(false);

  const playCelebration = useCallback(() => {
    // Skip if reduced motion is preferred or already played this session
    if (prefersReducedMotion || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    try {
      // Play horse neigh at low volume
      const neigh = new Audio("/sounds/horse-neigh.mp3");
      neigh.volume = 0.25;
      neigh.play().catch(() => {
        // Silently fail if autoplay is blocked
      });

      // Play hooves slightly delayed for a layered effect
      setTimeout(() => {
        const hooves = new Audio("/sounds/horse-hooves.mp3");
        hooves.volume = 0.15;
        hooves.play().catch(() => {});
      }, 300);
    } catch {
      // Audio not supported — fail silently
    }
  }, [prefersReducedMotion]);

  const reset = useCallback(() => {
    hasPlayedRef.current = false;
  }, []);

  return { playCelebration, reset };
}
