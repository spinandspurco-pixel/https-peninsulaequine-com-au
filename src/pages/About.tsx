import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Pause, Quote, Star } from "lucide-react";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { FamilyVideoCarousel } from "@/components/FamilyVideoCarousel";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { SectionTransition } from "@/components/SectionTransition";
import { aboutCiro, testimonials } from "@/data/content";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";

import ciroWithHorse from "@/assets/ciro-with-horse.png";
import ciroWide from "@/assets/ciro-wide.png";
import horseAction from "@/assets/horse-action.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
import blueprintBarn from "@/assets/blueprint-barn.png";
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import logoPeMark from "@/assets/logo-pe-mark.png";
import { BlueprintDivider } from "@/components/BlueprintDivider";

// Import join-up videos
import ciroJoinUp1 from "@/assets/videos/ciro-bareback-join-up.mp4";
import ciroJoinUp2 from "@/assets/videos/ciro-bareback-join-up-2.mp4";

// Video testimonials data — pairs testimonial quotes with related project footage
const VIDEO_TESTIMONIALS = [
  {
    testimonial: testimonials[0], // Sarah Mitchell
    video: ciroJoinUp1,
    poster: undefined as string | undefined,
  },
  {
    testimonial: testimonials[3], // Tom & Linda Hartley
    video: ciroJoinUp2,
    poster: undefined as string | undefined,
  },
];

// Featured written testimonials (the rest)
const FEATURED_WRITTEN = [testimonials[1], testimonials[2], testimonials[4], testimonials[5]];

