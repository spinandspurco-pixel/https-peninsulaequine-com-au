import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { IntroContext } from "@/hooks/useIntroState";
import { useIntake } from "@/hooks/useIntake";


import lumenArcCanopy from "@/assets/lumenarc/canopy.asset.json";
import aberdeenHero from "@/assets/uploads/approved-aberdeen-rider-exterior-storm.png.asset.json";
import aberdeenArena from "@/assets/uploads/approved-stable-stall-interior-symmetric.png.asset.json";
import steelFrontAsset from "@/assets/uploads/approved-current-build-steel-frame-storm.png.asset.json";
import coveredArenaExteriorAsset from "@/assets/uploads/approved-covered-arena-interior-construction-dawn-v2.png.asset.json";


const steelFront = steelFrontAsset.url;
const coveredArenaExterior = coveredArenaExteriorAsset.url;

// Responsive webp variants for srcset (generated at 640/1024/1536w)
import ciro640 from "@/assets/responsive/ciro-ace-quiet-moment-640.webp.asset.json";
import ciro1024 from "@/assets/responsive/ciro-ace-quiet-moment-1024.webp.asset.json";
import ciro1536 from "@/assets/responsive/ciro-ace-quiet-moment-1536.webp.asset.json";
import mainRidge640 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-640.webp.asset.json";
import mainRidge1024 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-1024.webp.asset.json";
import mainRidge1536 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-1536.webp.asset.json";
import { getProjectImageAlt, getProjectResponsive } from "@/config/projectImagery";
const fieldNotesPreview = getProjectResponsive("covered-arena-stables-build", "fieldNotesPreview")!;
const fieldNotesPreviewAlt = getProjectImageAlt("covered-arena-stables-build", "fieldNotesPreview");

const srcset = (a: { url: string }, b: { url: string }, c: { url: string }) =>
  `${a.url} 640w, ${b.url} 1024w, ${c.url} 1536w`;
const ciroSrcSet = srcset(ciro640, ciro1024, ciro1536);
const mainRidgeSrcSet = srcset(mainRidge640, mainRidge1024, mainRidge1536);

const SESSION_KEY = "pe-brand-intro-seen";
const EASE = "cubic-bezier(0.45, 0, 0.15, 1)";

