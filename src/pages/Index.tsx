import { useState, useEffect, useRef, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown, CalendarIcon, TrendingUp, Clock, Award, Users, X, Mail, Send, MessageSquare, Star, ShieldCheck, Flame, Loader2, CheckCircle } from "lucide-react";
import { HeroLeadForm } from "@/components/HeroLeadForm";
import { useABTest } from "@/hooks/useABTest";
import { BookingWidget } from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { MajorEventsSection } from "@/components/MajorEventsSection";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BookingLandingSection } from "@/components/BookingLandingSection";
import { LeadMagnetPopup } from "@/components/LeadMagnetPopup";
import { StickyHeroCTA } from "@/components/StickyHeroCTA";
import { HeroBookingProgress } from "@/components/HeroBookingProgress";
import { SectionTransition, AnimatedDivider, StaggeredTransition } from "@/components/SectionTransition";
import { ServicesTeaserStrip } from "@/components/ServicesTeaserStrip";
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

function HeroLessonMiniForm({ trackClick, variant }: { trackClick: (meta: Record<string, string>) => void; variant: string }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    trackClick({ action: "submit", target: "hero_lesson_mini_form" });

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim(),
        email: email.trim(),
        services: ["lessons"],
        preferred_start: preferredDate || null,
        project_vision: "Quick lesson inquiry from homepage hero",
        status: "new",
      });

      if (error) throw error;

      // Also trigger email notification
      try {
        await supabase.functions.invoke("send-inquiry-notification", {
          body: { name: name.trim(), email: email.trim(), services: ["lessons"], preferredDate },
        });
      } catch {
        // Non-critical — inquiry saved
      }

      setSubmitted(true);
      toast({ title: "Inquiry sent!", description: "We'll be in touch shortly." });

      // Redirect to full booking page after brief pause
      setTimeout(() => navigate(`/book-lesson${preferredDate ? `?date=${preferredDate}` : ""}`), 1500);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-hero-glass backdrop-blur-md border border-hero-glass-border text-center">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-accent" />
        </div>
        <p className="font-serif text-lg text-hero-text font-semibold">You're In!</p>
        <p className="text-hero-text-muted text-sm">Taking you to the full booking page…</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-5 rounded-xl bg-hero-glass backdrop-blur-md border border-hero-glass-border"
    >
      <h3 className="font-serif text-base text-hero-text font-semibold text-center">
        Quick Lesson Inquiry
      </h3>

      <Input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={100}
        aria-label="Your name"
        className="bg-white/10 border-hero-glass-border text-hero-text placeholder:text-hero-text-muted/60 focus-visible:ring-accent"
      />
      <Input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        maxLength={255}
        aria-label="Email address"
        className="bg-white/10 border-hero-glass-border text-hero-text placeholder:text-hero-text-muted/60 focus-visible:ring-accent"
      />
      <Input
        type="date"
        value={preferredDate}
        onChange={(e) => setPreferredDate(e.target.value)}
        aria-label="Preferred lesson date (optional)"
        className="bg-white/10 border-hero-glass-border text-hero-text placeholder:text-hero-text-muted/60 focus-visible:ring-accent"
      />
      <p className="text-[11px] text-hero-text-muted/70 text-center -mt-1">Preferred date is optional</p>

      <Button
        type="submit"
        disabled={submitting || !name.trim() || !email.trim()}
        aria-label="Submit lesson inquiry"
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {submitting ? "Sending…" : "Send & Book"}
      </Button>
    </form>
  );
}

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
    <div className="flex flex-col items-center gap-4 mt-2 w-full max-w-3xl mx-auto">
      {/* Side-by-side: Book a Lesson CTA + Booking Widget */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left: Mini Lesson Inquiry Form */}
        <HeroLessonMiniForm trackClick={trackClick} variant={variant} />

        {/* Right: Inline Booking Widget */}
        <div className="rounded-xl bg-hero-glass backdrop-blur-md border border-hero-glass-border p-4">
          <BookingWidget variant="hero" />
        </div>
      </div>

      {/* Consult toggle below */}
      <button
        onClick={() => { setHeroMode(heroMode === "consult" ? "book" : "consult"); trackClick({ action: "toggle", target: "consult" }); }}
        aria-label={heroMode === "consult" ? "Hide consultation form" : "Open consultation form"}
        aria-expanded={heroMode === "consult"}
        className="inline-flex items-center gap-2 text-hero-text-muted hover:text-hero-text text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-md px-2 py-1"
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        {heroMode === "consult" ? "Hide consultation form" : copy.consultLabel}
      </button>

      {heroMode === "consult" && (
        <div className="w-full max-w-lg mx-auto transition-all duration-300 animate-fade-in">
          <HeroLeadForm />
        </div>
      )}
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
        <BlueprintBackground image={blueprintFacility} opacity={0.06} direction="left-to-right" duration={2500} parallaxSpeed={0.04} />
      </div>

      {/* Blueprint line overlays — phase 1 draw-on */}
      <div
        style={{
          opacity: heroPhase >= 1 ? 1 : 0,
          transition: "opacity 1s ease-out 0.4s",
        }}
      >
        <BlueprintLineOverlay variant="dimensions" color="light" />
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
          <div className="mt-6">
            <HeroBookingProgress percentFilled={72} totalSlots={25} remainingSlots={7} />
          </div>
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
      {/* Subtle blueprint layer */}
      <BlueprintBackground image={blueprintFacility} opacity={0.04} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
      <BlueprintLineOverlay variant="dimensions" color="dark" />

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
          <BlueprintBackground image={blueprintFacility} opacity={0.12} direction="left-to-right" duration={1400} parallaxSpeed={0.04} />
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
      <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="right-to-left" duration={1800} />
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
      {/* Single blueprint layer */}
      <BlueprintBackground image={blueprintFacility} opacity={0.04} parallaxSpeed={0.06} />
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
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        ref={ref}
        className="relative py-16 sm:py-20 bg-accent overflow-hidden"
      >

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
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 btn-hover-lift"
                onClick={() => setModalOpen(true)}
              >
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* Booking Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-serif text-2xl">Book a Consultation</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <BookingModalForm onSuccess={() => setModalOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BookingModalForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const isValid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && service;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 255),
        phone: phone.trim().slice(0, 30) || null,
        services: [service],
        project_details: notes.trim().slice(0, 1000) || "Consultation request from homepage CTA",
        status: "new",
      });

      if (error) throw error;

      supabase.functions.invoke("send-inquiry-notification", {
        body: {
          name: name.trim(),
          email: email.trim(),
          services: [service],
          goals: notes.trim() || "Consultation request",
        },
      }).catch(() => {});

      setSubmitted(true);
      toast({ title: "Request submitted!", description: "We'll be in touch within 24 hours." });
      setTimeout(onSuccess, 2000);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-10 text-center">
        <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">You're All Set!</h3>
        <p className="text-muted-foreground text-sm">We'll confirm your consultation within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" maxLength={100} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Email *</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={255} />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Phone</label>
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" maxLength={30} />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Service of Interest *</label>
        <div className="grid grid-cols-2 gap-2">
          {services.slice(0, 6).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setService(s.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                service === s.id
                  ? "bg-accent/10 border-accent ring-1 ring-accent/20 text-foreground"
                  : "bg-background border-border text-muted-foreground hover:border-accent/30"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Notes</label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us about your project" maxLength={1000} />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!isValid || submitting}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {submitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
        ) : (
          <>Submit Request<ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </Button>
    </form>
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
      <BlueprintBackground image={blueprintBarn} opacity={0.025} direction="bottom-to-top" duration={2000} />
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
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalStory, setModalStory] = useState<typeof stories[number] | null>(null);

  const stories = [
    {
      id: "mitchell",
      client: "Sarah Mitchell",
      role: "Ranch Owner, Woodside",
      service: "barn-construction",
      serviceLabel: "Barn & Stable",
      title: "Mitchell Ranch",
      location: "Woodside",
      quote: "Ciro built our entire 12-stall barn and covered arena. His attention to detail and understanding of what horses need is unmatched. Five years later, everything still looks and functions like new.",
      story: "What began as a simple arena project evolved into a complete facility transformation. Ciro's horseman's eye identified drainage issues, ventilation improvements, and layout optimizations that a standard contractor would have missed entirely.",
      caseStudy: {
        challenge: "Sarah's existing barn had poor ventilation, outdated stall configurations, and drainage problems that led to standing water after heavy rains. The property needed a complete overhaul to support her growing lesson program.",
        approach: "We began with a full site assessment, mapping drainage patterns and prevailing winds. The barn was designed with a centre-aisle layout featuring cross-ventilation, oversized stalls with rubber-mat flooring, and an integrated wash rack. A covered arena was added adjacent to the barn for seamless workflow.",
        materials: ["Treated hardwood timber frame", "Colorbond roofing with insulated panels", "Rubber-mat stall flooring", "Fibre-sand arena footing", "Integrated stormwater management"],
        timeline: "Completed in 10 weeks — 6 weeks ahead of the original 16-week estimate, despite two weeks of rain delays.",
        outcome: "Sarah's property value increased 40% on reappraisal. The barn has required zero structural repairs in five years. Her lesson bookings doubled within six months of completion.",
      },
      metrics: [
        { icon: TrendingUp, value: "40%", label: "Property Value Increase" },
        { icon: Clock, value: "6 Weeks", label: "Ahead of Schedule" },
        { icon: Award, value: "12", label: "Stalls Built" },
        { icon: Users, value: "5 Years", label: "Zero Repairs" },
      ],
    },
    {
      id: "chen",
      client: "James Chen",
      role: "Dressage Trainer, Mornington",
      service: "arena-construction",
      serviceLabel: "Arena",
      title: "Chen Equestrian Centre",
      location: "Mornington",
      quote: "The arena footing is perfection — consistent drainage even in the heaviest winter rains. My horses move better, and my clients notice the difference immediately.",
      story: "James needed a competition-grade arena that could handle year-round training. We engineered a multi-layer base with a fibre-sand surface and integrated sub-surface drainage across 60×20m.",
      caseStudy: {
        challenge: "James's existing sand arena turned to mud in winter and dust in summer. Uneven footing was causing recurring lameness issues in his top dressage horses, and clients were leaving for better-equipped facilities.",
        approach: "We excavated to 400mm depth, installed agricultural drainage at 3m centres, then built up a laser-levelled crushed rock base, geotextile membrane, and 100mm fibre-sand riding surface. Dust suppression was integrated via a perimeter irrigation ring.",
        materials: ["Crushed rock base (200mm)", "Geotextile separation membrane", "Premium fibre-sand footing (100mm)", "Ag-pipe sub-surface drainage", "Automated dust-suppression irrigation"],
        timeline: "8-week build including 2 weeks of curing time for optimal footing compaction.",
        outcome: "Zero ponding events in three winters. James's client base grew by 40% and he now hosts regional dressage competitions on-site.",
      },
      metrics: [
        { icon: TrendingUp, value: "60×20m", label: "Arena Dimensions" },
        { icon: Clock, value: "8 Weeks", label: "Build Time" },
        { icon: Award, value: "100%", label: "Drainage Efficiency" },
        { icon: Users, value: "30+", label: "Weekly Riders" },
      ],
    },
    {
      id: "park",
      client: "Lisa Park",
      role: "Eventing Competitor, Red Hill",
      service: "fencing",
      serviceLabel: "Fencing & Paddocks",
      title: "Redhill Farm",
      location: "Red Hill",
      quote: "We replaced 2km of old wire fencing with post-and-rail. The paddocks look incredible and I finally feel safe turning the horses out. Not a single escape in three years.",
      story: "Lisa's property had aging wire fencing that posed safety risks. We designed and installed 2km of treated timber post-and-rail with electric backup, plus six new paddock gates.",
      caseStudy: {
        challenge: "Old wire fencing was rusting and sagging. Two horses had been injured on exposed wire ends, and the property's single large paddock offered no way to separate horses for feeding, turnout, or quarantine.",
        approach: "We surveyed the full perimeter and internal divisions, then designed six paddocks of varying sizes with shared water troughs and double-gate laneways. All fencing is 3-rail treated pine with electric tape on the top rail as a psychological barrier.",
        materials: ["CCA-treated pine posts (125mm)", "Hardwood rails (75×50mm)", "Galvanised electric tape", "Heavy-duty spring gates", "Concrete post footings at gate points"],
        timeline: "4 weeks including clearing, post-hole boring, and electric tape installation.",
        outcome: "Zero horse escapes in three years. Lisa can now manage individual feeding plans and safely quarantine new arrivals. Property insurance premium dropped 15%.",
      },
      metrics: [
        { icon: TrendingUp, value: "2km", label: "Fencing Installed" },
        { icon: Clock, value: "4 Weeks", label: "Completion Time" },
        { icon: Award, value: "0", label: "Escapes Since" },
        { icon: Users, value: "6", label: "Paddocks Created" },
      ],
    },
    {
      id: "taylor",
      client: "Mark Taylor",
      role: "Facility Manager, Balnarring",
      service: "facility-design",
      serviceLabel: "Full Facility",
      title: "Balnarring Equine Park",
      location: "Balnarring",
      quote: "From masterplan to final coat of paint, Peninsula Equine delivered a facility that rivals anything in the state. The clinics we host now are always fully booked.",
      story: "A greenfield 10-acre site transformed into a complete equestrian venue: two arenas, a 20-stall barn, amenities block, and truck-and-float parking for events.",
      caseStudy: {
        challenge: "Mark purchased raw farmland and needed a complete equestrian facility designed from scratch — arenas, stabling, amenities, and event infrastructure — all within a 5-month window to open for the spring clinic season.",
        approach: "We produced a full masterplan covering grading, drainage, road access, and building placement. Construction was staged: earthworks and drainage first, then the barn and amenities block in parallel with arena construction. Truck-and-float parking was graded last to serve as a staging area during the build.",
        materials: ["Steel-frame barn with Colorbond cladding", "Concrete amenities block", "Dual fibre-sand arenas (60×20m + 40×20m)", "Gravel access roads", "Stormwater retention basin"],
        timeline: "5 months from first cut to final inspection. Opened on schedule for the October clinic season.",
        outcome: "Every clinic since opening has been fully booked. The facility now hosts 4 major events per year and generates revenue from stall rentals, arena hire, and amenities access.",
      },
      metrics: [
        { icon: TrendingUp, value: "10 Acres", label: "Site Developed" },
        { icon: Clock, value: "5 Months", label: "Total Build" },
        { icon: Award, value: "20", label: "Stalls + 2 Arenas" },
        { icon: Users, value: "100%", label: "Clinic Occupancy" },
      ],
    },
  ];

  const filters = [
    { value: "all", label: "All Projects" },
    { value: "arena-construction", label: "Arenas" },
    { value: "barn-construction", label: "Barns" },
    { value: "fencing", label: "Fencing" },
    { value: "facility-design", label: "Full Facility" },
  ];

  const filteredStories = activeFilter === "all"
    ? stories
    : stories.filter((s) => s.service === activeFilter);

  // Reset index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeFilter]);

  const current = filteredStories[activeIndex] || filteredStories[0];
  if (!current) return null;

  const goPrev = () => setActiveIndex((i) => (i - 1 + filteredStories.length) % filteredStories.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % filteredStories.length);

  return (
    <section ref={sectionRef} className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintBarn} opacity={0.025} direction="right-to-left" duration={2000} />
      <div className="section-container relative z-10">
        {/* Header */}
        <AnimatedDivider className="mb-8" />
        <SectionTransition variant="fade-up">
          <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-4 text-center">
            Client Success Stories
          </p>
          <h2 className="heading-section text-foreground text-center mb-8">
            Real Results, Real Horsemen
          </h2>
        </SectionTransition>

        {/* Service filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              aria-pressed={activeFilter === f.value}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                activeFilter === f.value
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Story carousel card */}
        <div
          className={`transition-all duration-700 ease-out ${
            sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Story */}
            <div key={current.id} className="animate-fade-in">
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                {current.serviceLabel}
              </p>
              <h3 className="heading-editorial text-foreground mb-2">
                {current.title},{" "}
                <span className="text-accent">{current.location}</span>
              </h3>

              <blockquote className="text-lg text-foreground font-serif italic leading-relaxed mb-5 border-l-2 border-accent pl-6">
                "{current.quote}"
              </blockquote>

              <p className="text-muted-foreground leading-relaxed mb-5">
                {current.story}
              </p>

              <p className="font-serif font-semibold text-foreground">{current.client}</p>
              <p className="text-muted-foreground text-sm mb-4">{current.role}</p>
              <button
                onClick={() => setModalStory(current)}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1 py-0.5"
              >
                Read Full Case Study
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Right: Outcome metrics */}
            <div className="grid grid-cols-2 gap-px bg-border" key={`metrics-${current.id}`}>
              {current.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="bg-background p-8 lg:p-10 flex flex-col animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <metric.icon className="h-5 w-5 text-accent mb-4" aria-hidden="true" />
                  <span className="font-serif text-3xl lg:text-4xl text-foreground font-semibold mb-1">
                    {metric.value}
                  </span>
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel navigation */}
          {filteredStories.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={goPrev}
                aria-label="Previous story"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <div className="flex gap-2">
                {filteredStories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Go to story ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      i === activeIndex ? "bg-accent scale-125" : "bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={goNext}
                aria-label="Next story"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <SectionTransition variant="fade-up" delay={400} className="text-center mt-14">
          <Link
            to="/testimonials"
            className="inline-flex items-center text-foreground font-medium hover:text-accent transition-colors group"
          >
            <span className="border-b border-foreground group-hover:border-accent transition-colors pb-1">
              Read all client stories
            </span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </SectionTransition>
      </div>

      {/* Case Study Modal */}
      <Dialog open={!!modalStory} onOpenChange={(open) => !open && setModalStory(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {modalStory && (
            <>
              <DialogHeader>
                <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-1">
                  {modalStory.serviceLabel} — Case Study
                </p>
                <DialogTitle className="font-serif text-2xl">
                  {modalStory.title}, {modalStory.location}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Quote */}
                <blockquote className="text-foreground font-serif italic leading-relaxed border-l-2 border-accent pl-5">
                  "{modalStory.quote}"
                </blockquote>
                <p className="text-sm text-muted-foreground">
                  — <span className="font-semibold text-foreground">{modalStory.client}</span>, {modalStory.role}
                </p>

                {/* Challenge */}
                <div>
                  <h4 className="font-serif font-semibold text-foreground mb-2">The Challenge</h4>
                  <p className="text-muted-foreground leading-relaxed">{modalStory.caseStudy.challenge}</p>
                </div>

                {/* Approach */}
                <div>
                  <h4 className="font-serif font-semibold text-foreground mb-2">Our Approach</h4>
                  <p className="text-muted-foreground leading-relaxed">{modalStory.caseStudy.approach}</p>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="font-serif font-semibold text-foreground mb-2">Key Materials & Systems</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {modalStory.caseStudy.materials.map((m) => (
                      <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Award className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-serif font-semibold text-foreground mb-2">Timeline</h4>
                  <p className="text-muted-foreground leading-relaxed">{modalStory.caseStudy.timeline}</p>
                </div>

                {/* Outcome */}
                <div>
                  <h4 className="font-serif font-semibold text-foreground mb-2">The Outcome</h4>
                  <p className="text-muted-foreground leading-relaxed">{modalStory.caseStudy.outcome}</p>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                  {modalStory.metrics.map((metric) => (
                    <div key={metric.label} className="text-center">
                      <metric.icon className="h-4 w-4 text-accent mx-auto mb-2" aria-hidden="true" />
                      <p className="font-serif text-xl font-semibold text-foreground">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="text-center pt-2">
                  <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link to="/contact" onClick={() => setModalStory(null)}>
                      Start Your Project
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}


// ── Testimonial-Led Service Highlights ────────────────

const SERVICE_TESTIMONIALS = [
  {
    testimonial: testimonials[0], // Sarah Mitchell – Ranch Owner
    serviceTitle: "Barn & Stable Construction",
    serviceId: "barn-stable",
    stat: "12-Stall Barn + Covered Arena",
    highlight: "5 years later, still looks and functions like new",
  },
  {
    testimonial: testimonials[1], // Robert Chen – Dressage Trainer
    serviceTitle: "Arena Construction",
    serviceId: "arena-construction",
    stat: "Best Footing for Dressage",
    highlight: "Surface designed specifically for discipline requirements",
  },
  {
    testimonial: testimonials[2], // Elena Rodriguez – Breeding Farm
    serviceTitle: "Fencing & Paddock Systems",
    serviceId: "fencing",
    stat: "Paddocks + Mare Barn",
    highlight: "Every project handled professionally and on time",
  },
  {
    testimonial: testimonials[3], // Tom & Linda Hartley
    serviceTitle: "Full Facility Design",
    serviceId: "full-facility",
    stat: "Chose Ciro Over 6 Contractors",
    highlight: "Knowledge of horses convinced them immediately",
  },
];

function TestimonialServiceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SERVICE_TESTIMONIALS.length);
    }, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (i: number) => {
    setActiveIndex(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SERVICE_TESTIMONIALS.length);
    }, 6000);
  };

  const current = SERVICE_TESTIMONIALS[activeIndex];

  return (
    <section ref={ref} className="section-padding bg-background relative overflow-hidden">
      <BlueprintBackground image={blueprintFacility} opacity={0.025} direction="left-to-right" duration={2000} />
      <div className="section-container relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <AnimatedDivider className="mx-auto mb-8" />
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">Proven Results</p>
          <h2 className="heading-section text-foreground mb-4">Our Work, Their Words</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every service we deliver is backed by real client outcomes. See how our expertise translates to lasting satisfaction.
          </p>
        </div>

        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {/* Card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid md:grid-cols-5">
              {/* Left: Service highlight */}
              <div className="md:col-span-2 p-6 sm:p-8 bg-accent/5 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold uppercase tracking-wider mb-4 self-start">
                  <ShieldCheck className="h-3 w-3" />
                  {current.serviceTitle}
                </div>
                <p className="font-serif text-2xl font-bold text-foreground mb-2">{current.stat}</p>
                <p className="text-sm text-muted-foreground mb-6">{current.highlight}</p>
                <Button
                  onClick={() => navigate(`/contact?services=${current.serviceId}`)}
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground self-start"
                >
                  Get a Quote
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Right: Testimonial */}
              <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center">
                <div className="flex gap-1 mb-4">
                  {[...Array(current.testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <blockquote className="text-foreground leading-relaxed mb-6 font-serif italic text-lg">
                  "{current.testimonial.quote}"
                </blockquote>
                <div className="pt-4 border-t border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-serif font-bold">
                    {current.testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-foreground">{current.testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{current.testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {SERVICE_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? "w-8 h-2 bg-accent"
                    : "w-2 h-2 bg-border hover:bg-accent/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function TestimonialsGallery() {
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintBarn} opacity={0.025} direction="bottom-to-top" duration={1600} />
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

        {/* Integrated lead capture + social proof strip */}
        <div className="mt-14 rounded-xl bg-primary text-primary-foreground p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 18px, currentColor 18px, currentColor 19px)",
          }} />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Social proof stats */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                  ))}
                </div>
                <span className="text-lg font-bold text-accent">
                  {(testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)}
                </span>
              </div>
              <div className="hidden sm:block h-8 w-px bg-primary-foreground/20" />
              <p className="text-sm text-primary-foreground/70 text-center sm:text-left">
                Trusted by <span className="font-semibold text-primary-foreground">{testimonials.length}+ clients</span> across the Peninsula
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 lg:ml-auto">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-lg">
                <Link to="/book-lesson">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Book a Lesson
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <SectionTransition variant="fade-up" delay={600} className="text-center mt-8">
          <Link
            to="/testimonials"
            className="inline-flex items-center text-muted-foreground text-sm hover:text-accent transition-colors group"
          >
            <span className="border-b border-muted-foreground/40 group-hover:border-accent transition-colors pb-0.5">
              Read all {testimonials.length} reviews
            </span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </SectionTransition>
      </div>
    </section>
  );
}

function ForgeHeroBanner() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });
  return (
    <section ref={ref} className="relative py-20 md:py-28 bg-primary text-primary-foreground overflow-hidden">
      {/* Diagonal hatch overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 18px, currentColor 18px, currentColor 19px)",
      }} />
      {/* Horizontal blueprint lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, currentColor 60px, currentColor 61px)",
      }} />

      <div className={`section-container relative z-10 text-center max-w-3xl mx-auto transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="h-px w-8 bg-accent/50" />
          <Flame className="h-5 w-5 text-accent" />
          <span className="text-accent text-xs font-medium uppercase tracking-[0.2em]">The Forge at P.E.</span>
          <Flame className="h-5 w-5 text-accent" />
          <span className="h-px w-8 bg-accent/50" />
        </div>

        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl mb-4 leading-[1.1]">
          We Don't Just Build Barns.{" "}
          <span className="text-accent">We Bend Steel to Your Will.</span>
        </h2>

        <p className="text-primary-foreground/70 text-lg md:text-xl mb-10 max-w-xl mx-auto font-light">
          Custom gates, panels, fixtures & decorative metalwork — forged by horsemen who know the difference between a paddock latch and a fashion statement.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider px-8">
            <Link to="/shop">
              View Catalog <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary uppercase tracking-wider px-8">
            <Link to="/contact">
              Request a Quote
            </Link>
          </Button>
        </div>
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
      <BlueprintBackground image={blueprintFacility} opacity={0.04} direction="left-to-right" duration={2200} parallaxSpeed={0.04} />

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
        <ServicesTeaserStrip />
        <MissionSection />
        <MajorEventsSection />
        <BlueprintDivider variant="elevation" />
        <ServicesSection />
        <BookingCTABanner />
        <BookingLandingSection />
        <GallerySection />
        <ClientStorySection />
        <BlueprintDivider variant="grid" />
        <TestimonialServiceCarousel />
        <TestimonialsGallery />
        <ForgeHeroBanner />
        <LeadCaptureSection submitted={leadSubmitted} onSubmitted={() => setLeadSubmitted(true)} />
        <CTASection />
      </Layout>
    </>
  );
}
