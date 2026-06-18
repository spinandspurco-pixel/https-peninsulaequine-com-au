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

import serviceArenas from "@/assets/homepage-services/arenas.png.asset.json";
import serviceStables from "@/assets/homepage-services/stables.png.asset.json";
import serviceInfrastructure from "@/assets/homepage-services/infrastructure.png.asset.json";
import serviceGroundworks from "@/assets/homepage-services/groundworks.png.asset.json";
import serviceCustom from "@/assets/homepage-services/custom-rural-builds.png.asset.json";
import serviceDrainage from "@/assets/homepage-services/drainage.png.asset.json";

import slidingStopHero from "@/assets/homepage-refresh/sliding-stop-hero.png.asset.json";
import ciroAceCloseup from "@/assets/homepage-refresh/ciro-ace-closeup.png.asset.json";
import ciroAceDetail from "@/assets/homepage-refresh/ciro-ace-detail.png.asset.json";
import ciroAceWalk from "@/assets/homepage-refresh/ciro-ace-walk.png.asset.json";

const SESSION_KEY = "pe-brand-intro-seen";
const EASE = "cubic-bezier(0.45, 0, 0.15, 1)";

const serviceCards = [
  {
    num: "01",
    title: "Arenas",
    description:
      "Indoor and outdoor arenas, footing preparation, drainage, base works and surfaces designed for real use.",
    image: serviceArenas.url,
    alt: "Arena groundwork underway inside a large covered equestrian structure at golden hour",
    imagePosition: "50% 58%",
    href: "/arenas",
  },
  {
    num: "02",
    title: "Stables & Barns",
    description:
      "Stable builds, barn interiors, shelters, wash bays, tack spaces and practical horse-first layouts.",
    image: serviceStables.url,
    alt: "Moody stable aisle with warm timber stall fronts and a horse leaning from its bay",
    imagePosition: "54% 44%",
    href: "/stables",
  },
  {
    num: "03",
    title: "Equine Infrastructure",
    description:
      "Fencing, laneways, yards, gates, retaining, access, drainage and site works that make the whole property function.",
    image: serviceInfrastructure.url,
    alt: "Rural steel gate and timber fencing stretching down an equine laneway at sunset",
    imagePosition: "48% 54%",
    href: "/infrastructure",
  },
  {
    num: "04",
    title: "Groundworks",
    description:
      "Site cuts, levels, bases, preparation and machine work — the ugly stuff that makes the beautiful stuff last.",
    image: serviceGroundworks.url,
    alt: "Dozer pushing earth on a rural construction site with equine fencing behind it at sunset",
    imagePosition: "42% 52%",
    href: "/services",
  },
  {
    num: "05",
    title: "Custom Rural Builds",
    description:
      "Pavilions, viewing areas, parrilla spaces, tables, fit-outs and lifestyle additions built with the same grit and finish.",
    image: serviceCustom.url,
    alt: "Rustic pavilion with timber table, corrugated steel lining and firebox in warm evening light",
    imagePosition: "50% 50%",
    href: "/services",
  },
  {
    num: "06",
    title: "Drainage & Surfacing",
    description:
      "Drainage systems, base works and surface preparation engineered for performance, longevity and all conditions.",
    image: serviceDrainage.url,
    alt: "Close-up of arena drainage trench with gravel, geotextile fabric and perforated pipe in golden light",
    imagePosition: "50% 56%",
    href: "/services",
  },
];