export default function Index() {
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [heroFade, setHeroFade] = useState(1);
  const { open: openIntake } = useIntake();

  const skipIntro = useMemo(() => {
    if (typeof window === "undefined") return true;
    if (sessionStorage.getItem(SESSION_KEY)) return true;
    return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [imageReady, setImageReady] = useState(skipIntro);
  const [headlineReady, setHeadlineReady] = useState(false);
  const [sublineReady, setSublineReady] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);
  const [headerReady, setHeaderReady] = useState(skipIntro);

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (skipIntro) {
      setImageReady(true);
      setHeaderReady(true);
      at(220, () => setHeadlineReady(true));
      at(520, () => setSublineReady(true));
      at(840, () => setCtaReady(true));
    } else {
      at(1600, () => setImageReady(true));
      at(1850, () => setHeadlineReady(true));
      at(2100, () => setSublineReady(true));
      at(2300, () => setCtaReady(true));
      at(2400, () => setHeaderReady(true));
    }

    return () => timers.forEach(clearTimeout);
  }, [skipIntro]);

  const handleScroll = useCallback(() => {
    const el = heroContentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (rect.top - vh * 0.18) / (vh * 0.52)));
    setHeroFade(progress);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <IntroContext.Provider value={{ headerLogoReady: headerReady, headerReady }}>
      <BrandIntro />
      <Layout>
        <div className="type-architectural">
          <section className="relative min-h-[100dvh] overflow-hidden flex items-end">
            <div className="absolute inset-0 bg-[hsl(222_20%_6%)]" aria-label="Homepage Hero Image placeholder" />

            {/* Readability scrim — anchored to text column, softer on the horse */}
            <div
              className="absolute inset-0 pointer-events-none hidden sm:block"
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.72) 28%, hsl(var(--background) / 0.08) 58%, hsl(var(--background) / 0.22) 100%)",
              }}
            />
            {/* Mobile: bottom-weighted scrim so the horse stays visible at top, text reads at bottom */}
            <div
              className="absolute inset-0 pointer-events-none sm:hidden"
              style={{
                background:
                  "linear-gradient(180deg, hsl(var(--background) / 0.45) 0%, hsl(var(--background) / 0.15) 30%, hsl(var(--background) / 0.55) 60%, hsl(var(--background) / 0.92) 100%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, hsl(var(--background) / 0.22) 0%, transparent 28%, hsl(var(--background) / 0.65) 100%)",
              }}
            />


            <div
              ref={heroContentRef}
              className="relative z-10 section-container w-full pb-[clamp(5rem,4rem+7vw,9rem)] pt-32"
              style={{ opacity: heroFade, willChange: "opacity" }}
            >
              <div className="max-w-[42rem] space-y-8">
                <div className="space-y-5">
                  <p
                    className="font-mono uppercase text-accent/60 text-[10px] tracking-[0.45em]"
                    style={{
                      opacity: headlineReady ? 1 : 0,
                      transform: headlineReady ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                    }}
                  >
                    Peninsula Equine
                  </p>
                  <h1
                    className="font-serif text-foreground leading-[0.9] tracking-[-0.03em]"
                    style={{
                      fontSize: "clamp(3.1rem, 2rem + 5vw, 6.2rem)",
                      opacity: headlineReady ? 1 : 0,
                      transform: headlineReady ? "translateY(0)" : "translateY(10px)",
                      transition: `opacity 1200ms ${EASE}, transform 1200ms ${EASE}`,
                      textShadow: "0 12px 42px rgba(0,0,0,0.35)",
                    }}
                  >
                    From Dirt to Dynasty
                  </h1>
                  <p
                    className="max-w-xl font-sans font-light text-foreground/90 leading-[1.8] text-[15px] sm:text-[15px]"
                    style={{
                      opacity: sublineReady ? 1 : 0,
                      transform: sublineReady ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                      textShadow: "0 2px 18px rgba(0,0,0,0.55)",
                    }}
                  >
                    Peninsula Equine designs and builds premium equine environments — with a focus
                    on covered arenas, stable structures, pavilions and supporting infrastructure
                    shaped for long-term use.
                  </p>
                </div>

                <div
                  className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
                  style={{
                    opacity: ctaReady ? 1 : 0,
                    transform: ctaReady ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                  }}
                >
                  <Link
                    to="/selected-works"
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground hover:text-foreground transition-colors duration-500 text-[11px] sm:text-[10px] tracking-[0.42em] py-3 -my-3"
                  >
                    <span className="w-9 h-px bg-accent/70 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    Explore Our Work
                  </Link>
                  <Link
                    to="/services"
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/75 hover:text-foreground transition-colors duration-500 text-[11px] sm:text-[10px] tracking-[0.42em] py-3 -my-3"
                  >
                    <span className="w-9 h-px bg-foreground/35 transition-all duration-700 group-hover:w-14 group-hover:bg-foreground/70" />
                    View Services
                  </Link>
                </div>

              </div>
            </div>
          </section>

          <div
            className="relative"
            style={{
              height: "clamp(2.5rem, 4vw, 4rem)",
              background: "linear-gradient(to bottom, hsl(var(--background) / 0) 0%, hsl(var(--background)) 100%)",
              marginTop: "-2.5rem",
              zIndex: 5,
            }}
            aria-hidden="true"
          />

          <section className="relative py-[clamp(3rem,2rem+4vw,7rem)] bg-background overflow-hidden">
            <div className="section-container max-w-5xl">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-10">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">01</span>
                  <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                  <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Discipline</span>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={120}>
                <p className="font-serif text-foreground/82 leading-[1.4] tracking-[-0.022em] text-[clamp(1.5rem,1.05rem+1.8vw,2.45rem)] max-w-4xl">
                  Covered arenas, stable structures, pavilions and integrated equine builds —
                  shaped from the ground up with structural clarity across the Mornington Peninsula and beyond.
                </p>
              </RevealOnScroll>
            </div>
          </section>

          {/* Built by Horse People — brand anchor */}
          <section className="relative py-[clamp(3.5rem,2rem+5vw,8.5rem)] bg-background overflow-hidden border-t border-accent/10">
            <div className="section-container max-w-[1480px] mx-auto">
              <div className="grid grid-cols-12 gap-[clamp(2rem,1.25rem+2vw,4rem)] items-center">
                <RevealOnScroll direction="up" duration={1300} className="col-span-12 md:col-span-7">
                  <div className="relative aspect-[4/5] sm:aspect-[5/4] md:aspect-[4/5] overflow-hidden">
                    <img
                      src={ciro1024.url}
                      srcSet={ciroSrcSet}
                      sizes="(min-width: 768px) 58vw, 100vw"
                      alt="A quiet moment between horseman and horse in low arena light — the ground Peninsula Equine builds for"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover image-bleed object-[50%_32%] sm:object-[50%_46%] md:object-[50%_38%]"
                      style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  </div>
                </RevealOnScroll>
                <div className="col-span-12 md:col-span-5 space-y-6">
                  <RevealOnScroll direction="up" duration={900}>
                    <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Built by Horse People</span>
                  </RevealOnScroll>
                  <RevealOnScroll direction="up" duration={1000} delay={120}>
                    <h2 className="font-serif text-foreground/92 leading-[1.04] tracking-[-0.022em] text-[clamp(1.75rem,1.15rem+2vw,2.7rem)]">
                      We ride the ground we build.
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-10" delay={220} />
                  <RevealOnScroll direction="up" duration={1000} delay={300}>
                    <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.95rem,0.85rem+0.25vw,1.05rem)] max-w-md">
                      Peninsula Equine is built by riders. Every covered arena, stable and pavilion
                      is shaped from the saddle out — sightlines, footing, flow and quiet detail
                      that horses and people actually feel.
                    </p>
                  </RevealOnScroll>
                </div>
              </div>
            </div>
          </section>

          <section className="relative py-[clamp(3.75rem,2.25rem+5vw,9rem)] bg-background overflow-hidden border-t border-accent/10">
            <div className="section-container max-w-[1480px] mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">02</span>
                  <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                  <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Selected Works</span>
                </div>
              </RevealOnScroll>

              <div className="grid grid-cols-12 gap-[clamp(1.5rem,1rem+1.5vw,3rem)] items-end mb-[clamp(2.5rem,1.5rem+2.5vw,4.5rem)]">
                <div className="col-span-12 md:col-span-7 space-y-5">
                  <RevealOnScroll direction="up" duration={1000} delay={120}>
                    <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-[-0.024em] text-[clamp(1.9rem,1.2rem+2.4vw,3rem)]">
                      A closer look at the work.
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-12" delay={240} />
                  <RevealOnScroll direction="up" duration={1000} delay={300}>
                    <p className="font-sans font-light text-foreground/55 leading-[1.8] text-[clamp(0.95rem,0.85rem+0.25vw,1.05rem)] max-w-xl">
                      Completed environments shown with the warmth and structural precision they were built for — from covered arenas to pavilion interiors.
                    </p>
                  </RevealOnScroll>
                </div>
                <div className="col-span-12 md:col-span-5 md:text-right">
                  <RevealOnScroll direction="up" duration={1000} delay={360}>
                    <Link
                      to="/selected-works"
                      className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                    >
                      <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                      Enter Selected Works
                    </Link>
                  </RevealOnScroll>
                </div>
              </div>

              {/* Main Ridge — full-bleed anchor */}
              <RevealOnScroll direction="up" duration={1300}>
                <Link to="/selected-works/main-ridge-pavilion" className="group block">
                  <div className="relative aspect-[5/6] sm:aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                    <img
                      src={mainRidge1536.url}
                      srcSet={mainRidgeSrcSet}
                      sizes="(min-width: 1480px) 1480px, 100vw"
                      alt="Main Ridge pavilion — wide interior with fireplace, handcrafted timber table and warm dusk light"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025] object-[50%_62%] sm:object-[50%_55%] md:object-[50%_50%]"
                      style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                  </div>
                  <div className="mt-6 pt-5 border-t border-accent/15 grid grid-cols-12 gap-4 items-baseline">
                    <div className="col-span-12 md:col-span-8 space-y-2">
                      <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.42em]">Custom Rural Build</p>
                      <p className="font-serif text-foreground/88 group-hover:text-foreground transition-colors duration-500 text-[clamp(1.35rem,1rem+1vw,1.95rem)] leading-[1.15] tracking-[-0.014em]">
                        Main Ridge Pavilion
                      </p>
                    </div>
                    <div className="col-span-12 md:col-span-4 md:text-right">
                      <p className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.45em]">Completed</p>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>

              {/* Aberdeen — secondary anchor pair */}
              <div className="mt-[clamp(2.5rem,1.75rem+2.5vw,4.5rem)] grid grid-cols-1 md:grid-cols-12 gap-[clamp(1.5rem,1rem+1.5vw,3rem)] items-stretch">
                <RevealOnScroll direction="up" duration={1300} className="md:col-span-7">
                  <Link to="/selected-works/aberdeen" className="group block h-full">
                    <div className="relative aspect-[16/10] md:aspect-[5/4] overflow-hidden h-full">
                      <img
                        src={aberdeenHero.url}
                        alt="Aberdeen stable and barn structure at twilight with warm entry glow"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                        style={{ filter: "brightness(0.76) contrast(1.08) saturate(0.78)", objectPosition: "50% 44%" }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/82 via-transparent to-transparent" />
                    </div>
                  </Link>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1300} delay={180} className="md:col-span-5">
                  <Link to="/selected-works/aberdeen" className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={aberdeenArena.url}
                        alt="Aberdeen indoor arena with black steel frame, warm overhead lighting and prepared riding surface"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                        style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.78)" }}
                      />
                    </div>
                    <div className="mt-6 pt-5 border-t border-accent/15 space-y-2">
                      <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.42em]">Indoor Arena</p>

                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-serif text-foreground/88 group-hover:text-foreground transition-colors duration-500 text-[clamp(1.2rem,0.95rem+0.85vw,1.7rem)] leading-[1.15] tracking-[-0.012em]">
                          Aberdeen
                        </p>
                        <p className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.45em]">Completed</p>
                      </div>
                    </div>
                  </Link>
                </RevealOnScroll>
              </div>
            </div>
          </section>

          {/* Field Notes — live build feature */}
          <section className="relative py-[clamp(3.5rem,2rem+5vw,8.5rem)] bg-background overflow-hidden border-t border-accent/10">
            <div className="section-container max-w-[1480px] mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">03</span>
                  <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                  <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Field Notes</span>
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1200}>
                <Link to="/field-notes/covered-arena-stables-build" className="group block">
                  <div className="relative aspect-[5/6] sm:aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                    <img
                      src={fieldNotesPreview.src}
                      srcSet={fieldNotesPreview.srcSet}
                      sizes={fieldNotesPreview.sizes}
                      alt={fieldNotesPreviewAlt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1800ms] ease-out group-hover:scale-[1.02] object-[62%_58%] sm:object-[58%_55%] md:object-[50%_50%]"
                      style={{ filter: "brightness(0.88) contrast(1.1) saturate(0.82)" }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />


                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 md:p-14 lg:p-16">
                      <div className="max-w-2xl space-y-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 font-mono uppercase text-[9.5px] tracking-[0.42em] text-accent border border-accent/45 px-3 py-1.5 bg-background/45 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            In Progress
                          </span>
                          <span className="font-mono uppercase text-foreground/45 text-[9.5px] tracking-[0.42em]">
                            Live Build · Mornington Peninsula
                          </span>
                        </div>
                        <h2 className="font-serif text-foreground/94 leading-[1.02] tracking-[-0.022em] text-[clamp(2rem,1.2rem+2.6vw,3.2rem)]">
                          Covered Arena &amp; Stables Build
                        </h2>
                        <div className="space-y-3 max-w-lg">
                          <p className="font-sans font-light text-foreground/72 leading-[1.7] text-[clamp(0.95rem,0.85rem+0.25vw,1.1rem)]">
                            Notes from the build.
                          </p>
                          <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.9rem,0.82rem+0.2vw,1rem)]">
                            Process, material and structural detail — recorded as projects move through the ground.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                          <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/82 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]">
                            <span className="w-8 h-px bg-accent/60 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                            View Field Note
                          </span>
                          <Link
                            to="/field-notes"
                            onClick={(e) => e.stopPropagation()}
                            className="group/alt inline-flex items-center gap-3 font-mono uppercase text-foreground/50 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                          >
                            <span className="w-6 h-px bg-foreground/25 transition-all duration-700 group-hover/alt:w-12 group-hover/alt:bg-foreground/60" />
                            Read Field Notes
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>

              {/* Supporting detail strip — keeps the live feel grounded */}
              <div className="mt-[clamp(1.5rem,1rem+1.5vw,2.5rem)] grid grid-cols-2 gap-[clamp(1rem,0.75rem+1vw,2rem)]">
                <RevealOnScroll direction="up" duration={1100} delay={120}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={steelFront}
                        alt="Rain-soaked current build frame aligned on axis with the wider barn structure beyond"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-out hover:scale-[1.02]"
                        style={{ filter: "brightness(0.74) contrast(1.12) saturate(0.78)" }}
                    />
                  </div>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={240}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={coveredArenaExterior}
                      alt="Covered arena interior under construction at dawn with low light entering the open span"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1600ms] ease-out hover:scale-[1.02]"
                      style={{ filter: "brightness(0.76) contrast(1.1) saturate(0.78)" }}
                    />
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </section>

          <section className="relative py-[clamp(3.5rem,2rem+5vw,8.5rem)] bg-background overflow-hidden border-t border-accent/10">
            <div className="section-container max-w-[1480px] mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">04</span>
                  <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                  <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">LumenArc</span>
                </div>
              </RevealOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-[clamp(2rem,1.25rem+2vw,3.5rem)] items-center">
                <RevealOnScroll direction="up" duration={1200} className="md:col-span-7">
                  <Link to="/lumenarc" className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={lumenArcCanopy.url}
                        alt="LumenArc recovery canopy — considered warmth and rest environment for equine wellbeing"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                        style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.82)" }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    </div>
                  </Link>
                </RevealOnScroll>
                <div className="md:col-span-5 space-y-6">
                  <RevealOnScroll direction="up" duration={1000} delay={120}>
                    <h2 className="font-serif text-foreground/92 leading-[1.04] tracking-[-0.022em] text-[clamp(1.75rem,1.15rem+2vw,2.6rem)]">
                      LumenArc Recovery Systems
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-10" delay={220} />
                  <RevealOnScroll direction="up" duration={1000} delay={300}>
                    <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px] max-w-md">
                      A considered recovery environment designed around warmth, rest and equine wellbeing.
                    </p>
                  </RevealOnScroll>
                  <RevealOnScroll direction="none" duration={1100} delay={400}>
                    <Link
                      to="/lumenarc"
                      className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/72 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                    >
                      <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                      Explore LumenArc
                    </Link>
                  </RevealOnScroll>
                </div>
              </div>
            </div>
          </section>

          <section className="relative py-[clamp(4rem,2.5rem+6vw,10rem)] bg-background overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/82 to-background" />
            <div className="relative section-container max-w-3xl mx-auto text-center space-y-[clamp(2rem,1.25rem+2.5vw,3rem)]">
              <RevealOnScroll direction="up" duration={900}>
                <div className="mx-auto flex items-baseline justify-center gap-5">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">05</span>
                  <span className="h-px w-12 bg-accent/30" />
                  <span className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.5em]">
                    Start a Project
                  </span>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={150}>
                <h2 className="font-serif text-foreground/90 leading-[1.02] tracking-[-0.02em] text-[clamp(1.95rem,1.2rem+2.8vw,3.1rem)]">
                  Ready to shape the ground beneath your next chapter?
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={300}>
                <p className="font-sans font-light text-foreground/56 leading-[1.85] text-[14px] max-w-xl mx-auto">
                  Talk to Peninsula Equine about your covered arena, stable, pavilion or integrated equine build.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="none" duration={1200} delay={380}>
                <p
                  className="font-mono uppercase italic text-[10px] tracking-[0.5em]"
                  style={{ color: "hsl(var(--muted-foreground) / 0.2)" }}
                >
                  From Dirt to Dynasty
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={450}>
                <div className="flex justify-center pt-4">
                  <button
                    onClick={openIntake}
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/78 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em] cursor-pointer"
                  >
                    <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    Start a Project
                  </button>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        </div>
      </Layout>
    </IntroContext.Provider>
  );
}
