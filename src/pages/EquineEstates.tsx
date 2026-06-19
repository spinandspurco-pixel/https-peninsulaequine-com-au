import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { useIntake } from "@/hooks/useIntake";
// Cinematic estate-scale hero — aerial masterplan at dusk
import heroAsset from "@/assets/services-new/pe-estate-aerial-masterplan.png.asset.json";
const heroImg = heroAsset.url;

/**
 * Whole-Property Planning.
 *
 * Served at /equine-estates for backward compatibility. This is a concept /
 * planning section, NOT a standalone build category, so it is intentionally
 * absent from the primary Services dropdown.
 */

const sections = [
  {
    k: "01",
    label: "Land, Water & Movement",
    body: "Slope, drainage, access, wind, sun and horse movement shape the earliest decisions.",
  },
  {
    k: "02",
    label: "Covered Arenas & Stable Precincts",
    body: "Arena placement, stable flow, access and service areas are considered together so the property works in daily use.",
  },
  {
    k: "03",
    label: "Infrastructure That Holds",
    body: "Drainage, fencing, laneways, yards, maintenance access and ground preparation support the visible build.",
  },
  {
    k: "04",
    label: "Built for Future Use",
    body: "Good planning leaves room for growth, maintenance and changing needs without forcing the property to fight itself later.",
  },
];

export default function EquineEstates() {
  const { open } = useIntake();
  useEffect(() => {
    document.title = "Whole-Property Planning | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);
  return (
    <Layout>
      <article className="bg-background text-foreground type-architectural">
        {/* ═══ HERO ═══════════════════════════════════════ */}
        <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
          <img
            src={heroImg}
            alt="Aerial masterplan view of a private equine property at dusk — arena, stables, paddocks, water and access resolved as one composition"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover img-header"
            style={{ filter: "brightness(0.88) contrast(1.08) saturate(0.85)", objectPosition: "50% 55%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/15 to-primary/85" />
          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+5vw,6rem)]">
            <div className="max-w-6xl space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
              <RevealOnScroll direction="up" duration={900} delay={300}>
                <p className="font-mono uppercase text-[hsl(var(--accent-light))]/95 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Concept — Planning</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={500}>
                <h1 className="font-serif text-primary-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.5rem,1.4rem+5.4vw,5.5rem)]">
                  Whole-Property<br className="hidden sm:block" /> Planning.
                </h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={800}>
                <p className="font-serif italic text-primary-foreground/65 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                  Arena, stables, access, drainage and recovery — planned together, so the property works in daily use.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ═══ INTRO ════════════════════════════════════ */}
        <section className="relative py-[clamp(6rem,4rem+8vw,11rem)] bg-background">
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />
          <div className="max-w-3xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(1.75rem,1.25rem+2vw,3rem)]">
            <RevealOnScroll direction="none" duration={1100}>
              <p className="font-mono uppercase text-[hsl(var(--accent-light))]/95 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">The Approach</p>
            </RevealOnScroll>
            <RevealLine className="mx-auto" width="w-10" delay={200} />
            <RevealOnScroll direction="up" duration={1000} delay={280}>
              <p className="font-sans font-light text-foreground/80 leading-[1.85] text-[clamp(0.9375rem,0.85rem+0.35vw,1.0625rem)]">
                A horse property is not a collection of disconnected structures. Peninsula Equine considers the whole environment — covered arenas, stables, access, fencing, drainage, water, recovery, movement and future maintenance — so each decision supports the next.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* ═══ FOUR SECTIONS ═══════════════════════════════ */}
        <section className="py-[clamp(5rem,3rem+6vw,9rem)] bg-card">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/[0.05]">
              {sections.map((p, i) => (
                <RevealOnScroll key={p.k} direction="up" delay={i * 120}>
                  <div className="group relative bg-card h-full px-[clamp(1.75rem,1.25rem+2vw,2.75rem)] py-[clamp(3rem,2rem+4vw,5rem)]">
                    <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-[1100ms] group-hover:w-20" />
                    <p className="font-mono uppercase text-[hsl(var(--accent-light))]/95 mb-[clamp(1.5rem,1rem+1.5vw,2rem)] text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">{p.k}</p>
                    <h2 className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.02em] text-[clamp(1.45rem,1.05rem+1.3vw,1.95rem)] mb-6">{p.label}</h2>
                    <p className="font-sans font-light text-foreground/80 leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)] max-w-md">{p.body}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══════════════════════════════════════ */}
        <section className="py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background text-center">
          <div className="max-w-2xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] space-y-10">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up">
              <p className="font-mono uppercase text-[hsl(var(--accent-light))]/95 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">Limited Commissions — 2026</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={180}>
              <p className="font-serif italic text-foreground/75 leading-[1.4] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                Whole-property work is selective by definition.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={320}>
              <Button
                variant="gold"
                size="lg"
                onClick={open}
                className="btn-hover-lift"
              >
                Start a Project
              </Button>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={480}>
              <Link to="/contact" className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/80 hover:text-foreground transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
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
