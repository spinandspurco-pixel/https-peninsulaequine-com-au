import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Quote, Star, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { FamilyVideoCarousel } from "@/components/FamilyVideoCarousel";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { MeetTheTeamGallery } from "@/components/MeetTheTeamGallery";
import { InsuranceSafetyCard } from "@/components/InsuranceSafetyCard";
import { SectionTransition } from "@/components/SectionTransition";
import { aboutCiro, testimonials, faqs } from "@/data/content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
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

import mainRidgeWoodwork1 from "@/assets/videos/main-ridge-woodwork-1.mp4";
import mainRidgeWoodwork2 from "@/assets/videos/main-ridge-woodwork-2.mp4";

// Craft videos shown independently — NOT paired with testimonials
const CRAFT_VIDEOS = [
  { src: mainRidgeWoodwork1, title: "Timber Craftsmanship — Main Ridge" },
  { src: mainRidgeWoodwork2, title: "Precision Woodwork — Main Ridge" },
];

// All written testimonials shown in a clean grid
const FEATURED_TESTIMONIALS = testimonials;

// About page uses the shared PageHeader component

function CiroSection() {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding relative overflow-hidden">
      <BlueprintBackground image={blueprintElevation} opacity={0.03} direction="left-to-right" duration={2200} parallaxSpeed={0.05} />
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
                alt="Ciro Parisella, founder of Peninsula Equine, standing alongside a horse at Main Ridge — expert horseman and equine facility builder"
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
    <section className="section-padding bg-card relative overflow-hidden">
      <BlueprintBackground image={blueprintBarn} opacity={0.025} direction="left-to-right" duration={2000} />
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
    { src: mainRidgeWoodwork1, title: "Timber Craftsmanship" },
    { src: mainRidgeWoodwork2, title: "Precision Woodwork" },
  ];

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <BlueprintBackground image={blueprintElevation} opacity={0.02} direction="bottom-to-top" duration={1800} parallaxSpeed={0.07} />
      <div className="section-container">
        <div 
          ref={headerRef}
          className={`max-w-3xl mx-auto text-center mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            The Craft Behind the Build
          </h2>
          <p className="text-muted-foreground text-lg">
            Every facility is built with traditional craftsmanship and a horseman's intuition. 
            Ciro's hands-on approach ensures every timber joint, every stone, and every detail 
            is built to last generations.
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
          alt="Horse and rider training in a Peninsula Equine arena — natural horsemanship in action"
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
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="right-to-left" />
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
              Today, Peninsula Equine serves the Mornington Peninsula and surrounding regions 
              of Victoria, building facilities that stand as a testament to what's possible when 
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
      <BlueprintBackground image={blueprintBarn} opacity={0.02} direction="left-to-right" duration={2000} parallaxSpeed={0.05} />
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

function TestimonialsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(FEATURED_TESTIMONIALS.length);

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

        {/* Clean testimonials grid — no videos attached */}
        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_TESTIMONIALS.map((t, index) => (
            <div
              key={t.id}
              className={`group p-6 rounded-xl border border-border bg-card card-hover-glow transition-all duration-600 flex flex-col ${
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Quote className="h-4 w-4 text-accent/30 mb-3 shrink-0" />
              <p className="text-sm text-foreground/80 italic leading-relaxed mb-5 flex-1">
                "{t.quote}"
              </p>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                </div>
                <p className="font-serif font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
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

function IntroSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <BlueprintBackground image={blueprintDetail} opacity={0.02} direction="left-to-right" duration={2000} />
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTransition variant="fade-up" delay={0}>
            <p className="text-muted-foreground uppercase tracking-[0.25em] text-sm mb-6">
              Mornington Peninsula, Victoria
            </p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={200}>
            <h2 className="heading-section text-foreground mb-6 leading-tight transition-all duration-500 hover:drop-shadow-[0_0_25px_hsl(var(--accent)/0.3)]">
              Where world-class equine facilities are built by the hands of a <span className="text-accent italic">horseman</span>
            </h2>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={450}>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Peninsula Equine is a construction company specializing in premium arenas, barns,
              and equestrian infrastructure. With decades of experience in both riding and building,
              Ciro brings a horseman's intuition to every project.
            </p>
          </SectionTransition>
        </div>
      </div>
    </section>
  );
}

