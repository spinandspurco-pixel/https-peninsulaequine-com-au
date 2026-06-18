import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

import ciroAceArena from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import ciroAceQuiet from "@/assets/main-ridge/main-ridge-pavilion-brick-fireplace-detail.png.asset.json";
import ciroAcePortrait from "@/assets/about/main-ridge-pavilion-table-detail.png.asset.json";
import ciroAceSlidingStop from "@/assets/homepage-refresh/sliding-stop-hero.png.asset.json";
import arenaGrading from "@/assets/main-ridge-arena-grading.jpg";
import pavilionTableDetail from "@/assets/about/main-ridge-pavilion-table-detail.png.asset.json";
import coveredArena from "@/assets/covered-arena-black-exterior.jpg";

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
  /** Tailwind aspect classes, e.g. "aspect-[4/5] md:aspect-[5/6]" */
  aspect?: string;
  /** Tailwind object-position classes, e.g. "object-[60%_30%] md:object-[50%_40%]" */
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
      "Peninsula Equine is built by horse people — arenas, stables and rural builds shaped by real experience with horses, ground and property life on the Mornington Peninsula."
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <div className="type-architectural">
        {/* ═══ HERO ═══════════════════════════════════════════ */}
        <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32">
          <div className="section-container max-w-6xl mx-auto">
            <div className="relative overflow-hidden">
              <img
                src={ciroAceArena.url}
                alt="Ciro and Ace in the arena — horseman and horse, end of day."
                className="w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9] object-cover object-[58%_28%] sm:object-[55%_32%] lg:object-[50%_36%] opacity-0 animate-fade-in"
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
                    "linear-gradient(180deg, hsl(222 20% 4% / 0.35) 0%, transparent 35%, transparent 60%, hsl(222 20% 4% / 0.85) 100%)",
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
                  className="mt-5 font-serif text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-foreground opacity-0 animate-fade-in max-w-3xl"
                  style={{
                    animationDelay: "900ms",
                    animationFillMode: "both",
                    animationDuration: "1100ms",
                  }}
                >
                  Built by horse people.
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
              Peninsula Equine is shaped by the realities of horse properties —
              how they move, drain, wear, shelter and work every day.
            </p>
          </div>
        </section>

        {/* ═══ INTRO / BRAND STORY ════════════════════════════ */}
        <section className="py-32 sm:py-44">
          <div className="section-container max-w-3xl mx-auto text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--accent-light))]/95">
              01 — Origin
            </p>
            <h2 className="mt-8 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1] tracking-tight text-foreground/90">
              From the saddle to the site.
            </h2>
            <p className="mt-10 text-[14px] sm:text-[15px] font-light leading-[1.95] text-foreground/80 max-w-xl mx-auto">
              Peninsula Equine brings together practical construction knowledge
              and real horsemanship. Every arena, stable, fence line, laneway,
              drainage plan and rural build is considered through the way
              horses and people actually use the space.
            </p>
            <div className="mt-16 mx-auto max-w-[260px] sm:max-w-xs md:max-w-sm relative overflow-hidden">
              <img
                src={ciroAcePortrait.url}
                alt="Ciro and Ace — portrait at golden hour."
                loading="lazy"
                className="w-full aspect-[4/5] md:aspect-[3/4] object-cover object-[45%_30%] sm:object-[48%_32%] md:object-[50%_34%]"
                style={{ filter: FILTER }}
              />
              <Vignette />
            </div>
            <div className="mt-16 mx-auto w-px h-20 bg-foreground/10" />
          </div>
        </section>

        {/* ═══ WHY IT MATTERS ═════════════════════════════════ */}
        <FeatureSection
          overline="02 — The difference"
          title="The details matter because horses notice them first."
          body="Good equine infrastructure is not just about how it looks. It is about flow, footing, safety, access, shelter, drainage, maintenance and the small decisions that make a property easier to use every day."
          src={ciroAceQuiet.url}
          alt="Ciro and Ace — a quiet moment, head to head."
          aspect="aspect-[4/5] md:aspect-[5/6]"
          crop="object-[55%_30%] sm:object-[52%_34%] md:object-[50%_38%]"
        />

        {/* ═══ WE RIDE THE GROUND WE BUILD ═══════════════════ */}
        <section className="py-28 sm:py-40">
          <div className="section-container max-w-7xl mx-auto">
            <div className="relative overflow-hidden">
              <img
                src={ciroAceSlidingStop.url}
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
                    "linear-gradient(180deg, transparent 50%, hsl(222 20% 4% / 0.85) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 md:p-14">
                <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--accent-light))]/95">
                  03 — Proof
                </p>
                <h2 className="mt-5 font-serif text-3xl sm:text-5xl md:text-6xl leading-[1] tracking-tight text-foreground max-w-3xl">
                  We ride the ground we build.
                </h2>
              </div>
            </div>
            <p className="mt-10 max-w-2xl text-[14px] sm:text-[15px] font-light leading-[1.95] text-foreground/80">
              Arena construction is not theoretical. The feel of the surface,
              the structure beneath it, the drainage, the preparation and the
              finish all matter. Peninsula Equine approaches each build with an
              understanding of what horse people need from the ground up.
            </p>
          </div>
        </section>

        {/* ═══ FROM DIRT TO DYNASTY ══════════════════════════ */}
        <FeatureSection
          overline="04 — From dirt to dynasty"
          title="From groundwork to finished environment."
          body="The unseen work is what makes the visible result last — site preparation, levels, drainage, base works, structure, access and practical sequencing."
          src={arenaGrading}
          alt="Arena grading in progress — base works before the finish."
          aspect="aspect-[4/3] md:aspect-[5/4]"
          crop="object-[50%_60%] md:object-[50%_55%]"
          reverse
        />

        {/* ═══ CRAFTSMANSHIP ═════════════════════════════════ */}
        <FeatureSection
          overline="05 — Craftsmanship"
          title="Built with weight, purpose and finish."
          body="From arenas and stables to custom rural builds, Peninsula Equine works with honest materials and practical details — timber, steel, brick, firelight, joinery and finish."
          src={pavilionTableDetail.url}
          alt="Main Ridge Pavilion — handcrafted timber table at dusk."
          aspect="aspect-[4/3] md:aspect-[3/2]"
          crop="object-[50%_55%] md:object-[50%_52%]"
        />

        {/* ═══ CTA ════════════════════════════════════════════ */}
        <section className="relative py-36 sm:py-48 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={coveredArena}
              alt=""
              className="w-full h-full object-cover opacity-30"
              style={{ objectPosition: "50% 50%", filter: FILTER }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, hsl(222 20% 4% / 0.4) 0%, hsl(222 20% 4% / 0.95) 100%)",
              }}
            />
          </div>
          <div className="relative section-container max-w-2xl mx-auto text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--accent-light))]/95">
              06 — Begin
            </p>
            <h2 className="mt-8 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1] tracking-tight text-foreground/95">
              Start with the ground.
              <br />
              Build the legacy.
            </h2>
            <p className="mt-10 text-[14px] sm:text-[15px] font-light leading-[1.9] text-foreground/80 max-w-md mx-auto">
              Talk to Peninsula Equine about your arena, stable, groundwork or
              rural build.
            </p>
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
