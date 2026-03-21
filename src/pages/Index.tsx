import { useRef, useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Fence, Home, Mountain, Shovel, Wrench, ChevronRight } from "lucide-react";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";
import { ConversionBridge } from "@/components/ConversionBridge";
import { cn } from "@/lib/utils";

// Video
import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

// Portfolio imagery
import garageInterior from "@/assets/garage-interior-flake.webp";
import garageExterior from "@/assets/garage-exterior.webp";
import interiorTimberWindow from "@/assets/interior-timber-window.webp";
import mainRidgeFinishedExterior from "@/assets/main-ridge-finished-exterior.webp";
import steelShedDramatic from "@/assets/steel-shed-dramatic.webp";
import portfolioArenaSymmetry from "@/assets/portfolio-arena-symmetry.jpg";
import portfolioPropertyAerial from "@/assets/portfolio-property-aerial.jpg";

// CTA closer
import heroSunset from "@/assets/hero-sunset.webp";

const PROJECTS = [
  { src: mainRidgeFinishedExterior, alt: "Main Ridge pavilion at dusk", label: "Main Ridge", scope: "Pavilion & Parrilla Grill", slug: "main-ridge" },
  { src: portfolioPropertyAerial, alt: "Complete equine property — aerial masterplan", label: "Full Property", scope: "Arena, Stables & Paddocks", slug: "main-ridge" },
  { src: garageInterior, alt: "Precision garage interior with flake floor", label: "Private Client", scope: "Garage & Workshop", slug: "aberdeen-farm" },
  { src: steelShedDramatic, alt: "Custom steel barn with dramatic sky", label: "Steel Structures", scope: "Colorbond Barn Build", slug: "caulfield" },
  { src: portfolioArenaSymmetry, alt: "Precision-groomed arena at golden hour", label: "Arena Build", scope: "Surface & Fencing", slug: "main-ridge" },
  { src: garageExterior, alt: "Steel shed with polished concrete apron", label: "Mornington Peninsula", scope: "Steel Structures", slug: "caulfield" },
  { src: interiorTimberWindow, alt: "Recycled timber cladding with bush views", label: "Main Ridge Interior", scope: "Timber Fit-out", slug: "main-ridge" },
];

const SERVICES = [
  { icon: Mountain, title: "Arenas", desc: "Precision-graded surfaces engineered for consistent footing, drainage performance, and long-term use.", href: "/services" },
  { icon: Fence, title: "Fencing & Yards", desc: "Post-and-rail, steel, and custom configurations shaped around horse movement and property flow.", href: "/services" },
  { icon: Home, title: "Stables & Barns", desc: "Structures designed around equine behaviour — airflow, sightlines, workflow, and longevity.", href: "/services" },
  { icon: Layers, title: "GroundLock Entry Systems", desc: "Interlocking ground stabilisation for entries, laneways, and high-traffic arrival zones.", href: "/groundlock" },
  { icon: Shovel, title: "Earthworks & Drainage", desc: "Sub-base profiling and drainage mapping shaped by how the site actually moves water.", href: "/services" },
  { icon: Wrench, title: "Custom Infrastructure", desc: "Wash bays, float hardstands, pavilions, and bespoke rural builds for real daily use.", href: "/services" },
];

/* ── Service Icon ───── */
function ServiceIcon({ icon: Icon, className }: { icon: typeof Mountain; className?: string }) {
  return (
    <Icon
      className={cn("w-[18px] h-[18px] text-muted-foreground/25", className)}
      strokeWidth={1.5}
    />
  );
}

