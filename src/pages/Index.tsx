import { useEffect, useRef, useState, useCallback } from "react";
import { useCursorSpotlight } from "@/hooks/useCursorSpotlight";
import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Hero
import peBrandSplitHero from "@/assets/pe-brand-split-hero.png";

// Portfolio — let the work speak
import aberdeenStonework from "@/assets/aberdeen-stonework-color.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import equitanaArena from "@/assets/equitana-arena-1.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";

const PORTFOLIO = [
  { src: aberdeenStonework, alt: "Hand-laid stonework at Aberdeen Farm", label: "Aberdeen Farm — Stonework" },
  { src: mainRidgeInterior, alt: "Timber interior at Main Ridge", label: "Main Ridge — Interior" },
  { src: qldCourtyard, alt: "Queensland facility courtyard", label: "Queensland — Courtyard" },
  { src: mainRidgeCiroWoodwork, alt: "Ciro hand-crafting timber joinery", label: "Main Ridge — Woodwork" },
  { src: equitanaArena, alt: "Competition arena at Equitana", label: "Equitana — Arena" },
  { src: aberdeenBarnInterior, alt: "Barn interior at Aberdeen Farm", label: "Aberdeen — Barn Interior" },
];

/* ── Parallax hero image hook ─────────────────────── */
function useHeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const img = el.querySelector<HTMLImageElement>("[data-parallax-hero]");
        if (img) img.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.05)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

/* ── Magnetic hover for portfolio cards ───────────── */
function PortfolioCard({ item, index }: { item: typeof PORTFOLIO[0]; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setTilt({ x: -y, y: x });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <RevealOnScroll direction="up" stagger={index} staggerInterval={120} duration={800}>
      <Link
        ref={cardRef}
        to="/gallery"
        className="group relative aspect-[4/3] overflow-hidden rounded-lg block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 && tilt.y === 0
            ? "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "transform 100ms ease-out",
        }}
      >
        <img
          src={item.src}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient reveal on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Label — slides up on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
        >
          <div className="w-6 h-px bg-accent mb-2 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground font-medium">
            {item.label}
          </p>
        </div>

        {/* Corner accent — architectural detail */}
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-accent/0 group-hover:border-accent/50 transition-all duration-500 delay-200" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-accent/0 group-hover:border-accent/50 transition-all duration-500 delay-200" />
      </Link>
    </RevealOnScroll>
  );
}

