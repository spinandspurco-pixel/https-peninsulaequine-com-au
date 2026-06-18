import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";

import sunsetPuddles from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";
import drainageDetail from "@/assets/field-notes/covered-competition-arena-drainage-detail.png.asset.json";
import truckAccessTrack from "@/assets/field-notes/covered-competition-arena-truck-access-track.png.asset.json";
import dozerStormSky from "@/assets/field-notes/covered-competition-arena-truck-access-track.png.asset.json";
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

export default function AberdeenFarmFieldNote() {
  useEffect(() => {
    document.title = "Aberdeen Farm | Field Notes";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Aberdeen Farm field note — structural steel, groundwork and base preparation in progress across a real Peninsula Equine build.",
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural">
        <section className="relative min-h-[88vh] overflow-hidden flex items-end">
          <img
            src={sunsetPuddles.url}
            alt="Aberdeen Farm — structural steel at sunset with puddles and machinery on site"
            className="absolute inset-0 h-full w-full object-cover object-[60%_50%] sm:object-[56%_50%] lg:object-center"
            style={{ filter: "brightness(0.72) contrast(1.12) saturate(0.8)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/48 to-background/14" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/8" />

          <div className="relative z-10 section-container w-full pb-[clamp(3.5rem,3rem+5vw,7rem)] pt-28 sm:pt-36">
            <div className="max-w-3xl space-y-5 sm:space-y-7">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/60 text-[10px] tracking-[0.48em]">
                  Field Note — Current Project
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={120}>
                <h1 className="font-serif text-foreground leading-[0.92] tracking-tight text-[clamp(2.2rem,1.35rem+4.4vw,5rem)]">
                  Aberdeen Farm
                </h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={220}>
                <p className="font-serif italic text-foreground/72 leading-[1.55] text-[clamp(0.98rem,0.85rem+0.3vw,1.15rem)] max-w-2xl">
                  Structural steel, groundwork and base preparation in progress.
                </p>
              </RevealOnScroll>
              <RevealLine width="w-10" delay={320} />
              <RevealOnScroll direction="up" duration={1100} delay={380}>
                <p className="max-w-2xl font-sans font-light text-foreground/60 leading-[1.85] text-[14px] sm:text-[15px]">
                  This current project captures the real middle of a build — steel rising, red clay underfoot, machinery moving through wet conditions, and every decision setting the foundation for the finished arena.
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
                  Project Snapshot
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={120}>
                <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.8rem,1.2rem+2vw,3rem)]">
                  Steel is up. The hard work underneath is still unfolding.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={240} />
              <RevealOnScroll direction="up" duration={1000} delay={320}>
                <p className="font-sans font-light text-foreground/56 leading-[1.9] text-[14px] sm:text-[15px] max-w-2xl">
                  Structural steel is up, earthworks are underway, and the site is moving through the hard, practical stages that shape the finished arena. Every layer matters — from access and base preparation to structure, drainage and final surface performance.
                </p>
              </RevealOnScroll>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:text-right">
              <RevealOnScroll direction="up" duration={1000} delay={360}>
                <div className="space-y-3 font-sans font-light text-foreground/52 text-[14px] sm:text-[15px]">
                  <p><span className="text-accent/60">Status</span> — In Progress</p>
                  <p><span className="text-accent/60">Location</span> — Main Ridge, VIC</p>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-[1480px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            <RevealOnScroll direction="up" duration={1100} className="md:col-span-8">
              <div className="relative overflow-hidden aspect-[16/10] lg:aspect-[21/10]">
                <img
                  src={truckAccessTrack.url}
                  alt="Truck arriving on wet site access beside the steel arena frame at dusk"
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
                  alt="Close detail of slab edge, bolts, rock and drainage in wet site conditions"
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
                  alt="Storm-lit night construction scene with temporary work lights and machinery"
                  className="absolute inset-0 h-full w-full object-cover object-[55%_50%]"
                  style={{ filter: "brightness(0.8) contrast(1.12) saturate(0.78)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" duration={1100} delay={260} className="md:col-span-7">
              <div className="relative overflow-hidden aspect-[16/11]">
                <img
                  src={dozerStormSky.url}
                  alt="Dozer on muddy ground with steel arena frame under dramatic storm clouds"
                  className="absolute inset-0 h-full w-full object-cover object-[28%_50%] sm:object-center"
                  style={{ filter: "brightness(0.78) contrast(1.12) saturate(0.82)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-6xl mx-auto grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-4 space-y-5">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                  Timeline
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={120}>
                <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.8rem,1.15rem+2vw,2.8rem)]">
                  Chapters of the work.
                </h2>
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
                Back to Journal
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={120}>
              <p className="font-serif italic text-foreground/74 leading-[1.4] tracking-tight text-[clamp(1.3rem,0.95rem+1.4vw,2rem)] max-w-3xl mx-auto">
                Not polished. Not theoretical. Just the real sequence of a build finding its final form.
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
