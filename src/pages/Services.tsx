import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { BlueprintDivider } from "@/components/BlueprintDivider";
import { ArrowRight, ArrowUp, CheckCircle, X, ZoomIn, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { SwipeIndicator } from "@/components/SwipeIndicator";
import { QuickQuoteModal } from "@/components/QuickQuoteModal";
import { services, lessonInfo, siteConfig } from "@/data/content";
import { BookingWidget } from "@/components/BookingWidget";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { StickyHeroCTA } from "@/components/StickyHeroCTA";

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
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import logoPeMark from "@/assets/logo-pe-mark.png";

// Map service IDs to their images
const serviceImages: Record<string, string> = {
  "arena-construction": equitanaArena,
  "barn-construction": aberdeenBarnInterior,
  "fencing": aberdeenStalls,
  "infrastructure": qldFacilityConstruction,
  "round-pens": qldFacilityCourtyard,
  "renovations": mainRidgeCiroWoodwork,
  "full-facility": qldFacilityConstruction,
  "clinics-events": equitanaArena,
};

// Page header component with parallax
function PageHeader({ title, description }: { title: string; description: string }) {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });

  return (
    <section ref={parallaxRef} className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
      {/* Layer 1: Elevation blueprint – slow reveal left-to-right */}
      <BlueprintBackground image={blueprintElevation} opacity={0.08} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
      {/* Layer 2: Facility plan – opposite direction, deeper parallax */}
      <BlueprintBackground image={blueprintFacility} opacity={0.035} direction="right-to-left" duration={2400} parallaxSpeed={0.1} className="scale-105" />
      {/* Layer 3: SVG architectural line overlay */}
      <BlueprintLineOverlay variant="dimensions" color="light" />
      {/* Parallax decorative photo element */}
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
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <img src={logoPeMark} alt="Peninsula Equine" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]" />
          </div>
          <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-xs sm:text-sm mb-6">
            Crafting World-Class Equine Facilities
          </p>
          <h1 className="heading-display mb-6">{title}</h1>
          <p className="text-lg text-primary-foreground/80 mb-8">{description}</p>
          
          {/* Service-specific hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {services.slice(0, 4).map((service) => (
              <button
                key={service.id}
                onClick={() => document.getElementById(service.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide bg-primary-foreground/10 text-primary-foreground/90 border border-primary-foreground/15 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:scale-105"
              >
                {service.title}
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {services.slice(4).map((service) => (
              <button
                key={service.id}
                onClick={() => document.getElementById(service.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide bg-primary-foreground/10 text-primary-foreground/90 border border-primary-foreground/15 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:scale-105"
              >
                {service.title}
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>

          <button
            onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm tracking-wider uppercase bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <CalendarIcon className="h-4 w-4" />
            Book a Consultation
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Architectural divider at the bottom edge */}
      <BlueprintDivider variant="elevation" className="absolute bottom-0 left-0 right-0 h-12 sm:h-16" />
    </section>
  );
}

