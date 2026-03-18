import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";
import {
  BPArena,
  BPStables,
  BPGroundSystems,
  BPInfrastructure,
  BPDesign,
} from "@/components/icons/BlueprintIcons";

// Video
import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

// Portfolio imagery
import aberdeenStonework from "@/assets/aberdeen-stonework-color.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";

// Video clips for content strip
import slowMo1 from "@/assets/videos/slow-mo-1.mp4";
import slowMo2 from "@/assets/videos/slow-mo-2.mp4";
import slowMo3 from "@/assets/videos/slow-mo-3.mp4";

const PORTFOLIO = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm", type: "Stables", slug: "aberdeen-farm" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge", type: "Interior", slug: "main-ridge" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "QLD Facility", type: "Courtyard", slug: "qld-facility" },
];

const CAPABILITIES = [
  {
    Icon: BPArena,
    num: "01",
    title: "Performance Arenas",
    desc: "Precision-graded surfaces engineered for consistency, drainage, and longevity.",
    href: "/services",
  },
  {
    Icon: BPStables,
    num: "02",
    title: "Stables & Barns",
    desc: "Structures designed around equine behaviour, airflow, and durability.",
    href: "/services",
  },
  {
    Icon: BPGroundSystems,
    num: "03",
    title: "Ground Systems",
    suffix: "GroundLock™",
    desc: "Interlocking stabilisation designed to eliminate mud and improve performance.",
    href: "/groundlock",
  },
  {
    Icon: BPInfrastructure,
    num: "04",
    title: "Rural Infrastructure",
    desc: "Integrated systems across the property — laneways, drainage, and access.",
    href: "/services",
  },
  {
    Icon: BPDesign,
    num: "05",
    title: "Design & Consultancy",
    desc: "Site planning informed by terrain, water flow, and long-term use.",
    href: "/contact",
  },
];

const FIELD_CLIPS = [
  { src: slowMo1, overlay: "Built properly." },
  { src: slowMo2, overlay: "From the ground up." },
  { src: slowMo3, overlay: "Designed to last." },
];

