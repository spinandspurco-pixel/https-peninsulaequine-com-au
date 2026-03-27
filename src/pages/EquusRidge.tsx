import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
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
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <p
            className="text-[10px] font-mono uppercase tracking-[0.35em] text-muted-foreground/30 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Equus Ridge
          </p>
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground/90 tracking-tight leading-[1.05] mb-6 opacity-0 animate-fade-in"
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

      {/* ═══ FINAL LINE ══════════════════════════════════ */}
      <section className="py-36 sm:py-48 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/20 mx-auto mb-14" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="font-serif text-xl sm:text-2xl text-foreground/50 italic tracking-wide leading-[1.4]">
              Built on the same principles.<br />Expanded.
            </p>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
};

export default EquusRidge;
