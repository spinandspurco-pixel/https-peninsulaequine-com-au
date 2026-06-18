import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { BlueprintContinuity } from "@/components/BlueprintContinuity";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


const DONT = [
  "We don't build at scale.",
  "No two builds are repeated.",
  "Ground integrity is never negotiated.",
];

const DO = [
  "Environments engineered for longevity.",
  "Systems designed for performance.",
  "Spaces that hold value over time.",
];

export default function TheStandard() {
  return (
    <Layout>
      <article className="relative type-architectural">
        <BlueprintContinuity />
      {/* ═══ 1. HERO ═══════════════════════════════════════ */}

      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <div
            style={{ opacity: 0, animation: "heroFadeIn 900ms ease-out 400ms forwards" }}
          >
            <h1
              className="font-serif font-extrabold text-foreground leading-[0.95] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2.8rem, 1.4rem + 6vw, 6.5rem)" }}
            >
              The Standard.
            </h1>
          </div>

          <div
            className="mt-10"
            style={{ opacity: 0, animation: "heroFadeIn 800ms ease-out 1200ms forwards" }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-[0.4em]"
              style={{ color: "hsl(var(--muted-foreground) / 0.2)" }}
            >
              This is not standard construction.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 2. WHAT WE DON'T DO ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-40 sm:py-52 lg:py-64 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="max-w-2xl mx-auto px-6 relative z-10">
            {DONT.map((line, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={120}>
                <p
                  className="font-serif font-light tracking-[0.03em] leading-[1.5] py-6 sm:py-8 border-b border-border/8 last:border-b-0"
                  style={{
                    fontSize: "clamp(1rem, 0.6rem + 1.6vw, 1.4rem)",
                    color: "hsl(var(--foreground) / 0.22)",
                  }}
                >
                  {line}
                </p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. WHAT WE BUILD ══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-40 sm:py-52 lg:py-64 relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="max-w-2xl mx-auto px-6 relative z-10">
            <RevealOnScroll direction="up">
              <p
                className="font-mono text-[9px] uppercase tracking-[0.35em] mb-14 sm:mb-20"
                style={{ color: "hsl(var(--accent) / 0.3)" }}
              >
                What We Build
              </p>
            </RevealOnScroll>
            {DO.map((line, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={120}>
                <p
                  className="font-serif font-light tracking-[0.03em] leading-[1.5] py-6 sm:py-8 border-b border-border/8 last:border-b-0"
                  style={{
                    fontSize: "clamp(1rem, 0.6rem + 1.6vw, 1.4rem)",
                    color: "hsl(var(--foreground) / 0.35)",
                  }}
                >
                  {line}
                </p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. FILTER LINE + CTA ══════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-40 sm:py-52 lg:py-64 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="max-w-2xl mx-auto px-6 relative z-10 text-center">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light italic tracking-[0.04em] leading-[1.6]"
                style={{
                  fontSize: "clamp(1.1rem, 0.6rem + 2vw, 1.75rem)",
                  color: "hsl(var(--foreground) / 0.18)",
                }}
              >
                We take on a limited number of projects each season.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={200}>
              <p
                className="mt-20 sm:mt-28 font-serif tracking-[0.03em]"
                style={{
                  fontSize: "clamp(0.95rem, 0.55rem + 1.5vw, 1.3rem)",
                  color: "hsl(var(--foreground) / 0.12)",
                }}
              >
                If you're looking for standard, we're not it.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={350}>
              <div className="mt-16 sm:mt-20">
                <Button asChild variant="gold" size="lg" className="px-10 tracking-[0.08em]">
                  <Link to="/site-assessment">
                    Discuss Your Project <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
      </article>
    </Layout>
  );

}
