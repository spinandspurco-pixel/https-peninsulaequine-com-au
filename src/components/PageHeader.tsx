import { useParallax } from "@/hooks/useParallax";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";

interface PageHeaderProps {
  title: string;
  description: string;
  backgroundImage?: string;
}

export function PageHeader({ title, description, backgroundImage }: PageHeaderProps) {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });

  return (
    <section 
      ref={parallaxRef} 
      className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden"
    >
      {/* Animated blueprint line overlay */}
      <BlueprintLineOverlay variant="dimensions" color="light" />

      {/* Parallax decorative background */}
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
          <div 
            className="w-16 h-0.5 bg-accent mb-6 transition-all duration-700"
            style={{ 
              transform: `translateX(${offset * -0.1}px)`,
            }}
          />
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
    </section>
  );
}
