import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

import mainRidgePostDepth from "@/assets/main-ridge-post-depth.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeFrameTrench from "@/assets/main-ridge-frame-trench.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";

const PHASES = [
  {
    num: "01",
    title: "Site Assessment",
    desc: "Ground conditions, drainage, terrain, and layout constraints — evaluated on-site.",
    image: mainRidgePostDepth,
    filter: "brightness(1.1) contrast(1.18) saturate(0.82)",
  },
  {
    num: "02",
    title: "Scope & System Design",
    desc: "Engineering drawings, material specification, and a structured project brief.",
    image: mainRidgeRebarFoundation,
    filter: "brightness(1.08) contrast(1.14) saturate(0.88)",
  },
  {
    num: "03",
    title: "Ground Preparation",
    desc: "Clearing, grading, drainage, and foundation work.",
    image: mainRidgeFrameTrench,
    filter: "brightness(1.12) contrast(1.1) saturate(0.9) sepia(0.03)",
  },
  {
    num: "04",
    title: "Structural Build",
    desc: "Steel, timber, roofing — engineered for decades of use.",
    image: mainRidgeBarnFrame,
    filter: "brightness(1.1) contrast(1.2) saturate(0.8)",
  },
  {
    num: "05",
    title: "Fit-Out & Detailing",
    desc: "Stall configurations, joinery, ventilation, and hardware.",
    image: mainRidgeCiroWoodwork1,
    filter: "brightness(1.15) contrast(1.08) saturate(1.0) sepia(0.04)",
  },
  {
    num: "06",
    title: "Surface & Commissioning",
    desc: "Arena footing, final grading, and system handover.",
    image: mainRidgeArenaGrading,
    filter: "brightness(1.18) contrast(1.05) saturate(1.08) sepia(0.05)",
  },
];

const TIMELINES = [
  { type: "Arena", time: "2–4 weeks" },
  { type: "Barn / Stables", time: "8–16 weeks" },
  { type: "Full Facility", time: "4–8 months" },
];

export default function Process() {
  useEffect(() => {
    document.title = "Process | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-overline text-accent/70">How We Work</p>
            <div className="w-8 h-px bg-accent/40" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Process
          </h1>

          <p
            className="mt-8 text-muted-foreground/45 text-sm sm:text-base max-w-md mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Assessment through to long-term outcome.
          </p>
        </div>
      </section>

      {/* ═══ PHASES ════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="space-y-24 sm:space-y-32">
              {PHASES.map((phase, i) => {
                const isEven = i % 2 === 0;
                return (
                  <RevealOnScroll key={phase.num} direction="up" stagger={0}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                      <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                        <div className="aspect-[4/3] overflow-hidden bg-card">
                          <img
                            src={phase.image}
                            alt={phase.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            style={{ filter: "brightness(1.1) contrast(1.12) saturate(0.85)" }}
                          />
                        </div>
                      </div>
                      <div className={isEven ? "lg:order-2" : "lg:order-1"}>
                        <p className="text-[9px] font-mono tracking-[0.3em] text-accent/30 uppercase mb-5">
                          {phase.num}
                        </p>
                        <h3 className="font-serif text-xl sm:text-2xl font-medium text-foreground tracking-[0.02em] mb-5">
                          {phase.title}
                        </h3>
                        <p className="text-[13px] sm:text-sm text-muted-foreground/50 leading-[1.9] max-w-md">
                          {phase.desc}
                        </p>
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TIMELINES ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-36 bg-card relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <div className="text-center mb-16">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-8" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">Typical Timelines</p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-3 gap-6 sm:gap-10">
              {TIMELINES.map((item, i) => (
                <RevealOnScroll key={item.type} direction="up" stagger={i} staggerInterval={100}>
                  <div className="text-center">
                    <p className="font-serif text-xl sm:text-2xl font-bold text-accent mb-2">{item.time}</p>
                    <p className="text-[11px] text-muted-foreground/40 uppercase tracking-[0.15em] font-mono">{item.type}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="up" delay={400}>
              <p className="text-center text-[11px] text-muted-foreground/25 italic mt-14">
                Timelines vary by scope and specification.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
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
