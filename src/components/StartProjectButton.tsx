import { Button } from "@/components/ui/button";
import { useIntake } from "@/hooks/useIntake";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollIntelligence } from "@/hooks/useScrollIntelligence";

interface Props {
  label?: string;
  className?: string;
  variant?: "default" | "outline";
}

export function StartProjectButton({
  label,
  className,
  variant = "default",
}: Props) {
  const { open } = useIntake();
  const { phase, ctaLabel } = useScrollIntelligence();

  const displayLabel = label || ctaLabel;

  // Subtle glow when user is engaged
  const engagedGlow =
    phase === "engaged"
      ? "shadow-[0_0_18px_-4px_hsl(var(--accent)/0.35)]"
      : phase === "exploring"
        ? "shadow-[0_0_12px_-4px_hsl(var(--accent)/0.18)]"
        : "";

  // Opacity evolution: muted → full presence
  const opacityShift =
    phase === "engaged"
      ? "opacity-100"
      : phase === "exploring"
        ? "opacity-95"
        : "opacity-80";

  if (variant === "outline") {
    return (
      <Button
        variant="outline"
        onClick={open}
        className={cn(
          "uppercase tracking-[0.1em] text-xs transition-all ease-in-out",
          opacityShift,
          className
        )}
        style={{ transitionDuration: "600ms" }}
      >
        {displayLabel}
      </Button>
    );
  }

  return (
    <Button
      onClick={open}
      className={cn(
        "bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift",
        "transition-all ease-in-out",
        opacityShift,
        engagedGlow,
        className
      )}
      style={{ transitionDuration: "600ms" }}
    >
      {displayLabel} <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );

}
