import { Layout } from "@/components/layout/Layout";
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

/* ── Tier 2: Equipment ── */
const EQUIPMENT = [
  { src: shopHoodie, name: "Work Hoodie — Ink" },
  { src: shopTee, name: "Site Tee — Charcoal" },
];

/* ── Tier 3: Accessories ── */
const ACCESSORIES = [
  { src: shopCap, name: "Crew Cap — Stone" },
  { src: shopPant, name: "Site Pant — Slate" },
];

export default function Shop() {
  return (
    <Layout>
      {/* ═══ 1. ENTRY ════════════════════════════════════ */}
      <section className="pt-44 sm:pt-56 pb-28 sm:pb-36">
        <div className="section-container max-w-2xl mx-auto text-center">
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground/85 tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Equipment
          </h1>
        </div>
      </section>

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
                    loading="eager"
                    style={{ filter: "brightness(0.96) contrast(1.06) saturate(0.9)" }}
                  />
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

      {/* ═══ SEPARATION ═══════════════════════════════════ */}
      <div className="py-16 sm:py-24" />

      {/* ═══ 3. TIER 2 — EQUIPMENT (separate context) ═════ */}
      <section className="pt-20 sm:pt-28 pb-32 sm:pb-40">
        <div className="section-container max-w-5xl mx-auto">
          <div className="flex items-center gap-5 mb-10 sm:mb-14">
            <div className="w-6 h-px bg-accent/12" />
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/18 font-mono">Equipment</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14">
            {EQUIPMENT.map((product) => (
              <RevealOnScroll key={product.name} direction="up">
                <div className="group cursor-pointer">
                  <div
                    className="relative overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
                  >
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

      {/* ═══ THREAD ══════════════════════════════════════ */}
      <div
        className="mx-auto"
        style={{ width: "1px", height: "clamp(2rem, 4vw, 3.5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.04), transparent)" }}
        aria-hidden="true"
      />

      {/* ═══ 4. TIER 3 — ACCESSORIES ═════════════════════ */}
      <section className="pt-16 sm:pt-20 pb-32 sm:pb-40">
        <div className="section-container max-w-4xl mx-auto">
          <div className="flex items-center gap-5 mb-10 sm:mb-14">
            <div className="w-6 h-px bg-accent/8" />
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/12 font-mono">Accessories</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            {ACCESSORIES.map((product) => (
              <RevealOnScroll key={product.name} direction="up">
                <div className="group cursor-pointer">
                  <div
                    className="relative overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_6px_24px_-10px_rgba(0,0,0,0.4)]"
                  >
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