function PageHeader() {
  const { ref: parallaxRef, offset } = useParallax<HTMLElement>({ speed: 0.3 });

  return (
    <section ref={parallaxRef} className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
      {/* Blueprint layers */}
      <BlueprintBackground image={blueprintElevation} opacity={0.07} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="right-to-left" duration={2400} parallaxSpeed={0.1} className="scale-105" />
      <BlueprintLineOverlay variant="front-elevation" color="light" />
      {/* Parallax background layer */}
      <div 
        className="absolute inset-0 opacity-10 will-change-transform"
        style={{ 
          transform: `translateY(${offset * 0.6}px)`,
          backgroundImage: `url(${ciroWithHorse})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="section-container relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <img src={logoPeMark} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]" />
            <div className="w-12 h-0.5 bg-accent" />
          </div>
          <h1 className="heading-display mb-6">About Peninsula Equine</h1>
          <p className="text-lg text-primary-foreground/80">
            Building world-class equine facilities with the insight that only comes 
            from a lifetime of horsemanship.
          </p>
        </div>
      </div>
      <BlueprintDivider variant="grid" className="absolute bottom-0 left-0 right-0 h-12 sm:h-16" />
    </section>
  );
}

function CiroSection() {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding relative overflow-hidden">
      <BlueprintLineOverlay variant="detail" color="dark" />
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div 
            ref={imageRef}
            className={`relative transition-all duration-700 ${
              imageVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src={ciroWithHorse}
                alt="Ciro, founder of Peninsula Equine"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent rounded-lg -z-10" />
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            className={`transition-all duration-700 delay-200 ${
              contentVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="w-16 h-0.5 bg-accent mb-6" />
            <h2 className="heading-section text-foreground mb-2">{aboutCiro.name}</h2>
            <p className="text-accent font-medium mb-6">{aboutCiro.title}</p>
            <div className="space-y-4 text-muted-foreground">
              {aboutCiro.bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section className="section-padding bg-card relative">
      <BlueprintBackground image={blueprintBarn} opacity={0.035} direction="left-to-right" duration={2000} />
      <div className="section-container relative z-10">
        <div 
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            Our Values
          </h2>
          <p className="text-muted-foreground">
            These principles guide every project we take on and every relationship we build.
          </p>
        </div>

        <div 
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {aboutCiro.values.map((value, index) => (
            <div
              key={value.title}
              className={`group text-center p-6 rounded-lg cursor-default card-hover-glow
                ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                <span className="font-serif text-2xl font-bold text-accent transition-transform duration-300 group-hover:scale-110">{index + 1}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-3 transition-colors duration-300 group-hover:text-accent">
                {value.title}
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NaturalHorsemanshipSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: videosRef, isVisible: videosVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: quoteRef, isVisible: quoteVisible } = useScrollAnimation<HTMLQuoteElement>();

  const videos = [
    { src: ciroJoinUp1, title: "Join-Up Session" },
    { src: ciroJoinUp2, title: "Bareback Connection" },
  ];

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <BlueprintBackground image={blueprintDetail} opacity={0.025} direction="bottom-to-top" duration={1800} parallaxSpeed={0.07} />
      <div className="section-container">
        <div 
          ref={headerRef}
          className={`max-w-3xl mx-auto text-center mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            Natural Horsemanship
          </h2>
          <p className="text-muted-foreground text-lg">
            Before Ciro picks up a hammer, he picks up a halter. His deep understanding 
            of horse behavior and natural horsemanship principles directly informs 
            every facility he builds.
          </p>
        </div>

        {/* Video Grid */}
        <div 
          ref={videosRef}
          className="grid md:grid-cols-2 gap-6 lg:gap-8"
        >
          {videos.map((video, index) => (
            <div 
              key={index} 
              className={`relative group transition-all duration-700 ${
                videosVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <video
                  className="w-full h-full object-cover"
                  controls
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground font-medium">
                {video.title}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <blockquote 
          ref={quoteRef}
          className={`max-w-2xl mx-auto mt-12 text-center transition-all duration-700 delay-300 ${
            quoteVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="font-serif text-xl sm:text-2xl text-foreground italic leading-relaxed">
            "When you understand how a horse thinks and moves, you build facilities 
            that work with their nature, not against it."
          </p>
          <footer className="mt-4 text-accent font-medium">— Ciro</footer>
        </blockquote>
      </div>
    </section>
  );
}

function ImageBreak() {
  const { ref: scrollRef, isVisible } = useScrollAnimation<HTMLElement>({
    threshold: 0.2,
  });
  const { ref: parallaxRef, offset } = useParallax<HTMLDivElement>({ speed: 0.3 });

  return (
    <section 
      ref={scrollRef}
      className={`relative h-[50vh] min-h-[400px] overflow-hidden transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div 
        ref={parallaxRef}
        className="absolute inset-[-15%] will-change-transform"
        style={{ 
          transform: `translateY(${offset * 0.4}px)`,
        }}
      >
        <img
          src={horseAction}
          alt="Horse training in arena"
          className={`w-full h-full object-cover transition-transform duration-1000 ${
            isVisible ? "scale-100" : "scale-105"
          }`}
        />
      </div>
      <div className="absolute inset-0 bg-primary/40" />
    </section>
  );
}

function StorySection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding relative">
      <BlueprintBackground image={blueprintDetail} opacity={0.05} direction="right-to-left" />
      <BlueprintLineOverlay variant="detail" color="dark" />
      <div className="section-container relative z-10">
        <div 
          ref={ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h2 className="heading-section text-foreground mb-8">
            Why Peninsula Equine?
          </h2>
          <div className="space-y-6 text-muted-foreground">
            <p>
              Peninsula Equine was born from a simple observation: too many equine facility 
              projects were being built by contractors who had never saddled a horse. The 
              result? Arenas with poor drainage, barns with inadequate ventilation, and 
              paddocks that didn't account for how horses actually behave.
            </p>
            <p>
              Ciro saw an opportunity to bring something different to the market—construction 
              expertise combined with genuine horsemanship. When he surveys your property, 
              he's not just measuring distances and calculating materials. He's thinking 
              about sight lines, natural movement patterns, and the thousand small details 
              that make a facility truly work for horses and their people.
            </p>
            <p>
              Today, Peninsula Equine serves the San Francisco Peninsula and surrounding 
              areas, building facilities that stand as a testament to what's possible when 
              you combine construction excellence with equestrian insight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilySection() {
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: carouselRef, isVisible: carouselVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
      <BlueprintLineOverlay variant="barn" color="dark" />
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div 
            ref={contentRef}
            className={`transition-all duration-700 ${
              contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="w-16 h-0.5 bg-accent mb-6" />
            <h2 className="heading-section text-foreground mb-4">
              More Than a Business
            </h2>
            <p className="text-muted-foreground mb-4">
              Peninsula Equine isn't just a company—it's a family affair. When we're 
              not building world-class equine facilities, you'll find us spending 
              time together, often with our animals.
            </p>
            <p className="text-muted-foreground">
              From custom chicken coops to matching PE caps, we bring the same 
              attention to detail and love to everything we do. This personal 
              approach is what sets us apart—we treat every client's project like 
              it's our own.
            </p>
          </div>

          {/* Video Carousel */}
          <div 
            ref={carouselRef}
            className={`transition-all duration-700 delay-200 ${
              carouselVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <FamilyVideoCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoTestimonialCard({ item, index }: { item: typeof VIDEO_TESTIMONIALS[0]; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="group rounded-xl overflow-hidden border border-border bg-card card-hover-glow">
      {/* Video */}
      <div className="relative aspect-video bg-muted cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
          loop
          onEnded={() => setIsPlaying(false)}
        >
          <source src={item.video} type="video/mp4" />
        </video>
        {/* Play/pause overlay */}
        <div className={`absolute inset-0 flex items-center justify-center bg-primary/30 transition-opacity duration-300 ${
          isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
        }`}>
          <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
            {isPlaying ? (
              <Pause className="h-6 w-6 text-accent-foreground" />
            ) : (
              <Play className="h-6 w-6 text-accent-foreground ml-1" />
            )}
          </div>
        </div>
      </div>
      {/* Quote card */}
      <div className="p-6">
        <Quote className="h-5 w-5 text-accent/40 mb-3" />
        <p className="text-foreground text-sm leading-relaxed italic mb-4 line-clamp-3">
          "{item.testimonial.quote}"
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif font-semibold text-foreground text-sm">{item.testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{item.testimonial.role}</p>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: item.testimonial.rating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsGallerySection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(FEATURED_WRITTEN.length);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <BlueprintBackground image={blueprintDetail} opacity={0.02} direction="left-to-right" duration={2200} parallaxSpeed={0.06} />
      <div className="section-container relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">What Our Clients Say</h2>
          <p className="text-muted-foreground">
            Hear directly from horse owners, trainers, and facility managers who've trusted us with their projects.
          </p>
        </div>

        {/* Video testimonials row */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {VIDEO_TESTIMONIALS.map((item, index) => (
            <SectionTransition key={item.testimonial.id} variant="fade-up" delay={index * 150}>
              <VideoTestimonialCard item={item} index={index} />
            </SectionTransition>
          ))}
        </div>

        {/* Written testimonials grid */}
        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_WRITTEN.map((t, index) => (
            <div
              key={t.id}
              className={`group p-5 rounded-xl border border-border bg-card card-hover-glow transition-all duration-600 ${
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Quote className="h-4 w-4 text-accent/30 mb-3" />
              <p className="text-sm text-foreground/80 italic leading-relaxed mb-4 line-clamp-4">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
              <p className="font-serif font-semibold text-foreground text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
            <Link to="/testimonials">
              View All Testimonials
              <ArrowRight className="ml-2 h-4 w-4" />
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
      title="Let's Build Something Great Together"
      description="Whether you're planning a new arena, expanding your barn, or starting from scratch, we'd love to hear about your project."
      backgroundImage={ciroWide}
      primaryButtonText="Schedule a Consultation"
      primaryButtonLink="/contact"
      showPhoneButton={false}
    />
  );
}

export default function About() {
  return (
    <Layout>
      <PageHeader />
      <CiroSection />
      <BlueprintDivider variant="elevation" />
      <NaturalHorsemanshipSection />
      <ValuesSection />
      <TestimonialsGallerySection />
      <FamilySection />
      <ImageBreak />
      <BlueprintDivider variant="structural" />
      <StorySection />
      <CTASection />
    </Layout>
  );
}
