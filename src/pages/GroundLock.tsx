import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { GroundLockCrossSection } from "@/components/groundlock/GroundLockCrossSection";
import groundlockCutaway from "@/assets/groundlock-horseshoe-canonical.jpg";
import groundlockComparison from "@/assets/groundlock-horseshoe-canonical.jpg";
import groundlockInstall from "@/assets/groundlock-horseshoe-canonical.jpg";
import impactFailure from "@/assets/groundlock-impact-failure.jpg";
import impactSuccess from "@/assets/groundlock-impact-success.jpg";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockProductEducation } from "@/components/groundlock/GroundLockProductEducation";
import { PanelSpecimen, SystemDiagram, LockSequence } from "@/components/groundlock/GroundLockSystemSVG";
import { GroundLockHero } from "@/components/groundlock/GroundLockHero";
import { GroundLockProjectForm } from "@/components/groundlock/GroundLockProjectForm";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Scroll Progress Indicator ─────────────────── */
const STEPS = [
  { id: "step-plan", label: "Plan" },
  { id: "step-kit", label: "Kit" },
  { id: "step-delivery", label: "Delivery" },
];

function StepProgressIndicator() {
  const [activeStep, setActiveStep] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const els = STEPS.map((s) => document.getElementById(s.id));
      const viewMid = window.innerHeight * 0.45;

      // Show indicator only when first step is approaching
      const first = els[0];
      const last = els[els.length - 1];
      if (first && last) {
        const firstTop = first.getBoundingClientRect().top;
        const lastBottom = last.getBoundingClientRect().bottom;
        setVisible(firstTop < window.innerHeight * 0.8 && lastBottom > 0);
      }

      let current = -1;
      els.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < viewMid + 100) current = i;
      });
      setActiveStep(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-3 transition-opacity duration-500",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {STEPS.map((step, i) => (
        <button
          key={step.id}
          onClick={() => document.getElementById(step.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="group flex items-center gap-2.5"
        >
          <span
            className={cn(
              "text-[9px] font-mono uppercase tracking-[0.25em] transition-all duration-300",
              i === activeStep
                ? "text-accent/60 translate-x-0"
                : i < activeStep
                  ? "text-accent/20 translate-x-0"
                  : "text-muted-foreground/15 translate-x-1 group-hover:translate-x-0 group-hover:text-muted-foreground/30"
            )}
          >
            {step.label}
          </span>
          <span
            className={cn(
              "rounded-full transition-all duration-300",
              i === activeStep
                ? "w-2 h-2 bg-accent/50"
                : i < activeStep
                  ? "w-1.5 h-1.5 bg-accent/20"
                  : "w-1.5 h-1.5 bg-muted-foreground/12 group-hover:bg-muted-foreground/25"
            )}
          />
        </button>
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────── */
export default function GroundLock() {
  return (
    <Layout>
      <StepProgressIndicator />
      {/* ═══ SECTION 1 — HERO ═════════════════════════════ */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          {/* Micro label */}
          <div
            className="flex items-center justify-center gap-4 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <div className="w-8 h-px bg-accent/20" />
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-accent/35">
              P.E. GroundLock™
            </span>
            <div className="w-8 h-px bg-accent/20" />
          </div>

          {/* Headline */}
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground/90 tracking-tight leading-[1.05] mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            This is what ground<br />should have always been.
          </h1>

          {/* Subtext */}
          <p
            className="text-[13px] text-primary-foreground/30 leading-[1.8] mb-3 opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Every temporary system is a compromise. This removes it.
          </p>

          {/* Secondary line */}
          <p
            className="text-[12px] font-mono uppercase tracking-[0.2em] text-accent/25 mb-14 opacity-0 animate-fade-in"
            style={{ animationDelay: "800ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            Built for load. Built for drainage. Built to last.
          </p>

          {/* CTA */}
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: "1000ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <Link to="/site-assessment">
              <Button variant="gold" size="lg">
                Request GroundLock System Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM OVERVIEW — Interlock Diagram ═══════ */}
      <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-3xl mx-auto relative z-[1]">
          <p
            className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30 text-center mb-16 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            System Overview
          </p>

          {/* Diagram: single panel → interlocking pair → lock detail */}
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            <svg viewBox="0 0 800 280" className="w-full h-auto" aria-label="GroundLock directional interlock system diagram">
              <defs>
                <linearGradient id="sov-panel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="sov-panel-dark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* ── Single Panel (left) ── */}
              <g transform="translate(40, 40)">
                <text x="65" y="-8" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity="0.3">SINGLE PANEL</text>
                {/* Horseshoe U-form */}
                <path d="M30,0 L100,0 L100,160 L80,160 L80,20 L50,20 L50,160 L30,160 Z" fill="url(#sov-panel)" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeOpacity="0.15" />
                {/* Tab indicators */}
                <rect x="38" y="55" width="4" height="12" rx="1" fill="hsl(var(--foreground))" opacity="0.1" />
                <rect x="88" y="55" width="4" height="12" rx="1" fill="hsl(var(--foreground))" opacity="0.1" />
                <rect x="38" y="110" width="4" height="12" rx="1" fill="hsl(var(--foreground))" opacity="0.1" />
                <rect x="88" y="110" width="4" height="12" rx="1" fill="hsl(var(--foreground))" opacity="0.1" />
                {/* Crown */}
                <rect x="55" y="0" width="20" height="4" rx="1" fill="hsl(var(--accent))" opacity="0.2" />
              </g>

              {/* ── Interlocking Pair (center) ── */}
              <g transform="translate(260, 30)">
                <text x="120" y="-2" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity="0.3">DIRECTIONAL INTERLOCK</text>
                {/* Panel A — upright */}
                <path d="M30,10 L100,10 L100,170 L80,170 L80,30 L50,30 L50,170 L30,170 Z" fill="url(#sov-panel)" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeOpacity="0.15" />
                <rect x="55" y="10" width="20" height="4" rx="1" fill="hsl(var(--accent))" opacity="0.2" />
                {/* Panel B — inverted, offset */}
                <path d="M140,180 L210,180 L210,20 L190,20 L190,160 L160,160 L160,20 L140,20 Z" fill="url(#sov-panel-dark)" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeOpacity="0.15" />
                <rect x="165" y="176" width="20" height="4" rx="1" fill="hsl(var(--accent))" opacity="0.2" />
                {/* Connection zone highlight */}
                <rect x="95" y="60" width="50" height="70" rx="2" fill="hsl(var(--accent))" opacity="0.04" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 3" />
                {/* Lock arrows */}
                <line x1="105" y1="95" x2="135" y2="95" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.25" />
                <polygon points="133,92 140,95 133,98" fill="hsl(var(--accent))" opacity="0.3" />
              </g>

              {/* ── Lock Detail (right) ── */}
              <g transform="translate(570, 30)">
                <text x="100" y="-2" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity="0.3">LOCK POINT</text>
                {/* Zoomed connection */}
                <rect x="20" y="20" width="160" height="160" rx="3" fill="hsl(var(--foreground))" opacity="0.02" stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.08" />
                {/* Panel edge A */}
                <rect x="40" y="40" width="50" height="120" rx="2" fill="url(#sov-panel)" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeOpacity="0.12" />
                {/* Tab protruding */}
                <rect x="90" y="75" width="16" height="14" rx="2" fill="hsl(var(--accent))" opacity="0.12" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeOpacity="0.2" />
                {/* Panel edge B */}
                <rect x="110" y="40" width="50" height="120" rx="2" fill="url(#sov-panel-dark)" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeOpacity="0.12" />
                {/* Slot receiving */}
                <rect x="96" y="78" width="16" height="8" rx="1" fill="hsl(var(--foreground))" opacity="0.06" />
                {/* Lock indicator */}
                <circle cx="106" cy="82" r="2" fill="hsl(var(--accent))" opacity="0.35" />
                {/* Zoom lines */}
                <line x1="20" y1="20" x2="10" y2="10" stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.08" />
                <line x1="180" y1="20" x2="190" y2="10" stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.08" />
                <line x1="20" y1="180" x2="10" y2="190" stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.08" />
                <line x1="180" y1="180" x2="190" y2="190" stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.08" />
              </g>

              {/* Connector lines between groups */}
              <line x1="175" y1="140" x2="255" y2="140" stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="4 4" />
              <line x1="510" y1="140" x2="565" y2="140" stroke="hsl(var(--foreground))" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Description */}
          <p
            className="text-[12px] sm:text-[13px] text-muted-foreground/35 text-center leading-[1.8] mt-14 max-w-lg mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            Directional interlock system designed for load distribution,<br className="hidden sm:inline" /> drainage, and surface stability.
          </p>
        </div>
      </section>

      {/* ═══ IMPACT LAYER — Visual Contrast ═════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative w-full" style={{ minHeight: "clamp(320px, 50vw, 560px)" }}>
          {/* Split images */}
          <div className="absolute inset-0 grid grid-cols-2">
            {/* LEFT — Failure */}
            <RevealOnScroll direction="up" delay={0}>
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={impactFailure}
                  alt="Destroyed muddy ground — rutting and water damage"
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(0.6) brightness(0.7)" }}
                  loading="lazy"
                  width={960}
                  height={640}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, transparent 60%, hsl(var(--background)) 100%)" }}
                />
              </div>
            </RevealOnScroll>

            {/* RIGHT — Success */}
            <RevealOnScroll direction="up" delay={400}>
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={impactSuccess}
                  alt="Clean GroundLock stabilised surface"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={960}
                  height={640}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to left, transparent 60%, hsl(var(--background)) 100%)" }}
                />
              </div>
            </RevealOnScroll>
          </div>

          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-background/40" />

          {/* Center divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/8 z-10" />

          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <RevealOnScroll direction="up" delay={800}>
              <p
                className="font-serif italic tracking-[0.04em] text-center"
                style={{
                  fontSize: "clamp(1.1rem, 0.6rem + 2vw, 1.6rem)",
                  color: "hsl(var(--foreground) / 0.55)",
                }}
              >
                One holds. One fails.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — THE SYSTEM (single explanation) ═══ */}
      <section id="system" className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-14 sm:mb-20">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-10" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-5">System Architecture</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground mb-4">
                  The Panel → The Lock → The System
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={160}>
                <p className="text-[13px] text-muted-foreground/32 leading-[1.7] max-w-md mx-auto">
                  Crown into opening. Tab into slot. A unified field that resists movement in every direction.
                </p>
              </RevealOnScroll>
            </div>

            <div className="space-y-16 sm:space-y-20">
              <PanelSpecimen />
              <div className="w-10 h-px bg-accent/8 mx-auto" />
              <LockSequence />
              <div className="w-10 h-px bg-accent/8 mx-auto" />
              <SystemDiagram />
            </div>

            <RevealOnScroll direction="up" delay={200}>
              <div className="text-center mt-14">
                <Link to="/groundlock/how-it-works" className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-accent/35 hover:text-accent/60 transition-colors">
                  Explore full technical detail <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ CROSS-SECTION — Technical Authority Layer ═══ */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-14 sm:mb-20">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-10" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-5">System Cross-Section</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground mb-4">
                  Built from the Subgrade Up
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={160}>
                <p className="text-[13px] text-muted-foreground/32 leading-[1.7] max-w-md mx-auto">
                  Every layer engineered to perform under load — not just sit in place.
                </p>
              </RevealOnScroll>
            </div>

            <GroundLockCrossSection />
          </div>
        </div>
      </section>

      {/* ═══ CUTAWAY VISUAL ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-24 relative border-t border-border/8">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <img
                src={groundlockCutaway}
                alt="GroundLock system cutaway — surface layer, interlocking panel system, and prepared sub-base"
                className="w-full h-auto rounded-sm"
                loading="lazy"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ THE COST OF FAILURE ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 bg-primary relative border-t border-primary-foreground/[0.04]">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-start">
              {/* Left — Cost of Failure */}
              <div>
                <RevealOnScroll direction="up">
                  <p className="text-overline mb-8 text-primary-foreground/20">The Cost of Failure</p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={80}>
                  <ul className="space-y-5">
                    {[
                      "Surface damage",
                      "Rework costs",
                      "Downtime",
                      "Weather impact",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-4 text-[13px] text-primary-foreground/30 leading-[1.7]">
                        <span className="w-5 h-px bg-primary-foreground/10 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </RevealOnScroll>
              </div>
            </div>

            {/* Micro-line */}
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-primary-foreground/10 text-center my-16">
              This is what replaces it.
            </p>

            <div>
              {/* The New Standard */}
              <div>
                <RevealOnScroll direction="up" delay={200}>
                  <p className="text-overline mb-8 text-accent/40">The New Standard</p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" delay={280}>
                  <ul className="space-y-5">
                    {[
                      "Structural integrity",
                      "Load distribution",
                      "Long-term performance",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-4 text-[13px] text-primary-foreground/55 leading-[1.7] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/35 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON — Standard vs GroundLock — #8 ══════ */}
      <section id="step-plan" className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-36 bg-primary relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-16 sm:mb-20">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-10" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-primary-foreground">
                  A Different Kind of System
                </h2>
              </RevealOnScroll>
            </div>

            {/* Simplified 2-column comparison — #8 */}
            <RevealOnScroll direction="up" delay={150}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-primary-foreground/[0.03] p-7 sm:p-9 rounded-sm">
                  <p className="text-overline mb-6 text-primary-foreground/25">Standard Systems</p>
                  <ul className="space-y-3.5">
                    {["Generic grid geometry", "Inconsistent load behaviour", "No directional logic"].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[12px] text-primary-foreground/30 leading-[1.7]">
                        <span className="w-1 h-1 rounded-full bg-primary-foreground/15 shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-primary-foreground/[0.06] p-7 sm:p-9 rounded-sm border border-accent/12">
                  <p className="text-overline mb-6 text-accent/50">GroundLock™</p>
                  <ul className="space-y-3.5">
                    {["Controlled horseshoe geometry", "Directional load distribution", "Interlocking mechanical logic"].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[13px] text-primary-foreground/60 leading-[1.7] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-[11px] text-primary-foreground/25 font-serif italic leading-relaxed">
                    Designed to behave as a system, not separate parts.
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Surface comparison visual */}
            <RevealOnScroll direction="up" delay={100}>
              <div className="mt-14 sm:mt-18 max-w-3xl mx-auto">
                <div className="relative">
                  <img
                    src={groundlockComparison}
                    alt="Surface comparison — standard ground versus GroundLock stabilised surface"
                    className="w-full h-auto rounded-sm"
                    loading="lazy"
                  />
                  <div className="flex justify-between mt-4 px-2">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-foreground/25">Standard Surface</p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-foreground/25">GroundLock™ System</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ TRUST MICRO-STRIP — #9 ═══════════════════════ */}
      <section className="relative overflow-hidden border-t border-border/6">
        <div className="py-8 sm:py-10 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] text-center">
            <p className="text-[11px] text-muted-foreground/25 font-mono tracking-[0.15em] leading-relaxed">
              Designed for real equine use — not light-duty assumptions.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ GROUNDLOCK SYSTEM PLAN — #6 ═══════════════════ */}
      <section id="step-kit" className="relative overflow-hidden">
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-10 max-w-3xl mx-auto">

            <RevealOnScroll direction="up">
              <div className="text-center mb-12 sm:mb-14">
                <div className="flex items-center justify-center gap-5 mb-5">
                  <div className="w-8 h-px bg-accent/20" />
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/30 font-mono">Step 1</p>
                  <div className="w-8 h-px bg-accent/20" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground/90 tracking-[0.03em] leading-tight">
                  GroundLock System Plan
                </h2>
                <p className="mt-4 text-[13px] text-muted-foreground/35 max-w-sm mx-auto leading-relaxed">
                  A tailored layout and configuration based on your site.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={80}>
              <ul className="space-y-3 max-w-sm mx-auto mb-10">
                {[
                  "Site-based system recommendation",
                  "Layout guidance and zone mapping",
                  "Panel configuration overview",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3.5 text-[13px] text-foreground/55 leading-[1.7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <Link to="/site-assessment">
                  <Button variant="gold" size="lg">
                    Request System Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* ═══ GROUNDLOCK SYSTEM KIT — #6 ═══════════════════ */}
      <section id="step-delivery" className="relative overflow-hidden">
        <div className="py-24 sm:py-32 relative border-t border-border/6">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-10">

            <RevealOnScroll direction="up">
              <div className="text-center mb-12 sm:mb-14">
                <div className="flex items-center justify-center gap-5 mb-5">
                  <div className="w-8 h-px bg-accent/20" />
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/30 font-mono">Step 2</p>
                  <div className="w-8 h-px bg-accent/20" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground/90 tracking-[0.03em] leading-tight">
                  GroundLock System Kit
                </h2>
                <p className="mt-4 text-[13px] text-muted-foreground/35 max-w-sm mx-auto leading-relaxed">
                  Pre-configured panel sets for specific use cases.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={60}>
              <div className="max-w-2xl mx-auto mb-12">
                <img
                  src={groundlockCutaway}
                  alt="GroundLock panel system kit — stacked horseshoe panels ready for deployment"
                  className="w-full h-auto rounded-sm"
                  loading="lazy"
                />
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                {
                  name: "Yard / High-Traffic Pack",
                  tag: "Most Common",
                  desc: "Stable entries, wash bays, and daily movement corridors.",
                  points: ["Interlocking panel set", "Entry zone layout guide", "Drainage orientation plan"],
                },
                {
                  name: "Arena Pack",
                  tag: "Performance",
                  desc: "Arena entries, warm-up zones, and high-wear transition points.",
                  points: ["Extended panel set", "Perimeter layout spec", "Load distribution guide"],
                },
                {
                  name: "Custom Configuration",
                  tag: "Tailored",
                  desc: "Estate arrivals, float access, or site-specific system design.",
                  points: ["Site-matched quantity", "Full layout specification", "Installation guidance"],
                },
              ].map((kit, idx) => (
                <RevealOnScroll key={kit.name} direction="up" delay={idx * 80}>
                  <div className="bg-card/60 border border-border/10 rounded-sm p-7 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-px bg-accent/20" />
                      <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-accent/30">{kit.tag}</span>
                    </div>
                    <h3 className="font-serif text-lg text-foreground/80 leading-tight mb-3">{kit.name}</h3>
                    <p className="text-[12px] text-muted-foreground/30 leading-relaxed mb-5 flex-grow">{kit.desc}</p>
                    <ul className="space-y-2">
                      {kit.points.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="w-1 h-1 rounded-full bg-accent/20 shrink-0 mt-[6px]" />
                          <span className="text-[11px] text-muted-foreground/28 font-mono tracking-wide">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="up" delay={300}>
              <div className="text-center mt-12">
                <Link to="/site-assessment">
                  <Button variant="outline" className="group border-accent/15 text-accent/60 hover:bg-accent/5 hover:border-accent/25 text-xs tracking-[0.2em] uppercase font-mono h-12 px-8">
                    Request System Kit <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* ═══ MID-PAGE CTA — #7 ════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 bg-primary relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <p className="font-serif text-xl sm:text-2xl text-primary-foreground/50 italic tracking-wide leading-relaxed mb-4">
                Once installed, everything else feels outdated.
              </p>
              <p className="text-[11px] text-primary-foreground/18 font-mono tracking-[0.2em] uppercase mb-10">
                Every project starts with a system plan.
              </p>
              <Link to="/site-assessment">
                <Button variant="gold" size="lg">
                  Request System Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ GROUNDLOCK SYSTEM DELIVERY — #6 ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-10 max-w-3xl mx-auto">

            <RevealOnScroll direction="up">
              <div className="text-center mb-12 sm:mb-14">
                <div className="flex items-center justify-center gap-5 mb-5">
                  <div className="w-8 h-px bg-accent/20" />
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/30 font-mono">Step 3</p>
                  <div className="w-8 h-px bg-accent/20" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground/90 tracking-[0.03em] leading-tight">
                  GroundLock System Delivery
                </h2>
                <p className="mt-4 text-[13px] text-muted-foreground/35 max-w-md mx-auto leading-relaxed">
                  Full system supply with optional professional installation.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={60}>
              <div className="mb-12">
                <img
                  src={groundlockInstall}
                  alt="Professional GroundLock panel installation at an equestrian gateway"
                  className="w-full h-auto rounded-sm"
                  loading="lazy"
                />
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={80}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto mb-10">
                <div className="bg-card/60 border border-border/10 rounded-sm p-7">
                  <p className="text-overline mb-5 text-accent/35">Included</p>
                  <ul className="space-y-3">
                    {[
                      "Complete panel set to your spec",
                      "Final layout and zone mapping",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[13px] text-foreground/55 leading-[1.7]">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/25 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card/40 border border-accent/8 rounded-sm p-7">
                  <p className="text-overline mb-5 text-accent/25">Optional</p>
                  <ul className="space-y-3">
                    {[
                      "On-site installation by our team",
                      "Remote technical supervision",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[13px] text-foreground/55 leading-[1.7]">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/15 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={160}>
              <div className="text-center">
                <Link to="/contact">
                  <Button variant="outline" className="group border-accent/15 text-accent/60 hover:bg-accent/5 hover:border-accent/25 text-xs tracking-[0.2em] uppercase font-mono h-12 px-8">
                    Discuss System Delivery <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA + FORM — #10 ═══════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, transparent 15%, hsl(var(--background) / 0.5) 100%)" }}
          />

          <div className="section-container relative z-10 max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-10" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-2 text-center">
                Request GroundLock System Plan
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-[13px] text-muted-foreground/38 leading-[1.8] mb-10 text-center">
                Tell us your space. We'll map the system.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={220}>
              <GroundLockProjectForm />
            </RevealOnScroll>

            <div className="text-center mt-14">
              <Link
                to="/groundlock/how-it-works"
                className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors"
              >
                Request System Specs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
