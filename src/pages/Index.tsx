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

// Portfolio imagery — curated hero-tier visuals
import aberdeenStonework from "@/assets/aberdeen-stonework-color.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import equitanaTractors from "@/assets/equitana-tractors.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";

// Intro video
import buildVideo from "@/assets/videos/main-ridge-woodwork-1.mp4";

// Detail / material textures
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import aberdeenStallsDetail from "@/assets/aberdeen-stalls-detail.jpg";

// Process / build imagery
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";

// Training
import trainerGlenn from "@/assets/trainer-glenn.jpg";

// Shop / Forge imagery
import peBanner from "@/assets/pe-banner.png";

// CTA closer
import heroSunset from "@/assets/hero-sunset.png";

const PROJECTS = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm", scope: "Stables & Stonework", slug: "aberdeen-farm" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge", scope: "Arena & Barn Complex", slug: "main-ridge" },
  { src: equitanaTractors, alt: "Equitana arena preparation", label: "Equitana", scope: "Competition Arena", slug: "equitana" },
  { src: mainRidgeBarnFrame, alt: "Main Ridge barn frame", label: "Main Ridge", scope: "Structural Timber", slug: "main-ridge" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "QLD Facility", scope: "Full Facility Build", slug: "qld-facility" },
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

/* ── Standardised spacing constants ───── */
const SP_LG = "py-20"; // 80px
const SP_MD = "mb-12"; // 48px
const SP_SM = "mb-6"; // 24px

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

