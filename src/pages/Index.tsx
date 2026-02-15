import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown } from "lucide-react";
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
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
import { BlueprintDivider } from "@/components/BlueprintDivider";

// Import videos for hero rotation
import slowMo1 from "@/assets/videos/slow-mo-1.mp4";
import slowMo2 from "@/assets/videos/slow-mo-2.mp4";
import slowMo3 from "@/assets/videos/slow-mo-3.mp4";
import ciroJoinUp from "@/assets/videos/ciro-bareback-join-up.mp4";

// Featured services for homepage
const featuredServices = services.slice(0, 4);
const featuredTestimonials = testimonials.slice(0, 3);

// Hero videos for rotation
const heroVideos = [slowMo1, ciroJoinUp, slowMo2, slowMo3];

function HeroSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollY, setScrollY] = useState(0);
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
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-[0.15em] uppercase font-normal text-shadow-editorial mb-6">
          Peninsula Equine
        </h1>
        <p className="font-sans text-sm sm:text-base tracking-[0.3em] uppercase text-white/80 mb-4">
          Facility Construction • Training • Excellence
        </p>
        
        {/* P.E Logo Mark */}
        <div className="mt-12 mb-16">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto transition-transform duration-500 hover:scale-105">
            <img
              src={logoPeMark}
              alt="Peninsula Equine"
              className="w-full h-full object-contain drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]"
            />
          </div>
        </div>
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
    <section id="intro" className="bg-background">
      {/* Location tagline */}
      <div className="section-padding border-b border-border">
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
      <BlueprintBackground image={blueprintFacility} opacity={0.06} />
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
              <span className="inline-flex items-center text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                <span className="border-b border-current pb-0.5">Learn more</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
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

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <IntroSection />
      <BlueprintDivider variant="structural" />
      <MissionSection />
      <MajorEventsSection />
      <MajorEventsVideoSection />
      <BlueprintDivider variant="elevation" />
      <ServicesSection />
      <GallerySection />
      <BlueprintDivider variant="grid" />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
