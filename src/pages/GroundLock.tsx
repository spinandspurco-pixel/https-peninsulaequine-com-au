import { Link } from "react-router-dom";
import groundlockHero from "@/assets/groundlock-hero-arena.jpg";
import groundlockCutaway from "@/assets/groundlock-cutaway.jpg";
import groundlockKit from "@/assets/groundlock-kit-product.jpg";
import groundlockComparison from "@/assets/groundlock-surface-comparison.jpg";
import groundlockInstall from "@/assets/groundlock-installation.jpg";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockProductEducation } from "@/components/groundlock/GroundLockProductEducation";
import { PanelSpecimen, SystemDiagram, LockSequence } from "@/components/groundlock/GroundLockSystemSVG";
import { GroundLockPanelSVG, PanelDefs } from "@/components/groundlock/GroundLockPanelSVG";
import { GroundLockProjectForm } from "@/components/groundlock/GroundLockProjectForm";
import { ArrowRight } from "lucide-react";

/* ── Page ─────────────────────────────────────────── */
export default function GroundLock() {
  return (
    <Layout>
      {/* ═══ SECTION 1 — HERO ═════════════════════════════ */}
      <section className="relative pt-36 sm:pt-44 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={groundlockHero} alt="" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>
        <div className="absolute inset-0 grain-texture" />
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-md">
              <div
                className="flex items-center gap-4 mb-8 opacity-0 animate-fade-in"
                style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                <div className="w-8 h-px bg-accent/30" />
                <p className="text-overline text-accent/50">P.E. GroundLock™</p>
              </div>

              <h1
                className="heading-display text-foreground mb-4 opacity-0 animate-fade-in"
                style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "1200ms", lineHeight: "0.95" }}
              >
                GroundLock™
              </h1>

              {/* Positioning hook — #1 */}
              <p
                className="font-serif text-lg sm:text-xl text-foreground/70 leading-[1.5] mb-3 opacity-0 animate-fade-in"
                style={{ animationDelay: "700ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                Most systems sit in place. This one locks together.
              </p>

              {/* Authority line — #2 */}
              <p
                className="text-[13px] text-muted-foreground/40 leading-[1.7] mb-10 opacity-0 animate-fade-in"
                style={{ animationDelay: "900ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                Designed to perform under load — not just on install.
              </p>

              {/* Early CTA — #3 */}
              <div
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: "1100ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                <Link to="/site-assessment">
                  <Button variant="gold" size="lg" className="w-full sm:w-auto">
                    Request GroundLock System Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-[11px] text-muted-foreground/30 mt-3 font-mono tracking-wide">
                  Tell us your space. We'll map the system.
                </p>
              </div>
            </div>

            <div
              className="hidden lg:flex justify-end opacity-0 animate-fade-in"
              style={{ animationDelay: "700ms", animationFillMode: "both", animationDuration: "1400ms" }}
            >
              <svg
                viewBox="0 0 120 140"
                className="w-full max-w-[360px] h-auto drop-shadow-2xl"
                aria-label="GroundLock horseshoe panel — hero product"
                style={{ transform: "perspective(800px) rotateY(-6deg) rotateX(4deg)", filter: "drop-shadow(0 20px 40px hsl(var(--accent) / 0.12))" }}
              >
                <PanelDefs id="hero" />
                <GroundLockPanelSVG x={8} y={6} scale={1.22} active showTabs showJoins defsId="hero" direction="up" />
                <path
                  d="M 32 28 A 34 36 0 0 1 88 28"
                  fill="none"
                  stroke="hsl(var(--accent) / 0.15)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
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
          </div>
        </div>
      </section>

      {/* ═══ CUTAWAY VISUAL (immediately after system) ═════ */}
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-24 relative">
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

      {/* ═══ WHY IT MATTERS — #5 ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-24 bg-card/50 relative border-t border-border/8">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-md mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p className="text-overline mb-8">Why It Matters</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <ul className="space-y-4 text-left">
                {[
                  "More consistent performance under load",
                  "Reduced long-term movement",
                  "More stable surface behaviour",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-[13px] text-foreground/55 leading-[1.7]">
                    <span className="w-4 h-px bg-accent/25 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON — Standard vs GroundLock — #8 ══════ */}
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
      <section className="relative overflow-hidden">
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
      <section className="relative overflow-hidden">
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
                  src={groundlockKit}
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
              <p className="font-serif text-xl sm:text-2xl text-primary-foreground/50 italic tracking-wide leading-relaxed mb-8">
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
          </div>
        </div>
      </section>
    </Layout>
  );
}
