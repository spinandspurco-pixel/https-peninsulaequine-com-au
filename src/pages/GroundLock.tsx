import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { GroundLockCrossSection } from "@/components/groundlock/GroundLockCrossSection";
import groundlockCutaway from "@/assets/groundlock-horseshoe-canonical.jpg";
import groundlockComparison from "@/assets/groundlock-horseshoe-canonical.jpg";
import groundlockInstall from "@/assets/groundlock-horseshoe-canonical.jpg";
import impactFailure from "@/assets/groundlock-impact-failure.jpg";
import impactSuccess from "@/assets/groundlock-impact-success.jpg";
import arenaWide from "@/assets/groundlock-arena-wide.jpg";
import closeupInterlock from "@/assets/groundlock-closeup-interlock.jpg";
import horseMotion from "@/assets/groundlock-horse-motion.jpg";
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
      {/* ═══ PRE-HERO MICRO LINE ═════════════════════════ */}
      <section className="bg-primary py-16 sm:py-20">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-primary-foreground/12 text-center">
          Ground conditions decide everything.
        </p>
      </section>

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

        </div>
      </section>



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

      {/* ═══ CLOSING STATEMENT ═══════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="relative z-[1] text-center max-w-xl mx-auto px-6">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl text-primary-foreground/50 italic tracking-wide leading-[1.3] mb-4">
            Once installed, everything else feels outdated.
          </p>
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-primary-foreground/15 mb-14">
            Not optional. Foundational.
          </p>
          <Link to="/site-assessment">
            <Button variant="gold" size="lg">
              Apply to Build <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-8">
            <Link
              to="/groundlock/how-it-works"
              className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-foreground/15 hover:text-primary-foreground/30 transition-colors"
            >
              Request System Specs
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
