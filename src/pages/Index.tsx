import { useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { AnimatedBlueprintHero } from "@/components/AnimatedBlueprintHero";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Compass, Ruler, Mountain } from "lucide-react";

// Portfolio imagery
import aberdeenStonework from "@/assets/aberdeen-stonework-color.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import equitanaArena from "@/assets/equitana-arena-1.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";

const PORTFOLIO = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm", type: "Stables" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge", type: "Interior" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "QLD Facility", type: "Courtyard" },
  { src: mainRidgeCiroWoodwork, alt: "Ciro hand-crafting timber joinery", label: "Main Ridge", type: "Woodwork" },
  { src: equitanaArena, alt: "Competition arena at Equitana", label: "Equitana", type: "Arena" },
  { src: aberdeenBarnInterior, alt: "Barn interior at Aberdeen Farm", label: "Aberdeen Farm", type: "Barn" },
];

const POSITIONING = [
  { icon: Compass, label: "Arenas", desc: "Competition-grade surfaces" },
  { icon: Layers, label: "Stables", desc: "Engineered equine housing" },
  { icon: Ruler, label: "Ground Systems", desc: "P.E. GroundLock™ stabilisation" },
  { icon: Mountain, label: "Rural Infrastructure", desc: "Built for the landscape" },
];

