import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
// Covered Arenas hero — approved wide indoor arena image
import heroAsset from "@/assets/uploads/approved-covered-arena-interior-wide-gold.png.asset.json";
const heroImg = heroAsset.url;


const capabilities = [
  { k: "01", label: "Clear-Span Structures", body: "Engineered steel and blackened timber — competition-ready spans built to ride year-round, under any sky." },
  { k: "02", label: "Engineered Footing", body: "Sub-base, drainage and surface blend tuned to discipline and climate. Performance written into the ground." },
  { k: "03", label: "Resolved at Handover", body: "Specified, fabricated, installed and commissioned by one team. No coordination tax." },
];

export default function Arenas() {
  return (
    <Layout>
      <article className="bg-background text-foreground type-architectural">
        <section className="relative h-[82vh] min-h-[560px] overflow-hidden">
          <img src={heroImg} alt="Covered indoor arena with warm late light across the riding surface, open side bays and a full-length steel roof span" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover img-header" style={{ objectPosition: "50% 52%" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/15 to-primary/80" />
          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+4vw,5rem)]">
            <div className="max-w-6xl space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
              <RevealOnScroll direction="up" duration={900} delay={300}>
                <p className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Capability — 01</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={500}>
                <h1 className="font-serif text-primary-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.5rem,1.4rem+5.4vw,5.5rem)]">Covered Arenas.</h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={800}>
                <p className="font-serif italic text-primary-foreground/55 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                  Competition-ready indoor environments. Structures built to hold, surfaces built to ride — engineered as a single system.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="py-[clamp(7rem,4.5rem+9vw,12rem)] bg-background">
          <div className="max-w-5xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2.5rem,1.5rem+3vw,5rem)]">
            <div className="lg:col-span-5 space-y-6">
              <RevealOnScroll direction="up">
                <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Discipline</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={150}>
                <h2 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)]">
                  Indoor riding environments. Built to ride every day of the year.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
            </div>
            <div className="lg:col-span-7">
              <RevealOnScroll direction="up" delay={200}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.875rem,0.82rem+0.2vw,1rem)]">
                  Covered arenas remove weather from the program. Every build begins with a soil report and ends with a rider — in between sits engineering: sub-grade, drainage falls, geotextile, base, surface blend, clear-span steel and controlled light. Tested on the property, not from a spec sheet.
                </p>
              </RevealOnScroll>
            </div>
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
                Built to ride for thirty years. Not five.
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
