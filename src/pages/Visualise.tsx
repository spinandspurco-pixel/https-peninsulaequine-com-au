import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { BlueprintScene } from "@/components/BlueprintScene";

/* Single dominant visual — dedicated pre-construction visualisation */
import heroVisual from "@/assets/visualise-hero.jpg";

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
      <div className="type-architectural">
      {/* ═══ 1. HERO ═══════════════════════════════════ */}
      <BlueprintScene
        as="section"
        layers={[
          { image: "elevation", opacity: 0.025, direction: "left-to-right", duration: 2800, parallaxSpeed: 0.04 },
        ]}
        lineOverlays={[{ variant: "dimensions", color: "dark" }]}
        className="pt-44 sm:pt-56 pb-28 sm:pb-36"
      >
        <div className="section-container max-w-2xl mx-auto text-center">
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
      </BlueprintScene>

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
                  style={{ filter: "brightness(0.7) saturate(0.8) contrast(1.1)" }}
                />
                {/* Blueprint grid overlay — ties to global system */}
                <div
                  className="absolute inset-0 pointer-events-none engineering-grid"
                  style={{ opacity: 0.03 }}
                />
                {/* Vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, #0a0a0a 100%)" }}
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
      <BlueprintScene
        as="section"
        layers={[
          { image: "horse-barn", opacity: 0.02, direction: "bottom-to-top", duration: 3000, parallaxSpeed: 0.03 },
        ]}
        className="pt-28 sm:pt-36 pb-32 sm:pb-40"
      >
        <div className="section-container max-w-4xl mx-auto">
          <RevealOnScroll direction="up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-12">
              {PILLARS.map((pillar) => (
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
      </BlueprintScene>

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
      </div>
    </Layout>
  );
}
