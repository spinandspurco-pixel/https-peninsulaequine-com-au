import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Wrench, Shield } from "lucide-react";
import { GROUNDLOCK_PRODUCTS, GROUNDLOCK_ADDONS, GROUNDLOCK_TIERS } from "@/data/groundlockProducts";
import { BlueprintScene } from "@/components/BlueprintScene";

const TRUST_POINTS = [
  "Engineered by Peninsula Equine",
  "Same systems used in managed builds",
  "Designed to last decades, not seasons",
];

export default function Shop() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-primary/75" />
        <BlueprintScene preset="elevation" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/60 mb-2">Product Division</p>
          <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Equus Forge
          </h1>
          <p className="text-primary-foreground/25 text-[11px] uppercase tracking-[0.2em] mb-2">by Peninsula Equine</p>
          <p className="text-primary-foreground/70 text-lg max-w-md mx-auto">
            Engineered Ground Systems. Configured to Perform.
          </p>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-6 border-b border-border bg-card/50">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.7} />
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/60">GroundLock™ Systems</p>
            <h2 className="font-serif text-2xl md:text-3xl">System Integration Levels</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Every Peninsula Equine build includes engineered ground stabilisation. The level of integration is matched to your project.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {GROUNDLOCK_PRODUCTS.map((product) => {
              const tierMeta = GROUNDLOCK_TIERS[product.tier];
              const isPro = product.tier === "performance";
              const isComplete = product.tier === "estate";

              return (
                <div
                  key={product.handle}
                  className={`relative flex flex-col border rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 ${
                    isPro
                      ? "border-accent bg-card ring-1 ring-accent/20"
                      : isComplete
                      ? "border-accent/40 bg-card"
                      : "border-border bg-card"
                  }`}
                >
                  {product.badge && (
                    <div className={`absolute top-0 right-0 text-[9px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 ${
                      isPro
                        ? "bg-accent text-accent-foreground"
                        : "bg-foreground/10 text-foreground/60"
                    }`}>
                      {product.badge}
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex-1 space-y-5">
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/60">
                        {tierMeta.label} Configuration
                      </p>
                      <h3 className="font-serif text-xl md:text-2xl">{product.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{product.headline}</p>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground italic">
                        Specified per project
                      </p>
                    </div>

                    <ul className="space-y-2 pt-2">
                      {product.includes.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                      {product.includes.length > 5 && (
                        <li className="text-xs text-accent pl-5">
                          + {product.includes.length - 5} more included
                        </li>
                      )}
                    </ul>

                    {/* Trust line */}
                    <p className="text-[11px] text-muted-foreground/40 italic leading-relaxed pt-1">
                      {product.trustLine}
                    </p>
                  </div>

                  <div className="p-6 md:p-8 pt-0 space-y-3">
                    <Button asChild className={`w-full uppercase tracking-[0.12em] text-xs ${isPro ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}`} size="lg">
                      <Link to={`/shop/${product.handle}`}>
                        View System <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full text-xs text-muted-foreground hover:text-accent" size="sm">
                      <Link to="/site-assessment">Get Build Ready</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-Ons Strip */}
      <section className="py-16 bg-card border-y border-border">
        <div className="section-container">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/60">Optional</p>
            <h2 className="font-serif text-xl md:text-2xl">System Add-Ons</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {GROUNDLOCK_ADDONS.map((addon) => (
              <div key={addon.handle} className="border border-border rounded-sm p-6 space-y-3 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 text-accent">
                  <Wrench className="w-4 h-4" strokeWidth={1.7} />
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em]">{addon.subtitle}</p>
                </div>
                <h3 className="font-serif text-lg">{addon.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{addon.description}</p>
                <p className="text-sm text-muted-foreground/60 italic">Available on request</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-System CTA */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/40">Beyond the system</p>
          <h2 className="font-serif text-2xl md:text-3xl">
            Ready for a full <span className="text-accent">managed build?</span>
          </h2>
          <p className="text-primary-foreground/60 text-sm max-w-md mx-auto">
            GroundLock™ integrates with Peninsula Equine's arena, stable, and infrastructure services. Move from system to project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs">
              <Link to="/contact">
                Request Specification <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-accent/30 text-accent hover:bg-accent/10 uppercase tracking-[0.12em] text-xs">
              <Link to="/services">
                Explore Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
