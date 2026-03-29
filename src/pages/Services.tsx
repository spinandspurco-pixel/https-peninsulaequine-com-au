import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";

import equitanaArena from "@/assets/equitana-arena-1.jpg";
import imgFullSite from "@/assets/services-full-site.jpg";
import imgGroundlock from "@/assets/services-groundlock.jpg";
import imgEvent from "@/assets/services-event.jpg";


export default function Services() {
  useEffect(() => {
    document.title = "Capabilities | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      <ServicesSchemaMarkup />

      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 sm:pt-52 pb-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={equitanaArena}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover img-hero"
          />
        </div>
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 grain-hero" />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            How We Build
          </h1>

          <p
            className="mt-8 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            From Dirt to Dynasty.
          </p>
        </div>
      </section>

      {/* ═══ BUILD IMAGE — VISUAL PROOF ════════════════════ */}
      <section className="relative overflow-hidden">
        <RevealOnScroll direction="up" duration={800}>
          <div className="relative aspect-[21/9]">
            <img
              src={stoneworkStables}
              alt="Barn frame structure"
              className="absolute inset-0 w-full h-full object-cover img-feature"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/20" />
          </div>
        </RevealOnScroll>
      </section>

      {/* ═══ FULL SITE BUILDS ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-8 h-px bg-accent/25" />
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">01</p>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/85 tracking-[0.02em] mb-6">
                Full Site Builds
              </h2>
              <p className="text-[13px] sm:text-sm text-foreground/35 leading-[1.8] max-w-lg">
                Complete project delivery from ground preparation to finished arena.
              </p>
              <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10">
                Selected projects only.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ AUTHORITY LINE ════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="section-container max-w-2xl mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light italic tracking-[0.04em]"
                style={{
                  fontSize: "clamp(1rem, 0.5rem + 1.8vw, 1.5rem)",
                  color: "hsl(var(--foreground) / 0.15)",
                }}
              >
                No templates. Every property is different.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ GROUNDLOCK SYSTEMS ════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-8 h-px bg-accent/25" />
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">02</p>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/85 tracking-[0.02em] mb-6">
                GroundLock Systems
              </h2>
              <p className="text-[13px] sm:text-sm text-foreground/35 leading-[1.8] max-w-lg mb-8">
                Engineered ground stabilisation systems for permanent and temporary environments.
              </p>
              <Link
                to="/groundlock"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent/50 hover:text-accent/80 transition-colors duration-500"
              >
                Explore GroundLock <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ EVENT INFRASTRUCTURE ══════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-8 h-px bg-accent/25" />
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">03</p>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/85 tracking-[0.02em] mb-6">
                Event Infrastructure
              </h2>
              <p className="text-[13px] sm:text-sm text-foreground/35 leading-[1.8] max-w-lg mb-4">
                Rapid deployment systems for high-traffic equine and event environments.
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10 mb-8">
                Designed for repeatable large-scale use.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent/50 hover:text-accent/80 transition-colors duration-500"
              >
                Enquire about event systems <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 20%, hsl(222 20% 3% / 0.5) 100%)" }}
          />
          <div className="section-container relative z-10 text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-8">
                Discuss Your Project
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/40 mb-10 leading-relaxed">
                Every project begins with a site assessment.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Discuss Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
