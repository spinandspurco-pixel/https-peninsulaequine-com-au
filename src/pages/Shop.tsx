import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

const ARTIFACTS = [
  {
    edition: "Edition 01",
    tag: "Field Tested",
    title: "Site Tee — Charcoal",
    desc: "Worn on site. Built into the process.",
    series: "Built Series",
  },
  {
    edition: "Edition 01",
    tag: "Field Tested",
    title: "Crew Cap — Stone",
    desc: "Dust, steel, sun. Made for all three.",
    series: "Built Series",
  },
  {
    edition: "Edition 01",
    tag: "Limited",
    title: "Work Hoodie — Ink",
    desc: "From the field to the fire. One weight fits the season.",
    series: "Built Series",
  },
  {
    edition: "Edition 02",
    tag: "Field Tested",
    title: "Site Pant — Slate",
    desc: "Engineered movement. Reinforced where it matters.",
    series: "Built Series",
  },
];

export default function Shop() {
  return (
    <Layout>
      {/* ═══ 1. HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-[80vh] overflow-hidden flex items-center justify-center">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover img-hero"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 45% at 50% 50%, transparent 10%, hsl(var(--background)) 100%)" }}
        />
        <div className="absolute inset-0 grain-hero" />

        <div className="relative z-10 section-container text-center max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-8 sm:gap-10">
            <div
              className="flex items-center gap-5"
              style={{ opacity: 0, animation: "heroFadeIn 800ms ease-out 200ms forwards" }}
            >
              <div className="w-10 h-px bg-accent/20" />
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/50">Built Series</p>
              <div className="w-10 h-px bg-accent/20" />
            </div>

            <h1
              className="font-serif font-bold text-foreground leading-[0.9] tracking-[-0.01em]"
              style={{
                opacity: 0,
                animation: "heroFadeIn 900ms ease-out 500ms forwards",
                fontSize: "clamp(2.5rem, 1.2rem + 5.5vw, 5.5rem)",
              }}
            >
              Not merchandise.<br className="hidden sm:block" /> Part of the build.
            </h1>

            <p
              className="text-[11px] sm:text-[12px] uppercase max-w-sm leading-[2.2]"
              style={{
                opacity: 0,
                animation: "heroFadeIn 800ms ease-out 1000ms forwards",
                letterSpacing: "0.28em",
                color: "hsl(var(--muted-foreground) / 0.22)",
              }}
            >
              Worn on site. Carried off it.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 2. POSITIONING STATEMENT ══════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="section-container max-w-2xl mx-auto text-center relative z-10">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light tracking-[0.04em] leading-[1.7]"
                style={{
                  fontSize: "clamp(1rem, 0.5rem + 2vw, 1.6rem)",
                  color: "hsl(var(--foreground) / 0.18)",
                }}
              >
                Every piece comes from the same place the builds do — site-tested, field-worn, made to last longer than a season.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 3. ARTIFACTS ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="section-container max-w-5xl mx-auto relative z-10">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light italic tracking-[0.04em] mb-16 sm:mb-20 text-center"
                style={{
                  fontSize: "clamp(1rem, 0.5rem + 1.8vw, 1.4rem)",
                  color: "hsl(var(--foreground) / 0.15)",
                }}
              >
                Built into the process.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={80}>
              <p
                className="font-mono text-[9px] uppercase tracking-[0.35em] mb-16 sm:mb-20"
                style={{ color: "hsl(var(--accent) / 0.3)" }}
              >
                Field Collection
              </p>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/8">
              {ARTIFACTS.map((item, i) => (
                <RevealOnScroll key={item.title} direction="up" stagger={i} staggerInterval={100}>
                  <div className="bg-background p-8 sm:p-10 lg:p-12 min-h-[280px] flex flex-col justify-between group relative overflow-hidden cursor-pointer">
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                      style={{ background: "hsl(var(--background) / 0.6)" }}
                    >
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: "hsl(var(--accent) / 0.6)" }}
                      >
                        View Piece
                      </span>
                    </div>

                    {/* Content with hover zoom */}
                    <div className="transition-transform duration-300 ease-in-out group-hover:scale-[1.03]">
                      {/* Top labels */}
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <span
                            className="font-mono text-[8px] uppercase tracking-[0.3em]"
                            style={{ color: "hsl(var(--accent) / 0.25)" }}
                          >
                            {item.edition}
                          </span>
                          <span className="w-px h-3 bg-border/20" />
                          <span
                            className="font-mono text-[8px] uppercase tracking-[0.25em]"
                            style={{ color: "hsl(var(--muted-foreground) / 0.2)" }}
                          >
                            {item.tag}
                          </span>
                        </div>

                        <h3
                          className="font-serif text-[17px] sm:text-[19px] font-medium tracking-[0.02em] mb-4 group-hover:text-foreground/70 transition-colors duration-300"
                          style={{ color: "hsl(var(--foreground) / 0.5)" }}
                        >
                          {item.edition} — {item.title}
                        </h3>

                        <p
                          className="text-[12px] leading-[2] max-w-[280px]"
                          style={{ color: "hsl(var(--muted-foreground) / 0.25)" }}
                        >
                          {item.desc}
                        </p>
                      </div>

                      {/* Bottom — Limited release */}
                      <div className="mt-8 pt-6 border-t border-border/6 flex items-center justify-between">
                        <span
                          className="font-mono text-[8px] uppercase tracking-[0.3em]"
                          style={{ color: "hsl(var(--muted-foreground) / 0.12)" }}
                        >
                          {item.series}
                        </span>
                        <span
                          className="font-mono text-[8px] uppercase tracking-[0.25em]"
                          style={{ color: "hsl(var(--muted-foreground) / 0.1)" }}
                        >
                          Limited release
                        </span>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            {/* Coming soon note */}
            <RevealOnScroll direction="up" delay={200}>
              <div className="text-center mt-14">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: "hsl(var(--muted-foreground) / 0.15)" }}
                >
                  Store launching soon — register interest below.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 4. CTA ══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="section-container relative z-10 text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light italic tracking-[0.04em] mb-12"
                style={{
                  fontSize: "clamp(1.1rem, 0.6rem + 2vw, 1.75rem)",
                  color: "hsl(var(--foreground) / 0.16)",
                }}
              >
                Built to wear. Not to sell out.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={150}>
              <Button asChild variant="gold" size="lg" className="px-10 tracking-[0.08em]">
                <Link to="/contact">
                  Register Interest <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
