import { useRef, useEffect, useState } from "react";
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
import garageInterior from "@/assets/garage-interior-flake.jpg";
import garageExterior from "@/assets/garage-exterior.jpg";
import pavilionTimber from "@/assets/pavilion-timber-detail.jpg";
import interiorTimberWindow from "@/assets/interior-timber-window.jpg";
import mainRidgeFinishedExterior from "@/assets/main-ridge-finished-exterior.jpg";
import steelShedDramatic from "@/assets/steel-shed-dramatic.jpg";
import timberCubbyFront from "@/assets/timber-cubby-front.jpg";

// Intro video
import buildVideo from "@/assets/videos/main-ridge-woodwork-1.mp4";

// Detail / material textures (unique to homepage strip)
import reclaimedBeamWorkshop from "@/assets/reclaimed-beam-workshop.jpg";
import reclaimedBoardsForklift from "@/assets/reclaimed-boards-forklift.jpg";

// Process / build imagery (unique to homepage)
import mainRidgeFrameAngle from "@/assets/main-ridge-frame-angle.jpg";
import mainRidgeFrameWide from "@/assets/main-ridge-frame-wide.jpg";
import mainRidgeRebarDepth2 from "@/assets/main-ridge-rebar-depth-2.jpg";
import equitanaTractorStorm from "@/assets/equitana-tractor-storm.jpg";
import equitanaArenaFinish from "@/assets/equitana-arena-finish.jpg";

// Training
import glennRiding from "@/assets/glenn-riding.jpg";

// Shop / Forge imagery
import peBanner from "@/assets/pe-banner.png";

// CTA closer
import heroSunset from "@/assets/hero-sunset.png";

