import { ReactNode } from "react";
import { useHqMode } from "@/hooks/useHqMode";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  children: ReactNode;
  /** Reason shown on hover when locked. */
  reason?: string;
  /** Force locked regardless of mode. */
  locked?: boolean;
}

/**
 * Disables interactive children when HQ is in client-preview mode.
 * The underlying element remains rendered (so the layout doesn't shift)
 * but pointer events are blocked and a tooltip explains the lock.
 */
export function WriteGuard({ children, reason = "View-only in client preview", locked }: Props) {
  const { isPreview } = useHqMode();
  const isLocked = isPreview || locked;

  if (!isLocked) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-disabled
            className="inline-block opacity-40 pointer-events-none select-none"
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="font-mono text-[10px] uppercase tracking-[0.2em] bg-background border-accent/20 text-muted-foreground/70"
        >
          {reason}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
