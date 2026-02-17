import { useState, useEffect, useRef, useCallback } from "react";

// ── Performance budget thresholds (ms) ──────────────────────
const PERF_BUDGET = {
  good: 2000,   // under 2s = green
  fair: 4000,   // under 4s = yellow
  // above 4s = red
};

export type LoadStage = "idle" | "loading" | "canplay" | "ready";

export interface HeroMediaMetrics {
  stage: LoadStage;
  loadTimeMs: number | null;
  videosReady: boolean[];
  budgetStatus: "good" | "fair" | "over";
}

/**
 * Hook that manages progressive loading for hero background videos.
 * - Defers video source injection until after first paint
 * - Tracks individual video readiness
 * - Measures total load time against a performance budget
 */
export function useHeroMediaLoader(
  videoRefs: React.RefObject<HTMLVideoElement | null>[],
  videoSrcs: string[],
  onAllReady: () => void,
) {
  const [stage, setStage] = useState<LoadStage>("idle");
  const [videosReady, setVideosReady] = useState<boolean[]>(() => videoSrcs.map(() => false));
  const [loadTimeMs, setLoadTimeMs] = useState<number | null>(null);
  const startRef = useRef<number>(0);
  const firedRef = useRef(false);

  // Phase 1: After first paint, set sources and begin loading
  useEffect(() => {
    // Use requestIdleCallback (or setTimeout fallback) to defer video loading
    const start = () => {
      startRef.current = performance.now();
      setStage("loading");

      videoRefs.forEach((ref, i) => {
        const video = ref.current;
        if (!video) return;

        // Only set source if not already set
        if (!video.src && !video.querySelector("source")) {
          const source = document.createElement("source");
          source.src = videoSrcs[i];
          source.type = "video/mp4";
          video.appendChild(source);
          video.load();
        }
      });
    };

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(start, { timeout: 200 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const id = setTimeout(start, 50);
      return () => clearTimeout(id);
    }
  }, [videoRefs, videoSrcs]);

  // Track individual video canplay events
  const handleCanPlay = useCallback((idx: number) => {
    setVideosReady((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  }, []);

  // Attach canplay listeners
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    videoRefs.forEach((ref, i) => {
      const video = ref.current;
      if (!video) return;
      const handler = () => handleCanPlay(i);
      video.addEventListener("canplay", handler, { once: true });
      cleanups.push(() => video.removeEventListener("canplay", handler));

      // If already ready
      if (video.readyState >= 3) handleCanPlay(i);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [videoRefs, handleCanPlay]);

  // When all videos ready, finalize metrics
  useEffect(() => {
    if (videosReady.every(Boolean) && !firedRef.current) {
      firedRef.current = true;
      const elapsed = performance.now() - startRef.current;
      setLoadTimeMs(elapsed);
      setStage("ready");
      onAllReady();
    }
  }, [videosReady, onAllReady]);

  const budgetStatus: HeroMediaMetrics["budgetStatus"] =
    loadTimeMs === null
      ? "good"
      : loadTimeMs <= PERF_BUDGET.good
        ? "good"
        : loadTimeMs <= PERF_BUDGET.fair
          ? "fair"
          : "over";

  return { stage, videosReady, loadTimeMs, budgetStatus } satisfies HeroMediaMetrics;
}
