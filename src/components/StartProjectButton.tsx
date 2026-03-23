import { Button } from "@/components/ui/button";
import { useIntake } from "@/hooks/useIntake";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  className?: string;
  variant?: "default" | "outline";
}

export function StartProjectButton({
  label = "Start Your Project",
  className,
  variant = "default",
}: Props) {
  const { open } = useIntake();

  if (variant === "outline") {
    return (
      <Button
        variant="outline"
        onClick={open}
        className={cn("uppercase tracking-[0.1em] text-xs", className)}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      onClick={open}
      className={cn(
        "bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift",
        className
      )}
    >
      {label} <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
