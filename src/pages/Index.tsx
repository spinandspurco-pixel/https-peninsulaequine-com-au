import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
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

export default function Index() {
  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-[92vh] overflow-hidden flex items-center">
        <img
          src={peBrandSplitHero}
          alt="Peninsula Equine"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/65" />
        <BlueprintScene
          preset="hero"
          className="absolute inset-0"
          gradient="linear-gradient(180deg, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.5))"
        />

        <div className="relative z-10 section-container text-primary-foreground">
          <div className="max-w-2xl space-y-6">
            <p className="text-overline text-accent tracking-[0.3em]">Peninsula Equine</p>
            <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] leading-[1.05]">
              From Dirt<br />to Dynasty.
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-md leading-relaxed">
              Built by a horseman. Trusted by word of mouth.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.12em] text-xs"
            >
              <Link to="/contact">
                Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Portfolio grid — the work speaks ─────────── */}
      <section className="py-20">
        <div className="section-container max-w-6xl mx-auto">
          <div className="text-center mb-14 max-w-lg mx-auto">
            <div className="w-10 h-px bg-accent mx-auto mb-6" />
            <h2 className="heading-section text-foreground mb-3">The Work</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No advertising. No marketing. Every project came from a recommendation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PORTFOLIO.map((item, i) => (
              <Link
                key={i}
                to="/gallery"
                className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="absolute bottom-4 left-4 right-4 text-xs tracking-[0.15em] uppercase text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-lg">
                  {item.label}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              asChild
              variant="outline"
              className="border-border hover:border-accent/40 hover:bg-accent/5 uppercase tracking-[0.1em] text-xs"
            >
              <Link to="/gallery">
                View Full Portfolio <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Single testimonial — quiet confidence ───── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="section-container max-w-2xl mx-auto text-center">
          <div className="w-10 h-px bg-accent mx-auto mb-8" />
          <blockquote className="font-serif text-xl sm:text-2xl text-foreground italic leading-relaxed">
            "We interviewed six contractors before choosing Ciro. His knowledge of horses
            convinced us immediately—this isn't just construction to him, it's his passion."
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground tracking-wide">
            Tom &amp; Linda Hartley — Private Estate, Flinders
          </p>
        </div>
      </section>

      {/* ─── Philosophy pillars — text only, minimal ─── */}
      <section className="py-20">
        <div className="section-container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="w-10 h-px bg-accent mx-auto mb-6" />
            <h2 className="heading-section text-foreground mb-3">How We Build</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { n: "01", title: "Design for the Horse", desc: "Every decision begins with the animal. Sight lines, ventilation, footing—engineered for how horses actually live." },
              { n: "02", title: "Build for Generations", desc: "Hand-set stonework, kiln-dried hardwood, marine-grade hardware. Our facilities outlast the trends." },
              { n: "03", title: "Respect the Land", desc: "We read the property before we draw a line. Drainage, winds, soil—the land tells you where to build." },
              { n: "04", title: "Craft Over Convenience", desc: "Mortise-and-tenon where bolts would do. Stone foundations where concrete would suffice. The details matter most." },
            ].map((p) => (
              <div key={p.n}>
                <p className="text-[10px] font-mono tracking-[0.25em] text-accent/50 mb-2">{p.n}</p>
                <h3 className="font-serif text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-5">
          <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground">
            Let's build something that lasts.
          </h2>
          <p className="text-primary-foreground/50 text-sm">
            Free on-site consultation. No obligation.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs"
          >
            <Link to="/contact">
              Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
