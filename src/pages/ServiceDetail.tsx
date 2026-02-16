import { useState, useEffect, useMemo } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Phone, Star, X, ZoomIn, ChevronLeft, ChevronRight, HelpCircle, Images } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { ServicePricingCalculator } from "@/components/ServicePricingCalculator";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { services, siteConfig } from "@/data/content";
import { servicePricingTiers, serviceFaqs } from "@/data/servicePricingFaq";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

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
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import arenaSandPrep1 from "@/assets/arena-sand-prep-1.jpg";
import arenaSandPrep2 from "@/assets/arena-sand-prep-2.jpg";

// Construction process images
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeFrameTrench from "@/assets/main-ridge-frame-trench.jpg";
import mainRidgePostDepth from "@/assets/main-ridge-post-depth.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeTimberPosts from "@/assets/main-ridge-timber-posts.jpg";
import mainRidgeTrenchUtilities from "@/assets/main-ridge-trench-utilities.jpg";

// Primary images per service
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

// Gallery images per service
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

// Construction process steps
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

/* ── Gallery Lightbox ──────────────────────────────────── */

function GalleryLightbox({
  images,
  serviceTitle,
  onClose,
}: {
  images: { src: string; caption: string }[];
  serviceTitle: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
        <button onClick={onClose} className="absolute -top-12 right-0 text-primary-foreground/70 hover:text-primary-foreground transition-colors" aria-label="Close gallery">
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-1">Gallery</p>
          <h3 className="font-serif text-xl text-primary-foreground">{serviceTitle}</h3>
        </div>

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

/* ── Construction Process ──────────────────────────────── */

function ConstructionProcess() {
  const { containerRef, visibleItems } = useStaggeredAnimation(constructionSteps.length);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();

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
          <h2 className="heading-section text-foreground mb-4">Our Construction Process</h2>
          <p className="text-muted-foreground">
            Quality equine facilities don't happen by accident. Here's a behind-the-scenes
            look at how we bring your vision to life.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {constructionSteps.map((step, index) => (
            <div
              key={index}
              className={`group text-left rounded-lg transition-all duration-700 ${
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 relative">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-foreground text-sm group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Service Detail Page ───────────────────────────────── */

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.id === slug);
  const [showGallery, setShowGallery] = useState(false);

  if (!service) return <Navigate to="/services" replace />;

  const tiers = servicePricingTiers[service.id] || [];
  const faqs = serviceFaqs[service.id] || [];
  const galleryImages = serviceGalleryImages[service.id] || [];
  const heroImage = serviceImages[service.id] || equitanaArena;

  // Find adjacent services for navigation
  const currentIndex = services.findIndex((s) => s.id === slug);
  const prevService = currentIndex > 0 ? services[currentIndex - 1] : null;
  const nextService = currentIndex < services.length - 1 ? services[currentIndex + 1] : null;

  return (
    <Layout>
      <StickySubpageCTA
        ctaLabel="Get a Quote"
        ctaIcon={<Phone className="h-4 w-4" />}
        onCtaClick={() => (window.location.href = `/contact?services=${service.id}`)}
      />

      <PageHeader
        title={service.title}
        description={service.shortDescription}
      />

      {/* Breadcrumb + back */}
      <section className="bg-background border-b border-border">
        <div className="section-container py-4 flex items-center justify-between">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Services
          </Link>
          {galleryImages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGallery(true)}
              className="text-accent hover:text-accent/80"
            >
              <Images className="mr-1.5 h-4 w-4" />
              View Gallery ({galleryImages.length})
            </Button>
          )}
        </div>
      </section>

      {/* Hero image + description */}
      <section className="section-padding bg-background relative overflow-hidden">
        <BlueprintScene preset="barn" />
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                What We Offer
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-6">
                {service.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                {service.description}
              </p>

              <ul className="grid sm:grid-cols-2 gap-3">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-foreground text-sm">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <img
                src={heroImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      {tiers.length > 0 && (
        <section className="section-padding bg-card">
          <div className="section-container max-w-5xl">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3 text-center">
              Pricing
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 text-center">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Every project is unique — these tiers give you a starting point. We'll customise to your exact needs.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "relative rounded-xl border bg-background p-6 flex flex-col transition-shadow hover:shadow-lg",
                    tier.popular
                      ? "border-accent shadow-md ring-1 ring-accent/20"
                      : "border-border"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                        <Star className="h-3 w-3" /> Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-2xl font-bold text-accent mb-2">{tier.price}</p>
                  <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={tier.popular ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      tier.popular && "bg-accent text-accent-foreground hover:bg-accent/90"
                    )}
                  >
                    <Link to={`/contact?services=${service.id}&ref=tier-${tier.name.toLowerCase()}`}>
                      Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing calculator */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <ServicePricingCalculator serviceId={service.id} />
        </div>
      </section>

      {/* Gallery grid */}
      {galleryImages.length > 0 && (
        <section className="section-padding bg-card">
          <div className="section-container">
            <div className="text-center mb-8">
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                Project Gallery
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground">
                {service.title} in Action
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setShowGallery(true)}
                  className="group aspect-[4/3] rounded-lg overflow-hidden relative"
                >
                  <img
                    src={img.src}
                    alt={img.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/70 to-transparent p-2 text-[11px] text-primary-foreground/80">
                    {img.caption}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Construction process (shown for build-related services) */}
      {["arena-construction", "barn-construction", "full-facility", "infrastructure"].includes(service.id) && (
        <ConstructionProcess />
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="section-padding bg-background">
          <div className="section-container max-w-3xl">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3 text-center">
              Common Questions
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-8 text-center">
              {service.title} FAQ
            </h2>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-lg border border-border bg-card px-5"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 sm:p-8 text-center">
              <p className="font-serif text-lg font-semibold text-foreground mb-2">
                Still have questions about {service.title.toLowerCase()}?
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                Send us a quick message and we'll get back to you within 1–2 business days.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to={`/contact?services=${service.id}&ref=faq`}>
                    Ask a Question <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${siteConfig.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Adjacent service navigation */}
      <section className="bg-card border-t border-border">
        <div className="section-container py-6">
          <div className="flex items-center justify-between">
            {prevService ? (
              <Link
                to={`/services/${prevService.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{prevService.title}</span>
                <span className="sm:hidden">Previous</span>
              </Link>
            ) : <div />}
            {nextService ? (
              <Link
                to={`/services/${nextService.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <span className="hidden sm:inline">{nextService.title}</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <ParallaxCTA
        title="Ready to Get Started?"
        description="Tell us about your project and we'll prepare a personalised quote within 1–2 business days."
        backgroundImage={mainRidgeBarnFrame}
        primaryButtonText="Request a Quote"
        primaryButtonLink={`/contact?services=${service.id}`}
        showPhoneButton={true}
      />

      {/* Gallery Lightbox */}
      {showGallery && galleryImages.length > 0 && (
        <GalleryLightbox
          images={galleryImages}
          serviceTitle={service.title}
          onClose={() => setShowGallery(false)}
        />
      )}
    </Layout>
  );
}