const SERVICES = [
  { title: "Arena Construction", desc: "Precision-graded surfaces with engineered drainage and footing systems for competition and training.", href: "/services" },
  { title: "Stables & Barns", desc: "Hand-crafted timber and stonework stables designed around equine behaviour and natural ventilation.", href: "/services" },
  { title: "P.E. GroundLock™", desc: "Our proprietary interlocking ground stabilisation system for yards, laneways, and high-traffic zones.", href: "/groundlock" },
  { title: "Rural Infrastructure", desc: "Fencing, laneways, wash bays, float parking, and property-wide infrastructure builds.", href: "/services" },
  { title: "Design & Planning", desc: "Full site assessment, architectural planning, and engineering consultation for equine properties.", href: "/contact" },
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
      <section className="relative min-h-[96vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-primary" />
        <AnimatedBlueprintHero />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/70" />

        <div className="relative z-10 section-container text-primary-foreground">
          <div className="max-w-2xl space-y-8">
            <div
              className="flex items-center gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              <div className="w-10 h-px bg-accent" />
              <p className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.3em] uppercase text-accent">
                Peninsula Equine
              </p>
            </div>

            <h1 className="heading-display text-primary-foreground leading-[1.02]">
              <StaggerText text="From Dirt" delay={400} />
              <br />
              <StaggerText text="to Dynasty." delay={600} />
            </h1>

            <p
              className="text-base sm:text-lg text-primary-foreground/55 max-w-md leading-relaxed opacity-0 animate-fade-in"
              style={{ animationDelay: "950ms", animationFillMode: "both" }}
            >
              Engineered equine infrastructure — arenas, stables, and ground systems built by a horseman.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-in"
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

      {/* ═══ POSITIONING STRIP ═══════════════════════════ */}
      <section className="py-0 border-y border-border bg-card">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {POSITIONING.map((item, i) => (
              <RevealOnScroll key={item.label} direction="up" stagger={i} staggerInterval={100}>
                <div className={`py-8 sm:py-10 px-4 sm:px-6 text-center ${i < 3 ? "border-r border-border" : ""}`}>
                  <item.icon className="w-5 h-5 text-accent mx-auto mb-3" strokeWidth={1.5} />
                  <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-foreground mb-1">
                    {item.label}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PROJECTS ═══════════════════════════ */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="section-container max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <RevealLine className="mb-5" width="w-10" />
              <RevealOnScroll direction="up" delay={80}>
                <h2 className="heading-section text-foreground">Selected Work</h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={160}>
                <p className="text-muted-foreground text-sm mt-2 max-w-md">
                  Every project came from a recommendation.
                </p>
              </RevealOnScroll>
            </div>
            <RevealOnScroll direction="up" delay={200}>
              <Button asChild variant="outline" className="uppercase tracking-[0.1em] text-xs">
                <Link to="/gallery">All Projects <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
              </Button>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PORTFOLIO.map((item, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={100}>
                <Link to="/gallery" className="group relative aspect-[4/3] overflow-hidden block">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

      {/* ═══ GROUNDLOCK SPOTLIGHT ════════════════════════ */}
      <section className="py-20 sm:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="elevation" className="absolute inset-0" />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="section-container relative z-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <RevealOnScroll direction="left">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-medium">Proprietary System</span>
                </div>
                <h2 className="heading-section text-primary-foreground mb-4">
                  P.E. GroundLock™
                </h2>
                <p className="text-primary-foreground/60 text-sm leading-relaxed">
                  Our engineered interlocking ground stabilisation system eliminates mud, protects hooves, and creates permanent hard-standing for yards, laneways, wash bays, and float parking.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="left" delay={150}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.12em] text-xs font-medium">
                    <Link to="/groundlock">Explore GroundLock™ <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 uppercase tracking-[0.12em] text-xs">
                    <Link to="/groundlock">Try the Estimator</Link>
                  </Button>
                </div>
              </RevealOnScroll>
            </div>
            <RevealOnScroll direction="right" delay={200}>
              <div className="space-y-3">
                {[
                  { label: "Panel + Infill", depth: "75–100mm", spec: "Angular aggregate fill" },
                  { label: "Bedding Layer", depth: "25–50mm", spec: "Fine aggregate" },
                  { label: "Sub-Base", depth: "100–150mm", spec: "Crushed rock" },
                  { label: "Geotextile", depth: "~1mm", spec: "Separation layer" },
                  { label: "Subgrade", depth: "Native", spec: "Compacted soil" },
                ].map((layer, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border border-primary-foreground/10 bg-primary-foreground/[0.03]">
                    <span className="text-[10px] font-mono text-primary-foreground/40 w-20 tabular-nums">{layer.depth}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-primary-foreground uppercase tracking-wider">{layer.label}</p>
                      <p className="text-[10px] text-primary-foreground/40">{layer.spec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES GRID ═══════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="section-container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <RevealLine className="mx-auto mb-5" width="w-10" />
            <RevealOnScroll direction="up">
              <h2 className="heading-section text-foreground mb-3">Capabilities</h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={100}>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Full-scope equine infrastructure — from architectural planning through to final handover.
              </p>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {SERVICES.map((service, i) => (
              <RevealOnScroll key={service.title} direction="up" stagger={i} staggerInterval={80}>
                <Link
                  to={service.href}
                  className="group bg-background p-8 flex flex-col h-full hover:bg-card transition-colors duration-300"
                >
                  <span className="text-[10px] font-mono text-accent/60 mb-3">0{i + 1}</span>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{service.desc}</p>
                  <ArrowRight className="w-4 h-4 text-accent/0 group-hover:text-accent mt-4 transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ PHILOSOPHY ═══════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="section-container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <RevealLine className="mx-auto mb-5" width="w-10" />
            <RevealOnScroll direction="up">
              <h2 className="heading-section text-foreground">How We Build</h2>
            </RevealOnScroll>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-16 gap-y-12">
            {[
              { n: "01", title: "Design for the Horse", desc: "Every decision begins with the animal. Sight lines, ventilation, footing — engineered for how horses actually live." },
              { n: "02", title: "Build for Generations", desc: "Hand-set stonework, kiln-dried hardwood, marine-grade hardware. Our facilities outlast the trends." },
              { n: "03", title: "Respect the Land", desc: "We read the property before we draw a line. Drainage, winds, soil — the land tells you where to build." },
              { n: "04", title: "Craft Over Convenience", desc: "Mortise-and-tenon where bolts would do. Stone foundations where concrete would suffice." },
            ].map((p, i) => (
              <RevealOnScroll key={p.n} direction="up" stagger={i} staggerInterval={140}>
                <div className="group">
                  <p className="text-[10px] font-mono tracking-[0.25em] text-accent/40 mb-2 group-hover:text-accent/70 transition-colors">{p.n}</p>
                  <h3 className="font-serif text-lg font-medium mb-2 text-foreground group-hover:text-accent transition-colors">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIAL ═════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-[15%] w-px h-full bg-border/40" />
          <div className="absolute top-0 right-[15%] w-px h-full bg-border/40" />
        </div>
        <div className="section-container max-w-2xl mx-auto text-center relative z-10">
          <RevealLine className="mx-auto mb-8" width="w-10" />
          <RevealOnScroll direction="scale" duration={900}>
            <blockquote className="font-serif text-xl sm:text-2xl text-foreground italic leading-relaxed">
              "We interviewed six contractors before choosing Ciro. His knowledge of horses
              convinced us immediately — this isn't just construction to him, it's his passion."
            </blockquote>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="mt-6 text-sm text-muted-foreground tracking-wide">
              Tom & Linda Hartley — Private Estate, Flinders
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════ */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="absolute inset-10 border border-accent/[0.05] pointer-events-none" aria-hidden="true" />

        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-6">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground">
              Let's build something<br />that lasts.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <p className="text-primary-foreground/40 text-sm">
              Free on-site consultation. No obligation.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift"
              >
                <Link to="/contact">
                  Book Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
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
