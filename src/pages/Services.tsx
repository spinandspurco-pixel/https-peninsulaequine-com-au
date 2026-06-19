import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { BlueprintContinuity } from "@/components/BlueprintContinuity";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";

// Locked cinematic image system — one correct visual per service.
// Outdoor-arena-first positioning is removed. Lead with covered & indoor.
import coveredArenaAsset from "@/assets/covered-arenas/approved-covered-arena-interior-night.png.asset.json";
import heroStormAsset from "@/assets/uploads/approved-current-build-steel-frame-storm.png.asset.json";
import stableAisleAsset from "@/assets/uploads/approved-stable-aisle-detail-warm-light.png.asset.json";
import pavilionAsset from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import groundworksAsset from "@/assets/services-new/pe-groundworks-dozer.png.asset.json";
import drainageAsset from "@/assets/services-new/pe-infrastructure-muddy-site.png.asset.json";
import fencingAsset from "@/assets/services-new/pe-fencing-hero-gate.png.asset.json";
import lumenArcAsset from "@/assets/lumenarc/canopy.asset.json";
import estateAerialAsset from "@/assets/services-new/pe-estate-aerial-masterplan.png.asset.json";

type Service = {
  k: string;
  slug: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  objectPosition?: string;
  href?: string;
};

type Chapter = {
  code: string;
  slug: string;
  title: string;
  intent: string;
  services: Service[];
};


