import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { IntroContext } from "@/hooks/useIntroState";
import { useIntake } from "@/hooks/useIntake";

import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import mainRidgeSitePrep from "@/assets/main-ridge-site-prep.jpg";
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";

import goldenHourPavilion from "@/assets/golden-hour-pavilion.png.asset.json";
import goldenHourPavilion800 from "@/assets/golden-hour-pavilion-800.webp.asset.json";
import goldenHourPavilion1200 from "@/assets/golden-hour-pavilion-1200.webp.asset.json";
import goldenHourPavilion1600 from "@/assets/golden-hour-pavilion-1600.webp.asset.json";
import serviceArenas from "@/assets/homepage-services/arenas.png.asset.json";
import serviceGroundworks from "@/assets/homepage-services/groundworks.png.asset.json";

import slidingStopHero from "@/assets/homepage-refresh/sliding-stop-hero.png.asset.json";

const SESSION_KEY = "pe-brand-intro-seen";
const EASE = "cubic-bezier(0.45, 0, 0.15, 1)";


const featuredWorks = [
  {
    slug: "main-ridge",
    title: "Main Ridge",
    location: "Mornington Peninsula",
    kind: "Flagship — Pavilion / Arena / Property",
    image: mainRidgeInterior,
    alt: "Main Ridge pavilion interior with exposed timber framing in evening light",
    summary:
      "A full property build — ground, shelter and finish resolved as one environment.",
  },
  {
    slug: "aberdeen-farm",
    title: "Private Estate",
    location: "Mornington Peninsula",
    kind: "Stable Complex",
    image: aberdeenExterior,
    alt: "Private estate stable exterior in late afternoon light",
    summary: "Stable complex built for daily horse use — airflow, finish and flow.",
  },
  {
    slug: "equitana",
    title: "Equitana Melbourne",
    location: "Melbourne",
    kind: "Event Arena",
    image: equitanaArena1,
    alt: "Equitana Melbourne competition arena surface prepared for an event",
    summary: "Competition-grade arena work delivered under event pressure.",
  },
];

