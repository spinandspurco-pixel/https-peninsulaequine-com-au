import { useRef, useEffect, useState, useCallback } from "react";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Fence, Home, Mountain, Shovel, Wrench, ChevronRight } from "lucide-react";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";
import { LandIntelligence } from "@/components/LandIntelligence";
import { cn } from "@/lib/utils";

// Hero
import heroFullbleed from "@/assets/hero-home-fullbleed.jpg";

// Portfolio imagery
import garageInterior from "@/assets/garage-interior-flake.webp";
import garageExterior from "@/assets/garage-exterior.webp";
import interiorTimberWindow from "@/assets/interior-timber-window.webp";
import mainRidgeFinishedExterior from "@/assets/main-ridge-finished-exterior.webp";
import steelShedDramatic from "@/assets/steel-shed-dramatic.webp";
import portfolioArenaSymmetry from "@/assets/portfolio-arena-symmetry.jpg";
import portfolioPropertyAerial from "@/assets/portfolio-property-aerial.jpg";

// Build sequence
import seqGround from "@/assets/seq-ground.jpg";
import seqBase from "@/assets/seq-base.jpg";
import seqStructure from "@/assets/seq-structure.jpg";
import seqCompletion from "@/assets/seq-completion.jpg";

// Transformation
import transformBefore from "@/assets/transform-before.jpg";
import transformAfter from "@/assets/transform-after.jpg";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

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
  { icon: Mountain, title: "Arenas", desc: "Engineered surfaces. Consistent footing. Zero drainage failure.", href: "/services" },
  { icon: Fence, title: "Fencing & Yards", desc: "Configured around horse movement and property flow.", href: "/services" },
  { icon: Home, title: "Stables & Barns", desc: "Airflow, sightlines, and workflow — designed for horses.", href: "/services" },
  { icon: Layers, title: "GroundLock Entry Systems", desc: "Interlocking ground stabilisation for high-traffic zones.", href: "/groundlock" },
  { icon: Shovel, title: "Earthworks & Drainage", desc: "Sub-base profiling shaped by how your site moves water.", href: "/services" },
  { icon: Wrench, title: "Custom Infrastructure", desc: "Wash bays, hardstands, pavilions — built for daily use.", href: "/services" },
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
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 -mx-4 px-4 lg:-mx-0 lg:px-0 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {PROJECTS.map((project, i) => (
          <Link
            key={i}
            to={`/project/${project.slug}`}
            className="group relative flex-shrink-0 w-[80vw] sm:w-[50vw] lg:w-[36vw] aspect-[4/5] overflow-hidden"
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
    <>
      <BrandIntro onComplete={() => {}} />
      <Layout>
      <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center">
        {/* Full-bleed image — no overlays, no filters, no blur */}
        <img
          src={heroFullbleed}
          alt="Luxury equestrian arena at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
          loading="eager"
          style={{
            animation: "heroSlowZoom 25s ease-out forwards",
          }}
        />

        {/* Content */}
        <div
          ref={heroContentRef}
          className="relative z-10 text-center"
          style={{ opacity: heroFade, willChange: "opacity" }}
        >
          <h1
            className="font-serif font-semibold text-white tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{
              fontSize: "clamp(2rem, 1rem + 5vw, 4.5rem)",
              animationDelay: "300ms",
              animationFillMode: "both",
              animationDuration: "800ms",
              textShadow: "0 2px 30px rgba(0,0,0,0.4)",
            }}
          >
            From Dirt to Dynasty.
          </h1>
          <p
            className="mt-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-white/50 opacity-0 animate-fade-in"
            style={{
              animationDelay: "700ms",
              animationFillMode: "both",
              animationDuration: "800ms",
              textShadow: "0 1px 10px rgba(0,0,0,0.3)",
            }}
          >
            Built environments for equine performance.
          </p>
        </div>
      </section>

      {/* ═══ 2. BREATHING STATEMENT ══════════════════════ */}
      <section className="relative overflow-hidden cv-auto -mt-px">
        <div className="py-40 sm:py-52 lg:py-64 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-20" />
          <div className="section-container relative z-10 max-w-4xl mx-auto text-center">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light tracking-[0.06em] leading-[1.6]"
                style={{
                  fontSize: "clamp(1.1rem, 0.6rem + 2vw, 1.75rem)",
                  color: "hsl(var(--foreground) / 0.18)",
                }}
              >
                No two builds are the same. Every surface is considered.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ LAND INTELLIGENCE ═══════════════════════════ */}
      <LandIntelligence />

      {/* ═══ BRAND SPINE ═══════════════════════════════ */}
      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.015]" />
        <div className="relative z-10 text-center">
          <RevealOnScroll direction="up">
            <p
              className="font-serif italic tracking-[0.06em]"
              style={{
                fontSize: "clamp(1rem, 0.5rem + 2vw, 1.5rem)",
                color: "hsl(var(--foreground) / 0.12)",
              }}
            >
              From Dirt to Dynasty.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="relative min-h-[70vh] sm:min-h-[75vh] flex items-end overflow-hidden">
        <img
          src={portfolioArenaSymmetry}
          alt="Precision-groomed arena at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="relative z-10 section-container max-w-6xl mx-auto pb-16 sm:pb-20">
          <h2
            className="font-serif text-2xl sm:text-3xl text-foreground/80 tracking-tight opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Selected Work
          </h2>
        </div>
      </section>

      {/* ═══ FEATURED PROJECT ═════════════════════════════ */}
      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="section-container max-w-6xl mx-auto">
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            <img
              src={steelShedDramatic}
              alt="Main Ridge estate build"
              className="w-full aspect-[16/9] object-cover"
              loading="lazy"
            />
          </div>
          <div
            className="mt-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            <h3 className="font-serif text-xl sm:text-2xl text-foreground/75 tracking-tight">
              Main Ridge
            </h3>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/15">
              Private commission.
            </p>
          </div>
        </div>
      </section>

      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="section-container max-w-6xl mx-auto relative z-[1]">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            {/* Left — dominant image */}
            <div
              className="lg:col-span-3 opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <img
                src={mainRidgeFinishedExterior}
                alt="Completed equine build at dusk"
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </div>

            {/* Right — text */}
            <div
              className="lg:col-span-2 opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground/80 tracking-tight mb-5">
                How We Build
              </h2>
              <p className="text-[13px] text-foreground/30 leading-[1.8]">
                Engineered from the ground up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BUILD SEQUENCE ═══════════════════════════════ */}
      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="section-container max-w-6xl mx-auto">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/15 mb-10">
            Built exactly as planned.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { src: seqGround, title: "Ground" },
              { src: seqBase, title: "Base" },
              { src: seqStructure, title: "Structure" },
              { src: seqCompletion, title: "Completion" },
            ].map((step) => (
              <div key={step.title}>
                <img
                  src={step.src}
                  alt={step.title}
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                />
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/25">
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRANSFORMATION ═════════════════════════════ */}
      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="section-container max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground/80 tracking-tight mb-10 sm:mb-14">
            Transformation
          </h2>
          <BeforeAfterSlider
            before={transformBefore}
            after={transformAfter}
            alt="Site transformation"
          />
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/15 text-center">
            From Dirt to Dynasty.
          </p>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════ */}
      <section className="py-36 sm:py-48 lg:py-56 relative">
        <div className="text-center">
          <Link
            to="/contact"
            className="inline-block px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-accent/[0.03] transition-colors duration-500 opacity-0 animate-fade-in"
            style={{
              borderColor: "hsl(var(--accent) / 0.08)",
              color: "hsl(var(--foreground) / 0.35)",
              animationDelay: "200ms",
              animationFillMode: "both",
              animationDuration: "800ms",
            }}
          >
            Apply to Build →
          </Link>
          <p
            className="mt-5 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10 opacity-0 animate-fade-in"
            style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Selected projects only.
          </p>
        </div>
      </section>
    </Layout>
    </>
  );
}
