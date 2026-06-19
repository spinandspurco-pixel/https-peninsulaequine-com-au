import { useInView } from "./useInView";

interface Props {
  count?: number;
  className?: string;
  /** every Nth tick is taller, like a ruler. Default 4. */
  majorEvery?: number;
}

/**
 * Row of subtle bronze measurement ticks. Staggers in on scroll.
 */
export function DraftTicks({
  count = 8,
  className = "",
  majorEvery = 4,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      aria-hidden
      className={`flex items-end gap-[6px] h-3 ${inView ? "draft-in" : ""} ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const major = i % majorEvery === 0;
        return (
          <span
            key={i}
            className={`draft-tick block w-px ${
              major ? "h-3 bg-accent/55" : "h-2 bg-accent/30"
            }`}
          />
        );
      })}
    </div>
  );
}