const featuredWorks = [
  {
    slug: "main-ridge",
    title: "Main Ridge",
    location: "Mornington Peninsula",
    kind: "Pavilion / Arena / Property Build",
    image: mainRidgeInterior,
    alt: "Main Ridge pavilion interior with exposed timber framing in evening light",
    summary:
      "A rural build where groundwork, shelter, arena logic and material finish were resolved as one equine environment.",
  },
  {
    slug: "aberdeen-farm",
    title: "Private Estate",
    location: "Mornington Peninsula",
    kind: "Stable Complex",
    image: aberdeenExterior,
    alt: "Private estate stable exterior in late afternoon light",
    summary:
      "A practical stable complex with the finish, airflow and structure required for daily horse use.",
  },
  {
    slug: "equitana",
    title: "Equitana Melbourne",
    location: "Melbourne",
    kind: "Event Arena",
    image: equitanaArena1,
    alt: "Equitana Melbourne competition arena surface prepared for an event",
    summary:
      "Competition-grade arena work delivered with surface performance, drainage discipline and presentation under pressure.",
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

        <section className="relative py-[clamp(6rem,4rem+8vw,11rem)] bg-background overflow-hidden">
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />
          <div className="section-container max-w-7xl mx-auto">
            <div className="mb-[clamp(3rem,2rem+3vw,5rem)] grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 md:col-span-8 space-y-4">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                    Services
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={150}>
                  <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.85rem,1.2rem+2.4vw,2.9rem)]">
                    Built for the way horse properties actually work.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={300} />
                <RevealOnScroll direction="up" duration={1000} delay={250}>
                  <p className="font-sans font-light text-foreground/50 leading-[1.85] text-[14px] max-w-xl">
                    From arenas and stables to groundwork, drainage, fencing and custom rural builds,
                    Peninsula Equine creates practical equine environments with the structure, flow and
                    finish required for real daily use.
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(1rem,0.5rem+1vw,1.5rem)]">
              {serviceCards.map((card, i) => (
                <RevealOnScroll key={card.num} direction="up" delay={i * 100}>
                  <Link
                    to={card.href}
                    className="group relative block overflow-hidden rounded-sm bg-card"
                    style={{ transition: `box-shadow 700ms ${EASE}` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 40px -12px hsl(var(--accent) / 0.18), 0 0 0 1px hsl(var(--accent) / 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.alt}
                        width={1024}
                        height={640}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          objectPosition: card.imagePosition,
                          filter: "brightness(0.82) contrast(1.12) saturate(0.78)",
                          transition: `transform 900ms ${EASE}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.52) 58%, rgba(0,0,0,0.78) 100%)",
                        }}
                      />
                      <span className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.4em] text-accent/80">
                        {card.num}
                      </span>
                      <span className="absolute top-4 right-4 font-sans text-[11px] tracking-[0.2em] uppercase text-foreground/0 group-hover:text-foreground/80 transition-colors duration-500">
                        View service →
                      </span>
                    </div>

                    <div className="relative p-[clamp(1.25rem,1rem+1vw,1.75rem)]">
                      <h3 className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.015em] text-[clamp(1.25rem,1rem+0.8vw,1.55rem)] mb-2">
                        {card.title}
                      </h3>
                      <p className="font-sans font-light text-foreground/45 leading-[1.75] text-[13px]">
                        {card.description}
                      </p>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-[clamp(6rem,4rem+8vw,11rem)] bg-card overflow-hidden">
          <div className="section-container max-w-7xl mx-auto grid grid-cols-12 gap-[clamp(1.5rem,1rem+2vw,3rem)] items-start">
            <div className="col-span-12 lg:col-span-5 space-y-6 lg:pr-6">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                  Built by horse people
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={150}>
                <h2 className="font-serif text-foreground/90 leading-[1.03] tracking-[-0.02em] text-[clamp(1.9rem,1.2rem+2.8vw,3.1rem)]">
                  Built by horse people.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
              <RevealOnScroll direction="up" duration={1000} delay={350}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] max-w-md">
                  Real time in the saddle shapes the way these properties are built —
                  the feel of the surface, the flow through the yards, the details that hold up after
                  the machines leave.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={900} delay={500}>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em]"
                >
                  <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  About Peninsula Equine
                </Link>
              </RevealOnScroll>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 items-start">
                <RevealOnScroll direction="up" duration={1200}>
                  <div className="md:col-span-8 relative aspect-[4/5] overflow-hidden rounded-sm">
                    <img
                      src={ciroAceCloseup.url}
                      alt="Quiet moment with horse and horseman in warm stable light"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        objectPosition: "52% 45%",
                        filter: "brightness(0.84) contrast(1.08) saturate(0.82)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/35 via-transparent to-transparent" />
                  </div>
                </RevealOnScroll>

                <RevealOnScroll direction="up" duration={1050} delay={180}>
                  <div className="md:col-span-4 relative aspect-[4/5] overflow-hidden rounded-sm md:mt-16">
                    <img
                      src={ciroAceDetail.url}
                      alt="Close detail — hand, rein and horse in warm light"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        objectPosition: "50% 42%",
                        filter: "brightness(0.82) contrast(1.08) saturate(0.8)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/35 via-transparent to-transparent" />
                  </div>
                </RevealOnScroll>
              </div>
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
