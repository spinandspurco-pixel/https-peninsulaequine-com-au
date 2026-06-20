import { useEffect, useRef, useState } from "react";

/**
 * Single shared in-view hook for the Living Blueprint system.
 * Fires once when the element crosses the threshold, then disconnects.
 *
 * Keeps motion gated until the user has actually arrived at the section,
 * so the drawing sequence reads as intentional, not ambient.
 */
export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "-10% 0px", threshold: 0.15, ...options },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [inView, options]);

  return { ref, inView } as const;
}
