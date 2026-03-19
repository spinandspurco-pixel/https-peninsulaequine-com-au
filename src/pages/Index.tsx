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

const PORTFOLIO = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm", type: "Stables & Stonework", slug: "aberdeen-farm" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge", type: "Arena & Barn", slug: "main-ridge" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "QLD Facility", type: "Full Facility", slug: "qld-facility" },
];

const CAPABILITIES = [
  {
    Icon: BPArena,
    num: "01",
    title: "Performance Arenas",
    desc: "Precision-graded surfaces engineered for consistency, drainage, and long-term performance.",
    href: "/services",
  },
  {
    Icon: BPStables,
    num: "02",
    title: "Stables & Barns",
    desc: "Structures designed around equine behaviour, airflow, and durability — specified for longevity.",
    href: "/services",
  },
  {
    Icon: BPGroundSystems,
    num: "03",
    title: "Ground Systems",
    suffix: "GroundLock™",
    desc: "Interlocking stabilisation designed to eliminate mud and deliver consistent surface performance.",
    href: "/groundlock",
  },
  {
    Icon: BPInfrastructure,
    num: "04",
    title: "Rural Infrastructure",
    desc: "Integrated site-wide systems — laneways, drainage, access, and utility corridors.",
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

const PHILOSOPHY = [
  {
    num: "01",
    title: "Performance Starts Below the Surface",
    body: "What you see above ground is only as good as what lies beneath it. We engineer sub-base systems, drainage pathways, and compaction profiles before a single post is set.",
  },
  {
    num: "02",
    title: "Drainage Is Not Optional",
    body: "Water destroys more equine facilities than time. Every build we deliver is designed around water — where it enters, how it moves, and where it exits.",
  },
  {
    num: "03",
    title: "Designed for the Horse",
    body: "We build for how horses actually live, move, and perform — not for how a brochure looks. Airflow, footing, sightlines, and stress reduction are engineered in from day one.",
  },
  {
    num: "04",
    title: "Built for Generations",
    body: "We don't build to a budget. We build to a standard. Every material, every joint, every layer is specified for durability — not convenience.",
  },
];

const PROCESS_STEPS = [
  { num: "01", title: "Site Assessment", desc: "On-site evaluation of ground conditions, drainage, and layout." },
  { num: "02", title: "Scope & System Design", desc: "Structured project brief and system specification." },
  { num: "03", title: "Project Planning", desc: "Materials, sequencing, and long-term performance planning." },
  { num: "04", title: "Implementation", desc: "Precision build with integrated quality control." },
  { num: "05", title: "Long-Term Outcome", desc: "Designed to reduce maintenance over time." },
];

/* ── Architectural section divider ─────────────────── */
function SectionDivider({ variant = "line" }: { variant?: "line" | "grid" }) {
  if (variant === "grid") {
    return (
      <div className="relative h-px w-full" aria-hidden="true">
        <div className="divider-grid" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-1" aria-hidden="true">
      <div className="w-16 h-px bg-accent/20" />
    </div>
  );
}

export default function Index() {
  return (
    <Layout>
      {/* ═══ 1. HERO — Cinematic, emotional, bold ═══════════ */}
      <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4] contrast-[1.2] saturate-[0.7]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/60" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 55% at 50% 50%, transparent 20%, hsl(222 20% 4% / 0.7) 70%, hsl(222 20% 4%) 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none grain-texture" />

        <div className="relative z-10 section-container text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-12 sm:gap-16">
            <div
              className="flex items-center justify-center gap-5 opacity-0 animate-fade-in"
              style={{ animationDelay: "400ms", animationFillMode: "both" }}
            >
              <div className="w-10 h-px bg-accent/40" />
              <p className="text-overline text-accent/80">
                Engineered Equine Infrastructure
              </p>
              <div className="w-10 h-px bg-accent/40" />
            </div>

            <h1
              className="font-serif font-bold text-foreground leading-[0.92] tracking-[0.02em] opacity-0 animate-fade-in"
              style={{
                animationDelay: "700ms",
                animationFillMode: "both",
                animationDuration: "1000ms",
                fontSize: "clamp(3.5rem, 2rem + 6vw, 9rem)",
              }}
            >
              <span className="block">FROM DIRT</span>
              <span className="block mt-3 sm:mt-5">TO DYNASTY</span>
            </h1>

            <p
              className="text-muted-foreground/50 text-[11px] sm:text-xs tracking-[0.25em] uppercase max-w-md opacity-0 animate-fade-in"
              style={{ animationDelay: "1200ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              Designed for the horse. Built for the long term.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
              style={{ animationDelay: "1600ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link to="/gallery">View Selected Works</Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 animate-fade-in"
          style={{ animationDelay: "2200ms", animationFillMode: "both" }}
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-muted-foreground/30 font-sans">
            Explore
          </span>
          <div className="w-px h-10 bg-accent/15 relative overflow-hidden">
            <div
              className="absolute top-0 w-full h-4 bg-accent/50"
              style={{ animation: "scrollPulse 2.5s ease-in-out infinite" }}
            />
          </div>
        </div>
      </section>

      {/* ═══ 2. BRAND POSITIONING ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-32 sm:py-44 lg:py-56 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-10" />
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={100}>
              <p className="text-overline mb-10">Built by a Horseman</p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={200}>
              <h2 className="heading-section text-foreground mb-16">
                Built on Understanding —<br />
                Not Assumption
              </h2>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={300}>
              <div className="space-y-7 text-sm sm:text-[15px] text-muted-foreground/60 leading-[2] font-sans">
                <p>
                  Peninsula Equine is built on firsthand understanding —
                  not just of construction, but of how horses
                  live, move, and perform.
                </p>
                <p>
                  That perspective shapes every decision.
                  From drainage to footing to airflow.
                </p>
                <p className="text-muted-foreground/30 italic text-[13px]">
                  This isn't guesswork. It's experience — applied properly.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 3. CAPABILITIES ════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-32 sm:py-44 lg:py-56 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-24 sm:mb-32">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">What We Build</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground mb-8">
                  Capabilities
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={200}>
                <p className="text-sm text-muted-foreground/50 max-w-sm mx-auto leading-[1.9]">
                  Projects range from focused infrastructure builds<br />
                  to fully integrated property systems.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-x-20 md:gap-y-20">
              {CAPABILITIES.map((item, i) => (
                <RevealOnScroll key={item.title} direction="up" stagger={i} staggerInterval={100}>
                  <Link to={item.href} className="group block">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 mt-1 w-11 h-11 flex items-center justify-center border border-border/40 bg-card/50">
                        <item.Icon
                          size={26}
                          className="text-accent/35 group-hover:text-accent/70 transition-colors duration-700"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[9px] font-mono tracking-[0.3em] text-accent/20 uppercase">{item.num}</p>
                        <h3 className="font-serif text-base sm:text-lg font-medium text-foreground group-hover:text-accent transition-colors duration-700 tracking-[0.02em]">
                          {item.title}
                          {(item as any).suffix && (
                            <span className="text-accent/30 text-sm ml-2 font-sans font-normal">({(item as any).suffix})</span>
                          )}
                        </h3>
                        <p className="text-[13px] text-muted-foreground/50 leading-[1.8] max-w-sm">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. GROUNDLOCK™ — System Intelligence ══════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-32 sm:py-44 lg:py-56 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <div className="space-y-8">
                <RevealOnScroll direction="up">
                  <div className="flex items-center gap-3 mb-4">
                    <Layers className="w-4 h-4 text-accent/60" strokeWidth={1.25} />
                    <span className="text-overline">Proprietary System</span>
                  </div>
                  <h2 className="heading-section text-foreground mb-3">
                    P.E. GroundLock™
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/30 mb-8">
                    Ground Stabilisation Systems
                  </p>
                  <div className="space-y-5 text-sm text-muted-foreground/55 leading-[1.9]">
                    <p>
                      Specified where required to ensure structural integrity
                      and consistent surface performance.
                    </p>
                    <p className="text-accent/60 font-medium italic text-[13px]">
                      Most properties fail from the ground up.
                      We start where it matters.
                    </p>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={150}>
                  <Button asChild variant="gold" size="default">
                    <Link to="/groundlock">
                      Explore the System <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </RevealOnScroll>
              </div>
              <RevealOnScroll direction="up" delay={200}>
                <InteractiveLayerStack />
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. HOW WE THINK — Engineering Philosophy ═════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-32 sm:py-44 lg:py-56 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-24 sm:mb-32">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-20 md:gap-y-16">
              {PHILOSOPHY.map((item, i) => (
                <RevealOnScroll key={item.num} direction="up" stagger={i} staggerInterval={120}>
                  <div className="group">
                    <p className="text-[9px] font-mono tracking-[0.3em] text-accent/20 uppercase mb-4">{item.num}</p>
                    <h3 className="font-serif text-base sm:text-lg font-medium text-foreground tracking-[0.02em] mb-4">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground/45 leading-[1.9]">
                      {item.body}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. PROCESS ═════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-28 sm:py-40 bg-card relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">How It Works</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Process
                </h2>
              </RevealOnScroll>
            </div>

            <div className="space-y-0">
              {PROCESS_STEPS.map((step, i) => (
                <RevealOnScroll key={step.num} direction="up" stagger={i} staggerInterval={80}>
                  <div className="flex items-start gap-6 py-8 border-b border-border/20 last:border-b-0">
                    <p className="text-[9px] font-mono tracking-[0.3em] text-accent/30 uppercase pt-1 w-8 shrink-0">{step.num}</p>
                    <div>
                      <h3 className="font-serif text-base font-medium text-foreground tracking-[0.02em] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[13px] text-muted-foreground/45 leading-[1.8]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="up" delay={400}>
              <p className="text-center mt-16 text-[11px] text-muted-foreground/30 italic leading-relaxed">
                Following assessment, a structured project brief<br />
                and system specification is prepared.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 7. SELECTED WORK ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-32 sm:py-44 lg:py-56 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">Portfolio</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground mb-6">
                  Selected Work
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={200}>
                <p className="text-sm text-muted-foreground/45 max-w-md mx-auto leading-[1.8]">
                  A selection of outcomes that demonstrate long-term value.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {PORTFOLIO.map((item, i) => (
                <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={100}>
                  <Link to={`/project/${item.slug}`} className="group relative aspect-[3/4] overflow-hidden block">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-accent/70 font-medium mb-2">{item.type}</p>
                      <p className="text-sm font-serif text-foreground/80 group-hover:text-foreground transition-colors duration-500">{item.label}</p>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="up" delay={400}>
              <div className="text-center mt-16">
                <Button asChild variant="outline-light" size="default">
                  <Link to="/gallery">View Selected Works <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 8. TESTIMONIAL ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-32 sm:py-44 lg:py-52 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-2xl mx-auto text-center relative z-10">
            <RevealLine className="mx-auto mb-14" width="w-10" />
            <RevealOnScroll direction="scale" duration={1000}>
              <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground/90 italic leading-[1.5] tracking-[0.01em]">
                "His knowledge of horses
                convinced us immediately —
                this isn't just construction to him,
                it's his passion."
              </blockquote>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="mt-10 flex flex-col items-center gap-2">
                <div className="w-8 h-px bg-accent/30" />
                <p className="mt-4 text-xs text-muted-foreground/40 tracking-[0.15em] uppercase">
                  Tom & Linda Hartley — Private Estate, Flinders
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 9. EQUUS RIDGE TEASER ═════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-28 sm:py-36 lg:py-44 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--accent) / 0.02) 0%, transparent 70%)" }}
          />
          <div className="section-container max-w-md mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-12" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={100}>
              <p className="text-overline text-accent/40 mb-6">Coming Soon</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <h2 className="heading-editorial text-foreground/80 mb-8">
                Equus Ridge
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={300}>
              <p className="text-sm text-muted-foreground/35 leading-[2] max-w-xs mx-auto">
                The future home of Peninsula Equine —
                where design, performance, and environment converge.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 10. FINAL CTA ═══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <SectionDivider variant="grid" />
        <div className="py-32 sm:py-44 lg:py-56 relative">
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 20%, hsl(222 20% 3% / 0.5) 100%)" }}
          />

          <div className="section-container relative z-10 text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-6">
                Start With a<br />Site Assessment
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/40 mb-10 leading-[1.8] max-w-sm mx-auto">
                Each project is assessed individually to ensure correct system
                specification and long-term performance.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Button asChild variant="gold" size="lg">
                  <Link to="/contact">
                    Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline-light" size="lg">
                  <Link to="/groundlock">Explore GroundLock</Link>
                </Button>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={350}>
              <p className="text-muted-foreground/20 text-[10px] tracking-[0.2em] uppercase">
                Currently accepting select projects.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
