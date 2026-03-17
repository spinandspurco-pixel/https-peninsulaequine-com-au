import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
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
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import equitanaArena from "@/assets/equitana-arena-1.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";

const PORTFOLIO = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm", type: "Stables", slug: "aberdeen-farm" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge", type: "Interior", slug: "main-ridge" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "QLD Facility", type: "Courtyard", slug: "qld-facility" },
  { src: mainRidgeCiroWoodwork, alt: "Ciro hand-crafting timber joinery", label: "Main Ridge", type: "Woodwork", slug: "main-ridge" },
  { src: equitanaArena, alt: "Competition arena at Equitana", label: "Equitana", type: "Arena", slug: "equitana" },
  { src: aberdeenBarnInterior, alt: "Barn interior at Aberdeen Farm", label: "Aberdeen Farm", type: "Barn", slug: "aberdeen-farm" },
];

const CAPABILITIES = [
  {
    Icon: BPArena,
    num: "01",
    title: "Performance Arenas",
    desc: "Precision-graded surfaces engineered for consistency, drainage, and longevity under real conditions — not theory.",
    sub: "Built to ride the same in winter as it does in summer.",
    href: "/services",
  },
  {
    Icon: BPStables,
    num: "02",
    title: "Stables & Barns",
    desc: "Hand-crafted timber and stone structures designed around equine behaviour, airflow, and durability.",
    sub: "Form follows function. Always.",
    href: "/services",
  },
  {
    Icon: BPGroundSystems,
    num: "03",
    title: "Ground Systems",
    desc: "Interlocking stabilisation systems engineered to eliminate mud, protect hooves, and create permanent hard-standing.",
    sub: "Where most properties fail — this is where we start.",
    href: "/groundlock",
  },
  {
    Icon: BPInfrastructure,
    num: "04",
    title: "Rural Infrastructure",
    desc: "Laneways, wash bays, float access, fencing — integrated systems designed to work together, not as afterthoughts.",
    sub: "",
    href: "/services",
  },
  {
    Icon: BPDesign,
    num: "05",
    title: "Design & Consultancy",
    desc: "Full-site planning informed by terrain, drainage, wind, and use.",
    sub: "Because the land decides what works — we just read it properly.",
    href: "/contact",
  },
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
      <section className="relative min-h-[96vh] overflow-hidden flex items-center justify-center">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/75" />

        <div className="relative z-10 section-container text-primary-foreground text-center max-w-3xl mx-auto">
          <div className="space-y-10">
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

            <h1 className="heading-display text-primary-foreground leading-[1.02]">
              <StaggerText text="From Dirt" delay={400} />
              <br />
              <StaggerText text="to Dynasty." delay={600} />
            </h1>

            <p
              className="text-base sm:text-lg text-primary-foreground/40 max-w-md mx-auto leading-relaxed opacity-0 animate-fade-in"
              style={{ animationDelay: "950ms", animationFillMode: "both" }}
            >
              Built by a horseman.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
              style={{ animationDelay: "1150ms", animationFillMode: "both" }}
            >
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift"
              >
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 uppercase tracking-[0.14em] text-xs font-medium"
              >
                <Link to="/gallery">Selected Work</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in"
          style={{ animationDelay: "1600ms", animationFillMode: "both" }}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-primary-foreground/25 font-sans">Scroll</span>
          <div className="w-px h-8 bg-accent/25 relative overflow-hidden">
            <div className="absolute top-0 w-full h-3 bg-accent animate-[scrollPulse_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ═══ INTRO ═══════════════════════════════════════ */}
      <section className="py-28 sm:py-40 bg-background relative grain-texture overflow-hidden">
        <div className="section-container max-w-2xl mx-auto text-center space-y-10 relative z-[1]">
          <RevealLine className="mx-auto mb-2" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="heading-section text-foreground">
              Built on Understanding —<br />Not Assumption
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={120}>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-[1.8] max-w-lg mx-auto">
              <p>
                We don't build for appearances.<br />
                We build for how horses move, live, and perform.
              </p>
              <p>
                Every arena, every structure, every surface<br />
                begins with the same question —<br />
                <em className="text-foreground/80">what does the horse need<br />for this to work properly?</em>
              </p>
              <p>
                The result is infrastructure<br />
                that doesn't just look right.<br />
                It rides right. It lasts.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ CAPABILITIES ════════════════════════════════ */}
      <section className="py-28 sm:py-40 bg-card border-y border-border relative grain-texture overflow-hidden">
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          <div className="text-center mb-20">
            <RevealLine className="mx-auto mb-5" width="w-10" />
            <RevealOnScroll direction="up">
              <h2 className="heading-section text-foreground mb-3">Capabilities</h2>
            </RevealOnScroll>
          </div>

          <div className="space-y-16 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-20 md:gap-y-20">
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
                      {item.sub && (
                        <p className="text-sm text-muted-foreground/60 italic leading-relaxed">{item.sub}</p>
                      )}
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
              <RevealOnScroll direction="up" delay={160}>
                <p className="text-muted-foreground text-sm mt-3 max-w-md leading-relaxed">
                  A curated selection of builds —<br />not everything, just what matters.
                </p>
              </RevealOnScroll>
            </div>
            <RevealOnScroll direction="up" delay={200}>
              <Button asChild variant="outline" className="uppercase tracking-[0.1em] text-xs btn-hover-lift">
                <Link to="/gallery">All Projects <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
              </Button>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
      <section className="py-28 sm:py-40 bg-primary text-primary-foreground relative overflow-hidden">
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
                <h2 className="heading-section text-primary-foreground mb-5">
                  P.E. GroundLock™
                </h2>
                <p className="text-primary-foreground/55 text-sm leading-[1.8]">
                  A layered system engineered to solve<br />
                  ground failure — permanently.
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
                  <Button asChild variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 uppercase tracking-[0.12em] text-xs">
                    <Link to="/groundlock">Try the Estimator</Link>
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

      {/* ═══ WHO WE WORK WITH ═════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-background relative grain-texture overflow-hidden">
        <div className="section-container max-w-2xl mx-auto text-center relative z-[1] space-y-8">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="heading-section text-foreground">Who We Work With</h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <div className="space-y-5 text-sm text-muted-foreground leading-[1.8] max-w-lg mx-auto">
              <p>
                We work with private owners, performance riders,<br />
                and properties where function, longevity,<br />
                and correct design matter.
              </p>
              <p className="text-foreground/60 italic">
                Not every project is a fit.<br />
                And that's intentional.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ PHILOSOPHY ═══════════════════════════════════ */}
      <section className="py-28 sm:py-40 bg-background relative grain-texture overflow-hidden">
        <div className="section-container max-w-4xl mx-auto relative z-[1]">
          <div className="text-center mb-20">
            <RevealLine className="mx-auto mb-5" width="w-10" />
            <RevealOnScroll direction="up">
              <h2 className="heading-section text-foreground">How We Build</h2>
            </RevealOnScroll>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-20 gap-y-16">
            {[
              { n: "01", title: "Design for the Horse", desc: "Every decision begins with the animal —\nsight lines, footing, airflow, movement." },
              { n: "02", title: "Build for Generations", desc: "Materials and methods chosen\nfor longevity, not convenience." },
              { n: "03", title: "Respect the Land", desc: "Drainage, slope, soil —\nthe land dictates the outcome." },
              { n: "04", title: "Craft Over Convenience", desc: "Where others cut corners,\nwe build it properly." },
            ].map((p, i) => (
              <RevealOnScroll key={p.n} direction="up" stagger={i} staggerInterval={140}>
                <div className="group">
                  <p className="text-[10px] font-mono tracking-[0.25em] text-accent/30 mb-3 group-hover:text-accent/60 transition-colors duration-300">{p.n}</p>
                  <h3 className="font-serif text-lg font-medium mb-3 text-foreground group-hover:text-accent transition-colors duration-300">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-[1.8] whitespace-pre-line">{p.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIAL ═════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-[15%] w-px h-full bg-border/40" />
          <div className="absolute top-0 right-[15%] w-px h-full bg-border/40" />
        </div>
        <div className="section-container max-w-2xl mx-auto text-center relative z-10">
          <RevealLine className="mx-auto mb-10" width="w-10" />
          <RevealOnScroll direction="scale" duration={900}>
            <blockquote className="font-serif text-xl sm:text-2xl text-foreground italic leading-[1.6]">
              "We interviewed six contractors<br />
              before choosing Ciro.<br />
              His knowledge of horses<br />
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
      <section className="py-28 sm:py-36 bg-primary text-primary-foreground relative overflow-hidden">
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
            <p className="text-primary-foreground/35 text-sm">
              Site-specific. Horse-first. Built properly.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift"
              >
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 uppercase tracking-[0.12em] text-xs"
              >
                <Link to="/groundlock">Estimate a Project</Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
