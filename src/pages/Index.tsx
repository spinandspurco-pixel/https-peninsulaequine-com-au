import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Fence, Home, Mountain, Shovel, Wrench, ChevronRight, Truck, Droplets, Gem } from "lucide-react";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";
import { cn } from "@/lib/utils";

// Video
import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

// Portfolio imagery — curated hero-tier visuals (unique to homepage)
import garageInterior from "@/assets/garage-interior-flake.webp";
import garageExterior from "@/assets/garage-exterior.webp";
import pavilionTimber from "@/assets/pavilion-timber-detail.webp";
import interiorTimberWindow from "@/assets/interior-timber-window.webp";
import mainRidgeFinishedExterior from "@/assets/main-ridge-finished-exterior.webp";
import steelShedDramatic from "@/assets/steel-shed-dramatic.webp";
import timberCubbyFront from "@/assets/timber-cubby-front.webp";

// Intro video
import buildVideo from "@/assets/videos/main-ridge-woodwork-1.mp4";

// Detail / material textures (unique to homepage strip)
import reclaimedBeamWorkshop from "@/assets/reclaimed-beam-workshop.jpg";

// Process / finished imagery (unique to homepage)
import processWideFinished from "@/assets/homepage-process-wide-finished.jpg";
import processTimberDetail from "@/assets/homepage-process-timber-detail.jpg";
import processStoneTexture from "@/assets/homepage-process-stone-texture.jpg";
import equitanaArenaFinish from "@/assets/equitana-arena-finish.jpg";

// Training
import glennRiding from "@/assets/glenn-riding.jpg";

// Shop / Forge imagery
import peBanner from "@/assets/pe-banner.png";

// CTA closer
import heroSunset from "@/assets/hero-sunset.webp";

const PROJECTS = [
  { src: mainRidgeFinishedExterior, alt: "Main Ridge pavilion at dusk", label: "Main Ridge", scope: "Pavilion & Parrilla Grill", slug: "main-ridge" },
  { src: garageInterior, alt: "Precision garage interior with flake floor", label: "Private Client", scope: "Garage & Workshop", slug: "aberdeen-farm" },
  { src: steelShedDramatic, alt: "Custom steel barn with dramatic sky", label: "Steel Structures", scope: "Colorbond Barn Build", slug: "caulfield" },
  { src: timberCubbyFront, alt: "Western-style bespoke timber cubby", label: "Custom Builds", scope: "Bespoke Timber", slug: "equitana" },
  { src: pavilionTimber, alt: "Timber and corrugated iron detail", label: "Peninsula Build", scope: "Structural Carpentry", slug: "equitana" },
  { src: garageExterior, alt: "Steel shed with polished concrete apron", label: "Mornington Peninsula", scope: "Steel Structures", slug: "caulfield" },
  { src: interiorTimberWindow, alt: "Recycled timber cladding with bush views", label: "Main Ridge Interior", scope: "Timber Fit-out", slug: "main-ridge" },
];

const SERVICES = [
  { icon: Mountain, title: "Arenas", desc: "Precision-graded surfaces engineered for consistent footing, drainage performance, and long-term use under horses and machinery.", href: "/services" },
  { icon: Fence, title: "Fencing & Yard Systems", desc: "Post-and-rail, steel, and custom configurations shaped around horse movement, handler access, and property flow.", href: "/services" },
  { icon: Home, title: "Stables & Barns", desc: "Structures designed around equine behaviour — airflow, sightlines, daily workflow, and structural longevity.", href: "/services" },
  { icon: Layers, title: "GroundLock Entry Systems", desc: "Interlocking ground stabilisation for front entries, laneways, and high-traffic arrival zones.", href: "/groundlock" },
  { icon: Shovel, title: "Earthworks & Drainage", desc: "Sub-base profiling, drainage behaviour mapping, and civil preparation shaped by how the site actually moves water.", href: "/services" },
  { icon: Wrench, title: "Custom Infrastructure", desc: "Wash bays, float hardstands, pavilions, and bespoke rural builds resolved for real daily use.", href: "/services" },
];

