import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import heroAsset from "@/assets/uploads/approved-aberdeen-exterior-dusk-frontage.png.asset.json";
import stallInteriorAsset from "@/assets/uploads/approved-stable-stall-interior-symmetric.png.asset.json";
import aisleDetailAsset from "@/assets/uploads/approved-stable-aisle-detail-warm-light.png.asset.json";
const heroImg = heroAsset.url;
...
        {/* DETAIL — approved stable imagery now live */}
        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background border-t border-foreground/[0.04]">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
            <div className="lg:col-span-5 space-y-8">
              <RevealOnScroll direction="up">
                <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Detail</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={150}>
                <h2 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)] max-w-2xl">
                  Every junction considered. Every surface specified.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
              <RevealOnScroll direction="up" delay={400}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)] max-w-2xl">
                  Hardwood grain matched. Steel galvanised then powder-coated. Latches that close with the weight of the door. The standard is invisible — until you've lived without it.
                </p>
              </RevealOnScroll>
            </div>
            <RevealOnScroll direction="up" delay={180} className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={stallInteriorAsset.url}
                    alt="Stable stall interior with black steel framing, timber lower walls and warm linear lighting"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "brightness(0.82) contrast(1.08) saturate(0.78)", objectPosition: "50% 50%" }}
                  />
                </div>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={aisleDetailAsset.url}
                    alt="Stable aisle detail with black steel posts, timber fronts and warm late light across the stall joinery"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.78)", objectPosition: "50% 50%" }}
                  />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="py-[clamp(5rem,3rem+6vw,9rem)] bg-card">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/[0.05]">
              {capabilities.map((c, i) => (
                <RevealOnScroll key={c.k} direction="up" delay={i * 120}>
                  <div className="group relative bg-card px-[clamp(1.75rem,1.25rem+2vw,2.5rem)] py-[clamp(3rem,2rem+4vw,5rem)]">
                    <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-[1100ms] group-hover:w-20" />
                    <p className="font-mono uppercase text-foreground/25 mb-[clamp(1.5rem,1rem+1.5vw,2rem)] text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">{c.k}</p>
                    <p className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,1.1rem+1.4vw,2rem)] mb-6">{c.label}</p>
                    <p className="font-sans font-light text-foreground/50 leading-[1.8] text-[clamp(0.8125rem,0.78rem+0.15vw,0.875rem)]">{c.body}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background text-center">
          <div className="max-w-2xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] space-y-10">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up">
              <p className="font-serif italic text-foreground/70 leading-[1.4] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                The horse never reads the brochure. The horse reads the building.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={300}>
              <Link to="/contact" className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                Apply to Build
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
