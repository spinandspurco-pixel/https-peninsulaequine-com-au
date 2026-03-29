import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import glFailure from "@/assets/gl-failure-raw.jpg";
import glEngineerClose from "@/assets/gl-1-engineer-close.jpg";
import glSitePerspective from "@/assets/gl-2-site-perspective.jpg";
import glWideScale from "@/assets/gl-3-wide-scale.jpg";
import glCutaway from "@/assets/gl-4-cutaway.jpg";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Page ─────────────────────────────────────────── */
export default function GroundLock() {
  const [gateOpen, setGateOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
    <Dialog open={gateOpen} onOpenChange={setGateOpen}>
      <DialogContent className="bg-primary border-accent/10 max-w-md text-center p-10 sm:p-14">
        <div className="space-y-6">
          <p className="font-serif text-base sm:text-lg text-primary-foreground/60 italic leading-relaxed">
            GroundLock projects are assessed based on site conditions, scale, and intended use.
          </p>
          <p className="text-[11px] text-primary-foreground/25 leading-relaxed">
            This ensures every installation performs as intended.
          </p>
          <Button
            variant="gold"
            size="lg"
            className="mt-4"
            onClick={() => {
              setGateOpen(false);
              navigate("/site-assessment");
            }}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Layout>
      {/* ═══ PRE-HERO MICRO LINE ═════════════════════════ */}
      <section className="bg-primary py-16 sm:py-20">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-primary-foreground/12 text-center">
          Ground conditions decide everything.
        </p>
      </section>

      {/* ═══ HERO ═════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
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

          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground/90 tracking-tight leading-[1.05] mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            This is what ground<br />should have always been.
          </h1>

          <p
            className="text-[13px] text-primary-foreground/30 leading-[1.8] mb-3 opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Every temporary system is a compromise. This removes it.
          </p>

          <p
            className="text-[12px] font-mono uppercase tracking-[0.2em] text-accent/25 mb-14 opacity-0 animate-fade-in"
            style={{ animationDelay: "800ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            Built for load. Built for drainage. Built to last.
          </p>
        </div>
      </section>

      {/* ═══ IMPACT — Before / After ═══════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative w-full" style={{ minHeight: "clamp(320px, 50vw, 560px)" }}>
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="relative overflow-hidden">
              <img
                src={glFailure}
                alt="Failed ground surface"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/40" />
            </div>
            <div className="relative overflow-hidden">
              <img
                 src={glWideScale}
                alt="GroundLock stabilised arena surface at scale"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/20" />
            </div>
          </div>

          <div className="absolute inset-0 flex items-end z-10">
            <div className="grid grid-cols-2 w-full">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 text-center pb-6">Before</p>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 text-center pb-6">After</p>
            </div>
          </div>

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
        <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-foreground/10 text-center py-6">
          Each unit depends on the next.
        </p>
      </section>

      {/* ═══ THE COST OF FAILURE / THE NEW STANDARD ════════ */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 bg-primary relative border-t border-primary-foreground/[0.04]">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-start">
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

            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-primary-foreground/10 text-center my-16">
              This is what replaces it.
            </p>

            <div>
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

      {/* ═══ COMPARISON — Performance ══════════════════════ */}
      <section className="relative overflow-hidden">
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
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ BUILT IN REAL CONDITIONS — Proof ══════════════ */}
      <section className="py-24 sm:py-32 bg-primary relative overflow-hidden">
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          <div className="text-center mb-14">
            <p className="text-overline text-accent/40">Built in Real Conditions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-14">
            <div className="sm:col-span-2">
              <img
                src={glSitePerspective}
                alt="Horse in motion on GroundLock stabilised surface — system under force"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1280}
                height={720}
              />
            </div>
            <div className="flex flex-col gap-2 sm:gap-3">
              <img
                 src={glEngineerClose}
                alt="Close-up of interlocking panels — opposing direction connection"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1024}
                height={768}
              />
              <img
                 src={glCutaway}
                alt="Cross-section showing sub-base, stabilisation grid, and surface layers"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1024}
                height={720}
              />
            </div>
          </div>

          <div className="text-center max-w-md mx-auto">
            <p className="text-[13px] text-primary-foreground/35 leading-[1.8]">
              No overlays. No theory.
            </p>
            <p className="text-[13px] text-primary-foreground/50 leading-[1.8] font-medium">
              This is the system in use.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ EVENT SYSTEMS ═══════════════════════════════ */}
      <section className="py-24 sm:py-32 relative overflow-hidden border-t border-border/6">
        <div className="absolute inset-0 grain-texture opacity-[0.015]" />
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-accent/30 mb-6">
              Event Systems
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground/85 tracking-[0.02em] leading-[1.15]">
              Built for temporary scale.<br className="hidden sm:block" /> Designed for permanent protection.
            </h2>
          </div>

          {/* Visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-14">
            <div className="sm:col-span-2">
              <img
                src={glWideScale}
                alt="Large-scale event ground stabilisation system — aerial view"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1280}
                height={720}
              />
            </div>
            <div>
              <img
                src={glEngineerClose}
                alt="Ground protection system under temporary event infrastructure"
                className="w-full h-full object-cover"
                loading="lazy"
                width={768}
                height={768}
              />
            </div>
          </div>

          {/* Copy */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-[13px] text-foreground/40 leading-[1.9] mb-1">
              Rapid deployment systems engineered for high-traffic equine and event environments.
            </p>
            <p className="text-[13px] text-foreground/40 leading-[1.9]">
              Protects turf, stabilises ground, and removes post-event remediation.
            </p>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/15 mt-6">
              Reduces ground remediation, protects venue assets, and enables repeatable event infrastructure.
            </p>
          </div>

          {/* Micro points */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 mb-14">
            {["Fast install / removal", "Protects underlying ground", "Built for repeat use"].map((point) => (
              <div key={point} className="flex items-center gap-2.5">
                <span className="w-1 h-1 rounded-full bg-accent/30" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/30">{point}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/contact"
              className="text-[11px] font-mono uppercase tracking-[0.25em] text-accent/35 hover:text-accent/60 transition-colors inline-flex items-center gap-2"
            >
              Enquire about event deployment <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SCALE — Materials & Delivery ══════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 relative border-t border-border/6">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-10 max-w-3xl mx-auto">
            <RevealOnScroll direction="up">
              <div className="text-center mb-12 sm:mb-14">
                <div className="w-8 h-px bg-accent/20 mx-auto mb-10" />
                <p className="text-overline mb-5">Scale</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground/90 tracking-[0.03em] leading-tight">
                  From Single Arena to Full Facility
                </h2>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={80}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
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
          <Button variant="gold" size="lg" onClick={() => setGateOpen(true)}>
            Apply to Build <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
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
    </>
  );
}