function ServiceCard({ service, index, onQuoteClick }: { service: typeof services[0]; index: number; onQuoteClick: (serviceId: string) => void }) {
  const navigate = useNavigate();
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
        className={`p-6 -m-6 rounded-xl card-hover-glow
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
        <p className="text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground/80">
          {service.description}
        </p>

        {/* Dynamic pricing snippet */}
        {service.startingPrice && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 mb-6">
            <span className="text-sm text-muted-foreground">Starting at</span>
            <span className="text-lg font-semibold text-accent">{service.startingPrice}</span>
          </div>
        )}

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
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => navigate(`/contact?services=${service.id}`)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            Get a Quote
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Button 
            variant="outline" 
            className="border-accent/30 text-accent hover:bg-accent/10 transition-all duration-300"
            asChild
          >
            <Link to={`/contact?services=${service.id}`}>
              Learn More
            </Link>
          </Button>
        </div>
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
      <div className="aspect-[4/3] bg-secondary rounded-lg overflow-hidden image-card-glow relative">
        <img 
          src={serviceImages[service.id]} 
          alt={service.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110 group-hover:saturate-[1.1]"
          loading="lazy"
        />
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
  const [isZooming, setIsZooming] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(step?.image || "");

  // Pinch-to-zoom for images
  const pinchZoom = usePinchZoom({
    minScale: 1,
    maxScale: 4,
    onZoomStart: () => setIsZooming(true),
    onZoomEnd: () => setIsZooming(false),
  });

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  // Handle image transition with fade effect
  useEffect(() => {
    if (step?.image && step.image !== displayedImage) {
      // Start fade out
      setIsTransitioning(true);
      
      // After fade out, switch image and fade in
      const timeout = setTimeout(() => {
        setDisplayedImage(step.image);
        setIsTransitioning(false);
        pinchZoom.reset();
      }, 150); // Match the CSS transition duration
      
      return () => clearTimeout(timeout);
    }
  }, [step?.image]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (pinchZoom.isZoomed || e.touches.length > 1) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pinchZoom.isZoomed || e.touches.length > 1) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (pinchZoom.isZoomed) return;
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
      role="dialog"
      aria-modal="true"
      aria-roledescription="Image lightbox"
      aria-label={`${step.title} — Step ${currentIndex + 1} of ${total}`}
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Live region for screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Step {currentIndex + 1} of {total}: {step.title} — {step.description}
      </div>
      {/* Swipe indicator for first-time users */}
      <SwipeIndicator show={!!step && total > 1} />

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
        <div 
          ref={pinchZoom.containerRef}
          className="relative overflow-hidden touch-none"
          {...pinchZoom.handlers}
          onTouchEnd={(e) => {
            pinchZoom.handlers.onTouchEnd(e);
            pinchZoom.handleDoubleTap(e);
          }}
        >
          {/* Loading spinner */}
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={displayedImage || step.image}
            alt={step.title}
            className={`max-w-full max-h-[75vh] object-contain rounded-lg mx-auto transition-all duration-150 ease-in-out ${
              isImageLoaded && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
            }`}
            style={{ transform: pinchZoom.transform }}
            onLoad={() => setIsImageLoaded(true)}
            draggable={false}
          />
          {/* Zoom indicator */}
          {pinchZoom.isZoomed && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/80 text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ZoomIn className="w-3 h-3" />
              {Math.round(pinchZoom.scale * 100)}%
            </div>
          )}
          {/* Zoom hint for mobile */}
          {!pinchZoom.isZoomed && isImageLoaded && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-primary-foreground/70 text-xs px-3 py-1.5 rounded-full sm:hidden">
              Pinch to zoom • Double-tap to zoom
            </div>
          )}
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
          <span className="sm:hidden">Pinch to zoom • Swipe to navigate</span>
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
    <section id="construction-process" className="section-padding bg-card scroll-mt-20">
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
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 card-interactive image-card-glow relative">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-110"
                  loading="lazy"
                />
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                {/* Border glow effect */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-accent/30" />
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-foreground text-sm transition-colors duration-300 group-hover:text-accent">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 transition-colors duration-300 group-hover:text-foreground/70">
                    {step.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Back to Services button */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10"
            onClick={() => document.getElementById('services-list')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
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
    <section id="booking" className="section-padding bg-background scroll-mt-24">
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
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-500 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/book-lesson">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Book a Lesson
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
              <Link to="/contact?services=clinics-events">
                Plan a Clinic or Event
              </Link>
            </Button>
            <BookingWidget variant="card" className="max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingGridSection({ onQuoteClick }: { onQuoteClick: (serviceId: string) => void }) {
  const navigate = useNavigate();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(services.length);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="bottom-to-top" duration={2400} parallaxSpeed={0.08} />
      <BlueprintLineOverlay variant="dimensions" color="dark" />

      <div className="section-container relative z-10">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">Investment Guide</h2>
          <p className="text-muted-foreground">
            Every project is custom-quoted after an on-site consultation. Below are starting points to help you plan your budget.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const isHovered = hoveredId === service.id;

            return (
              <div
                key={service.id}
                className={`group relative rounded-xl border bg-background overflow-hidden transition-all duration-700 ${
                  visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${isHovered ? "border-accent shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.3)] scale-[1.02]" : "border-border hover:border-accent/40"}`}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Service image peek */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={serviceImages[service.id]}
                    alt={service.title}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isHovered ? "scale-110 brightness-75" : "scale-100 brightness-90"
                    }`}
                    loading="lazy"
                  />
                  {/* Price badge overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}>
                    <div className="text-center">
                      <p className="text-primary-foreground/70 text-xs uppercase tracking-wider mb-1">Starting at</p>
                      <p className="font-serif text-4xl font-bold text-primary-foreground drop-shadow-lg">{service.startingPrice}</p>
                    </div>
                  </div>
                  {/* Default price (bottom corner) */}
                  <div className={`absolute bottom-3 right-3 bg-primary/80 backdrop-blur-sm rounded-lg px-3 py-1.5 transition-all duration-500 ${
                    isHovered ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}>
                    <p className="text-primary-foreground text-xs">From</p>
                    <p className="font-serif text-lg font-bold text-accent">{service.startingPrice}</p>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-6">
                  <h3 className={`font-serif text-lg font-semibold mb-2 transition-colors duration-300 ${
                    isHovered ? "text-accent" : "text-foreground"
                  }`}>
                    {service.title}
                  </h3>

                  {/* Description — visible by default, slides away on hover */}
                  <div className={`transition-all duration-400 overflow-hidden ${
                    isHovered ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
                  }`}>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {service.shortDescription}
                    </p>
                  </div>

                  {/* Benefits list — reveals on hover */}
                  <div className={`transition-all duration-400 overflow-hidden ${
                    isHovered ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <p className="text-[10px] uppercase tracking-widest text-accent mb-3">What's included</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                          style={{
                            transitionDelay: isHovered ? `${i * 60}ms` : "0ms",
                            opacity: isHovered ? 1 : 0,
                            transform: isHovered ? "translateX(0)" : "translateX(-8px)",
                            transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA button */}
                  <div className={`mt-4 transition-all duration-300 ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0"
                  }`}>
                    <Button 
                      onClick={() => navigate(`/contact?services=${service.id}`)}
                      className={`w-full transition-all duration-300 ${
                        isHovered
                          ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
                          : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                      }`}
                    >
                      {isHovered ? "Get a Quote" : service.startingPrice ? "Learn More" : "Get a Quote"}
                      <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All pricing is indicative. Final quotes are provided after a free on-site consultation.
        </p>
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
  const [quoteServiceId, setQuoteServiceId] = useState<string | null>(null);
  const activeService = services.find((s) => s.id === quoteServiceId);

  // Deterministic "live" progress seeded by current month (simulates monthly capacity fill)
  const liveProgress = useMemo(() => {
    const day = new Date().getDate();
    // Ramps from ~40 early-month to ~85 late-month
    return Math.min(95, Math.round(38 + (day / 31) * 50));
  }, []);

  const scrollToBooking = () =>
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });

  return (
    <Layout>
      <StickyHeroCTA
        progress={liveProgress}
        progressLabel="spots filled"
        onCtaClick={scrollToBooking}
      />
      <PageHeader
        title="Our Services"
        description="From custom arenas to complete barn construction, we deliver equine facilities built to last. Every project reflects our commitment to quality and our understanding of what horses—and their owners—truly need."
      />

      <section id="services-list" className="section-container scroll-mt-24">
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} onQuoteClick={setQuoteServiceId} />
        ))}
      </section>

      <PricingGridSection onQuoteClick={setQuoteServiceId} />

      <ConstructionProcessSection />

      <LessonsSection />

      <CTASection />

      {/* Quick Quote Modal */}
      <QuickQuoteModal
        open={!!quoteServiceId}
        onOpenChange={(open) => { if (!open) setQuoteServiceId(null); }}
        serviceId={quoteServiceId || ""}
        serviceTitle={activeService?.title || ""}
        startingPrice={activeService?.startingPrice}
      />
    </Layout>
  );
}
