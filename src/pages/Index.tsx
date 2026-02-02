import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { MajorEventsSection } from "@/components/MajorEventsSection";
import { MajorEventsVideoSection } from "@/components/MajorEventsVideoSection";
import { ParallaxCTA } from "@/components/ParallaxCTA";
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
        
        {/* Circular Logo Mark */}
        <div className="mt-12 mb-16">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm transition-transform duration-500 hover:scale-105 hover:border-white/50">
            <div className="text-center">
              <span className="font-serif text-white text-3xl sm:text-4xl tracking-wider">PE</span>
            </div>
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
  const { ref: textRef, isVisible: textVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: parallaxRef, offset: parallaxOffset } = useParallax<HTMLDivElement>({ speed: 0.25 });
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section id="intro" className="bg-background">
      {/* Location tagline */}
      <div className="section-padding border-b border-border">
        <div className="section-container">
          <div 
            ref={textRef}
            className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
              textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-muted-foreground uppercase tracking-[0.25em] text-sm mb-8">
              Mornington Peninsula, Victoria
            </p>
            <h2 className="heading-section text-foreground mb-8">
              Where world-class equine facilities are built by the hands of a horseman
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Peninsula Equine is a construction company specializing in premium arenas, barns, 
              and equestrian infrastructure. With decades of experience in both riding and building, 
              Ciro brings a horseman's intuition to every project.
            </p>
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
        className={`relative h-[70vh] min-h-[500px] overflow-hidden transition-opacity duration-1000 ${
          imageVisible ? "opacity-100" : "opacity-0"
        }`}
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
  const { ref: textRef, isVisible: textVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div 
            ref={textRef}
            className={`lg:col-span-5 transition-all duration-700 ${
              textVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="divider mb-8" />
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
              Our Mission
            </p>
            <h2 className="heading-editorial text-foreground mb-8">
              Built by a horseman,<br />
              <span className="text-accent">for horsemen</span>
            </h2>
            <blockquote className="text-xl sm:text-2xl text-foreground font-serif italic leading-relaxed mb-8">
              "The finest facilities come from understanding both the craft of construction 
              and the soul of the horse."
            </blockquote>
            <p className="text-muted-foreground leading-relaxed mb-8">
              When Ciro walks your property, he's not just seeing construction—he's seeing 
              how your horses will move, where water will drain, and what will keep your 
              operation running smoothly for decades.
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
          </div>

          {/* Image with lazy loading */}
          <div 
            ref={imageRef}
            className={`lg:col-span-7 transition-all duration-700 delay-200 ${
              imageVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="aspect-[4/5] overflow-hidden bg-muted/20">
              <img
                src={horseAction}
                alt="Horse in training"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="divider mx-auto mb-8" />
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
            Our Services
          </p>
          <h2 className="heading-section text-foreground">
            What We Build
          </h2>
        </div>

        {/* Services Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 gap-px bg-border">
          {featuredServices.map((service, index) => (
            <Link
              key={service.id}
              to={`/services#${service.id}`}
              className={`group p-10 sm:p-12 lg:p-16 bg-background hover:bg-card transition-all duration-500 ${
                gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
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

        <div className="text-center mt-16">
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
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const { ref: imagesRef, isVisible: imagesVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation<HTMLDivElement>();

  const images = [
    { src: hatDetail, alt: "Craftsmanship details" },
    { src: spurDetail, alt: "Equipment detail" },
    { src: ciroWide, alt: "Ciro with horse" },
  ];

  return (
    <section className="bg-primary text-primary-foreground">
      {/* Full-width image strip */}
      <div 
        ref={imagesRef}
        className="grid grid-cols-3 h-[40vh] min-h-[300px]"
      >
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`overflow-hidden bg-muted/20 transition-all duration-700 ${
              imagesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        ))}
      </div>

      {/* Gallery CTA */}
      <div className="section-padding">
        <div className="section-container">
          <div 
            ref={ctaRef}
            className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
              ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="divider mx-auto mb-8 bg-accent" />
            <h2 className="heading-editorial mb-6">
              Craftsmanship in Every Detail
            </h2>
            <p className="text-primary-foreground/70 mb-10 leading-relaxed">
              We invite you to explore our portfolio of completed projects, showcasing 
              the artistry and precision that defines Peninsula Equine.
            </p>
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
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const featured = featuredTestimonials[0];

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div 
          ref={ref}
          className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="divider mx-auto mb-8" />
          
          {/* Stars */}
          <div className="flex gap-1 justify-center mb-8">
            {[...Array(featured.rating)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-accent"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground leading-relaxed mb-8">
            "{featured.quote}"
          </blockquote>
          
          <div>
            <p className="font-serif font-semibold text-foreground text-lg">{featured.name}</p>
            <p className="text-muted-foreground">{featured.role}</p>
          </div>

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
      <MissionSection />
      <MajorEventsSection />
      <MajorEventsVideoSection />
      <ServicesSection />
      <GallerySection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
