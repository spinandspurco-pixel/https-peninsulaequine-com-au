import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
import { siteConfig } from "@/data/content";

interface ParallaxCTAProps {
  title: string;
  description: string;
  subtitle?: string;
  backgroundImage: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  showPhoneButton?: boolean;
  overlayOpacity?: number;
  minHeight?: string;
}

export function ParallaxCTA({
  title,
  description,
  subtitle,
  backgroundImage,
  primaryButtonText = "Get in Touch",
  primaryButtonLink = "/contact",
  showPhoneButton = true,
  overlayOpacity = 85,
  minHeight = "auto",
}: ParallaxCTAProps) {
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.2 });
  const { ref: parallaxRef, offset } = useParallax<HTMLDivElement>({ speed: 0.4 });

  return (
    <section 
      ref={sectionRef} 
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ minHeight }}
    >
      {/* Parallax Background */}
      <div 
        ref={parallaxRef}
        className="absolute inset-[-20%] will-change-transform"
        style={{ 
          transform: `translateY(${offset * 0.5}px) scale(1.1)`,
        }}
      >
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/85 to-primary/90"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div 
        className={`relative z-10 section-container text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-8" />
          
          {subtitle && (
            <p className="text-primary-foreground/70 uppercase tracking-[0.2em] text-sm mb-4">
              {subtitle}
            </p>
          )}
          
          <h2 className="heading-section text-primary-foreground mb-6">
            {title}
          </h2>
          
          <p className="text-lg text-primary-foreground/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground btn-hover-lift text-base px-8"
            >
              <Link to={primaryButtonLink}>
                {primaryButtonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            {showPhoneButton && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base px-8"
              >
                <a href={`tel:${siteConfig.phone}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  {siteConfig.phone}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
