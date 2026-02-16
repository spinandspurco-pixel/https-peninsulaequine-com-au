import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown, CalendarIcon, TrendingUp, Clock, Award, Users, X, Mail, Send, MessageSquare, Star, ShieldCheck } from "lucide-react";
import { HeroLeadForm } from "@/components/HeroLeadForm";
import { useABTest } from "@/hooks/useABTest";
import { BookingWidget } from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { MajorEventsSection } from "@/components/MajorEventsSection";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";

import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BookingLandingSection } from "@/components/BookingLandingSection";
import { LeadMagnetPopup } from "@/components/LeadMagnetPopup";
import { StickyHeroCTA } from "@/components/StickyHeroCTA";
import { SectionTransition, AnimatedDivider, StaggeredTransition } from "@/components/SectionTransition";
import { siteConfig, services, testimonials, aboutCiro } from "@/data/content";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
// Import images
import heroSunset from "@/assets/hero-sunset.png";

import horseAction from "@/assets/horse-action.png";
import hatDetail from "@/assets/hat-detail.png";
import ciroWide from "@/assets/ciro-wide.png";
import spurDetail from "@/assets/spur-detail.png";
import stoneworkBW from "@/assets/aberdeen-stonework-bw.jpg";
import logoPeMark from "@/assets/logo-pe-mark.png";
import peBanner from "@/assets/pe-banner.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
import { BlueprintDivider } from "@/components/BlueprintDivider";
import { LoadingSplash } from "@/components/LoadingSplash";

// Blueprint images for hero
import blueprintElevation from "@/assets/blueprint-elevation.png";

// Featured services for homepage
const featuredServices = services.slice(0, 4);

function HeroCTAToggle({ heroMode, setHeroMode }: { heroMode: "book" | "consult"; setHeroMode: (m: "book" | "consult") => void }) {
  const { variant, trackClick } = useABTest({
    testName: "hero_cta_2026",
    variants: ["control", "urgency", "social_proof"],
  });

  // Variant-specific copy
  const ctaCopy = {
    control: {
      bookLabel: "Book a Lesson",
      consultLabel: "Request a Consult",
      consultHeadline: "Tell us about your project — we'll get back to you within 1–2 business days.",
      consultButton: "Start a Consultation",
    },
    urgency: {
      bookLabel: "Book Today — Limited Spots",
      consultLabel: "Get Your Free Quote",
      consultHeadline: "Spots fill fast — lock in your consultation before the season books out.",
      consultButton: "Claim Your Free Quote",
    },
    social_proof: {
      bookLabel: "Join 200+ Happy Riders",
      consultLabel: "See Why They Trust Us",
      consultHeadline: "Trusted by over 200 riders across the Mornington Peninsula. Start your journey today.",
      consultButton: "Start Your Journey",
    },
  };

  const copy = ctaCopy[variant as keyof typeof ctaCopy] || ctaCopy.control;

  return (
    <div className="flex flex-col items-center gap-4 mt-2">
      {/* Toggle pills */}
      <div className="inline-flex rounded-full border border-hero-glass-border bg-hero-glass backdrop-blur-sm p-1">
        <button
          onClick={() => { setHeroMode("book"); trackClick({ action: "toggle", target: "book" }); }}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
            heroMode === "book"
              ? "bg-accent text-accent-foreground shadow-md"
              : "text-hero-text-muted hover:text-hero-text"
          }`}
        >
          <CalendarIcon className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          {copy.bookLabel}
        </button>
        <button
          onClick={() => { setHeroMode("consult"); trackClick({ action: "toggle", target: "consult" }); }}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
            heroMode === "consult"
              ? "bg-accent text-accent-foreground shadow-md"
              : "text-hero-text-muted hover:text-hero-text"
          }`}
        >
          <MessageSquare className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          {copy.consultLabel}
        </button>
      </div>

      {/* Social proof badge for that variant */}
      {variant === "social_proof" && (
        <div className="flex items-center gap-2 text-hero-text-muted text-xs">
          <div className="flex -space-x-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-accent/40 border border-hero-glass-border flex items-center justify-center text-[8px] text-hero-text font-bold">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-accent" /> 4.9/5 from 200+ riders</span>
        </div>
      )}

      {/* Urgency badge */}
      {variant === "urgency" && (
        <div className="flex items-center gap-1.5 text-accent text-xs font-medium animate-pulse">
          <ShieldCheck className="h-3.5 w-3.5" />
          Only 3 consultation spots left this month
        </div>
      )}

      <div className="w-full max-w-lg mx-auto transition-all duration-300">
        {heroMode === "book" ? (
          <BookingWidget variant="hero" />
        ) : (
          <HeroLeadForm />
        )}
      </div>
    </div>
  );
}

