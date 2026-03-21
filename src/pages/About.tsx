import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { aboutCiro } from "@/data/content";

import ciroWithHorse from "@/assets/ciro-with-horse.png";
import horseAction from "@/assets/horse-action.png";

export default function About() {
  useEffect(() => {
    document.title = "About | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 sm:pt-52 pb-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={horseAction}
            alt=""
            className="absolute inset-0 w-full h-full object-cover img-header"
          />
        </div>
        <div className="absolute inset-0 bg-background/60" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%, transparent 20%, hsl(222 20% 4% / 0.7) 80%)" }}
        />
        <div className="absolute inset-0 grain-hero" />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-overline text-accent/70">Our Story</p>
            <div className="w-8 h-px bg-accent/40" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Built by a Horseman
          </h1>

          <p
            className="mt-8 text-muted-foreground/45 text-sm sm:text-base max-w-md mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Construction expertise shaped by horsemanship.
          </p>
        </div>
      </section>

      {/* ═══ FOUNDER ═══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1]">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-5xl mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={ciroWithHorse}
                      alt="Ciro Parisella, founder of Peninsula Equine"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-full h-full border border-accent/15 -z-10" />
                </div>
              </RevealOnScroll>

              <div>
                <RevealOnScroll direction="up" delay={100}>
                  <RevealLine className="mb-10" width="w-10" />
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={150}>
                  <p className="text-overline mb-4">{aboutCiro.title}</p>
                  <h2 className="heading-section text-foreground mb-10">{aboutCiro.name}</h2>
                </RevealOnScroll>
                <div className="space-y-5 text-sm text-muted-foreground/55 leading-[1.9]">
                  {aboutCiro.bio.map((p, i) => (
                    <RevealOnScroll key={i} direction="up" stagger={i + 2} staggerInterval={100}>
                      <p>{p}</p>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ APPROACH ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 bg-card relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <p className="text-overline mb-6">Our Approach</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={120}>
              <h2 className="heading-section text-foreground mb-12">
                Design and Construction<br />as One System
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="space-y-6 text-sm text-muted-foreground/50 leading-[2]">
                <p>
                  Design and construction as one system. Every decision considered as a whole — built to reduce maintenance over time.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ VALUES ═══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-20">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">Principles</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  What Drives Every Build
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {aboutCiro.values.map((value, i) => (
                <RevealOnScroll key={value.title} direction="up" stagger={i} staggerInterval={100}>
                  <div className="group text-center">
                    <p className="text-[9px] font-mono tracking-[0.3em] text-accent/25 uppercase mb-5">0{i + 1}</p>
                    <h3 className="font-serif text-base font-medium text-foreground mb-4 group-hover:text-accent transition-colors duration-700">
                      {value.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground/45 leading-[1.8]">{value.description}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="up" delay={500}>
              <p className="text-center mt-20 text-[11px] text-muted-foreground/25 italic">
                Projects range from focused infrastructure builds to fully integrated property systems.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ QUOTE BREAK ═════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-36 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-2xl mx-auto text-center relative z-10">
            <RevealOnScroll direction="up" duration={1000}>
              <blockquote className="font-serif text-xl sm:text-2xl text-foreground/80 italic leading-[1.5] tracking-[0.01em]">
                "When you understand how a horse thinks and moves,
                you build facilities that work with their nature,
                not against it."
              </blockquote>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="mt-10 flex flex-col items-center gap-2">
                <div className="w-8 h-px bg-accent/30" />
                <p className="mt-4 text-xs text-accent/50 tracking-[0.15em] uppercase">
                  — Ciro
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
                Each project is assessed individually to ensure correct<br />
                system specification and long-term performance.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Discuss Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={350}>
              <p className="text-muted-foreground/20 text-[10px] tracking-[0.2em] uppercase mt-8">
                Assessment availability is limited.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
