import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/* ─── Grid layout presets ───────────────────────────── */

const columnPresets = {
  /** 1 → 2 → 3 columns */
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  /** 1 → 2 → 4 columns */
  "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  /** 1 → 2 columns */
  "2": "grid-cols-1 sm:grid-cols-2",
  /** 1 → 2 → 3 → 5 columns (compact grids) */
  "5": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
} as const;

const gapPresets = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
} as const;

interface CardGridProps {
  /** Number of columns at the widest breakpoint */
  columns?: keyof typeof columnPresets;
  /** Gap size between cards */
  gap?: keyof typeof gapPresets;
  /** Additional class names */
  className?: string;
  children: ReactNode;
}

/**
 * Responsive grid wrapper for cards.
 *
 * ```tsx
 * <CardGrid columns="3" gap="md">
 *   <ContentCard … />
 *   <ContentCard … />
 * </CardGrid>
 * ```
 */
export function CardGrid({
  columns = "3",
  gap = "md",
  className,
  children,
}: CardGridProps) {
  return (
    <div
      className={cn(
        "grid",
        columnPresets[columns],
        gapPresets[gap],
        className,
      )}
    >
      {children}
    </div>
  );
}
