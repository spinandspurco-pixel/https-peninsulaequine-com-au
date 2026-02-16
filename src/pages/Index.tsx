import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown, Star, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { MultiStepInquiryForm } from "@/components/MultiStepInquiryForm";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { siteConfig, services, testimonials } from "@/data/content";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import { BlueprintScene } from "@/components/BlueprintScene";
import heroVideo from "@/assets/videos/main-ridge-woodwork-1.mp4";
import ciroWide from "@/assets/ciro-wide.png";
import stoneworkBW from "@/assets/aberdeen-stonework-bw.jpg";
import peBanner from "@/assets/pe-banner-2.png";
import peLogo from "@/assets/pe-logo-new.png";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";


import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";

const featuredServices = services.slice(0, 6);

/* ─── 1. Hero ─────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Video base layer */}
      <video
        autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/70" />

      {/* Animated blueprint overlay with new banner */}
      <BlueprintScene preset="hero" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--primary))_85%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* PE Logo mark */}
        <img
          src={peLogo}
          alt="Peninsula Equine"
          loading="eager"
          className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8 drop-shadow-[0_4px_30px_hsl(var(--accent)/0.3)]"
        />
        <div className="w-16 h-px mx-auto mb-8 bg-accent" />
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-primary-foreground leading-[1.05] mb-4">
          Peninsula<br /><span className="text-accent">Equine</span>
        </h1>
        <p className="font-sans text-xs sm:text-sm tracking-[0.4em] uppercase text-primary-foreground/50 mb-3">
          From Dirt to Dynasty
        </p>
        <p className="text-sm sm:text-base text-primary-foreground/70 max-w-lg mx-auto mb-8 leading-relaxed">
          World-class arenas, barns &amp; facilities — designed by a horseman, built to last.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm px-10 tracking-[0.15em] uppercase font-sans font-medium shadow-[0_4px_20px_hsl(var(--accent)/0.35)]"
            onClick={() => document.getElementById('free-quote')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get a Free Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            asChild variant="outline" size="lg"
            className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-sm px-10 tracking-[0.15em] uppercase font-sans"
          >
            <Link to="/services">View Our Work</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors cursor-pointer"
        aria-label="Scroll to content"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}

/* ─── 2. Intro ────────────────────────────────────── */
function IntroSection() {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section id="intro" className="bg-background relative">
      {/* Animated blueprint bg for intro */}
      <BlueprintScene preset="intro" />
      <div className="section-padding">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <SectionTransition variant="fade-up" duration={600}>
              <p className="text-muted-foreground uppercase tracking-[0.25em] text-sm mb-8">
                Mornington Peninsula, Victoria
              </p>
            </SectionTransition>
            <SectionTransition variant="blur-in" delay={100} duration={800}>
              <h2 className="heading-section text-foreground mb-8">
                Where world-class equine facilities are built by the hands of a horseman
              </h2>
            </SectionTransition>
            <SectionTransition variant="fade-up" delay={200} duration={700}>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Peninsula Equine is a construction company specializing in premium arenas, barns,
                and equestrian infrastructure. With decades of experience in both riding and building,
                Ciro brings a horseman's intuition to every project.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center text-foreground font-medium hover:text-accent transition-colors group"
              >
                <span className="border-b border-foreground group-hover:border-accent transition-colors pb-1">
                  Learn more about Ciro
                </span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </SectionTransition>
          </div>
        </div>
      </div>

      {/* Image break */}
      <div
        ref={imageRef}
        className="relative h-[40vh] min-h-[300px] overflow-hidden"
        style={{ opacity: imageVisible ? 1 : 0, transition: "opacity 1s ease-out" }}
      >
        <img
          src={stoneworkBW}
          alt="Peninsula Equine stonework craftsmanship"
          loading="lazy" decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40" />
      </div>
    </section>
  );
}

