import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

import heroAsset from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import fireplacePortrait from "@/assets/main-ridge/main-ridge-pavilion-brick-fireplace-detail.png.asset.json";
import parrillaWide from "@/assets/main-ridge/mr-parrilla-wide.png.asset.json";

const FACTS: Array<{ label: string; value: string }> = [
  { label: "Category", value: "Custom Rural Build" },
  { label: "Location", value: "Main Ridge" },
  { label: "Scope", value: "Pavilion / Parrilla / Handcrafted Furniture" },
  { label: "Status", value: "Completed" },
];

const DETAILS = [
  "Brick parrilla grill and firebox",
  "Heavy timber posts and framing",
  "Corrugated steel lining",
  "Handcrafted dining table and benches",
  "Open rural outlook",
  "Practical, hard-wearing finishes",
];

export default function MainRidgePavilion() {
  return (
    <Layout>
      <article className="bg-background text-foreground">
        {/* 1. HERO */}
        <section className="relative w-full h-[clamp(560px,92vh,960px)] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img
              src={heroAsset.url}
              alt="Wide view of the Main Ridge Pavilion with brick fireplace, handcrafted table and dusk landscape beyond"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: "50% 52%",
                filter: "brightness(0.76) contrast(1.1) saturate(0.8)",
              }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)/0.45)_0%,transparent_30%,transparent_60%,hsl(var(--background)/0.85)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background)/0.55)_100%)]" />

          <div className="relative h-full section-container max-w-7xl mx-auto flex flex-col justify-end pb-[clamp(3rem,2rem+4vw,6rem)]">
            <RevealOnScroll direction="up" duration={1000}>
              <div className="flex items-baseline gap-5 mb-8">
                <span className="font-mono text-accent/70 text-[0.6rem] tracking-[0.5em] uppercase">Selected Works</span>
                <span className="h-px w-12 bg-accent/40" />
                <span className="font-mono text-foreground/55 text-[0.6rem] tracking-[0.4em] uppercase">Main Ridge</span>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1200} delay={120}>
              <h1 className="font-serif text-foreground leading-[0.95] tracking-[-0.028em] text-[clamp(2.4rem,1.4rem+5vw,5.5rem)] max-w-4xl">
                Main Ridge Pavilion
              </h1>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={260}>
              <p className="mt-6 font-serif italic text-foreground/65 leading-[1.4] tracking-[-0.01em] text-[clamp(1.05rem,0.85rem+0.7vw,1.4rem)] max-w-2xl font-light">
                A custom rural pavilion built for gathering, fire, view and function.
              </p>
            </RevealOnScroll>
            <RevealLine width="w-16" delay={400} className="mt-10" />
          </div>
        </section>

        {/* 2. INTRO */}
        <section className="relative py-[clamp(5rem,3.5rem+5vw,9rem)] bg-background">
          <div className="section-container max-w-4xl mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-10">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">01</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Overview</span>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={120}>
              <p className="font-serif text-foreground/82 leading-[1.45] tracking-[-0.018em] text-[clamp(1.3rem,1rem+1.2vw,2rem)]">
                Set into the rural landscape of Main Ridge, this custom pavilion brings together raw timber, corrugated steel, brick, fire and handcrafted furniture. Built as a practical gathering space with a strong rural character, the project reflects Peninsula Equine's approach to construction: functional, durable, tactile and considered from every angle.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* 3. PROJECT FACTS */}
        <section className="relative py-[clamp(3rem,2rem+3vw,5rem)] bg-background border-t border-accent/15">
          <div className="section-container max-w-6xl mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-10">
                {FACTS.map((fact, i) => (
                  <div
                    key={fact.label}
                    className={`flex flex-col gap-3 ${i > 0 ? "lg:border-l lg:border-accent/15 lg:pl-10" : ""}`}
                  >
                    <dt className="font-mono uppercase text-accent/65 text-[0.6rem] tracking-[0.45em]">
                      {fact.label}
                    </dt>
                    <dd className="font-serif text-foreground/85 text-[clamp(1rem,0.85rem+0.4vw,1.2rem)] leading-[1.3] tracking-[-0.01em]">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </RevealOnScroll>
          </div>
        </section>

        {/* 4. CRAFTSMANSHIP */}
        <section className="relative py-[clamp(5.5rem,4rem+6vw,10rem)] bg-background border-t border-accent/15 overflow-hidden">
          <div className="section-container max-w-7xl mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">02</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Craftsmanship</span>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-[clamp(2rem,1.5rem+3vw,5rem)] items-start">
              <RevealOnScroll direction="up" duration={1200} className="md:col-span-5">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={fireplacePortrait.url}
                    alt="Brick fireplace detail inside the Main Ridge Pavilion with warm lamp light and fire glow"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      objectPosition: "58% 45%",
                      filter: "brightness(0.84) contrast(1.1) saturate(0.8)",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,hsl(var(--background)/0.5)_100%)]" />
                </div>
              </RevealOnScroll>

              <div className="md:col-span-7 md:pt-10 space-y-10">
                <RevealOnScroll direction="up" duration={1000} delay={120}>
                  <h2 className="font-serif text-foreground/92 leading-[1.05] tracking-[-0.024em] text-[clamp(1.8rem,1.2rem+2.2vw,3rem)] max-w-xl">
                    Built around fire, timber and function.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-12" delay={260} />
                <RevealOnScroll direction="up" duration={1000} delay={200}>
                  <p className="font-sans font-light text-foreground/60 leading-[1.7] tracking-[0.005em] text-[clamp(0.98rem,0.85rem+0.3vw,1.1rem)] max-w-xl">
                    Every detail was chosen for purpose — heavy timber structure, corrugated steel, brickwork, open views, fire, and a handcrafted table setting made to sit naturally within the space.
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={320}>
                  <ul className="pt-4 border-t border-accent/15 divide-y divide-accent/10">
                    {DETAILS.map((d) => (
                      <li
                        key={d}
                        className="py-3.5 flex items-baseline gap-4 font-sans font-light text-foreground/75 text-[clamp(0.95rem,0.85rem+0.2vw,1.05rem)] tracking-[-0.005em]"
                      >
                        <span className="font-mono text-accent/55 text-[0.55rem] tracking-[0.4em] tabular-nums w-6">
                          0{DETAILS.indexOf(d) + 1}
                        </span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURE IMAGE */}
        <section className="relative py-[clamp(4rem,3rem+4vw,7rem)] bg-background overflow-hidden">
          <div className="section-container max-w-[1480px] mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2rem,1.5rem+2vw,3.5rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">03</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Parrilla</span>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1200}>
              <figure>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={parrillaWide.url}
                    alt="Wide view of the brick parrilla grill and fireplace anchoring the Main Ridge Pavilion"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,hsl(var(--background)/0.55)_100%)]" />
                </div>
                <figcaption className="mt-6 pt-5 border-t border-accent/15 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                  <p className="font-serif italic text-foreground/65 text-[clamp(0.98rem,0.85rem+0.3vw,1.1rem)] leading-[1.4] tracking-[-0.005em] max-w-xl">
                    The parrilla forms the heart of the pavilion — practical, warm and built to anchor the space.
                  </p>
                  <p className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.45em]">Feature</p>
                </figcaption>
              </figure>
            </RevealOnScroll>
          </div>
        </section>

        {/* 6. MATERIAL DETAILS STRIP */}
        <section className="relative py-[clamp(5rem,4rem+5vw,9rem)] bg-background border-t border-accent/15">
          <div className="section-container max-w-5xl mx-auto text-center">
            <RevealOnScroll direction="up" duration={1000}>
              <p className="font-mono uppercase text-accent/65 text-[0.65rem] tracking-[0.55em]">
                Timber. Brick. Steel. Fire. View.
              </p>
            </RevealOnScroll>
            <RevealLine width="w-12" delay={220} className="mx-auto mt-10" />
            <RevealOnScroll direction="up" duration={1100} delay={200}>
              <p className="mt-10 font-serif text-foreground/82 leading-[1.4] tracking-[-0.018em] text-[clamp(1.3rem,1rem+1.2vw,2rem)] max-w-3xl mx-auto">
                The Main Ridge Pavilion is not polished into sterility. It keeps the grain, weight and honesty of its materials — built to be used, lived in and gathered around.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* 7. NAVIGATION / CTA */}
        <section className="relative py-[clamp(5rem,4rem+5vw,9rem)] bg-background border-t border-accent/15">
          <div className="section-container max-w-5xl mx-auto">
            <RevealOnScroll direction="up" duration={1100}>
              <div className="text-center space-y-6">
                <p className="font-serif text-foreground/85 leading-[1.2] tracking-[-0.022em] text-[clamp(1.6rem,1.1rem+1.8vw,2.5rem)]">
                  From groundwork to gathering place.
                </p>
                <p className="font-sans font-light text-foreground/55 leading-[1.6] text-[clamp(0.98rem,0.85rem+0.3vw,1.1rem)] max-w-xl mx-auto">
                  Talk to Peninsula Equine about your next rural build.
                </p>
              </div>
            </RevealOnScroll>

            <RevealLine width="w-12" delay={260} className="mx-auto mt-12" />

            <RevealOnScroll direction="up" duration={1100} delay={300}>
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/60 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  <span className="w-8 h-px bg-accent/40 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  Back to Selected Works
                </Link>
                <Link
                  to="/site-assessment"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-accent hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  Start a Project
                  <span className="w-8 h-px bg-accent transition-all duration-700 group-hover:w-14" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
