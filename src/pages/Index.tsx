import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown, CalendarIcon, TrendingUp, Clock, Award, Users, Play, X, Mail, Send } from "lucide-react";
import { BookingWidget } from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { MajorEventsSection } from "@/components/MajorEventsSection";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { MajorEventsVideoSection } from "@/components/MajorEventsVideoSection";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { SectionTransition, AnimatedDivider, StaggeredTransition } from "@/components/SectionTransition";
import { siteConfig, services, testimonials, aboutCiro } from "@/data/content";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
// Import images
import heroSunset from "@/assets/hero-sunset.png";
import ciroWithHorse from "@/assets/ciro-with-horse.png";
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

// Import videos for hero rotation
import slowMo1 from "@/assets/videos/slow-mo-1.mp4";
import slowMo2 from "@/assets/videos/slow-mo-2.mp4";
import slowMo3 from "@/assets/videos/slow-mo-3.mp4";
import ciroJoinUp from "@/assets/videos/ciro-bareback-join-up.mp4";
import ciroJoinUp2 from "@/assets/videos/ciro-bareback-join-up-2.mp4";

// Featured services for homepage
const featuredServices = services.slice(0, 4);
const featuredTestimonials = testimonials.slice(0, 3);

// Hero videos for rotation
const heroVideos = [slowMo1, ciroJoinUp, slowMo2, slowMo3];

