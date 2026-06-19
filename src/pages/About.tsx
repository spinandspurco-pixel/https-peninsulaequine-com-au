import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

import heroQuiet from "@/assets/about/ciro-ace-quiet-moment.png.asset.json";
import beliefSlidingStop from "@/assets/about/ciro-ace-sliding-stop.png.asset.json";
import craftBeamDetail from "@/assets/main-ridge/mr-beam-detail.png.asset.json";
import workMuddyBoots from "@/assets/field-notes/muddy-boots-steel-frame.png.asset.json";
import ctaBackdrop from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";

// Unified architectural grading consistent across the brand
const FILTER = "brightness(0.85) contrast(1.1) saturate(0.8)";

const Vignette = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, hsl(222 20% 4% / 0.55) 100%)",
    }}
  />
);

const Grid = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(0deg, hsl(var(--foreground) / 0.025) 1px, transparent 1px),
        linear-gradient(90deg, hsl(var(--foreground) / 0.025) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
    }}
  />
);

interface SectionProps {
  overline: string;
  title: string;
  body: string;
  src: string;
  alt: string;
  aspect?: string;
  crop?: string;
  reverse?: boolean;
}

const FeatureSection = ({
  overline,
  title,
  body,
  src,
  alt,
  aspect = "aspect-[4/5] md:aspect-[5/6]",
  crop = "object-[50%_40%]",
  reverse = false,
}: SectionProps) => (
  <section className="py-20 sm:py-32 md:py-40">
    <div className="section-container max-w-6xl mx-auto">
      <div
        className={`grid md:grid-cols-12 gap-8 sm:gap-10 md:gap-16 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="md:col-span-7 relative overflow-hidden">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className={`w-full ${aspect} object-cover ${crop}`}
            style={{ filter: FILTER }}
          />
          <Vignette />
          <Grid />
        </div>
        <div className="md:col-span-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-[hsl(var(--accent-light))]/95">
            {overline}
          </p>
          <h2 className="mt-6 font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] tracking-tight text-foreground/90">
            {title}
          </h2>
          <p className="mt-8 text-[14px] sm:text-[15px] font-light leading-[1.9] text-foreground/80 max-w-md">
            {body}
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default function About() {
  useEffect(() => {
    document.title = "About | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Built by horse people, backed by construction. Peninsula Equine builds covered arenas, stables, groundworks and rural structures that work every day."
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <div className="type-architectural">
        {/* ═══ 1. HERO ════════════════════════════════════════ */}
        <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32">
          <div className="section-container max-w-6xl mx-auto">
            <div className="relative overflow-hidden">
              <img
                src={heroQuiet.url}
                alt="Ciro and Ace — a quiet moment between horseman and horse."
                className="w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9] object-cover object-[55%_30%] sm:object-[52%_34%] lg:object-[50%_38%] opacity-0 animate-fade-in"
                style={{
                  filter: FILTER,
                  animationDelay: "200ms",
                  animationFillMode: "both",
                  animationDuration: "1100ms",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(222 20% 4% / 0.35) 0%, transparent 35%, transparent 55%, hsl(222 20% 4% / 0.9) 100%)",
                }}
              />
              <Grid />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12 md:p-16">
                <p
                  className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.5em] text-[hsl(var(--accent-light))]/95 opacity-0 animate-fade-in"
                  style={{
                    animationDelay: "700ms",
                    animationFillMode: "both",
                    animationDuration: "900ms",
                  }}
                >
                  About — Peninsula Equine
                </p>
                <h1
                  className="mt-5 font-serif text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-foreground opacity-0 animate-fade-in max-w-4xl"
                  style={{
                    animationDelay: "900ms",
                    animationFillMode: "both",
                    animationDuration: "1100ms",
                  }}
                >
                  Built by horse people.
                  <br />
                  <span className="text-foreground/70">Backed by construction.</span>
                </h1>
              </div>
            </div>

            <p
              className="mt-12 sm:mt-16 max-w-2xl text-[14px] sm:text-[15px] font-light leading-[1.9] text-foreground/80 opacity-0 animate-fade-in"
              style={{
                animationDelay: "1200ms",
                animationFillMode: "both",
                animationDuration: "900ms",
              }}
            >
              Peninsula Equine builds environments for horses, riders and
              properties that need to work every day — from covered arenas and
              stables to groundworks, drainage and rural structures.
            </p>
          </div>
        </section>

        {/* ═══ 2. THE BELIEF ══════════════════════════════════ */}
        <section className="py-28 sm:py-40">
          <div className="section-container max-w-7xl mx-auto">
            <div className="relative overflow-hidden">
              <img
                src={beliefSlidingStop.url}
                alt="Ciro and Ace — sliding stop, testing the ground."
                loading="lazy"
                className="w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] object-cover object-[62%_45%] sm:object-[55%_50%] lg:object-[50%_50%]"
                style={{ filter: FILTER }}
              />
              <Vignette />
              <Grid />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 45%, hsl(222 20% 4% / 0.9) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-14">
                <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--accent-light))]/95">
                  02 — The belief
                </p>
                <h2 className="mt-5 font-serif text-3xl sm:text-5xl md:text-6xl leading-[1] tracking-tight text-foreground max-w-3xl">
                  We ride the ground we build.
                </h2>
              </div>
            </div>
            <p className="mt-10 max-w-2xl text-[14px] sm:text-[15px] font-light leading-[1.95] text-foreground/80">
              The difference is practical. A surface, a stable, a laneway or a
              covered arena is only successful if it holds up under daily use,
              weather, horses, machinery and time.
            </p>
          </div>
        </section>

        {/* ═══ 3. CRAFTSMANSHIP ═══════════════════════════════ */}
        <FeatureSection
          overline="03 — Craftsmanship"
          title="Built with detail where it matters."
          body="Steel, timber, drainage, footing, access and finish all have to work together. Peninsula Equine treats the visible and invisible parts of the build with the same discipline."
          src={craftBeamDetail.url}
          alt="Hand-finished blackened steel and timber beam detail."
          aspect="aspect-[4/3] md:aspect-[3/2]"
          crop="object-[50%_50%]"
        />

        {/* ═══ 4. THE WORK ════════════════════════════════════ */}
        <FeatureSection
          overline="04 — The work"
          title="From ground to finished environment."
          body="Every project begins with the land — slope, access, water, use, shelter and future maintenance. The finished result should feel resolved because the early work was done properly."
          src={workMuddyBoots.url}
          alt="Muddy boots on a steel frame — groundworks in progress."
          aspect="aspect-[4/3] md:aspect-[5/4]"
          crop="object-[50%_55%] md:object-[50%_50%]"
          reverse
        />

        {/* ═══ 5. CLOSING CTA ═════════════════════════════════ */}
        <section className="relative py-36 sm:py-48 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={ctaBackdrop.url}
              alt=""
              className="w-full h-full object-cover opacity-30"
              style={{ objectPosition: "50% 50%", filter: FILTER }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, hsl(222 20% 4% / 0.45) 0%, hsl(222 20% 4% / 0.96) 100%)",
              }}
            />
          </div>
          <div className="relative section-container max-w-2xl mx-auto text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--accent-light))]/95">
              05 — Begin
            </p>
            <h2 className="mt-8 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1] tracking-tight text-foreground/95">
              Start with the ground.
              <br />
              Build the legacy.
            </h2>
            <Link
              to="/contact"
              className="mt-14 inline-block px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-accent/[0.04] transition-colors duration-500"
              style={{
                borderColor: "hsl(var(--accent) / 0.15)",
                color: "hsl(var(--foreground) / 0.55)",
              }}
            >
              Start a Project →
            </Link>
            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/15">
              From Dirt to Dynasty
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