function PhilosophySection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: closingRef, isVisible: closingVisible } = useScrollAnimation<HTMLDivElement>();

  const { philosophy } = aboutCiro;

  return (
    <section className="section-padding bg-primary text-primary-foreground relative overflow-hidden">
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="bottom-to-top" duration={2400} parallaxSpeed={0.04} />
      <div className="section-container relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-1000 ease-out ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-accent uppercase tracking-[0.25em] text-sm mb-4">Our Approach</p>
          <h2 className="heading-section mb-6">{philosophy.headline}</h2>
          <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mx-auto">
            {philosophy.intro}
          </p>
        </div>

        {/* Pillars grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 gap-px bg-primary-foreground/10 rounded-lg overflow-hidden mb-16">
          {philosophy.pillars.map((pillar, i) => (
            <div
              key={pillar.number}
              className={`group p-8 sm:p-10 bg-primary transition-all duration-900 ease-out hover:bg-primary-foreground/[0.04] ${
                gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <span className="text-accent font-mono text-sm tracking-[0.3em] mb-4 block transition-transform duration-300 group-hover:translate-x-1">
                {pillar.number}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-primary-foreground mb-3 transition-colors duration-300 group-hover:text-accent">
                {pillar.title}
              </h3>
              <p className="text-primary-foreground/60 text-sm leading-relaxed transition-colors duration-300 group-hover:text-primary-foreground/80">
                {pillar.description}
              </p>
              <div className="w-0 h-px bg-accent mt-5 transition-all duration-500 group-hover:w-12" />
            </div>
          ))}
        </div>

        {/* Closing statement */}
        <div
          ref={closingRef}
          className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
            closingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <blockquote className="font-serif text-lg sm:text-xl text-primary-foreground/80 italic leading-relaxed">
            "{philosophy.closing}"
          </blockquote>
          <div className="w-12 h-px bg-accent mx-auto mt-8" />
        </div>
      </div>
    </section>
  );
}

/* ── FAQ Section ──────────────────────────────────────── */

const FAQ_CATEGORIES = [
  { key: "general", label: "General" },
  { key: "lessons", label: "Lessons" },
  { key: "payments", label: "Payments & Packages" },
] as const;

function AboutFAQSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState("general");

  const filtered = faqs.filter((f) => (f.category || "general") === activeTab);

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      <BlueprintBackground image={blueprintDetail} opacity={0.02} direction="right-to-left" duration={2000} />
      <div className="section-container relative z-10">
        <div
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-10 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-sm">
            Quick answers to the questions we hear most. Can't find what you're looking for?{" "}
            <Link to="/contact" className="text-accent hover:underline underline-offset-2">Get in touch.</Link>
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all duration-300",
                activeTab === cat.key
                  ? "bg-accent text-accent-foreground shadow-[0_2px_12px_hsl(var(--accent)/0.25)]"
                  : "bg-background border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((faq, i) => (
              <AccordionItem
                key={`${activeTab}-${i}`}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-background px-6 transition-all duration-300 hover:border-accent/30 data-[state=open]:border-accent/40 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="py-4 text-sm font-medium text-foreground hover:text-accent hover:no-underline [&[data-state=open]]:text-accent gap-3">
                  <span className="flex items-center gap-2.5 text-left">
                    <HelpCircle className="h-4 w-4 text-accent shrink-0" />
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 pl-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA under FAQ */}
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
              <Link to="/faq">
                View All FAQs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <Layout>
      <PageHeader
        title="About Peninsula Equine"
        description="Building world-class equine facilities with the insight that only comes from a lifetime of horsemanship."
        backgroundImage={ciroWithHorse}
        dividerVariant="grid"
      />
      <IntroSection />
      <CiroSection />
      <BlueprintDivider variant="elevation" />
      <PhilosophySection />
      <NaturalHorsemanshipSection />
      <ValuesSection />
      <BlueprintDivider variant="structural" />
      <StorySection />
      <MeetTheTeamGallery />
      <TestimonialsSection />
      <FamilySection />
      <AboutFAQSection />
      <InsuranceSafetyCard />
      <CTASection />
    </Layout>
  );
}
