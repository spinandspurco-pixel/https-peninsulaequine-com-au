import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, ArrowRight, Shield, Layers } from "lucide-react";
import { getProductByHandle, getAddOnsByTier, GROUNDLOCK_TIERS, type GroundLockProduct } from "@/data/groundlockProducts";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const product = handle ? getProductByHandle(handle) : undefined;

  if (!product) {
    return (
      <Layout>
        <div className="min-h-[60vh] pt-44 text-center space-y-4">
          <h2 className="font-serif text-2xl text-foreground/80">System not found</h2>
          <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-accent/50 hover:text-accent transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to System Access
          </Link>
        </div>
      </Layout>
    );
  }

  const tierMeta = GROUNDLOCK_TIERS[product.tier];
  const addOns = getAddOnsByTier(product.tier);

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className="relative pt-44 sm:pt-52 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />

        <div className="section-container relative z-10 text-center max-w-xl mx-auto flex flex-col items-center gap-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30 hover:text-accent/50 transition-colors opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <ArrowLeft className="w-3 h-3" /> System Access
          </Link>

          <div
            className="flex items-center gap-5 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            <div className="w-8 h-px bg-accent/30" />
            <Layers className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/50">{tierMeta.label} Specification</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            {product.title}
          </h1>

          <p
            className="text-sm text-muted-foreground/40 max-w-md mx-auto opacity-0 animate-fade-in leading-[1.9]"
            style={{ animationDelay: "1000ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            {product.headline}
          </p>
        </div>
      </section>

      {/* ─── PROBLEM / SOLUTION ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] max-w-3xl mx-auto">
            <RevealOnScroll direction="up">
              <div className="grid md:grid-cols-2 gap-16">
                <div className="space-y-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30">The Problem</p>
                  <p className="text-[13px] text-muted-foreground/35 leading-[1.9]">{product.problem}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/50">The Solution</p>
                  <p className="text-[13px] text-foreground/60 leading-[1.9]">{product.solution}</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ─── SYSTEM SPECIFICATION ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-background relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] max-w-3xl mx-auto">
            <RevealOnScroll direction="up">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/50 mb-3">System Specification</p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground/90 mb-12">What's Included</h2>

              <ul className="space-y-4">
                {product.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1 h-1 rounded-full bg-accent/30 mt-2.5 shrink-0" />
                    <span className="text-[13px] text-muted-foreground/40 leading-[1.8]">{item}</span>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ─── TECHNICAL OVERVIEW ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] max-w-3xl mx-auto">
            <RevealOnScroll direction="up">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/50 mb-3">Technical Overview</p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground/90 mb-12">System Specifications</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/15">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="bg-card p-6 md:p-8 space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30">{spec.label}</p>
                    <p className="font-serif text-base text-accent/70">{spec.value}</p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ─── SYSTEM EXTENSIONS (if any) ─── */}
      {addOns.length > 0 && (
        <section className="relative overflow-hidden">
          <div className="divider-grid" />
          <div className="py-24 sm:py-32 bg-background relative">
            <div className="absolute inset-0 grain-texture" />
            <div className="section-container relative z-[1] max-w-3xl mx-auto">
              <RevealOnScroll direction="up">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/50 mb-3">Extended Integration</p>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground/90 mb-12">System Extensions</h2>

                <div className="space-y-8">
                  {addOns.map((addon) => (
                    <div key={addon.handle} className="space-y-3">
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent/40">{addon.subtitle}</p>
                      <h3 className="font-serif text-lg text-foreground/80">{addon.title}</h3>
                      <p className="text-[13px] text-muted-foreground/35 leading-[1.8]">{addon.description}</p>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-36 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="text-center max-w-md mx-auto flex flex-col items-center gap-8">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30">Next Step</p>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground/85">
                  Start With a Site Assessment
                </h2>

                <p className="text-sm text-muted-foreground/40 leading-[1.9] max-w-sm">
                  We assess ground conditions, usage patterns, and load requirements — then recommend the right system specification for your project.
                </p>

                <Button
                  asChild
                  variant="gold"
                  size="lg"
                  className="uppercase tracking-[0.12em] text-xs"
                >
                  <Link to="/site-assessment">
                    {product.ctaPrimary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/20">
                  No obligation · Specification confirmed during assessment
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ─── TRUST LINE ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-16 bg-background relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/25 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3 text-muted-foreground/20" strokeWidth={1.5} />
              {product.trustLine}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