const CHAPTERS: Chapter[] = [
  {
    code: "I",
    slug: "build",
    title: "Build",
    intent: "Covered structures, stables and rural buildings — designed around the horse and built to outlast the lease on the land.",
    services: [
      {
        k: "01",
        slug: "covered-arenas",
        title: "Covered Arenas",
        image: coveredArenaAsset.url,
        alt: "Covered indoor arena with warm late light across the riding surface, open side bays and a full-length steel roof span",
        objectPosition: "50% 52%",
        body: "Covered and indoor riding environments designed around structure, surface, light, airflow and long-term daily use.",
        href: "/arenas",
      },
      {
        k: "02",
        slug: "stables-barn-structures",
        title: "Stables & Barn Structures",
        image: stableAisleAsset.url,
        alt: "Stable aisle with black steel columns, skylights and warm timber stall fronts extending through the barn",
        objectPosition: "50% 48%",
        body: "Stable environments built around horse care, safe handling, practical movement, durable finishes and daily flow.",
        href: "/stables",
      },
      {
        k: "03",
        slug: "pavilions-rural-builds",
        title: "Pavilions & Rural Builds",
        image: pavilionAsset.url,
        alt: "Main Ridge pavilion at dusk — handcrafted timber table, brick fireplace and open rural outlook",
        objectPosition: "50% 52%",
        body: "Custom rural structures for viewing, gathering, shelter and property use — built with material warmth and long-term function.",
        href: "/selected-works/main-ridge-pavilion",
      },
    ],
  },
  {
    code: "II",
    slug: "ground",
    title: "Ground",
    intent: "Levels, drainage, surfacing and the working infrastructure under and around every structure. Nothing built well stands on the wrong ground.",
    services: [
      {
        k: "01",
        slug: "groundworks-site-preparation",
        title: "Groundworks & Site Preparation",
        image: groundworksAsset.url,
        alt: "Engineered groundworks and grading at sunset — dozer shaping the base of a future build",
        objectPosition: "50% 55%",
        body: "Levels, access, site cuts, base works and preparation that determine how the finished environment performs.",
        href: "/infrastructure",
      },
      {
        k: "02",
        slug: "drainage-surfacing",
        title: "Drainage & Surfacing",
        image: drainageAsset.url,
        alt: "Drainage trench, aggregate and stormwater detail at dusk",
        objectPosition: "30% 65%",
        body: "Drainage, base layers and surface preparation designed to support performance, durability and all-weather use.",
        href: "/infrastructure",
      },
      {
        k: "03",
        slug: "equine-infrastructure",
        title: "Equine Infrastructure",
        image: fencingAsset.url,
        alt: "Steel gate and fencing along an engineered laneway at dusk",
        objectPosition: "50% 55%",
        body: "Laneways, gates, fencing, yards, access points, wash areas and service zones that keep the property working.",
        href: "/infrastructure",
      },
    ],
  },
  {
    code: "III",
    slug: "systems",
    title: "Systems",
    intent: "Engineered systems integrated into the build — controlled environments for performance, recovery and long-term equine wellbeing.",
    services: [
      {
        k: "01",
        slug: "lumenarc-recovery-systems",
        title: "LumenArc Recovery Systems",
        image: lumenArcAsset.url,
        alt: "LumenArc recovery canopy — considered warmth and rest environment for equine wellbeing",
        objectPosition: "50% 50%",
        body: "A considered equine recovery environment designed around warmth, rest, wellbeing and controlled care.",
        href: "/lumenarc",
      },
    ],
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
              src={heroStormAsset.url}
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

        {/* ═══ SERVICE CHAPTERS — BUILD / GROUND / SYSTEMS ═══ */}
        <section className="relative overflow-hidden">
          <div className="py-20 sm:py-28 lg:py-32">
            <div className="section-container max-w-6xl mx-auto space-y-[clamp(5rem,4rem+5vw,9rem)]">
              {CHAPTERS.map((chapter, ci) => (
                <div key={chapter.code} className="space-y-[clamp(3rem,2rem+3vw,5rem)]">
                  {/* Chapter masthead */}
                  <RevealOnScroll direction="up">
                    <div className="border-t border-accent/15 pt-10 sm:pt-14">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline">
                        <div className="lg:col-span-4 flex items-baseline gap-5">
                          <span className="font-mono text-accent/45 text-[10px] tracking-[0.4em] tabular-nums">
                            {String(ci + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
                          </span>
                          <span className="h-px flex-1 max-w-[2.5rem] bg-accent/25" />
                          <h2 className="font-serif text-foreground/90 tracking-[-0.025em] leading-none text-[clamp(2rem,1.4rem+2.4vw,3.4rem)] uppercase">
                            {chapter.title}
                          </h2>
                        </div>
                        <p className="lg:col-span-7 lg:col-start-6 font-sans font-light text-foreground/55 leading-[1.8] text-[14px] sm:text-[15px] max-w-xl">
                          {chapter.intent}
                        </p>
                      </div>
                      <div className="mt-8 flex items-center gap-4">
                        <span className="font-mono text-accent/35 text-[9px] tracking-[0.45em] uppercase">
                          Sec. {chapter.code}
                        </span>
                        <span className="h-px flex-1 bg-accent/10" />
                      </div>
                    </div>
                  </RevealOnScroll>

                  {/* Services within chapter */}
                  <div className="space-y-[clamp(4rem,3rem+4vw,7rem)]">
                    {chapter.services.map((s, i) => {
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
                                {/* Construction-drawing corner ticks */}
                                <span aria-hidden className="absolute top-0 left-0 w-4 h-px bg-accent/45" />
                                <span aria-hidden className="absolute top-0 left-0 w-px h-4 bg-accent/45" />
                                <span aria-hidden className="absolute bottom-0 right-0 w-4 h-px bg-accent/45" />
                                <span aria-hidden className="absolute bottom-0 right-0 w-px h-4 bg-accent/45" />
                              </div>
                            </div>
                            <div className={`lg:col-span-4 ${reversed ? "lg:order-1" : ""}`}>
                              <div className="flex items-center gap-4 mb-5">
                                <div className="w-6 h-px bg-accent/20" />
                                <p className="text-[9px] uppercase tracking-[0.4em] text-accent/35 font-mono tabular-nums">
                                  {chapter.code}.{s.k}
                                </p>
                              </div>
                              <h3 className="font-serif text-2xl sm:text-3xl lg:text-[2.15rem] text-foreground/85 tracking-[-0.018em] leading-[1.08] mb-6">
                                {s.title}
                              </h3>
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
              ))}
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
