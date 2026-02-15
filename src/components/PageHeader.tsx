import { useParallax } from "@/hooks/useParallax";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { BlueprintDivider } from "@/components/BlueprintDivider";
import logoPeMark from "@/assets/logo-pe-mark.png";
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";

interface PageHeaderProps {
  title: string;
  description: string;
  backgroundImage?: string;
  /** BlueprintDivider variant for the bottom edge. Defaults to "elevation". */
  dividerVariant?: "elevation" | "floorplan" | "grid";
}

export function PageHeader({ title, description, backgroundImage, dividerVariant = "elevation" }: PageHeaderProps) {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });

  return (
    <section 
      ref={parallaxRef} 
      className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden"
    >
      {/* Layer 1: Elevation blueprint – slow reveal */}
      <BlueprintBackground image={blueprintElevation} opacity={0.07} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
      {/* Layer 2: Facility plan – opposite direction for depth */}
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="right-to-left" duration={2400} parallaxSpeed={0.1} className="scale-105" />
      {/* Layer 3: SVG architectural line overlay */}
      <BlueprintLineOverlay variant="dimensions" color="light" />

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
      
      {/* Abstract parallax pattern when no image */}
      {!backgroundImage && (
        <div 
          className="absolute right-0 top-0 w-1/2 h-full opacity-5 will-change-transform"
          style={{ 
            transform: `translateY(${offset * 0.4}px)`,
          }}
        >
          <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-primary-foreground rounded-full" />
          <div className="absolute bottom-1/4 right-1/3 w-24 h-24 border-2 border-primary-foreground" />
          <div className="absolute top-1/2 right-1/6 w-16 h-16 bg-primary-foreground/20 rounded-lg rotate-45" />
        </div>
      )}
      
      <div className="section-container relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <img src={logoPeMark} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]" />
            <div 
              className="w-12 h-0.5 bg-accent transition-all duration-700"
              style={{ transform: `translateX(${offset * -0.1}px)` }}
            />
          </div>
          <h1 
            className="heading-display mb-6 transition-all duration-700"
            style={{ 
              transform: `translateY(${offset * 0.08}px)`,
            }}
          >
            {title}
          </h1>
          <p 
            className="text-lg text-primary-foreground/80 transition-all duration-700"
            style={{ 
              transform: `translateY(${offset * 0.12}px)`,
            }}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Architectural divider at the bottom edge */}
      <BlueprintDivider variant={dividerVariant} className="absolute bottom-0 left-0 right-0 h-12 sm:h-16" />
    </section>
  );
}