/* ─── 3. Services Preview ─────────────────────────── */
function ServicesPreviewSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-primary text-primary-foreground overflow-hidden relative">
      <BlueprintScene preset="services" />
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <AnimatedDivider className="mx-auto mb-8 bg-accent" />
          <SectionTransition variant="fade-up">
            <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-sm mb-4">What We Build</p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-4">Built for Horses, Designed by a Horseman</h2>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={200}>
            <p className="text-primary-foreground/60 leading-relaxed text-lg">
              Every project is custom — here's where each journey begins.
            </p>
          </SectionTransition>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-primary-foreground/10">
          {featuredServices.map((service, i) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className={`group p-8 sm:p-10 bg-primary hover:bg-primary-foreground/[0.06] transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-serif text-xl sm:text-2xl text-primary-foreground mb-3 group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-primary-foreground/55 text-sm leading-relaxed mb-4">
                {service.shortDescription}
              </p>
              {service.startingPrice && (
                <p className="text-accent font-semibold text-sm mb-4">From {service.startingPrice}</p>
              )}
              <span className="inline-flex items-center text-sm text-primary-foreground/70 group-hover:text-accent transition-colors">
                Learn More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={400} className="text-center mt-12">
          <Button
            asChild variant="outline" size="lg"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-sm px-10 tracking-[0.15em] uppercase font-sans"
          >
            <Link to="/services">
              View All Services <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </section>
  );
}

/* ─── 4. Gallery Preview ──────────────────────────── */
function GalleryPreviewSection() {
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const images = [
    { src: aberdeenBarnInterior, alt: "Aberdeen Farm — luxury barn interior" },
    { src: mainRidgeInterior, alt: "Main Ridge — open barn with natural light" },
    { src: mainRidgeBrickwork, alt: "Main Ridge — custom brickwork detail" },
    { src: qldCourtyard, alt: "Queensland Facility — courtyard" },
    { src: aberdeenStonework, alt: "Aberdeen Farm — stonework masonry" },
    { src: equitanaArena1, alt: "Equitana Melbourne — competition arena" },
  ];

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const goPrev = useCallback(() => setLightboxIdx(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length]);
  const goNext = useCallback(() => setLightboxIdx(i => i !== null ? (i + 1) % images.length : null), [images.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, closeLightbox, goPrev, goNext]);

  return (
    <>
      <section className="section-padding bg-background overflow-hidden">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <AnimatedDivider className="mx-auto mb-8" />
            <SectionTransition variant="fade-up">
              <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">Portfolio</p>
            </SectionTransition>
            <SectionTransition variant="blur-in" delay={100}>
              <h2 className="heading-editorial mb-6">Craftsmanship in Every Detail</h2>
            </SectionTransition>
            <SectionTransition variant="fade-up" delay={200}>
              <p className="text-muted-foreground leading-relaxed">
                Explore our completed projects — arenas, barns, and bespoke stonework built to last generations.
              </p>
            </SectionTransition>
          </div>

          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxIdx(i)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted/20 cursor-pointer transition-all duration-700 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
                aria-label={`View: ${img.alt}`}
              >
                <img src={img.src} alt={img.alt} loading="lazy" decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="h-5 w-5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
            ))}
          </div>

          <SectionTransition variant="fade-up" delay={400} className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/gallery">
                View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </SectionTransition>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Image lightbox"
        >
          <button onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          ><X className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          ><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Next image"
          ><ChevronRight className="h-5 w-5" /></button>
          <div className="max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightboxIdx].src} alt={images[lightboxIdx].alt} className="w-full h-full object-contain rounded-lg" />
            <p className="text-white/70 text-sm text-center mt-4">
              {images[lightboxIdx].alt}
              <span className="text-white/40 ml-3">{lightboxIdx + 1} / {images.length}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── 5. Testimonial Highlight ────────────────────── */
function TestimonialHighlight() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });
  const topQuotes = testimonials.slice(0, 3);

  return (
    <section ref={ref} className="section-padding bg-card overflow-hidden">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <AnimatedDivider className="mx-auto mb-8" />
          <SectionTransition variant="fade-up">
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">Proven Results</p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-4">What Our Clients Say</h2>
          </SectionTransition>
        </div>

        <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {topQuotes.map((t, i) => (
            <div
              key={t.id}
              className="p-8 rounded-lg bg-background border border-border hover:border-accent/50 transition-all duration-500 hover:shadow-lg"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <blockquote className="text-foreground leading-relaxed mb-6 font-serif italic">
                "{t.quote.length > 150 ? t.quote.slice(0, 150) + "…" : t.quote}"
              </blockquote>
              <div className="pt-5 border-t border-border">
                <p className="font-serif font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={400} className="text-center mt-12">
          <Link
            to="/testimonials"
            className="inline-flex items-center text-muted-foreground text-sm hover:text-accent transition-colors group"
          >
            <span className="border-b border-muted-foreground/40 group-hover:border-accent transition-colors pb-0.5">
              Read all reviews
            </span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </SectionTransition>
      </div>
    </section>
  );
}

/* ─── 6. Quote CTA ────────────────────────────────── */
function InquiryFormSection() {
  return (
    <section id="free-quote" className="section-padding bg-background">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <SectionTransition variant="fade-up">
            <div className="text-center mb-10">
              <AnimatedDivider className="mx-auto mb-8" />
              <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">No Obligation</p>
              <h2 className="heading-section text-foreground">Get a Free Quote</h2>
              <p className="text-muted-foreground mt-3 text-base">Tell us about your project and we'll prepare a custom estimate — no strings attached.</p>
            </div>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={150}>
            <MultiStepInquiryForm />
          </SectionTransition>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────── */
export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <IntroSection />
      <ServicesPreviewSection />
      <GalleryPreviewSection />
      <TestimonialHighlight />
      <InquiryFormSection />
    </Layout>
  );
}
