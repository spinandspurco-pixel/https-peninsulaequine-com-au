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
            What sits underneath determines how everything performs.
          </p>
          <p
            className="text-[13px] text-muted-foreground/30 max-w-md mx-auto opacity-0 animate-fade-in leading-[1.9]"
            style={{ animationDelay: "1300ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            We provide access to the systems and components used across our builds.
          </p>
        </div>
      </section>

      {/* ─── SECTION 2 — SYSTEM ACCESS ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-36 bg-card relative">
          <div className="absolute inset-0 grain-texture" />

          <div className="section-container relative z-[1]">
            <div className="grid md:grid-cols-3 gap-px bg-border/15 max-w-5xl mx-auto">
              {[
                {
                  title: "GroundLock System",
                  description: "The foundation system used under every Peninsula Equine build.",
                  cta: "Assess My Site",
                  href: "/site-assessment",
                },
                {
                  title: "Ground Systems & Access",
                  description: "Designed to handle movement, load, and long-term use without failure.",
                  cta: "Discuss Project",
                  href: "/contact",
                },
                {
                  title: "Select Components",
                  description: "Available only where they support a complete, properly structured build.",
                  cta: "View Specifications",
                  href: "/groundlock-systems",
                },
              ].map((card, i) => (
                <RevealOnScroll key={card.title} direction="up" delay={i * 150}>
                  <div className="flex flex-col bg-card p-10 md:p-12 lg:p-14 h-full transition-shadow duration-500 hover:shadow-lg hover:shadow-accent/[0.03]">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/40 mb-6">
                      0{i + 1}
                    </span>

                    <h3 className="font-serif text-xl md:text-2xl text-foreground/85 mb-4">
                      {card.title}
                    </h3>

                    <p className="text-[13px] text-muted-foreground/35 leading-[1.9] mb-10 flex-1">
                      {card.description}
                    </p>

                    <Link
                      to={card.href}
                      className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-accent/50 hover:text-accent transition-colors group"
                    >
                      {card.cta}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            {/* Access filter line */}
            <RevealOnScroll direction="up" delay={500}>
              <div className="text-center max-w-md mx-auto mt-16 space-y-1">
                <p className="text-[13px] text-muted-foreground/30 leading-[1.9]">
                  Access to systems is provided per project.
                </p>
                <p className="text-[13px] text-muted-foreground/25 leading-[1.9]">
                  We assess each site to ensure it's implemented properly.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — FOR BUILDERS ─── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-36 bg-background relative">
          <div className="absolute inset-0 grain-texture" />

          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="text-center max-w-md mx-auto flex flex-col items-center gap-6">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30">
                  Partner Access
                </p>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground/85">
                  For Builders
                </h2>

                <p className="text-sm text-muted-foreground/40 leading-[1.9]">
                  GroundLock is used across our builds and available to select partners.
                </p>

                <p className="text-[13px] text-muted-foreground/30 leading-[1.9] max-w-sm">
                  We provide system supply, guidance, and structured implementation to ensure it's done properly.
                </p>

                <div className="w-10 h-px bg-border/20 my-2" />

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40 hover:text-accent/60 transition-colors group"
                >
                  Enquire About GroundLock Use
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </RevealOnScroll>
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