const PROCESS_STEPS = [
  { num: "01", title: "Site Reading", desc: "We walk the property to understand how it moves, drains, wears, and functions — from access and arrival to traffic flow and water behaviour." },
  { num: "02", title: "Specification", desc: "A structured project brief shaped by what the site told us — materials, drainage logic, access sequence, and build method." },
  { num: "03", title: "Construction", desc: "Hands-on build with quality checkpoints, real-time decisions on site, and zero compromise on method or material." },
  { num: "04", title: "Handover", desc: "Final walkthrough, care guidance, and a result built to hold up under weather, movement, machinery, horses, and time." },
];

/* ── Standardised spacing constants ───── */
const SP_SECTION = "py-28 sm:py-36 lg:py-44";
const SP_HEAD = "mb-14 sm:mb-18";
const SP_SM = "mb-6";

/* ── Soft gradient transition between sections ─── */
function SectionBleed({ from = "background", to = "card" }: { from?: string; to?: string }) {
  return (
    <div className="relative h-6 -mb-6 z-[2] pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--${from})) 0%, hsl(var(--${to})) 100%)`,
        }}
      />
    </div>
  );
}

/* ── Service Icon — quiet, architectural ───── */
function ServiceIcon({ icon: Icon, className }: { icon: typeof Mountain; className?: string }) {
  return (
    <Icon
      className={cn(
        "w-[18px] h-[18px] text-muted-foreground/25 transition-colors duration-700",
        "group-hover:text-accent/50",
        className
      )}
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
              className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.8] group-hover:brightness-[0.88] transition-[filter] duration-700"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-transparent" />
            <div className="absolute inset-0 grain-texture opacity-30" />
            <div className="absolute inset-0 bg-background/15 group-hover:bg-background/0 transition-opacity duration-300" />
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

/* ── Process Timeline ────────────────── */
function ProcessTimeline() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0">
      {PROCESS_STEPS.map((step, i) => (
        <RevealOnScroll key={step.num} direction="up" stagger={i} staggerInterval={120}>
          <div className="relative lg:px-8">
            {i < PROCESS_STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-3 left-[calc(50%+20px)] right-0 h-px bg-accent/8" />
            )}
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/25 mb-5 block">{step.num}</span>
            <h4 className="font-serif text-[15px] font-medium text-foreground/70 tracking-[0.02em] mb-4">{step.title}</h4>
            <p className="text-[12px] text-muted-foreground/30 leading-[2] max-w-[240px]">{step.desc}</p>
          </div>
        </RevealOnScroll>
      ))}
    </div>
  );
}

