import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Shield, Wrench } from "lucide-react";
import { GROUNDLOCK_PRODUCTS, GROUNDLOCK_ADDONS, GROUNDLOCK_TIERS } from "@/data/groundlockProducts";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export default function Shop() {
  return (
    <Layout>
      {/* ─── SECTION 1 — INTRO ─── */}
      <section className="relative pt-44 sm:pt-56 pb-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />

        <div className="section-container relative z-10 text-center max-w-xl mx-auto flex flex-col items-center gap-6">
          <div
            className="flex items-center gap-5 opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            <div className="w-8 h-px bg-accent/30" />
            <Layers className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/60">Equus Forge</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            System Access
          </h1>

          <p
            className="text-sm text-muted-foreground/40 max-w-md mx-auto opacity-0 animate-fade-in leading-[1.9]"
            style={{ animationDelay: "1000ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            We don't sell products.<br />
            We provide access to systems and components used across our builds.
          </p>
        </div>
      </section>

      {/* ─── SECTION 2 — SYSTEM TIERS ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />

          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="text-center max-w-md mx-auto mb-16 space-y-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/50">GroundLock™</p>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground/90">
                  System Integration Levels
                </h2>
                <p className="text-sm text-muted-foreground/35 leading-[1.9]">
                  The level of ground stabilisation is matched to the project — not sold as a standalone product.
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-px bg-border/20 max-w-4xl mx-auto">
              {GROUNDLOCK_PRODUCTS.map((product, i) => {
                const tierMeta = GROUNDLOCK_TIERS[product.tier];
                const isPro = product.tier === "performance";

                return (
                  <RevealOnScroll key={product.handle} direction="up" delay={i * 150}>
                    <div className={`flex flex-col bg-card p-8 md:p-10 h-full ${isPro ? "ring-1 ring-accent/15" : ""}`}>
                      {/* Tier label */}
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/50 mb-3">
                        {tierMeta.label}
                      </p>

                      <h3 className="font-serif text-lg md:text-xl text-foreground/80 mb-2">
                        {product.title}
                      </h3>

                      <p className="text-[13px] text-muted-foreground/35 leading-[1.8] mb-6 flex-1">
                        {tierMeta.description}
                      </p>

                      {/* Key includes — max 4 */}
                      <ul className="space-y-2.5 mb-8">
                        {product.includes.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-1 h-1 rounded-full bg-accent/30 mt-2 shrink-0" />
                            <span className="text-xs text-muted-foreground/40 leading-[1.7]">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        to={`/shop/${product.handle}`}
                        className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-accent/50 hover:text-accent transition-colors group"
                      >
                        View Specification
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — SYSTEM EXTENSIONS ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-background relative">
          <div className="absolute inset-0 grain-texture" />

          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="text-center max-w-md mx-auto mb-16 space-y-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/50">Components</p>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground/90">
                  System Extensions
                </h2>
                <p className="text-sm text-muted-foreground/35 leading-[1.9]">
                  Integrated as part of the system specification — not sold separately.
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {GROUNDLOCK_ADDONS.map((addon, i) => (
                <RevealOnScroll key={addon.handle} direction="up" delay={i * 120}>
                  <div className="space-y-4">
                    <Wrench className="w-4 h-4 text-accent/30" strokeWidth={1.25} />
                    <h3 className="font-serif text-base text-foreground/80">{addon.title}</h3>
                    <p className="text-[13px] text-muted-foreground/35 leading-[1.8]">
                      {addon.description}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 — TRUST + ACCESS CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />

          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="text-center max-w-md mx-auto flex flex-col items-center gap-8">
                {/* Trust markers */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {[
                    "Used in every Peninsula Equine build",
                    "Engineered for decades, not seasons",
                    "Project-assessed before specification",
                  ].map((line) => (
                    <div key={line} className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-accent/30" strokeWidth={1.5} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/30">
                        {line}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="w-12 h-px bg-accent/15" />

                <p className="text-sm text-muted-foreground/40 leading-[1.9] max-w-sm">
                  System access begins with a site assessment.<br />
                  We review conditions, usage, and requirements before recommending specification.
                </p>

                <Button
                  asChild
                  variant="gold"
                  size="lg"
                  className="uppercase tracking-[0.12em] text-xs"
                >
                  <Link to="/site-assessment">
                    Request Site Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/20">
                  No obligation. No pricing until specification is confirmed.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
