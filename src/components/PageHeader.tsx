import { ReactNode } from "react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

interface PageHeaderProps {
  title: string;
  /** Primary subtitle text */
  subtitle?: string;
  /** Alias for subtitle — backwards compat */
  description?: string;
  overline?: string;
  backgroundImage?: string;
  /** Accepted for backwards compat, no longer rendered */
  dividerVariant?: string;
  children?: ReactNode;
}

/**
 * Premium architectural page header — cinematic, dark, minimal.
 */
export function PageHeader({
  title,
  subtitle,
  description,
  overline,
  backgroundImage,
  dividerVariant,
  children,
}: PageHeaderProps) {
  const displaySubtitle = subtitle || description;
  return (
    <section className="relative pt-40 sm:pt-52 pb-28 sm:pb-36 overflow-hidden">
      {/* Background image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.9) contrast(1.08) saturate(0.85)" }}
          />
        </div>
      )}

      {/* Deep overlay */}
      <div className="absolute inset-0 bg-background/55" />

      {/* Engineering grid */}
      {!backgroundImage && <div className="absolute inset-0 engineering-grid" />}

      {/* Grain */}
      <div className="absolute inset-0 grain-texture" />
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

        {displaySubtitle && (
          <p
            className="mt-8 text-muted-foreground/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            {displaySubtitle}
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
