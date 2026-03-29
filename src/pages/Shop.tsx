import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

import shopTee from "@/assets/shop-tee.jpg";
import shopCap from "@/assets/shop-cap.jpg";
import shopHoodie from "@/assets/shop-hoodie.jpg";
import shopPant from "@/assets/shop-pant.jpg";

const PRODUCTS = [
  { src: shopTee, name: "Site Tee — Charcoal" },
  { src: shopCap, name: "Crew Cap — Stone" },
  { src: shopHoodie, name: "Work Hoodie — Ink" },
  { src: shopPant, name: "Site Pant — Slate" },
];

export default function Shop() {
  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="pt-40 sm:pt-52 pb-20 sm:pb-28">
        <div className="section-container max-w-2xl mx-auto text-center">
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground/85 tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Built Series
          </h1>
          <p
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Worn on site. Carried off it.
          </p>
        </div>
      </section>

      {/* ═══ PRODUCT GRID ═════════════════════════════════ */}
      <section className="pb-28 sm:pb-36" style={{ backgroundColor: "#0b0b0b" }}>
        <div className="section-container max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden" style={{ backgroundColor: "#0b0b0b" }}>
                  <img
                    src={product.src}
                    alt={product.name}
                    className="w-full aspect-[4/5] object-cover transition-transform duration-700 ease-out group-hover:-translate-y-1"
                    loading="lazy"
                    style={{ filter: "brightness(0.85) contrast(1.05)" }}
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 60px 30px #0b0b0b" }} />
                </div>
                <p className="mt-5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-foreground/25 group-hover:text-foreground/45 transition-colors duration-500 text-center">
                  {product.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLOSER ═══════════════════════════════════════ */}
      <section className="py-28 sm:py-36">
        <div className="text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/12 mb-10">
            Launching soon.
          </p>
          <Link
            to="/contact"
            className="inline-block px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-accent/[0.03] transition-colors duration-500"
            style={{
              borderColor: "hsl(var(--accent) / 0.08)",
              color: "hsl(var(--foreground) / 0.35)",
            }}
          >
            Register Interest →
          </Link>
        </div>
      </section>
    </Layout>
  );
}
