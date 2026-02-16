import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const SAMPLE_ESTIMATES = [
  {
    service: "Arena Construction",
    range: "$25k – $55k",
    includes: "Base prep, drainage, premium footing",
    icon: "🏟️",
  },
  {
    service: "Barn & Stable Build",
    range: "$45k – $120k",
    includes: "Custom stalls, ventilation, fit-out",
    icon: "🏗️",
  },
  {
    service: "Full Facility Package",
    range: "$150k – $350k+",
    includes: "Arena, barn, fencing, infrastructure",
    icon: "⭐",
  },
];

interface SampleEstimateCTAProps {
  onGetQuote?: () => void;
}

export function SampleEstimateCTA({ onGetQuote }: SampleEstimateCTAProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="section-padding bg-card border-y border-border"
    >
      <div className="section-container">
        <div
          className={cn(
            "max-w-4xl mx-auto transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Sample Pricing
            </div>
            <h2 className="heading-section text-foreground mb-3">
              See What Your Build Could Cost
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Get a ballpark before you commit. These indicative ranges cover our most popular builds — your custom quote is free and obligation-free.
            </p>
          </div>

          {/* Estimate Cards */}
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {SAMPLE_ESTIMATES.map((est, i) => (
              <div
                key={est.service}
                className={cn(
                  "relative rounded-xl border bg-background p-6 text-center transition-all duration-500",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  i === 2 && "border-accent shadow-[0_4px_24px_-6px_hsl(var(--accent)/0.2)]"
                )}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                {i === 2 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <span className="text-3xl mb-3 block" aria-hidden="true">{est.icon}</span>
                <h3 className="font-serif text-lg text-foreground mb-1">{est.service}</h3>
                <p className="text-2xl font-bold text-accent mb-2">{est.range}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{est.includes}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center space-y-3">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 min-w-[240px]"
              onClick={onGetQuote}
            >
              <Calculator className="h-4 w-4" />
              Get Your Free Custom Quote
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              No obligation · Response within 24 hours · On-site consultation included
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
