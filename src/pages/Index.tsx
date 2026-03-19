import { useRef, useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Fence, Home, Mountain, Shovel, Wrench, ChevronRight } from "lucide-react";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";
import { cn } from "@/lib/utils";

// Video
import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

// Portfolio imagery
import aberdeenStonework from "@/assets/aberdeen-stonework-color.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import qldExterior from "@/assets/qld-facility-exterior-1.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";

// Intro video
import buildVideo from "@/assets/videos/main-ridge-woodwork-1.mp4";

// Shop / Forge imagery
import peBanner from "@/assets/pe-banner.png";

const PROJECTS = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm", scope: "Stables & Stonework", slug: "aberdeen-farm" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge", scope: "Arena & Barn Complex", slug: "main-ridge" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "QLD Facility", scope: "Full Facility Build", slug: "qld-facility" },
  { src: qldExterior, alt: "QLD facility exterior view", label: "QLD Exterior", scope: "Stable & Arena", slug: "qld-facility" },
  { src: mainRidgeCraneLift, alt: "Main Ridge crane lift", label: "Main Ridge", scope: "Structural Steel", slug: "main-ridge" },
];

const SERVICES = [
  { icon: Mountain, title: "Arenas", desc: "Engineered surfaces with consistent footing and zero drainage failure.", href: "/services" },
  { icon: Fence, title: "Fencing", desc: "Post-and-rail, steel, and custom fencing systems built for longevity.", href: "/services" },
  { icon: Home, title: "Stables", desc: "Designed around equine behaviour, airflow, and structural durability.", href: "/services" },
  { icon: Layers, title: "GroundLock Systems", desc: "Interlocking ground stabilisation — eliminates mud permanently.", href: "/groundlock" },
  { icon: Shovel, title: "Earthworks", desc: "Civil preparation, drainage engineering, and sub-base profiling.", href: "/services" },
  { icon: Wrench, title: "Custom Builds", desc: "Bespoke infrastructure — wash bays, float areas, rural structures.", href: "/services" },
];

const PROCESS_STEPS = [
  { num: "01", title: "Site Assessment", desc: "On-site evaluation of terrain, drainage, and project scope." },
  { num: "02", title: "Design + Scope", desc: "Detailed specification, materials planning, and timeline." },
  { num: "03", title: "Build + Execution", desc: "Precision construction with quality checkpoints throughout." },
  { num: "04", title: "Completion", desc: "Final inspection, handover, and maintenance guidance." },
];

/* ── Section divider ─────────────────── */
function SectionDivider() {
  return (
    <div className="relative h-px w-full" aria-hidden="true">
      <div className="divider-grid" />
    </div>
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
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <p className="text-[9px] uppercase tracking-[0.25em] text-accent/60 font-mono mb-2">{project.scope}</p>
              <p className="font-serif text-lg text-foreground/80 group-hover:text-foreground transition-colors duration-500">{project.label}</p>
              <div className="flex items-center gap-1.5 mt-3 text-accent/40 group-hover:text-accent/70 transition-colors">
                <span className="text-[10px] uppercase tracking-[0.15em] font-mono">View Project</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      {canScrollRight && (
        <div className="hidden lg:flex absolute right-0 top-0 bottom-4 w-24 items-center justify-end bg-gradient-to-l from-background via-background/60 to-transparent pointer-events-none">
          <ChevronRight className="w-6 h-6 text-accent/30 mr-2" />
        </div>
      )}
    </div>
  );
}

/* ── Process Timeline ────────────────── */
function ProcessTimeline() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
      {PROCESS_STEPS.map((step, i) => (
        <RevealOnScroll key={step.num} direction="up" stagger={i} staggerInterval={120}>
          <div className="relative lg:px-8">
            {/* Connecting line (desktop only) */}
            {i < PROCESS_STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-border/30" />
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-mono text-accent/70 tracking-wider">{step.num}</span>
              </div>
              <h4 className="font-serif text-sm font-medium text-foreground tracking-[0.02em]">{step.title}</h4>
            </div>
            <p className="text-[12px] text-muted-foreground/40 leading-[1.9] lg:pl-[52px]">{step.desc}</p>
          </div>
        </RevealOnScroll>
      ))}
    </div>
  );
}