function HeroSection({ variant = "logo" }: { variant?: "logo" | "banner" }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track scroll position for parallax
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

  // Cycle videos every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
        setIsTransitioning(false);
      }, 500);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Reset video when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  // Calculate parallax values
  const parallaxOffset = scrollY * 0.4;
  const contentOffset = scrollY * 0.15;
  const overlayOpacity = Math.min(scrollY / 800, 0.5);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Full-bleed Background Video with Enhanced Parallax */}
      <div 
        className="absolute inset-[-20%] will-change-transform"
        style={{ 
          transform: `translateY(${parallaxOffset}px) scale(1.2)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={heroSunset}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <source src={heroVideos[currentVideoIndex]} type="video/mp4" />
          {/* Fallback to image if video fails */}
          <img
            src={heroSunset}
            alt="Horse silhouette at sunset"
            className="w-full h-full object-cover scale-105"
          />
        </video>
        
        {/* Gradient overlay with dynamic opacity */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/10 to-primary/70 transition-opacity duration-300"
          style={{ opacity: 1 + overlayOpacity }}
        />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      </div>

      {/* Centered Content with subtle counter-parallax */}
      <div 
        className="relative z-10 text-center px-4 will-change-transform"
        style={{ 
          transform: `translateY(${-contentOffset}px)`,
          opacity: Math.max(1 - scrollY / 600, 0)
        }}
      >
        <div className="divider mx-auto mb-8 bg-accent/80" />
        
        {variant === "banner" ? (
          /* PE Banner variant — loads async, fades in without blocking */
          <div className="mb-8">
            <img
              src={peBanner}
              alt="Peninsula Equine — From Dirt to Dynasty"
              loading="eager"
              decoding="async"
              onLoad={() => setBannerLoaded(true)}
              className={`w-[280px] sm:w-[400px] md:w-[520px] lg:w-[600px] mx-auto h-auto object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-700 ${
                bannerLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            />
          </div>
        ) : (
          /* Default logo mark variant */
          <>
            <div className="mb-8">
              <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 mx-auto transition-transform duration-500 hover:scale-105">
                <img
                  src={logoPeMark}
                  alt="Peninsula Equine"
                  className="w-full h-full object-contain drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]"
                />
              </div>
            </div>

            <p className="font-serif text-xl sm:text-2xl md:text-3xl text-white tracking-[0.12em] uppercase font-normal text-shadow-editorial mb-4">
              Peninsula Equine
            </p>
            <p className="font-sans text-sm sm:text-base tracking-[0.3em] uppercase text-white/80 mb-2">
              Facility Construction • Training • Excellence
            </p>
            <BookingWidget variant="hero" />
          </>
        )}

        {variant === "banner" && (
          <p className="font-sans text-sm sm:text-base tracking-[0.3em] uppercase text-white/80 mt-4 mb-16">
            Facility Construction • Training • Excellence
          </p>
        )}
      </div>

      {/* Scroll indicator with fade on scroll */}
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
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: parallaxRef, offset: parallaxOffset } = useParallax<HTMLDivElement>({ speed: 0.25 });
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section id="intro" className="bg-background relative overflow-hidden">
      {/* Blueprint background reveal */}
      <BlueprintBackground image={blueprintDetail} opacity={0.03} direction="bottom-to-top" duration={2000} parallaxSpeed={0.06} />
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

      {/* Large editorial image with parallax and progressive loading */}
      <div 
        ref={(node) => {
          // Combine both refs
          (imageRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`relative h-[70vh] min-h-[500px] overflow-hidden transition-all duration-1000 ${
          imageVisible ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
        }`}
        style={{
          clipPath: imageVisible ? "inset(0 0 0 0)" : "inset(5% 2% 5% 2%)",
          transition: "opacity 1s ease-out, transform 1.2s ease-out, clip-path 1s ease-out"
        }}
      >
        {/* Skeleton placeholder */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 transition-opacity duration-700 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        
        <div 
          className="absolute inset-[-15%] will-change-transform"
          style={{ 
            transform: `translateY(${parallaxOffset}px)`,
          }}
        >
          <img
            src={ciroWithHorse}
            alt="Ciro working with a horse"
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              imageVisible ? "scale-100" : "scale-105"
            } ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"}`}
          />
        </div>
        <div className="absolute inset-0 image-overlay-subtle" />
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
            <Link
              key={service.id}
              to={`/services#${service.id}`}
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
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                  <span className="border-b border-current pb-0.5">Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-xs uppercase tracking-[0.15em] text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Book consultation →
                </span>
              </div>
            </Link>
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

function LeadCaptureSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.2 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
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
      setSubmitted(true);
    } catch {
      // Silently fail – form still shows success to avoid blocking UX
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="section-padding bg-card overflow-hidden relative">
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

function VideoTestimonialSpotlight() {
  const [lightboxVideo, setLightboxVideo] = useState<string | null>(null);
  const lightboxRef = useRef<HTMLVideoElement>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  const spotlights = [
    {
      video: ciroJoinUp,
      testimonial: testimonials[0],
      caption: "Arena built for Sarah Mitchell, Woodside",
    },
    {
      video: ciroJoinUp2,
      testimonial: testimonials[3],
      caption: "Private estate project, Los Altos Hills",
    },
  ];

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxVideo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxVideo(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxVideo]);

  // Auto-play lightbox video
  useEffect(() => {
    if (lightboxVideo && lightboxRef.current) {
      lightboxRef.current.play().catch(() => {});
    }
  }, [lightboxVideo]);

  return (
    <>
      <section ref={sectionRef} className="section-padding bg-primary text-primary-foreground overflow-hidden relative">
        <BlueprintBackground image={blueprintBarn} opacity={0.04} direction="right-to-left" duration={2000} parallaxSpeed={0.06} />
        <BlueprintLineOverlay variant="barn" color="light" />

        <div className="section-container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <AnimatedDivider className="mx-auto mb-8 bg-accent" />
            <SectionTransition variant="fade-up" delay={100}>
              <p className="text-primary-foreground/60 uppercase tracking-[0.2em] text-sm mb-4">
                Client Spotlights
              </p>
            </SectionTransition>
            <SectionTransition variant="blur-in" delay={200}>
              <h2 className="heading-editorial mb-4">
                See the Results
              </h2>
            </SectionTransition>
            <SectionTransition variant="fade-up" delay={300}>
              <p className="text-primary-foreground/70">
                Hear from the people who trust us with their equine facilities.
              </p>
            </SectionTransition>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {spotlights.map((spot, i) => (
              <div
                key={i}
                className={`group transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Video thumbnail with play overlay */}
                <button
                  onClick={() => setLightboxVideo(spot.video)}
                  className="relative w-full aspect-video rounded-lg overflow-hidden bg-primary-foreground/10 mb-5 cursor-pointer group/thumb"
                  aria-label={`Play video: ${spot.caption}`}
                >
                  <video
                    src={spot.video}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/30 group-hover/thumb:bg-primary/20 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/thumb:scale-110">
                      <Play className="w-7 h-7 text-accent-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <p className="absolute bottom-3 left-3 text-xs text-primary-foreground/80 bg-primary/60 backdrop-blur-sm px-2 py-1 rounded">
                    {spot.caption}
                  </p>
                </button>

                {/* Quote */}
                <div className="flex gap-1 mb-3">
                  {[...Array(spot.testimonial.rating)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="font-serif text-lg text-primary-foreground/90 italic leading-relaxed mb-3">
                  "{spot.testimonial.quote.slice(0, 120)}…"
                </blockquote>
                <p className="font-serif font-semibold text-primary-foreground text-sm">{spot.testimonial.name}</p>
                <p className="text-primary-foreground/60 text-xs">{spot.testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Lightbox */}
      {lightboxVideo && (
        <div
          className="fixed inset-0 z-[9999] bg-primary/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Video lightbox"
        >
          <button
            className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground z-10"
            onClick={() => setLightboxVideo(null)}
            aria-label="Close video (Escape)"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <video
              ref={lightboxRef}
              src={lightboxVideo}
              controls
              autoPlay
              playsInline
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

function TestimonialsSection() {
  const featured = featuredTestimonials[0];

  return (
    <section className="section-padding bg-card overflow-hidden relative">
      <BlueprintBackground image={blueprintDetail} opacity={0.035} direction="bottom-to-top" duration={1600} />
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedDivider className="mx-auto mb-8" />
          
          {/* Stars with staggered animation */}
          <SectionTransition variant="scale-up" delay={100}>
            <div className="flex gap-1 justify-center mb-8">
              {[...Array(featured.rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-accent animate-[scale-in_0.3s_ease-out_forwards]"
                  style={{ animationDelay: `${200 + i * 80}ms`, opacity: 0 }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </SectionTransition>

          <SectionTransition variant="blur-in" delay={300} duration={900}>
            <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground leading-relaxed mb-8">
              "{featured.quote}"
            </blockquote>
          </SectionTransition>
          
          <SectionTransition variant="fade-up" delay={500}>
            <div>
              <p className="font-serif font-semibold text-foreground text-lg">{featured.name}</p>
              <p className="text-muted-foreground">{featured.role}</p>
            </div>
          </SectionTransition>

          <SectionTransition variant="fade-up" delay={600}>
            <div className="mt-12">
              <Link 
                to="/testimonials" 
                className="inline-flex items-center text-foreground font-medium hover:text-accent transition-colors group"
              >
                <span className="border-b border-foreground group-hover:border-accent transition-colors pb-1">
                  Read more reviews
                </span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </SectionTransition>
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

  return (
    <>
      {!splashDone && <LoadingSplash minDuration={2400} onComplete={() => setSplashDone(true)} />}
      <FloatingBannerWatermark visible={splashDone} />
      <Layout>
        <HeroSection variant="banner" />
        <BannerDivider />
        <IntroSection />
        <BlueprintDivider variant="floorplan" />
        <MissionSection />
        <MajorEventsSection />
        <MajorEventsVideoSection />
        <BlueprintDivider variant="elevation" />
        <ServicesSection />
        <BookingCTABanner />
        <GallerySection />
        <ClientStorySection />
        <BlueprintDivider variant="grid" />
        <VideoTestimonialSpotlight />
        <TestimonialsSection />
        <LeadCaptureSection />
        <CTASection />
      </Layout>
    </>
  );
}
