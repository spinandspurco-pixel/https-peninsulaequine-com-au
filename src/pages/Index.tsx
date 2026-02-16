import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown, Star, Hammer, Ruler, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { MultiStepInquiryForm } from "@/components/MultiStepInquiryForm";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { RopeDivider } from "@/components/RopeDivider";
import { siteConfig, services, testimonials } from "@/data/content";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import { BlueprintScene } from "@/components/BlueprintScene";
import heroVideo from "@/assets/videos/main-ridge-woodwork-1.mp4";
import stoneworkBW from "@/assets/aberdeen-stonework-bw.jpg";
import peLogo from "@/assets/pe-logo-new.png";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";

const featuredServices = services.slice(0, 4);
const topQuotes = testimonials.slice(0, 3);

/* ─── 1. Hero ─────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-primary">
      <video
        autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/70" />
      <BlueprintScene preset="hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--primary))_85%)]" />

      <div className="relative z-10 text-center px-6">
        <img
          src={peLogo}
          alt="Peninsula Equine"
          loading="eager"
          className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8 drop-shadow-[0_4px_30px_hsl(var(--accent)/0.3)]"
        />
        <div className="w-16 h-px mx-auto mb-8 bg-accent" />
        <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[0.25em] uppercase text-primary-foreground leading-[1.3] mb-4">
          Peninsula <span className="text-accent">Equine</span>
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

      <button
        onClick={() => document.getElementById('about-teaser')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors cursor-pointer"
        aria-label="Scroll to content"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}

/* ─── 2. About Teaser — Chapter 01 ────────────────── */
function AboutTeaser() {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <>
      <BlueprintChapter
        chapter="01"
        chapterTitle="The Horseman"
        scenePreset="intro"
        bg="bg-background"
        specLabels={[
          { text: "EST. MORNINGTON PENINSULA", position: "bottom-left" },
        ]}
        className="section-padding"
      >
        <div id="about-teaser" className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <SectionTransition variant="fade-up" duration={600}>
              <p className="text-muted-foreground uppercase tracking-[0.25em] text-sm mb-6">
                Mornington Peninsula, Victoria
              </p>
            </SectionTransition>
            <SectionTransition variant="blur-in" delay={100} duration={800}>
              <h2 className="heading-section text-foreground mb-6">
                Where world-class equine facilities are built by the hands of a horseman
              </h2>
            </SectionTransition>
            <SectionTransition variant="fade-up" delay={200} duration={700}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Decades of experience in both riding and building. Ciro brings a horseman's
                intuition to every arena, barn, and bespoke project.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">
                  Meet Ciro &amp; Our Story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </SectionTransition>
          </div>
        </div>
      </BlueprintChapter>

      {/* Image break */}
      <div
        ref={imageRef}
        className="relative h-[35vh] min-h-[260px] overflow-hidden"
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
    </>
  );
}

