import * as React from "react";
import { useInView } from "./useInView";

/**
 * Four drafting brackets that pin into the corners of a container.
 * Use as a non-intrusive frame around content blocks that need to
 * read as a captured drawing rather than a generic card.
 */
export function CornerBrackets({
  size = 14,
  inset = 0,
  tone = "bronze",
  className = "",
  children,
}: {
  size?: number;
  inset?: number;
  tone?: "bronze" | "muted";
  className?: string;
  children?: React.ReactNode;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const stroke =
    tone === "bronze" ? "border-accent/60" : "border-foreground/25";

  const corner = (cls: string, xy: { x: string; y: string }) => (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${cls} bp-bracket`}
      style={
        {
          width: size,
          height: size,
          "--bp-bracket-x": xy.x,
          "--bp-bracket-y": xy.y,
        } as React.CSSProperties
      }
    />
  );

  return (
    <div
      ref={ref}
      data-bp-armed={String(inView)}
      className={`relative ${className}`}
    >
      {corner(`border-l border-t ${stroke} top-0 left-0`, { x: "-3px", y: "-3px" })}
      {corner(`border-r border-t ${stroke} top-0 right-0`, { x: "3px", y: "-3px" })}
      {corner(`border-l border-b ${stroke} bottom-0 left-0`, { x: "-3px", y: "3px" })}
      {corner(`border-r border-b ${stroke} bottom-0 right-0`, { x: "3px", y: "3px" })}
      <div style={{ padding: inset }}>{children}</div>
    </div>
  );
}
