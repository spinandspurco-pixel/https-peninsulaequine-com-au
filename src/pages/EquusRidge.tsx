import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import equusRidgeHero from "@/assets/equus-ridge-hero.jpg";
import coveredArenaBlackExterior from "@/assets/covered-arena-black-exterior.jpg";

const EquusRidge = () => {
  return (
    <Layout>
      {/* SECTION 1 — HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0">
          <img
            src={equusRidgeHero}
            alt="Luxury equine estate at golden hour — sculpted arena with rolling hills"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.35) contrast(1.1)" }}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <h1
            className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-foreground/95 tracking-tight leading-[1.05] mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both" }}
          >
            Equus Ridge
          </h1>
          <p
            className="text-sm sm:text-[15px] text-muted-foreground/50 leading-relaxed max-w-md mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "800ms", animationFillMode: "both" }}
          >
            A destination for design, performance, and environment.
          </p>
        </div>
      </section>

      {/* SECTION 2 — ATMOSPHERE (dark editorial, no video) */}
      <section className="py-44 sm:py-64 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.02]" />

        {/* Faint blueprint linework — single subtle brand callback */}
        <div className="absolute inset-0 opacity-[0.04]">
          <BlueprintLineOverlay variant="dimensions" color="light" />
        </div>

        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50 mb-10">
              Atmosphere
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground/90 leading-[1.25] mb-10">
              A Place Designed<br />
              to Work Properly
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <p className="text-sm sm:text-[15px] text-primary-foreground/40 leading-[2] max-w-md mx-auto">
              Every detail — from ground to structure —<br />
              is considered as part of a complete system.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 3 — PRIVATE VIEWING (static image + text) */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-3xl mx-auto relative z-[1]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Static editorial image */}
            <RevealOnScroll direction="up">
              <div className="aspect-[4/5] relative overflow-hidden bg-primary/5 border border-border/30">
                <img
                  src={coveredArenaBlackExterior}
                  alt="Completed barn exterior — Mornington Peninsula"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "brightness(0.7) contrast(1.05)" }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
            </RevealOnScroll>

            {/* Text */}
            <div>
              <RevealOnScroll direction="up" delay={100}>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/50 mb-8">
                  Private Viewing
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={200}>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground/90 leading-[1.25] mb-6">
                  Equus Ridge
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={300}>
                <p className="text-sm sm:text-[15px] text-muted-foreground/50 leading-[2] mb-8">
                  A first look at Equus Ridge.<br />
                  By invitation.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={400}>
                <div className="w-8 h-px bg-accent/30 mb-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={500}>
                <p className="text-xs text-muted-foreground/25 italic tracking-wide">
                  Not everything is built to last.<br />
                  This is.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EquusRidge;
