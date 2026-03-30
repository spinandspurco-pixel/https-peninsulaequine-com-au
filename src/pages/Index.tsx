import { useRef, useEffect, useState, useCallback } from "react";
import { BrandIntro } from "@/components/BrandIntro";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Link } from "react-router-dom";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

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
              filter: "brightness(0.92) contrast(1.12) saturate(1.08)",
              animation: "heroSlowZoom 25s ease-out forwards",
            }}
          />
          {/* Deep cinematic vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(0,0,0,0.4) 100%)" }} />

          <div
            ref={heroContentRef}
            className="relative z-10 text-center"
            style={{ opacity: heroFade, willChange: "opacity", marginTop: "-22vh" }}
          >
            <h1
              className="font-serif font-semibold text-white tracking-tight leading-[0.9] opacity-0 animate-fade-in"
              style={{
                fontSize: "clamp(2.6rem, 1.2rem + 6vw, 5.8rem)",
                animationDelay: "300ms",
                animationFillMode: "both",
                animationDuration: "800ms",
                textShadow: "0 2px 40px rgba(0,0,0,0.45), 0 0 80px rgba(0,0,0,0.15)",
              }}
            >
              From Dirt to Dynasty.
            </h1>
            <p
              className="mt-10 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.5em] text-white/30 opacity-0 animate-fade-in"
              style={{
                animationDelay: "700ms",
                animationFillMode: "both",
                animationDuration: "800ms",
              }}
            >
              Built environments for equine performance
            </p>
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
            background: "linear-gradient(to bottom, hsl(var(--card)), #030303)",
          }}
          aria-hidden="true"
        />

        {/* ═══ 2. STRUCTURE — Selected Work ════════════════ */}
        <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-end overflow-hidden" style={{ background: "#030303" }}>
          <img
            src={systemStructure}
            alt="Steel frame structure under construction"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            style={{ objectPosition: "50% 32%", filter: "brightness(1.15) contrast(1.22)" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 section-container max-w-6xl mx-auto pb-20 sm:pb-28">
            <h2
              className="font-serif text-3xl sm:text-4xl text-white/95 tracking-tight opacity-0 animate-fade-in"
              style={{
                animationDelay: "300ms",
                animationFillMode: "both",
                animationDuration: "800ms",
                textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)",
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
            background: "linear-gradient(to bottom, #030303, hsl(var(--background)))",
          }}
          aria-hidden="true"
        />

        {/* ═══ 3. PROCESS — How We Build ═══════════════════ */}
        <section className="pt-20 sm:pt-28 pb-28 sm:pb-36 relative overflow-hidden">
          <div className="section-container max-w-6xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
              <div
                className="lg:col-span-3 opacity-0 animate-fade-in"
                style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
              >
                <img
                  src={systemProcess}
                  alt="Telehandler auger drilling into earth"
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                  style={{ objectPosition: "50% 60%", filter: "brightness(1.2) contrast(1.08)" }}
                />
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
              </div>
            </div>
          </div>
        </section>

        {/* ═══ THREAD ══════════════════════════════════════ */}
        <div className="mx-auto" style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.06), transparent)" }} aria-hidden="true" />

        {/* ═══ 4. OUTCOME — Standalone visual ══════════════ */}
        <section className="pt-12 sm:pt-16 pb-28 sm:pb-36 relative overflow-hidden">
          <div className="section-container max-w-6xl mx-auto">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <img
                src={systemOutcome}
                alt="Completed equestrian property — aerial view"
                className="w-full aspect-[21/9] object-cover"
                loading="lazy"
                style={{ filter: "brightness(1.18) contrast(1.04) saturate(1.06) sepia(0.03)" }}
              />
            </div>
            <p
              className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/15 text-center opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              The outcome speaks for itself.
            </p>
          </div>
        </section>

        {/* ═══ THREAD ══════════════════════════════════════ */}
        <div className="mx-auto" style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.06), transparent)" }} aria-hidden="true" />

        {/* ═══ EVENT SCALE ═════════════════════════════ */}
        <section className="pt-12 sm:pt-16 pb-28 sm:pb-36 relative overflow-hidden">
          <div className="section-container max-w-6xl mx-auto">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <img
                src={systemEvent}
                alt="Indoor equestrian arena — event scale"
                className="w-full aspect-[21/9] object-cover"
                loading="lazy"
                style={{ objectPosition: "50% 55%", filter: "brightness(1.18) contrast(1.06)" }}
              />
            </div>
            <p
              className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/15 text-center opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              Built for performance at any scale.
            </p>
          </div>
        </section>

        {/* ═══ THREAD ══════════════════════════════════════ */}
        <div className="mx-auto" style={{ width: "1px", height: "clamp(3rem, 6vw, 5rem)", background: "linear-gradient(to bottom, hsl(var(--accent) / 0.06), transparent)" }} aria-hidden="true" />

        {/* ═══ TRANSFORMATION (slider exception) ═══════════ */}
        <section className="pt-12 sm:pt-16 pb-28 sm:pb-36 relative overflow-hidden">
          <div className="section-container max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground/80 tracking-tight mb-10 sm:mb-14">
              Transformation
            </h2>
            <BeforeAfterSlider
              before={transformBefore}
              after={transformAfter}
              alt="Site transformation"
            />
            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/15 text-center">
              From Dirt to Dynasty.
            </p>
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
