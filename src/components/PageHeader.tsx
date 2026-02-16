import { ReactNode } from "react";
import { useParallax } from "@/hooks/useParallax";
import { BlueprintScene } from "@/components/BlueprintScene";
import { BlueprintDivider } from "@/components/BlueprintDivider";
import { siteConfig } from "@/data/content";
import logoPeMark from "@/assets/pe-logo-new.png";


interface PageHeaderProps {
  title: string;
  description: string;
  backgroundImage?: string;
  /** BlueprintDivider variant for the bottom edge. Defaults to "elevation". */
  dividerVariant?: "elevation" | "floorplan" | "grid" | "contact" | "structural";
  /** Optional extra content rendered below the description (e.g. service pills) */
  children?: ReactNode;
}

export function PageHeader({ title, description, backgroundImage, dividerVariant = "elevation", children }: PageHeaderProps) {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });

  return (
    <section 
      ref={parallaxRef} 
      className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden"
    >
      {/* Animated blueprint overlay */}
      <BlueprintScene preset="page-header" />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/70 pointer-events-none z-[1]" />

      {/* PE logo watermark – large, centered, ultra-subtle */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
        style={{
          opacity: 0.04,
          transform: `translateY(${offset * 0.15}px)`,
        }}
      >
        <img
          src={logoPeMark}
          alt=""
          aria-hidden="true"
          className="w-[50vw] max-w-[400px] h-auto object-contain select-none"
          style={{ filter: "grayscale(0.5) brightness(1.4)" }}
        />
      </div>

      {/* Parallax decorative background image */}
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
          {/* Primary logo visual */}
          <div className="mb-6">
            <img 
              src={logoPeMark} 
              alt="Peninsula Equine" 
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]"
            />
          </div>
          <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-xs sm:text-sm mb-6">
            {siteConfig.tagline}
          </p>
          <h1 
            className="heading-display mb-6 transition-all duration-700"
            style={{ transform: `translateY(${offset * 0.08}px)` }}
          >
            {title}
          </h1>
          <p 
            className="text-lg text-primary-foreground/80 transition-all duration-700"
            style={{ transform: `translateY(${offset * 0.12}px)` }}
          >
            {description}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>

      {/* Architectural divider at the bottom edge */}
      <BlueprintDivider variant={dividerVariant} className="absolute bottom-0 left-0 right-0 h-12 sm:h-16" />
    </section>
  );
}
