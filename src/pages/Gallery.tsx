import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";

import pavilionWide from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import fireplacePortrait from "@/assets/main-ridge/main-ridge-pavilion-brick-fireplace-detail.png.asset.json";
import parrillaWide from "@/assets/main-ridge/mr-parrilla-wide.png.asset.json";
import aberdeenHero from "@/assets/aberdeen/hero-entrance-twilight.png.asset.json";
import { getProjectImage, getProjectImageAlt } from "@/config/projectImagery";
const currentArenaHero = getProjectImage("covered-arena-stables-build", "selectedWorks").url;
const currentArenaAlt = getProjectImageAlt("covered-arena-stables-build", "selectedWorks");

const FILTER = "brightness(0.82) contrast(1.1) saturate(0.8)";

export default function Projects() {
  useEffect(() => {
    document.title = "Selected Works | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Selected Works from Peninsula Equine — completed rural builds, indoor arenas and current equine projects across the Mornington Peninsula.",
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural">
        <section className="relative pt-44 sm:pt-52 pb-16 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 engineering-grid opacity-[0.03]" aria-hidden="true" />
          <div className="section-container max-w-4xl mx-auto text-center relative z-10">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
                Selected Works
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={150}>
              <h1 className="mt-8 font-serif text-foreground leading-[0.95] tracking-tight text-[clamp(2.4rem,1.4rem+4.6vw,5.4rem)]">
                Built work, current work, clearly separated.
              </h1>
            </RevealOnScroll>
            <RevealLine width="w-10" delay={280} className="mx-auto mt-10" />
            <RevealOnScroll direction="up" duration={1000} delay={340}>
              <p className="mt-10 max-w-xl mx-auto font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px]">
                Completed projects sit here with clarity. Current builds stay honest inside Field Notes until they are resolved.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">01</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Completed</span>
              </div>
            </RevealOnScroll>

            <Link to="/selected-works/main-ridge-pavilion" className="group block">
              <RevealOnScroll direction="up" duration={1300}>
                <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                  <img
                    src={pavilionWide.url}
                    alt="Main Ridge Pavilion at dusk — handcrafted timber table, brick fireplace and open rural outlook"
                    className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                    loading="lazy"
                    decoding="async"
                    style={{ filter: FILTER }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                </div>
              </RevealOnScroll>

              <div className="mt-8 grid grid-cols-12 gap-6 lg:gap-12 items-end">
                <div className="col-span-12 md:col-span-7 space-y-4">
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.42em]">
                    Custom Rural Build
                  </p>
                  <h2 className="font-serif text-foreground/92 group-hover:text-foreground transition-colors duration-500 leading-[1.02] tracking-tight text-[clamp(1.9rem,1.2rem+2.4vw,3.1rem)]">
                    Main Ridge Pavilion
                  </h2>
                  <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px] max-w-xl">
                    Pavilion, Parrilla Grill &amp; Handcrafted Dining Setting.
                  </p>
                </div>
                <div className="col-span-12 md:col-span-5 md:text-right space-y-2">
                  <p className="font-mono uppercase text-accent/45 text-[9.5px] tracking-[0.42em]">Status — Completed</p>
                  <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/72 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]">
                    <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    View Project
                  </span>
                </div>
              </div>
            </Link>

            <div className="mt-[clamp(2.5rem,1.5rem+2.5vw,4rem)] grid grid-cols-1 md:grid-cols-12 gap-[clamp(1.5rem,1rem+1.5vw,3rem)]">
              <RevealOnScroll direction="up" duration={1100} className="md:col-span-5">
                <Link to="/selected-works/main-ridge-pavilion" className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={fireplacePortrait.url}
                      alt="Brick wall and bronze wall light detail inside the Main Ridge Pavilion"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                      style={{ filter: "brightness(0.84) contrast(1.1) saturate(0.8)" }}
                    />
                  </div>
                </Link>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={150} className="md:col-span-7">
                <Link to="/selected-works/main-ridge-pavilion" className="group block">
                  <div className="relative aspect-[16/10] md:aspect-[5/4] overflow-hidden">
                    <img
                      src={parrillaWide.url}
                      alt="Wide view of the brick parrilla grill and fireplace anchoring the Main Ridge Pavilion"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                      style={{ filter: "brightness(0.82) contrast(1.12) saturate(0.82)" }}
                    />
                  </div>
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">02</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Completed</span>
              </div>
            </RevealOnScroll>

            <Link to="/selected-works/aberdeen" className="group block">
              <RevealOnScroll direction="up" duration={1200}>
                <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                  <img
                    src={aberdeenHero.url}
                    alt="Aberdeen — symmetrical equine facility entrance at twilight with warm internal glow"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                    style={{ filter: "brightness(0.72) contrast(1.08) saturate(0.76)", objectPosition: "50% 42%" }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                </div>
              </RevealOnScroll>

              <div className="mt-8 grid grid-cols-12 gap-6 lg:gap-12 items-end">
                <div className="col-span-12 md:col-span-7 space-y-4">
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.42em]">
                    Indoor Arena / Equine Facility / Architectural Fit-Out
                  </p>
                  <h2 className="font-serif text-foreground/92 group-hover:text-foreground transition-colors duration-500 leading-[1.02] tracking-tight text-[clamp(1.9rem,1.2rem+2.4vw,3.1rem)]">
                    Aberdeen
                  </h2>
                  <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px] max-w-xl">
                    Indoor Arena, Viewing Lounge &amp; Equine Facility Detailing.
                  </p>
                </div>
                <div className="col-span-12 md:col-span-5 md:text-right space-y-2">
                  <p className="font-mono uppercase text-accent/45 text-[9.5px] tracking-[0.42em]">Status — Completed</p>
                  <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/72 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]">
                    <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    View Project
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(5rem,3rem+6vw,9rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">03</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">In Progress</span>
              </div>
            </RevealOnScroll>

            <Link to="/field-notes/covered-arena-stables-build" className="group block">
              <RevealOnScroll direction="up" duration={1200}>
                <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                  <img
                    src={currentArenaHero}
                    alt="Covered Arena & Stables Build in progress — steel frame, roofing works and red clay site conditions"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                    style={{ filter: "brightness(0.78) contrast(1.12) saturate(0.82)", objectPosition: "55% 50%" }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                </div>
              </RevealOnScroll>

              <div className="mt-8 grid grid-cols-12 gap-6 lg:gap-12 items-end">
                <div className="col-span-12 md:col-span-7 space-y-4">
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.42em]">
                    Current Project / Arena / Stables
                  </p>
                  <h2 className="font-serif text-foreground/92 group-hover:text-foreground transition-colors duration-500 leading-[1.02] tracking-tight text-[clamp(1.9rem,1.2rem+2.4vw,3.1rem)]">
                    Covered Arena &amp; Stables Build
                  </h2>
                  <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px] max-w-xl">
                    Structural steel, undercover arena works and stable infrastructure in progress.
                  </p>
                </div>
                <div className="col-span-12 md:col-span-5 md:text-right space-y-2">
                  <p className="font-mono uppercase text-accent/45 text-[9.5px] tracking-[0.42em]">Status — In Progress</p>
                  <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/72 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]">
                    <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    View Field Note
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="relative border-t border-accent/10 py-[clamp(6rem,4rem+7vw,11rem)]">
          <div className="section-container max-w-3xl mx-auto text-center space-y-8">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/25">
                From groundwork to finished environment
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={150}>
              <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-tight text-[clamp(1.9rem,1.2rem+2.6vw,3rem)]">
                Start the next one with us.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="none" duration={1100} delay={280}>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/72 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
              >
                <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                Start a Project
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </Layout>
  );
}
