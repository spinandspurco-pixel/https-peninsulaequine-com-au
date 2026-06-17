import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine, RevealImage } from "@/components/RevealOnScroll";
import heroImg from "@/assets/pavilion-hero.jpg";
import recoveryImg from "@/assets/pavilion-recovery.jpg";
import groomingImg from "@/assets/pavilion-grooming.jpg";
import architectureImg from "@/assets/pavilion-architecture.jpg";

const chapters = [
  {
    n: "I",
    overline: "Recovery",
    title: "After the work, the system continues.",
    body:
      "Infrared bays calibrated for circulation, muscle release, and the quiet repair that defines a horse's long career.",
    image: recoveryImg,
    align: "left",
  },
  {
    n: "II",
    overline: "Wellness",
    title: "An environment, not an appliance.",
    body:
      "Air, light, surface, sound — engineered together. Cortisol falls. Respiration settles. The horse is the instrument; the room is the tuning.",
    image: architectureImg,
    align: "right",
  },
  {
    n: "III",
    overline: "Grooming",
    title: "Touch, considered as architecture.",
    body:
      "Wash and grooming bays detailed in walnut, brushed bronze and polished concrete. The handler's daily ritual, treated with the precision of a private suite.",
    image: groomingImg,
    align: "left",
  },
  {
    n: "IV",
    overline: "Drying",
    title: "Warmth that is structural, not applied.",
    body:
      "Radiant ceiling lines and zoned infrared remove moisture without stress. No fans, no noise — only still, deliberate heat held in the building's bones.",
    image: heroImg,
    align: "right",
  },
];

const principles = [
  { k: "01", label: "Winter Comfort", body: "Continuous radiant warmth through the coldest months — held without effort, released without shock." },
  { k: "02", label: "Performance Preparation", body: "A pre-work environment that warms tendon and fascia before the horse is asked anything." },
  { k: "03", label: "Post-Work Recovery", body: "Lactate clearance, circulation, and the unspoken signal that the day is finished." },
];