function HeroSection({ variant = "banner" }: { variant?: "logo" | "banner" }) {
  const [scrollY, setScrollY] = useState(0);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [heroPhase, setHeroPhase] = useState(0); // 0=hidden, 1=blueprints, 2=banner, 3=cta
  const [heroMode, setHeroMode] = useState<"book" | "consult">("book");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Phased entrance
  useEffect(() => {
    const t1 = setTimeout(() => setHeroPhase(1), 300);
    const t2 = setTimeout(() => setHeroPhase(2), 1000);
    const t3 = setTimeout(() => setHeroPhase(3), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.4;
  const contentOffset = scrollY * 0.15;
  const overlayOpacity = Math.min(scrollY / 800, 0.5);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image with parallax */}
      <div 
        className="absolute inset-[-20%] will-change-transform"
        style={{ 
          transform: `translateY(${parallaxOffset}px) scale(1.2)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <img
          src={heroSunset}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Blueprint overlay layers — phase 1 sweep-in */}
      <div
        style={{
          opacity: heroPhase >= 1 ? 1 : 0,
          transition: "opacity 1.2s ease-out",
        }}
      >
        <BlueprintBackground image={blueprintFacility} opacity={0.08} direction="left-to-right" duration={2500} parallaxSpeed={0.04} />
        <BlueprintBackground image={blueprintElevation} opacity={0.05} direction="right-to-left" duration={3000} parallaxSpeed={0.08} className="scale-110" />
        <BlueprintBackground image={blueprintBarn} opacity={0.04} direction="bottom-to-top" duration={2800} parallaxSpeed={0.06} />
      </div>

      {/* Blueprint line overlays — phase 1 draw-on */}
      <div
        style={{
          opacity: heroPhase >= 1 ? 1 : 0,
          transition: "opacity 1s ease-out 0.4s",
        }}
      >
        <BlueprintLineOverlay variant="dimensions" color="light" />
        <BlueprintLineOverlay variant="barn" color="light" />
      </div>

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/80 transition-opacity duration-300"
        style={{ opacity: 1 + overlayOpacity }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* Blueprint corner brackets — architectural framing cues */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          opacity: heroPhase >= 1 ? 0.2 : 0,
          transition: "opacity 1s ease-out 0.6s",
        }}
      >
        {/* Top-left bracket */}
        <path d="M 40,40 L 40,120 M 40,40 L 120,40" fill="none" stroke="hsl(45 40% 97%)" strokeWidth="0.8" />
        {/* Top-right bracket */}
        <path d="M 960,40 L 960,120 M 960,40 L 880,40" fill="none" stroke="hsl(45 40% 97%)" strokeWidth="0.8" />
        {/* Bottom-left bracket */}
        <path d="M 40,960 L 40,880 M 40,960 L 120,960" fill="none" stroke="hsl(45 40% 97%)" strokeWidth="0.8" />
        {/* Bottom-right bracket */}
        <path d="M 960,960 L 960,880 M 960,960 L 880,960" fill="none" stroke="hsl(45 40% 97%)" strokeWidth="0.8" />
        {/* Centre crosshair */}
        <line x1="490" y1="500" x2="510" y2="500" stroke="hsl(35 75% 50% / 0.3)" strokeWidth="0.5" />
        <line x1="500" y1="490" x2="500" y2="510" stroke="hsl(35 75% 50% / 0.3)" strokeWidth="0.5" />
        {/* Top dimension line */}
        <line x1="120" y1="40" x2="880" y2="40" stroke="hsl(45 40% 97% / 0.08)" strokeWidth="0.3" />
        {/* Left dimension line */}
        <line x1="40" y1="120" x2="40" y2="880" stroke="hsl(45 40% 97% / 0.08)" strokeWidth="0.3" />
      </svg>

      {/* Centered Content — phase 2 & 3 */}
      <div 
        className="relative z-10 text-center px-4 will-change-transform"
        style={{ 
          transform: `translateY(${-contentOffset}px)`,
          opacity: Math.max(1 - scrollY / 600, 0)
        }}
      >
        {/* Accent divider — phase 2 */}
        <div
          className="divider mx-auto mb-8 bg-accent/80"
          style={{
            opacity: heroPhase >= 2 ? 1 : 0,
            transform: heroPhase >= 2 ? "scaleX(1)" : "scaleX(0)",
            transition: "opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.22,0.61,0.36,1)",
          }}
        />
        
        {variant === "banner" ? (
          <div
            className="mb-8"
            style={{
              opacity: heroPhase >= 2 ? 1 : 0,
              transform: heroPhase >= 2 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
              transition: "opacity 0.8s ease-out 0.1s, transform 1s cubic-bezier(0.22,0.61,0.36,1) 0.1s",
            }}
          >
            <img
              src={peBanner}
              alt="Peninsula Equine — From Dirt to Dynasty"
              loading="eager"
              decoding="async"
              onLoad={() => setBannerLoaded(true)}
              className={`w-[280px] sm:w-[400px] md:w-[520px] lg:w-[600px] mx-auto h-auto object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-opacity duration-500 ${
                bannerLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        ) : (
          <>
            <div
              className="mb-8"
              style={{
                opacity: heroPhase >= 2 ? 1 : 0,
                transform: heroPhase >= 2 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
                transition: "opacity 0.8s ease-out, transform 1s cubic-bezier(0.22,0.61,0.36,1)",
              }}
            >
              <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 mx-auto transition-transform duration-500 hover:scale-105">
                <img
                  src={logoPeMark}
                  alt="Peninsula Equine"
                  className="w-full h-full object-contain drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]"
                />
              </div>
            </div>
            <p
              className="font-serif text-xl sm:text-2xl md:text-3xl text-white tracking-[0.12em] uppercase font-normal text-shadow-editorial mb-4"
              style={{
                opacity: heroPhase >= 2 ? 1 : 0,
                transition: "opacity 0.6s ease-out 0.3s",
              }}
            >
              Peninsula Equine
            </p>
          </>
        )}

        {/* Subtitle + CTA — phase 3 */}
        <div
          style={{
            opacity: heroPhase >= 3 ? 1 : 0,
            transform: heroPhase >= 3 ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease-out, transform 0.8s ease-out",
          }}
        >
          <p className="font-sans text-sm sm:text-base tracking-[0.3em] uppercase text-hero-text-muted mb-6">
            Facility Construction • Training • Excellence
          </p>
          <HeroCTAToggle heroMode={heroMode} setHeroMode={setHeroMode} />
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-all cursor-pointer"
        style={{ opacity: Math.max(1 - scrollY / 200, 0) }}
        aria-label="Scroll to content"
      >
        <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </button>
    </section>
  );
}

function IntroSection() {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const { ref: parallaxRef } = useParallax<HTMLDivElement>({ speed: 0.25 });
  const [phase, setPhase] = useState(0); // 0=hidden, 1=lines, 2=fill, 3=logo

  useEffect(() => {
    if (!imageVisible) return;
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [imageVisible]);

  return (
    <section id="intro" className="bg-background relative overflow-hidden">
      {/* Multi-layer blueprint reveal */}
      <BlueprintBackground image={blueprintFacility} opacity={0.06} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
      <BlueprintBackground image={blueprintDetail} opacity={0.04} direction="bottom-to-top" duration={2400} parallaxSpeed={0.08} className="scale-105" />
      <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="right-to-left" duration={2800} parallaxSpeed={0.1} />
      <BlueprintLineOverlay variant="dimensions" color="dark" />
      <BlueprintLineOverlay variant="detail" color="dark" />

      {/* Location tagline */}
      <div className="section-padding border-b border-border relative z-10">
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
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Peninsula Equine is a construction company specializing in premium arenas, barns, 
                and equestrian infrastructure. With decades of experience in both riding and building, 
                Ciro brings a horseman's intuition to every project.
              </p>
            </SectionTransition>
          </div>
        </div>
      </div>

      {/* Cinematic Blueprint Reveal Panel */}
      <div 
        ref={(node) => {
          (imageRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="relative h-[55vh] min-h-[400px] overflow-hidden"
        style={{
          clipPath: imageVisible ? "inset(0 0 0 0)" : "inset(8% 4% 8% 4%)",
          opacity: imageVisible ? 1 : 0,
          transition: "opacity 0.8s ease-out, clip-path 1.2s cubic-bezier(0.22,0.61,0.36,1)"
        }}
      >
        {/* Base background */}
        <div className="absolute inset-0 bg-primary" />

        {/* Phase 1: Blueprint image layers sweep in */}
        <div
          className="absolute inset-0"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: "opacity 1.2s ease-out",
          }}
        >
          <BlueprintBackground image={blueprintFacility} opacity={0.18} direction="left-to-right" duration={1400} parallaxSpeed={0.04} />
          <BlueprintBackground image={blueprintElevation} opacity={0.12} direction="right-to-left" duration={1800} parallaxSpeed={0.08} className="scale-110" />
        </div>

        {/* Phase 2: Architectural line overlays draw on */}
        <div
          className="absolute inset-0"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transition: "opacity 0.8s ease-out 0.2s",
          }}
        >
          <BlueprintLineOverlay variant="barn" color="light" />
          <BlueprintLineOverlay variant="front-elevation" color="light" />
        </div>

        {/* Phase 2: Secondary blueprint layer for depth */}
        <div
          className="absolute inset-0"
          style={{
            opacity: phase >= 2 ? 0.5 : 0,
            transition: "opacity 1s ease-out 0.4s",
          }}
        >
          <BlueprintLineOverlay variant="dimensions" color="light" />
        </div>

        {/* Phase 3: Centered PE logo watermark pulses in */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={logoPeMark} 
            alt="" 
            aria-hidden="true"
            className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain select-none"
            style={{
              opacity: phase >= 3 ? 0.25 : 0,
              transform: phase >= 3 ? "scale(1)" : "scale(0.7)",
              filter: "brightness(1.5) drop-shadow(0 0 40px hsl(var(--accent) / 0.15))",
              transition: "opacity 1s ease-out, transform 1.2s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          />
        </div>

        {/* Tagline text that fades in with logo */}
        <div 
          className="absolute bottom-8 left-0 right-0 text-center"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s",
          }}
        >
          <p className="text-primary-foreground/40 text-xs sm:text-sm tracking-[0.3em] uppercase font-medium">
            From Dirt to Dynasty
          </p>
        </div>

        {/* Gradient edges for seamless blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 pointer-events-none" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--primary)/0.5)_100%)] pointer-events-none" />
      </div>
    </section>
  );
}

function MissionSection() {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintBarn} opacity={0.04} direction="right-to-left" duration={1800} />
      <BlueprintLineOverlay variant="detail" color="dark" />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="lg:col-span-5">
            <AnimatedDivider className="mb-8" />
            
            <SectionTransition variant="fade-right" delay={100}>
              <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
                Our Mission
              </p>
            </SectionTransition>
            
            <SectionTransition variant="fade-right" delay={200}>
              <h2 className="heading-editorial text-foreground mb-8">
                Built by a horseman,<br />
                <span className="text-accent">for horsemen</span>
              </h2>
            </SectionTransition>
            
            <SectionTransition variant="blur-in" delay={300} duration={800}>
              <blockquote className="text-xl sm:text-2xl text-foreground font-serif italic leading-relaxed mb-8">
                "The finest facilities come from understanding both the craft of construction 
                and the soul of the horse."
              </blockquote>
            </SectionTransition>
            
            <SectionTransition variant="fade-up" delay={400}>
              <p className="text-muted-foreground leading-relaxed mb-8">
                When Ciro walks your property, he's not just seeing construction—he's seeing 
                how your horses will move, where water will drain, and what will keep your 
                operation running smoothly for decades.
              </p>
            </SectionTransition>
            
            <SectionTransition variant="fade-up" delay={500}>
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

          {/* Image with reveal animation */}
          <div 
            ref={imageRef}
            className={`lg:col-span-7 transition-all duration-1000 ease-out ${
              imageVisible 
                ? "opacity-100 translate-x-0 [clip-path:inset(0_0_0_0)]" 
                : "opacity-0 translate-x-12 [clip-path:inset(0_0_0_100%)]"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="aspect-[4/5] overflow-hidden bg-muted/20">
              <img
                src={horseAction}
                alt="Horse in training"
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-transform duration-1000 ${
                  imageVisible ? "scale-100" : "scale-110"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-background overflow-hidden relative">
      {/* Layer 1: Full facility plan – slow drift up */}
      <BlueprintBackground image={blueprintFacility} opacity={0.05} parallaxSpeed={0.06} />
      {/* Layer 2: Barn detail – opposite drift for depth separation */}
      <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="right-to-left" parallaxSpeed={0.12} duration={2000} className="scale-110" />
      {/* Layer 3: Architectural line overlay at medium depth */}
      <BlueprintLineOverlay variant="barn" color="dark" />
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <AnimatedDivider className="mx-auto mb-8" />
          
          <SectionTransition variant="fade-up" delay={100}>
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
              Our Services
            </p>
          </SectionTransition>
          
          <SectionTransition variant="scale-up" delay={200}>
            <h2 className="heading-section text-foreground">
              What We Build
            </h2>
          </SectionTransition>
        </div>

        {/* Services Grid with staggered reveal */}
        <div ref={gridRef} className="grid sm:grid-cols-2 gap-px bg-border">
          {featuredServices.map((service, index) => (
            <div
              key={service.id}
              className={`group p-10 sm:p-12 lg:p-16 bg-background hover:bg-card transition-all duration-700 ease-out ${
                gridVisible 
                  ? "opacity-100 translate-y-0 [clip-path:inset(0_0_0_0)]" 
                  : "opacity-0 translate-y-8 [clip-path:inset(0_0_10%_0)]"
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-4">
                {service.id.replace(/-/g, ' ')}
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl text-foreground mb-4 group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {service.shortDescription}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Link
                  to={`/services#${service.id}`}
                  className="inline-flex items-center text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  <span className="border-b border-current pb-0.5">Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={`/contact?service=${service.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_16px_hsl(var(--accent)/0.3)] whitespace-nowrap"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Book Consultation
                </Link>
              </div>
            </div>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={400} className="text-center mt-16">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background"
          >
            <Link to="/services">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </section>
  );
}

function BookingCTABanner() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="relative py-16 sm:py-20 bg-accent overflow-hidden"
    >
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-10">
        <BlueprintLineOverlay variant="dimensions" color="dark" />
      </div>

      <div
        className={`section-container relative z-10 text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <CalendarIcon className="h-8 w-8 text-accent-foreground/80 mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-accent-foreground font-semibold mb-4">
            Book Your Free Consultation
          </h2>
          <p className="text-accent-foreground/80 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Walk us through your property and vision. We'll provide expert guidance 
            on what's possible — no obligation, no pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 btn-hover-lift"
            >
              <Link to="/contact">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-accent-foreground/40 text-accent-foreground hover:bg-accent-foreground hover:text-accent text-base px-8"
            >
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadCaptureSection({ submitted, onSubmitted }: { submitted: boolean; onSubmitted: () => void }) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.2 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) return;
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return;

    setSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.from("inquiries").insert({
        name: trimmedName.slice(0, 100),
        email: trimmedEmail.slice(0, 255),
        services: ["general-inquiry"],
        project_details: "Quick lead capture from homepage",
        status: "new",
      });

      // Trigger auto-email follow-up
      supabase.functions.invoke("send-inquiry-notification", {
        body: {
          name: trimmedName,
          email: trimmedEmail,
          services: ["general-inquiry"],
          goals: "Homepage lead capture — interested in consultation",
        },
      }).catch(() => {});

      onSubmitted();
    } catch {
      // Silently fail – form still shows success to avoid blocking UX
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="lead-capture" ref={ref} className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintDetail} opacity={0.03} direction="bottom-to-top" duration={2000} />
      <div
        className={`section-container relative z-10 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedDivider className="mx-auto mb-8" />
          <Mail className="h-7 w-7 text-accent mx-auto mb-4" />
          <h2 className="heading-editorial text-foreground mb-3">
            Get Started Today
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Leave your details and we'll reach out with a personalised consultation — 
            no spam, just expert advice.
          </p>

          {submitted ? (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-8">
              <p className="font-serif text-xl text-foreground font-semibold mb-2">Thank you!</p>
              <p className="text-muted-foreground">We'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 btn-hover-lift"
              >
                {submitting ? "…" : <><Send className="h-4 w-4 mr-2" />Send</>}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const { ref: imagesRef, isVisible: imagesVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const images = [
    { src: hatDetail, alt: "Craftsmanship details" },
    { src: stoneworkBW, alt: "Stone and wood craftsmanship" },
    { src: ciroWide, alt: "Ciro with horse" },
  ];

  return (
    <section className="bg-primary text-primary-foreground overflow-hidden">
      {/* Full-width image strip with mask reveal */}
      <div 
        ref={imagesRef}
        className="grid grid-cols-3 h-[40vh] min-h-[300px]"
      >
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`overflow-hidden bg-muted/20 transition-all duration-1000 ease-out ${
              imagesVisible 
                ? "opacity-100 [clip-path:inset(0_0_0_0)]" 
                : "opacity-0 [clip-path:inset(100%_0_0_0)]"
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover hover:scale-105 transition-all duration-1000 ${
                imagesVisible ? "scale-100" : "scale-110"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Gallery CTA */}
      <div className="section-padding">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedDivider className="mx-auto mb-8 bg-accent" />
            
            <SectionTransition variant="blur-in" delay={100}>
              <h2 className="heading-editorial mb-6">
                Craftsmanship in Every Detail
              </h2>
            </SectionTransition>
            
            <SectionTransition variant="fade-up" delay={200}>
              <p className="text-primary-foreground/70 mb-10 leading-relaxed">
                We invite you to explore our portfolio of completed projects, showcasing 
                the artistry and precision that defines Peninsula Equine.
              </p>
            </SectionTransition>
            
            <SectionTransition variant="scale-up" delay={300}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/gallery">
                  View Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </SectionTransition>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientStorySection() {
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const metrics = [
    { icon: TrendingUp, value: "40%", label: "Property Value Increase", detail: "Post-construction appraisal" },
    { icon: Clock, value: "6 Weeks", label: "Ahead of Schedule", detail: "Completed early despite weather" },
    { icon: Award, value: "12", label: "Stalls Built", detail: "Custom ventilation per stall" },
    { icon: Users, value: "5 Years", label: "Zero Repairs", detail: "Built to last decades" },
  ];

  return (
    <section className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="right-to-left" duration={2000} />
      <BlueprintLineOverlay variant="detail" color="dark" />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Story content */}
          <div>
            <AnimatedDivider className="mb-8" />
            
            <SectionTransition variant="fade-right" delay={100}>
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-4">
                Featured Client Story
              </p>
            </SectionTransition>
            
            <SectionTransition variant="fade-right" delay={200}>
              <h2 className="heading-editorial text-foreground mb-6">
                Mitchell Ranch,<br />
                <span className="text-accent">Woodside</span>
              </h2>
            </SectionTransition>

            <SectionTransition variant="blur-in" delay={300} duration={800}>
              <blockquote className="text-lg text-foreground font-serif italic leading-relaxed mb-6 border-l-2 border-accent pl-6">
                "Ciro built our entire 12-stall barn and covered arena. His attention to detail 
                and understanding of what horses need is unmatched. Five years later, everything 
                still looks and functions like new."
              </blockquote>
            </SectionTransition>

            <SectionTransition variant="fade-up" delay={400}>
              <p className="text-muted-foreground leading-relaxed mb-6">
                What began as a simple arena project evolved into a complete facility transformation. 
                Ciro's horseman's eye identified drainage issues, ventilation improvements, and layout 
                optimizations that a standard contractor would have missed entirely.
              </p>
            </SectionTransition>

            <SectionTransition variant="fade-up" delay={500}>
              <p className="font-serif font-semibold text-foreground">Sarah Mitchell</p>
              <p className="text-muted-foreground text-sm">Ranch Owner, Woodside</p>
            </SectionTransition>
          </div>

          {/* Success metrics grid */}
          <div ref={metricsRef} className="grid grid-cols-2 gap-px bg-border">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`bg-background p-8 lg:p-10 flex flex-col transition-all duration-700 ease-out ${
                  metricsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <metric.icon className="h-5 w-5 text-accent mb-4" />
                <span className="font-serif text-3xl lg:text-4xl text-foreground font-semibold mb-1">
                  {metric.value}
                </span>
                <span className="text-sm font-medium text-foreground mb-1">{metric.label}</span>
                <span className="text-xs text-muted-foreground">{metric.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <SectionTransition variant="fade-up" delay={600} className="text-center mt-16">
          <Link
            to="/testimonials"
            className="inline-flex items-center text-foreground font-medium hover:text-accent transition-colors group"
          >
            <span className="border-b border-foreground group-hover:border-accent transition-colors pb-1">
              More client stories
            </span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </SectionTransition>
      </div>
    </section>
  );
}



function TestimonialsGallery() {
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintDetail} opacity={0.035} direction="bottom-to-top" duration={1600} />
      <BlueprintLineOverlay variant="detail" color="dark" />
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <AnimatedDivider className="mx-auto mb-8" />
          
          <SectionTransition variant="fade-up" delay={100}>
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
              Client Success Stories
            </p>
          </SectionTransition>
          
          <SectionTransition variant="scale-up" delay={200}>
            <h2 className="heading-section text-foreground mb-4">
              What Our Clients Say
            </h2>
          </SectionTransition>

          <SectionTransition variant="fade-up" delay={300}>
            <p className="text-muted-foreground leading-relaxed">
              Every project tells a story. Here are a few from the owners and trainers 
              who trusted us with their vision.
            </p>
          </SectionTransition>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group p-8 rounded-lg bg-background border border-border hover:border-accent/50 transition-all duration-700 ease-out hover:shadow-lg hover:-translate-y-1 ${
                gridVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Star rating */}
              <div className="flex gap-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-accent"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6 line-clamp-5 group-hover:line-clamp-none transition-all">
                "{testimonial.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="pt-5 border-t border-border">
                <p className="font-serif font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={600} className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background"
          >
            <Link to="/testimonials">
              Read All Reviews
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <ParallaxCTA
      title="Ready to Build Your Dream Facility?"
      description="Every great equine facility starts with a conversation about your horses, your goals, and your property. Let's discuss your vision."
      subtitle="We invite you to join us"
      backgroundImage={ciroWide}
      primaryButtonText="Get in Touch"
      primaryButtonLink="/contact"
      showPhoneButton={true}
    />
  );
}

function HeroBannerCTAStrip() {
  return (
    <section className="relative w-full bg-primary overflow-hidden">
      {/* Full-width PE banner art */}
      <div className="absolute inset-0">
        <img
          src={peBanner}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-[0.06]"
          style={{ filter: "grayscale(0.4) brightness(1.3)" }}
        />
      </div>

      {/* Accent border lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: brand mark + tagline */}
        <div className="flex items-center gap-4">
          <img
            src={logoPeMark}
            alt="Peninsula Equine"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
          />
          <div className="text-primary-foreground">
            <p className="text-sm sm:text-base font-serif font-semibold tracking-wide">
              Peninsula Equine
            </p>
            <p className="text-xs text-primary-foreground/60 tracking-[0.15em] uppercase">
              From Dirt to Dynasty
            </p>
          </div>
        </div>

        {/* Right: CTA buttons */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm sm:text-base px-6 sm:px-8 hover:scale-105 hover:shadow-[0_4px_20px_hsl(var(--accent)/0.4)] transition-all duration-300"
          >
            <Link to="/book-lesson">
              <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Book a Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-sm sm:text-base px-5 sm:px-6 hidden sm:inline-flex"
          >
            <a href={`tel:${siteConfig.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              {siteConfig.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function BannerDivider() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  
  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-28 overflow-hidden bg-primary"
      aria-label="From Dirt to Dynasty"
    >
      {/* Blueprint background layer */}
      <BlueprintBackground image={blueprintFacility} opacity={0.05} direction="left-to-right" duration={2200} parallaxSpeed={0.04} />
      <BlueprintLineOverlay variant="barn" color="light" />

      {/* Dark vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--primary)/0.7)_100%)]" />
      
      {/* Decorative lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div
        className="relative z-10 flex justify-center px-4"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <img
          src={peBanner}
          alt="Peninsula Equine — From Dirt to Dynasty"
          className="w-[260px] sm:w-[380px] md:w-[480px] lg:w-[560px] h-auto object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.25)]"
          loading="lazy"
        />
      </div>
    </section>
  );
}

function FloatingBannerWatermark({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!visible) return;
    // Linger for 3s after splash completes, then fade out
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || !show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
      style={{
        opacity: show ? 0.07 : 0,
        transition: "opacity 1.5s ease-out",
      }}
    >
      <img
        src={peBanner}
        alt=""
        aria-hidden="true"
        className="w-[70vw] max-w-[700px] h-auto object-contain select-none"
        style={{
          filter: "grayscale(0.3) brightness(1.4)",
          animation: "fade-out 1.5s ease-out 2.8s forwards",
        }}
      />
    </div>
  );
}

export default function Index() {
  const [splashDone, setSplashDone] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const scrollToLead = () => {
    document.getElementById("lead-capture")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {!splashDone && <LoadingSplash minDuration={2400} onComplete={() => setSplashDone(true)} />}
      {splashDone && <LeadMagnetPopup />}
      <Layout>
        {/* Sticky CTA — auto-hides after lead form submission */}
        {!leadSubmitted && (
          <StickyHeroCTA
            showAfter={600}
            onCtaClick={scrollToLead}
            progress={72}
            progressLabel="spots filled"
          />
        )}
        <HeroSection variant="banner" />
        <HeroBannerCTAStrip />
        <BannerDivider />
        <IntroSection />
        <BlueprintDivider variant="floorplan" />
        <MissionSection />
        <MajorEventsSection />
        <BlueprintDivider variant="elevation" />
        <ServicesSection />
        <BookingCTABanner />
        <BookingLandingSection />
        <GallerySection />
        <ClientStorySection />
        <BlueprintDivider variant="grid" />
        <TestimonialsGallery />
        <LeadCaptureSection submitted={leadSubmitted} onSubmitted={() => setLeadSubmitted(true)} />
        <CTASection />
      </Layout>
    </>
  );
}
