import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { BlueprintContinuity } from "@/components/BlueprintContinuity";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";

// Locked cinematic image system — one correct visual per service.
// Outdoor-arena-first positioning is removed. Lead with covered & indoor.
import coveredArenaAsset from "@/assets/field-notes/covered-competition-arena-night-work-lights.png.asset.json";
import indoorArenaAsset from "@/assets/aberdeen/arena-dramatic-light.png.asset.json";
import stableAisleAsset from "@/assets/services-new/pe-stable-aisle-cinematic.png.asset.json";
import pavilionAsset from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import estateAerialAsset from "@/assets/services-new/pe-estate-aerial-masterplan.png.asset.json";
import infrastructureAsset from "@/assets/services-new/pe-infrastructure-muddy-site.png.asset.json";
import groundworksAsset from "@/assets/services-new/pe-groundworks-dozer.png.asset.json";

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
    body: "Competition-ready covered riding environments designed around structure, surface, light, flow and long-term use.",
    href: "/services/arenas",
  },
  {
    k: "02",
    title: "Indoor Riding Environments",
    image: indoorArenaAsset.url,
    alt: "Indoor arena with dramatic shafts of natural light across the surface",
    objectPosition: "50% 50%",
    body: "Controlled arena spaces shaped for year-round training, rider comfort, visibility and reduced weather-related maintenance.",
  },
  {
    k: "03",
    title: "Stables & Barn Structures",
    image: stableAisleAsset.url,
    alt: "Cinematic stable aisle at dusk — timber stalls, polished steel hardware, warm bronze lighting",
    objectPosition: "50% 55%",
    body: "Purpose-built stable environments with practical flow, durable finishes and horse-first daily usability.",
    href: "/services/stables",
  },
  {
    k: "04",
    title: "Pavilions & Rural Builds",
    image: pavilionAsset.url,
    alt: "Main Ridge pavilion at dusk — handcrafted timber table, brick fireplace and open rural outlook",
    objectPosition: "50% 52%",
    body: "Custom rural structures, viewing spaces and gathering areas built with warmth, material honesty and long-term function.",
    href: "/selected-works/main-ridge-pavilion",
  },
  {
    k: "05",
    title: "Equine Estates",
    image: estateAerialAsset.url,
    alt: "Aerial masterplan view of a private equine estate at dusk",
    objectPosition: "50% 55%",
    body: "Whole-property equine planning across arenas, stables, access, fencing, water, drainage, recovery and movement.",
    href: "/services/equine-estates",
  },
  {
    k: "06",
    title: "Infrastructure & Maintenance",
    image: infrastructureAsset.url,
    alt: "Drainage trench, aggregate pile and dozer working a stormy site at dusk",
    objectPosition: "50% 60%",
    body: "The supporting systems that keep a property working — drainage, access, yards, surfaces, repairs and ongoing care.",
    href: "/services/infrastructure",
  },
  {
    k: "07",
    title: "Groundworks & Site Preparation",
    image: groundworksAsset.url,
    alt: "Engineered groundworks and grading at sunset — dozer shaping the base of a future build",
    objectPosition: "50% 55%",
    body: "Levels, base works, drainage preparation, red clay, machinery and the groundwork that determines the life of the build.",
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
                        <p className="text-[13.5px] text-foreground/45 leading-[1.85] max-w-sm mb-6">
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
                          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/15">
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

        {/* ═══ AUTHORITY LINE ═══════════════════════════════ */}
        <section className="relative overflow-hidden">
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
