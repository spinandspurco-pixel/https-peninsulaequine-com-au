import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { BlueprintDivider } from "@/components/BlueprintDivider";
import { ArrowRight, ArrowUp, CheckCircle, X, ZoomIn, CalendarIcon, Images, ChevronLeft, ChevronRight, BarChart3, ChevronDown, HelpCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { DepositPaymentPolicy } from "@/components/DepositPaymentPolicy";
import { InsuranceSafetyCard } from "@/components/InsuranceSafetyCard";
import { SwipeIndicator } from "@/components/SwipeIndicator";
import { QuickQuoteModal } from "@/components/QuickQuoteModal";
import { QuoteCalculator } from "@/components/QuoteCalculator";
import { ServicesGallery } from "@/components/ServicesGallery";
import { services, lessonInfo, siteConfig } from "@/data/content";
import { servicePricingTiers, serviceFaqs } from "@/data/servicePricingFaq";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookingWidget } from "@/components/BookingWidget";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { InlineBookingForm } from "@/components/InlineBookingForm";
import { LiveBookingCapacity } from "@/components/LiveBookingCapacity";
import { LessonAvailabilityCalendar } from "@/components/LessonAvailabilityCalendar";
import { RequestLessonInquiry } from "@/components/RequestLessonInquiry";

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
import equitanaArena2 from "@/assets/equitana-arena-2.jpg";
import equitanaArena3 from "@/assets/equitana-arena-3.jpg";
import equitanaArena4 from "@/assets/equitana-arena-4.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenStallsDetail from "@/assets/aberdeen-stalls-detail.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import qldFacilityConstruction from "@/assets/qld-facility-construction.jpg";
import qldFacilityCourtyard from "@/assets/qld-facility-courtyard.jpg";
import qldFacilityExterior1 from "@/assets/qld-facility-exterior-1.jpg";
import qldFacilityExterior2 from "@/assets/qld-facility-exterior-2.jpg";
import qldFacilityAerial1 from "@/assets/qld-facility-aerial-1.jpg";
import qldFacilityStalls from "@/assets/qld-facility-stalls.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeCiroWoodwork2 from "@/assets/main-ridge-ciro-woodwork-2.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import arenaSandPrep1 from "@/assets/arena-sand-prep-1.jpg";
import arenaSandPrep2 from "@/assets/arena-sand-prep-2.jpg";
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";
import logoPeMark from "@/assets/logo-pe-mark.png";

// Map service IDs to their primary images
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

// Map service IDs to gallery image sets
const serviceGalleryImages: Record<string, { src: string; caption: string }[]> = {
  "arena-construction": [
    { src: equitanaArena, caption: "Competition-grade arena" },
    { src: equitanaArena2, caption: "Professional footing installation" },
    { src: equitanaArena3, caption: "Arena drainage system" },
    { src: equitanaArena4, caption: "Finished arena surface" },
    { src: arenaSandPrep1, caption: "Base preparation" },
    { src: arenaSandPrep2, caption: "Sand footing grading" },
  ],
  "barn-construction": [
    { src: aberdeenBarnInterior, caption: "Custom barn interior" },
    { src: aberdeenAisle, caption: "Barn aisle design" },
    { src: aberdeenStonework, caption: "Stone detail work" },
    { src: aberdeenExterior, caption: "Barn exterior" },
    { src: aberdeenStallsDetail, caption: "Stall fitout detail" },
  ],
  "fencing": [
    { src: aberdeenStalls, caption: "Post and rail fencing" },
    { src: qldFacilityExterior1, caption: "Paddock perimeter fencing" },
    { src: qldFacilityExterior2, caption: "Gate and entry design" },
  ],
  "infrastructure": [
    { src: qldFacilityConstruction, caption: "Site development" },
    { src: qldFacilityAerial1, caption: "Aerial view of facility" },
    { src: qldFacilityExterior1, caption: "Access roads" },
    { src: mainRidgeBrickwork, caption: "Drainage infrastructure" },
  ],
  "round-pens": [
    { src: qldFacilityCourtyard, caption: "Round pen setup" },
    { src: arenaSandPrep1, caption: "Footing preparation" },
    { src: qldFacilityStalls, caption: "Adjacent paddock layout" },
  ],
  "renovations": [
    { src: mainRidgeCiroWoodwork, caption: "Custom woodwork restoration" },
    { src: mainRidgeCiroWoodwork2, caption: "Timber detail" },
    { src: mainRidgeInterior, caption: "Renovated interior" },
    { src: mainRidgeBrickwork, caption: "Structural repair" },
  ],
  "full-facility": [
    { src: qldFacilityConstruction, caption: "Full facility build" },
    { src: qldFacilityAerial1, caption: "Master site layout" },
    { src: qldFacilityExterior2, caption: "Completed exterior" },
    { src: qldFacilityStalls, caption: "Stabling wing" },
    { src: qldFacilityCourtyard, caption: "Courtyard & paddocks" },
  ],
  "clinics-events": [
    { src: equitanaArena, caption: "Competition arena" },
    { src: equitanaArena2, caption: "Warm-up area" },
    { src: equitanaArena3, caption: "Spectator amenities" },
    { src: equitanaArena4, caption: "Event lighting" },
  ],
};

