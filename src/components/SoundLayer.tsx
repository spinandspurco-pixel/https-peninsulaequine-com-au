/**
 * SoundLayer — Global sound integration
 *
 * Listens for:
 * - Button/link clicks → metallic tick
 * - Route changes → soft whoosh
 * - Key element hovers → faint tone (gold buttons only)
 *
 * All sounds are barely perceptible. Silent fallback if blocked.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSoundSystem } from "@/hooks/useSoundSystem";

export function SoundLayer() {
  const { tick, whoosh, tone } = useSoundSystem();
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Route change → whoosh
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      whoosh();
      prevPath.current = location.pathname;
    }
  }, [location.pathname, whoosh]);

  // Global click delegation → tick on buttons/links
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [role='button']");
      if (interactive) tick();
    };

    document.addEventListener("click", handler, { passive: true });
    return () => document.removeEventListener("click", handler);
  }, [tick]);

  // Hover on gold CTA buttons only → faint tone
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const goldBtn = target.closest("[class*='bg-accent']");
      if (goldBtn && goldBtn.matches("button, a, [role='button']")) {
        tone();
      }
    };

    document.addEventListener("mouseenter", handler, { passive: true, capture: true });
    return () => document.removeEventListener("mouseenter", handler, { capture: true });
  }, [tone]);

  return null;
}
