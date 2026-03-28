import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockProductEducation } from "@/components/groundlock/GroundLockProductEducation";
import { VisualMechanics } from "@/components/groundlock/VisualMechanics";
import { PanelSpecimen, SystemDiagram, LockSequence } from "@/components/groundlock/GroundLockSystemSVG";
import groundlockCutaway from "@/assets/groundlock-horseshoe-canonical.jpg";
import { ArrowRight } from "lucide-react";

export default function GroundLockHowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-36 sm:pt-44 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="section-container relative z-10 max-w-3xl mx-auto text-center">
          <div
            className="flex items-center justify-center gap-4 mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <div className="w-8 h-px bg-accent/30" />
            <p className="text-overline text-accent/50">Technical Deep-Dive</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground mb-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            How It Works
          </h1>

          <p
            className="text-[13px] text-muted-foreground/40 leading-[1.7] max-w-md mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Stronger by geometry, not by mass. Explore the engineering behind the GroundLock™ system.
          </p>
        </div>
      </section>

      {/* At a Glance — Full System Diagram */}
      <section className="py-24 sm:py-36 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-4xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <div className="w-8 h-px bg-accent/25 mx-auto mb-10" />
              <p className="text-overline text-accent/40">At a Glance</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <svg viewBox="0 0 720 340" className="w-full h-auto" aria-label="GroundLock repeating interlocked surface pattern with load distribution">
              <defs>
                <linearGradient id="aag-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="aag-down" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Row labels */}
              <text x="12" y="78" fontSize="7" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.25" transform="rotate(-90,12,78)">ROW A</text>
              <text x="12" y="198" fontSize="7" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.25" transform="rotate(-90,12,198)">ROW B</text>

              {/* === ROW 1 — Upright panels === */}
              {[0, 1, 2, 3, 4, 5].map(i => {
                const x = 40 + i * 110;
                return (
                  <g key={`r1-${i}`} transform={`translate(${x}, 20)`}>
                    <path d="M0,0 L80,0 L80,120 L62,120 L62,18 L18,18 L18,120 L0,120 Z" fill="url(#aag-up)" stroke="hsl(var(--primary-foreground))" strokeWidth="0.6" strokeOpacity="0.1" />
                    <rect x="24" y="0" width="32" height="3" rx="1" fill="hsl(var(--accent))" opacity="0.18" />
                    {/* Tabs */}
                    <rect x="5" y="42" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                    <rect x="71" y="42" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                    <rect x="5" y="80" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                    <rect x="71" y="80" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                  </g>
                );
              })}

              {/* === ROW 2 — Inverted panels (offset) === */}
              {[0, 1, 2, 3, 4, 5].map(i => {
                const x = 95 + i * 110;
                return (
                  <g key={`r2-${i}`} transform={`translate(${x}, 145)`}>
                    <path d="M0,120 L80,120 L80,0 L62,0 L62,102 L18,102 L18,0 L0,0 Z" fill="url(#aag-down)" stroke="hsl(var(--primary-foreground))" strokeWidth="0.6" strokeOpacity="0.1" />
                    <rect x="24" y="117" width="32" height="3" rx="1" fill="hsl(var(--accent))" opacity="0.18" />
                    {/* Tabs */}
                    <rect x="5" y="30" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                    <rect x="71" y="30" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                    <rect x="5" y="68" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                    <rect x="71" y="68" width="4" height="10" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.06" />
                  </g>
                );
              })}

              {/* === Load distribution arrows === */}
              {[150, 310, 470].map(x => (
                <g key={`arrow-${x}`}>
                  <line x1={x} y1="8" x2={x} y2="300" stroke="hsl(var(--accent))" strokeWidth="0.7" strokeOpacity="0.12" strokeDasharray="5 4" />
                  <polygon points={`${x - 3},300 ${x + 3},300 ${x},308`} fill="hsl(var(--accent))" opacity="0.18" />
                  {/* Spread lines at base */}
                  <line x1={x} y1="308" x2={x - 30} y2="330" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1={x} y1="308" x2={x + 30} y2="330" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="3 3" />
                </g>
              ))}

              {/* Load label */}
              <text x="360" y="338" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="hsl(var(--accent))" opacity="0.2">LOAD DISTRIBUTION</text>

              {/* Direction indicators */}
              <g opacity="0.2">
                <text x="80" y="158" fontSize="6" fontFamily="monospace" fill="hsl(var(--accent))">↑</text>
                <text x="190" y="278" fontSize="6" fontFamily="monospace" fill="hsl(var(--accent))">↓</text>
                <text x="300" y="158" fontSize="6" fontFamily="monospace" fill="hsl(var(--accent))">↑</text>
                <text x="410" y="278" fontSize="6" fontFamily="monospace" fill="hsl(var(--accent))">↓</text>
                <text x="520" y="158" fontSize="6" fontFamily="monospace" fill="hsl(var(--accent))">↑</text>
              </g>
            </svg>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <p className="text-[12px] sm:text-[13px] text-primary-foreground/30 text-center leading-[1.8] mt-14 max-w-lg mx-auto">
              A repeatable interlocking system built to stabilise the entire ground plane.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Visual Mechanics Sequence */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-36 bg-primary relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="section-container max-w-xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="text-center mb-20">
                <div className="w-8 h-px bg-accent/25 mx-auto mb-10" />
                <p className="text-overline text-accent/40">Visual Mechanics</p>
              </div>
            </RevealOnScroll>
            <div className="[&_svg_text]:fill-primary-foreground [&_p]:text-primary-foreground/40 [&_span]:text-accent/30">
              <VisualMechanics />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Education Module */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <GroundLockProductEducation />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* System Architecture Detail */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 relative">
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
          </div>
        </div>
      </section>

      {/* Cutaway */}
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-24 bg-card/50 relative border-t border-border/8">
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

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <p className="font-serif text-xl sm:text-2xl text-foreground/50 italic tracking-wide leading-relaxed mb-8">
                Ready to start your project?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/site-assessment">
                  <Button variant="gold" size="lg">
                    Request System Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/groundlock">
                  <Button variant="outline" className="border-accent/15 text-accent/60 hover:bg-accent/5 hover:border-accent/25 text-xs tracking-[0.2em] uppercase font-mono h-12 px-8">
                    Back to GroundLock
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
