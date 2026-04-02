import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

import glSystemDetail from "@/assets/gl-system-detail.jpg";
import shopTee from "@/assets/shop-tee.jpg";
import shopCap from "@/assets/shop-cap.jpg";
import shopHoodie from "@/assets/shop-hoodie.jpg";
import shopPant from "@/assets/shop-pant.jpg";

/* ── Tier 1: Hero product ── */
const HERO_PRODUCT = {
  src: glSystemDetail,
  name: "GroundLock™ Stabilisation System",
  line: "Engineered for load. Designed for control.",
  href: "/groundlock",
  cta: "View System",
};

/* ── Tier 2: Apparel — primary wearables ── */
const APPAREL_PRIMARY = [
  { src: shopHoodie, name: "Work Hoodie — Ink" },
  { src: shopTee, name: "Site Tee — Charcoal" },
  { src: shopPant, name: "Site Pant — Slate" },
];

/* ── Tier 2b: Accessories ── */
const APPAREL_SECONDARY = [
  { src: shopCap, name: "Crew Cap — Stone" },
];

export default function Shop() {
  return (
    <Layout>
      {/* ═══ 1. ENTRY ════════════════════════════════════ */}
      <BlueprintScene
        as="section"
        layers={[
          { image: "elevation", opacity: 0.02, direction: "left-to-right", duration: 2800, parallaxSpeed: 0.04 },
        ]}
        lineOverlays={[{ variant: "dimensions", color: "dark" }]}
        className="pt-44 sm:pt-56 pb-28 sm:pb-36"
      >
        <div className="section-container max-w-2xl mx-auto text-center">
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground/85 tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Shop
          </h1>
        </div>
      </BlueprintScene>

      {/* ═══ 2. TIER 1 — GROUNDLOCK HERO (isolated dark section) ═══ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="py-32 sm:py-44 lg:py-56">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <Link to={HERO_PRODUCT.href} className="group block">
                <div className="flex items-center gap-5 mb-8 justify-center">
                  <div className="w-8 h-px bg-accent/25" />
                  <p className="text-[9px] uppercase tracking-[0.4em] text-accent/35 font-mono">System</p>
                  <div className="w-8 h-px bg-accent/25" />
                </div>
                <div className="relative overflow-hidden">
                  <img
                    src={HERO_PRODUCT.src}
                    alt={HERO_PRODUCT.name}
                    className="w-full aspect-[21/9] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.015]"
                    loading="lazy"
                    style={{ filter: "brightness(0.85) contrast(1.1) saturate(0.8)" }}
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, #0a0a0a 100%)" }} />
                  <div
                    className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none"
                    style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }}
                  />
                </div>
                <div className="mt-10 sm:mt-14 text-center">
                  <p className="font-serif text-xl sm:text-2xl text-white/75 tracking-[0.02em]">
                    {HERO_PRODUCT.name}
                  </p>
                  <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.4em] text-white/20">
                    {HERO_PRODUCT.line}
                  </p>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent/50 group-hover:text-accent/80 transition-colors duration-500 mt-8">
                    {HERO_PRODUCT.cta} <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY BREAK — GroundLock → Equipment ═══════ */}
      <div className="relative" style={{ height: "clamp(5rem, 10vw, 8rem)" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #0a0a0a, hsl(var(--background)))" }} />
      </div>

      {/* ═══ EQUIPMENT SECTION ════════════════════════════ */}
      <section className="pt-28 sm:pt-36 pb-20 sm:pb-28 relative">
        <div className="section-container max-w-5xl mx-auto text-center">
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground/70 tracking-tight mb-4">
              Equipment
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-foreground/12 mb-20 sm:mb-28">
              Tools &amp; system components
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <div className="border border-border/10 py-16 sm:py-24 px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/15">
                Coming soon
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ APPAREL SECTION ══════════════════════════════ */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-20 relative">
        <div className="section-container max-w-5xl mx-auto text-center">
          <RevealOnScroll direction="up">
            <h2
              className="font-serif text-2xl sm:text-3xl text-foreground/70 tracking-tight mb-4"
            >
              Apparel
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-foreground/12 mb-20 sm:mb-28">
              Site-ready. Built to work.
            </p>
          </RevealOnScroll>

          {/* Primary apparel — larger presentation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14">
            {APPAREL_PRIMARY.map((product) => (
              <RevealOnScroll key={product.name} direction="up">
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]">
                    <img
                      src={product.src}
                      alt={product.name}
                      className="w-full aspect-[4/5] object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.02] group-hover:-translate-y-0.5"
                      loading="lazy"
                      style={{ filter: "brightness(0.88) contrast(1.04)" }}
                    />
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-foreground/25 group-hover:text-foreground/45 transition-colors duration-500">
                      {product.name}
                    </p>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/0 group-hover:text-foreground/25 transition-all duration-500">
                      View <ArrowRight size={10} className="inline ml-1" />
                    </span>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ APPAREL — ACCESSORIES ════════════════════════ */}
      <section className="pt-12 sm:pt-16 pb-32 sm:pb-40">
        <div className="section-container max-w-4xl mx-auto">
          <div className="flex items-center gap-5 mb-10 sm:mb-14 justify-center">
            <div className="w-6 h-px bg-accent/8" />
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-foreground/12 font-mono">Accessories</p>
            <div className="w-6 h-px bg-accent/8" />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            {APPAREL_SECONDARY.map((product) => (
              <RevealOnScroll key={product.name} direction="up">
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_6px_24px_-10px_rgba(0,0,0,0.4)]">
                    <img
                      src={product.src}
                      alt={product.name}
                      className="w-full aspect-[4/5] object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.02] group-hover:-translate-y-0.5"
                      loading="lazy"
                      style={{ filter: "brightness(0.85) contrast(1.04)" }}
                    />
                  </div>
                  <p className="mt-4 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-foreground/20 group-hover:text-foreground/35 transition-colors duration-500 text-center">
                    {product.name}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLOSING ═════════════════════════════════════ */}
      <section className="py-36 sm:py-48">
        <div className="text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] hover:text-foreground/50 transition-colors duration-500"
            style={{ color: "hsl(var(--foreground) / 0.3)" }}
          >
            Enquire <ArrowRight size={13} />
          </Link>
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10">
            Limited availability.
          </p>
        </div>
      </section>
    </Layout>
  );
}
