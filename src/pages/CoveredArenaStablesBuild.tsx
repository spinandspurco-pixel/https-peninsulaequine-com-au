import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";

import stormSteelAsset from "@/assets/field-notes/covered-competition-arena-dozer-storm-sky.png.asset.json";
import nightWorkAsset from "@/assets/field-notes/covered-competition-arena-night-work-lights.png.asset.json";
import truckAccessAsset from "@/assets/field-notes/covered-competition-arena-truck-access-track.png.asset.json";
import wetGroundAsset from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";
import drainageAsset from "@/assets/field-notes/covered-competition-arena-drainage-detail.png.asset.json";
import muddyBootsAsset from "@/assets/field-notes/muddy-boots-steel-frame.png.asset.json";

const stormSteel = stormSteelAsset.url;
const nightWork = nightWorkAsset.url;
const truckAccess = truckAccessAsset.url;
const wetGround = wetGroundAsset.url;
const drainage = drainageAsset.url;
const muddyBoots = muddyBootsAsset.url;

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
    body: "Access tracks, levels, red clay cuts and base planning — the work that decides how everything above it performs.",
  },
  {
    step: "02",
    title: "Steel Rising",
    body: "Structural frame installation. Columns, portals and bracing locked into position as the covered arena form begins to take shape.",
  },
  {
    step: "03",
    title: "Roof & Shelter",
    body: "Roof works defining the scale, weather protection and year-round usability of the structure.",
  },
  {
    step: "04",
    title: "Stable Infrastructure",
    body: "Stable zones, circulation and practical horse-first spaces progressing alongside the arena works.",
  },
  {
    step: "05",
    title: "Drainage & Base",
    body: "The unseen layers — falls, drainage runs and compacted base — that determine performance and longevity.",
  },
  {
    step: "06",
    title: "Final Surface & Finish",
    body: "Surface install, fit-off and the final details that bring the environment into daily working use.",
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
        {/* HERO — stormy steel + dozer */}
        <section className="relative min-h-[90vh] overflow-hidden flex items-end border-b border-accent/10">
          <img
            src={stormSteel}
            alt="Covered arena steel frame rising under a stormy sky with dozer working red clay groundworks"
            className="absolute inset-0 h-full w-full object-cover object-[58%_48%] sm:object-[55%_48%] lg:object-center"
            style={{ filter: "brightness(0.68) contrast(1.14) saturate(0.78)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/55 to-background/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/10" />

          <div className="relative z-10 section-container w-full pb-[clamp(3.5rem,3rem+5vw,7rem)] pt-28 sm:pt-36">
            <div className="max-w-3xl space-y-6 sm:space-y-8">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/60 text-[10px] tracking-[0.48em]">
                  Current Project — In Progress
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={120}>
                <h1 className="font-serif text-foreground leading-[0.92] tracking-tight text-[clamp(2.35rem,1.35rem+4.8vw,5.2rem)] max-w-4xl">
                  Covered Arena &amp; Stables Build
                </h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={220}>
                <p className="font-serif italic text-foreground/72 leading-[1.55] text-[clamp(1rem,0.88rem+0.32vw,1.16rem)] max-w-2xl">
                  Structural steel, groundworks and stable infrastructure in progress.
                </p>
              </RevealOnScroll>
              <RevealLine width="w-10" delay={320} />
              <RevealOnScroll direction="up" duration={1100} delay={380}>
                <p className="max-w-2xl font-sans font-light text-foreground/60 leading-[1.85] text-[14px] sm:text-[15px]">
                  This active project documents the real middle of a Peninsula Equine build — steel rising,
                  red clay underfoot, machinery moving through changing conditions and every layer setting
                  the foundation for the finished arena and stable environment.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* PROJECT SUMMARY */}
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
                  This active project documents the real middle of a Peninsula Equine build — steel rising,
                  red clay underfoot, machinery moving through changing conditions and every layer setting
                  the foundation for the finished arena and stable environment.
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

        {/* EDITORIAL GRID — 6 process images, no duplicates side by side */}
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
              {/* Row 1: wide night-work + tall muddy boots */}
              <RevealOnScroll direction="up" duration={1100} className="md:col-span-8">
                <div className="relative overflow-hidden aspect-[16/10] lg:aspect-[21/10]">
                  <img
                    src={nightWork}
                    alt="Night work lighting on the covered arena build with steel frame and machinery still in motion"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    style={{ filter: "brightness(0.72) contrast(1.12) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={120} className="md:col-span-4">
                <div className="relative overflow-hidden aspect-[4/5] md:h-full md:aspect-auto min-h-[320px]">
                  <img
                    src={muddyBoots}
                    alt="Dirty boots standing in red clay beside the steel frame of the covered arena"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    style={{ filter: "brightness(0.76) contrast(1.12) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/35 to-transparent" />
                </div>
              </RevealOnScroll>

              {/* Row 2: truck access + wet ground + drainage */}
              <RevealOnScroll direction="up" duration={1100} delay={180} className="md:col-span-5">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={truckAccess}
                    alt="Heavy truck moving along the access track with machinery positioned for the next stage of works"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    style={{ filter: "brightness(0.78) contrast(1.1) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={260} className="md:col-span-4">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={wetGround}
                    alt="Wet ground and puddles across the covered arena footprint at sunset, roof structure overhead"
                    className="absolute inset-0 h-full w-full object-cover object-[54%_50%]"
                    style={{ filter: "brightness(0.76) contrast(1.1) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={340} className="md:col-span-3">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={drainage}
                    alt="Drainage detail and base preparation channel cut into the red clay site"
                    className="absolute inset-0 h-full w-full object-cover object-[52%_50%]"
                    style={{ filter: "brightness(0.78) contrast(1.1) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* BUILD TIMELINE */}
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

        {/* CLOSING CTA */}
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
                  to="/contact"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/72 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  Start a Project
                  <span className="w-8 h-px bg-foreground/30 transition-all duration-700 group-hover:w-14 group-hover:bg-foreground/70" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </Layout>
  );
}