const fieldNotesChapters = [
  "Groundwork",
  "Structure",
  "Materials",
  "Final reveal",
];

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
      at(2700, () => setImageReady(true));
      at(3200, () => setHeadlineReady(true));
      at(3500, () => setSublineReady(true));
      at(3825, () => setCtaReady(true));
      at(4000, () => setHeaderReady(true));
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

        <section className="relative py-[clamp(3.75rem,3rem+4vw,6.75rem)] bg-background overflow-hidden">
          <div className="section-container max-w-5xl">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-serif text-foreground/82 leading-[1.45] tracking-[-0.02em] text-[clamp(1.4rem,1.05rem+1.5vw,2.2rem)] max-w-4xl">
                Arenas, stables, groundworks and rural builds — shaped from the ground up across the
                Mornington Peninsula and beyond.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section className="relative py-[clamp(5.5rem,4rem+6vw,10rem)] bg-background overflow-hidden">
          <div className="section-container max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-[clamp(1.5rem,1rem+2vw,3.5rem)] items-start">
              <RevealOnScroll direction="up" duration={1200}>
                <div className="md:col-span-7">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <picture className="absolute inset-0 w-full h-full">
                      <source
                        srcSet={`${goldenHourPavilion800.url} 800w, ${goldenHourPavilion1200.url} 1200w, ${goldenHourPavilion1600.url} 1600w`}
                        sizes="(min-width: 768px) 58vw, 100vw"
                        type="image/webp"
                      />
                      <img
                        src={goldenHourPavilion.url}
                        alt="Warm evening light inside the Main Ridge timber pavilion with corrugated iron and open framing"
                        loading="lazy"
                        decoding="async"
                        width={1672}
                        height={941}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
                      />
                    </picture>
                  </div>
                  <div className="mt-6 space-y-1.5">
                    <p className="font-mono uppercase text-accent/45 text-[10px] tracking-[0.45em]">
                      Flagship Build
                    </p>
                    <p className="font-serif text-foreground/75 text-[clamp(1.1rem,0.9rem+0.6vw,1.45rem)] leading-[1.2] tracking-[-0.01em]">
                      Main Ridge Pavilion
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1200} delay={200}>
                <div className="md:col-span-5 md:mt-28">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={serviceArenas.url}
                      alt="Arena groundwork at golden hour inside a covered equestrian structure"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: "50% 58%", filter: "brightness(0.8) contrast(1.12) saturate(0.78)" }}
                    />
                  </div>
                  <div className="mt-6 space-y-1.5">
                    <p className="font-mono uppercase text-accent/45 text-[10px] tracking-[0.45em]">
                      Arenas
                    </p>
                    <p className="font-serif text-foreground/75 text-[clamp(1.1rem,0.9rem+0.6vw,1.45rem)] leading-[1.2] tracking-[-0.01em]">
                      Covered Competition Arena
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>


        <section className="relative py-[clamp(6rem,4rem+8vw,11rem)] bg-background overflow-hidden">
          <div className="section-container max-w-7xl mx-auto">
            <div className="mb-[clamp(3rem,2rem+3vw,5rem)] grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 md:col-span-7 space-y-3">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                    Selected Works
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={150}>
                  <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.85rem,1.2rem+2.4vw,2.85rem)]">
                    Selected Works
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={300} />
              </div>
              <div className="col-span-12 md:col-span-5 md:text-right">
                <RevealOnScroll direction="up" duration={1000} delay={350}>
                  <p className="font-sans font-light text-foreground/50 leading-[1.85] text-[14px] max-w-sm md:ml-auto">
                    A closer look at the builds, details and environments shaped from the ground up.
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[clamp(1rem,0.5rem+1vw,1.5rem)]">
              {featuredWorks.map((project, i) => (
                <RevealOnScroll key={project.slug} direction="up" delay={i * 120}>
                  <Link to={`/project/${project.slug}`} className="group block overflow-hidden rounded-sm bg-card h-full">
                    <div className="relative aspect-[5/6] overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.alt}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.04]"
                        style={{ filter: "brightness(0.84) contrast(1.1) saturate(0.8)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                      <span className="absolute top-4 left-4 font-mono uppercase text-accent/70 text-[10px] tracking-[0.38em]">
                        0{i + 1} — {project.kind}
                      </span>
                    </div>
                    <div className="p-[clamp(1.25rem,1rem+1vw,1.75rem)] space-y-4">
                      <div className="space-y-2">
                        <p className="font-mono uppercase text-foreground/35 text-[10px] tracking-[0.4em]">
                          {project.location}
                        </p>
                        <h3 className="font-serif text-foreground/90 leading-[1.08] tracking-[-0.02em] text-[clamp(1.4rem,1.1rem+1vw,1.8rem)] group-hover:text-accent transition-colors duration-700">
                          {project.title}
                        </h3>
                      </div>
                      <p className="font-sans font-light text-foreground/50 leading-[1.8] text-[13px]">
                        {project.summary}
                      </p>
                      <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/68 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em] pt-1">
                        <span className="w-6 h-px bg-accent/45 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                        View project
                      </span>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            <div className="mt-[clamp(3rem,2rem+3vw,4.5rem)] flex justify-center">
              <RevealOnScroll direction="up" duration={900}>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/55 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em]"
                >
                  <span className="w-6 h-px bg-accent/40 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  Explore Selected Works
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="relative py-[clamp(6rem,4rem+8vw,10rem)] bg-card overflow-hidden">
          <div className="section-container max-w-7xl mx-auto grid grid-cols-12 gap-[clamp(1.5rem,1rem+2vw,3rem)] items-center">
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                  Field Notes
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={150}>
                <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.8rem,1.15rem+2.2vw,2.7rem)]">
                  Field Notes
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
              <RevealOnScroll direction="up" duration={1000} delay={350}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] max-w-lg">
                  Follow current projects as they move from raw groundwork to finished equine environments.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={450}>
                <ul className="space-y-3 border-t border-foreground/[0.08] pt-5">
                  {fieldNotesChapters.map((chapter) => (
                    <li key={chapter} className="flex items-center justify-between gap-4">
                      <span className="font-serif text-foreground/82 text-[1.05rem]">{chapter}</span>
                      <span className="font-mono text-[10px] tracking-[0.38em] uppercase text-foreground/30">
                        Current
                      </span>
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={900} delay={550}>
                <Link
                  to="/field-notes"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em]"
                >
                  <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  Enter Field Notes
                </Link>
              </RevealOnScroll>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <RevealOnScroll direction="up" duration={1200}>
                <Link to="/field-notes" className="group block">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8 relative aspect-[5/4] overflow-hidden rounded-sm">
                      <img
                        src={mainRidgeSitePrep}
                        alt="Main Ridge groundwork and early site preparation in warm rural light"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.03]"
                        style={{ filter: "brightness(0.8) contrast(1.12) saturate(0.78)", objectPosition: "50% 50%" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/55 via-transparent to-transparent" />
                    </div>
                    <div className="col-span-6 md:col-span-4 relative aspect-[4/5] overflow-hidden rounded-sm">
                      <img
                        src={mainRidgeBrickwork}
                        alt="Brickwork and material detail during a Peninsula Equine build"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "brightness(0.82) contrast(1.08) saturate(0.8)", objectPosition: "50% 54%" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent" />
                    </div>
                    <div className="col-span-6 md:col-span-4 md:col-start-9 relative aspect-[4/5] overflow-hidden rounded-sm md:-mt-20">
                      <img
                        src={mainRidgeTimber}
                        alt="Timber material detail from a Peninsula Equine custom rural build"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: "brightness(0.8) contrast(1.08) saturate(0.78)", objectPosition: "50% 45%" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/45 via-transparent to-transparent" />
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
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
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.5em]">
                Start a Project
              </p>
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
      </Layout>
    </IntroContext.Provider>
  );
}