export default function Index() {
  // Preload hero video so LCP fires faster
  useLayoutEffect(() => {
    if (document.querySelector('link[data-hero-preload]')) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = heroVideo;
    link.setAttribute('data-hero-preload', '');
    document.head.appendChild(link);
  }, []);

  return (
    <Layout>
      {/* ═══ 1. HERO — FULL SCREEN CINEMATIC ═══════════════ */}
      <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.2] contrast-[1.2] saturate-[0.35]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/65" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 55% 40% at 50% 48%, transparent 5%, hsl(222 20% 4% / 0.9) 55%, hsl(222 20% 4%) 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none grain-texture" />
        <div className="absolute inset-0 pointer-events-none contour-texture opacity-[0.015]" />

        <div className="relative z-10 section-container text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-10 sm:gap-14 lg:gap-16">
            {/* Brand tag */}
            <div
              className="flex items-center justify-center gap-5"
              style={{ opacity: 0, animation: "heroFadeIn 300ms ease-out 50ms forwards" }}
            >
              <div className="w-12 h-px bg-accent/20" />
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50">Peninsula Equine</p>
              <div className="w-12 h-px bg-accent/20" />
            </div>

            {/* Headline block */}
            <div className="space-y-5 sm:space-y-6">
              <h1
                className="font-serif font-bold text-foreground leading-[0.88] tracking-[-0.01em]"
                style={{
                  opacity: 0,
                  animation: "heroFadeIn 300ms ease-out 200ms forwards",
                  fontSize: "clamp(3rem, 1.6rem + 6.5vw, 7.5rem)",
                }}
              >
                Built from the<br className="hidden sm:block" /> ground up.
              </h1>
              <p
                className="font-serif font-light text-foreground/25 leading-[0.95] tracking-[0.02em]"
                style={{
                  opacity: 0,
                  animation: "heroFadeIn 300ms ease-out 350ms forwards",
                  fontSize: "clamp(1.5rem, 0.75rem + 3.2vw, 3.5rem)",
                }}
              >
                Designed to last generations.
              </p>
            </div>

            {/* Supporting line */}
            <p
              className="text-muted-foreground/30 text-[11px] sm:text-[12px] tracking-[0.2em] uppercase max-w-lg leading-[2.2]"
              style={{ opacity: 0, animation: "heroFadeIn 300ms ease-out 500ms forwards" }}
            >
              Premium equine infrastructure engineered for performance, longevity, and legacy.
            </p>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              style={{ opacity: 0, animation: "heroFadeIn 300ms ease-out 650ms forwards" }}
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

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          style={{ opacity: 0, animation: "heroFadeIn 300ms ease-out 900ms forwards" }}
        >
          <div className="w-px h-14 bg-accent/8 relative overflow-hidden">
            <div
              className="absolute top-0 w-full h-4 bg-accent/25"
              style={{ animation: "scrollPulse 3s ease-in-out infinite" }}
            />
          </div>
        </div>
      </section>

      {/* ═══ 2. INTRO — SPLIT SCREEN ═══════════════════════ */}
      <SectionBleed from="background" to="background" />
      <section className="relative overflow-hidden">
        <div className={`${SP_SECTION} relative`}>
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-6xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Text — left-aligned */}
              <div>
                <RevealOnScroll direction="up">
                  <RevealLine className="mb-12" width="w-10" />
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={100}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">Built by a Horseman</p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={200}>
                  <h2 className="heading-section text-foreground mb-6 leading-[1.15]">
                    Understanding First.<br />
                    Then Construction.
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={300}>
                  <p className="text-[14px] text-muted-foreground/45 leading-[2.1] max-w-[340px]">
                    Peninsula Equine builds high-performance equine environments across Victoria.
                    From private arenas to full-scale facilities, every project is engineered for
                    longevity, usability, and clean execution.
                  </p>
                </RevealOnScroll>
              </div>
              {/* Video */}
              <RevealOnScroll direction="up" delay={200}>
                <div className="relative aspect-[4/5] overflow-hidden img-feather-sides lg:img-overlap-top lg:img-overlap-bottom">
                  <video
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.65] contrast-[1.1] saturate-[0.7]"
                  >
                    <source src={buildVideo} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/20" />
                  <div className="absolute inset-0 grain-texture opacity-30" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. CAPABILITIES — borderless, ecosystem-consistent ══════════ */}
      <section className="relative overflow-hidden">
        <div className="py-28 sm:py-36 lg:py-44 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-30" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            {/* Section header */}
            <div className="text-center mb-20 sm:mb-24">
              <RevealOnScroll direction="up">
                <div className="flex items-center justify-center gap-5 mb-10">
                  <div className="w-10 h-px bg-accent/20" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40">What We Build</p>
                  <div className="w-10 h-px bg-accent/20" />
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={100}>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.25rem] font-light text-foreground/80 leading-[1.25] max-w-xl mx-auto">
                  Capabilities
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={200}>
                <p className="mt-8 text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2.2] max-w-md mx-auto">
                  Equine construction and rural infrastructure — shaped by how properties
                  actually move, drain, wear, and function under daily use.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-5">
              {SERVICES.map((svc, i) => (
                <RevealOnScroll key={svc.title} direction="up" stagger={i} staggerInterval={80}>
                  <Link
                    to={svc.href}
                    className="group relative flex flex-col p-8 sm:p-10 min-h-[240px] border border-border/20 hover:border-border/40 bg-card/40 hover:bg-card/70 transition-opacity duration-300 ease-out"
                  >
                    <div className="absolute top-0 left-0 w-8 h-px bg-accent/20 group-hover:w-14 group-hover:bg-accent/40 transition-opacity duration-300" />
                    <ServiceIcon icon={svc.icon} className="mb-6" />
                    <h3 className="font-serif text-[15px] font-medium text-foreground/65 mb-4 tracking-[0.02em] group-hover:text-foreground/90 transition-opacity duration-300">
                      {svc.title}
                    </h3>
                    <p className="text-[12px] text-muted-foreground/25 leading-[2.1] max-w-[260px] flex-1">{svc.desc}</p>
                    <div className="flex items-center gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-3 h-3 text-accent/40" />
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. PROJECTS — HORIZONTAL SCROLL ═══════════════ */}
      <SectionBleed from="card" to="background" />
      <section className="relative overflow-hidden">
        <div className={`${SP_SECTION} relative`}>
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-7xl mx-auto relative z-[1]">
            {/* Left-aligned header */}
             <div className={`${SP_HEAD}`}>
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

      {/* ═══ PAUSE — visual stillness ═══════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-44 lg:py-56 relative">
          <div className="absolute inset-0 grain-texture opacity-20" />
          <div className="section-container relative z-10 flex flex-col items-center">
            <RevealOnScroll direction="up">
              <div className="relative w-full max-w-md aspect-[3/4] overflow-hidden img-feather-sides mx-auto">
                <img
                  src={mainRidgeFinishedExterior}
                  alt="Main Ridge finished pavilion at dusk"
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.55] saturate-[0.65] contrast-[1.1]"
                  loading="lazy"
              decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20" />
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <p className="mt-12 font-serif text-sm sm:text-base italic text-muted-foreground/25 tracking-[0.06em] text-center max-w-xs leading-[1.8]">
                Every detail serves the horse.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 4b. SIGNATURE SYSTEMS — strategic ecosystem layer ═══════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-44 lg:py-52 relative">
          <div className="absolute inset-0 grain-texture opacity-15" />

          <div className="section-container relative z-[1] max-w-5xl mx-auto">
            {/* Header — centred, editorial */}
            <div className="text-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <div className="flex items-center justify-center gap-5 mb-10">
                  <div className="w-10 h-px bg-accent/20" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40">
                    Signature Systems
                  </p>
                  <div className="w-10 h-px bg-accent/20" />
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={100}>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.25rem] font-light text-foreground/80 leading-[1.25] max-w-2xl mx-auto">
                  Proprietary solutions for the way equine properties arrive, function, and last.
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={200}>
                <p className="mt-8 text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2.2] max-w-lg mx-auto">
                  Beyond construction — a growing catalogue of engineered details,
                  ground systems, and architectural finishes designed to resolve the parts of a property
                  that most builders overlook.
                </p>
              </RevealOnScroll>
            </div>

            {/* Cards — separated with real borders, generous height */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5">
              {[
                {
                  title: "GroundLock",
                  body: "An interlocking entry system for floats, trucks, and gated arrivals — engineered beneath the surface for drainage, load distribution, and a cleaner point of arrival.",
                  cta: "Explore GroundLock",
                  href: "/groundlock",
                },
                {
                  title: "Arrival Packages",
                  body: "Integrated front-entry concepts combining surface systems, gate logic, edging, and threshold design for properties that need to present as well as they perform.",
                  cta: "View Entry Systems",
                  href: "/systems",
                },
                {
                  title: "Forge Details",
                  body: "Custom forged hardware, gate elements, signage, and branded rural details designed to complete the property with strength and identity.",
                  cta: "Explore Equus Forge",
                  href: "/forge",
                },
              ].map((card, i) => (
                <RevealOnScroll key={card.title} direction="up" stagger={i} staggerInterval={120}>
                  <Link
                    to={card.href}
                    className="group relative flex flex-col p-8 sm:p-10 lg:p-12 min-h-[300px] sm:min-h-[320px] border border-border/20 hover:border-border/40 bg-card/40 hover:bg-card/70 transition-opacity duration-300 ease-out"
                  >
                    {/* Accent line at top */}
                    <div className="absolute top-0 left-0 w-8 h-px bg-accent/20 group-hover:w-14 group-hover:bg-accent/40 transition-opacity duration-300" />

                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/25 mb-8 block">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <h4 className="font-serif text-[17px] sm:text-[18px] font-medium text-foreground/65 tracking-[0.02em] mb-5 group-hover:text-foreground/90 transition-opacity duration-300">
                      {card.title}
                    </h4>

                    <p className="text-[12px] text-muted-foreground/25 leading-[2.1] max-w-[280px] flex-1">
                      {card.body}
                    </p>

                    <div className="flex items-center gap-2 mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent/50">{card.cta}</span>
                      <ArrowRight className="w-3 h-3 text-accent/40" />
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            {/* Supporting line — removed to reduce noise */}
          </div>
        </div>
      </section>

      {/* ═══ 5. GROUNDLOCK — SIGNATURE SYSTEM ══════════════ */}
      <SectionBleed from="background" to="card" />
      <section className="relative overflow-hidden">
        <div className={`${SP_SECTION} bg-card relative`}>
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture opacity-30" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 40% 50% at 70% 50%, hsl(var(--accent) / 0.04) 0%, transparent 70%)" }}
          />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <RevealOnScroll direction="up">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50 mb-6">
                    Premium Equine Entry System
                  </p>
                  <h2 className="heading-section text-foreground mb-8 leading-[1.1]">
                    P.E. GroundLock™
                  </h2>
                  <p className="text-[14px] text-muted-foreground/45 leading-[2] mb-5 max-w-[360px]">
                    GroundLock is an engineered entry system built for equine and rural
                    properties — designed for floats, trucks, utes, and repeated front-gate arrivals
                    where standard surfaces fail within seasons.
                  </p>
                  <p className="text-[13px] text-muted-foreground/35 leading-[2] mb-6 max-w-[360px]">
                    It addresses the full arrival zone — drainage, load distribution, vehicle turning,
                    and the visual quality of a front entry that feels considered, not improvised.
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
                {/* Proof-point strip */}
                <RevealOnScroll direction="up" delay={300}>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-12">
                    {["Built for Floats + Trucks", "75–100mm Engineered Depth", "Stone / Gravel / Cobble Finish"].map((point) => (
                      <span key={point} className="text-[9px] uppercase tracking-[0.25em] text-accent/25 font-mono">{point}</span>
                    ))}
                  </div>
                </RevealOnScroll>
              </div>
              <RevealOnScroll direction="up" delay={150}>
                <div className="relative">
                  <div
                    className="absolute -inset-8 rounded-full opacity-40"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--accent) / 0.06) 0%, transparent 70%)",
                      animation: "pulse 4s ease-in-out infinite",
                    }}
                  />
                  <InteractiveLayerStack />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5b. GROUNDLOCK — WHY IT WORKS ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 lg:py-36 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-20" />
          <div className="section-container relative z-[1] max-w-5xl mx-auto">
            {/* Section intro */}
            <div className="mb-14 sm:mb-16">
              <RevealOnScroll direction="up">
                <RevealLine className="mb-6" width="w-8" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground/70 tracking-[0.02em] mb-3">
                  Why it works
                </h3>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={140}>
                <p className="text-[13px] text-muted-foreground/30 leading-[2] max-w-[400px]">
                  Three layers of logic beneath one clean surface.
                </p>
              </RevealOnScroll>
            </div>

            {/* Proof cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border/8">
              {[
                {
                  icon: Truck,
                  title: "Traffic-Ready",
                  body: "Built for floats, trucks, utes, and repeated front-entry movement where ordinary surfaces begin to break down.",
                },
                {
                  icon: Droplets,
                  title: "Drainage-Led",
                  body: "Supports water movement beneath the finish to help reduce rutting, soft zones, and long-term surface instability.",
                },
                {
                  icon: Gem,
                  title: "Architectural Finish",
                  body: "Pairs engineered performance with a cleaner, more resolved entry outcome using premium stone, gravel, cobble, or selected heavy-duty finish specifications.",
                },
              ].map((card, i) => (
                <RevealOnScroll key={card.title} direction="up" stagger={i} staggerInterval={100}>
                  <div className="bg-card p-8 sm:p-10 min-h-[240px] flex flex-col relative group">
                    {/* Subtle top accent line */}
                    <div className="absolute top-0 left-8 right-8 sm:left-10 sm:right-10 h-px bg-accent/8" />
                    <card.icon
                      className="w-[18px] h-[18px] text-muted-foreground/20 mb-7"
                      strokeWidth={1.5}
                    />
                    <h4 className="font-serif text-[15px] font-medium text-foreground/60 tracking-[0.02em] mb-4">
                      {card.title}
                    </h4>
                    <p className="text-[12px] text-muted-foreground/30 leading-[2] max-w-[260px]">
                      {card.body}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5c. GROUNDLOCK — APPLICATIONS + CONFIGURATOR ══ */}
      <section className="relative overflow-hidden">
        <div className="py-14 sm:py-20 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-15" />
          <div className="section-container relative z-[1] max-w-5xl mx-auto">
            <RevealOnScroll direction="up">
              <div className="border-t border-border/8 pt-10 mb-16">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/30 mb-6">Applications</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-8">
                  {["Front Gate Entries", "Float + Truck Access", "Estate Driveways", "High-Traffic Arrival Zones"].map((item) => (
                    <span key={item} className="text-[11px] text-muted-foreground/30 tracking-[0.04em]">{item}</span>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={100}>
              <div className="border-t border-border/8 pt-10 max-w-[400px]">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/25 mb-4">Coming Soon</p>
                <h4 className="font-serif text-[15px] font-medium text-foreground/50 tracking-[0.02em] mb-3">
                  GroundLock Planning Tool
                </h4>
                <p className="text-[12px] text-muted-foreground/30 leading-[2] mb-6 max-w-[340px]">
                  A guided layout and finish tool for premium equine and rural entry systems.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-accent/40 hover:text-accent/70 transition-colors duration-500 font-mono"
                >
                  Register Interest <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-24">
              <RevealOnScroll direction="up">
                <div className="flex items-center justify-center gap-5 mb-10">
                  <div className="w-10 h-px bg-accent/20" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40">How We Work</p>
                  <div className="w-10 h-px bg-accent/20" />
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={100}>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.25rem] font-light text-foreground/80 leading-[1.25] max-w-xl mx-auto">
                  Every resolved project begins on site.
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={200}>
                <p className="mt-8 text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2.2] max-w-lg mx-auto">
                  We assess how the property moves, drains, wears, and functions under real daily use —
                  from access and arrival to drainage behaviour, traffic flow, and long-term site performance.
                  This early stage shapes everything that follows.
                </p>
              </RevealOnScroll>
            </div>

            <ProcessTimeline />

            {/* Build process imagery — cropped tight to hands/tools */}
            <RevealOnScroll direction="up" delay={200}>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-16 img-bridge">
                <div className="relative aspect-[16/10] overflow-hidden group col-span-2 lg:col-span-2">
                  <img
                    src={processWideFinished}
                    alt="Finished timber and stone barn structure"
                    className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.7] saturate-[0.8] group-hover:brightness-[0.8]"
                    loading="lazy"
              decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/10" />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden group">
                  <img
                    src={processTimberDetail}
                    alt="Premium timber joinery detail"
                    className="absolute inset-0 w-full h-full object-cover object-top img-immersive brightness-[0.7] saturate-[0.8] group-hover:brightness-[0.8]"
                    loading="lazy"
              decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/10" />
                </div>
              </div>
            </RevealOnScroll>

            {/* Material strip — tighter, fewer images for restraint */}
            <RevealOnScroll direction="up" delay={300}>
              <div className="grid grid-cols-4 gap-2 mt-12">
                {[
                  { src: interiorTimberWindow, alt: "Timber cladding detail" },
                  { src: processStoneTexture, alt: "Natural stone wall detail" },
                  { src: reclaimedBeamWorkshop, alt: "Reclaimed beam preparation" },
                  { src: equitanaArenaFinish, alt: "Finished arena surface" },
                ].map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden group">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.65] saturate-[0.7] contrast-[1.1]"
                      loading="lazy"
              decoding="async"
                    />
                    <div className="absolute inset-0 bg-background/10 group-hover:bg-transparent transition-colors duration-700" />
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 7. AUTHORITY STRIP — minimal ═══ */}
      <section className="relative overflow-hidden">
        <div className="py-14 sm:py-20 bg-card/50 relative">
          <div className="absolute inset-0 grain-texture opacity-20" />
          <div className="section-container relative z-[1]">
            <div className="flex flex-wrap justify-center gap-x-14 gap-y-6 max-w-3xl mx-auto">
              {[
                { stat: "Victoria-Wide", label: "Projects Across the State" },
                { stat: "Private & Pro", label: "Estates & Facilities" },
              ].map((item, i) => (
                <RevealOnScroll key={item.stat} direction="up" stagger={i} staggerInterval={120}>
                  <div className="text-center">
                    <p className="font-serif text-xl sm:text-2xl text-foreground/70 mb-1.5">{item.stat}</p>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/20 font-mono">{item.label}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. EQUUS FORGE — PRODUCT DIVISION ════════════ */}
      <SectionBleed from="card" to="primary" />
      <section className="relative overflow-hidden">
        <div className={`${SP_SECTION} bg-primary relative`}>
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, hsl(var(--primary-foreground)) 20px, hsl(var(--primary-foreground)) 21px)",
          }} />
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 50% 60% at 50% 40%, hsl(var(--accent) / 0.04) 0%, transparent 70%)" }}
          />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            {/* Hero intro — image + copy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <div className="relative aspect-[4/3] overflow-hidden group img-feather-sides lg:img-overlap-top lg:img-overlap-bottom">
                  <img
                    src={peBanner}
                    alt="Equus Forge — Peninsula Equine product division"
                    className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.75] group-hover:brightness-[0.85]"
                    loading="lazy"
              decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/10 to-transparent" />
                  <div className="absolute inset-0 grain-texture opacity-20" />
                </div>
              </RevealOnScroll>
              <div>
                <RevealOnScroll direction="up" delay={100}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50 mb-6">Product Division</p>
                  <h2 className="heading-section text-primary-foreground mb-4 leading-[1.15]">
                    Equus Forge
                  </h2>
                  <p className="text-primary-foreground/30 text-[12px] sm:text-[13px] leading-[2] mb-6 max-w-[360px]">
                    The product and systems arm of Peninsula Equine.
                  </p>
                  <p className="text-[14px] text-primary-foreground/45 leading-[2] mb-10 max-w-[360px]">
                    Forged hardware, ground systems, and custom rural elements
                    built to complete properties with strength, identity, and craft
                    that outlasts the trends.
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            {/* Product family cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px">
              {[
                {
                  title: "GroundLock Systems",
                  body: "Stabilised entry systems for floats, trucks, and high-traffic rural arrivals.",
                  cta: "Explore GroundLock",
                  href: "/groundlock",
                },
                {
                  title: "Forge Hardware",
                  body: "Architectural steelwork, gate elements, and branded hardware for the working property.",
                  cta: "Explore Forge",
                  href: "/forge",
                },
                {
                  title: "Custom Property Elements",
                  body: "Bespoke entry packages, estate details, and made-to-fit elements for standout builds.",
                  cta: "Enquire Now",
                  href: "/contact",
                },
              ].map((card, i) => (
                <RevealOnScroll key={card.title} direction="up" stagger={i} staggerInterval={100}>
                  <Link
                    to={card.href}
                    className="group relative flex flex-col p-8 sm:p-10 min-h-[260px] bg-primary-foreground/[0.03] hover:bg-primary-foreground/[0.06] transition-all duration-700 border-t border-primary-foreground/[0.06]"
                  >
                    <h4 className="font-serif text-[15px] font-medium text-primary-foreground/70 tracking-[0.02em] mb-4 group-hover:text-primary-foreground transition-colors duration-500">
                      {card.title}
                    </h4>
                    <p className="text-[12px] text-primary-foreground/30 leading-[2] max-w-[260px] flex-1">
                      {card.body}
                    </p>
                    <div className="flex items-center gap-1.5 mt-6 text-primary-foreground/0 group-hover:text-accent/50 transition-all duration-700">
                      <span className="text-[10px] uppercase tracking-[0.15em] font-mono">{card.cta}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            {/* Division tagline */}
            <RevealOnScroll direction="up" delay={300}>
              <div className="mt-14 pt-8 border-t border-primary-foreground/[0.05]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/15 font-mono">
                  The product division of Peninsula Equine
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ TRAINING STRIP — with Glenn image ═════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative py-14 sm:py-20">
          <div className="absolute inset-0">
            <img
              src={glennRiding}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.15] saturate-[0.4] contrast-[1.1]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="absolute inset-0 bg-background/75" />
          <div className="section-container relative z-10 text-center max-w-md mx-auto">
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/20 font-mono mb-2">
              On-site training
            </p>
            <p className="text-[11px] sm:text-[12px] text-muted-foreground/30 leading-[1.85] font-serif italic">
              Training sessions with Glenn Browitt are available on select days. Submit a request and we'll coordinate availability.
            </p>
            <a
              href="mailto:info@peninsulaequine.org?subject=Training%20Session%20Request"
              className="inline-block mt-5 text-[10px] uppercase tracking-[0.2em] text-accent/50 hover:text-accent transition-colors duration-500 font-sans font-medium"
            >
              Request Training Session →
            </a>
          </div>
        </div>
      </section>

      {/* ═══ BUILT IN THE REAL WORLD — showroom band ═══════ */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 lg:py-40 relative">
          <div className="absolute inset-0">
            <img
              src={steelShedDramatic}
              alt="Peninsula Equine property"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.18] saturate-[0.4] contrast-[1.1]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="absolute inset-0 bg-background/70" />
          <div className="absolute inset-0 grain-texture opacity-30" />
          <div className="section-container relative z-10 max-w-3xl mx-auto text-center">
            <RevealOnScroll direction="up">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/35 mb-6">Proof, Not Promises</p>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-foreground/70 tracking-[0.02em] mb-5">
                Built in the Real World
              </h2>
              <p className="text-[13px] text-muted-foreground/35 leading-[2] max-w-[400px] mx-auto mb-8">
                Our systems are tested under floats, trucks, weather, and daily use.
                The Peninsula Equine property is becoming the first live showroom for
                GroundLock and future signature systems.
              </p>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-accent/40 hover:text-accent/70 transition-colors duration-500 font-mono"
              >
                See the PE Showroom Vision <ArrowRight className="w-3 h-3" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ WHY PENINSULA EQUINE — distinction block ═══════ */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture opacity-20" />
          <div className="section-container relative z-[1] max-w-4xl mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mb-8 mx-auto" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="font-serif text-base sm:text-lg font-medium text-foreground/60 tracking-[0.02em] text-center mb-5 max-w-sm mx-auto leading-[1.5]">
                Built by people who understand the property.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={140}>
              <p className="text-[13px] text-muted-foreground/30 leading-[2] text-center max-w-[420px] mx-auto mb-12">
                Peninsula Equine is shaped by firsthand equine knowledge and rural building experience
                — not theoretical design or imported templates.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
                {["Equine-Led Thinking", "Function Before Noise", "Horseman-Built", "Architectural Rural Finish"].map((point) => (
                  <span key={point} className="text-[9px] uppercase tracking-[0.25em] text-accent/25 font-mono">{point}</span>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 9. FINAL CTA — cinematic sunset ═══════════════ */}
      <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        <img
          src={heroSunset}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover scale-[1.1] brightness-[0.35] saturate-[0.6] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        <div className="absolute inset-0 grain-texture" />

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
                From arenas and stables to signature entry systems and forged property details —
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
                  <Link to="/contact">Enquire About Systems</Link>
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
