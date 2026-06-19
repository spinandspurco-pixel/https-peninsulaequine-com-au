import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

import heroAsset from "@/assets/aberdeen/approved-barn-front-twilight.png.asset.json";
import arenaVaulted from "@/assets/covered-arenas/approved-covered-arena-interior-night.png.asset.json";
import entryCorridor from "@/assets/aberdeen/approved-arena-surfacing-forecourt.png.asset.json";


const FACTS: Array<{ label: string; value: string }> = [
  { label: "Category", value: "Indoor Arena / Stable Precinct" },
  { label: "Location", value: "Aberdeen" },
  { label: "Scope", value: "Arena / Stables / Viewing Lounge / Tack & Utility / Interior Fit-Out" },
  { label: "Status", value: "Completed" },
];

export default function Aberdeen() {
  useEffect(() => {
    document.title = "Aberdeen | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") || "";

    meta?.setAttribute(
      "content",
      "Aberdeen by Peninsula Equine — indoor arena, stable precinct, viewing lounge and refined equine facility detailing built for daily use.",
    );

    return () => {
      document.title = "Peninsula Equine";
      if (meta && previousDescription) meta.setAttribute("content", previousDescription);
    };
  }, []);

  return (
    <Layout>
      <article className="bg-background text-foreground">
        {/* ====== HERO ====== */}
        <section className="relative min-h-[82vh] overflow-hidden border-b border-accent/10">
          <img
            src={heroAsset.url}
            alt="Aberdeen stable and barn structure at twilight with symmetrical gable form and warm entry glow"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 44%", filter: "brightness(0.62) contrast(1.08) saturate(0.76)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/42 via-background/18 to-background/88" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--background)/0.72)_0%,hsl(var(--background)/0.48)_32%,transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent,hsl(var(--background)/0.42))]" />

          <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-[1480px] items-start lg:items-end px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+4vw,5rem)] pt-44 sm:pt-40 lg:pt-44">
            <div className="grid w-full grid-cols-12 gap-10 lg:gap-12 items-end">
              <div className="col-span-12 lg:col-span-7 max-w-3xl">
                <div className="mt-16 sm:mt-0 inline-block max-w-[26rem] bg-background/34 px-4 py-5 backdrop-blur-[2px] sm:max-w-none sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
                  <RevealOnScroll direction="up" duration={900}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/72">
                      Selected Works
                    </p>
                  </RevealOnScroll>
                  <RevealOnScroll direction="up" duration={1100} delay={120}>
                    <h1 className="mt-5 font-serif leading-[0.92] tracking-[-0.03em] text-primary-foreground text-[clamp(2.8rem,1.6rem+5vw,5.75rem)]">
                      Aberdeen
                    </h1>
                  </RevealOnScroll>
                  <RevealLine width="w-14" delay={260} className="mt-5 hidden sm:block" />
                  <RevealOnScroll direction="up" duration={1000} delay={320}>
                    <p className="mt-5 max-w-[36rem] font-serif text-primary-foreground/90 leading-[1.28] text-[clamp(1.05rem,0.92rem+0.55vw,1.45rem)]">
                      Indoor arena, stable precinct and viewing spaces shaped for daily use.
                    </p>
                  </RevealOnScroll>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 lg:justify-self-end w-full max-w-[460px] pt-3 sm:pt-0">
                <RevealOnScroll direction="up" duration={1100} delay={420}>
                  <div className="bg-background/32 backdrop-blur-[3px] px-5 py-5 sm:px-6 sm:py-6 border border-primary-foreground/10">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 border-t border-primary-foreground/15 pt-6">
                      {FACTS.map((fact) => (
                        <div key={fact.label} className="space-y-2">
                          <dt className="font-mono uppercase text-[9px] tracking-[0.42em] text-accent/62">
                            {fact.label}
                          </dt>
                          <dd className="font-sans font-light leading-[1.45] text-[0.95rem] text-primary-foreground/86 text-balance">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ====== SECTION 1 — INDOOR RIDING ENVIRONMENT ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1480px]">
            <RevealOnScroll direction="up" duration={1100}>
              <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                <img
                  src={arenaVaulted.url}
                  alt="Aberdeen indoor riding environment with black steel frame, warm overhead lighting and prepared arena surface"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: "50% 52%", filter: "brightness(0.8) contrast(1.08) saturate(0.76)" }}
                />
              </div>
            </RevealOnScroll>

            <div className="mt-10 grid grid-cols-12 gap-8 lg:gap-12">
              <div className="col-span-12 lg:col-span-4">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Indoor Riding Environment
                  </p>
                  <h2 className="mt-5 font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    A covered riding environment designed around structure, footing, light and year-round usability.
                  </h2>
                </RevealOnScroll>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                <RevealOnScroll direction="up" duration={1000} delay={140}>
                  <p className="font-sans font-light leading-[1.8] text-[15px] text-foreground/58 max-w-xl">
                    Scale, surface and controlled atmosphere allow training to continue regardless of weather. The arena is built to be ridden in — not just looked at.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ====== SECTION 2 — STABLE FLOW (text-led, no image) ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1120px]">
            <div className="grid grid-cols-12 gap-8 lg:gap-12">
              <div className="col-span-12 lg:col-span-3">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Stable Flow
                  </p>
                </RevealOnScroll>
              </div>
              <div className="col-span-12 lg:col-span-8 lg:col-start-5">
                <RevealOnScroll direction="up" duration={1050} delay={120}>
                  <h2 className="font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    Black steel, warm timber and practical spacing create a stable environment built for care, movement and daily handling.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-12" delay={200} className="mt-8" />
                <RevealOnScroll direction="up" duration={1000} delay={180}>
                  <p className="mt-8 max-w-xl font-sans font-light leading-[1.8] text-[15px] text-foreground/58">
                    The stable precinct is arranged around the rhythm of daily work — feed, turnout, grooming, tacking up, returning. Every dimension is shaped by what happens at 6am on a Tuesday, not by what photographs well.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ====== SECTION 3 — VIEWING & CONNECTION ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1480px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-start">
              <RevealOnScroll direction="up" duration={1100} className="lg:col-span-8">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <ImagePlaceholder
                    label="Aberdeen Viewing Lounge Image"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </RevealOnScroll>


              <div className="lg:col-span-4 lg:pt-8">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Viewing & Connection
                  </p>
                  <h2 className="mt-5 font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    The viewing space keeps riders, owners and the arena connected without interrupting the working environment.
                  </h2>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={140}>
                  <p className="mt-6 max-w-md font-sans font-light leading-[1.8] text-[15px] text-foreground/58">
                    A clear sightline from lounge to arena means observation, instruction and quiet presence are all part of the same space.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ====== SECTION 4 — DETAIL & FABRICATION ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1320px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Detail & Fabrication
                  </p>
                  <h2 className="mt-5 font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    The smaller details carry the same discipline as the larger structure — hardware, junctions, finishes and daily-use durability.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-10" delay={220} className="mt-8" />
                <RevealOnScroll direction="up" duration={1000} delay={260}>
                  <p className="mt-8 max-w-lg font-sans font-light leading-[1.8] text-[15px] text-foreground/58">
                    Black steel, warm timber, clean lines and practical finishes give the facility a refined but durable character. Every junction is resolved because the early work was done properly.
                  </p>
                </RevealOnScroll>
              </div>

              <RevealOnScroll direction="up" duration={1150} className="lg:col-span-7 order-1 lg:order-2">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={entryCorridor.url}
                    alt="Arena surfacing forecourt outside the Aberdeen stable precinct with groomed footing and the long barn form beyond"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: "50% 50%", filter: "brightness(0.8) contrast(1.08) saturate(0.78)" }}
                  />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ====== SECTION 5 — UTILITY / TACK / CARE SPACES (text-led, no image) ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1120px]">
            <div className="grid grid-cols-12 gap-8 lg:gap-12">
              <div className="col-span-12 lg:col-span-3">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Utility / Tack / Care
                  </p>
                </RevealOnScroll>
              </div>
              <div className="col-span-12 lg:col-span-8 lg:col-start-5">
                <RevealOnScroll direction="up" duration={1050} delay={120}>
                  <h2 className="font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    Support spaces are part of the system, not afterthoughts.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-12" delay={200} className="mt-8" />
                <RevealOnScroll direction="up" duration={1000} delay={180}>
                  <p className="mt-8 max-w-xl font-sans font-light leading-[1.8] text-[15px] text-foreground/58">
                    Tack rooms, wash bays, feed storage and utility areas are planned into the layout from the first sketch. When the daily workflow is considered early, the building becomes easier to maintain and more pleasant to use.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ====== CLOSING CTA ====== */}
        <section className="bg-background py-[clamp(5rem,4rem+5vw,8rem)]">
          <div className="section-container mx-auto max-w-5xl px-6 text-center">
            <RevealOnScroll direction="up" duration={1000}>
              <p className="font-serif text-foreground/88 leading-[1.18] tracking-[-0.022em] text-[clamp(1.7rem,1.2rem+1.7vw,2.6rem)]">
                Start with the ground. Build the legacy.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={140}>
              <p className="mx-auto mt-6 max-w-xl font-sans font-light leading-[1.7] text-[15px] text-foreground/55">
                Talk to Peninsula Equine about arenas, equine facilities and rural builds that need to perform without compromise.
              </p>
            </RevealOnScroll>
            <RevealLine width="w-12" delay={240} className="mx-auto mt-12" />
            <RevealOnScroll direction="up" duration={1100} delay={260}>
              <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
                <Link
                  to="/selected-works"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-[10px] tracking-[0.42em] text-foreground/62 transition-colors duration-500 hover:text-foreground"
                >
                  <span className="h-px w-8 bg-accent/45 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  Back to Selected Works
                </Link>
                <Link
                  to="/site-assessment"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-[10px] tracking-[0.42em] text-accent transition-colors duration-500 hover:text-foreground"
                >
                  Request Assessment
                  <span className="h-px w-8 bg-accent transition-all duration-700 group-hover:w-14" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
