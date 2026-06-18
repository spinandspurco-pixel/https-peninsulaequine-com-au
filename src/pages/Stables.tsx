import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

/**
 * Stables.
 *
 * Image policy (locked):
 *   The pavilion / parrilla / interior-dining photo set is forbidden on this page.
 *   The current cinematic asset library does not yet contain a graded stable
 *   aisle / stall frontage that matches the rest of the site. Per the global
 *   image rules, we render this page as a dark text-only composition until
 *   a category-correct cinematic stable visual is uploaded.
 *
 *   When that asset lands, replace the dark hero band below with an <img>
 *   and a gradient overlay — and only then.
 */

const capabilities = [
  { k: "01", label: "Cross-Ventilation", body: "Ridge vents, opposing openings, prevailing-wind geometry. Air resolved into the building, not added later." },
  { k: "02", label: "Custom Joinery", body: "Stalls fitted to the horse in front of you — hardwood, polished steel, hand-laid stone where it matters." },
  { k: "03", label: "Integrated Services", body: "Wash, tack, feed, vet — placed where they're used, plumbed and powered to last." },
];

export default function Stables() {
  return (
    <Layout>
      <article className="bg-background text-foreground type-architectural">
        {/* HERO — text-only dark composition (no pavilion/parrilla imagery) */}
        <section className="relative h-[82vh] min-h-[560px] overflow-hidden bg-background">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 30% 70%, hsl(var(--accent) / 0.08), transparent 60%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 60%, hsl(var(--primary) / 0.85) 100%)",
            }}
          />
          <div className="absolute inset-0 grain-texture opacity-40" />
          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+4vw,5rem)]">
            <div className="max-w-6xl space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
              <RevealOnScroll direction="up" duration={900} delay={300}>
                <p className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Capability — 02</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={500}>
                <h1 className="font-serif text-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.5rem,1.4rem+5.4vw,5.5rem)]">Stables.</h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={800}>
                <p className="font-serif italic text-foreground/55 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                  Architecture for the horse. Joinery for the handler. Engineered for thirty years of daily use.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* DETAIL — text-only band (image withheld until a category-correct cinematic stable is uploaded) */}
        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background border-t border-foreground/[0.04]">
          <div className="max-w-4xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] space-y-8">
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