/* ── Horizontal scroll projects ─────── */
function ProjectsScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 lg:-mx-0 lg:px-0 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {PROJECTS.map((project, i) => (
          <Link
            key={i}
            to={`/project/${project.slug}`}
            className="group relative flex-shrink-0 w-[80vw] sm:w-[50vw] lg:w-[36vw] aspect-[4/5] overflow-hidden snap-start"
          >
            <img
              src={project.src}
              alt={project.alt}
              className="absolute inset-0 w-full h-full object-cover img-immersive img-portfolio"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-transparent" />
            <div className="absolute inset-0 grain-texture opacity-30" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <p className="text-[9px] uppercase tracking-[0.25em] text-accent/50 font-mono mb-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">{project.scope}</p>
              <p className="font-serif text-lg text-foreground/60 group-hover:text-foreground transition-opacity duration-300">{project.label}</p>
              <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-60 transition-opacity duration-300 text-accent">
                <span className="text-[10px] uppercase tracking-[0.15em] font-mono">View Project</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      {canScrollRight && (
        <div className="hidden lg:flex absolute right-0 top-0 bottom-4 w-28 items-center justify-end bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none">
          <ChevronRight className="w-5 h-5 text-accent/20 mr-3" />
        </div>
      )}
    </div>
  );
}

export default function Index() {
  /* Scroll-driven hero fade */
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [heroFade, setHeroFade] = useState(1);

  const handleScroll = useCallback(() => {
    const el = heroContentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // Start fading when top of hero content reaches 80% of viewport, fully gone by 30%
    const progress = Math.max(0, Math.min(1, (rect.top - vh * 0.2) / (vh * 0.55)));
    setHeroFade(progress);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <Layout>
      {/* ═══ 1. HERO — CINEMATIC ARRIVAL ═══════════════ */}
      <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center bg-[hsl(222_20%_4%)]">
        {/* Background — slow emergence from near-black */}
        <div
          style={{ opacity: 0, animation: "heroBackdropReveal 1400ms ease-out 200ms forwards" }}
        >
          <video
            autoPlay muted loop playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover img-hero"
            style={{ width: '100%', height: '100%' }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-background/70" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 50% 35% at 50% 46%, transparent 0%, hsl(222 20% 4% / 0.85) 45%, hsl(222 20% 4%) 100%)",
            }}
          />
          {/* Extra shadow at edges to kill bright spots */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, hsl(222 20% 4% / 0.4) 0%, transparent 30%, transparent 70%, hsl(222 20% 4% / 0.6) 100%)",
            }}
          />
        </div>
        <div className="absolute inset-0 pointer-events-none grain-hero" />

        {/* Content — staged reveals, fades on scroll */}
        <div
          ref={heroContentRef}
          className="relative z-10 section-container text-center max-w-5xl mx-auto"
          style={{ opacity: heroFade, willChange: "opacity" }}
        >
          <div className="flex flex-col items-center gap-10 sm:gap-14 lg:gap-16">
            {/* Brand tag — 900ms (stillness after backdrop settles) */}
            <div
              className="flex items-center justify-center gap-5"
              style={{ opacity: 0, animation: "heroFadeIn 800ms ease-out 900ms forwards" }}
            >
              <div className="w-12 h-px bg-accent/20" />
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50">Peninsula Equine</p>
              <div className="w-12 h-px bg-accent/20" />
            </div>

            {/* Headline — 1200ms */}
            <div className="space-y-5 sm:space-y-6">
              <h1
                className="font-serif font-bold text-foreground leading-[0.88] tracking-[-0.01em]"
                style={{
                  opacity: 0,
                  animation: "heroFadeIn 800ms ease-out 1200ms forwards",
                  fontSize: "clamp(3rem, 1.6rem + 6.5vw, 7.5rem)",
                  textShadow: "0 2px 40px hsl(222 20% 4% / 0.6)",
                }}
              >
                Built from the<br className="hidden sm:block" /> ground up.
              </h1>
              {/* Sub-headline — 1600ms */}
              <p
                className="font-serif font-light text-foreground/25 leading-[0.95] tracking-[0.02em]"
                style={{
                  opacity: 0,
                  animation: "heroFadeIn 800ms ease-out 1600ms forwards",
                  fontSize: "clamp(1.5rem, 0.75rem + 3.2vw, 3.5rem)",
                }}
              >
                Designed to last generations.
              </p>
            </div>

            {/* Supporting text — 2000ms */}
            <p
              className="text-muted-foreground/30 text-[11px] sm:text-[12px] tracking-[0.2em] uppercase max-w-lg leading-[2.2]"
              style={{ opacity: 0, animation: "heroFadeIn 800ms ease-out 2000ms forwards" }}
            >
              Premium equine infrastructure engineered for performance, longevity, and legacy.
            </p>

            {/* CTA — 2500ms */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              style={{ opacity: 0, animation: "heroFadeIn 800ms ease-out 2500ms forwards" }}
            >
              <Button asChild variant="gold" size="lg" className="px-8">
                <Link to="/site-assessment">
                  Start a Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-transparent border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/25 hover:bg-foreground/[0.03] transition-all duration-700 px-8">
                <Link to="/gallery">View Projects</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator — 3000ms */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          style={{ opacity: 0, animation: "heroFadeIn 800ms ease-out 3000ms forwards" }}
        >
          <div className="w-px h-14 bg-accent/8 relative overflow-hidden">
            <div
              className="absolute top-0 w-full h-4 bg-accent/25"
              style={{ animation: "scrollPulse 3s ease-in-out infinite 3.8s" }}
            />
          </div>
        </div>

        {/* Bottom bleed — dissolves hero into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 sm:h-52 pointer-events-none z-20"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--card)) 100%)",
          }}
        />
      </section>

      {/* ═══ 2. GROUNDLOCK — SIGNATURE SYSTEM ══════════════ */}
      <section className="relative overflow-hidden cv-auto -mt-px">
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture opacity-30" />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              <div>
                <RevealOnScroll direction="up">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50 mb-6">
                    Signature Ground System
                  </p>
                  <h2 className="heading-section text-foreground mb-8 leading-[1.1]">
                    P.E. GroundLock™
                  </h2>
                  <p className="text-[14px] text-muted-foreground/45 leading-[2] mb-6 max-w-[360px]">
                    An engineered entry system built for equine and rural properties —
                    designed for floats, trucks, and repeated front-gate arrivals
                    where standard surfaces fail within seasons.
                  </p>
                  <p className="text-[11px] text-muted-foreground/20 italic tracking-[0.04em] mb-10">
                    What sits beneath determines what lasts above.
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={200}>
                  <Button asChild variant="outline-light" size="default">
                    <Link to="/groundlock">
                      See How It Works <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </RevealOnScroll>
              </div>
              <RevealOnScroll direction="up" delay={150}>
                <InteractiveLayerStack />
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ── Conversion Bridge 1 ──────────────────── */}
      <ConversionBridge
        label="Every project starts here"
        heading="Book a complimentary site reading."
        subtext="We assess your property's terrain, drainage, and access before recommending any system or build."
        ctaLabel="Assess My Site"
        ctaHref="/site-assessment"
        trustLine="50+ properties assessed across the Mornington Peninsula"
      />

      {/* ═══ 3. PROJECTS — HORIZONTAL SCROLL ═══════════════ */}
      <section className="relative overflow-hidden cv-auto">
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-7xl mx-auto relative z-[1]">
            <div className="mb-14 sm:mb-18">
              <RevealOnScroll direction="up">
                <RevealLine className="mb-6" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-3">Portfolio</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Selected Work
                </h2>
              </RevealOnScroll>
            </div>

            <RevealOnScroll direction="up" delay={200}>
              <ProjectsScroll />
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={300}>
              <div className="mt-12">
                <Button asChild variant="outline-light" size="default">
                  <Link to="/gallery">View All Projects <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Conversion Bridge 2 ──────────────────── */}
      <ConversionBridge
        variant="accent"
        label="From concept to completion"
        heading="Discuss your project with our team."
        subtext="Whether it's a single arena or a full property build — we scope it properly before quoting."
        ctaLabel="Discuss Project"
        ctaHref="/contact"
        trustLine="Limited projects accepted per season"
      />

      {/* ═══ 4. SERVICES — WHAT WE BUILD ═══════════════════ */}
      <section className="relative overflow-hidden cv-auto">
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-30" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-24">
              <RevealOnScroll direction="up">
                <div className="flex items-center justify-center gap-5 mb-10">
                  <div className="w-10 h-px bg-accent/20" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40">Capabilities</p>
                  <div className="w-10 h-px bg-accent/20" />
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={100}>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.25rem] font-light text-foreground/80 leading-[1.25] max-w-xl mx-auto">
                  Equine Construction &amp; Rural Infrastructure
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-5">
              {SERVICES.map((svc, i) => (
                <RevealOnScroll key={svc.title} direction="up" stagger={i} staggerInterval={80}>
                  <Link
                    to={svc.href}
                    className="group relative flex flex-col p-8 sm:p-10 min-h-[220px] border border-border/20 hover:border-border/40 bg-card/40 transition-opacity duration-300 ease-out"
                  >
                    <div className="absolute top-0 left-0 w-8 h-px bg-accent/20" />
                    <ServiceIcon icon={svc.icon} className="mb-6" />
                    <h3 className="font-serif text-[15px] font-medium text-foreground/65 mb-4 tracking-[0.02em] group-hover:text-foreground/90 transition-opacity duration-300">
                      {svc.title}
                    </h3>
                    <p className="text-[12px] text-muted-foreground/25 leading-[2.1] max-w-[260px] flex-1">{svc.desc}</p>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="up" delay={300}>
              <div className="text-center mt-14">
                <Button asChild variant="outline-light" size="default">
                  <Link to="/services">View All Services <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-border/10 cv-auto">
        <div className="section-container max-w-4xl mx-auto">
          <RevealOnScroll direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 text-center">
              {[
                { stat: "50+", label: "Properties Built" },
                { stat: "15+", label: "Years Experience" },
                { stat: "100%", label: "Owner-Operated" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-light text-foreground/60">{item.stat}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/30">{item.label}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ 5. FINAL CTA — cinematic sunset ═══════════════ */}
      <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        <img
          src={heroSunset}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover img-cta"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        <div className="absolute inset-0 grain-hero" />

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="section-container text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-12" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-6 leading-[1.1]">
                Let's build it properly.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-[13px] text-muted-foreground/30 mb-10 leading-[2] max-w-[360px] mx-auto">
                From arenas and stables to signature entry systems —
                projects begin with a site reading.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="gold" size="lg" className="px-8">
                  <Link to="/site-assessment">
                    Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-transparent border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/25 hover:bg-foreground/[0.03] transition-all duration-700 px-8">
                  <Link to="/contact">Talk to Us</Link>
                </Button>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={350}>
              <p className="text-muted-foreground/12 text-[9px] tracking-[0.3em] uppercase mt-10">
                Limited projects per season
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