/* ── Hero text character stagger ──────────────────── */
function StaggerText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
        >
          <span
            className="inline-block animate-fade-in-up"
            style={{
              animationDelay: `${delay + i * 80}ms`,
              animationFillMode: "both",
            }}
          >
            {word}{i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function Index() {
  const heroRef = useHeroParallax();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const ctaRef = useRef<HTMLElement>(null);
  useCursorSpotlight(ctaRef);

  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[94vh] overflow-hidden flex items-center">
        <img
          data-parallax-hero
          src={peBrandSplitHero}
          alt="Peninsula Equine"
          className="absolute inset-0 h-[120%] w-full object-cover will-change-transform"
          onLoad={() => setHeroLoaded(true)}
        />
        <div className="absolute inset-0 bg-primary/60" />
        <BlueprintScene
          preset="hero"
          className="absolute inset-0"
          gradient="linear-gradient(180deg, hsl(var(--primary) / 0.02), hsl(var(--primary) / 0.55))"
        />

        {/* Architectural grid lines — subtle background texture */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-[20%] w-px h-full bg-accent/[0.04]" />
          <div className="absolute top-0 left-[40%] w-px h-full bg-accent/[0.03]" />
          <div className="absolute top-0 left-[60%] w-px h-full bg-accent/[0.04]" />
          <div className="absolute top-0 left-[80%] w-px h-full bg-accent/[0.03]" />
        </div>

        <div className="relative z-10 section-container text-primary-foreground">
          <div className="max-w-2xl space-y-7">
            {heroLoaded && (
              <>
                <div
                  className="flex items-center gap-4 opacity-0 animate-fade-in"
                  style={{ animationDelay: "200ms", animationFillMode: "both" }}
                >
                  <div className="w-10 h-px bg-accent" />
                  <p className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.35em] uppercase text-accent">
                    Peninsula Equine
                  </p>
                </div>

                <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] leading-[1.02]">
                  <StaggerText text="From Dirt" delay={400} />
                  <br />
                  <StaggerText text="to Dynasty." delay={600} />
                </h1>

                <p
                  className="text-lg text-primary-foreground/65 max-w-md leading-relaxed opacity-0 animate-fade-in"
                  style={{ animationDelay: "900ms", animationFillMode: "both" }}
                >
                  Built by a horseman. Trusted by word of mouth.
                </p>

                <div
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: "1100ms", animationFillMode: "both" }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs btn-hover-lift"
                  >
                    <Link to="/contact">
                      Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style={{ animationDelay: "1500ms", animationFillMode: "both" }}>
          <span className="text-[9px] uppercase tracking-[0.3em] text-primary-foreground/30 font-sans">Scroll</span>
          <div className="w-px h-8 bg-accent/30 relative overflow-hidden">
            <div className="absolute top-0 w-full h-3 bg-accent animate-[scrollPulse_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ─── Portfolio grid — the work speaks ─────────── */}
      <section className="py-24 sm:py-32">
        <div className="section-container max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-lg mx-auto">
            <RevealLine className="mx-auto mb-7" width="w-12" />
            <RevealOnScroll direction="up" delay={100}>
              <h2 className="heading-section text-foreground mb-3">The Work</h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <p className="text-muted-foreground text-sm leading-relaxed">
                No advertising. No marketing. Every project came from a recommendation.
              </p>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PORTFOLIO.map((item, i) => (
              <PortfolioCard key={i} item={item} index={i} />
            ))}
          </div>

          <RevealOnScroll direction="up" delay={300}>
            <div className="text-center mt-12">
              <Button
                asChild
                variant="outline"
                className="border-border hover:border-accent/40 hover:bg-accent/5 uppercase tracking-[0.1em] text-xs btn-hover-lift"
              >
                <Link to="/gallery">
                  View Full Portfolio <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Testimonial — quiet confidence ──────────── */}
      <section className="py-24 bg-card border-y border-border relative overflow-hidden">
        {/* Subtle architectural lines */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-[15%] w-px h-full bg-border/50" />
          <div className="absolute top-0 right-[15%] w-px h-full bg-border/50" />
        </div>

        <div className="section-container max-w-2xl mx-auto text-center relative z-10">
          <RevealLine className="mx-auto mb-10" width="w-12" />
          <RevealOnScroll direction="scale" duration={900}>
            <blockquote className="font-serif text-xl sm:text-2xl text-foreground italic leading-relaxed">
              "We interviewed six contractors before choosing Ciro. His knowledge of horses
              convinced us immediately—this isn't just construction to him, it's his passion."
            </blockquote>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="mt-7 text-sm text-muted-foreground tracking-wide">
              Tom &amp; Linda Hartley — Private Estate, Flinders
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── Philosophy pillars ─────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="section-container max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <RevealLine className="mx-auto mb-7" width="w-12" />
            <RevealOnScroll direction="up" delay={100}>
              <h2 className="heading-section text-foreground mb-3">How We Build</h2>
            </RevealOnScroll>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-16 gap-y-12">
            {[
              { n: "01", title: "Design for the Horse", desc: "Every decision begins with the animal. Sight lines, ventilation, footing—engineered for how horses actually live." },
              { n: "02", title: "Build for Generations", desc: "Hand-set stonework, kiln-dried hardwood, marine-grade hardware. Our facilities outlast the trends." },
              { n: "03", title: "Respect the Land", desc: "We read the property before we draw a line. Drainage, winds, soil—the land tells you where to build." },
              { n: "04", title: "Craft Over Convenience", desc: "Mortise-and-tenon where bolts would do. Stone foundations where concrete would suffice. The details matter most." },
            ].map((p, i) => (
              <RevealOnScroll key={p.n} direction="up" stagger={i} staggerInterval={150}>
                <div className="group">
                  <p className="text-[10px] font-mono tracking-[0.25em] text-accent/50 mb-2 transition-colors group-hover:text-accent/80">{p.n}</p>
                  <h3 className="font-serif text-lg font-semibold mb-2 transition-colors group-hover:text-accent">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />

        {/* Architectural frame lines */}
        <div className="absolute inset-8 border border-accent/[0.06] pointer-events-none" aria-hidden="true" />

        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-6">
          <RevealLine className="mx-auto mb-2" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground">
              Let's build something that lasts.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <p className="text-primary-foreground/45 text-sm">
              Free on-site consultation. No obligation.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.14em] text-xs btn-hover-lift"
            >
              <Link to="/contact">
                Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
