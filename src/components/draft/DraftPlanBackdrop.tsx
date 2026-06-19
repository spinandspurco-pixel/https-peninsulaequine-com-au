interface Props {
  className?: string;
  /** opacity 0–1. Defaults very subtle. */
  opacity?: number;
  drift?: boolean;
}

/**
 * Faint construction-drawing plan grid backdrop.
 * Charcoal cross-hatch with very low opacity, optional slow drift.
 * pointer-events-none — purely decorative.
 */
export function DraftPlanBackdrop({
  className = "",
  opacity = 0.5,
  drift = true,
}: Props) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none bg-plan-lines ${
        drift ? "animate-plan-drift-x" : ""
      } ${className}`}
      style={{ opacity }}
    />
  );
}
