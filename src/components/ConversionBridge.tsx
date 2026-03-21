import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/RevealOnScroll";

interface ConversionBridgeProps {
  /** Small mono label above heading */
  label?: string;
  /** Main heading */
  heading: string;
  /** Optional subtext */
  subtext?: string;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA link destination */
  ctaHref?: string;
  /** Trust line below CTA */
  trustLine?: string;
  /** Visual variant */
  variant?: "minimal" | "accent";
}

export function ConversionBridge({
  label,
  heading,
  subtext,
  ctaLabel = "Start a Project",
  ctaHref = "/site-assessment",
  trustLine,
  variant = "minimal",
}: ConversionBridgeProps) {
  return (
    <section
      className={`relative py-20 sm:py-28 ${
        variant === "accent" ? "bg-card" : ""
      }`}
    >
      {variant === "accent" && <div className="absolute inset-0 grain-texture opacity-20" />}
      <div className="section-container max-w-2xl mx-auto text-center relative z-[1]">
        <RevealOnScroll direction="up">
          {label && (
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">
              {label}
            </p>
          )}
          <h3 className="font-serif text-xl sm:text-2xl font-light text-foreground/75 leading-[1.3] mb-6">
            {heading}
          </h3>
          {subtext && (
            <p className="text-[12px] text-muted-foreground/30 leading-[2] mb-10 max-w-md mx-auto">
              {subtext}
            </p>
          )}
          <Button asChild variant="gold" size="default">
            <Link to={ctaHref}>
              {ctaLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
          {trustLine && (
            <p className="text-muted-foreground/15 text-[9px] tracking-[0.25em] uppercase mt-8">
              {trustLine}
            </p>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
