import { useRef, useState, useEffect, useCallback } from "react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  labelClassName?: string;
  label: string;
}

/**
 * Counts from 0 → end when scrolled into view.
 * Uses easeOutExpo for a sharp start that decelerates — feels premium.
 */
export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  className,
  labelClassName,
  label,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const triggered = useRef(false);

  const animate = useCallback(() => {
    if (triggered.current) return;
    triggered.current = true;

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * end));

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [end, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, end]);

  return (
    <div ref={ref} className="text-center">
      <p className={className ?? "font-serif text-4xl sm:text-5xl font-bold text-accent"}>
        {prefix}{value}{suffix}
      </p>
      <p className={labelClassName ?? "text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2 font-sans"}>
        {label}
      </p>
    </div>
  );
}
