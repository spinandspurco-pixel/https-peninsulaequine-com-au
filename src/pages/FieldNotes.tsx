import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";

import {
  getProjectImage,
  getProjectImageAlt,
  getProjectResponsive,
} from "@/config/projectImagery";

const SLUG = "covered-arena-stables-build";
const heroResp = getProjectResponsive(SLUG, "fieldNotesHero")!;
const heroDrone = heroResp.src;
const heroDroneSrcSet = heroResp.srcSet;
const heroDroneAlt = getProjectImageAlt(SLUG, "fieldNotesHero");
const steelFront = getProjectImage(SLUG, "caseStudyHero").url;
const steelFrontAlt = getProjectImageAlt(SLUG, "caseStudyHero");
const sitewideProgress = getProjectImage(SLUG, "fieldNotesGalleryA").url;
const sitewideProgressAlt = getProjectImageAlt(SLUG, "fieldNotesGalleryA");
const redClayRoofline = getProjectImage(SLUG, "fieldNotesGalleryB").url;
const redClayRooflineAlt = getProjectImageAlt(SLUG, "fieldNotesGalleryB");
const conditionsResp = getProjectResponsive(SLUG, "fieldNotesConditions")!;
const conditionsAlt = getProjectImageAlt(SLUG, "fieldNotesConditions");

