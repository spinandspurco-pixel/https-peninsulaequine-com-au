import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";

import equitanaArena from "@/assets/equitana-arena-1.jpg";
import stoneworkStables from "@/assets/stonework-stables-1.jpg";

const CAPABILITY_DETAILS = [
  {
    num: "01",
    title: "Performance Arenas",
    desc: "Precision-graded surfaces engineered for consistent footing and drainage performance.",
    outcome: "Consistent footing. Zero drainage failure.",
  },
  {
    num: "02",
    title: "Stables & Barn Infrastructure",
    desc: "Airflow, sightlines, movement — designed around equine behaviour.",
    outcome: "Horse-informed design. Built once.",
  },
  {
    num: "03",
    title: "Drainage & Ground Preparation",
    desc: "Sub-base engineering, water management, and compaction profiles.",
    outcome: "Performance starts below the surface.",
  },
  {
    num: "04",
    title: "Performance Surfaces",
    desc: "Site-specific footing systems including GroundLock™ ground stabilisation.",
    outcome: "Engineered footing. Long-term performance.",
  },
  {
    num: "05",
    title: "Site Planning & Equine Layouts",
    desc: "Property-wide planning informed by terrain, water flow, and horse movement.",
    outcome: "Intelligent layout. Future-proof design.",
  },
  {
    num: "06",
    title: "Integrated System Design",
    desc: "Laneways, drainage corridors, access, and paddock systems — designed as one connected system.",
    outcome: "One system. No weak points.",
  },
];

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
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-overline text-accent/70">What We Build</p>
            <div className="w-8 h-px bg-accent/40" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Capabilities
          </h1>

          <p
            className="mt-8 text-muted-foreground/45 text-sm sm:text-base max-w-md mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Focused builds to fully integrated property systems.
          </p>
        </div>
      </section>

      {/* ═══ CAPABILITY PILLARS ═════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="space-y-0">
              {CAPABILITY_DETAILS.map((item, i) => (
                <RevealOnScroll key={item.num} direction="up" stagger={i} staggerInterval={80}>
                  <div className="group py-12 sm:py-16 border-b border-border/30 first:pt-0 last:border-b-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
                      <div className="md:col-span-1">
                        <p className="text-[9px] font-mono tracking-[0.3em] text-accent/25 uppercase">{item.num}</p>
                      </div>
                      <div className="md:col-span-7 space-y-4">
                        <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground tracking-[0.02em] group-hover:text-accent transition-colors duration-700">
                          {item.title}
                        </h3>
                        <p className="text-[13px] sm:text-sm text-muted-foreground/50 leading-[1.9] max-w-lg">
                          {item.desc}
                        </p>
                      </div>
                      <div className="md:col-span-4 md:text-right">
                        <p className="text-[11px] text-accent/50 italic tracking-wide">
                          {item.outcome}
                        </p>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BUILD IMAGE BREAK ═════════════════════════ */}
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

      {/* ═══ APPROACH ══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={100}>
              <h2 className="heading-section text-foreground mb-10">
                Every Project Is Custom
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="space-y-6 text-sm text-muted-foreground/50 leading-[2]">
                <p>
                  No templates. Every property is different — different soil, different drainage, different needs.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* training mention removed — available via lessons page */}

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
                Projects are assessed prior to engagement to ensure<br />
                correct specification and long-term value.
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
