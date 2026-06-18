import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";

import sunsetPuddles from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";
import drainageDetail from "@/assets/field-notes/covered-competition-arena-drainage-detail.png.asset.json";
import truckAccessTrack from "@/assets/field-notes/covered-competition-arena-truck-access-track.png.asset.json";
import dozerStormSky from "@/assets/field-notes/covered-competition-arena-dozer-storm-sky.png.asset.json";
import nightWorkLights from "@/assets/field-notes/covered-competition-arena-night-work-lights.png.asset.json";

const timeline = [
  {
    step: "01",
    title: "Ground Preparation",
    body: "Site cuts, levels, access and early base works.",
  },
  {
    step: "02",
    title: "Steel Rising",
    body: "Structural frame installation and covered arena form taking shape.",
  },
  {
    step: "03",
    title: "Weather & Worksite Conditions",
    body: "Real build conditions, wet ground, machinery movement and sequencing.",
  },
  {
    step: "04",
    title: "Base & Drainage",
    body: "The unseen layers that support surface performance and longevity.",
  },
  {
    step: "05",
    title: "Final Surface & Finish",
    body: "Placeholder for future updates when footing, surface and finishing works are completed.",
  },
];

export default function FieldNotes() {
  useEffect(() => {
    document.title = "Field Notes | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Field Notes follows Peninsula Equine projects through real conditions — steel, earthworks, drainage and site progress across the Mornington Peninsula.",
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural">
        <section className="relative min-h-[92vh] overflow-hidden flex items-end">
          <img
            src={sunsetPuddles.url}
            alt="Covered Competition Arena in progress — structural steel at sunset with wet ground reflections and machinery"
            className="absolute inset-0 h-full w-full object-cover object-[60%_50%] sm:object-[55%_52%] lg:object-center"
            style={{ filter: "brightness(0.72) contrast(1.12) saturate(0.8)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-background/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/10" />

          <div className="relative z-10 section-container w-full pb-[clamp(3.5rem,3rem+5vw,7rem)] pt-28 sm:pt-36">
            <div className="max-w-3xl space-y-6 sm:space-y-8">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/60 text-[10px] tracking-[0.48em]">
                  Field Notes
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={140}>
                <h1 className="font-serif text-foreground leading-[0.92] tracking-tight text-[clamp(2.3rem,1.4rem+4.6vw,5.4rem)] max-w-4xl">
                  Real progress. Real conditions. Real builds.
                </h1>
              </RevealOnScroll>
              <RevealLine width="w-10" delay={260} />
              <RevealOnScroll direction="up" duration={1100} delay={320}>
                <p className="max-w-2xl font-sans font-light text-foreground/62 leading-[1.85] text-[14px] sm:text-[15px]">
                  A look behind the scenes at current Peninsula Equine projects across the Mornington Peninsula and beyond — from the first cut to the final finish.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(4.5rem,3rem+5vw,7rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <div className="grid grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="col-span-12 lg:col-span-4 space-y-5">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                    Current Project
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={120}>
                  <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.8rem,1.2rem+2vw,3rem)]">
                    Covered Competition Arena
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={220} />
                <RevealOnScroll direction="up" duration={1000} delay={300}>
                  <div className="space-y-3 text-[14px] sm:text-[15px] font-light leading-[1.9] text-foreground/52">
                    <p><span className="text-accent/60">Status</span> — In Progress</p>
                    <p><span className="text-accent/60">Location</span> — Main Ridge, VIC</p>
                    <p>
                      Structural steel is up, earthworks are underway, and the site is moving through the hard, practical stages that shape the finished arena. Every layer matters — from access and base preparation to structure, drainage and final surface performance.
                    </p>
                  </div>
                </RevealOnScroll>
              </div>

              <div className="col-span-12 lg:col-span-8">
                <RevealOnScroll direction="up" duration={1200}>
                  <Link to="/field-notes/covered-competition-arena" className="group block">
                    <article className="relative overflow-hidden">
                      <div className="relative aspect-[4/5] sm:aspect-[16/10] xl:aspect-[16/8] overflow-hidden">
                        <img
                          src={dozerStormSky.url}
                          alt="Covered Competition Arena progress — dozer in muddy conditions with structural steel under a stormy sky"
                          className="absolute inset-0 h-full w-full object-cover object-[28%_50%] sm:object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
                          style={{ filter: "brightness(0.78) contrast(1.12) saturate(0.82)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
                        <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-8 lg:p-10">
                          <div className="max-w-xl space-y-4">
                            <p className="font-mono uppercase text-accent/60 text-[10px] tracking-[0.42em]">
                              Current Project
                            </p>
                            <h3 className="font-serif text-foreground/94 leading-[1.02] tracking-tight text-[clamp(1.6rem,1.1rem+1.8vw,2.5rem)]">
                              Covered Competition Arena
                            </h3>
                            <p className="font-sans font-light text-foreground/62 leading-[1.8] text-[14px] sm:text-[15px] max-w-lg">
                              Structural steel, earthworks and base preparation underway.
                            </p>
                            <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/74 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em] pt-1">
                              <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                              View Field Note
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2rem,1.2rem+2vw,3rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">02</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Build Journal</span>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
              <RevealOnScroll direction="up" duration={1100} className="md:col-span-8">
                <div className="relative overflow-hidden aspect-[16/10] lg:aspect-[21/10]">
                  <img
                    src={truckAccessTrack.url}
                    alt="Truck arriving on wet access track beside the covered competition arena steel frame"
                    className="absolute inset-0 h-full w-full object-cover object-[44%_50%]"
                    style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={120} className="md:col-span-4">
                <div className="relative overflow-hidden aspect-[4/5] md:h-full md:aspect-auto min-h-[320px]">
                  <img
                    src={drainageDetail.url}
                    alt="Drainage and footing detail beside the arena slab edge in wet conditions"
                    className="absolute inset-0 h-full w-full object-cover object-[52%_50%]"
                    style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/35 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={180} className="md:col-span-5">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={nightWorkLights.url}
                    alt="Covered competition arena construction site under storm clouds with work lights at night"
                    className="absolute inset-0 h-full w-full object-cover object-[55%_50%]"
                    style={{ filter: "brightness(0.8) contrast(1.12) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={260} className="md:col-span-7">
                <div className="relative overflow-hidden aspect-[16/11]">
                  <img
                    src={sunsetPuddles.url}
                    alt="Wide view of the steel structure at sunset reflected in wet ground during arena construction"
                    className="absolute inset-0 h-full w-full object-cover object-[58%_50%]"
                    style={{ filter: "brightness(0.76) contrast(1.12) saturate(0.8)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-8 lg:gap-12">
              <div className="col-span-12 lg:col-span-4 space-y-5">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                    Project Timeline
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={120}>
                  <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.8rem,1.15rem+2vw,2.8rem)]">
                    Covered Competition Arena
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={220}>
                  <p className="font-sans font-light text-foreground/54 leading-[1.85] text-[14px] sm:text-[15px] max-w-sm">
                    A simple read of the work as it stands now — from the first cuts through to the layers that will eventually carry the finished surface.
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
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                Current Update
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={120}>
              <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.9rem,1.2rem+2.5vw,3.2rem)]">
                The middle of the work matters.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={240}>
              <p className="font-sans font-light text-foreground/56 leading-[1.85] text-[14px] sm:text-[15px] max-w-2xl mx-auto">
                Steel rising, red clay underfoot, drainage detail, machinery movement and weather pressure — this is where the finished arena is really made.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="none" duration={1100} delay={320}>
              <Link
                to="/field-notes/covered-competition-arena"
                className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/72 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
              >
                <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                View Field Note
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </Layout>
  );
}