/* ── Hero word stagger ────────────────────────────── */
function StaggerText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span
            className="inline-block animate-fade-in-up"
            style={{ animationDelay: `${delay + i * 90}ms`, animationFillMode: "both" }}
          >
            {word}{i < text.split(" ").length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function Index() {
  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-[100vh] overflow-hidden flex items-center justify-center">
        {/* Video background — deep, cinematic */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.15] saturate-[0.85]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Dark overlay for depth */}
        <div className="absolute inset-0 bg-primary/70" />
        {/* Vignette — heavier edges */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(var(--primary) / 0.6) 70%, hsl(var(--primary)) 100%)" }} />
        {/* Subtle grain layer */}
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.04]" />

        <div className="relative z-10 section-container text-primary-foreground text-center max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-16 sm:gap-20">
            {/* Top line */}
            <div
              className="flex items-center justify-center gap-5 opacity-0 animate-fade-in"
              style={{ animationDelay: "300ms", animationFillMode: "both" }}
            >
              <div className="w-12 h-px bg-accent/50" />
              <p className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.35em] uppercase text-accent/80">
                Engineered Equine Infrastructure
              </p>
              <div className="w-12 h-px bg-accent/50" />
            </div>

            {/* Main heading — large, tight, cinematic */}
            <h1
              className="font-serif font-bold text-primary-foreground leading-[0.95] tracking-[-0.01em] text-6xl sm:text-7xl md:text-8xl lg:text-9xl opacity-0 animate-fade-in"
              style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <span className="block">FROM DIRT</span>
              <span className="block mt-4 sm:mt-6">TO DYNASTY</span>
            </h1>

            {/* Supporting line */}
            <p
              className="text-primary-foreground/30 text-[11px] sm:text-xs tracking-[0.22em] uppercase opacity-0 animate-fade-in"
              style={{ animationDelay: "1100ms", animationFillMode: "both", animationDuration: "700ms" }}
            >
              Designed for the horse. Built for the long term.
            </p>

            {/* Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
              style={{ animationDelay: "1500ms", animationFillMode: "both", animationDuration: "700ms" }}
            >
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift px-8 py-3"
              >
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 uppercase tracking-[0.14em] text-xs font-medium px-8 py-3"
              >
                <Link to="/gallery">Selected Work</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in"
          style={{ animationDelay: "1900ms", animationFillMode: "both" }}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-primary-foreground/20 font-sans">Scroll</span>
          <div className="w-px h-8 bg-accent/20 relative overflow-hidden">
            <div className="absolute top-0 w-full h-3 bg-accent/60 animate-[scrollPulse_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ═══ BUILT BY A HORSEMAN ═══════════════════════ */}
      <section className="py-44 sm:py-64 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Ultra-subtle blueprint video texture */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.03]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/96" />
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.03]" />

        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/40 mx-auto mb-12" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground tracking-[0.01em] leading-[1.2] mb-14">
              Built by a Horseman
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <div className="space-y-8 text-sm sm:text-[15px] text-primary-foreground/45 leading-[2] font-sans">
              <p>
                Peninsula Equine is built on firsthand understanding —<br />
                not just of construction, but of how horses<br />
                live, move, and perform.
              </p>
              <p>
                That perspective shapes every decision.<br />
                From drainage to footing to airflow.
              </p>
              <p className="text-primary-foreground/25 italic">
                This isn't guesswork.<br />
                It's experience — applied properly.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ CAPABILITIES ════════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.03]" />
        <div className="section-container max-w-4xl mx-auto relative z-[1]">
          {/* Header */}
          <div className="text-center mb-28 sm:mb-36">
            <RevealOnScroll direction="up">
              <div className="w-8 h-px bg-accent/40 mx-auto mb-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-[0.01em] leading-[1.2] mb-8">
                Capabilities
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={160}>
              <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto leading-[1.9]">
                What we build is only part of it.<br />
                How it works is everything.
              </p>
            </RevealOnScroll>
          </div>

          {/* Pillar grid */}
          <div className="space-y-20 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 md:gap-x-20 md:gap-y-24">
            {CAPABILITIES.map((item, i) => (
              <RevealOnScroll key={item.title} direction="up" stagger={i} staggerInterval={120}>
                <Link to={item.href} className="group block">
                  <div className="flex items-start gap-5">
                    {/* Blueprint icon */}
                    <div className="flex-shrink-0 mt-1 w-10 h-10 flex items-center justify-center rounded border border-border/50 bg-background/50">
                      <item.Icon
                        size={28}
                        className="text-accent/40 group-hover:text-accent/70 transition-colors duration-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-mono tracking-[0.3em] text-accent/25 uppercase">{item.num}</p>
                      <h3 className="font-serif text-base sm:text-lg font-medium text-foreground group-hover:text-accent transition-colors duration-500 tracking-[0.01em]">
                        {item.title}
                        {(item as any).suffix && (
                          <span className="text-accent/40 text-sm ml-2 font-sans font-normal">({(item as any).suffix})</span>
                        )}
                      </h3>
                      <p className="text-[13px] text-muted-foreground/60 leading-[1.8] max-w-sm">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SELECTED WORK ═══════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          {/* Header */}
          <div className="text-center mb-20 sm:mb-28">
            <RevealOnScroll direction="up">
              <div className="w-8 h-px bg-accent/40 mx-auto mb-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-[0.01em] leading-[1.2] mb-6">
                Selected Work
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={160}>
              <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto leading-[1.8]">
                A selection of builds that represent how we work.
              </p>
            </RevealOnScroll>
          </div>

          {/* Project grid — larger images, generous gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {PORTFOLIO.map((item, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={120}>
                <Link to={`/project/${item.slug}`} className="group relative aspect-[3/2] overflow-hidden block">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/65 transition-all duration-600" />
                  {/* Info reveal */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-accent/80 font-medium mb-1.5">{item.type}</p>
                    <p className="text-sm font-serif text-primary-foreground/90">{item.label}</p>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>

          {/* View all link */}
          <RevealOnScroll direction="up" delay={400}>
            <div className="text-center mt-16">
              <Button asChild variant="outline" className="uppercase tracking-[0.14em] text-xs btn-hover-lift border-border/50">
                <Link to="/gallery">All Projects <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ FROM THE FIELD ═══════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-6xl mx-auto relative z-[1]">
          <div className="text-center mb-20 sm:mb-28">
            <RevealOnScroll direction="up">
              <div className="w-8 h-px bg-accent/40 mx-auto mb-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-[0.01em] leading-[1.2] mb-6">
                From the Field
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={160}>
              <p className="text-sm text-muted-foreground/60 max-w-md mx-auto leading-[1.8]">
                A look at how we build — materials, systems, and finished work in motion.
              </p>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {FIELD_CLIPS.map((clip, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={120}>
                <div className="group relative aspect-[4/5] overflow-hidden">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  >
                    <source src={clip.src} type="video/mp4" />
                  </video>
                  {/* Subtle bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/40 to-transparent pointer-events-none" />
                  {/* Minimal overlay text */}
                  <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40 font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {clip.overlay}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GROUNDLOCK™ SPOTLIGHT ════════════════════════ */}
      <section className="py-44 sm:py-64 bg-primary text-primary-foreground relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.06]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/85" />

        <div className="section-container relative z-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <RevealOnScroll direction="up">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-medium">Proprietary System</span>
                </div>
                <h2 className="heading-section text-primary-foreground mb-2">
                  P.E. GroundLock™
                </h2>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/30 mb-5">
                  Ground Stabilisation Systems
                </p>
                <p className="text-primary-foreground/45 text-sm leading-[1.9] mb-4">
                  A system designed to solve ground failure at its source.
                </p>
                <p className="text-primary-foreground/55 text-sm leading-[1.8]">
                  Engineered layers that interlock, drain,<br />
                  and hold — permanently.
                </p>
                <p className="text-accent/70 text-sm mt-6 font-medium italic">
                  Most properties fail from the ground up.<br />
                  We start where it matters.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={150}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.12em] text-xs font-medium btn-hover-lift">
                    <Link to="/groundlock">Explore GroundLock™ <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </RevealOnScroll>
            </div>
            <RevealOnScroll direction="up" delay={200}>
              <InteractiveLayerStack />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ EQUUS RIDGE ═══════════════════════════════════ */}
      <section className="py-44 sm:py-60 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--primary))_100%)]" />
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.03]" />
        <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/40 mx-auto mb-12" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground tracking-[0.01em] leading-[1.2] mb-10">
              Equus Ridge
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="text-sm text-primary-foreground/35 leading-[2]">
              The future home of Peninsula Equine —<br />
              a space where design, performance,<br />
              and environment come together.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={300}>
            <p className="text-[10px] tracking-[0.2em] text-primary-foreground/15 uppercase italic mt-10">
              Coming soon
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ TESTIMONIAL ═════════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="section-container max-w-2xl mx-auto text-center relative z-10">
          <RevealLine className="mx-auto mb-10" width="w-10" />
          <RevealOnScroll direction="scale" duration={900}>
            <blockquote className="font-serif text-xl sm:text-2xl text-foreground italic leading-[1.6]">
              "His knowledge of horses<br />
              convinced us immediately —<br />
              this isn't just construction to him,<br />
              it's his passion."
            </blockquote>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="mt-8 text-sm text-muted-foreground tracking-wide">
              Tom & Linda Hartley — Private Estate, Flinders
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ WHO WE WORK WITH ═════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.03]" />
        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/40 mx-auto mb-12" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground tracking-[0.01em] leading-[1.2] mb-14">
              Who We Work With
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <div className="space-y-8 text-sm sm:text-[15px] text-primary-foreground/45 leading-[2] font-sans">
              <p>
                We work with private owners, performance riders, and properties where<br />
                function, longevity, and correct design matter.
              </p>
              <p className="text-primary-foreground/25 italic">
                Not every project is a fit.<br />
                And that's by design.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ EQUUS RIDGE TEASER ═══════════════════════════ */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/30 mx-auto mb-14" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground/90 leading-[1.2] mb-8">
              Equus Ridge
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="text-sm sm:text-[15px] text-muted-foreground/50 leading-[2] max-w-md mx-auto mb-4">
              The future home of Peninsula Equine —<br />
              a space where design, performance,<br />
              and environment come together.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={300}>
            <p className="text-xs text-muted-foreground/30 italic">
              Currently in development.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-44 sm:py-64 bg-primary text-primary-foreground relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.04]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/92" />
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.03]" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(var(--primary)) 100%)" }} />

        <div className="section-container relative z-10 text-center max-w-lg mx-auto">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/40 mx-auto mb-12" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={80}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground tracking-[0.01em] leading-[1.2] mb-10">
              Let's Build Something<br />That Lasts
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift px-10 py-3.5"
              >
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 uppercase tracking-[0.14em] text-xs font-medium px-10 py-3.5"
              >
                <Link to="/groundlock">Estimate a Project</Link>
              </Button>
            </div>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={350}>
            <p className="text-primary-foreground/20 text-[11px] tracking-[0.15em]">
              We take on a limited number of projects each season.
            </p>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
