/**
 * Peninsula Equine Homepage
 * 
 * IMPORTANT: This file uses performance-critical inline styles for hero animations.
 * Dynamic opacity, transform, and filter values drive keyframe animations at runtime.
 * These MUST be inline styles (not CSS classes) for performant scroll/entrance effects.
 * 
 * VS Code style warnings can be safely ignored for this file.
 */

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { logClientEvent } from "@/lib/clientLog";
import { Link, useNavigate } from "react-router-dom";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { HomeTestimonialsStrip } from "@/components/home/HomeTestimonialsStrip";
import { HomeEventsStrip } from "@/components/home/HomeEventsStrip";
import { IntroContext } from "@/hooks/useIntroState";
import { useIntake } from "@/hooks/useIntake";
import { usePageMeta } from "@/lib/usePageMeta";


import lumenArcCanopy from "@/assets/lumenarc/canopy.asset.json";
import aberdeenHero from "@/assets/uploads/approved-aberdeen-rider-exterior-storm.webp.asset.json";
import aberdeenArena from "@/assets/uploads/approved-stable-stall-interior-symmetric.png.asset.json";
import steelFrontAsset from "@/assets/uploads/approved-current-build-steel-frame-storm.png.asset.json";
import coveredArenaExteriorAsset from "@/assets/covered-arenas/approved-covered-arena-exterior-dusk.png.asset.json";
import muddyBootsCraftAsset from "@/assets/field-notes/muddy-boots-steel-frame.png.asset.json";
import mainRidgeLegacyAsset from "@/assets/main-ridge/mr-parrilla-wide.png.asset.json";


const steelFront = steelFrontAsset.url;
const coveredArenaExterior = coveredArenaExteriorAsset.url;
const craftBoots = muddyBootsCraftAsset.url;
const legacyPavilion = mainRidgeLegacyAsset.url;

// Responsive webp variants for srcset (generated at 640/1024/1536w)
import ciro640 from "@/assets/responsive/ciro-ace-quiet-moment-640.webp.asset.json";
import ciro1024 from "@/assets/responsive/ciro-ace-quiet-moment-1024.webp.asset.json";
import ciro1536 from "@/assets/responsive/ciro-ace-quiet-moment-1536.webp.asset.json";
import ciroArena from "@/assets/about/ciro-ace-arena-standing.png.asset.json";
import ciroQuietMoment from "@/assets/about/ciro-ace-quiet-moment.png.asset.json";
import mainRidge640 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-640.webp.asset.json";
import mainRidge1024 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-1024.webp.asset.json";
import mainRidge1536 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-1536.webp.asset.json";
import slidingStop640 from "@/assets/responsive/sliding-stop-hero-640.webp.asset.json";
import slidingStop1024 from "@/assets/responsive/sliding-stop-hero-1024.webp.asset.json";
import slidingStop1536 from "@/assets/responsive/sliding-stop-hero-1536.webp.asset.json";
import { getProjectImageAlt, getProjectResponsive } from "@/config/projectImagery";
const fieldNotesPreview = getProjectResponsive("covered-arena-stables-build", "fieldNotesPreview")!;
const fieldNotesPreviewAlt = getProjectImageAlt("covered-arena-stables-build", "fieldNotesPreview");

const srcset = (a: { url: string }, b: { url: string }, c: { url: string }) =>
  `${a.url} 640w, ${b.url} 1024w, ${c.url} 1536w`;
const ciroSrcSet = srcset(ciro640, ciro1024, ciro1536);
const mainRidgeSrcSet = srcset(mainRidge640, mainRidge1024, mainRidge1536);
const slidingStopSrcSet = srcset(slidingStop640, slidingStop1024, slidingStop1536);


const SESSION_KEY = "pe-brand-intro-seen";
const EASE = "cubic-bezier(0.45, 0, 0.15, 1)";

