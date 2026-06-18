import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";

import heroDrone from "@/assets/current-arena/covered-arena-drone-hero.png.asset.json";
import steelFront from "@/assets/current-arena/covered-arena-steel-front.png.asset.json";
import sitewideProgress from "@/assets/current-arena/covered-arena-sitewide-progress.png.asset.json";
import redClayRoofline from "@/assets/current-arena/covered-arena-red-clay-roofline.png.asset.json";
import steelSide from "@/assets/current-arena/covered-arena-steel-side.png.asset.json";

const facts = [
  { label: "Category", value: "Covered Arena / Stables" },
  { label: "Location", value: "Mornington Peninsula" },
  { label: "Status", value: "In Progress" },
  {
    label: "Scope",
    value: "Steel Frame / Roofing / Groundworks / Stable Infrastructure / Drainage / Base Preparation",
  },
];

const timeline = [
  {
    step: "01",
    title: "Site Preparation",
    body: "Access, levels, red clay cuts and base planning.",
  },
  {
    step: "02",
    title: "Steel Rising",
    body: "Structural frame installation and the covered arena form taking shape.",
  },
  {
    step: "03",
    title: "Roof & Shelter",
    body: "Roof works beginning to define the scale, protection and usability of the structure.",
  },
  {
    step: "04",
    title: "Stable Infrastructure",
    body: "Stable zones, circulation and practical horse-first spaces progressing alongside the arena works.",
  },
  {
    step: "05",
    title: "Base, Drainage & Surface",
    body: "The unseen layers that determine performance, longevity and daily use.",
  },
  {
    step: "06",
    title: "Final Fit-Off",
    body: "Placeholder for future updates once the project reaches the finishing stages.",
  },
];