// Page header component with parallax
function PageHeader({ title, description }: { title: string; description: string }) {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });
  const navigate = useNavigate();

  const handleServiceCTA = (serviceId: string) => {
    // Scroll to the service card first
    const el = document.getElementById(serviceId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // After scroll completes, highlight the card briefly
      el.classList.add('ring-2', 'ring-accent/40', 'rounded-xl');
      setTimeout(() => el.classList.remove('ring-2', 'ring-accent/40', 'rounded-xl'), 2000);
    }
  };

  const handleServiceBook = (serviceId: string) => {
    trackCtaClick("hero_service_book", { source: "services_hero", service: serviceId });
    navigate(`/contact?services=${serviceId}&ref=hero-cta`);
  };

  return (
    <section ref={parallaxRef} className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
      {/* Single blueprint layer */}
      <BlueprintBackground image={blueprintElevation} opacity={0.05} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
      <BlueprintLineOverlay variant="dimensions" color="light" />

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/70 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-primary/40 pointer-events-none z-[1]" />

      {/* PE logo watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
        style={{ opacity: 0.04, transform: `translateY(${offset * 0.15}px)` }}
      >
        <img src={logoPeMark} alt="" aria-hidden="true" className="w-[50vw] max-w-[400px] h-auto object-contain select-none" style={{ filter: "grayscale(0.5) brightness(1.4)" }} />
      </div>

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
          
          {/* Service-specific hero CTAs with dual action */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {services.slice(0, 4).map((service) => (
              <div key={service.id} className="group/cta relative inline-flex">
                <button
                  onClick={() => handleServiceCTA(service.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-l-full text-xs sm:text-sm font-medium tracking-wide bg-primary-foreground/10 text-primary-foreground/90 border border-r-0 border-primary-foreground/15 hover:bg-primary-foreground/20 transition-all duration-300"
                >
                  {service.title}
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleServiceBook(service.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-r-full text-xs font-medium bg-accent/80 text-accent-foreground border border-accent/60 hover:bg-accent transition-all duration-300"
                  title={`Book ${service.title}`}
                >
                  <CalendarIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {services.slice(4).map((service) => (
              <div key={service.id} className="group/cta relative inline-flex">
                <button
                  onClick={() => handleServiceCTA(service.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-l-full text-xs sm:text-sm font-medium tracking-wide bg-primary-foreground/10 text-primary-foreground/90 border border-r-0 border-primary-foreground/15 hover:bg-primary-foreground/20 transition-all duration-300"
                >
                  {service.title}
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleServiceBook(service.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-r-full text-xs font-medium bg-accent/80 text-accent-foreground border border-accent/60 hover:bg-accent transition-all duration-300"
                  title={`Book ${service.title}`}
                >
                  <CalendarIcon className="h-3 w-3" />
                </button>
              </div>
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
  const [showDetail, setShowDetail] = useState(false);

  const isEven = index % 2 === 0;
  const tiers = servicePricingTiers[service.id] || [];
  const faqs = serviceFaqs[service.id] || [];

  return (
    <div
      id={service.id}
      className="group scroll-mt-24 py-16 border-b border-border last:border-0"
    >
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
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

          <ul className="space-y-3 mb-6">
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

          {/* Dynamic pricing grid — always visible */}
          {tiers.length > 0 && (
            <div className="mb-6">
              <div className="grid sm:grid-cols-3 gap-3">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                      tier.popular
                        ? "border-accent bg-accent/5 ring-1 ring-accent/20 shadow-sm"
                        : "border-border bg-card"
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest rounded-full font-semibold">
                        Popular
                      </span>
                    )}
                    <p className="text-xs font-semibold text-foreground mb-0.5">{tier.name}</p>
                    <p className="text-xl font-bold text-accent mb-1">{tier.price}</p>
                    <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{tier.description}</p>
                    <ul className="space-y-1.5 mb-3">
                      {tier.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs">
                          <CheckCircle className="h-3 w-3 text-accent mt-0.5 shrink-0" />
                          <span className="text-foreground/80">{f}</span>
                        </li>
                      ))}
                      {tier.features.length > 3 && (
                        <li className="text-[10px] text-muted-foreground pl-4">
                          +{tier.features.length - 3} more
                        </li>
                      )}
                    </ul>
                    <Button
                      size="sm"
                      className={`w-full text-xs ${
                        tier.popular
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-muted text-foreground hover:bg-accent/10 border border-border"
                      }`}
                      onClick={() => {
                        trackCtaClick("tier_quote", { source: "pricing_grid", service: service.id, tier: tier.name });
                        navigate(`/contact?services=${service.id}&ref=tier-${tier.name.toLowerCase()}`);
                      }}
                    >
                      Get a Quote
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => {
                trackCtaClick("service_book", { source: "service_card", service: service.id });
                navigate(`/contact?services=${service.id}`);
              }}
              className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Request a Quote
            </Button>
            {faqs.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setShowDetail(!showDetail)}
                className="text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                {showDetail ? "Hide FAQ" : "FAQ"}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${showDetail ? "rotate-180" : ""}`} />
              </Button>
            )}
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
            <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Expandable FAQ */}
      {showDetail && (
        <div className="mt-10 animate-in slide-in-from-top-4 fade-in duration-500">
          {/* Per-service FAQ */}
          {faqs.length > 0 && (
            <div>
              <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent" />
                Common Questions — {service.title}
              </h3>
              <Accordion type="single" collapsible className="border rounded-xl overflow-hidden">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-0">
                    <AccordionTrigger className="px-5 text-sm font-medium text-foreground hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      )}
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

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (step) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [step]);

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
          className={`relative overflow-hidden touch-none ${pinchZoom.isZoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
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
            className={`max-w-full max-h-[75vh] object-contain rounded-lg mx-auto transition-all duration-150 ease-in-out select-none ${
              isImageLoaded && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
            }`}
            style={{ transform: pinchZoom.transform }}
            onLoad={() => setIsImageLoaded(true)}
            draggable={false}
          />
          {/* Zoom indicator + drag hint on desktop */}
          {pinchZoom.isZoomed && (
            <>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/80 text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ZoomIn className="w-3 h-3" />
                {Math.round(pinchZoom.scale * 100)}%
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/70 text-primary-foreground/80 text-xs px-4 py-2 rounded-full hidden sm:flex items-center gap-2 animate-fade-in pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
                  <path d="M5 9l-3 3 3 3" /><path d="M9 5l3-3 3 3" /><path d="M15 19l-3 3-3-3" /><path d="M19 9l3 3-3 3" />
                  <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
                </svg>
                Click &amp; drag to pan • Double-click to reset
              </div>
            </>
          )}
          {/* Zoom hint when not zoomed */}
          {!pinchZoom.isZoomed && isImageLoaded && (
            <>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-primary-foreground/70 text-xs px-3 py-1.5 rounded-full sm:hidden">
                Pinch to zoom • Double-tap to zoom
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-primary-foreground/70 text-xs px-3 py-1.5 rounded-full hidden sm:block">
                Scroll to zoom • Double-click to zoom
              </div>
            </>
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
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const LESSON_LEVELS = [
    { value: "beginner", label: "Foundation", price: "$95", duration: "45 min", tagline: "Build confidence from the ground up", icon: "⭐" },
    { value: "intermediate", label: "Development", price: "$120", duration: "60 min", tagline: "Refine your skills, deepen your partnership", icon: "🎯", popular: true },
    { value: "advanced", label: "Performance", price: "$150", duration: "60 min", tagline: "Precision training for serious riders", icon: "🏆" },
  ];

  return (
    <section id="booking" className="section-padding bg-background scroll-mt-24">
      <div className="section-container">
        <div 
          ref={ref}
          className={`max-w-3xl mx-auto text-center mb-10 transition-all duration-700 ${
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
        </div>

        {/* Step 1: Choose your level */}
        <div className={`max-w-4xl mx-auto mb-12 transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-6">
            Step 1 — Choose Your Level
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {LESSON_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(selectedLevel === level.value ? null : level.value)}
                className={`relative text-left rounded-xl border p-5 transition-all duration-300 hover:shadow-md ${
                  selectedLevel === level.value
                    ? "border-accent bg-accent/5 ring-1 ring-accent/20 shadow-sm"
                    : level.popular
                      ? "border-accent/30 bg-card"
                      : "border-border bg-card"
                }`}
              >
                {level.popular && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest rounded-full font-semibold">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{level.icon}</span>
                  <div>
                    <p className="font-serif font-semibold text-foreground">{level.label}</p>
                    <p className="text-xs text-muted-foreground">{level.tagline}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-accent">{level.price}</span>
                  <span className="text-xs text-muted-foreground">/ {level.duration}</span>
                </div>
                {selectedLevel === level.value && (
                  <div className="mt-3 pt-3 border-t border-accent/20">
                    <CheckCircle className="h-4 w-4 text-accent inline mr-1.5" />
                    <span className="text-xs text-accent font-medium">Selected — pick a date below</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Calendar + booking form */}
        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-6">
            Step 2 — Pick a Date & Book
          </p>
          <div className="grid md:grid-cols-[1fr_260px] gap-6">
            <InlineBookingForm />
            <LiveBookingCapacity className="h-fit md:sticky md:top-28" />
          </div>
        </div>

        {/* Step 3: Live availability calendar */}
        <div className={`mt-14 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="text-center mb-8">
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs mb-2">Live Availability</p>
            <h3 className="font-serif text-2xl text-foreground">Or Browse Open Slots</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">
              View real-time availability. Select a date to see open times, then book directly.
            </p>
          </div>
          <LessonAvailabilityCalendar />
        </div>

        {/* Secondary CTAs */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 transition-all duration-500 delay-400 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <Button 
            onClick={() => navigate(`/book-lesson${selectedLevel ? `?type=${selectedLevel}` : ''}`)}
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Full Booking Page
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button asChild size="lg" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
            <Link to="/contact?services=clinics-events">
              Plan a Clinic or Event
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ServiceDemoGallery({
  serviceId,
  serviceTitle,
  onClose,
}: {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = serviceGalleryImages[serviceId] || [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrentIndex((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrentIndex((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/95 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute -top-12 right-0 text-primary-foreground/70 hover:text-primary-foreground transition-colors" aria-label="Close gallery">
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-1">Gallery</p>
          <h3 className="font-serif text-xl text-primary-foreground">{serviceTitle}</h3>
        </div>

        {/* Main image */}
        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-primary/50">
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].caption}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/80 to-transparent p-4">
            <p className="text-sm text-primary-foreground/90">{images[currentIndex].caption}</p>
            <p className="text-xs text-primary-foreground/50 mt-1">{currentIndex + 1} / {images.length}</p>
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((p) => (p - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/60 text-primary-foreground/80 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentIndex((p) => (p + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/60 text-primary-foreground/80 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 justify-center overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`shrink-0 w-14 h-14 rounded-md overflow-hidden transition-all duration-300 ${
                  i === currentIndex
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-primary scale-105"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <img src={img.src} alt={img.caption} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <p className="text-primary-foreground/40 text-xs mt-3 text-center">
          <span className="hidden sm:inline">← → to navigate • Esc to close</span>
          <span className="sm:hidden">Swipe to navigate • Tap outside to close</span>
        </p>
      </div>
    </div>
  );
}

function PricingComparisonModal({
  focusedServiceId,
  allServices,
  onClose,
  onQuoteClick,
}: {
  focusedServiceId: string | null;
  allServices: { id: string; title: string; shortDescription: string; features: string[]; startingPrice: string }[];
  onClose: () => void;
  onQuoteClick: (id: string) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Collect all unique features across all services
  const allFeatureLabels = useMemo(() => {
    const set = new Set<string>();
    allServices.forEach((s) => s.features.forEach((f) => set.add(f)));
    return Array.from(set);
  }, [allServices]);

  // Reorder: focused service first
  const ordered = useMemo(() => {
    if (!focusedServiceId) return allServices;
    const focused = allServices.find((s) => s.id === focusedServiceId);
    if (!focused) return allServices;
    return [focused, ...allServices.filter((s) => s.id !== focusedServiceId)];
  }, [allServices, focusedServiceId]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/90 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-background rounded-2xl border border-border shadow-2xl w-full max-w-5xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">Compare Services</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Side-by-side feature & pricing comparison</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground font-medium border-b border-border w-48 shrink-0">
                  Feature
                </th>
                {ordered.map((service) => (
                  <th
                    key={service.id}
                    className={`text-center px-3 py-3 border-b min-w-[140px] ${
                      service.id === focusedServiceId
                        ? "border-accent bg-accent/5 border-b-2"
                        : "border-border"
                    }`}
                  >
                    <p className={`font-serif font-semibold text-sm ${service.id === focusedServiceId ? "text-accent" : "text-foreground"}`}>
                      {service.title}
                    </p>
                    <p className={`font-serif text-lg font-bold mt-1 ${service.id === focusedServiceId ? "text-accent" : "text-foreground"}`}>
                      {service.startingPrice}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatureLabels.map((feature, fi) => (
                <tr key={fi} className={fi % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                  <td className="px-4 py-2.5 text-foreground/80 border-r border-border/50 font-medium text-xs">
                    {feature}
                  </td>
                  {ordered.map((service) => {
                    const has = service.features.includes(feature);
                    return (
                      <td
                        key={service.id}
                        className={`text-center px-3 py-2.5 ${
                          service.id === focusedServiceId ? "bg-accent/5" : ""
                        }`}
                      >
                        {has ? (
                          <CheckCircle className="h-4 w-4 text-accent mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-card shrink-0 overflow-x-auto">
          {ordered.map((service) => (
            <div key={service.id} className="flex gap-2 shrink-0">
              <Button
                onClick={() => { onClose(); navigate(`/contact?services=${service.id}`); }}
                size="sm"
                className={service.id === focusedServiceId
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
                  : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                }
              >
                {service.title}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingGridSection({ onQuoteClick }: { onQuoteClick: (serviceId: string) => void }) {
  const navigate = useNavigate();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const [galleryServiceId, setGalleryServiceId] = useState<string | null>(null);
  const [galleryServiceTitle, setGalleryServiceTitle] = useState("");

  // Fetch dynamic services from database, fall back to hardcoded
  const { data: dbServices } = useQuery({
    queryKey: ["managed-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_services")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error || !data?.length) return null;
      return data;
    },
    staleTime: 60_000,
  });

  const displayServices = useMemo(() => {
    if (dbServices?.length) {
      return dbServices.map((s) => ({
        id: s.slug,
        title: s.title,
        shortDescription: s.short_description || "",
        description: s.description || "",
        features: s.features || [],
        startingPrice: s.starting_price || "Contact Us",
        icon: s.icon || "arena",
      }));
    }
    return services;
  }, [dbServices]);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [compareServiceId, setCompareServiceId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<string | null>(null);

  const openGallery = (serviceId: string, title: string) => {
    setGalleryServiceId(serviceId);
    setGalleryServiceTitle(title);
  };

  const getTier = (startingPrice: string) => {
    const num = parseInt(startingPrice.replace(/[^0-9]/g, ""), 10) || 0;
    if (num <= 10000) return "basic";
    if (num <= 50000) return "standard";
    return "premium";
  };

  const filteredServices = useMemo(() => {
    let result = displayServices;
    if (activeFilter) result = result.filter((s) => s.id === activeFilter);
    if (activeTier) result = result.filter((s) => getTier(s.startingPrice) === activeTier);
    return result;
  }, [displayServices, activeFilter, activeTier]);

  const { containerRef, visibleItems } = useStaggeredAnimation(filteredServices.length);

  // Compute price range from filtered services
  const priceRange = useMemo(() => {
    const prices = filteredServices
      .map((s) => {
        const match = s.startingPrice.replace(/[^0-9]/g, "");
        return match ? parseInt(match, 10) : null;
      })
      .filter((p): p is number => p !== null)
      .sort((a, b) => a - b);
    if (!prices.length) return null;
    if (prices.length === 1) return `From $${prices[0].toLocaleString()}`;
    return `$${prices[0].toLocaleString()} – $${prices[prices.length - 1].toLocaleString()}`;
  }, [filteredServices]);

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="bottom-to-top" duration={2400} parallaxSpeed={0.08} />
      <BlueprintLineOverlay variant="dimensions" color="dark" />

      <div className="section-container relative z-10">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-8 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-2">Investment Guide</h2>
          {priceRange && (
            <p className="font-serif text-xl text-accent font-semibold mb-2 transition-all duration-300">
              {priceRange}
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            Every project is custom-quoted after an on-site consultation. Below are starting points to help you plan your budget.
          </p>
        </div>

        {/* Quick-filter chips */}
        <div className={`flex flex-wrap items-center justify-center gap-2 mb-8 transition-all duration-500 delay-200 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
              activeFilter === null
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
            }`}
          >
            All Services
          </button>
          {displayServices.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveFilter(activeFilter === s.id ? null : s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                activeFilter === s.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Pricing tier filter */}
        <div className={`flex flex-wrap items-center justify-center gap-2 mb-8 transition-all duration-500 delay-300 ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <span className="text-xs text-muted-foreground mr-1">Budget:</span>
          {[
            { id: null as string | null, label: "All Tiers" },
            { id: "basic", label: "Basic (≤$10k)" },
            { id: "standard", label: "Standard ($10k–$50k)" },
            { id: "premium", label: "Premium ($50k+)" },
          ].map((tier) => (
            <button
              key={tier.label}
              onClick={() => setActiveTier(activeTier === tier.id ? null : tier.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                activeTier === tier.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
          {filteredServices.map((service, index) => {
            const isFlipped = hoveredId === service.id;
            const galleryCount = (serviceGalleryImages[service.id] || []).length;

            return (
              <div
                key={service.id}
                className={`relative transition-all duration-700 ${
                  visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ height: "400px" }}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className="absolute inset-0 transition-transform duration-600 ease-in-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* ——— FRONT ——— */}
                  <div
                    className="absolute inset-0 rounded-xl border border-border bg-background overflow-hidden flex flex-col"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Image */}
                    <div className="relative h-36 overflow-hidden shrink-0">
                      <img
                        src={serviceImages[service.id] || serviceImages["arena-construction"]}
                        alt={service.title}
                        className="w-full h-full object-cover brightness-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Starting at</p>
                        <p className="font-serif text-2xl font-bold text-foreground drop-shadow-sm">
                          {service.startingPrice}
                        </p>
                      </div>
                      {/* Gallery badge */}
                      {galleryCount > 0 && (
                        <button
                          onClick={() => openGallery(service.id, service.title)}
                          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/60 text-primary-foreground/80 text-[10px] hover:bg-primary/80 transition-colors backdrop-blur-sm"
                        >
                          <Images className="h-3 w-3" />
                          {galleryCount}
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {service.shortDescription}
                      </p>
                      <div className="mt-4">
                        <Button
                          onClick={() => navigate(`/services/${service.id}`)}
                          className="w-full bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                          size="sm"
                        >
                          Learn More
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* ——— BACK ——— */}
                  <div
                    className="absolute inset-0 rounded-xl border border-accent bg-background overflow-hidden flex flex-col shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.35)]"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    {/* Accent header bar with tiers */}
                    <div className="px-5 pt-4 pb-3 border-b border-accent/20 bg-accent/5">
                      <h3 className="font-serif text-lg font-semibold text-accent mb-2">
                        {service.title}
                      </h3>
                      <div className="flex gap-1.5">
                        {[
                          { label: "Basic", suffix: "" },
                          { label: "Standard", suffix: "+" },
                          { label: "Premium", suffix: "++" },
                        ].map((tier) => {
                          const baseNum = parseInt(service.startingPrice.replace(/[^0-9]/g, ""), 10) || 0;
                          const multiplier = tier.label === "Basic" ? 1 : tier.label === "Standard" ? 1.8 : 3;
                          const price = `$${Math.round(baseNum * multiplier).toLocaleString()}`;
                          return (
                            <div
                              key={tier.label}
                              className={`flex-1 text-center rounded-md py-1.5 px-1 border transition-colors ${
                                tier.label === "Standard"
                                  ? "bg-accent/15 border-accent/40"
                                  : "bg-background border-border"
                              }`}
                            >
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                                {tier.label}
                              </p>
                              <p className={`font-serif text-sm font-bold leading-tight ${
                                tier.label === "Standard" ? "text-accent" : "text-foreground"
                              }`}>
                                {price}{tier.suffix}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="p-5 flex-1 overflow-y-auto">
                      <p className="text-[10px] uppercase tracking-widest text-accent mb-3">What's included</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground/80"
                            style={{
                              transitionDelay: isFlipped ? `${150 + i * 60}ms` : "0ms",
                              opacity: isFlipped ? 1 : 0,
                              transform: isFlipped ? "translateY(0)" : "translateY(8px)",
                              transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dynamic CTAs with gallery link */}
                    <div className="p-4 pt-0 space-y-2 shrink-0">
                      {galleryCount > 0 && (
                        <Button
                          onClick={() => openGallery(service.id, service.title)}
                          variant="outline"
                          size="sm"
                          className="w-full border-accent/20 text-accent hover:bg-accent/10"
                        >
                          <Images className="mr-1.5 h-3.5 w-3.5" />
                          View Gallery ({galleryCount} photos)
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            trackCtaClick("get_a_quote", { source: "service_card", service: service.id });
                            navigate(`/contact?services=${service.id}`);
                          }}
                          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
                          size="sm"
                        >
                          Get a Quote
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => setCompareServiceId(service.id)}
                          variant="outline"
                          size="sm"
                          className="border-accent/30 text-accent hover:bg-accent/10 shrink-0"
                          title="Compare with other services"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => {
                            trackCtaClick("quick_quote", { source: "service_card", service: service.id });
                            onQuoteClick(service.id);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-accent/30 text-accent hover:bg-accent/10 shrink-0"
                        >
                          Quick Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Demo Gallery Lightbox */}
        {galleryServiceId && (
          <ServiceDemoGallery
            serviceId={galleryServiceId}
            serviceTitle={galleryServiceTitle}
            onClose={() => setGalleryServiceId(null)}
          />
        )}

        {/* Pricing Comparison Modal */}
        {compareServiceId !== null && (
          <PricingComparisonModal
            focusedServiceId={compareServiceId}
            allServices={displayServices}
            onClose={() => setCompareServiceId(null)}
            onQuoteClick={onQuoteClick}
          />
        )}

        {/* Compare all + disclaimer */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <Button
            onClick={() => setCompareServiceId(displayServices[0]?.id || null)}
            variant="outline"
            size="sm"
            className="border-accent/30 text-accent hover:bg-accent/10"
          >
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Compare All Services
          </Button>
          <p className="text-xs text-muted-foreground">
            All pricing is indicative. Final quotes are provided after a free on-site consultation.
          </p>
        </div>

        {/* Interactive Quote Calculator */}
        <QuoteCalculator />
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




  const scrollToBooking = () =>
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });

  return (
    <Layout>
      <StickySubpageCTA
        ctaLabel="Book a Consultation"
        ctaIcon={<CalendarIcon className="h-4 w-4" />}
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

      <ServicesGallery onQuoteClick={setQuoteServiceId} />

      <PricingGridSection onQuoteClick={setQuoteServiceId} />

      <ConstructionProcessSection />

      <LessonsSection />

      <RequestLessonInquiry />

      <DepositPaymentPolicy ctaHref="/contact" ctaLabel="Get a Free Quote" />

      <InsuranceSafetyCard />

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
