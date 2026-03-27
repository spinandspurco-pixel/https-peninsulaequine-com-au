/**
 * useScrollIntelligence — Subtle engagement-aware system
 *
 * Tracks scroll depth and interaction state to subtly adapt:
 * - CTA text evolves after deep engagement
 * - Reveal timing tightens after initial sections
 * - Engagement phase exposed for glow / opacity shifts
 *
 * Nothing obvious — user feels guided without knowing why.
 */

import { useEffect, useState, useCallback, useRef } from "react";

type EngagementPhase = "arriving" | "exploring" | "engaged";

interface ScrollIntelligence {
  /** Current engagement phase */
  phase: EngagementPhase;
  /** Number of viewport-heights scrolled */
  scrollDepths: number;
  /** Whether user has scrolled past N sections (rough: 1 section ≈ 1vh) */
  pastSections: (n: number) => boolean;
  /** Adaptive CTA label — evolves with engagement */
  ctaLabel: string;
  /** Engagement-aware reveal delay multiplier (1.0 → 0.7) */
  revealMultiplier: number;
}

export function useScrollIntelligence(): ScrollIntelligence {
  const [scrollDepths, setScrollDepths] = useState(0);
  const [phase, setPhase] = useState<EngagementPhase>("arriving");
  const rafId = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const depths = Math.floor(window.scrollY / vh);
        setScrollDepths(depths);

        if (depths >= 4) {
          setPhase("engaged");
        } else if (depths >= 2) {
          setPhase("exploring");
        } else {
          setPhase("arriving");
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const pastSections = useCallback(
    (n: number) => scrollDepths >= n,
    [scrollDepths]
  );

  // CTA text evolves subtly — shifts to exclusivity at deep engagement
  const ctaLabel =
    phase === "engaged"
      ? "Apply to Build"
      : phase === "exploring"
        ? "Start a Project"
        : "Start Your Project";

  // Reveal timing tightens after initial cinematic pacing
  const revealMultiplier =
    phase === "engaged" ? 0.65 : phase === "exploring" ? 0.8 : 1.0;

  return { phase, scrollDepths, pastSections, ctaLabel, revealMultiplier };
}
