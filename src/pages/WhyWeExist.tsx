import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

export default function WhyWeExist() {
  return (
    <Layout>
      <div className="type-architectural">
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-36 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            <h1
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground/90 tracking-tight leading-[1.05]"
            >
              Most equine environments<br />are built to fail.
            </h1>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 1 — The Industry Norm ═══════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-8" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="text-overline mb-10">The Industry Norm</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <ul className="space-y-6">
              {[
                "Temporary fixes",
                "Poor drainage planning",
                "Surface failure under load",
                "Reactive maintenance cycles",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-[13px] text-foreground/40 leading-[1.7]">
                  <span className="w-5 h-px bg-foreground/10 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ SECTION 2 — Why We Built Differently ════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/25 mb-12" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="text-overline mb-10 text-accent/40">Why We Built Differently</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <ul className="space-y-6">
              {[
                "Long-term thinking",
                "Ground-first engineering",
                "System-led design",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-[13px] text-primary-foreground/55 leading-[1.7] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/35 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ SECTION 3 — The Outcome ═════════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-8" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="text-overline mb-10">The Outcome</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <ul className="space-y-6">
              {[
                "Surfaces that hold",
                "Reduced long-term cost",
                "Performance environments",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-[13px] text-foreground/55 leading-[1.7] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/30 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ FINAL LINE ══════════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <p className="font-serif text-xl sm:text-2xl md:text-3xl text-primary-foreground/60 italic tracking-wide leading-[1.3]">
              We didn't enter the industry.<br />We corrected it.
            </p>
          </RevealOnScroll>
        </div>
      </section>
      </div>
    </Layout>
  );
}
