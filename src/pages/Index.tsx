import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";

// Video
import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

// Portfolio imagery
import aberdeenStonework from "@/assets/aberdeen-stonework-color.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";

const PORTFOLIO = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm", type: "Stables & Stonework", slug: "aberdeen-farm" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge", type: "Arena & Barn", slug: "main-ridge" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "QLD Facility", type: "Full Facility", slug: "qld-facility" },
];

const CAPABILITIES = [
  { num: "01", title: "Performance Arenas", desc: "Engineered surfaces. Consistent footing. Zero drainage failure.", href: "/services" },
  { num: "02", title: "Stables & Barns", desc: "Designed around equine behaviour, airflow, and longevity.", href: "/services" },
  { num: "03", title: "Ground Systems", suffix: "GroundLock™", desc: "Interlocking stabilisation that eliminates mud — permanently.", href: "/groundlock" },
  { num: "04", title: "Drainage & Civil", desc: "Water management engineered from the sub-base up.", href: "/services" },
  { num: "05", title: "Design & Site Planning", desc: "Property layout informed by terrain, water flow, and use.", href: "/contact" },
];

const PHILOSOPHY = [
  {
    num: "01",
    title: "Below the Surface",
    body: "What you see above ground is only as good as what lies beneath. We engineer drainage, compaction, and sub-base profiles before a single post is set.",
  },
  {
    num: "02",
    title: "Water Destroys More Than Time",
    body: "Every build is designed around water — where it enters, how it moves, where it exits. Drainage is not optional.",
  },
  {
    num: "03",
    title: "Designed for the Horse",
    body: "Airflow, footing, sightlines, stress reduction — engineered for how horses actually live and perform.",
  },
  {
    num: "04",
    title: "Built Once. Built Properly.",
    body: "Every material, every joint, every layer is specified for durability — not convenience.",
  },
];

/* ── Section divider ─────────────────── */
function SectionDivider() {
  return (
    <div className="relative h-px w-full" aria-hidden="true">
      <div className="divider-grid" />
    </div>
  );
}

