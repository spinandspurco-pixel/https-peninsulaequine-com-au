import { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";
import { services } from "@/data/content";
import {
  BPArena,
  BPStables,
  BPGroundSystems,
  BPInfrastructure,
  BPDesign,
} from "@/components/icons/BlueprintIcons";

const CAPABILITY_ICONS: Record<string, any> = {
  "arena-construction": BPArena,
  "barn-construction": BPStables,
  "fencing": BPInfrastructure,
  "infrastructure": BPGroundSystems,
  "consulting": BPDesign,
};

const CAPABILITY_DETAILS = [
  {
    num: "01",
    id: "arena-construction",
    title: "Performance Arenas",
    desc: "Precision-graded surfaces engineered for consistency, drainage, and long-term footing integrity. Every arena we build starts with soil analysis and ends with surfaces that perform.",
    outcome: "Consistent footing. Zero drainage failure.",
  },
  {
    num: "02",
    id: "barn-construction",
    title: "Stables & Barn Infrastructure",
    desc: "Structures designed around equine behaviour — airflow, sightlines, movement, and durability. Not decoration. Function.",
    outcome: "Horse-informed design. Built once.",
  },
  {
    num: "03",
    id: "ground-systems",
    title: "Drainage & Ground Preparation",
    desc: "The invisible layer that determines whether everything above it succeeds or fails. Sub-base engineering, water management, and compaction profiles.",
    outcome: "Performance starts below the surface.",
  },
  {
    num: "04",
    id: "infrastructure",
    title: "Performance Surfaces",
    desc: "Surface materials, stabilisation, and site-specific footing systems — including our proprietary GroundLock™ interlocking ground stabilisation.",
    outcome: "Engineered footing. Eliminated mud.",
  },
  {
    num: "05",
    id: "site-planning",
    title: "Site Planning & Equine Layouts",
    desc: "Property-wide planning informed by terrain, water flow, horse movement, and long-term operational efficiency.",
    outcome: "Intelligent layout. Future-proof design.",
  },
  {
    num: "06",
    id: "consulting",
    title: "Integrated System Design",
    desc: "Complete infrastructure integration — laneways, drainage corridors, access, utility runs, and paddock systems designed as one connected system.",
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
            What we build is only part of it.<br />
            How it works is everything.
          </p>
        </div>
      </section>

      {/* ═══ CAPABILITY PILLARS ═════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-44 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="space-y-0">
              {CAPABILITY_DETAILS.map((item, i) => (
                <RevealOnScroll key={item.num} direction="up" stagger={i} staggerInterval={80}>
                  <div className="group py-12 sm:py-16 border-b border-border/30 first:pt-0 last:border-b-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
                      {/* Number */}
                      <div className="md:col-span-1">
                        <p className="text-[9px] font-mono tracking-[0.3em] text-accent/25 uppercase">{item.num}</p>
                      </div>

                      {/* Title + description */}
                      <div className="md:col-span-7 space-y-4">
                        <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground tracking-[0.02em] group-hover:text-accent transition-colors duration-700">
                          {item.title}
                        </h3>
                        <p className="text-[13px] sm:text-sm text-muted-foreground/50 leading-[1.9] max-w-lg">
                          {item.desc}
                        </p>
                      </div>

                      {/* Outcome */}
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

      {/* ═══ APPROACH ══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 bg-card relative">
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
                  We don't work from templates. Every property is different —
                  different soil, different drainage, different needs.
                </p>
                <p className="text-muted-foreground/30 italic text-[13px]">
                  Our process begins with an on-site assessment,
                  not a price list.
                </p>
              </div>
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
                Free on-site consultation. We'll walk the land with you.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
