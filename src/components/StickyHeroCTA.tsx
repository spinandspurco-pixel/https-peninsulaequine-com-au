import { useState, useEffect, useCallback } from "react";
import { CalendarIcon, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyHeroCTAProps {
  /** Pixel threshold after which the bar appears */
  showAfter?: number;
  onCtaClick: () => void;
  /** 0–100 progress value for the lead-capture ring */
  progress?: number;
  progressLabel?: string;
}

export function StickyHeroCTA({
  showAfter = 400,
  onCtaClick,
  progress = 0,
  progressLabel = "spots filled",
}: StickyHeroCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  // SVG ring values
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-primary/95 backdrop-blur-md border-b border-accent/20 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Progress ring + label */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0 w-10 h-10">
              <svg
                className="w-10 h-10 -rotate-90"
                viewBox="0 0 40 40"
                aria-hidden="true"
              >
                {/* Track */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--accent) / 0.15)"
                  strokeWidth="3"
                />
                {/* Progress */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent">
                {progress}%
              </span>
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs text-primary-foreground/60 truncate">
                This month
              </p>
              <p className="text-sm font-medium text-primary-foreground truncate">
                <Sparkles className="inline h-3 w-3 text-accent mr-1" />
                {progress}% {progressLabel}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onCtaClick}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium",
              "bg-accent text-accent-foreground hover:bg-accent/90",
              "transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_16px_hsl(var(--accent)/0.4)]",
              "whitespace-nowrap flex-shrink-0"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden xs:inline">Book a Lesson</span>
            <span className="xs:hidden">Book</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
