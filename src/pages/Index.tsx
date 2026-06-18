import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { IntroContext } from "@/hooks/useIntroState";
import { useIntake } from "@/hooks/useIntake";

import goldenHourPavilion from "@/assets/golden-hour-pavilion.png.asset.json";
import goldenHourPavilion800 from "@/assets/golden-hour-pavilion-800.webp.asset.json";
import goldenHourPavilion1200 from "@/assets/golden-hour-pavilion-1200.webp.asset.json";
import goldenHourPavilion1600 from "@/assets/golden-hour-pavilion-1600.webp.asset.json";
import serviceArenas from "@/assets/homepage-services/arenas.png.asset.json";
import serviceGroundworks from "@/assets/homepage-services/groundworks.png.asset.json";
import fieldNoteAsset from "@/assets/main-ridge/mr-pendant-beams.png.asset.json";

import slidingStopHero from "@/assets/homepage-refresh/sliding-stop-hero.png.asset.json";
import coveredArenaExterior from "@/assets/covered-arena-black-exterior.jpg";

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
      // Reveal homepage hero underneath the intro overlay BEFORE it dissolves,
      // so the hero is already fully composed when the overlay fades out (no flicker).
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
          <img
            src={slidingStopHero.url}
            alt="Sliding stop horse throwing warm arena dirt through late light"
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={1080}
            loading="eager"
            decoding="async"
            // @ts-expect-error valid HTML attribute
            fetchpriority="high"
            style={{
              objectPosition: "78% 58%",
              filter: imageReady
                ? "brightness(0.8) contrast(1.12) saturate(0.82)"
                : "brightness(0.42) contrast(1.05) saturate(0.7) blur(12px)",
              transform: imageReady ? "scale(1)" : "scale(1.035)",
              transition: `filter 1400ms ${EASE}, transform 1400ms ${EASE}`,
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--background) / 0.94) 0%, hsl(var(--background) / 0.78) 30%, hsl(var(--background) / 0.12) 58%, hsl(var(--background) / 0.25) 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--background) / 0.22) 0%, transparent 28%, hsl(var(--background) / 0.7) 100%)",
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
                  className="max-w-xl font-sans font-light text-foreground/72 leading-[1.8] text-[14px] sm:text-[15px]"
                  style={{
                    opacity: sublineReady ? 1 : 0,
                    transform: sublineReady ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                  }}
                >
                  Equine environments built by horse people — from the ground beneath the ride to the
                  structures that shape the property.
                </p>
              </div>

              <div
                className="flex flex-col sm:flex-row items-start gap-4"
                style={{
                  opacity: ctaReady ? 1 : 0,
                  transform: ctaReady ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                }}
              >
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/82 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  <span className="w-8 h-px bg-accent/55 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  Explore Our Work
                </Link>
                <Link
                  to="/services"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/54 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                >
                  <span className="w-8 h-px bg-foreground/20 transition-all duration-700 group-hover:w-14 group-hover:bg-foreground/55" />
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

        <section className="relative py-[clamp(4.5rem,3rem+5vw,8rem)] bg-background overflow-hidden">
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
                Arenas, stables, groundworks and rural builds — shaped from the ground up across the
                Mornington Peninsula and beyond.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* 02 — Selected Works: image-led editorial preview */}
        <section className="relative py-[clamp(6rem,4rem+7vw,11rem)] bg-background overflow-hidden border-t border-accent/10">
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
                    A curated look at the builds, materials and environments shaped from the ground up.
                  </p>
                </RevealOnScroll>
              </div>
              <div className="col-span-12 md:col-span-5 md:text-right">
                <RevealOnScroll direction="up" duration={1000} delay={360}>
                  <Link
                    to="/gallery"
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
                  >
                    <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    Enter Selected Works
                  </Link>
                </RevealOnScroll>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-[clamp(1.75rem,1.25rem+2vw,3.5rem)] items-start">
              <RevealOnScroll direction="up" duration={1300} className="md:col-span-8">
                <Link to="/selected-works/main-ridge-pavilion" className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <picture className="absolute inset-0 w-full h-full">
                      <source
                        srcSet={`${goldenHourPavilion800.url} 800w, ${goldenHourPavilion1200.url} 1200w, ${goldenHourPavilion1600.url} 1600w`}
                        sizes="(min-width: 768px) 66vw, 100vw"
                        type="image/webp"
                      />
                      <img
                        src={goldenHourPavilion.url}
                        alt="Wide moody interior of the Main Ridge pavilion at dusk with fireplace and long handcrafted timber table"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                        style={{ filter: "brightness(0.8) contrast(1.1) saturate(0.8)" }}
                      />
                    </picture>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background)/0.5)_100%)]" />
                  </div>
                  <div className="mt-6 pt-5 border-t border-accent/15 flex items-baseline justify-between gap-4">
                    <p className="font-serif text-foreground/85 group-hover:text-foreground transition-colors duration-500 text-[clamp(1.15rem,0.95rem+0.7vw,1.6rem)] leading-[1.2] tracking-[-0.012em]">
                      Main Ridge Pavilion
                    </p>
                    <p className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.45em]">Custom Rural Build</p>
                  </div>
                </Link>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1300} delay={220} className="md:col-span-4 md:mt-24">
                <Link to="/gallery" className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={coveredArenaExterior}
                      alt="Steel-frame covered competition arena progress build"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                      style={{ objectPosition: "50% 55%", filter: "brightness(0.78) contrast(1.12) saturate(0.78)" }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background)/0.5)_100%)]" />
                  </div>
                  <div className="mt-6 pt-5 border-t border-accent/15 flex items-baseline justify-between gap-4">
                    <p className="font-serif text-foreground/85 group-hover:text-foreground transition-colors duration-500 text-[clamp(1.05rem,0.9rem+0.5vw,1.35rem)] leading-[1.2] tracking-[-0.01em]">
                      Covered Competition Arena
                    </p>
                    <p className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.45em]">Arena</p>
                  </div>
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>




        {/* 03 — Field Notes teaser */}
        <section className="relative py-[clamp(6rem,4rem+7vw,10rem)] bg-background overflow-hidden border-t border-accent/10">
          <div className="section-container max-w-[1480px] mx-auto">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">03</span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Field Notes</span>
              </div>
            </RevealOnScroll>
            <div className="grid grid-cols-12 gap-[clamp(2rem,1.25rem+2.5vw,4.5rem)] items-center">
              <RevealOnScroll direction="up" duration={1200} className="col-span-12 md:col-span-8">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={fieldNoteAsset.url}
                    alt="Pendant lighting suspended between heavy timber beams inside the Main Ridge build"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover image-bleed"
                    style={{ filter: "brightness(0.8) contrast(1.12) saturate(0.78)" }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background)/0.55)_100%)]" />
                </div>
              </RevealOnScroll>
              <div className="col-span-12 md:col-span-4 space-y-6">
                <RevealOnScroll direction="up" duration={1000} delay={120}>
                  <h2 className="font-serif text-foreground/92 leading-[1.05] tracking-[-0.022em] text-[clamp(1.75rem,1.15rem+2.2vw,2.7rem)]">
                    Notes from the build.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-10" delay={240} />
                <RevealOnScroll direction="up" duration={1000} delay={300}>
                  <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.9rem,0.82rem+0.2vw,1rem)] max-w-md">
                    Process, material and detail — recorded as projects move through the ground.
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={400}>
                  <Link
                    to="/field-notes"
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em] pt-2"
                  >
                    <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    Read Field Notes
                  </Link>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>


        <section className="relative py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background overflow-hidden">
          <img
            src={serviceGroundworks.url}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.22]"
            style={{ filter: "brightness(0.48) contrast(1.1) saturate(0.7)", objectPosition: "42% 52%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/82 to-background" />
          <div className="relative section-container max-w-3xl mx-auto text-center space-y-[clamp(2rem,1.25rem+2.5vw,3rem)]">
            <RevealOnScroll direction="up" duration={900}>
              <div className="mx-auto flex items-baseline justify-center gap-5">
                <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">04</span>
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
                Talk to Peninsula Equine about your arena, stable, groundwork or rural build.
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
