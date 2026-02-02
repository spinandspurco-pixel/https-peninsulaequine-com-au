import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { services, lessonInfo, siteConfig } from "@/data/content";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";

// Main Ridge construction process images
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeFrameTrench from "@/assets/main-ridge-frame-trench.jpg";
import mainRidgePostDepth from "@/assets/main-ridge-post-depth.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeTimberPosts from "@/assets/main-ridge-timber-posts.jpg";
import mainRidgeTrenchUtilities from "@/assets/main-ridge-trench-utilities.jpg";

// Service card images
import equitanaArena from "@/assets/equitana-arena-1.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import qldFacilityConstruction from "@/assets/qld-facility-construction.jpg";
import qldFacilityCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";

// Map service IDs to their images
const serviceImages: Record<string, string> = {
  "arena-construction": equitanaArena,
  "barn-construction": aberdeenBarnInterior,
  "fencing": aberdeenStalls,
  "infrastructure": qldFacilityConstruction,
  "round-pens": qldFacilityCourtyard,
  "renovations": mainRidgeCiroWoodwork,
};

// Page header component with parallax
function PageHeader({ title, description }: { title: string; description: string }) {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });

  return (
    <section ref={parallaxRef} className="relative pt-32 pb-16 bg-primary text-primary-foreground overflow-hidden">
      {/* Parallax decorative element */}
      <div 
        className="absolute right-0 top-0 w-1/3 h-full opacity-5 will-change-transform"
        style={{ 
          transform: `translateY(${offset * 0.5}px)`,
          backgroundImage: `url(${mainRidgeBarnFrame})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="section-container relative z-10">
        <div className="max-w-3xl">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h1 className="heading-display mb-6">{title}</h1>
          <p className="text-lg text-primary-foreground/80">{description}</p>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const isEven = index % 2 === 0;

  return (
    <div
      id={service.id}
      className="group scroll-mt-24 grid lg:grid-cols-2 gap-8 lg:gap-16 items-start py-16 border-b border-border last:border-0"
    >
      <div 
        ref={contentRef}
        className={`p-6 -m-6 rounded-xl transition-all duration-500 
          group-hover:bg-card group-hover:shadow-lg group-hover:-translate-y-1
          ${isEven ? "" : "lg:order-2"}
          ${contentVisible 
            ? "opacity-100 translate-x-0" 
            : `opacity-0 ${isEven ? "-translate-x-8" : "translate-x-8"}`
          }`}
      >
        <div className={`w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 transition-all duration-500 delay-100 group-hover:bg-accent/20 group-hover:scale-110 ${
          contentVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}>
          <div className="w-8 h-8 bg-accent rounded transition-transform duration-300 group-hover:rotate-12" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4 transition-colors duration-300 group-hover:text-accent">
          {service.title}
        </h2>
        <p className="text-muted-foreground mb-6 transition-colors duration-300 group-hover:text-foreground/80">
          {service.description}
        </p>
        <ul className="space-y-3 mb-8">
          {service.features.map((feature, i) => (
            <li 
              key={i} 
              className={`flex items-start gap-3 transition-all duration-500 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
              style={{ transitionDelay: `${200 + i * 75}ms` }}
            >
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <Link to="/contact">
            Request a Quote
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
      <div 
        ref={imageRef}
        className={`transition-all duration-700 delay-200 ${
          isEven ? "" : "lg:order-1"
        } ${
          imageVisible 
            ? "opacity-100 translate-x-0 scale-100" 
            : `opacity-0 ${isEven ? "translate-x-8" : "-translate-x-8"} scale-95`
        }`}
      >
        <div className="aspect-[4/3] bg-secondary rounded-lg overflow-hidden transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
          <img 
            src={serviceImages[service.id]} 
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

const constructionSteps = [
  { image: mainRidgeTrenchUtilities, title: "Site Preparation", description: "Trenching for utilities and drainage" },
  { image: mainRidgeRebarFoundation, title: "Foundation Work", description: "Reinforced concrete foundations built to last" },
  { image: mainRidgePostDepth, title: "Post Installation", description: "Deep-set posts for structural integrity" },
  { image: mainRidgeFrameTrench, title: "Frame Layout", description: "Precise framing aligned to specifications" },
  { image: mainRidgeTimberPosts, title: "Timber Framework", description: "Quality timber posts and structural elements" },
  { image: mainRidgeBarnFrame, title: "Barn Framing", description: "Complete structural framework taking shape" },
  { image: mainRidgeCraneLift, title: "Heavy Lifting", description: "Precision crane work for large components" },
  { image: mainRidgeArenaGrading, title: "Arena Grading", description: "Perfectly leveled arena surfaces" },
];

type ConstructionStep = {
  image: string;
  title: string;
  description: string;
};

function ConstructionLightbox({
  step,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  total,
  allSteps,
  onNavigateTo,
}: {
  step: ConstructionStep | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  total: number;
  allSteps: ConstructionStep[];
  onNavigateTo: (index: number) => void;
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Reset loaded state when image changes
  useEffect(() => {
    if (step) {
      // Check if image is already preloaded
      setIsImageLoaded(preloadedImages.has(step.image));
    }
  }, [step, preloadedImages]);

  // Preload ALL images when lightbox first opens
  useEffect(() => {
    if (step === null || allSteps.length === 0) return;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (preloadedImages.has(src)) {
          resolve();
          return;
        }
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set(prev).add(src));
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src;
      });
    };

    // Prioritize: current image first, then adjacent, then rest
    const loadInOrder = async () => {
      // Load current image first
      await preloadImage(step.image);
      setIsImageLoaded(true);

      // Then preload adjacent images
      const nextIndex = (currentIndex + 1) % total;
      const prevIndex = (currentIndex - 1 + total) % total;
      await Promise.all([
        preloadImage(allSteps[nextIndex].image),
        preloadImage(allSteps[prevIndex].image),
      ]);

      // Then preload all remaining images in background
      const remainingIndices = allSteps
        .map((_, i) => i)
        .filter(i => i !== currentIndex && i !== nextIndex && i !== prevIndex);
      
      for (const i of remainingIndices) {
        preloadImage(allSteps[i].image);
      }
    };

    loadInOrder();
  }, [step, currentIndex, allSteps, total]);

  // Keyboard navigation
  useEffect(() => {
    if (!step) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [step, onNext, onPrev, onClose]);

  if (!step) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground z-10"
        onClick={onClose}
        aria-label="Close lightbox (Escape)"
      >
        <X className="h-8 w-8" />
      </button>
      
      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent/20 hover:bg-accent/40 flex items-center justify-center text-primary-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous image (Left Arrow)"
      >
        <ArrowRight className="h-6 w-6 rotate-180" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent/20 hover:bg-accent/40 flex items-center justify-center text-primary-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next image (Right Arrow)"
      >
        <ArrowRight className="h-6 w-6" />
      </button>

      <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {/* Loading spinner */}
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={step.image}
            alt={step.title}
            className={`max-w-full max-h-[75vh] object-contain rounded-lg mx-auto transition-opacity duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
        
        {/* Image info */}
        <div className="text-center mt-4">
          <p className="text-accent text-sm font-medium mb-1">
            Step {currentIndex + 1} of {total}
          </p>
          <h3 className="font-serif text-xl text-primary-foreground mb-2">
            {step.title}
          </h3>
          <p className="text-primary-foreground/70 text-sm">
            {step.description}
          </p>
        </div>

        {/* Thumbnail strip */}
        <div className="mt-6 px-4">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
            {allSteps.map((thumbStep, index) => (
              <button
                key={index}
                onClick={() => onNavigateTo(index)}
                className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden transition-all duration-300 ${
                  index === currentIndex 
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-primary scale-105" 
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`Go to step ${index + 1}: ${thumbStep.title}`}
              >
                <img
                  src={thumbStep.image}
                  alt={thumbStep.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-accent/10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation hint */}
        <p className="text-primary-foreground/40 text-xs mt-4 text-center">
          <span className="hidden sm:inline">Use ← → to navigate • Esc to close</span>
          <span className="sm:hidden">Swipe to navigate • Tap outside to close</span>
        </p>
      </div>
    </div>
  );
}

function ConstructionProcessSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { containerRef, visibleItems } = useStaggeredAnimation(constructionSteps.length);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % constructionSteps.length);
    }
  };
  
  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + constructionSteps.length) % constructionSteps.length);
    }
  };

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">
            Our Construction Process
          </h2>
          <p className="text-muted-foreground">
            Quality equine facilities don't happen by accident. Here's a behind-the-scenes 
            look at how we bring your vision to life—from ground-breaking to grand opening.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {constructionSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className={`group text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg transition-all duration-700 ${
                visibleItems[index]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 transition-shadow duration-300 group-hover:shadow-lg">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-foreground text-sm">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <ConstructionLightbox
        step={lightboxIndex !== null ? constructionSteps[lightboxIndex] : null}
        onClose={closeLightbox}
        onNext={goToNext}
        onPrev={goToPrev}
        currentIndex={lightboxIndex ?? 0}
        total={constructionSteps.length}
        allSteps={constructionSteps}
        onNavigateTo={setLightboxIndex}
      />
    </section>
  );
}

function LessonsSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div 
          ref={ref}
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">
            Lessons & Training
          </h2>
          <p className={`text-accent font-medium mb-4 transition-all duration-500 delay-150 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>{lessonInfo.trainer}</p>
          <p className={`text-muted-foreground mb-6 transition-all duration-500 delay-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            {lessonInfo.description}
          </p>
          <p className={`text-muted-foreground mb-8 transition-all duration-500 delay-250 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            {lessonInfo.contact}
          </p>
          <div className={`transition-all duration-500 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/contact">
                Inquire About Lessons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <ParallaxCTA
      title="Let's Discuss Your Project"
      description="Every great facility starts with a conversation. Tell us about your vision, and we'll show you how to make it reality."
      backgroundImage={mainRidgeBarnFrame}
      primaryButtonText="Get a Free Quote"
      primaryButtonLink="/contact"
      showPhoneButton={true}
    />
  );
}

export default function Services() {
  return (
    <Layout>
      <PageHeader
        title="Our Services"
        description="From custom arenas to complete barn construction, we deliver equine facilities built to last. Every project reflects our commitment to quality and our understanding of what horses—and their owners—truly need."
      />

      <section className="section-container">
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </section>

      <ConstructionProcessSection />

      <LessonsSection />

      <CTASection />
    </Layout>
  );
}
