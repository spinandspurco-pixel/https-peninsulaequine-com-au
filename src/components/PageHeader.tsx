import { ReactNode } from "react";
import { useParallax } from "@/hooks/useParallax";
import { BlueprintScene } from "@/components/BlueprintScene";
import { BlueprintDivider } from "@/components/BlueprintDivider";

interface PageHeaderProps {
  title: string;
  description: string;
  backgroundImage?: string;
  dividerVariant?: "elevation" | "floorplan" | "grid" | "contact" | "structural";
  children?: ReactNode;
}

export function PageHeader({ title, description, backgroundImage, dividerVariant = "elevation", children }: PageHeaderProps) {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });

  return (
    <section
      ref={parallaxRef}
      className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 bg-primary text-primary-foreground overflow-hidden"
    >
      {/* Blueprint overlay */}
      <BlueprintScene preset="page-header" />

      {/* Gradient overlay — strong enough to ensure text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/80 to-primary/95 pointer-events-none z-[1]" />

      {/* Background image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-10 will-change-transform"
          style={{
            transform: `translateY(${offset * 0.5}px)`,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-px bg-accent mx-auto mb-6" />
          <h1
            className="heading-display mb-5 text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            style={{ transform: `translateY(${offset * 0.08}px)` }}
          >
            {title}
          </h1>
          <p
            className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed"
            style={{ transform: `translateY(${offset * 0.12}px)` }}
          >
            {description}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>

      <BlueprintDivider variant={dividerVariant} className="absolute bottom-0 left-0 right-0 h-10 sm:h-14" />
    </section>
  );
}