const PROJECTS = [
  { src: mainRidgeFinishedExterior, alt: "Main Ridge pavilion at dusk", label: "Main Ridge", scope: "Pavilion & Fireplace", slug: "main-ridge" },
  { src: garageInterior, alt: "Precision garage interior with flake floor", label: "Private Client", scope: "Garage & Workshop", slug: "aberdeen-farm" },
  { src: steelShedDramatic, alt: "Custom steel barn with dramatic sky", label: "Steel Structures", scope: "Colorbond Barn Build", slug: "caulfield" },
  { src: timberCubbyFront, alt: "Western-style bespoke timber cubby", label: "Custom Builds", scope: "Bespoke Timber", slug: "equitana" },
  { src: pavilionTimber, alt: "Timber and corrugated iron detail", label: "Peninsula Build", scope: "Structural Carpentry", slug: "equitana" },
  { src: garageExterior, alt: "Steel shed with polished concrete apron", label: "Mornington Peninsula", scope: "Steel Structures", slug: "caulfield" },
  { src: interiorTimberWindow, alt: "Recycled timber cladding with bush views", label: "Main Ridge Interior", scope: "Timber Fit-out", slug: "qld-facility" },
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
const SP_SECTION = "py-24 sm:py-32 lg:py-40";
const SP_HEAD = "mb-14 sm:mb-16";
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
              className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.8] group-hover:brightness-[0.92]"
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

      {/* ═══ 3. SERVICES GRID — 2x3 SYSTEM-STYLE ══════════ */}
      <SectionBleed from="background" to="card" />
      <section className="relative overflow-hidden">
        <div className={`${SP_SECTION} bg-card relative`}>
          <div className="absolute inset-0 contour-texture" />
          <div className="absolute inset-0 grain-texture opacity-40" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            {/* Section header — left-aligned */}
            <div className={`${SP_HEAD}`}>
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
                    GroundLock is an engineered entry system designed specifically for equine and rural
                    properties. Created for floats, trucks, utes, and high-traffic front arrivals, it
                    stabilises the ground beneath the finish while creating a stronger, cleaner, more
                    resolved entry experience.
                  </p>
                  <p className="text-[13px] text-muted-foreground/35 leading-[2] mb-6 max-w-[360px]">
                    Where standard systems focus only on surface support, GroundLock is designed for the
                    full point of arrival — drainage, load distribution, vehicle movement, and the visual
                    impact of a front gate that feels properly built.
                  </p>
                  <p className="text-[11px] text-muted-foreground/20 italic tracking-[0.04em] mb-10">
                    Engineered beneath the surface. Designed for the way equine properties live.
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
                  GroundLock is designed for the full point of arrival — not just the surface layer.
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


      <SectionBleed from="card" to="background" />
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 lg:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className={`${SP_HEAD}`}>
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

            {/* Build process imagery — cropped tight to hands/tools */}
            <RevealOnScroll direction="up" delay={200}>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-16 img-bridge">
                <div className="relative aspect-[16/10] overflow-hidden group col-span-2 lg:col-span-2">
                  <img
                    src={mainRidgeFrameWide}
                    alt="Main Ridge framing build phase"
                    className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.7] saturate-[0.8] group-hover:brightness-[0.8]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/10" />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden group">
                  <img
                    src={mainRidgeFrameAngle}
                    alt="Timber frame angle detail"
                    className="absolute inset-0 w-full h-full object-cover object-top img-immersive brightness-[0.7] saturate-[0.8] group-hover:brightness-[0.8]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/10" />
                </div>
              </div>
            </RevealOnScroll>

            {/* Material strip — scrolling mosaic */}
            <RevealOnScroll direction="up" delay={300}>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-12">
                {[
                  { src: interiorTimberWindow, alt: "Timber cladding detail" },
                  { src: mainRidgeRebarDepth2, alt: "Rebar foundation depth" },
                  { src: reclaimedBeamWorkshop, alt: "Reclaimed beam preparation" },
                  { src: reclaimedBoardsForklift, alt: "Timber boards ready for fabrication" },
                  { src: equitanaTractorStorm, alt: "Equitana arena tractor pass" },
                  { src: equitanaArenaFinish, alt: "Finished Equitana arena surface" },
                ].map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden group">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="absolute inset-0 w-full h-full object-cover img-immersive brightness-[0.65] saturate-[0.7] contrast-[1.1]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/10 group-hover:bg-transparent transition-colors duration-700" />
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 7. AUTHORITY STRIP — reduced visual weight ═══ */}
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-24 bg-card/50 relative">
          <div className="absolute inset-0 grain-texture opacity-20" />
          <div className="section-container relative z-[1]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 max-w-3xl mx-auto text-center">
              <RevealOnScroll direction="up" stagger={0} staggerInterval={120}>
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-foreground/70 mb-1.5">Victoria-Wide</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/20 font-mono">Projects Across the State</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" stagger={1} staggerInterval={120}>
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-foreground/70 mb-1.5">$500K+</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/20 font-mono">Custom Builds to Scale</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" stagger={2} staggerInterval={120}>
                <div>
                  <p className="font-serif text-xl sm:text-2xl text-foreground/70 mb-1.5">Private &amp; Pro</p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/20 font-mono">Estates &amp; Facilities</p>
                </div>
              </RevealOnScroll>
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
                    Engineered products and signature systems for premium equine and rural properties.
                  </p>
                  <p className="text-[14px] text-primary-foreground/45 leading-[2] mb-10 max-w-[360px]">
                    Equus Forge is the product division of Peninsula Equine — bringing together forged
                    hardware, engineered ground systems, and custom rural design elements built for
                    properties that need to work hard and feel properly resolved.
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            {/* Product family cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px">
              {[
                {
                  title: "GroundLock Systems",
                  body: "Premium stabilised entry systems designed for floats, trucks, and high-traffic rural arrivals.",
                  cta: "Explore GroundLock",
                  href: "/groundlock",
                },
                {
                  title: "Forge Hardware",
                  body: "Architectural steelwork, gate elements, and rural hardware designed to elevate the working property.",
                  cta: "View Hardware",
                  href: "/shop",
                },
                {
                  title: "Custom Property Elements",
                  body: "Bespoke entry packages, estate details, and made-to-fit solutions for standout equine and rural builds.",
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

      {/* ═══ 9. FINAL CTA — cinematic sunset ═══════════════ */}
      <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        <img
          src={heroSunset}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-[1.1] brightness-[0.35] saturate-[0.6] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        <div className="absolute inset-0 grain-texture" />

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="section-container text-center max-w-md mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-12" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-6 leading-[1.1]">
                Build it properly.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-[14px] text-muted-foreground/30 mb-10 leading-[2] max-w-[300px] mx-auto">
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