export default function Index() {
  return (
    <Layout>
      {/* ═══ 1. HERO — FULL SCREEN CINEMATIC ═══════════════ */}
      <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3] contrast-[1.15] saturate-[0.5]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/60" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 65% 50% at 50% 48%, transparent 15%, hsl(222 20% 4% / 0.8) 65%, hsl(222 20% 4%) 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none grain-texture" />

        <div className="relative z-10 section-container text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-10 sm:gap-14">
            {/* Overline */}
            <div
              className="flex items-center justify-center gap-5 opacity-0 animate-fade-in"
              style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1200ms" }}
            >
              <div className="w-10 h-px bg-accent/30" />
              <p className="text-overline text-accent/60">Peninsula Equine</p>
              <div className="w-10 h-px bg-accent/30" />
            </div>

            {/* Headline — line-by-line reveal */}
            <div className="space-y-3 sm:space-y-5">
              <h1
                className="font-serif font-bold text-foreground leading-[1.05] tracking-[0.015em] opacity-0 animate-fade-in"
                style={{
                  animationDelay: "1000ms",
                  animationFillMode: "both",
                  animationDuration: "1400ms",
                  fontSize: "clamp(2.4rem, 1.2rem + 5vw, 6rem)",
                }}
              >
                Built from the ground up.
              </h1>
              <p
                className="font-serif text-foreground/50 leading-[1.1] tracking-[0.015em] opacity-0 animate-fade-in"
                style={{
                  animationDelay: "1400ms",
                  animationFillMode: "both",
                  animationDuration: "1200ms",
                  fontSize: "clamp(2rem, 1rem + 4vw, 5rem)",
                }}
              >
                Designed to last generations.
              </p>
            </div>

            {/* Subheading */}
            <p
              className="text-muted-foreground/40 text-[11px] sm:text-xs tracking-[0.25em] uppercase max-w-md opacity-0 animate-fade-in"
              style={{ animationDelay: "1900ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              Arenas. Stables. Systems. Engineered with precision.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
              style={{ animationDelay: "2300ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              <Button asChild variant="gold" size="lg">
                <Link to="/site-assessment">
                  Book Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link to="/gallery">View Projects</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
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

      {/* ═══ 2. INTRO — SPLIT SCREEN ═══════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-28 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-6xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Text */}
              <div>
                <RevealOnScroll direction="up">
                  <RevealLine className="mb-14" width="w-10" />
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={100}>
                  <p className="text-overline mb-8 text-accent/50">Built by a Horseman</p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={200}>
                  <h2 className="heading-section text-foreground mb-10">
                    Understanding First.<br />
                    Then Construction.
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={300}>
                  <p className="text-sm sm:text-[15px] text-muted-foreground/50 leading-[2] max-w-md">
                    Peninsula Equine builds high-performance equine environments across Victoria.
                    From private arenas to full-scale facilities, every project is engineered for
                    longevity, usability, and clean execution.
                  </p>
                </RevealOnScroll>
              </div>
              {/* Video */}
              <RevealOnScroll direction="up" delay={200}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <video
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
                  >
                    <source src={buildVideo} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                  <div className="absolute inset-0 grain-texture opacity-40" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. SERVICES GRID — 2x3 SYSTEM-STYLE ══════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-28 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-28">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {SERVICES.map((svc, i) => (
                <RevealOnScroll key={svc.title} direction="up" stagger={i} staggerInterval={80}>
                  <Link
                    to={svc.href}
                    className="group relative p-7 sm:p-8 border border-border/30 bg-background/40 hover:border-accent/25 transition-all duration-700 hover:-translate-y-0.5 overflow-hidden"
                  >
                    {/* Hover texture overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 engineering-grid" />
                    <div className="relative z-10">
                      <svc.icon className="w-5 h-5 text-accent/40 mb-5 group-hover:text-accent/70 transition-colors duration-700" strokeWidth={1.25} />
                      <h3 className="font-serif text-base font-medium text-foreground mb-3 tracking-[0.02em] group-hover:text-accent transition-colors duration-700">
                        {svc.title}
                      </h3>
                      <p className="text-[12px] text-muted-foreground/40 leading-[1.9]">{svc.desc}</p>
                    </div>
                    <ArrowRight className="absolute bottom-7 right-7 w-4 h-4 text-muted-foreground/10 group-hover:text-accent/40 transition-all duration-700 group-hover:translate-x-0.5" />
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. PROJECTS — HORIZONTAL SCROLL ═══════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-28 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-7xl mx-auto relative z-[1]">
            <div className="text-center mb-16 sm:mb-24">
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

            <RevealOnScroll direction="up" delay={200}>
              <ProjectsScroll />
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={300}>
              <div className="text-center mt-16">
                <Button asChild variant="outline-light" size="default">
                  <Link to="/gallery">View All Projects <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 5. GROUNDLOCK — SIGNATURE SYSTEM ══════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-28 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
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
                    Modular Ground Stabilisation
                  </p>
                  <p className="text-sm text-muted-foreground/50 leading-[1.9] mb-6 max-w-sm">
                    GroundLock is a modular base system designed for strength,
                    speed, and long-term stability. Built to outperform
                    traditional methods.
                  </p>
                  <p className="text-[12px] text-muted-foreground/25 italic mb-10">
                    This is where the real intelligence lives.
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={200}>
                  <Button asChild variant="outline-light" size="default">
                    <Link to="/groundlock">
                      Explore the System <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* ═══ 6. PROCESS TIMELINE ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-28 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">How We Work</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  The Process
                </h2>
              </RevealOnScroll>
            </div>

            <ProcessTimeline />
          </div>
        </div>
      </section>

      {/* ═══ 7. AUTHORITY STRIP ════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-16 sm:py-20 bg-card relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container relative z-[1]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 max-w-3xl mx-auto text-center">
              <RevealOnScroll direction="up" stagger={0} staggerInterval={100}>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Victoria-Wide</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30 font-mono">Projects Across the State</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" stagger={1} staggerInterval={100}>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-foreground mb-2">$500K+</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30 font-mono">Custom Builds to Scale</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" stagger={2} staggerInterval={100}>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Private &amp; Pro</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30 font-mono">Estates &amp; Facilities</p>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. EQUUS FORGE — SHOP PREVIEW ════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider />
        <div className="py-28 sm:py-36 bg-primary relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, hsl(var(--primary-foreground)) 20px, hsl(var(--primary-foreground)) 21px)",
          }} />
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              <RevealOnScroll direction="up">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={peBanner}
                    alt="Equus Forge — Peninsula Equine product line"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.8]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent" />
                </div>
              </RevealOnScroll>
              <div>
                <RevealOnScroll direction="up" delay={100}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/50 mb-6">Product Division</p>
                  <h2 className="heading-section text-primary-foreground mb-4">
                    Equus Forge
                  </h2>
                  <p className="text-primary-foreground/25 text-[11px] uppercase tracking-[0.2em] mb-8">
                    by Peninsula Equine
                  </p>
                  <p className="text-sm text-primary-foreground/45 leading-[1.9] mb-10 max-w-sm">
                    Steel with soul. Custom-fabricated gates, panels, fixtures, and
                    structural components — built for horsemen, by horsemen.
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={250}>
                  <Button asChild variant="gold" size="lg">
                    <Link to="/forge">
                      Enter Equus Forge <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </RevealOnScroll>
              </div>
            </div>
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
                Ready to Build?
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/35 mb-12 leading-[1.9]">
                Every project begins with a site assessment.<br />
                Let's talk about yours.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <Button asChild variant="gold" size="lg">
                <Link to="/site-assessment">
                  Book Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
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
