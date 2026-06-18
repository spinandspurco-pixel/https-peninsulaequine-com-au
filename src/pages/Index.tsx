import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { HeroAtmosphere } from "@/components/HeroAtmosphere";
import { IntroContext } from "@/hooks/useIntroState";
import { useIntake } from "@/hooks/useIntake";

import systemHero from "@/assets/system-hero.jpg";

import systemEvent from "@/assets/system-event.jpg";
import systemStructure from "@/assets/system-structure.jpg";
import recoveryInternalHero from "@/assets/recovery-internal-hero.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";

import serviceArenas from "@/assets/service-arenas.jpg";
import serviceStables from "@/assets/service-stables.jpg";
import serviceInfrastructure from "@/assets/service-infrastructure.jpg";
import serviceGroundworks from "@/assets/service-groundworks.jpg";
import serviceCustom from "@/assets/service-custom.jpg";
import serviceDrainage from "@/assets/service-drainage.jpg";

const SESSION_KEY = "pe-brand-intro-seen";
const EASE = "cubic-bezier(0.45, 0, 0.15, 1)";

const services = [
  { name: "Arenas", href: "/arenas", note: "Surfaces engineered for performance." },
  { name: "Stables", href: "/stables", note: "Daily care, treated as architecture." },
  { name: "Equine Estates", href: "/equine-estates", note: "Whole-property masterplans." },
  { name: "Recovery Station", href: "/recovery-stations", note: "Internal stable wellness bay." },
  { name: "Infrastructure & Maintenance", href: "/infrastructure", note: "The work that holds it all together." },
];

const featuredWorks = [
  {
    slug: "main-ridge",
    title: "Main Ridge",
    location: "Mornington Peninsula",
    kind: "Complete Property Build",
    image: mainRidgeInterior,
    alt: "Main Ridge barn interior with exposed timber framing at dusk",
    summary:
      "Earthworks, structure and surface resolved as a single performance system — a property rebuilt from the ground up.",
  },
  {
    slug: "aberdeen-farm",
    title: "Private Estate",
    location: "Mornington Peninsula",
    kind: "Private Stable Complex",
    image: aberdeenExterior,
    alt: "Private estate stable exterior in late afternoon light",
    summary:
      "A full stable complex resolved as one architectural gesture — stone, timber and air, engineered to perform for generations.",
  },
  {
    slug: "equitana",
    title: "Equitana Melbourne",
    location: "Melbourne",
    kind: "Competition Arena",
    image: equitanaArena1,
    alt: "Equitana Melbourne competition arena surface, prepared",
    summary:
      "An event-grade arena delivered to international standard — surface, drainage and presentation tuned for elite competition.",
  },
];

const serviceCards = [
  {
    num: "01",
    title: "Arenas",
    description:
      "Indoor and outdoor arenas, footing preparation, drainage, base works and surfaces designed for real use.",
    image: serviceArenas,
    href: "/arenas",
  },
  {
    num: "02",
    title: "Stables & Barns",
    description:
      "Stable builds, barn interiors, shelters, wash bays, tack spaces and practical horse-first layouts.",
    image: serviceStables,
    href: "/stables",
  },
  {
    num: "03",
    title: "Equine Infrastructure",
    description:
      "Fencing, laneways, yards, gates, retaining, access, drainage and site works that make the whole property function.",
    image: serviceInfrastructure,
    href: "/infrastructure",
  },
  {
    num: "04",
    title: "Groundworks",
    description:
      "Site cuts, levels, bases, preparation and machine work — the ugly stuff that makes the beautiful stuff last.",
    image: serviceGroundworks,
    href: "/services",
  },
  {
    num: "05",
    title: "Custom Rural Builds",
    description:
      "Pavilions, viewing areas, parrilla spaces, tables, fit-outs and lifestyle additions built with the same grit and finish.",
    image: serviceCustom,
    href: "/services",
  },
  {
    num: "06",
    title: "Drainage & Surfacing",
    description:
      "Drainage systems, base works and surface preparation engineered for performance, longevity and all conditions.",
    image: serviceDrainage,
    href: "/services",
  },
];