export default function Pavilion() {
  return (
    <Layout>
      <article className="bg-background text-foreground">
        {/* ─── ARRIVAL ─────────────────────────────────────────── */}
        <section className="relative h-[92vh] min-h-[620px] overflow-hidden">
          <img
            src={heroImg}
            alt="Peninsula Equine Recovery Pavilion — interior at dusk under warm infrared light"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover img-header"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/15 to-primary/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,transparent,hsl(var(--primary)/0.55))]" />

          {/* top chapter marker */}
          <div className="absolute top-[clamp(1.75rem,1rem+2vw,3rem)] left-[clamp(1.5rem,0.75rem+3vw,4rem)] right-[clamp(1.5rem,0.75rem+3vw,4rem)] z-10 flex items-start justify-between gap-6">
            <RevealOnScroll direction="none" duration={1200} delay={200}>
              <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">
                A New Category — 01
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="none" duration={1200} delay={400}>
              <p className="hidden sm:block font-mono uppercase text-primary-foreground/40 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em] text-right">
                Mornington Peninsula
              </p>
            </RevealOnScroll>
          </div>

          {/* lower title */}
          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+5vw,6rem)] z-10">
            <div className="max-w-6xl grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 lg:col-span-9 space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
                <RevealOnScroll direction="up" duration={900} delay={400}>
                  <p className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    The Peninsula Equine Recovery Pavilion<span className="align-super text-[0.55em] ml-1">™</span>
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={600}>
                  <h1 className="font-serif text-primary-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.5rem,1.4rem+5.4vw,5.5rem)]">
                    A sanctuary, engineered<br className="hidden sm:block" /> for the equine athlete.
                  </h1>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={900}>
                  <p className="font-serif italic text-primary-foreground/55 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                    Not a stall. Not a stable. A recovery environment — held in warmth, timber and steel.
                  </p>
                </RevealOnScroll>
              </div>
              <div className="hidden lg:block col-span-3">
                <RevealOnScroll direction="none" duration={1400} delay={1100}>
                  <div className="w-12 h-px bg-accent/50 mb-3" />
                  <p className="font-mono uppercase text-primary-foreground/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    Built Properly.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PAUSE / PHILOSOPHY ──────────────────────────────── */}
        <section className="relative py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background">
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />
          <div className="max-w-5xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(2rem,1.25rem+2.5vw,3.5rem)]">
            <RevealOnScroll direction="none" duration={1100}>
              <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">
                Premise
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={150}>
              <p className="font-serif italic text-foreground/75 leading-[1.25] tracking-[-0.015em] text-[clamp(1.5rem,1rem+2.2vw,2.85rem)]">
                The most expensive horse on the property is still standing in
                infrastructure designed for a tractor.
              </p>
            </RevealOnScroll>
            <RevealLine className="mx-auto" width="w-10" delay={400} />
            <RevealOnScroll direction="up" duration={1000} delay={500}>
              <p className="font-sans font-light text-foreground/55 max-w-2xl mx-auto leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)]">
                The Pavilion resolves it. A category-defining environment that
                treats recovery, wellness and daily care as architecture —
                not as equipment bolted to a shed.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* ─── CHAPTERS — alternating cinematic spreads ────────── */}
        {chapters.map((c, i) => (
          <section
            key={c.n}
            className={`relative py-[clamp(5rem,3rem+7vw,10rem)] ${
              i % 2 === 0 ? "bg-card" : "bg-background"
            }`}
          >
            <div className="max-w-7xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
              {/* IMAGE */}
              <div
                className={`col-span-12 lg:col-span-8 ${
                  c.align === "right" ? "lg:order-2" : ""
                }`}
              >
                <RevealImage delay={100} duration={1200}>
                  <div
                    className={`relative aspect-[16/10] overflow-hidden ${
                      c.align === "left"
                        ? "lg:-ml-[3rem]"
                        : "lg:-mr-[3rem]"
                    }`}
                  >
                    <img
                      src={c.image}
                      alt={`${c.overline} — Peninsula Equine Recovery Pavilion`}
                      loading="lazy"
                      width={1600}
                      height={1000}
                      className="absolute inset-0 w-full h-full object-cover img-feature transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.15,1)] hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                    {/* corner index */}
                    <span className="absolute top-4 left-4 font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                      Chapter {c.n}
                    </span>
                  </div>
                </RevealImage>
              </div>

              {/* TEXT */}
              <div
                className={`col-span-12 lg:col-span-4 space-y-[clamp(1.25rem,0.9rem+1.2vw,2rem)] ${
                  c.align === "right" ? "lg:order-1 lg:pr-4" : "lg:pl-4"
                }`}
              >
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    {c.overline}
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={150}>
                  <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)]">
                    {c.title}
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={300} />
                <RevealOnScroll direction="up" duration={1000} delay={400}>
                  <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)]">
                    {c.body}
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </section>
        ))}

        {/* ─── PRINCIPLES — three quiet columns ────────────────── */}
        <section className="py-[clamp(6rem,4rem+8vw,12rem)] bg-background">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <RevealOnScroll direction="up" duration={900}>
              <div className="mb-[clamp(3.5rem,2.25rem+5vw,6rem)] space-y-3 max-w-xl">
                <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                  Held by the Building
                </p>
                <h3 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,1rem+2vw,2.4rem)]">
                  Three states. One environment.
                </h3>
                <RevealLine width="w-8" delay={200} />
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/[0.05]">
              {principles.map((p, i) => (
                <RevealOnScroll key={p.k} direction="up" delay={i * 120}>
                  <div className="group relative bg-background px-[clamp(1.75rem,1.25rem+2vw,2.5rem)] py-[clamp(3rem,2rem+4vw,5rem)]">
                    <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-[1100ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:w-20" />
                    <p className="font-mono uppercase text-foreground/25 mb-[clamp(1.5rem,1rem+1.5vw,2rem)] text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                      {p.k}
                    </p>
                    <p className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,1.1rem+1.4vw,2rem)] mb-6">
                      {p.label}
                    </p>
                    <p className="font-sans font-light text-foreground/50 leading-[1.8] text-[clamp(0.8125rem,0.78rem+0.15vw,0.875rem)]">
                      {p.body}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FULL-BLEED PAUSE IMAGE ─────────────────────────── */}
        <section className="relative h-[78vh] min-h-[480px] overflow-hidden">
          <img
            src={architectureImg}
            alt="Pavilion exterior at dusk — blackened timber, blackened steel, warm slot lighting"
            loading="lazy"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover img-header"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/70" />
          <div className="absolute bottom-[clamp(2.5rem,1.5rem+4vw,5rem)] left-[clamp(1.5rem,0.75rem+3vw,4rem)] right-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <div className="max-w-3xl">
              <RevealOnScroll direction="up" duration={1100}>
                <p className="font-serif italic text-primary-foreground/85 leading-[1.3] tracking-[-0.015em] text-[clamp(1.25rem,0.9rem+1.6vw,2.1rem)]">
                  "Most facilities are built to contain a horse.
                  The Pavilion is built to restore one."
                </p>
              </RevealOnScroll>
              <RevealLine className="mt-8" width="w-10" delay={300} />
            </div>
          </div>
        </section>

        {/* ─── CLOSE / SELECTIVE INVITATION ────────────────────── */}
        <section className="py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background">
          <div className="max-w-3xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(2.5rem,1.5rem+3vw,3.5rem)]">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">
                Limited Commissions — 2026
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={150}>
              <p className="font-serif italic text-foreground/75 leading-[1.4] tracking-[-0.01em] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                The Pavilion is commissioned, not configured. Each is sited,
                detailed and built to the property — by application only.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="none" duration={1200} delay={500}>
              <p
                className="font-mono uppercase italic text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]"
                style={{ color: "hsl(var(--muted-foreground) / 0.18)" }}
              >
                From Dirt to Dynasty
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-[clamp(1.75rem,1rem+2vw,3.5rem)] justify-center items-center pt-4">
                <Link
                  to="/site-assessment"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]"
                >
                  <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  Request Assessment
                </Link>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/40 hover:text-foreground/80 transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]"
                >
                  Selected Work
                  <span className="w-6 h-px bg-foreground/20 transition-all duration-700 group-hover:w-12 group-hover:bg-foreground/60" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
