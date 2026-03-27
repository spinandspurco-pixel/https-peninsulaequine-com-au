import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockHero } from "@/components/groundlock/GroundLockHero";

export default function GroundLockSystems() {
  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-36 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
          <div
            className="flex items-center justify-center gap-4 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <div className="w-8 h-px bg-accent/25" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/40">
              P.E. GroundLock™
            </span>
            <div className="w-8 h-px bg-accent/25" />
          </div>
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground/90 tracking-tight leading-[1.05] mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            The foundation every<br />serious build requires.
          </h1>

          <div
            className="flex justify-center mt-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "900ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            <GroundLockHero size="max-w-[200px]" opacity={0.6} />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 1 — What GroundLock Replaces ════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-8" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="text-overline mb-10">What GroundLock Replaces</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <ul className="space-y-6">
              {[
                "Unstable footing",
                "Temporary base systems",
                "Repetitive maintenance cycles",
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

      {/* ═══ SECTION 2 — How It Works ════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/25 mb-12" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="text-overline mb-10 text-accent/40">How It Works</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <ul className="space-y-6">
              {[
                "Interlocking horseshoe panels",
                "Load distribution",
                "Drainage integration",
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

      {/* ═══ SECTION 3 — Where It Applies ════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-8" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="text-overline mb-10">Where It Applies</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <ul className="space-y-6">
              {[
                "Arenas",
                "Event sites",
                "High-traffic equine zones",
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

      {/* ═══ SECTION 4 — Access ══════════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/25 mb-12" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="text-overline mb-10 text-accent/40">Access</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <ul className="space-y-6">
              {[
                "Integrated within Peninsula Equine builds",
                "Future licensing pathway",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-[13px] text-primary-foreground/50 leading-[1.7]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/25 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ FINAL LINE ══════════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <p className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground/60 italic tracking-wide leading-[1.3] mb-12">
              Not optional. Foundational.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <Button
              asChild
              variant="gold"
              size="lg"
            >
              <Link to="/site-assessment">
                Request System Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
