import { ReactNode, useRef, useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export type TransitionVariant = 
  | "fade-up" 
  | "fade-down" 
  | "fade-left" 
  | "fade-right"
  | "scale-up"
  | "reveal-up"
  | "reveal-down"
  | "blur-in"
  | "slide-reveal";

interface SectionTransitionProps {
  children: ReactNode;
  variant?: TransitionVariant;
  delay?: number; // delay in ms
  duration?: number; // duration in ms
  threshold?: number;
  className?: string;
  once?: boolean;
}

export function SectionTransition({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 800,
  threshold = 0.15,
  className,
  once = true,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once, prefersReducedMotion]);

  // Get variant-specific classes
  const getVariantClasses = () => {
    const baseTransition = `transition-all ease-out`;
    
    switch (variant) {
      case "fade-up":
        return cn(
          baseTransition,
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        );
      case "fade-down":
        return cn(
          baseTransition,
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 -translate-y-12"
        );
      case "fade-left":
        return cn(
          baseTransition,
          isVisible 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-12"
        );
      case "fade-right":
        return cn(
          baseTransition,
          isVisible 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 -translate-x-12"
        );
      case "scale-up":
        return cn(
          baseTransition,
          isVisible 
            ? "opacity-100 scale-100" 
            : "opacity-0 scale-95"
        );
      case "reveal-up":
        return cn(
          baseTransition,
          "overflow-hidden",
          isVisible 
            ? "opacity-100 [clip-path:inset(0_0_0_0)]" 
            : "opacity-0 [clip-path:inset(100%_0_0_0)]"
        );
      case "reveal-down":
        return cn(
          baseTransition,
          "overflow-hidden",
          isVisible 
            ? "opacity-100 [clip-path:inset(0_0_0_0)]" 
            : "opacity-0 [clip-path:inset(0_0_100%_0)]"
        );
      case "blur-in":
        return cn(
          baseTransition,
          isVisible 
            ? "opacity-100 blur-0 translate-y-0" 
            : "opacity-0 blur-sm translate-y-6"
        );
      case "slide-reveal":
        return cn(
          baseTransition,
          isVisible 
            ? "opacity-100 translate-y-0 [clip-path:inset(0_0_0_0)]" 
            : "opacity-0 translate-y-8 [clip-path:inset(0_0_20%_0)]"
        );
      default:
        return cn(
          baseTransition,
          isVisible ? "opacity-100" : "opacity-0"
        );
    }
  };

  const style = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={ref}
      className={cn(getVariantClasses(), className)}
      style={style}
    >
      {children}
    </div>
  );
}

// Staggered children animation wrapper
interface StaggeredTransitionProps {
  children: ReactNode[];
  variant?: TransitionVariant;
  staggerDelay?: number; // delay between each child in ms
  baseDelay?: number; // initial delay before first child
  duration?: number;
  threshold?: number;
  className?: string;
  childClassName?: string;
  once?: boolean;
}

export function StaggeredTransition({
  children,
  variant = "fade-up",
  staggerDelay = 100,
  baseDelay = 0,
  duration = 600,
  threshold = 0.1,
  className,
  childClassName,
  once = true,
}: StaggeredTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleIndices(new Set(children.map((_, i) => i)));
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the visibility of each child
          children.forEach((_, index) => {
            setTimeout(() => {
              setVisibleIndices(prev => new Set([...prev, index]));
            }, baseDelay + index * staggerDelay);
          });
          
          if (once) {
            observer.unobserve(element);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once, prefersReducedMotion, children.length, baseDelay, staggerDelay]);

  const getVariantClasses = (isVisible: boolean) => {
    const baseTransition = `transition-all ease-out`;
    
    switch (variant) {
      case "fade-up":
        return cn(baseTransition, isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8");
      case "fade-left":
        return cn(baseTransition, isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8");
      case "fade-right":
        return cn(baseTransition, isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8");
      case "scale-up":
        return cn(baseTransition, isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95");
      default:
        return cn(baseTransition, isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8");
    }
  };

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(getVariantClasses(visibleIndices.has(index)), childClassName)}
          style={{ transitionDuration: `${duration}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Section divider with animated reveal
interface AnimatedDividerProps {
  className?: string;
  width?: string;
  delay?: number;
}

export function AnimatedDivider({ 
  className, 
  width = "w-20",
  delay = 0 
}: AnimatedDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className={cn(
        "h-0.5 bg-accent transition-all duration-700 ease-out origin-left",
        width,
        isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    />
  );
}

// Text reveal animation for headings
interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export function TextReveal({ 
  children, 
  className, 
  delay = 0,
  as: Component = "h2" 
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <Component
      ref={ref as any}
      className={cn(
        "overflow-hidden",
        className
      )}
    >
      <span
        className={cn(
          "inline-block transition-all duration-700 ease-out",
          isVisible 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full opacity-0"
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </Component>
  );
}

// Parallax section wrapper with scroll-linked transform
interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // 0-1, where 0.5 is half speed
  direction?: "up" | "down";
}

export function ParallaxSection({
  children,
  className,
  speed = 0.3,
  direction = "up",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate how far the element is from center of viewport
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distanceFromCenter = elementCenter - viewportCenter;
            
            // Apply parallax transform
            const parallaxOffset = distanceFromCenter * speed * (direction === "up" ? 1 : -1);
            setOffset(parallaxOffset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        transform: prefersReducedMotion ? undefined : `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
}
