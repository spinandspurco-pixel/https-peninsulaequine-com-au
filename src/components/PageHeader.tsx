import { ReactNode } from "react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  overline?: string;
  backgroundImage?: string;
  children?: ReactNode;
}

/**
 * Premium architectural page header — cinematic, dark, minimal.
 */
export function PageHeader({
  title,
  subtitle,
  overline,
  backgroundImage,
  children,
}: PageHeaderProps) {
  return (
    <section className="relative pt-40 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
      {/* Background image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover brightness-[0.3] contrast-[1.1] saturate-[0.6]"
          />
        </div>
      )}

      {/* Deep overlay */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 55% at 50% 50%, transparent 20%, hsl(222 20% 4% / 0.6) 80%)",
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      <div className="section-container relative z-10 text-center max-w-3xl mx-auto">
        {overline && (
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-overline text-accent/70">{overline}</p>
            <div className="w-8 h-px bg-accent/40" />
          </div>
        )}

        <h1
          className="heading-display text-foreground opacity-0 animate-fade-in"
          style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-8 text-muted-foreground/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            {subtitle}
          </p>
        )}

        {children && (
          <div
            className="mt-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "900ms", animationFillMode: "both" }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
