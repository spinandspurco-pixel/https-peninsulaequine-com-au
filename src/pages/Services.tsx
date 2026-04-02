import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";

// Locked image system — distinct per service
import systemHero from "@/assets/system-hero.jpg";
import imgFullBuild from "@/assets/service-fullbuild.jpg";
import imgGroundLock from "@/assets/service-groundlock.jpg";
import imgEvent from "@/assets/service-event.jpg";

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
            src={systemHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
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

      {/* ═══ FULL SITE BUILDS ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-6 h-px bg-accent/15" />
                    <p className="text-[9px] uppercase tracking-[0.4em] text-accent/25 font-mono">01</p>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/80 tracking-[0.02em] mb-6">
                    Full Site Builds
                  </h2>
                  <p className="text-[13px] text-foreground/30 leading-[1.8] max-w-sm">
                    Complete project delivery from ground preparation to finished arena.
                  </p>
                  <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/8">
                    Selected projects only.
                  </p>
                </div>
                <div className="lg:col-span-8">
                  <div className="relative overflow-hidden aspect-[16/9]">
                    <img src={imgFullBuild} alt="Completed equestrian estate" className="w-full h-full object-cover" loading="lazy" style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }} />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, #0a0a0a 100%)" }} />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ AUTHORITY LINE ════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 relative">
          <div className="section-container max-w-2xl mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light italic tracking-[0.04em]"
                style={{
                  fontSize: "clamp(1rem, 0.5rem + 1.8vw, 1.5rem)",
                  color: "hsl(var(--foreground) / 0.12)",
                }}
              >
                No templates. Every property is different.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ GROUNDLOCK ═══════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="py-36 sm:py-44 lg:py-56 relative">
          <div className="section-container max-w-3xl mx-auto relative z-[1] text-center">
            <RevealOnScroll direction="up">
              <div className="flex items-center gap-4 mb-5 justify-center">
                <div className="w-6 h-px bg-accent/15" />
                <p className="text-[9px] uppercase tracking-[0.4em] text-accent/25 font-mono">02</p>
                <div className="w-6 h-px bg-accent/15" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white/80 tracking-[0.02em] mb-4">
                GroundLock<span className="text-accent/35">™</span>
              </h2>
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/15 mb-16">
                Directional Interlock System
              </p>
              <div className="relative overflow-hidden aspect-square max-w-[280px] mx-auto">
                <img src={imgGroundLock} alt="GroundLock stabilisation panel" className="w-full h-full object-cover" loading="lazy" style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, #0a0a0a 100%)" }} />
              </div>
              <p className="mt-14 font-serif text-[12px] sm:text-[13px] italic text-white/16 tracking-wide">
                Built for load. Designed for control.
              </p>
              <Link
                to="/groundlock"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent/40 hover:text-accent/70 transition-colors duration-500 mt-10"
              >
                Explore System <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ EVENT INFRASTRUCTURE ═══════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <div className="relative overflow-hidden aspect-[16/9]">
                    <img src={imgEvent} alt="Event ground deployment at scale" className="w-full h-full object-cover" loading="lazy" style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }} />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, #0a0a0a 100%)" }} />
                  </div>
                </div>
                <div className="lg:col-span-5 order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-6 h-px bg-accent/15" />
                    <p className="text-[9px] uppercase tracking-[0.4em] text-accent/25 font-mono">03</p>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/80 tracking-[0.02em] mb-6">
                    Event Infrastructure
                  </h2>
                  <p className="text-[13px] text-foreground/30 leading-[1.8] max-w-sm mb-4">
                    Rapid deployment systems for high-traffic equine and event environments.
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/8 mb-8">
                    Designed for repeatable large-scale use.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent/40 hover:text-accent/70 transition-colors duration-500"
                  >
                    Enquire about event systems <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
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
            <RevealOnScroll direction="up" delay={150}>
              <Link
                to="/contact"
                className="inline-block px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-accent/[0.03] transition-colors duration-500"
                style={{
                  borderColor: "hsl(var(--accent) / 0.08)",
                  color: "hsl(var(--foreground) / 0.35)",
                }}
              >
                Apply to Build →
              </Link>
              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10">
                Selected projects only.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
