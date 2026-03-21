import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, Zap, Wrench } from "lucide-react";
import { getProductByHandle, getAddOnsByTier, GROUNDLOCK_TIERS, type GroundLockProduct } from "@/data/groundlockProducts";
import { BlueprintScene } from "@/components/BlueprintScene";

function TierBadge({ tier }: { tier: GroundLockProduct["tier"] }) {
  const t = GROUNDLOCK_TIERS[tier];
  return (
    <span className="inline-block px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-[0.2em] border border-accent/30 text-accent">
      {t.label}
    </span>
  );
}

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const product = handle ? getProductByHandle(handle) : undefined;

  if (!product) {
    return (
      <Layout>
        <div className="text-center min-h-[60vh] pt-32 space-y-4">
          <h2 className="font-serif text-2xl">System not found</h2>
          <Button asChild variant="outline">
            <Link to="/shop"><ArrowLeft className="w-4 h-4 mr-2" />Back to Equus Forge</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const addOns = getAddOnsByTier(product.tier);
  const isPerformance = product.tier === "performance";
  const isEstate = product.tier === "estate";

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
        <BlueprintScene preset="elevation" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary" />
        <div className="section-container relative z-10 max-w-3xl mx-auto text-center space-y-5">
          <Link to="/shop" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors uppercase tracking-[0.15em]">
            <ArrowLeft className="w-3 h-3" />Equus Forge
          </Link>
          <div className="flex items-center justify-center gap-3">
            <TierBadge tier={product.tier} />
            {product.badge && (
              <span className={`inline-block px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-[0.2em] ${
                isPerformance ? "bg-accent text-accent-foreground" : "bg-foreground/10 text-foreground/60"
              }`}>
                {product.badge}
              </span>
            )}
          </div>
          <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            {product.title}
          </h1>
          <p className="text-primary-foreground/50 text-xs uppercase tracking-[0.2em]">{product.subtitle}</p>
          <p className="text-primary-foreground/75 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            {product.headline}
          </p>
        </div>
      </section>

      {/* Trust Line */}
      <section className="py-5 border-b border-border bg-card/50">
        <div className="section-container text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} />
            {product.trustLine}
          </p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 border-b border-border">
        <div className="section-container max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <Zap className="w-4 h-4" strokeWidth={1.5} />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]">The Problem</p>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">{product.problem}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <Shield className="w-4 h-4" strokeWidth={1.5} />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]">The Solution</p>
            </div>
            <p className="text-foreground leading-relaxed text-sm">{product.solution}</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-card border-b border-border">
        <div className="section-container max-w-4xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/60 mb-3">System Specification</p>
          <h2 className="font-serif text-2xl md:text-3xl mb-10">What's Included</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
            {product.includes.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-20 border-b border-border">
        <div className="section-container max-w-4xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/60 mb-3">Technical Overview</p>
          <h2 className="font-serif text-2xl md:text-3xl mb-10">System Specifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {product.specs.map((spec) => (
              <div key={spec.label} className="bg-card border border-border rounded-sm p-5 text-center space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{spec.label}</p>
                <p className="font-serif text-lg text-accent">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Extensions */}
      {addOns.length > 0 && (
        <section className="py-20 bg-card border-b border-border">
          <div className="section-container max-w-4xl mx-auto">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/60 mb-3">Extended Integration</p>
            <h2 className="font-serif text-2xl md:text-3xl mb-10">System Extensions</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {addOns.map((addon) => (
                <div key={addon.handle} className="border border-border rounded-sm p-6 space-y-3 hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-2 text-accent">
                    <Wrench className="w-4 h-4" strokeWidth={1.5} />
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em]">{addon.subtitle}</p>
                  </div>
                  <h3 className="font-serif text-lg">{addon.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{addon.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Site Assessment CTA */}
      <section className="py-24 relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="section-container relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/60">Next Step</p>
          <p className="font-serif text-3xl md:text-4xl text-primary-foreground">
            Start With a Site Assessment
          </p>
          <p className="text-primary-foreground/60 text-sm max-w-md mx-auto">
            We assess ground conditions, usage patterns, and load requirements — then recommend the right system specification for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs">
              <Link to="/site-assessment">
                {product.ctaPrimary} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-primary-foreground/25 text-[10px] uppercase tracking-[0.2em] pt-4">
            System specification is determined during assessment · Integrated into your project scope
          </p>
        </div>
      </section>

      {/* Cross-System Flow */}
      <section className="py-16 border-t border-border">
        <div className="section-container max-w-3xl mx-auto text-center space-y-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Beyond the system</p>
          <h2 className="font-serif text-xl md:text-2xl">
            Need a full <span className="text-accent">managed build?</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            GroundLock™ systems integrate with Peninsula Equine's full arena, stable, and infrastructure builds. Move from product to project seamlessly.
          </p>
          <Button asChild variant="outline" size="lg" className="uppercase tracking-[0.12em] text-xs">
            <Link to="/services">
              Explore Peninsula Equine Services <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