/* ─── 3. Services Strip — Chapter 02 ─────────────── */
function ServicesStrip() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <BlueprintChapter
      chapter="02"
      chapterTitle="What We Build"
      scenePreset="services"
      bg="bg-primary"
      textColor="text-primary-foreground"
      specLabels={[
        { text: "DWG-SV01 · SERVICES", position: "bottom-right" },
      ]}
      className="section-padding overflow-hidden"
    >
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8 bg-accent" />
          <SectionTransition variant="fade-up">
            <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-sm mb-4">What We Build</p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-4">Built for Horses, Designed by a Horseman</h2>
          </SectionTransition>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-primary-foreground/10">
          {featuredServices.map((service, i) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className={`group p-8 bg-primary hover:bg-primary-foreground/[0.06] transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-serif text-xl text-primary-foreground mb-2 group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-primary-foreground/55 text-sm leading-relaxed mb-3 line-clamp-2">
                {service.shortDescription}
              </p>
              <span className="inline-flex items-center text-sm text-primary-foreground/70 group-hover:text-accent transition-colors">
                Details <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={300} className="text-center mt-10">
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
    </BlueprintChapter>
  );
}

/* ─── 4. Gallery Teaser — Chapter 03 ─────────────── */
function GalleryTeaser() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const images = [
    { src: aberdeenBarnInterior, alt: "Aberdeen Farm — luxury barn interior" },
    { src: mainRidgeInterior, alt: "Main Ridge — open barn with natural light" },
    { src: qldCourtyard, alt: "Queensland Facility — courtyard" },
  ];

  return (
    <BlueprintChapter
      chapter="03"
      chapterTitle="Portfolio"
      scenePreset="gallery"
      bg="bg-background"
      specLabels={[
        { text: "SCALE 1:100 · PORTFOLIO", position: "top-right" },
      ]}
      className="section-padding overflow-hidden"
    >
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8" />
          <SectionTransition variant="fade-up">
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">Portfolio</p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-4">Craftsmanship in Every Detail</h2>
          </SectionTransition>
        </div>

        <div ref={ref} className="grid grid-cols-3 gap-2 sm:gap-4">
          {images.map((img, i) => (
            <Link
              key={i}
              to="/gallery"
              className={`group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted/20 transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <img src={img.src} alt={img.alt} loading="lazy" decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-300" />
            </Link>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={300} className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/gallery">
              View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </BlueprintChapter>
  );
}

/* ── Rope divider between gallery and process ──────── */

/* ─── 5. Process Teaser — Chapter 04 ─────────────── */
function ProcessTeaser() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const steps = [
    { icon: Ruler, label: "Site Consultation", desc: "Ciro walks your land and reads the terrain" },
    { icon: Hammer, label: "Design & Build", desc: "Custom plans, not templates" },
    { icon: CheckCircle, label: "Handover", desc: "A facility you're proud to own" },
  ];

  return (
    <BlueprintChapter
      chapter="04"
      chapterTitle="The Process"
      scenePreset="services"
      bg="bg-primary"
      textColor="text-primary-foreground"
      specLabels={[
        { text: "8 PHASES · FROM DIRT TO DYNASTY", position: "bottom-left" },
      ]}
      className="section-padding overflow-hidden"
    >
      <div className="section-container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8 bg-accent" />
          <SectionTransition variant="fade-up">
            <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-sm mb-4">Our Process</p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-4">From Dirt to Dynasty</h2>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={200}>
            <p className="text-primary-foreground/60 leading-relaxed">
              An 8-phase construction journey — from first site visit to final footing.
            </p>
          </SectionTransition>
        </div>

        <div
          ref={ref}
          className={`grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="text-center"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-lg text-primary-foreground mb-1">{step.label}</h3>
              <p className="text-sm text-primary-foreground/50">{step.desc}</p>
            </div>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={300} className="text-center">
          <Button
            asChild variant="outline" size="lg"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-sm px-10 tracking-[0.15em] uppercase font-sans"
          >
            <Link to="/process">
              See Full Process <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </BlueprintChapter>
  );
}

/* ─── 6. Testimonial Strip — Chapter 05 ──────────── */
function TestimonialStrip() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  return (
    <BlueprintChapter
      chapter="05"
      chapterTitle="Testimonials"
      scenePreset="barn"
      bg="bg-card"
      specLabels={[
        { text: "CLIENT REVIEWS", position: "top-right" },
      ]}
      className="section-padding overflow-hidden"
    >
      <div ref={ref} className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8" />
          <SectionTransition variant="blur-in">
            <h2 className="heading-editorial mb-4">What Our Clients Say</h2>
          </SectionTransition>
        </div>

        <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {topQuotes.map((t, i) => (
            <div
              key={t.id}
              className="p-7 rounded-lg bg-background border border-border hover:border-accent/50 transition-all duration-500"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <blockquote className="text-foreground leading-relaxed mb-5 font-serif italic text-sm">
                "{t.quote.length > 120 ? t.quote.slice(0, 120) + "…" : t.quote}"
              </blockquote>
              <div className="pt-4 border-t border-border">
                <p className="font-serif font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionTransition variant="fade-up" delay={300} className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/testimonials">
              Read All Reviews <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </BlueprintChapter>
  );
}

/* ─── 7. Events Teaser — Chapter 06 ──────────────── */
function EventsTeaser() {
  return (
    <BlueprintChapter
      chapter="06"
      chapterTitle="Events"
      scenePreset="facility"
      bg="bg-background"
      specLabels={[
        { text: "CLINICS · OPEN DAYS · EXPOS", position: "bottom-right" },
      ]}
      className="py-16 sm:py-20"
    >
      <div className="section-container text-center">
        <SectionTransition variant="fade-up">
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">Don't Miss Out</p>
          <h2 className="heading-editorial text-foreground mb-4">Upcoming Events &amp; Clinics</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            From Equitana expos to local clinics and open days — find your next opportunity.
          </p>
          <Button
            asChild size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm px-10 tracking-[0.15em] uppercase font-sans"
          >
            <Link to="/events">
              View Events <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </BlueprintChapter>
  );
}

/* ─── 8. Quote CTA ────────────────────────────────── */
function InquiryFormSection() {
  return (
    <BlueprintChapter
      chapterTitle="Get Started"
      scenePreset="intro"
      bg="bg-background"
      specLabels={[
        { text: "NO OBLIGATION · FREE ESTIMATE", position: "top-left" },
      ]}
      className="section-padding"
    >
      <div id="free-quote" className="section-container">
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
    </BlueprintChapter>
  );
}

/* ─── Page ────────────────────────────────────────── */
export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <AboutTeaser />
      <ServicesStrip />
      <RopeDivider variant="gold" className="bg-background py-2" />
      <GalleryTeaser />
      <ProcessTeaser />
      <RopeDivider variant="muted" className="bg-card py-2" />
      <TestimonialStrip />
      <EventsTeaser />
      <InquiryFormSection />
    </Layout>
  );
}
