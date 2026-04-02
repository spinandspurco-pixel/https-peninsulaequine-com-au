import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

import glIconHero from "@/assets/gl-icon-hero.jpg";
import glAbstractPattern from "@/assets/gl-abstract-pattern.jpg";
import glApplicationHint from "@/assets/gl-application-hint.jpg";

export default function GroundLock() {
  return (
    <Layout>
      {/* ═══ 1. HERO — System Identity ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <img
          src={glIconHero}
          alt="GroundLock system mark"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
          loading="eager"
          style={{ objectPosition: "52% 48%", transform: "scale(1.15)", filter: "brightness(0.96) contrast(1.06) saturate(0.9)" }}
        />

        <div className="relative z-10 text-center px-6" style={{ marginTop: "-10vh", marginLeft: "3vw" }}>
          <h1
            className="font-serif font-semibold text-white tracking-tight leading-[1.1] opacity-0 animate-fade-in"
            style={{
              fontSize: "clamp(1.8rem, 0.9rem + 4.5vw, 4rem)",
              animationDelay: "300ms",
              animationFillMode: "both",
              animationDuration: "1200ms",
              textShadow: "0 0 40px rgba(180, 140, 60, 0.25), 0 0 80px rgba(180, 140, 60, 0.1), 0 2px 20px rgba(0, 0, 0, 0.6)",
            }}
          >
            GroundLock™
          </h1>

          <p
            className="mt-8 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-white/45 opacity-0 animate-fade-in"
            style={{
              animationDelay: "700ms",
              animationFillMode: "both",
              animationDuration: "1200ms",
              textShadow: "0 0 30px rgba(180, 140, 60, 0.12), 0 2px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            Directional Interlock System
          </p>

          <p
            className="mt-16 font-serif text-[12px] sm:text-[13px] italic text-white/30 opacity-0 animate-fade-in"
            style={{
              animationDelay: "1200ms",
              animationFillMode: "both",
              animationDuration: "1200ms",
              textShadow: "0 0 20px rgba(180, 140, 60, 0.08), 0 2px 10px rgba(0, 0, 0, 0.4)",
            }}
          >
            Built for load. Designed for control.
          </p>

          <p
            className="mt-8 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/18 opacity-0 animate-fade-in"
            style={{
              animationDelay: "1600ms",
              animationFillMode: "both",
              animationDuration: "1200ms",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
            }}
          >
            System in development
          </p>
        </div>
      </section>

      {/* ═══ 2. SYSTEM PRESENCE — Abstract ══════════════ */}
      <section className="py-52 sm:py-64 lg:py-80 relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="section-container max-w-5xl mx-auto px-6">
          <img
            src={glAbstractPattern}
            alt="GroundLock system pattern"
            className="w-full aspect-[21/9] object-cover"
            loading="lazy"
            width={1920}
            height={1080}
            style={{ opacity: 0.35, filter: "blur(2px)" }}
          />
          <p className="mt-20 font-serif text-base sm:text-lg text-white/20 text-center tracking-wide italic">
            Directional logic. Structural intent.
          </p>
        </div>
      </section>

      {/* ═══ 3. APPLICATION HINT ════════════════════════ */}
      <section className="py-40 sm:py-52 lg:py-64 relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="section-container max-w-5xl mx-auto px-6">
          <img
            src={glApplicationHint}
            alt="Arena surface — GroundLock application"
            className="w-full aspect-[21/9] object-cover"
            loading="lazy"
            width={1920}
            height={1080}
          />
          <div className="mt-16 text-center">
            <p className="font-serif text-base sm:text-lg text-white/25 tracking-wide italic leading-[1.6]">
              Permanent where you need it.
              <br />
              Deployable where you don't.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CLOSING CTA ═══════════════════════════════ */}
      <section className="py-40 sm:py-52 lg:py-64 relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="relative z-[1] text-center max-w-md mx-auto px-6">
          <Link
            to="/site-assessment"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent/50 hover:text-accent/80 transition-colors duration-500"
          >
            Request Assessment <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.35em] text-white/15">
            Limited deployment availability
          </p>
        </div>
      </section>
    </Layout>
  );
}