export default function Index() {
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [heroFade, setHeroFade] = useState(1);
  const { open: openIntake } = useIntake();

  // Skip the intro if it's already been seen this session or user prefers reduced motion.
  const skipIntro = useMemo(() => {
    if (typeof window === "undefined") return true;
    if (sessionStorage.getItem(SESSION_KEY)) return true;
    return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Orchestrated reveal state — drives hero image, headline, sub, CTA, and header.
  const [imageReady, setImageReady] = useState(skipIntro);
  const [headlineReady, setHeadlineReady] = useState(false);
  const [sublineReady, setSublineReady] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);
  const [headerReady, setHeaderReady] = useState(skipIntro);

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));

    if (skipIntro) {
      // Clean, gentle hero arrival on subsequent visits.
      setImageReady(true);
      setHeaderReady(true);
      at(250, () => setHeadlineReady(true));
      at(600, () => setSublineReady(true));
      at(1000, () => setCtaReady(true));
    } else {
      // First-visit cinematic sequence — synced with BrandIntro timeline.
      at(2700, () => setImageReady(true));   // hero begins reveal as overlay clears
      at(3200, () => setHeadlineReady(true));
      at(3500, () => setSublineReady(true));
      at(3800, () => setCtaReady(true));
      at(4000, () => setHeaderReady(true));
    }

    return () => timers.forEach(clearTimeout);
  }, [skipIntro]);

  const handleScroll = useCallback(() => {
    const el = heroContentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (rect.top - vh * 0.2) / (vh * 0.55)));
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
        {/* ═══ 1. CINEMATIC HERO ═══════════════════════════ */}
        <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center" style={{ paddingBottom: "8vh" }}>
          {/* Hero image — starts dark and softly blurred, sharpens as intro dissolves */}
          <img
            src={systemHero}
            alt="Premium equine environment at dusk"
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={1080}
            loading="eager"
            decoding="async"
            // @ts-expect-error — valid HTML attribute, not yet in React types in all versions
            fetchpriority="high"
            style={{
              objectPosition: "50% 72%",
              filter: imageReady
                ? "brightness(0.88) contrast(1.18) saturate(0.78) sepia(0.06) blur(0px)"
                : "brightness(0.42) contrast(1.05) saturate(0.7) sepia(0.06) blur(14px)",
              transform: imageReady ? "scale(1)" : "scale(1.04)",
              animation: imageReady ? "heroSlowZoom 25s ease-out forwards" : "none",
              transition: `filter 1400ms ${EASE}, transform 1400ms ${EASE}`,
              willChange: "filter, transform",
            }}
          />

          {/* Soft gradient overlay — keeps headline readable without muddying the image */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.45) 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(0,0,0,0.55) 100%)" }}
          />
          <HeroAtmosphere />

          <div
            ref={heroContentRef}
            className="relative z-10 text-center px-6 max-w-4xl mx-auto"
            style={{ opacity: heroFade, willChange: "opacity", marginTop: "-18vh" }}
          >
            <h1
              className="font-serif font-semibold text-white tracking-tight leading-[0.9]"
              style={{
                fontSize: "clamp(2.6rem, 1.2rem + 6vw, 5.8rem)",
                opacity: headlineReady ? 1 : 0,
                transform: headlineReady ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 1200ms ${EASE}, transform 1200ms ${EASE}`,
                textShadow: "0 2px 40px rgba(0,0,0,0.55), 0 0 90px rgba(0,0,0,0.2)",
                willChange: "opacity, transform",
              }}
            >
              From Dirt to Dynasty.
            </h1>

            <p
              className="mt-6 font-serif italic text-white/75 max-w-2xl mx-auto"
              style={{
                fontSize: "clamp(1rem, 0.55rem + 1vw, 1.45rem)",
                opacity: sublineReady ? 1 : 0,
                transform: sublineReady ? "translateY(0)" : "translateY(6px)",
                transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                textShadow: "0 2px 24px rgba(0,0,0,0.5)",
              }}
            >
              Premium equine environments built by riders, crafted for performance.
            </p>

            <div
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{
                opacity: ctaReady ? 1 : 0,
                transform: ctaReady ? "translateY(0)" : "translateY(6px)",
                transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
              }}
            >
              <button
                onClick={openIntake}
                className="group inline-flex items-center justify-center px-8 py-3.5 bg-[hsl(38_28%_88%)] text-[hsl(0_0%_8%)] text-[11px] uppercase tracking-[0.22em] font-medium rounded-sm shadow-[0_10px_40px_-12px_rgba(244,220,170,0.35)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[hsl(38_32%_93%)] cursor-pointer"
              >
                Start Your Project
                <span className="ml-3 text-[hsl(0_0%_8%)]/50 transition-transform duration-500 group-hover:translate-x-1">→</span>
              </button>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-white/25 text-white/75 text-[11px] uppercase tracking-[0.22em] font-medium rounded-sm transition-all duration-500 hover:border-white/60 hover:text-white hover:bg-white/[0.04]"
              >
                Explore Selected Works
              </Link>
            </div>
          </div>
        </section>


        {/* ═══ HERO → BREATHING TRANSITION ═════════════════ */}
        <div
          className="relative"
          style={{
            height: "clamp(3rem, 6vw, 5rem)",
            background: "linear-gradient(to bottom, hsl(var(--background) / 0) 0%, hsl(var(--background)) 100%)",
            marginTop: "-3rem",
            zIndex: 5,
          }}
          aria-hidden="true"
        />

        {/* ═══ 2. PREMIUM SERVICE OVERVIEW ═════════════════ */}
        <section className="relative py-[clamp(6rem,4rem+8vw,11rem)] bg-background overflow-hidden">
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />
          <div className="section-container max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-[clamp(3rem,2rem+3vw,5rem)] grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 md:col-span-8 space-y-4">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                    Capabilities
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={150}>
                  <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.85rem,1.2rem+2.4vw,2.85rem)]">
                    Built for the way horse properties actually work.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={300} />
                <RevealOnScroll direction="up" duration={1000} delay={250}>
                  <p className="font-sans font-light text-foreground/50 leading-[1.85] text-[14px] max-w-xl">
                    From arenas and stables to groundwork, drainage, fencing and custom rural builds, Peninsula Equine creates practical equine environments with the structure, flow and finish required for real daily use.
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(1rem,0.5rem+1vw,1.5rem)]">
              {serviceCards.map((card, i) => (
                <RevealOnScroll key={card.num} direction="up" delay={i * 100}>
                  <Link
                    to={card.href}
                    className="group relative block overflow-hidden rounded-sm bg-card"
                    style={{
                      transition: `box-shadow 700ms ${EASE}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 40px -12px hsl(var(--accent) / 0.18), 0 0 0 1px hsl(var(--accent) / 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        width={1024}
                        height={640}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
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
                      {/* Dark gradient overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)",
                        }}
                      />
                      {/* Number */}
                      <span
                        className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.4em] text-accent/80"
                      >
                        {card.num}
                      </span>
                      {/* View service — hover reveal */}
                      <span
                        className="absolute top-4 right-4 font-sans text-[11px] tracking-[0.2em] uppercase text-white/0 group-hover:text-white/80 transition-colors duration-500"
                      >
                        View service →
                      </span>
                    </div>

                    {/* Text block */}
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

        {/* ═══ 3. CORE SERVICES ════════════════════════════ */}
        <section className="relative py-[clamp(6rem,4rem+8vw,12rem)] bg-card overflow-hidden">
          <div className="section-container max-w-6xl mx-auto">
            <div className="mb-[clamp(3rem,2rem+3vw,5rem)] grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 md:col-span-7 space-y-3">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                    Capabilities
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={150}>
                  <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.85rem,1.2rem+2.4vw,2.85rem)]">
                    The complete equestrian property — built properly.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={300} />
              </div>
            </div>

            <ul className="divide-y divide-foreground/[0.06] border-y border-foreground/[0.06]">
              {services.map((s, i) => (
                <RevealOnScroll key={s.href} direction="up" delay={i * 80}>
                  <li>
                    <Link
                      to={s.href}
                      className="group flex items-baseline justify-between gap-6 py-[clamp(1.5rem,1.25rem+1vw,2.25rem)] transition-colors duration-500"
                    >
                      <div className="flex items-baseline gap-[clamp(1rem,0.75rem+1vw,2rem)] min-w-0">
                        <span className="font-mono text-[10px] tracking-[0.4em] text-foreground/25 w-8 shrink-0">
                          0{i + 1}
                        </span>
                        <span className="font-serif text-foreground/90 group-hover:text-accent transition-colors duration-500 leading-[1.1] tracking-[-0.015em] text-[clamp(1.5rem,1rem+1.8vw,2.35rem)]">
                          {s.name}
                        </span>
                      </div>
                      <div className="hidden md:flex items-baseline gap-6 shrink-0">
                        <span className="font-sans font-light text-foreground/45 text-[13px] max-w-xs text-right">
                          {s.note}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.3em] text-accent/50 group-hover:text-accent transition-all duration-500 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </Link>
                  </li>
                </RevealOnScroll>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══ 4. SELECTED WORKS ═══════════════════════════ */}
        <section className="relative py-[clamp(6rem,4rem+8vw,12rem)] bg-background overflow-hidden">
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
                    A small number of properties, resolved end to end.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={300} />
              </div>
              <div className="col-span-12 md:col-span-5 md:text-right">
                <RevealOnScroll direction="up" duration={1000} delay={400}>
                  <p className="font-sans font-light text-foreground/50 leading-[1.85] text-[14px] max-w-sm md:ml-auto">
                    No catalogues. No templates. Each commission sited, detailed
                    and built to the property.
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            <div className="space-y-[clamp(4rem,3rem+4vw,7rem)]">
              {featuredWorks.map((p, i) => (
                <RevealOnScroll key={p.slug} direction="up" duration={1100} delay={i * 120}>
                  <Link
                    to={`/project/${p.slug}`}
                    className="group block grid grid-cols-12 gap-[clamp(1.5rem,1rem+2vw,3.5rem)] items-center"
                  >
                    <div
                      className={`col-span-12 lg:col-span-8 ${
                        i % 2 === 1 ? "lg:order-2" : ""
                      }`}
                    >
                      <div
                        className={`relative aspect-[16/10] overflow-hidden ${
                          i % 2 === 0 ? "lg:-ml-[3rem]" : "lg:-mr-[3rem]"
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.alt}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.04]"
                          style={{ filter: "brightness(0.85) contrast(1.1) saturate(0.8)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                        <span className="absolute top-4 left-4 font-mono uppercase text-accent/65 text-[10px] tracking-[0.45em]">
                          {`0${i + 1} — ${p.kind}`}
                        </span>
                      </div>
                    </div>
                    <div className={`col-span-12 lg:col-span-4 space-y-5 ${i % 2 === 1 ? "lg:order-1 lg:pr-4" : "lg:pl-4"}`}>
                      <p className="font-mono uppercase text-foreground/35 text-[10px] tracking-[0.4em]">
                        {p.location}
                      </p>
                      <h3 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.55rem,1.05rem+2vw,2.35rem)] group-hover:text-accent transition-colors duration-700">
                        {p.title}
                      </h3>
                      <RevealLine width="w-6" />
                      <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px]">
                        {p.summary}
                      </p>
                      <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/70 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em] pt-2">
                        <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                        View Case Study
                      </span>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>

            <div className="mt-[clamp(4rem,3rem+3vw,6rem)] flex justify-center">
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


        {/* ═══ 5. RECOVERY STATION TEASER ══════════════════ */}
        <section className="relative py-[clamp(6rem,4rem+8vw,12rem)] bg-card overflow-hidden">
          <div className="section-container max-w-7xl mx-auto grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
            <div className="col-span-12 lg:col-span-5 lg:order-1 space-y-6">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                  Innovation — Recovery Station
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={150}>
                <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.75rem,1.15rem+2.4vw,2.75rem)]">
                  Premium internal stable wellness.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
              <RevealOnScroll direction="up" duration={1000} delay={400}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px]">
                  A dedicated recovery, grooming and wellness bay engineered into the stable
                  itself — overhead infrared, integrated tack, considered finishes. Comfort,
                  performance and care, held by the architecture.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={900} delay={550}>
                <Link
                  to="/recovery-stations"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em] pt-2"
                >
                  <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  Explore the Recovery Station
                </Link>
              </RevealOnScroll>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:order-2">
              <RevealOnScroll direction="up" duration={1200}>
                <div className="relative aspect-[16/10] overflow-hidden lg:-mr-[3rem]">
                  <img
                    src={recoveryInternalHero}
                    alt="Peninsula Equine Recovery Station — interior stable wellness bay under warm infrared light"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.15,1)] hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/30 via-transparent to-transparent" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ═══ 6. BUILT BY RIDERS ══════════════════════════ */}
        <section className="relative py-[clamp(6rem,4rem+8vw,12rem)] bg-background overflow-hidden">
          <div className="section-container max-w-6xl mx-auto grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
            <div className="col-span-12 lg:col-span-6">
              <RevealOnScroll direction="up" duration={1200}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={systemStructure}
                    alt="On site — Peninsula Equine team building"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)", objectPosition: "50% 40%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                </div>
              </RevealOnScroll>
            </div>
            <div className="col-span-12 lg:col-span-6 space-y-7 lg:pl-6">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.45em]">
                  Built by Riders
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={150}>
                <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.85rem,1.2rem+2.6vw,3rem)]">
                  Built by the people who ride. Resolved by the people who build.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
              <RevealOnScroll direction="up" duration={1000} delay={400}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] max-w-xl">
                  Peninsula Equine is run by horsemen and builders working from the same
                  property. Every decision is filtered through the horse first, the rider
                  second and the architecture last.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={900} delay={550}>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em]"
                >
                  <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  About Peninsula Equine
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ═══ 7. FINAL CTA ════════════════════════════════ */}
        <section className="relative py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background overflow-hidden">
          <img
            src={systemEvent}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
            style={{ filter: "brightness(0.65) contrast(1.1) saturate(0.7)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
          <div className="relative section-container max-w-3xl mx-auto text-center space-y-[clamp(2rem,1.25rem+2.5vw,3rem)]">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.5em]">
                Limited Commissions — 2026
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={150}>
              <p className="font-serif italic text-foreground/80 leading-[1.3] tracking-[-0.015em] text-[clamp(1.65rem,1.1rem+2vw,2.5rem)]">
                Start your Peninsula Equine project.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="none" duration={1200} delay={400}>
              <p
                className="font-mono uppercase italic text-[10px] tracking-[0.5em]"
                style={{ color: "hsl(var(--muted-foreground) / 0.18)" }}
              >
                From Dirt to Dynasty
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-[clamp(1.75rem,1rem+2vw,3.5rem)] justify-center items-center pt-4">
                <button
                  onClick={openIntake}
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/75 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em] cursor-pointer"
                >
                  <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  Start Your Project
                </button>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/40 hover:text-foreground/80 transition-colors duration-500 text-[10px] tracking-[0.4em]"
                >
                  Explore Selected Works
                  <span className="w-6 h-px bg-foreground/20 transition-all duration-700 group-hover:w-12 group-hover:bg-foreground/60" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </Layout>
    </IntroContext.Provider>
  );
}