export default function FieldNotes() {
  useEffect(() => {
    document.title = "Field Notes | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Field Notes follows active Peninsula Equine builds through real conditions — structural steel, red clay, drainage and site progress across the Mornington Peninsula.",
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
            src={heroDrone}
            srcSet={heroDroneSrcSet}
            sizes="100vw"
            alt={heroDroneAlt}
            className="absolute inset-0 h-full w-full object-cover object-[62%_48%] sm:object-[58%_48%] lg:object-center"
            loading="eager"
            decoding="async"
            // @ts-expect-error valid HTML attribute
            fetchpriority="high"
            style={{ filter: "brightness(0.7) contrast(1.12) saturate(0.8)" }}
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
                  A current read on Peninsula Equine projects in motion — steel, weather, red clay,
                  access, drainage and the practical layers that make the finished environment work.
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
                    Covered Arena &amp; Stables Build
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={220} />
                <RevealOnScroll direction="up" duration={1000} delay={300}>
                  <div className="space-y-3 text-[14px] sm:text-[15px] font-light leading-[1.9] text-foreground/52">
                    <p><span className="text-accent/60">Status</span> — In Progress</p>
                    <p><span className="text-accent/60">Location</span> — Mornington Peninsula</p>
                    <p>
                      Structural steel, undercover arena works and stable infrastructure in progress.
                    </p>
                  </div>
                </RevealOnScroll>
              </div>

              <div className="col-span-12 lg:col-span-8">
                <RevealOnScroll direction="up" duration={1200}>
                  <Link to="/field-notes/covered-arena-stables-build" className="group block">
                    <article className="relative overflow-hidden">
                      <div className="relative aspect-[4/5] sm:aspect-[16/10] xl:aspect-[16/8] overflow-hidden">
                        <img
                          src={steelFront}
                          alt={steelFrontAlt}
                          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
                          style={{ filter: "brightness(0.78) contrast(1.12) saturate(0.82)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
                        <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-8 lg:p-10">
                          <div className="max-w-xl space-y-4">
                            <p className="font-mono uppercase text-accent/60 text-[10px] tracking-[0.42em]">
                              Current Project
                            </p>
                            <h3 className="font-serif text-foreground/94 leading-[1.02] tracking-tight text-[clamp(1.6rem,1.1rem+1.8vw,2.5rem)]">
                              Covered Arena &amp; Stables Build
                            </h3>
                            <p className="font-sans font-light text-foreground/62 leading-[1.8] text-[14px] sm:text-[15px] max-w-lg">
                              Structural steel, undercover arena works and stable infrastructure in progress.
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

        {/* Real Conditions — full-bleed cinematic divider */}
        {/*
          CROP-SAFETY CONTRACT — DO NOT MODIFY WITHOUT REVIEW
          -----------------------------------------------------
          This image contains two critical edge-dominant focal points:
            • Muddy work boots in red clay (bottom-left)
            • Rising steel-frame arena structure (right)
          Because both sit close to opposing edges, ANY change to the
          container ratio, object-fit or object-position risks cropping
          one or both on mobile or narrow viewports.

          Locked rules (violating any of them re-introduces cropping):
            1. Container aspectRatio is HARD-CODED to "3 / 2" — the
               image's exact native ratio — via inline style. Do NOT
               switch to responsive Tailwind aspect utilities.
            2. object-contain (not object-cover) is the authoritative
               fail-safe. If a future edit mutates the container, the
               full frame still renders letterboxed instead of clipped.
            3. Intrinsic width={1536} height={1024} prevents the browser
               from reserving a wrong-ratio box before decode (CLS),
               which would temporarily crop edges during load.
            4. object-center keeps the frame perfectly centred; no
               directional object-position shifts the crop window.

          Before changing anything above, verify the live preview at
          320 px, 384 px, 768 px and 1440 px breakpoints.
          -----------------------------------------------------
        */}
        <section className="relative w-full overflow-hidden border-t border-accent/10">
          <div
            className="relative w-full bg-background"
            style={{ aspectRatio: "3 / 2" }}
          >
            <img
              src={conditionsResp.src}
              srcSet={conditionsResp.srcSet}
              sizes={conditionsResp.sizes}
              alt={conditionsAlt}
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain object-center"
              style={{ filter: "brightness(0.86) contrast(1.1) saturate(0.85)" }}
            />
            {/* subtle dark gradient for text legibility — keeps mud + steel readable */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 sm:w-2/5 bg-gradient-to-r from-background/70 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-16">
              <div className="section-container max-w-[1480px] mx-auto">
                <div className="max-w-2xl space-y-4 sm:space-y-6">
                  <RevealOnScroll direction="up" duration={900}>
                    <p className="font-mono uppercase text-accent/65 text-[10px] tracking-[0.48em]">
                      Real Conditions
                    </p>
                  </RevealOnScroll>
                  <RevealOnScroll direction="up" duration={1100} delay={140}>
                    <h2 className="font-serif text-foreground leading-[0.96] tracking-tight text-[clamp(1.8rem,1.15rem+2.2vw,3rem)]">
                      Real progress. Real conditions. Real builds.
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-10" delay={260} />
                  <RevealOnScroll direction="up" duration={1100} delay={320}>
                    <p className="font-sans font-light text-foreground/70 leading-[1.85] text-[14px] sm:text-[15px] max-w-xl">
                      Field Notes captures the work while it is still alive — the mud, weather,
                      machinery, steel and decisions that shape the finished environment.
                    </p>
                  </RevealOnScroll>
                </div>
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
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Build Read</span>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
              <RevealOnScroll direction="up" duration={1100} className="md:col-span-8">
                <div className="relative overflow-hidden aspect-[16/10] lg:aspect-[21/10]">
                  <img
                    src={sitewideProgress}
                    alt={sitewideProgressAlt}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={120} className="md:col-span-4">
                <div className="relative overflow-hidden aspect-[4/5] md:h-full md:aspect-auto min-h-[320px]">
                  <img
                    src={redClayRoofline}
                    alt={redClayRooflineAlt}
                    className="absolute inset-0 h-full w-full object-cover object-[54%_50%]"
                    style={{ filter: "brightness(0.78) contrast(1.1) saturate(0.8)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/35 to-transparent" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                Current build
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={120}>
              <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.9rem,1.2rem+2.5vw,3.2rem)]">
                The work is honest in the middle.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={240}>
              <p className="font-sans font-light text-foreground/56 leading-[1.85] text-[14px] sm:text-[15px] max-w-2xl mx-auto">
                Steel rising, rooflines forming, drainage decisions, machinery movement and ground conditions —
                this is where performance starts long before the finish.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="none" duration={1100} delay={320}>
              <Link
                to="/field-notes/covered-arena-stables-build"
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
