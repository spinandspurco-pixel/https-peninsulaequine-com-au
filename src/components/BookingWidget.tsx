import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_OPTIONS = [
  { value: "beginner", label: "Foundation Lesson", price: "$95", time: "45 min" },
  { value: "intermediate", label: "Development Lesson", price: "$120", time: "60 min" },
  { value: "advanced", label: "Performance Lesson", price: "$150", time: "60 min" },
];

interface BookingWidgetProps {
  /** Visual style */
  variant?: "hero" | "inline" | "card";
  /** Pre-select a specific option */
  defaultOption?: string;
  className?: string;
}

export function BookingWidget({ variant = "inline", defaultOption, className }: BookingWidgetProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(defaultOption || "");

  const handleBook = () => {
    if (selected) {
      navigate(`/book-lesson?type=${selected}`);
    } else {
      navigate("/book-lesson");
    }
  };

  if (variant === "hero") {
    return (
      <div className={cn("mt-8", className)}>
        {/* Compact pill selector */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-4">
          {QUICK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
                selected === opt.value
                  ? "bg-accent text-accent-foreground border-accent shadow-md scale-105"
                  : "bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 hover:border-white/40"
              )}
            >
              {opt.label}
              <span className="ml-1.5 opacity-70">· {opt.price}</span>
            </button>
          ))}
        </div>

        {/* Book now CTA */}
        <div>
          <button
            onClick={handleBook}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm tracking-wider uppercase",
              "transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
              selected
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : "bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-primary"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {selected ? "Book Now" : "Book a Lesson"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Card variant for services page sidebar
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 card-hover-glow",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-accent" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-foreground">Quick Book</h3>
      </div>

      <div className="space-y-2 mb-5">
        {QUICK_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 border",
              selected === opt.value
                ? "bg-accent/10 border-accent text-foreground"
                : "bg-background border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
            )}
          >
            <span className="font-medium">{opt.label}</span>
            <span className="flex items-center gap-2 text-xs">
              <span className="text-accent font-semibold">{opt.price}</span>
              <span className="opacity-60">· {opt.time}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleBook}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm",
          "transition-all duration-300",
          selected
            ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-md"
            : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-foreground"
        )}
      >
        <CalendarIcon className="h-4 w-4" />
        {selected ? "Book Now" : "Select & Book"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