export default function Index() {
  usePageMeta({
    title: "Peninsula Equine — From Dirt to Dynasty",
    description: "Equine builders on the Mornington Peninsula. Covered arenas, stable precincts, groundworks and rural structures engineered for daily use by horse and rider.",
    path: "/",
  });
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const [heroFade, setHeroFade] = useState(1);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const { open: openIntake } = useIntake();
  const navigate = useNavigate();


  const skipIntro = useMemo(() => {
    if (typeof window === "undefined") return true;
    if (sessionStorage.getItem(SESSION_KEY)) return true;
    return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [imageReady, setImageReady] = useState(skipIntro);
  const [headlineReady, setHeadlineReady] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);
  const [headerReady, setHeaderReady] = useState(skipIntro);

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (skipIntro) {
      setImageReady(true);
      setHeaderReady(true);
      // Two-beat arrival: headline (with support line) → CTA after a hold.
      at(260, () => setHeadlineReady(true));
      at(1000, () => setCtaReady(true)); // Reduced from 1100ms
    } else {
      // Three deliberate tracks: backdrop → headline → CTA. Faster entrance.
      at(1400, () => setImageReady(true)); // Reduced from 1700ms
      at(1900, () => setHeadlineReady(true)); // Reduced from 2200ms
      at(2700, () => setCtaReady(true)); // Reduced from 3100ms
      at(2000, () => setHeaderReady(true)); // Reduced from 2400ms
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

  // Enhanced parallax with better warmth
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!heroImgLoaded) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let attached = false;
    const update = () => {
      raf = 0;
      const img = heroImgRef.current;
      if (!img) return;
      const y = window.scrollY;
      const vh = window.innerHeight || 1;
      const p = Math.min(Math.max(y / vh, 0), 1);
      const scale = 1 + p * 0.06;
      const translate = p * 36;
      img.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    // Wait for entrance to finish before parallax
    const t = window.setTimeout(() => {
      const img = heroImgRef.current;
      if (img) img.style.transition = "transform 80ms linear, opacity 1600ms cubic-bezier(0.45,0,0.15,1)";
      window.addEventListener("scroll", onScroll, { passive: true });
      attached = true;
      update();
    }, 1900); // Synced to new entrance time
    return () => {
      window.clearTimeout(t);
      if (attached) window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [heroImgLoaded]);

  return (
    <IntroContext.Provider value={{ headerLogoReady: headerReady, headerReady }}>
      <BrandIntro />
      <Layout>
        <div className="type-architectural">
          <section className="relative min-h-[100dvh] overflow-hidden flex items-end">
            {/*
             * ⛔ LOCKED HERO SLOT — HOMEPAGE_HERO_SLIDING_STOP_REQUIRED
             * This slot MUST render the approved cinematic sliding-stop image.
             * Do NOT replace with: building exteriors, stables, pavilions,
             * arena interiors, uploads, or fallback placeholders.
             * Image: src/assets/responsive/sliding-stop-hero-{640,1024,1536}.webp
             * If the asset reference is ever broken, render a labelled
             * placeholder reading "HOMEPAGE_HERO_SLIDING_STOP_REQUIRED" —
             * never substitute another image.
             */}
            <div className="absolute inset-0 bg-[hsl(222_20%_6%)]">
              {slidingStop1536?.url && !heroImgFailed ? (
                <img
                  ref={heroImgRef}
                  src={slidingStop1536.url}
                  srcSet={slidingStopSrcSet}
                  sizes="100vw"
                  width={1536}
                  height={864}
                  alt="Horse and rider executing a sliding stop, dust plume across worked arena footing — Peninsula Equine."
                  {...({ fetchpriority: "high" } as Record<string, string>)}
                  decoding="async"
                  onLoad={() => setHeroImgLoaded(true)}
                  onError={() => {
                    setHeroImgFailed(true);
                    logClientEvent("hero_image_load_failure", {
                      src: slidingStop1536?.url ?? null,
                      srcSetPresent: !!slidingStopSrcSet,
                      imageReady,
                      heroImgLoaded,
                    });
                  }}
                  className="absolute inset-0 w-full h-full object-cover object-[58%_center] sm:object-[62%_center]"
                  style={{
                    opacity: imageReady && heroImgLoaded ? 1 : 0,
                    transform: imageReady && heroImgLoaded ? "scale(1)" : "scale(1.04)",
                    transition: `opacity 1600ms ${EASE}, transform 2400ms ${EASE}`,
                    willChange: "opacity, transform",
                    // Enhanced warmth and clarity - horses feel warmer, footing more textured
                    filter: "contrast(1.12) saturate(1.10) brightness(0.96) hue-rotate(2deg)",
                  }}
                />

              ) : null}
              {heroImgFailed && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[hsl(222_20%_6%)]"
                  style={{
                    backgroundImage:
                      "radial-gradient(ellipse 70% 60% at 62% 50%, hsl(28 35% 14% / 0.45) 0%, transparent 70%)",
                  }}
                />
              )}
              {/* Cinematic spotlight — sculpts the horse without lifting overall exposure */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                style={{
                  background:
                    "radial-gradient(ellipse 30% 38% at 64% 46%, hsl(34 55% 72% / 0.55) 0%, hsl(28 40% 50% / 0.18) 45%, transparent 72%)",
                  opacity: imageReady && heroImgLoaded ? 1 : 0,
                  transition: `opacity 1800ms ${EASE} 200ms`,
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 28% 34% at 64% 46%, hsl(36 50% 78% / 0.10) 0%, transparent 65%)",
                  opacity: imageReady && heroImgLoaded ? 1 : 0,
                  transition: `opacity 1800ms ${EASE} 200ms`,
                }}
              />
            </div>

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

            {/* Architectural corner brackets — recede into support, never compete with the subject */}
            <div aria-hidden className="absolute inset-[clamp(1rem,2.5vw,2.5rem)] pointer-events-none z-[2]">
              <span className="absolute top-0 left-0 w-5 h-px bg-accent/20" />
              <span className="absolute top-0 left-0 w-px h-5 bg-accent/20" />
              <span className="absolute top-0 right-0 w-5 h-px bg-accent/20" />
              <span className="absolute top-0 right-0 w-px h-5 bg-accent/20" />
              <span className="absolute bottom-0 left-0 w-5 h-px bg-accent/20" />
              <span className="absolute bottom-0 left-0 w-px h-5 bg-accent/20" />
              <span className="absolute bottom-0 right-0 w-5 h-px bg-accent/20" />
              <span className="absolute bottom-0 right-0 w-px h-5 bg-accent/20" />
            </div>



            {/* faint plan-line overlay — text column only, never over the subject */}
            <div
              aria-hidden
              className="absolute left-0 bottom-0 w-full md:w-[46%] h-[60%] pointer-events-none z-[1] bg-plan-lines opacity-[0.09] animate-plan-drift-x"
              style={{ maskImage: "linear-gradient(to right, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 70%, transparent 100%)" }}
            />


            <div
              ref={heroContentRef}
              className="relative z-10 section-container w-full pb-[clamp(5rem,4rem+7vw,9rem)] pt-32"
              style={{ opacity: heroFade, willChange: "opacity" }}
            >
              <div className="max-w-[44rem] space-y-12 pt-10 sm:pt-16">
                <div className="space-y-8">
                  <h1
                    className="font-serif text-foreground leading-[0.82] tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(3.2rem, 1.95rem + 5.8vw, 7.25rem)",
                      opacity: headlineReady ? 1 : 0,
                      transform: headlineReady ? "translateY(0)" : "translateY(10px)",
                      transition: `opacity 1100ms ${EASE}, transform 1100ms ${EASE}`,
                      textShadow: "0 8px 32px rgba(0,0,0,0.65)", // Stronger, warmer shadow
                    }}
                  >
                    From Dirt to Dynasty
                  </h1>
                  <p
                    className="max-w-xl font-serif italic text-foreground/88 leading-[1.45] text-[clamp(1.05rem,0.9rem+0.5vw,1.35rem)]"
                    style={{
                      opacity: headlineReady ? 1 : 0,
                      transform: headlineReady ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 1100ms ${EASE} 180ms, transform 1100ms ${EASE} 180ms`,
                      textShadow: "0 4px 16px rgba(0,0,0,0.65)",
                    }}
                  >
                    <strong>Built by riders.</strong> Designed for horses. <strong>Crafted for generations.</strong>
                  </p>
                  <p
                    className="max-w-xl font-sans font-light text-foreground/70 leading-[1.7] text-[14px]"
                    style={{
                      opacity: headlineReady ? 1 : 0,
                      transform: headlineReady ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 1100ms ${EASE} 260ms, transform 1100ms ${EASE} 260ms`,
                      textShadow: "0 2px 18px rgba(0,0,0,0.65)",
                    }}
                  >
                    Covered arenas, stables and equine environments built by horse people. Trusted across Australia.
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
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground hover:text-accent transition-[color,transform] duration-500 text-[11px] sm:text-[10px] tracking-[0.42em] py-3 -my-3 will-change-transform"
                    style={{ transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), color 500ms ease" }}
                    onPointerMove={(e) => {
                      const el = e.currentTarget;
                      const r = el.getBoundingClientRect();
                      const dx = e.clientX - (r.left + r.width / 2);
                      const dy = e.clientY - (r.top + r.height / 2);
                      const d = Math.hypot(dx, dy);
                      if (d > 90) { el.style.transform = "translate3d(0,0,0)"; return; }
                      const k = (1 - d / 90) * 6;
                      el.style.transform = `translate3d(${((dx/(d||1))*k).toFixed(2)}px, ${((dy/(d||1))*k).toFixed(2)}px, 0)`;
                    }}
                    onPointerLeave={(e) => { e.currentTarget.style.transform = "translate3d(0,0,0)"; }}
                  >
                    <span className="w-10 h-[2px] bg-accent transition-all duration-700 group-hover:w-16" style={{ boxShadow: "0 0 16px hsl(var(--accent) / 0.60)" }} />
                    View Our Work
                  </Link>
                  <Link
                    to="/services"
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/65 hover:text-foreground transition-[color,transform] duration-500 text-[11px] sm:text-[10px] tracking-[0.42em] py-3 -my-3 will-change-transform"
                    style={{ transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), color 500ms ease" }}
                    onPointerMove={(e) => {
                      const el = e.currentTarget;
                      const r = el.getBoundingClientRect();
                      const dx = e.clientX - (r.left + r.width / 2);
                      const dy = e.clientY - (r.top + r.height / 2);
                      const d = Math.hypot(dx, dy);
                      if (d > 90) { el.style.transform = "translate3d(0,0,0)"; return; }
                      const k = (1 - d / 90) * 6;
                      el.style.transform = `translate3d(${((dx/(d||1))*k).toFixed(2)}px, ${((dy/(d||1))*k).toFixed(2)}px, 0)`;
                    }}
                    onPointerLeave={(e) => { e.currentTarget.style.transform = "translate3d(0,0,0)"; }}
                  >
                    <span className="w-9 h-px bg-foreground/35 transition-all duration-700 group-hover:w-14 group-hover:bg-foreground/70" />
                    What We Do
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
                  Built from the ground up — structural clarity from base works to finished
                  ridgeline.
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

          {/* Why Peninsula Equine — institutional contrast section */}
          <section className="relative py-[clamp(4rem,2.5rem+5vw,9rem)] bg-background overflow-hidden border-t border-accent/10">
            <div className="section-container max-w-[1480px] mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-[clamp(2rem,1.25rem+2vw,3.5rem)]">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">02</span>
                  <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                  <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Why Peninsula Equine</span>
                </div>
              </RevealOnScroll>

              <div className="grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-start">
                <div className="col-span-12 md:col-span-7 space-y-7">
                  <RevealOnScroll direction="up" duration={1100} delay={120}>
                    <h2 className="font-serif text-foreground/95 leading-[1.02] tracking-[-0.024em] text-[clamp(2rem,1.3rem+2.6vw,3.4rem)] max-w-[28ch]">
                      Others build structures.<br />
                      <span className="text-foreground/55 italic font-normal">We build horse properties.</span>
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-12" delay={260} />
                  <RevealOnScroll direction="up" duration={1000} delay={340}>
                    <p className="font-sans font-light text-foreground/65 leading-[1.85] text-[clamp(0.98rem,0.88rem+0.3vw,1.1rem)] max-w-2xl">
                      Every arena, stable and recovery environment is drawn through the lens of
                      horse movement, rider flow, drainage, footing and longevity. We understand
                      the horse before we draw the plans — and we resolve the ground before anything
                      stands on it.
                    </p>
                  </RevealOnScroll>
                </div>

                <div className="col-span-12 md:col-span-5 md:pt-2">
                  <RevealOnScroll direction="up" duration={1000} delay={420}>
                    <dl className="divide-y divide-accent/12 border-t border-accent/15">
                      {[
                        { k: "Horse-first", v: "Designed from movement, not aesthetics." },
                        { k: "Ground-resolved", v: "Drainage, base and footing engineered as one system." },
                        { k: "Built for decades", v: "Structures finished to a residential standard." },
                        { k: "Owner-led", v: "Every project carried personally, end to end." },
                      ].map((row) => (
                        <div key={row.k} className="grid grid-cols-12 gap-3 py-5">
                          <dt className="col-span-5 font-mono uppercase text-accent/65 text-[10px] tracking-[0.4em] pt-1">
                            {row.k}
                          </dt>
                          <dd className="col-span-7 font-serif text-foreground/80 text-[clamp(0.98rem,0.9rem+0.2vw,1.1rem)] leading-[1.5]">
                            {row.v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </RevealOnScroll>
                </div>
              </div>
            </div>
          </section>

          {/* Selected Works — capability proof */}
          <section className="relative py-[clamp(3.75rem,2.25rem+5vw,9rem)] bg-background overflow-hidden border-t border-accent/10">

            <div className="section-container max-w-[1480px] mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">03</span>
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
                      className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-1000 ease-out group-hover:scale-[1.025] object-[50%_62%] sm:object-[50%_55%] md:object-[50%_50%]"
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
                        className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
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
                        alt="Aberdeen horse wash bay with warm timber lining, overhead care system and handler standing with a horse"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
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

          {/* The Difference Is Experience — human proof section */}
          <section className="relative py-[clamp(4rem,2.5rem+5vw,9rem)] bg-background overflow-hidden border-t border-accent/10">
            <div className="section-container max-w-[1480px] mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-[clamp(2rem,1.25rem+2vw,3.5rem)]">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">04</span>
                  <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                  <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">The Difference Is Experience</span>
                </div>
              </RevealOnScroll>

              <div className="grid grid-cols-12 gap-[clamp(2rem,1.25rem+2vw,3.5rem)] items-end mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                <div className="col-span-12 md:col-span-8 space-y-6">
                  <RevealOnScroll direction="up" duration={1100} delay={120}>
                    <h2 className="font-serif text-foreground/95 leading-[1.04] tracking-[-0.022em] text-[clamp(1.95rem,1.25rem+2.4vw,3.1rem)] max-w-[24ch]">
                      Renders can be faked.<br />
                      <span className="text-foreground/55 italic font-normal">Twenty years on the ground cannot.</span>
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-12" delay={260} />
                  <RevealOnScroll direction="up" duration={1000} delay={340}>
                    <p className="font-sans font-light text-foreground/65 leading-[1.85] text-[clamp(0.98rem,0.88rem+0.3vw,1.1rem)] max-w-2xl">
                      No sales pitch. Just the work. Operator at the controls, hands on the horse,
                      ground under boots. The proof of a horse property is the years spent on the
                      ones that came before it.
                    </p>
                  </RevealOnScroll>
                </div>
              </div>

              {/* Proof grid — three frames, staggered */}
              <div className="grid grid-cols-12 gap-[clamp(0.75rem,0.5rem+0.75vw,1.5rem)]">
                <RevealOnScroll direction="up" duration={1300} className="col-span-12 sm:col-span-8">
                  <figure className="relative aspect-[16/10] overflow-hidden group">
                    <img
                      src={ciroQuietMoment.url}
                      alt="Ciro with Ace in the home arena — lived horsemanship behind Peninsula Equine's arena and stable work."
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-[50%_45%] will-change-transform group-hover:scale-[1.025]"
                      style={{
                        filter: "brightness(0.84) contrast(1.08) saturate(0.78)",
                        transition: "transform var(--pe-dur-cinematic) var(--pe-ease)",
                      }}
                    />
                    <figcaption className="absolute bottom-4 left-5 right-5 font-mono uppercase text-[9.5px] tracking-[0.42em] text-foreground/75">
                      <span className="text-accent/70">01 / Experience</span> · Built from the saddle out
                    </figcaption>
                  </figure>
                </RevealOnScroll>

                <RevealOnScroll direction="up" duration={1300} delay={120} className="col-span-12 sm:col-span-4">
                  <figure className="relative aspect-[16/10] sm:aspect-[3/4] overflow-hidden group">
                    <img
                      src={ciroArena.url}
                      alt="Standing with the horse in a finished indoor arena, late light across the footing"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-[50%_42%] will-change-transform group-hover:scale-[1.025]"
                      style={{
                        filter: "brightness(0.82) contrast(1.1) saturate(0.78)",
                        transition: "transform var(--pe-dur-cinematic) var(--pe-ease)",
                      }}
                    />
                    <figcaption className="absolute bottom-4 left-5 right-5 font-mono uppercase text-[9.5px] tracking-[0.42em] text-foreground/75">
                      <span className="text-accent/70">02 / Quiet</span> · Standing the ground we built
                    </figcaption>
                  </figure>
                </RevealOnScroll>

                <RevealOnScroll direction="up" duration={1300} delay={220} className="col-span-12 sm:col-span-5">
                  <figure className="relative aspect-[4/3] overflow-hidden group">
                    <img
                      src={craftBoots}
                      alt="Hands and worn boots on a steel frame mid-build — human-led construction on a Peninsula Equine site"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center will-change-transform group-hover:scale-[1.025]"
                      style={{
                        filter: "brightness(0.82) contrast(1.12) saturate(0.75)",
                        transition: "transform var(--pe-dur-cinematic) var(--pe-ease)",
                      }}
                    />
                    <figcaption className="absolute bottom-4 left-5 right-5 font-mono uppercase text-[9.5px] tracking-[0.42em] text-foreground/75">
                      <span className="text-accent/70">03 / Craft</span> · Hands on the work
                    </figcaption>
                  </figure>
                </RevealOnScroll>

                <RevealOnScroll direction="up" duration={1300} delay={320} className="col-span-12 sm:col-span-7">
                  <figure className="relative aspect-[4/3] overflow-hidden group">
                    <img
                      src={legacyPavilion}
                      alt="Main Ridge parrilla — the lit fire and finished steel hood of the completed pavilion, the legacy environment built for a horse property"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-[50%_55%] will-change-transform group-hover:scale-[1.025]"
                      style={{
                        filter: "brightness(0.82) contrast(1.1) saturate(0.78)",
                        transition: "transform var(--pe-dur-cinematic) var(--pe-ease)",
                      }}
                    />
                    <figcaption className="absolute bottom-4 left-5 right-5 font-mono uppercase text-[9.5px] tracking-[0.42em] text-foreground/75">
                      <span className="text-accent/70">04 / Legacy</span> · Built to outlast the build
                    </figcaption>
                  </figure>
                </RevealOnScroll>
              </div>
            </div>
          </section>


          {/* Field Notes — live build feature */}
          <section className="relative py-[clamp(3.5rem,2rem+5vw,8.5rem)] bg-background overflow-hidden border-t border-accent/10">
            <div className="section-container max-w-[1480px] mx-auto">
              <RevealOnScroll direction="up" duration={900}>
                <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2.5vw,4rem)]">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">05</span>
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
                      className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-1000 ease-out group-hover:scale-[1.02] object-[62%_58%] sm:object-[58%_55%] md:object-[50%_50%]"
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
                            Steel rising. Ground settling. The work between milestones.
                          </p>
                          <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.9rem,0.82rem+0.2vw,1rem)]">
                            A live read on a covered arena and stable build — structure, weather and the layers that decide how it lasts.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                          <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/82 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]">
                            <span className="w-8 h-px bg-accent/60 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                            View Field Note
                          </span>
                          <span
                            role="link"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate("/field-notes"); }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); navigate("/field-notes"); } }}
                            className="group/alt inline-flex items-center gap-3 font-mono uppercase text-foreground/50 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em] cursor-pointer"
                          >
                            <span className="w-6 h-px bg-foreground/25 transition-all duration-700 group-hover/alt:w-12 group-hover/alt:bg-foreground/60" />
                            Read Field Notes
                          </span>
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
                        alt="Current build crane lift raising arena structure panels beneath a dramatic storm sky"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-[1.02]"
                        style={{ filter: "brightness(0.74) contrast(1.12) saturate(0.78)" }}
                    />
                  </div>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={240}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={coveredArenaExterior}
                      alt="Covered arena interior under construction with sunbeam light entering the open span"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-[1.02]"
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
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">06</span>
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
                        className="absolute inset-0 w-full h-full object-cover image-bleed transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
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

          <HomeTestimonialsStrip />
          <HomeEventsStrip />

          <section className="relative py-[clamp(4rem,2.5rem+6vw,10rem)] bg-background overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/82 to-background" />
            <div className="relative section-container max-w-3xl mx-auto text-center space-y-[clamp(2rem,1.25rem+2.5vw,3rem)]">
              <RevealOnScroll direction="up" duration={900}>
                <div className="mx-auto flex items-baseline justify-center gap-5">
                  <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">07</span>
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