/* ── Service Icon with draw-in animation ───── */
function ServiceIcon({ icon: Icon, className }: { icon: typeof Mountain; className?: string }) {
  return (
    <Icon
      className={cn(
        "w-5 h-5 text-foreground/30 transition-all duration-700",
        "group-hover:text-accent/70",
        "opacity-0 animate-[drawIn_0.7s_ease-out_forwards]",
        className
      )}
      strokeWidth={1.7}
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
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] brightness-[0.8] group-hover:brightness-[0.92]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-transparent" />
            <div className="absolute inset-0 grain-texture opacity-30" />
            <div className="absolute inset-0 bg-background/15 group-hover:bg-background/0 transition-all duration-900" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-900">
              <p className="text-[9px] uppercase tracking-[0.25em] text-accent/50 font-mono mb-2 opacity-70 group-hover:opacity-100 transition-opacity duration-500">{project.scope}</p>
              <p className="font-serif text-lg text-foreground/60 group-hover:text-foreground transition-all duration-700">{project.label}</p>
              <div className="flex items-center gap-1.5 mt-3 text-accent/0 group-hover:text-accent/60 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
      {PROCESS_STEPS.map((step, i) => (
        <RevealOnScroll key={step.num} direction="up" stagger={i} staggerInterval={120}>
          <div className="relative lg:px-8">
            {i < PROCESS_STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-accent/10" />
            )}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center flex-shrink-0 bg-accent/[0.03]">
                <span className="text-[10px] font-mono text-accent/60 tracking-wider">{step.num}</span>
              </div>
              <h4 className="font-serif text-sm font-medium text-foreground tracking-[0.02em]">{step.title}</h4>
            </div>
            <p className="text-[12px] text-muted-foreground/35 leading-[1.9] lg:pl-[52px] max-w-[220px]">{step.desc}</p>
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
          className="absolute inset-0 w-full h-full object-cover brightness-[0.25] contrast-[1.2] saturate-[0.4]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/55" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 45% at 50% 48%, transparent 10%, hsl(222 20% 4% / 0.85) 60%, hsl(222 20% 4%) 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none grain-texture" />
        <div className="absolute inset-0 pointer-events-none contour-texture opacity-[0.015]" />

        <div className="relative z-10 section-container text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-8 sm:gap-12">
            <div
              className="flex items-center justify-center gap-5 opacity-0 animate-fade-in"
              style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1400ms" }}
            >
              <div className="w-12 h-px bg-accent/20" />
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50">Peninsula Equine</p>
              <div className="w-12 h-px bg-accent/20" />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h1
                className="font-serif font-bold text-foreground leading-[0.9] tracking-[0.01em] opacity-0 animate-fade-in"
                style={{
                  animationDelay: "1000ms",
                  animationFillMode: "both",
                  animationDuration: "1600ms",
                  fontSize: "clamp(2.6rem, 1.4rem + 5.5vw, 6.5rem)",
                }}
              >
                Built from the<br className="hidden sm:block" /> ground up.
              </h1>
              <p
                className="font-serif font-light text-foreground/30 leading-[0.95] tracking-[0.02em] opacity-0 animate-fade-in"
                style={{
                  animationDelay: "1500ms",
                  animationFillMode: "both",
                  animationDuration: "1400ms",
                  fontSize: "clamp(1.6rem, 0.8rem + 3.5vw, 4rem)",
                }}
              >
                Designed to last generations.
              </p>
            </div>

            <p
              className="text-muted-foreground/22 text-[10px] sm:text-[11px] tracking-[0.35em] uppercase max-w-sm opacity-0 animate-fade-in leading-[2]"
              style={{ animationDelay: "2000ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              Arenas · Stables · Systems · Engineered with precision
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in pt-2"
              style={{ animationDelay: "2400ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              <Button asChild variant="gold" size="lg" className="px-8">
                <Link to="/site-assessment">
                  Book Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-transparent border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/25 hover:bg-foreground/[0.03] transition-all duration-700 px-8">
                <Link to="/gallery">View Projects</Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in"
          style={{ animationDelay: "3200ms", animationFillMode: "both", animationDuration: "1200ms" }}
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
        <div className={`${SP_LG} sm:py-28 lg:py-32 relative`}>
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
                <div className="relative aspect-[4/5] overflow-hidden">
                  <video
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.65] contrast-[1.1] saturate-[0.7]"
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

      {/* ═══ 3. SERVICES GRID — 2x3 SYSTEM-STYLE ══════════ */}
      <SectionBleed from="background" to="card" />
      <section className="relative overflow-hidden">
        <div className={`${SP_LG} sm:py-28 lg:py-32 bg-card relative`}>
          <div className="absolute inset-0 contour-texture" />
          <div className="absolute inset-0 grain-texture opacity-40" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            {/* Section header — left-aligned */}
            <div className={`${SP_MD}`}>
              <RevealOnScroll direction="up">
                <RevealLine className="mb-6" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-3">What We Build</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Capabilities
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/10">
              {SERVICES.map((svc, i) => (
                <RevealOnScroll key={svc.title} direction="up" stagger={i} staggerInterval={80}>
                  <Link
                    to={svc.href}
                    className="group relative flex flex-col p-8 bg-card hover:bg-secondary/30 transition-all duration-700 hover:-translate-y-0.5 overflow-hidden min-h-[200px]"
                  >
                    {/* Subtle glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{ background: "radial-gradient(ellipse at 30% 30%, hsl(var(--accent) / 0.03) 0%, transparent 60%)" }}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      <ServiceIcon icon={svc.icon} className={`mb-6`} />
                      <h3 className="font-serif text-[15px] font-medium text-foreground mb-3 tracking-[0.02em] group-hover:text-accent transition-colors duration-500">
                        {svc.title}
                      </h3>
                      <p className="text-[12px] text-muted-foreground/35 leading-[1.9] max-w-[240px] flex-1">{svc.desc}</p>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-accent/40 transition-all duration-500 mt-6 self-end" />
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
        <div className={`${SP_LG} sm:py-28 lg:py-32 relative`}>
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-7xl mx-auto relative z-[1]">
            {/* Left-aligned header */}
            <div className={`${SP_MD}`}>
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

      {/* ═══ 5. GROUNDLOCK — SIGNATURE SYSTEM ══════════════ */}
      <SectionBleed from="background" to="card" />
      <section className="relative overflow-hidden">
        <div className={`${SP_LG} sm:py-28 lg:py-32 bg-card relative`}>
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
                  <div className="flex items-center gap-3 mb-6">
                    <Layers className="w-4 h-4 text-accent/50" strokeWidth={1.5} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50">Proprietary System</span>
                  </div>
                  <h2 className="heading-section text-foreground mb-4 leading-[1.15]">
                    P.E. GroundLock™
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/20 mb-8">
                    Modular Ground Stabilisation
                  </p>
                  <p className="text-[14px] text-muted-foreground/45 leading-[2] mb-6 max-w-[340px]">
                    GroundLock is a modular base system designed for strength,
                    speed, and long-term stability. Built to outperform
                    traditional methods.
                  </p>
                  <p className="text-[11px] text-muted-foreground/20 italic mb-8">
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

      {/* ═══ 6. PROCESS TIMELINE ═══════════════════════════ */}
      <SectionBleed from="card" to="background" />
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-20 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            {/* Left-aligned header */}
            <div className={`${SP_MD}`}>
              <RevealOnScroll direction="up">
                <RevealLine className="mb-6" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-3">How We Work</p>
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

      {/* ═══ 7. AUTHORITY STRIP — reduced visual weight ═══ */}
      <section className="relative overflow-hidden">
        <div className="py-12 sm:py-16 bg-card/50 relative">
          <div className="absolute inset-0 grain-texture opacity-20" />
          <div className="section-container relative z-[1]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 max-w-3xl mx-auto text-center">
              <RevealOnScroll direction="up" stagger={0} staggerInterval={100}>
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-foreground/70 mb-1">Victoria-Wide</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/20 font-mono">Projects Across the State</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" stagger={1} staggerInterval={100}>
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-foreground/70 mb-1">$500K+</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/20 font-mono">Custom Builds to Scale</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" stagger={2} staggerInterval={100}>
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-foreground/70 mb-1">Private &amp; Pro</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/20 font-mono">Estates &amp; Facilities</p>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. EQUUS FORGE — SHOP PREVIEW ════════════════ */}
      <SectionBleed from="card" to="primary" />
      <section className="relative overflow-hidden">
        <div className={`${SP_LG} sm:py-28 bg-primary relative`}>
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, hsl(var(--primary-foreground)) 20px, hsl(var(--primary-foreground)) 21px)",
          }} />
          <div className="absolute inset-0 grain-texture" />
          {/* Background glow behind CTA area */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 50% 60% at 65% 50%, hsl(var(--accent) / 0.05) 0%, transparent 70%)" }}
          />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <RevealOnScroll direction="up">
                <div className="relative aspect-[4/3] overflow-hidden group">
                  <img
                    src={peBanner}
                    alt="Equus Forge — Peninsula Equine product line"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.75] group-hover:brightness-[0.85] transition-all duration-700"
                    loading="lazy"
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
                  <p className="text-primary-foreground/25 text-[10px] uppercase tracking-[0.22em] mb-8">
                    by Peninsula Equine
                  </p>
                  <p className="text-[14px] text-primary-foreground/50 leading-[2] mb-4 max-w-[340px]">
                    Engineered ground systems, steel components, and infrastructure
                    configurations — designed for horsemen, by a horseman.
                  </p>
                  <p className="text-[11px] text-primary-foreground/20 tracking-[0.18em] uppercase mb-8">
                  </p>
                  <p className="text-[11px] text-primary-foreground/20 tracking-[0.15em] uppercase mb-8">
                    Systems. Components. Built to scale.
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={250}>
                  <Button asChild variant="gold" size="lg" className="px-8">
                    <Link to="/shop">
                      Explore GroundLock™ Systems <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRAINING MENTION ═════════════════════════════ */}
      <section className="relative border-t border-border/5">
        <div className="py-6 sm:py-8">
          <div className="section-container relative z-10 text-center max-w-md mx-auto">
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/12 font-mono mb-2">
              On-site training
            </p>
            <p className="text-[11px] sm:text-[12px] text-muted-foreground/18 leading-[1.85] font-serif italic">
              Select training sessions are available on-site with Glenn Browitt on Thursdays and Fridays, offering experienced guidance in horsemanship and performance.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 9. FINAL CTA ═══════════════════════════════════ */}
      <SectionBleed from="background" to="background" />
      <section className="relative overflow-hidden">
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="absolute inset-0 contour-texture opacity-[0.02]" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 55% 40% at 50% 50%, hsl(var(--accent) / 0.015) 0%, transparent 60%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, transparent 15%, hsl(222 20% 3% / 0.5) 100%)" }}
          />

          <div className="section-container relative z-10 text-center max-w-md mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-12" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-6 leading-[1.1]">
                Build it properly.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-[14px] text-muted-foreground/25 mb-10 leading-[2] max-w-[300px] mx-auto">
                Every project begins with a site assessment.<br />
                Let's talk about yours.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <Button asChild variant="gold" size="lg" className="px-8">
                <Link to="/site-assessment">
                  Book Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
