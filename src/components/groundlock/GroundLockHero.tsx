/**
 * GroundLockHero — Canonical single-panel visual
 *
 * ONE component used everywhere a standalone GroundLock panel
 * needs to appear. Eliminates duplicate inline SVGs.
 */

import { cn } from "@/lib/utils";
import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";

interface GroundLockHeroProps {
  className?: string;
  /** Max width class — default "max-w-[180px]" */
  size?: string;
  /** Overall opacity — default 0.75 */
  opacity?: number;
  /** Show subtle perspective tilt — for page heroes */
  perspective?: boolean;
}

const DEFS_ID = "glh";

export function GroundLockHero({
  className,
  size = "max-w-[180px]",
  opacity = 0.75,
  perspective = false,
}: GroundLockHeroProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={perspective ? {
        transform: "perspective(800px) rotateY(-6deg) rotateX(4deg)",
        filter: "drop-shadow(0 20px 40px hsl(var(--accent) / 0.12))",
      } : undefined}
    >
      <svg
        viewBox="0 0 100 110"
        className={cn("w-full h-auto", size)}
        style={{ opacity }}
        aria-label="GroundLock horseshoe panel"
      >
        <PanelDefs id={DEFS_ID} />
        <GroundLockPanelSVG active showTabs showJoins defsId={DEFS_ID} direction="up" />
      </svg>
    </div>
  );
}
