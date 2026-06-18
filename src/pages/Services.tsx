import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { BlueprintContinuity } from "@/components/BlueprintContinuity";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";

// Locked cinematic image system — one correct visual per service.
// Outdoor-arena-first positioning is removed. Lead with covered & indoor.
import coveredArenaAsset from "@/assets/field-notes/covered-competition-arena-night-work-lights.png.asset.json";
import stableAisleAsset from "@/assets/services-new/pe-stable-aisle-cinematic.png.asset.json";
import pavilionAsset from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import groundworksAsset from "@/assets/services-new/pe-groundworks-dozer.png.asset.json";
import drainageAsset from "@/assets/services-new/pe-infrastructure-muddy-site.png.asset.json";
import fencingAsset from "@/assets/services-new/pe-fencing-hero-gate.png.asset.json";
import lumenArcAsset from "@/assets/lumenarc/canopy.asset.json";
import estateAerialAsset from "@/assets/services-new/pe-estate-aerial-masterplan.png.asset.json";

type Service = {
  k: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  objectPosition?: string;
  href?: string;
};

const SERVICES: Service[] = [
  {
    k: "01",
    title: "Covered Arenas",
    image: coveredArenaAsset.url,
    alt: "Covered competition arena steel structure rising under night-work lights",
    objectPosition: "50% 55%",
    body: "Covered and indoor riding environments designed around structure, surface, light, flow and long-term use.",
    href: "/arenas",
  },
  {
    k: "02",
    title: "Stables & Barn Structures",
    image: stableAisleAsset.url,
    alt: "Cinematic stable aisle at dusk — timber stalls, polished steel hardware, warm bronze lighting",
    objectPosition: "50% 55%",
    body: "Purpose-built stable environments with practical flow, durable finishes and horse-first daily usability.",
    href: "/stables",
  },
  {
    k: "03",
    title: "Pavilions & Rural Builds",
    image: pavilionAsset.url,
    alt: "Main Ridge pavilion at dusk — handcrafted timber table, brick fireplace and open rural outlook",
    objectPosition: "50% 52%",
    body: "Custom rural structures, viewing spaces and gathering areas built with warmth, material honesty and long-term function.",
    href: "/selected-works/main-ridge-pavilion",
  },
  {
    k: "04",
    title: "Groundworks & Site Preparation",
    image: groundworksAsset.url,
    alt: "Engineered groundworks and grading at sunset — dozer shaping the base of a future build",
    objectPosition: "50% 55%",
    body: "Levels, base works, drainage preparation, red clay, machinery and the groundwork that determines the life of the build.",
    href: "/infrastructure",
  },
  {
    k: "05",
    title: "Drainage & Surfacing",
    image: drainageAsset.url,
    alt: "Drainage trench, aggregate and stormwater detail at dusk",
    objectPosition: "30% 65%",
    body: "Base layers, drainage systems and surface preparation designed for performance, longevity and all-weather function.",
    href: "/infrastructure",
  },
  {
    k: "06",
    title: "Equine Infrastructure",
    image: fencingAsset.url,
    alt: "Steel gate and fencing along an engineered laneway at dusk",
    objectPosition: "50% 55%",
    body: "Laneways, yards, fencing, gates, access, wash areas, retaining and support structures that keep the property working.",
    href: "/infrastructure",
  },
  {
    k: "07",
    title: "LumenArc Recovery Systems",
    image: lumenArcAsset.url,
    alt: "LumenArc recovery canopy — considered warmth and rest environment for equine wellbeing",
    objectPosition: "50% 50%",
    body: "A considered recovery environment designed around warmth, rest and equine wellbeing.",
    href: "/lumenarc",
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
      <article className="relative type-architectural">
        <BlueprintContinuity />

        {/* ═══ HERO ═══════════════════════════════════════ */}
        <section className="relative pt-40 sm:pt-52 pb-28 sm:pb-36 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={coveredArenaAsset.url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.7) contrast(1.1) saturate(0.78)", objectPosition: "50% 50%" }}
            />
          </div>
          <div className="absolute inset-0 bg-background/60" />
          <div className="absolute inset-0 grain-hero" />

          <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
            <h1
              className="heading-display text-foreground opacity-0 animate-fade-in"
              style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              How We Build
            </h1>
            <p
              className="mt-8 font-serif italic text-foreground/55 leading-[1.55] max-w-xl mx-auto text-[clamp(0.95rem,0.85rem+0.45vw,1.15rem)] opacity-0 animate-fade-in"
              style={{ animationDelay: "650ms", animationFillMode: "both", animationDuration: "1100ms" }}
            >
              Peninsula Equine designs and builds premium covered equine environments, stable structures, rural builds and supporting infrastructure for horse properties shaped to last.
            </p>
            <p
              className="mt-8 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/25 opacity-0 animate-fade-in"
              style={{ animationDelay: "900ms", animationFillMode: "both" }}
            >
              From Dirt to Dynasty.
            </p>
          </div>
        </section>

        {/* ═══ SERVICE CARDS — alternating cinematic rows ═══ */}
        <section className="relative overflow-hidden">
          <div className="py-20 sm:py-28 lg:py-32">
            <div className="section-container max-w-6xl mx-auto space-y-[clamp(4rem,3rem+5vw,8rem)]">
              {SERVICES.map((s, i) => {
                const reversed = i % 2 === 1;
                return (
                  <RevealOnScroll key={s.k} direction="up">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                      <div className={`lg:col-span-8 ${reversed ? "lg:order-2" : ""}`}>
                        <div className="relative overflow-hidden aspect-[16/9]">
                          <img
                            src={s.image}
                            alt={s.alt}
                            className="w-full h-full object-cover image-bleed"
                            loading="lazy"
                            decoding="async"
                            style={{
                              filter: "brightness(0.82) contrast(1.1) saturate(0.8)",
                              objectPosition: s.objectPosition ?? "50% 50%",
                            }}
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, hsl(var(--background)) 100%)" }}
                          />
                        </div>
                      </div>
                      <div className={`lg:col-span-4 ${reversed ? "lg:order-1" : ""}`}>
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-6 h-px bg-accent/20" />
                          <p className="text-[9px] uppercase tracking-[0.4em] text-accent/35 font-mono">{s.k}</p>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[2.15rem] text-foreground/85 tracking-[-0.018em] leading-[1.08] mb-6">
                          {s.title}
                        </h2>
                        <p className="text-[13.5px] text-foreground/55 leading-[1.85] max-w-sm mb-6">
                          {s.body}
                        </p>
                        {s.href ? (
                          <Link
                            to={s.href}
                            className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-accent/55 hover:text-accent transition-colors duration-500"
                          >
                            <span className="w-6 h-px bg-accent/45 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                            Explore
                          </Link>
                        ) : (
                          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/20">
                            Available on request.
                          </p>
                        )}
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ WHOLE-PROPERTY PLANNING — compact teaser, links out to /equine-estates ═══ */}
        <section className="relative overflow-hidden border-t border-accent/10">
          <div className="py-20 sm:py-24 lg:py-28 relative">
            <div className="section-container max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <RevealOnScroll direction="up" className="lg:col-span-5">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={estateAerialAsset.url}
                      alt="Aerial crop of a planned equine property — arena, stables and access resolved together"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover image-bleed"
                      style={{ filter: "brightness(0.82) contrast(1.08) saturate(0.8)", objectPosition: "55% 60%" }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 45%, hsl(var(--background)/0.6) 100%)" }}
                    />
                  </div>
                </RevealOnScroll>
                <div className="lg:col-span-7 space-y-5">
                  <RevealOnScroll direction="up">
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent/55">
                      Supporting Concept
                    </p>
                  </RevealOnScroll>
                  <RevealOnScroll direction="up" delay={120}>
                    <h2 className="font-serif text-[clamp(1.5rem,1rem+1.6vw,2.1rem)] text-foreground/90 tracking-[-0.02em] leading-[1.1]">
                      Whole-Property Planning
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-10" delay={220} />
                  <RevealOnScroll direction="up" delay={260}>
                    <p className="font-sans font-light text-foreground/60 leading-[1.85] text-[14px] sm:text-[15px] max-w-xl">
                      A horse property works best when the big decisions are made early. Peninsula Equine considers covered arenas, stables, access, fencing, drainage, water, recovery, movement and future maintenance as one connected environment.
                    </p>
                  </RevealOnScroll>
                  <RevealOnScroll direction="up" delay={360}>
                    <Link
                      to="/equine-estates"
                      className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                    >
                      <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                      Explore Whole-Property Planning
                    </Link>
                  </RevealOnScroll>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ AUTHORITY LINE ═══════════════════════════════ */}
        <section className="relative overflow-hidden border-t border-accent/10">
          <div className="py-20 sm:py-28">
            <div className="section-container max-w-2xl mx-auto text-center">
              <RevealOnScroll direction="up">
                <p
                  className="font-serif font-light italic tracking-[0.04em]"
                  style={{
                    fontSize: "clamp(1rem, 0.5rem + 1.8vw, 1.5rem)",
                    color: "hsl(var(--foreground) / 0.18)",
                  }}
                >
                  No templates. Every property is different.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

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
              <RevealOnScroll direction="up" delay={150}>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  Apply to Build
                </Link>
                <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/20">
                  Selected projects only.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
}
