import * as React from "react";
import { useInView } from "./useInView";

/**
 * Section marker — drawing-sheet number, overline label and bronze
 * hairline arriving as a single unit. Replaces ad-hoc overline +
 * heading pairs across the public site.
 */
export function ChapterMark({
  sheet,
  label,
  align = "left",
  className = "",
}: {
  sheet?: string;
  label: string;
  align?: "left" | "center";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const justify = align === "center" ? "justify-center text-center" : "";

  return (
    <div
      ref={ref}
      data-bp-armed={String(inView)}
      className={`flex flex-col gap-3 ${justify} ${className}`}
    >
      <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        {sheet && (
          <span className="bp-mark font-mono text-[10px] uppercase tracking-[0.45em] text-accent/70">
            {sheet}
          </span>
        )}
        <div
          className="bp-rule bp-delay-1 h-px bg-gradient-to-r from-accent/45 via-accent/15 to-transparent"
          style={{ width: align === "center" ? 72 : 56 }}
        />
      </div>
      <div className="bp-mark bp-delay-2 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/55">
        {label}
      </div>
    </div>
  );
}
