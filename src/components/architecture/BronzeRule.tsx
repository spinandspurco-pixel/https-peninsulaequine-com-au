import * as React from "react";
import { useInView } from "./useInView";

/**
 * Public bronze hairline. Resolves from the left when it enters view,
 * with an optional drafting tick and monospace label. Mirrors the HQ
 * BronzeRule so the public and internal surfaces speak the same language.
 */
export function BronzeRule({
  label,
  align = "left",
  variant = "resolve",
  className = "",
}: {
  label?: string;
  align?: "left" | "right";
  variant?: "resolve" | "static";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const armed = variant === "static" ? "true" : String(inView);

  return (
    <div
      ref={ref}
      data-bp-armed={armed}
      className={`flex items-center gap-3 ${className}`}
    >
      {align === "left" && (
        <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 bp-bracket" />
      )}
      <div
        className={`flex-1 h-px bg-gradient-to-r ${
          align === "left"
            ? "from-accent/40 via-accent/15 to-transparent"
            : "from-transparent via-accent/15 to-accent/40"
        } ${variant === "resolve" ? "bp-rule" : ""}`}
      />
      {label && (
        <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/55 whitespace-nowrap">
          {label}
        </span>
      )}
      {align === "right" && (
        <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 bp-bracket" />
      )}
    </div>
  );
}
