import { create } from "zustand";

interface ParallaxDepthState {
  /** true = parallax enabled even when OS reduced-motion is off */
  enabled: boolean;
  toggle: () => void;
}

const STORAGE_KEY = "pe-parallax-depth";

function readInitial(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "1";
  } catch {}
  // Default: enabled unless OS prefers reduced motion
  if (typeof window !== "undefined") {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return true;
}

export const useParallaxDepthStore = create<ParallaxDepthState>((set) => ({
  enabled: readInitial(),
  toggle: () =>
    set((s) => {
      const next = !s.enabled;
      try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch {}
      return { enabled: next };
    }),
}));
