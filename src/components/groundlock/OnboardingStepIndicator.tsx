import { CheckCircle2 } from "lucide-react";

interface Props {
  steps: string[];
  currentStep: number;
}

export function OnboardingStepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;

        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-2">
            {/* Dot / Check */}
            <div className="flex items-center gap-0 w-full">
              {i > 0 && (
                <div className={`flex-1 h-px transition-colors duration-500 ${done ? "bg-accent/40" : "bg-border/30"}`} />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  done
                    ? "bg-accent/15 text-accent"
                    : active
                    ? "border-2 border-accent/40 text-accent/60"
                    : "border border-border/30 text-muted-foreground/20"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <span className="text-[10px] font-mono">{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px transition-colors duration-500 ${done ? "bg-accent/40" : "bg-border/30"}`} />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-mono uppercase tracking-[0.15em] transition-colors duration-500 ${
                done || active ? "text-accent/60" : "text-muted-foreground/25"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
