import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import equusRidgeHero from "@/assets/equus-ridge-hero.jpg";

const FRAGMENTS = ["Performance", "Community", "Land", "Experience"];

const EquusRidge = () => {
  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={equusRidgeHero}
            alt="Luxury equine estate at golden hour"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            style={{ filter: "brightness(0.92) contrast(1.12) saturate(1.08)" }}
          />
          <div className="absolute inset-0 bg-background/40" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <p
            className="text-[10px] font-mono uppercase tracking-[0.35em] text-muted-foreground/30 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Equus Ridge
          </p>
          <h1
            className="heading-display text-foreground mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            A new standard for<br />equine experience.
          </h1>
          <p
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "1200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Coming soon.
          </p>
        </div>
      </section>

      {/* ═══ FRAGMENTS ═══════════════════════════════════ */}
      <section className="py-36 sm:py-48 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-xs mx-auto relative z-[1]">
          <div className="space-y-10">
            {FRAGMENTS.map((word, i) => (
              <RevealOnScroll key={word} direction="up" delay={i * 150}>
                <p className="text-[13px] text-primary-foreground/35 tracking-[0.2em] uppercase font-mono text-center">
                  {word}
                </p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MORE THAN A LOCATION ════════════════════════ */}
      <section className="py-36 sm:py-48 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/20 mx-auto mb-14" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <p className="font-serif text-xl sm:text-2xl text-foreground/55 italic tracking-wide leading-[1.4] text-center mb-16">
              More than a location.
            </p>
          </RevealOnScroll>

          <div className="space-y-6">
            {[
              "Built environments",
              "Live performance",
              "Community",
              "High-level equine events",
            ].map((item, i) => (
              <RevealOnScroll key={item} direction="up" delay={200 + i * 100}>
                <p className="flex items-center gap-4 text-[13px] text-foreground/35 leading-[1.7]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/25 shrink-0" />
                  {item}
                </p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL LINE ══════════════════════════════════ */}
      <section className="py-36 sm:py-48 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <p className="font-serif text-xl sm:text-2xl text-primary-foreground/45 italic tracking-wide leading-[1.4] mb-6">
              This is where it all comes together.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <p className="font-serif text-lg sm:text-xl text-primary-foreground/55 italic tracking-wide leading-[1.4] mb-14">
              Built on the same principles. Expanded.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={500}>
            <Button asChild variant="ghost" size="sm" className="text-primary-foreground/20 hover:text-primary-foreground/40 text-[10px] uppercase tracking-[0.25em] font-mono">
              <Link to="/contact">Register Interest</Link>
            </Button>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
};

export default EquusRidge;
