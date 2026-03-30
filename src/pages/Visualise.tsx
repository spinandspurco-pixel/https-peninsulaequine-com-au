import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";

/* Use one of the oblique sim images as the dominant visual */
import heroVisual from "@/assets/sim/sim_medium_mixed_oblique.jpg";

const PILLARS = [
  {
    title: "Plan",
    line: "Spatial logic resolved before ground is broken.",
  },
  {
    title: "Preview",
    line: "See the build in context — land, structure, intent.",
  },
  {
    title: "Refine",
    line: "Iterate until every surface is considered.",
  },
];

export default function Visualise() {
  return (
    <Layout>
      {/* ═══ 1. HERO ═══════════════════════════════════ */}
      <section className="relative pt-44 sm:pt-56 pb-28 sm:pb-36 overflow-hidden">
        <div className="section-container max-w-2xl mx-auto text-center relative z-10">
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground/85 tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Visualise
          </h1>
          <p
            className="mt-8 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both" }}
          >
            See the build before it exists.
          </p>
          <p
            className="mt-10 font-serif italic text-[13px] sm:text-[14px] text-foreground/14 leading-[1.8] max-w-md mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "900ms", animationFillMode: "both" }}
          >
            Spatial planning, material direction, and build intent — resolved before ground is broken.
          </p>
        </div>
      </section>

      {/* ═══ 2. MAIN VISUAL ════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="py-20 sm:py-28 lg:py-36">
          <div className="section-container max-w-6xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="relative overflow-hidden">
                <img
                  src={heroVisual}
                  alt="Pre-construction estate visualisation"
                  className="w-full aspect-[16/9] object-cover"
                  loading="eager"
                  style={{ filter: "brightness(0.38) saturate(0.7) contrast(1.08)" }}
                />
                {/* Blueprint-like grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: 0.04,
                    backgroundImage: `repeating-linear-gradient(
                      0deg, transparent, transparent 59px,
                      hsl(var(--accent) / 0.15) 59px, hsl(var(--accent) / 0.15) 60px
                    ), repeating-linear-gradient(
                      90deg, transparent, transparent 59px,
                      hsl(var(--accent) / 0.15) 59px, hsl(var(--accent) / 0.15) 60px
                    )`,
                  }}
                />
                {/* Vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, #0a0a0a 100%)" }}
                />
                {/* Corner label */}
                <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
                  <p className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.4em] text-white/15">
                    Pre-construction preview
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ TRANSITION ════════════════════════════════ */}
      <div
        className="relative"
        style={{ height: "clamp(4rem, 8vw, 7rem)", background: "linear-gradient(to bottom, #0a0a0a, hsl(var(--background)))" }}
        aria-hidden="true"
      />

      {/* ═══ 3. CAPABILITY STRIP ═══════════════════════ */}
      <section className="pt-28 sm:pt-36 pb-32 sm:pb-40 relative overflow-hidden">
        <div className="section-container max-w-4xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-12">
              {PILLARS.map((pillar, i) => (
                <div key={pillar.title} className="text-center">
                  <p className="font-serif text-lg sm:text-xl text-foreground/65 tracking-tight mb-4">
                    {pillar.title}
                  </p>
                  <div className="w-6 h-px bg-accent/10 mx-auto mb-5" />
                  <p className="font-mono text-[10px] text-foreground/18 leading-[1.9] tracking-wide max-w-[200px] mx-auto">
                    {pillar.line}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ THREAD ════════════════════════════════════ */}
      <div
        className="mx-auto"
        style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.06), transparent)" }}
        aria-hidden="true"
      />

      {/* ═══ 4. CTA ════════════════════════════════════ */}
      <section className="py-36 sm:py-48">
        <div className="text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] hover:text-foreground/50 transition-colors duration-500"
            style={{ color: "hsl(var(--foreground) / 0.35)" }}
          >
            Request a Visualisation <ArrowRight size={13} />
          </Link>
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10">
            Selected projects only.
          </p>
        </div>
      </section>
    </Layout>
  );
}
