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
    desc: "Hand-crafted timber and stone structures designed around equine behaviour and airflow.",
    href: "/services",
  },
  {
    Icon: BPGroundSystems,
    num: "03",
    title: "Ground Systems",
    desc: "Interlocking stabilisation systems engineered to eliminate mud and protect hooves.",
    href: "/groundlock",
  },
  {
    Icon: BPInfrastructure,
    num: "04",
    title: "Rural Infrastructure",
    desc: "Laneways, wash bays, float access, fencing — integrated systems designed to work together.",
    href: "/services",
  },
  {
    Icon: BPDesign,
    num: "05",
    title: "Design & Consultancy",
    desc: "Full-site planning informed by terrain, drainage, wind, and use.",
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
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover brightness-[0.8] contrast-[1.05]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/80" />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(var(--primary)) 100%)" }} />

        <div className="relative z-10 section-container text-primary-foreground text-center max-w-3xl mx-auto">
          <div className="space-y-14">
            <div
              className="flex items-center justify-center gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              <div className="w-10 h-px bg-accent" />
              <p className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.3em] uppercase text-accent">
                Engineered Equine Infrastructure
              </p>
              <div className="w-10 h-px bg-accent" />
            </div>

            <h1 className="heading-display text-primary-foreground leading-[1.08] tracking-[0.01em]">
              <StaggerText text="From Dirt" delay={400} />
              <br />
              <span className="block mt-2">
                <StaggerText text="to Dynasty." delay={600} />
              </span>
            </h1>

            <p
              className="text-primary-foreground/25 text-[11px] sm:text-xs tracking-[0.2em] uppercase opacity-0 animate-fade-in"
              style={{ animationDelay: "900ms", animationFillMode: "both" }}
            >
              Designed for the horse. Built for the long term.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
              style={{ animationDelay: "1150ms", animationFillMode: "both" }}
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
            <p
              className="text-primary-foreground/12 text-[10px] tracking-[0.15em] opacity-0 animate-fade-in"
              style={{ animationDelay: "1400ms", animationFillMode: "both" }}
            >
              We take on a limited number of projects each season.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in"
          style={{ animationDelay: "1600ms", animationFillMode: "both" }}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-primary-foreground/20 font-sans">Scroll</span>
          <div className="w-px h-8 bg-accent/20 relative overflow-hidden">
            <div className="absolute top-0 w-full h-3 bg-accent/60 animate-[scrollPulse_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ═══ BUILT BY A HORSEMAN ═══════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.04]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/95" />
        <div className="section-container max-w-2xl mx-auto text-center space-y-10 relative z-[1]">
          <RevealLine className="mx-auto mb-2" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="heading-section text-primary-foreground">
              Built by a Horseman
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={120}>
            <div className="space-y-6 text-sm sm:text-base text-primary-foreground/50 leading-[1.9] max-w-lg mx-auto">
              <p>
                Peninsula Equine is built on firsthand understanding —<br />
                not just of construction, but of how horses<br />
                live, move, and perform.
              </p>
              <p>
                That perspective shapes every decision.<br />
                From drainage to footing to airflow.
              </p>
              <p className="text-primary-foreground/30 italic">
                This isn't guesswork.<br />
                It's experience — applied properly.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ CAPABILITIES ════════════════════════════════ */}
      <section className="py-32 sm:py-48 bg-card border-y border-border relative grain-texture overflow-hidden">
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          <div className="text-center mb-24">
            <RevealLine className="mx-auto mb-5" width="w-10" />
            <RevealOnScroll direction="up">
              <h2 className="heading-section text-foreground mb-4">Capabilities</h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto leading-relaxed">
                What we build is only part of it.<br />
                How it works is everything.
              </p>
            </RevealOnScroll>
          </div>

          <div className="space-y-20 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-24 md:gap-y-24">
            {CAPABILITIES.map((item, i) => (
              <RevealOnScroll key={item.title} direction="up" stagger={i} staggerInterval={100}>
                <Link to={item.href} className="group block">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 mt-1 w-12 h-12 flex items-center justify-center bp-backdrop rounded">
                      <item.Icon
                        size={36}
                        className="text-accent/50 group-hover:text-accent transition-colors duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono tracking-[0.25em] text-accent/30">{item.num}</p>
                      <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-accent transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SELECTED WORK ═══════════════════════════════ */}
      <section className="py-28 sm:py-40 bg-background">
        <div className="section-container max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
            <div>
              <RevealLine className="mb-5" width="w-10" />
              <RevealOnScroll direction="up" delay={80}>
                <h2 className="heading-section text-foreground">Selected Work</h2>
              </RevealOnScroll>
            </div>
            <RevealOnScroll direction="up" delay={200}>
              <Button asChild variant="outline" className="uppercase tracking-[0.1em] text-xs btn-hover-lift">
                <Link to="/gallery">All Projects <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
              </Button>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PORTFOLIO.map((item, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={80}>
                <Link to={`/project/${item.slug}`} className="group relative aspect-[4/3] overflow-hidden block">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium mb-1">{item.type}</p>
                    <p className="text-sm font-serif text-primary-foreground">{item.label}</p>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GROUNDLOCK™ SPOTLIGHT ════════════════════════ */}
      <section className="py-36 sm:py-52 bg-primary text-primary-foreground relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.06]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/85" />

        <div className="section-container relative z-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <RevealOnScroll direction="left">
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
              <RevealOnScroll direction="left" delay={150}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.12em] text-xs font-medium btn-hover-lift">
                    <Link to="/groundlock">Explore GroundLock™ <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </RevealOnScroll>
            </div>
            <RevealOnScroll direction="right" delay={200}>
              <InteractiveLayerStack />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ FROM THE FIELD ═══════════════════════════════ */}
      <section className="py-32 sm:py-48 bg-background relative grain-texture overflow-hidden">
        <div className="section-container max-w-6xl mx-auto relative z-[1]">
          <div className="text-center mb-16">
            <RevealLine className="mx-auto mb-5" width="w-10" />
            <RevealOnScroll direction="up">
              <h2 className="heading-section text-foreground mb-3">From the Field</h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                A look at how we build — materials, systems,<br />and finished work in motion.
              </p>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FIELD_CLIPS.map((clip, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={100}>
                <div className="relative aspect-[9/16] sm:aspect-[3/4] overflow-hidden group">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  >
                    <source src={clip.src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/50 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/60 font-medium italic">
                      {clip.overlay}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EQUUS RIDGE ═══════════════════════════════════ */}
      <section className="py-28 sm:py-40 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--primary))_100%)]" />
        <div className="section-container max-w-lg mx-auto text-center relative z-[1] space-y-8">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl sm:text-3xl text-primary-foreground tracking-[0.02em]">Equus Ridge</h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <p className="text-sm text-primary-foreground/40 leading-[1.9]">
              The future home of Peninsula Equine —<br />
              a space where design, performance,<br />
              and environment come together.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="text-[10px] tracking-[0.2em] text-primary-foreground/15 uppercase italic">
              Coming soon
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ WHO WE WORK WITH ═════════════════════════════ */}
      <section className="py-32 sm:py-48 bg-card border-y border-border relative overflow-hidden">
        <div className="section-container max-w-2xl mx-auto text-center relative z-[1] space-y-10">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="heading-section text-foreground">Who We Work With</h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-[1.9] max-w-lg mx-auto">
              <p>
                We work with private owners, performance riders,<br />
                and properties where function, longevity,<br />
                and correct design matter.
              </p>
              <p className="text-foreground/50 italic">
                Not every project is a fit.<br />
                And that's by design.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ TESTIMONIAL ═════════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
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

      {/* ═══ FINAL CTA ═══════════════════════════════════ */}
      <section className="py-36 sm:py-52 bg-primary text-primary-foreground relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.06]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/90" />

        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-8">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground leading-[1.3]">
              Let's Build Something<br />That Lasts
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift"
            >
              <Link to="/contact">
                Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="text-primary-foreground/20 text-[11px] tracking-wide">
              We take on a limited number of projects each season.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={300}>
            <p className="text-accent/30 text-[10px] italic tracking-wider">
              Built once. Built properly.
            </p>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