export default function CoveredArenaStablesBuild() {
  useEffect(() => {
    document.title = "Covered Arena & Stables Build | Field Notes";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Covered Arena & Stables Build — structural steel, undercover arena works and stable infrastructure in progress across the Mornington Peninsula.",
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural">
        <section className="relative min-h-[90vh] overflow-hidden flex items-end border-b border-accent/10">
          <img
            src={heroDrone.url}
            alt="Covered Arena & Stables Build in progress — wide drone view of steel framing, roofing works and red clay ground conditions"
            className="absolute inset-0 h-full w-full object-cover object-[62%_48%] sm:object-[58%_48%] lg:object-center"
            style={{ filter: "brightness(0.7) contrast(1.12) saturate(0.8)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/56 to-background/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/10" />

          <div className="relative z-10 section-container w-full pb-[clamp(3.5rem,3rem+5vw,7rem)] pt-28 sm:pt-36">
            <div className="max-w-3xl space-y-6 sm:space-y-8">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/60 text-[10px] tracking-[0.48em]">
                  Current Project
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={120}>
                <h1 className="font-serif text-foreground leading-[0.92] tracking-tight text-[clamp(2.35rem,1.35rem+4.8vw,5.2rem)] max-w-4xl">
                  Covered Arena &amp; Stables Build
                </h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={220}>
                <p className="font-serif italic text-foreground/72 leading-[1.55] text-[clamp(1rem,0.88rem+0.32vw,1.16rem)] max-w-2xl">
                  Structural steel, groundwork and stable infrastructure in progress.
                </p>
              </RevealOnScroll>
              <RevealLine width="w-10" delay={320} />
              <RevealOnScroll direction="up" duration={1100} delay={380}>
                <p className="max-w-2xl font-sans font-light text-foreground/60 leading-[1.85] text-[14px] sm:text-[15px]">
                  This active project captures the real middle of a Peninsula Equine build — steel rising,
                  red clay underfoot, machinery moving through changing site conditions, and every layer
                  setting the foundation for the finished arena and stable environment.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="border-t border-accent/10 py-[clamp(4.5rem,3rem+5vw,7rem)]">
          <div className="section-container max-w-6xl mx-auto grid grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="col-span-12 lg:col-span-7 space-y-5">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                  Project Summary
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={120}>
                <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.8rem,1.2rem+2vw,3rem)]">
                  Steel, shelter and site sequencing.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={240} />
              <RevealOnScroll direction="up" duration={1000} delay={320}>
                <p className="font-sans font-light text-foreground/56 leading-[1.9] text-[14px] sm:text-[15px] max-w-2xl">
                  Covered arena structure, steel framing, roof works, base preparation, stable infrastructure,
                  access, drainage, machinery works and site sequencing — documented as the build moves from
                  heavy groundwork toward a fully resolved horse environment.
                </p>
              </RevealOnScroll>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:text-right">
              <RevealOnScroll direction="up" duration={1000} delay={360}>
                <dl className="space-y-3 font-sans font-light text-foreground/52 text-[14px] sm:text-[15px]">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="inline text-accent/60">{fact.label}</dt>
                      <dd className="inline"> — {fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2rem,1.2rem+2vw,3rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">02</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Editorial Grid</span>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
              <RevealOnScroll direction="up" duration={1100} className="md:col-span-8">
                <div className="relative overflow-hidden aspect-[16/10] lg:aspect-[21/10]">
                  <img
                    src={heroDrone.url}
                    alt="Large-scale drone view of the current covered arena and stables build with steel framing and roofing taking shape"
                    className="absolute inset-0 h-full w-full object-cover object-[62%_48%]"
                    style={{ filter: "brightness(0.74) contrast(1.1) saturate(0.8)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={120} className="md:col-span-4">
                <div className="relative overflow-hidden aspect-[4/5] md:h-full md:aspect-auto min-h-[320px]">
                  <img
                    src={steelFront.url}
                    alt="Structural steel detail at the front of the covered arena with dramatic cloud cover overhead"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    style={{ filter: "brightness(0.78) contrast(1.12) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/35 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={180} className="md:col-span-5">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={sitewideProgress.url}
                    alt="Wide drone progress image showing the build footprint, open site and machinery positioning"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={260} className="md:col-span-4">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={redClayRoofline.url}
                    alt="Red clay, wet ground and roofline progress around the current arena and stable works"
                    className="absolute inset-0 h-full w-full object-cover object-[54%_50%]"
                    style={{ filter: "brightness(0.78) contrast(1.1) saturate(0.8)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={340} className="md:col-span-3">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={steelSide.url}
                    alt="Side angle of stable framing and steel roof structure progressing through muddy site conditions"
                    className="absolute inset-0 h-full w-full object-cover object-[52%_50%]"
                    style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-6xl mx-auto grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-4 space-y-5">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                  Build Timeline
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={120}>
                <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.8rem,1.15rem+2vw,2.8rem)]">
                  Current sequence of the work.
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={220}>
                <p className="font-sans font-light text-foreground/54 leading-[1.85] text-[14px] sm:text-[15px] max-w-sm">
                  A direct read of the project as it stands now — practical, structural and still in motion.
                </p>
              </RevealOnScroll>
            </div>

            <div className="col-span-12 lg:col-span-8 divide-y divide-accent/10 border-t border-accent/10">
              {timeline.map((item, index) => (
                <RevealOnScroll key={item.step} direction="up" duration={950} delay={index * 90}>
                  <div className="grid grid-cols-12 gap-4 sm:gap-6 py-6 sm:py-8 items-start">
                    <div className="col-span-12 sm:col-span-2 font-mono text-accent/55 text-[10px] tracking-[0.42em] uppercase">
                      {item.step}
                    </div>
                    <div className="col-span-12 sm:col-span-10">
                      <h3 className="font-serif text-foreground/90 leading-[1.05] tracking-tight text-[1.35rem] sm:text-[1.55rem]">
                        {item.title}
                      </h3>
                      <p className="mt-3 font-sans font-light text-foreground/56 leading-[1.85] text-[14px] sm:text-[15px] max-w-2xl">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                Stay with the build
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={120}>
              <p className="font-serif italic text-foreground/74 leading-[1.4] tracking-tight text-[clamp(1.3rem,0.95rem+1.4vw,2rem)] max-w-3xl mx-auto">
                Honest progress now. Finished work later.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="none" duration={1100} delay={280}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-1">
                <Link
                  to="/field-notes"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/72 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  Back to Field Notes
                </Link>
                <Link
                  to="/site-assessment"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/46 hover:text-foreground/80 transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  Request Assessment
                  <span className="w-8 h-px bg-foreground/20 transition-all duration-700 group-hover:w-14 group-hover:bg-foreground/55" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </Layout>
  );
}
