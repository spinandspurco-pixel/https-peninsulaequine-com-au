import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

import heroAsset from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import fireplacePortrait from "@/assets/main-ridge/main-ridge-pavilion-brick-fireplace-detail.png.asset.json";
import parrillaWide from "@/assets/main-ridge/mr-parrilla-wide.png.asset.json";

const FACTS: Array<{ label: string; value: string }> = [
  { label: "Category", value: "Custom Rural Build" },
  { label: "Location", value: "Main Ridge" },
  { label: "Status", value: "Completed" },
  { label: "Scope", value: "Pavilion / Parrilla / Handcrafted Furniture" },
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
        {/* 1. HERO — split: left title/facts panel, right cinematic image */}
        <section className="relative w-full bg-background border-b border-accent/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[clamp(560px,82vh,900px)]">
            {/* LEFT — title + subtitle + facts */}
            <div className="lg:col-span-4 relative flex flex-col justify-between px-[clamp(1.5rem,1rem+3vw,4rem)] py-[clamp(3rem,2rem+4vw,5rem)]">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-accent/70 text-[0.6rem] tracking-[0.5em] uppercase">Selected Works</span>
                </div>
              </RevealOnScroll>

              <div className="mt-12 lg:mt-0">
                <RevealOnScroll direction="up" duration={1200} delay={120}>
                  <h1 className="font-serif text-foreground leading-[0.95] tracking-[-0.028em] text-[clamp(2.4rem,1.4rem+4.2vw,4.8rem)]">
                    Main Ridge<br />Pavilion
                  </h1>
                </RevealOnScroll>
                <RevealLine width="w-14" delay={300} className="mt-8" />
                <RevealOnScroll direction="up" duration={1100} delay={380}>
                  <p className="mt-8 font-serif text-foreground/75 leading-[1.35] tracking-[-0.01em] text-[clamp(1.05rem,0.9rem+0.55vw,1.35rem)] max-w-md font-light">
                    Pavilion, Parrilla Grill &amp; Handcrafted Dining Setting
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={480}>
                  <p className="mt-6 font-sans font-light text-foreground/55 leading-[1.65] text-[clamp(0.92rem,0.82rem+0.2vw,1rem)] max-w-md">
                    A custom rural pavilion built for gathering, fire, view and function.
                  </p>
                </RevealOnScroll>
              </div>

              {/* Project facts grid at bottom of panel */}
              <RevealOnScroll direction="up" duration={1000} delay={600} className="mt-12 lg:mt-16">
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 pt-8 border-t border-accent/15">
                  {FACTS.map((fact) => (
                    <div key={fact.label} className="flex flex-col gap-2">
                      <dt className="font-mono uppercase text-accent/65 text-[0.55rem] tracking-[0.4em]">
                        {fact.label}
                      </dt>
                      <dd className="font-sans font-light text-foreground/85 text-[0.85rem] leading-[1.3] tracking-[-0.005em]">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </RevealOnScroll>
            </div>

            {/* RIGHT — cinematic hero image */}
            <div className="lg:col-span-8 relative min-h-[420px] lg:min-h-0 overflow-hidden">
              <img
                src={heroAsset.url}
                alt="Main Ridge Pavilion at dusk — handcrafted timber table with candle lanterns, brick fireplace and open rural outlook"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  objectPosition: "50% 52%",
                  filter: "brightness(0.82) contrast(1.1) saturate(0.82)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,hsl(var(--background)/0.45)_100%)]" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(to_right,hsl(var(--background)/0.6),transparent)] hidden lg:block" />
            </div>
          </div>
        </section>

        {/* 2. CRAFTSMANSHIP — portrait brick detail + text + wide parrilla feature */}
        <section className="relative bg-background border-t border-accent/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Portrait brick / wall-light detail */}
            <div className="lg:col-span-3 relative min-h-[420px] lg:min-h-0 overflow-hidden">
              <img
                src={fireplacePortrait.url}
                alt="Brick wall and bronze wall light detail inside the Main Ridge Pavilion"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  objectPosition: "55% 50%",
                  filter: "brightness(0.84) contrast(1.1) saturate(0.8)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background)/0.5)_100%)]" />
            </div>

            {/* Text column */}
            <div className="lg:col-span-4 px-[clamp(1.5rem,1rem+3vw,3.5rem)] py-[clamp(3.5rem,2.5rem+4vw,6rem)]">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/65 text-[0.6rem] tracking-[0.5em]">Built Around</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={140}>
                <h2 className="mt-6 font-serif text-foreground/92 leading-[1.05] tracking-[-0.024em] text-[clamp(1.8rem,1.2rem+2vw,2.8rem)]">
                  Fire, timber<br />and function.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-10" delay={280} className="mt-8" />
              <RevealOnScroll direction="up" duration={1000} delay={320}>
                <p className="mt-8 font-sans font-light text-foreground/60 leading-[1.7] tracking-[0.005em] text-[clamp(0.95rem,0.85rem+0.25vw,1.05rem)] max-w-md">
                  Every detail was chosen for purpose — heavy timber structure, corrugated steel, brickwork, open views, fire, and a handcrafted table setting made to sit naturally within the space.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={420}>
                <ul className="mt-10 pt-6 border-t border-accent/15 divide-y divide-accent/10">
                  {DETAILS.map((d, i) => (
                    <li
                      key={d}
                      className="py-3 flex items-baseline gap-4 font-sans font-light text-foreground/75 text-[clamp(0.9rem,0.82rem+0.18vw,1rem)] tracking-[-0.005em]"
                    >
                      <span className="h-px w-4 bg-accent/45 shrink-0 translate-y-[-3px]" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
            </div>

            {/* Wide parrilla / fireplace feature image */}
            <div className="lg:col-span-5 relative min-h-[460px] lg:min-h-0 overflow-hidden">
              <img
                src={parrillaWide.url}
                alt="Wide view of the brick parrilla grill and fireplace anchoring the Main Ridge Pavilion"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  objectPosition: "50% 50%",
                  filter: "brightness(0.82) contrast(1.12) saturate(0.82)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,hsl(var(--background)/0.5)_100%)]" />
              <figcaption className="absolute bottom-0 left-0 right-0 px-[clamp(1.25rem,1rem+1.5vw,2.5rem)] py-5 bg-[linear-gradient(to_top,hsl(var(--background)/0.9),transparent)]">
                <p className="font-serif italic text-foreground/75 text-[clamp(0.9rem,0.82rem+0.2vw,1rem)] leading-[1.4] tracking-[-0.005em] text-center">
                  The parrilla forms the heart of the pavilion — practical, warm and built to anchor the space.
                </p>
              </figcaption>
            </div>
          </div>
        </section>

        {/* 3. MATERIAL DETAILS STRIP — text only */}
        <section className="relative py-[clamp(4.5rem,3.5rem+4vw,7rem)] bg-background border-t border-accent/10">
          <div className="section-container max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <RevealOnScroll direction="up" duration={1000} className="lg:col-span-5">
                <p className="font-mono uppercase text-accent/70 text-[0.65rem] tracking-[0.55em]">
                  Timber. Brick.<br />Steel. Fire. View.
                </p>
                <RevealLine width="w-10" delay={220} className="mt-6" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={180} className="lg:col-span-7">
                <p className="font-serif text-foreground/82 leading-[1.45] tracking-[-0.018em] text-[clamp(1.15rem,0.95rem+0.9vw,1.65rem)]">
                  The Main Ridge Pavilion is not polished into sterility. It keeps the grain, weight and honesty of its materials — built to be used, lived in and gathered around.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* 4. CLOSING CTA */}
        <section className="relative py-[clamp(5rem,4rem+5vw,9rem)] bg-background border-t border-accent/15">
          <div className="section-container max-w-5xl mx-auto px-6">
            <RevealOnScroll direction="up" duration={1100}>
              <div className="text-center space-y-5">
                <p className="font-serif text-foreground/88 leading-[1.2] tracking-[-0.022em] text-[clamp(1.6rem,1.1rem+1.8vw,2.5rem)]">
                  From groundwork to gathering place.
                </p>
                <p className="font-sans font-light text-foreground/55 leading-[1.6] text-[clamp(0.95rem,0.85rem+0.25vw,1.05rem)] max-w-xl mx-auto">
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
