import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { BlueprintContinuity } from "@/components/BlueprintContinuity";

const PHASES = [
  {
    num: "01",
    title: "Site Assessment",
    desc: "Ground conditions, drainage, terrain and layout constraints — evaluated on-site.",
  },
  {
    num: "02",
    title: "Scope & System Design",
    desc: "Engineering drawings, material specification and a structured project brief.",
  },
  {
    num: "03",
    title: "Ground Preparation",
    desc: "Clearing, grading, drainage and foundation work.",
  },
  {
    num: "04",
    title: "Structural Build",
    desc: "Steel, timber and roofing — engineered for decades of use.",
  },
  {
    num: "05",
    title: "Fit-Out & Detailing",
    desc: "Stall configurations, joinery, ventilation and hardware.",
  },
  {
    num: "06",
    title: "Surface & Commissioning",
    desc: "Arena footing, final grading and system handover.",
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
      <article className="relative">
        <BlueprintContinuity />
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
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="divide-y divide-accent/10 border-y border-accent/10">
              {PHASES.map((phase, i) => (
                <RevealOnScroll key={phase.num} direction="up" stagger={i} staggerInterval={60}>
                  <div className="grid grid-cols-12 gap-6 sm:gap-10 py-10 sm:py-14 items-start">
                    <div className="col-span-12 sm:col-span-2 font-mono text-[10px] tracking-[0.42em] uppercase text-accent/45">
                      {phase.num}
                    </div>
                    <div className="col-span-12 sm:col-span-10 max-w-2xl">
                      <h3 className="font-serif text-foreground/90 leading-[1.05] tracking-tight text-[1.45rem] sm:text-[1.7rem] mb-4">
                        {phase.title}
                      </h3>
                      <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px]">
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
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
      </article>
    </Layout>
  );
}

