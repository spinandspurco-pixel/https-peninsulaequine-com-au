import { useInView } from "./useInView";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** corner length in px. */
  size?: number;
  tone?: "bronze" | "charcoal";
  /** distance from edge in px. Default 0 (sits on edge). */
  inset?: number;
}

/**
 * Wraps a child with four 1px corner brackets — construction drawing crop marks.
 * Brackets draw on when scrolled into view.
 */
export function DraftCorners({
  children,
  className = "",
  size = 14,
  tone = "bronze",
  inset = 0,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const colour = tone === "bronze" ? "bg-accent/55" : "bg-foreground/30";
  const base = "absolute pointer-events-none";
  const hStyle = { width: size, transformOrigin: "left center" } as const;
  const vStyle = { height: size, transformOrigin: "top center" } as const;
  const dur = "900ms";
  const ease = "cubic-bezier(0.45,0,0.15,1)";
  const tx = inView ? "scaleX(1)" : "scaleX(0)";
  const ty = inView ? "scaleY(1)" : "scaleY(0)";
  const tr = `transform ${dur} ${ease}`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}
      {/* top-left */}
      <span aria-hidden className={`${base} h-px ${colour}`} style={{ top: inset, left: inset, ...hStyle, transform: tx, transition: tr }} />
      <span aria-hidden className={`${base} w-px ${colour}`} style={{ top: inset, left: inset, ...vStyle, transform: ty, transition: tr }} />
      {/* top-right */}
      <span aria-hidden className={`${base} h-px ${colour}`} style={{ top: inset, right: inset, ...hStyle, transformOrigin: "right center", transform: tx, transition: tr }} />
      <span aria-hidden className={`${base} w-px ${colour}`} style={{ top: inset, right: inset, ...vStyle, transform: ty, transition: tr }} />
      {/* bottom-left */}
      <span aria-hidden className={`${base} h-px ${colour}`} style={{ bottom: inset, left: inset, ...hStyle, transform: tx, transition: tr }} />
      <span aria-hidden className={`${base} w-px ${colour}`} style={{ bottom: inset, left: inset, ...vStyle, transformOrigin: "bottom center", transform: ty, transition: tr }} />
      {/* bottom-right */}
      <span aria-hidden className={`${base} h-px ${colour}`} style={{ bottom: inset, right: inset, ...hStyle, transformOrigin: "right center", transform: tx, transition: tr }} />
      <span aria-hidden className={`${base} w-px ${colour}`} style={{ bottom: inset, right: inset, ...vStyle, transformOrigin: "bottom center", transform: ty, transition: tr }} />
    </div>
  );
}
