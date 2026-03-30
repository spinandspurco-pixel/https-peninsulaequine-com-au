import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import shopTee from "@/assets/shop-tee.jpg";
import shopCap from "@/assets/shop-cap.jpg";
import shopHoodie from "@/assets/shop-hoodie.jpg";
import shopPant from "@/assets/shop-pant.jpg";

const FEATURE = { src: shopHoodie, name: "Work Hoodie — Ink", line: "Heavyweight. Site-tested." };

const GRID = [
  { src: shopTee, name: "Site Tee — Charcoal" },
  { src: shopCap, name: "Crew Cap — Stone" },
  { src: shopPant, name: "Site Pant — Slate" },
];

export default function Shop() {
  return (
    <Layout>
      {/* ═══ 1. ENTRY ════════════════════════════════════ */}
      <section className="pt-44 sm:pt-56 pb-24 sm:pb-32" style={{ backgroundColor: "#0b0b0b" }}>
        <div className="section-container max-w-2xl mx-auto text-center">
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground/85 tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Equipment
          </h1>
        </div>
      </section>

      {/* ═══ 2. FEATURE PRODUCT ══════════════════════════ */}
      <section className="pb-32 sm:pb-40" style={{ backgroundColor: "#0b0b0b" }}>
        <div className="section-container max-w-4xl mx-auto">
          <div className="group cursor-pointer">
            <div className="relative overflow-hidden">
              <img
                src={FEATURE.src}
                alt={FEATURE.name}
                className="w-full aspect-[16/10] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                loading="eager"
                style={{ filter: "brightness(0.9) contrast(1.04)" }}
              />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <p className="font-serif text-base sm:text-lg text-foreground/50 tracking-[0.02em]">
                {FEATURE.name}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/15">
                {FEATURE.line}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THREAD ══════════════════════════════════════ */}
      <div
        className="mx-auto"
        style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.06), transparent)" }}
        aria-hidden="true"
      />

      {/* ═══ 3. PRODUCT GRID ═════════════════════════════ */}
      <section className="pt-16 sm:pt-20 pb-32 sm:pb-40" style={{ backgroundColor: "#0b0b0b" }}>
        <div className="section-container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">
            {GRID.map((product) => (
              <div key={product.name} className="group cursor-pointer">
                <div className="relative overflow-hidden">
                  <img
                    src={product.src}
                    alt={product.name}
                    className="w-full aspect-[4/5] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                    style={{ filter: "brightness(0.88) contrast(1.04)" }}
                  />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-foreground/25 group-hover:text-foreground/45 transition-colors duration-500">
                    {product.name}
                  </p>
                  <ArrowRight
                    size={12}
                    className="text-foreground/0 group-hover:text-foreground/25 transition-all duration-500 group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLOSING ═════════════════════════════════════ */}
      <section className="py-32 sm:py-44" style={{ backgroundColor: "#0b0b0b" }}>
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
