import { useRef, useEffect, useState, useCallback } from "react";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Link } from "react-router-dom";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { HeroAtmosphere } from "@/components/HeroAtmosphere";
import { useIntake } from "@/hooks/useIntake";


// Locked 5-image system
import systemHero from "@/assets/system-hero.jpg";
import systemStructure from "@/assets/system-structure.jpg";
import systemProcess from "@/assets/system-process.jpg";
import systemOutcome from "@/assets/system-outcome.jpg";
import systemEvent from "@/assets/system-event.jpg";

// Transformation (slider exception)
import transformBefore from "@/assets/transform-before.jpg";
import transformAfter from "@/assets/transform-after.jpg";

export default function Index() {
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [heroFade, setHeroFade] = useState(1);

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
    <>
      <BrandIntro onComplete={() => {}} />
      <Layout>
        {/* ═══ 1. HERO — Cinematic, dominant ═══════════════ */}
        <section className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center" style={{ paddingBottom: "8vh" }}>
          <img
            src={systemHero}
            alt="Covered equestrian arena at dusk"
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={1080}
            loading="eager"
            style={{
              objectPosition: "50% 72%",
              filter: "brightness(0.88) contrast(1.18) saturate(0.78) sepia(0.06)",
              animation: "heroSlowZoom 25s ease-out forwards",
            }}
          />
          {/* Deep cinematic vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(0,0,0,0.55) 100%)" }} />

          {/* Atmosphere: blueprint pulse, drifting dust, warm cast */}
          <HeroAtmosphere />

          <div
            ref={heroContentRef}
            className="relative z-10 text-center px-6 max-w-4xl mx-auto"
            style={{ opacity: heroFade, willChange: "opacity", marginTop: "-18vh" }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-[0.55em] text-white/35 opacity-0 animate-fade-in"
              style={{
                animationDelay: "200ms",
                animationFillMode: "both",
                animationDuration: "800ms",
              }}
            >
              Peninsula Equine
            </p>

            <h1
              className="mt-8 font-serif font-semibold text-white tracking-tight leading-[0.9] opacity-0 animate-fade-in"
              style={{
                fontSize: "clamp(2.6rem, 1.2rem + 6vw, 5.8rem)",
                animationDelay: "500ms",
                animationFillMode: "both",
                animationDuration: "900ms",
                textShadow: "0 2px 40px rgba(0,0,0,0.55), 0 0 90px rgba(0,0,0,0.2)",
              }}
            >
              From Dirt to Dynasty.
            </h1>

            <p
              className="mt-6 font-serif italic text-white/75 opacity-0 animate-fade-in"
              style={{
                fontSize: "clamp(1.05rem, 0.6rem + 1.1vw, 1.6rem)",
                animationDelay: "800ms",
                animationFillMode: "both",
                animationDuration: "900ms",
                textShadow: "0 2px 24px rgba(0,0,0,0.5)",
              }}
            >
              Built by riders. Crafted for performance.
            </p>

            <p
              className="mt-8 mx-auto font-sans font-light text-white/55 leading-relaxed opacity-0 animate-fade-in"
              style={{
                fontSize: "clamp(0.9rem, 0.55rem + 0.5vw, 1.05rem)",
                maxWidth: "36rem",
                animationDelay: "1100ms",
                animationFillMode: "both",
                animationDuration: "900ms",
              }}
            >
              Premium equine environments engineered through craftsmanship, horsemanship and experience.
            </p>

            <div
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in"
              style={{
                animationDelay: "1400ms",
                animationFillMode: "both",
                animationDuration: "900ms",
              }}
            >
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center px-8 py-3.5 bg-[hsl(38_28%_88%)] text-[hsl(0_0%_8%)] text-[11px] uppercase tracking-[0.22em] font-medium rounded-sm shadow-[0_10px_40px_-12px_rgba(244,220,170,0.35)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[hsl(38_32%_93%)]"
              >
                Start Your Project
                <span className="ml-3 text-[hsl(0_0%_8%)]/50 transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-white/25 text-white/75 text-[11px] uppercase tracking-[0.22em] font-medium rounded-sm transition-all duration-500 hover:border-white/60 hover:text-white hover:bg-white/[0.04]"
              >
                View Our Work
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
            position: "relative",
            zIndex: 5,
          }}
          aria-hidden="true"
        />

        {/* ═══ BREATHING STATEMENT ═════════════════════════ */}
        <section className="relative overflow-hidden cv-auto">
          <div className="py-36 sm:py-44 lg:py-52 bg-card relative">
            <div className="absolute inset-0 grain-texture opacity-20" />
            <div className="section-container relative z-10 max-w-4xl mx-auto text-center">
              <RevealOnScroll direction="up">
                <p
                  className="font-serif font-light tracking-[0.06em] leading-[1.6]"
                  style={{
                    fontSize: "clamp(1.1rem, 0.6rem + 2vw, 1.75rem)",
                    color: "hsl(var(--foreground) / 0.18)",
                  }}
                >
                  No two builds are the same. Every surface is considered.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ═══ BREATHING → STRUCTURE TRANSITION ════════════ */}
        <div
          className="relative"
          style={{
            height: "clamp(4rem, 8vw, 7rem)",
            background: "linear-gradient(to bottom, hsl(var(--card)), #0a0a0a)",
          }}
          aria-hidden="true"
        />

        {/* ═══ 2. STRUCTURE — Strong, clear, architectural ══ */}
        <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-end overflow-hidden" style={{ background: "#0a0a0a" }}>
          <img
            src={systemStructure}
            alt="Steel frame structure under construction"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            style={{ objectPosition: "50% 32%", filter: "brightness(0.85) contrast(1.1) saturate(0.8)" }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, #0a0a0a 100%)" }} />
          {/* Sharp architectural gradient — harder edge than hero */}
          <div className="absolute inset-x-0 bottom-0 h-[28%]" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.75) 0%, transparent 100%)" }} />
          <div className="relative z-10 section-container max-w-6xl mx-auto pb-20 sm:pb-28">
            <h2
              className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[0.88] opacity-0 animate-fade-in"
              style={{
                animationDelay: "300ms",
                animationFillMode: "both",
                animationDuration: "800ms",
                textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              Selected Work
            </h2>
          </div>
        </section>

        {/* ═══ STRUCTURE → PROCESS TRANSITION ══════════════ */}
        <div
          className="relative"
          style={{
            height: "clamp(4rem, 8vw, 7rem)",
            background: "linear-gradient(to bottom, #0a0a0a, hsl(var(--background)))",
          }}
          aria-hidden="true"
        />

        {/* ═══ 3. PROCESS — Grounded, tactile ═════════════ */}
        <section className="pt-20 sm:pt-28 pb-32 sm:pb-40 relative overflow-hidden">
          {/* Darker, grounded undertone */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 35% 50%, hsl(30 12% 8% / 0.06), transparent)" }} />
          <div className="section-container max-w-6xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
              <div
                className="lg:col-span-3 opacity-0 animate-fade-in relative"
                style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
              >
                <img
                  src={systemProcess}
                  alt="Telehandler auger drilling into earth"
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                  style={{ objectPosition: "50% 60%", filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, hsl(222 20% 4% / 0.55) 100%)" }} />
              </div>
              <div
                className="lg:col-span-2 opacity-0 animate-fade-in"
                style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
              >
                <h2 className="font-serif text-3xl sm:text-4xl text-foreground/85 tracking-tight leading-[0.9] mb-5">
                  How We Build
                </h2>
                <p className="text-[13px] text-foreground/30 leading-[1.8]">
                  Engineered from the ground up.
                </p>
                <div className="mt-6 w-8 h-px bg-accent/8" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ THREAD ══════════════════════════════════════ */}
        <div className="mx-auto" style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.06), transparent)" }} aria-hidden="true" />

        {/* ═══ 4. OUTCOME — Softer, warmer ═════════════════ */}
        <section className="pt-16 sm:pt-20 pb-32 sm:pb-40 relative overflow-hidden">
          {/* Warm, softer ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, hsl(35 25% 16% / 0.05), transparent)" }} />
          <div className="section-container max-w-6xl mx-auto">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={systemOutcome}
                  alt="Completed equestrian property — aerial view"
                  className="w-full aspect-[21/9] object-cover"
                  loading="lazy"
                  style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, hsl(222 20% 4% / 0.5) 100%)" }} />
              </div>
            </div>
            <p
              className="mt-8 font-serif italic text-[13px] sm:text-[14px] text-foreground/20 text-center tracking-[0.02em] opacity-0 animate-fade-in"
              style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1000ms" }}
            >
              The outcome speaks for itself.
            </p>
          </div>
        </section>

        {/* ═══ THREAD ══════════════════════════════════════ */}
        <div className="mx-auto" style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.06), transparent)" }} aria-hidden="true" />

        {/* ═══ EVENT SCALE — Confident, expansive ══════════ */}
        <section className="pt-16 sm:pt-20 pb-28 sm:pb-36 relative overflow-hidden">
          <div className="section-container max-w-6xl mx-auto">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={systemEvent}
                  alt="Indoor equestrian arena — event scale"
                  className="w-full aspect-[21/9] object-cover"
                  loading="lazy"
                  style={{ objectPosition: "50% 55%", filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, hsl(222 20% 4% / 0.5) 100%)" }} />
              </div>
            </div>
            <p
              className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/12 text-center opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              Built for performance at any scale.
            </p>
          </div>
        </section>

        {/* ═══ THREAD ══════════════════════════════════════ */}
        <div className="mx-auto" style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.04), transparent)" }} aria-hidden="true" />

        {/* ═══ TRANSFORMATION — Reflective, earned ═════════ */}
        <section className="pt-16 sm:pt-20 pb-32 sm:pb-40 relative overflow-hidden">
          <div className="section-container max-w-5xl mx-auto">
            <RevealOnScroll direction="up">
              <h2 className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.45em] text-foreground/20 mb-4 text-center">
                Transformation
              </h2>
              <p className="font-serif italic text-[12px] sm:text-[13px] text-foreground/12 text-center tracking-[0.03em] mb-14 sm:mb-18">
                From dirt to dynasty.
              </p>
            </RevealOnScroll>
            <BeforeAfterSlider
              before={transformBefore}
              after={transformAfter}
              alt="Site transformation — raw paddock to engineered equestrian estate"
            />
          </div>
        </section>

        {/* ═══ FINAL CTA ══════════════════════════════════ */}
        <section className="py-36 sm:py-48 lg:py-56 relative">
          <div className="text-center">
            <Link
              to="/contact"
              className="inline-block px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-accent/[0.03] transition-colors duration-500 opacity-0 animate-fade-in"
              style={{
                borderColor: "hsl(var(--accent) / 0.08)",
                color: "hsl(var(--foreground) / 0.35)",
                animationDelay: "200ms",
                animationFillMode: "both",
                animationDuration: "800ms",
              }}
            >
              Apply to Build →
            </Link>
            <p
              className="mt-5 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10 opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              Selected projects only.
            </p>
          </div>
        </section>
      </Layout>
    </>
  );
}
