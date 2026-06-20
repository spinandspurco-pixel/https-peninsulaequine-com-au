import * as React from "react";
import { useInView } from "./useInView";

/**
 * SVG hairline that draws in on enter. Use for chapter dividers,
 * accent rules under headings, and any place a single confident
 * line should appear to be drawn by a drafting pen.
 */
export function BlueprintLineDraw({
  length = 120,
  thickness = 1,
  tone = "bronze",
  className = "",
  delayMs = 0,
}: {
  length?: number;
  thickness?: number;
  tone?: "bronze" | "muted";
  className?: string;
  delayMs?: number;
}) {
  const { ref, inView } = useInView<SVGSVGElement>();
  const stroke =
    tone === "bronze" ? "hsl(var(--accent) / 0.55)" : "hsl(var(--foreground) / 0.3)";

  return (
    <svg
      ref={ref}
      data-bp-armed={String(inView)}
      width={length}
      height={Math.max(thickness, 2)}
      viewBox={`0 0 ${length} ${Math.max(thickness, 2)}`}
      className={className}
      aria-hidden
    >
      <line
        x1="0"
        y1={Math.max(thickness, 2) / 2}
        x2={length}
        y2={Math.max(thickness, 2) / 2}
        stroke={stroke}
        strokeWidth={thickness}
        className="bp-line"
        style={
          {
            "--bp-dash": length,
            animationDelay: `${delayMs}ms`,
          } as React.CSSProperties
        }
      />
    </svg>
  );
}
