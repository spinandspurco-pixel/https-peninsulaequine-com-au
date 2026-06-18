import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import heroImg from "@/assets/aberdeen-exterior.jpg";

const pillars = [
  { k: "01", label: "Masterplanning", body: "Land, water, light, movement. The estate is resolved on paper before a single post is sunk." },
  { k: "02", label: "Single Authorship", body: "Arena, stables, recovery, fencing, landscape — designed and delivered as one continuous gesture." },
  { k: "03", label: "Built for Generations", body: "Materials and detailing chosen to compound in value, not depreciate to it." },
];

export default function EquineEstates() {
  return (
    <Layout>
      <article className="bg-background text-foreground type-architectural">
        <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
          <img src={heroImg} alt="Private equine estate at dusk" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover img-header" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/15 to-primary/85" />
          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+5vw,6rem)]">
            <div className="max-w-6xl space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
              <RevealOnScroll direction="up" duration={900} delay={300}>
                <p className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Capability — 03</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={500}>
                <h1 className="font-serif text-primary-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.5rem,1.4rem+5.4vw,5.5rem)]">Equine Estates.</h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={800}>
                <p className="font-serif italic text-primary-foreground/55 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                  An entire property, authored by one team. The whole resolved before the parts.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="relative py-[clamp(7rem,4.5rem+9vw,12rem)] bg-background">
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />
          <div className="max-w-5xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(2rem,1.25rem+2.5vw,3.5rem)]">
            <RevealOnScroll direction="none" duration={1100}>
              <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">Premise</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={150}>
              <p className="font-serif italic text-foreground/75 leading-[1.25] tracking-[-0.015em] text-[clamp(1.5rem,1rem+2.2vw,2.85rem)]">
                A property is not a list of buildings. It is a single decision, made early.
              </p>
            </RevealOnScroll>
            <RevealLine className="mx-auto" width="w-10" delay={400} />
            <RevealOnScroll direction="up" duration={1000} delay={500}>
              <p className="font-sans font-light text-foreground/55 max-w-2xl mx-auto leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)]">
                Estate work begins with the land — slope, water, prevailing wind, sun arc. Every later choice — arena orientation, stable form, recovery station siting — descends from that first reading.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="py-[clamp(5rem,3rem+6vw,9rem)] bg-card">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/[0.05]">
              {pillars.map((p, i) => (
                <RevealOnScroll key={p.k} direction="up" delay={i * 120}>
                  <div className="group relative bg-card px-[clamp(1.75rem,1.25rem+2vw,2.5rem)] py-[clamp(3rem,2rem+4vw,5rem)]">
                    <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-[1100ms] group-hover:w-20" />
                    <p className="font-mono uppercase text-foreground/25 mb-[clamp(1.5rem,1rem+1.5vw,2rem)] text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">{p.k}</p>
                    <p className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,1.1rem+1.4vw,2rem)] mb-6">{p.label}</p>
                    <p className="font-sans font-light text-foreground/50 leading-[1.8] text-[clamp(0.8125rem,0.78rem+0.15vw,0.875rem)]">{p.body}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background text-center">
          <div className="max-w-2xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] space-y-10">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up">
              <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">Limited Commissions — 2026</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <p className="font-serif italic text-foreground/75 leading-[1.4] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                Estate-scale work is selective by definition.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={400}>
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