export default function Index() {
  return (
    <Layout>
      {/* ═══ 1. HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.35] contrast-[1.15] saturate-[0.6]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/65" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 65% 50% at 50% 48%, transparent 15%, hsl(222 20% 4% / 0.75) 65%, hsl(222 20% 4%) 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none grain-texture" />

        <div className="relative z-10 section-container text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-10 sm:gap-14">
            <div
              className="flex items-center justify-center gap-5 opacity-0 animate-fade-in"
              style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1200ms" }}
            >
              <div className="w-10 h-px bg-accent/30" />
              <p className="text-overline text-accent/60">
                Engineered Equine Infrastructure
              </p>
              <div className="w-10 h-px bg-accent/30" />
            </div>

            <h1
              className="font-serif font-bold text-foreground leading-[0.9] tracking-[0.015em] opacity-0 animate-fade-in"
              style={{
                animationDelay: "1000ms",
                animationFillMode: "both",
                animationDuration: "1400ms",
                fontSize: "clamp(3rem, 1.5rem + 6vw, 8rem)",
              }}
            >
              <span className="block">Built Properly.</span>
              <span className="block mt-2 sm:mt-4 text-foreground/70">From the Ground Up.</span>
            </h1>

            <p
              className="text-muted-foreground/40 text-[11px] sm:text-xs tracking-[0.3em] uppercase max-w-sm opacity-0 animate-fade-in"
              style={{ animationDelay: "1800ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              Designed for the horse. Built for generations.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
              style={{ animationDelay: "2200ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link to="/gallery">Selected Works</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll cue — minimal line only */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in"
          style={{ animationDelay: "3000ms", animationFillMode: "both", animationDuration: "1200ms" }}
        >
          <div className="w-px h-12 bg-accent/12 relative overflow-hidden">
            <div
              className="absolute top-0 w-full h-3 bg-accent/30"
              style={{ animation: "scrollPulse 3s ease-in-out infinite" }}
            />
          </div>
        </div>
      </section>

      {/* ═══ 2. POSITIONING ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-36 sm:py-48 lg:py-60 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-16" width="w-10" />
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={100}>
              <p className="text-overline mb-8">Built by a Horseman</p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={200}>
              <h2 className="heading-section text-foreground mb-14">
                Understanding First.<br />
                Then Construction.
              </h2>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={300}>
              <div className="space-y-6 text-sm sm:text-[15px] text-muted-foreground/55 leading-[2] font-sans">
                <p>
                  Peninsula Equine is built on firsthand understanding
                  of how horses live, move, and perform.
                </p>
                <p>
                  That shapes every decision — from drainage
                  to footing to airflow.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 3. CAPABILITIES ════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-36 sm:py-48 lg:py-60 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <div className="text-center mb-24 sm:mb-32">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">What We Build</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Capabilities
                </h2>
              </RevealOnScroll>
            </div>

            <div className="space-y-0">
              {CAPABILITIES.map((item, i) => (
                <RevealOnScroll key={item.title} direction="up" stagger={i} staggerInterval={80}>
                  <Link to={item.href} className="group block">
                    <div className="flex items-start gap-6 py-10 border-b border-border/20 last:border-b-0">
                      <p className="text-[9px] font-mono tracking-[0.3em] text-accent/20 uppercase pt-1.5 w-8 shrink-0">{item.num}</p>
                      <div className="flex-1 space-y-2.5">
                        <h3 className="font-serif text-base sm:text-lg font-medium text-foreground group-hover:text-accent transition-colors duration-700 tracking-[0.02em]">
                          {item.title}
                          {item.suffix && (
                            <span className="text-accent/25 text-sm ml-2 font-sans font-normal">({item.suffix})</span>
                          )}
                        </h3>
                        <p className="text-[13px] text-muted-foreground/45 leading-[1.8] max-w-md">{item.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/15 group-hover:text-accent/50 transition-all duration-700 mt-2 shrink-0 group-hover:translate-x-1" />
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. GROUNDLOCK™ TEASER ══════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-36 sm:py-48 lg:py-60 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-24 items-center">
              <div>
                <RevealOnScroll direction="up">
                  <div className="flex items-center gap-3 mb-6">
                    <Layers className="w-4 h-4 text-accent/50" strokeWidth={1.25} />
                    <span className="text-overline text-accent/50">Proprietary System</span>
                  </div>
                  <h2 className="heading-section text-foreground mb-4">
                    P.E. GroundLock™
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/25 mb-10">
                    Engineered Ground Stabilisation
                  </p>
                  <p className="text-sm text-muted-foreground/50 leading-[1.9] mb-4 max-w-sm">
                    Most equine properties fail from the ground up.
                    GroundLock solves that — at the source.
                  </p>
                  <p className="text-[12px] text-muted-foreground/25 italic">
                    This is where the real intelligence lives.
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={200}>
                  <div className="mt-10">
                    <Button asChild variant="outline-light" size="default">
                      <Link to="/groundlock">
                        Explore the System <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </RevealOnScroll>
              </div>
              <RevealOnScroll direction="up" delay={150}>
                <InteractiveLayerStack />
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. ENGINEERING PHILOSOPHY ═════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-36 sm:py-52 lg:py-64 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-28 sm:mb-36">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-14" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">How We Think</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Performance Starts<br />Below the Surface
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-x-24 md:gap-y-20">
              {PHILOSOPHY.map((item, i) => (
                <RevealOnScroll key={item.num} direction="up" stagger={i} staggerInterval={120}>
                  <div>
                    <p className="text-[9px] font-mono tracking-[0.3em] text-accent/20 uppercase mb-5">{item.num}</p>
                    <h3 className="font-serif text-base sm:text-lg font-medium text-foreground tracking-[0.02em] mb-5">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground/40 leading-[2]">
                      {item.body}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. SELECTED WORK ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-36 sm:py-48 lg:py-60 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-24 sm:mb-32">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">Portfolio</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Selected Work
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {PORTFOLIO.map((item, i) => (
                <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={120}>
                  <Link to={`/project/${item.slug}`} className="group relative aspect-[3/4] overflow-hidden block">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-accent/60 font-medium mb-2.5">{item.type}</p>
                      <p className="text-sm font-serif text-foreground/70 group-hover:text-foreground transition-colors duration-700">{item.label}</p>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="up" delay={400}>
              <div className="text-center mt-20">
                <Button asChild variant="outline-light" size="default">
                  <Link to="/gallery">View All Work <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 7. TESTIMONIAL ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-36 sm:py-48 lg:py-56 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-2xl mx-auto text-center relative z-10">
            <RevealLine className="mx-auto mb-16" width="w-8" />
            <RevealOnScroll direction="scale" duration={1000}>
              <blockquote className="font-serif text-xl sm:text-2xl md:text-[1.75rem] text-foreground/80 italic leading-[1.6] tracking-[0.01em]">
                "His knowledge of horses
                convinced us immediately —
                this isn't just construction,
                it's his passion."
              </blockquote>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="mt-12 flex flex-col items-center gap-3">
                <div className="w-8 h-px bg-accent/20" />
                <p className="mt-3 text-[10px] text-muted-foreground/30 tracking-[0.2em] uppercase">
                  Private Estate — Flinders, VIC
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 8. EQUUS RIDGE ════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, hsl(var(--accent) / 0.015) 0%, transparent 70%)" }}
          />
          <div className="section-container max-w-sm mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-6" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-[10px] tracking-[0.3em] text-accent/30 uppercase mb-8">Coming</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <h2 className="heading-editorial text-foreground/70 mb-6">
                Equus Ridge
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={350}>
              <p className="text-[13px] text-muted-foreground/25 leading-[2]">
                Where design, performance,<br />
                and environment converge.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 9. FINAL CTA ═══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-36 sm:py-48 lg:py-60 relative">
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, transparent 15%, hsl(222 20% 3% / 0.5) 100%)" }}
          />

          <div className="section-container relative z-10 text-center max-w-md mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-16" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-8">
                Discuss Your Project
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/35 mb-12 leading-[1.9]">
                Following assessment, a structured project brief<br />
                and system specification is prepared.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={350}>
              <p className="text-muted-foreground/15 text-[10px] tracking-[0.25em] uppercase mt-10">
                Limited projects per season
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
