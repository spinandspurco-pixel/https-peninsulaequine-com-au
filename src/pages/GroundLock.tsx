import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockProductEducation } from "@/components/groundlock/GroundLockProductEducation";
import { PanelSpecimen, PanelArray, PanelSiteLayout } from "@/components/groundlock/GroundLockSystemSVG";
import { GroundLockPanelSVG, PanelDefs } from "@/components/groundlock/GroundLockPanelSVG";
import { ArrowRight, Shield, Droplets, Grid3X3, Wrench, Sparkles } from "lucide-react";

/* ── Data ─────────────────────────────────────────── */
const SPECS = [
  { icon: Shield, label: "Load Stability", detail: "Designed for equine + vehicle traffic" },
  { icon: Droplets, label: "Drainage", detail: "Open-base system for water management" },
  { icon: Grid3X3, label: "Installation", detail: "Modular, repeatable placement" },
  { icon: Wrench, label: "Maintenance", detail: "Reduced surface degradation over time" },
  { icon: Sparkles, label: "Finish", detail: "Clean, stable, premium appearance" },
];

const APPLICATIONS = [
  {
    title: "High-Traffic Entry Points",
    description: "Where horses move between stables, wash bays, and paddocks under daily load.",
  },
  {
    title: "Controlled Movement Paths",
    description: "Laneways and corridors requiring consistent, draining footing year-round.",
  },
  {
    title: "Vehicle Load Zones",
    description: "Float, trailer, and service vehicle routes engineered against surface degradation.",
  },
  {
    title: "Wet Zone Surrounds",
    description: "Wash bays and water points where pooling and mud compromise safety.",
  },
  {
    title: "Gateway Transitions",
    description: "High-wear entry and exit zones where ground failure is most visible and disruptive.",
  },
];

const USE_CASES = [
  {
    label: "Under Gravel Surface",
    description: "Panel system beneath compacted aggregate — invisible, structural.",
  },
  {
    label: "Arena Entry Traffic",
    description: "Repeated equine and handler movement across a controlled threshold.",
  },
  {
    label: "Wet Zone Application",
    description: "Drainage-active zone around wash bays and water infrastructure.",
  },
];

const COMPARE = {
  standard: [
    "Generic grid geometry",
    "Inconsistent load behaviour",
    "Visually industrial",
    "No directional logic",
  ],
  groundlock: [
    "Controlled horseshoe geometry",
    "Directional load distribution",
    "Clean, premium finish",
    "Interlocking mechanical logic",
  ],
  outcome: [
    "Less ongoing maintenance",
    "Superior drainage performance",
    "Premium surface appearance",
    "Longer system lifespan",
  ],
};

const ELIMINATES = [
  "Rutting at entry points",
  "Mud build-up in traffic zones",
  "Constant surface rework",
  "Inconsistent ground performance",
];

/* ── Page ─────────────────────────────────────────── */
export default function GroundLock() {
  return (
    <Layout>
      {/* ═══ SECTION 1 — HERO ═════════════════════════════ */}
      <section className="relative pt-40 sm:pt-48 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="max-w-md">
              <div
                className="flex items-center gap-4 mb-10 opacity-0 animate-fade-in"
                style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                <div className="w-8 h-px bg-accent/30" />
                <p className="text-overline text-accent/50">P.E. GroundLock™</p>
              </div>

              <h1
                className="heading-display text-foreground mb-6 opacity-0 animate-fade-in"
                style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "1200ms" }}
              >
                GroundLock™
              </h1>

              <p
                className="text-sm sm:text-[15px] text-muted-foreground/50 leading-[1.9] mb-3 opacity-0 animate-fade-in"
                style={{ animationDelay: "800ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                Engineered Ground Systems for Equine Infrastructure
              </p>

              <p
                className="text-[13px] text-muted-foreground/35 leading-[1.8] mb-12 opacity-0 animate-fade-in"
                style={{ animationDelay: "1000ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                Built to stabilise movement, manage load, and last.
              </p>

              <div
                className="flex flex-wrap gap-4 opacity-0 animate-fade-in"
                style={{ animationDelay: "1200ms", animationFillMode: "both", animationDuration: "1000ms" }}
              >
                <Button asChild variant="gold" size="lg">
                  <a href="#system">View System <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
                <Button asChild variant="outline-light" size="lg">
                  <Link to="/contact">Request Specs</Link>
                </Button>
              </div>
            </div>

            <div
              className="flex justify-center lg:justify-end opacity-0 animate-fade-in"
              style={{ animationDelay: "700ms", animationFillMode: "both", animationDuration: "1400ms" }}
            >
              <svg
                viewBox="0 0 120 140"
                className="w-full max-w-[320px] h-auto"
                aria-label="GroundLock horseshoe panel — hero product"
                style={{ transform: "perspective(800px) rotateY(-6deg) rotateX(4deg)" }}
              >
                <PanelDefs id="hero" />
                <GroundLockPanelSVG x={10} y={10} scale={1.15} active showTabs defsId="hero" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SPEC SNAPSHOT STRIP ══════════════════════════ */}
      <section className="relative overflow-hidden border-t border-b border-border/10">
        <div className="py-10 sm:py-12 bg-card/50 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
              {SPECS.map((spec, i) => (
                <RevealOnScroll key={spec.label} direction="up" delay={i * 100}>
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-2">
                      <spec.icon className="w-3.5 h-3.5 text-accent/40" strokeWidth={1.5} />
                      <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-foreground/50">
                        {spec.label}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground/30 leading-[1.7]">
                      {spec.detail}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — THE SYSTEM ══════════════════════ */}
      <section id="system" className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-16 sm:mb-24">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">System Architecture</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  The Panel → The System → The Result
                </h2>
              </RevealOnScroll>
            </div>

            <RevealOnScroll direction="up" delay={200}>
              <div className="space-y-16">
                <PanelSpecimen />
                <div className="w-12 h-px bg-accent/10 mx-auto" />
                <PanelArray />
                <div className="w-12 h-px bg-accent/10 mx-auto" />
                <PanelSiteLayout />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM IN USE — MICRO VISUALS ════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-14 sm:py-18 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <p className="text-overline text-center mb-10">System in Context</p>
            </RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/10">
              {USE_CASES.map((uc, i) => (
                <RevealOnScroll key={uc.label} direction="up" delay={i * 80}>
                  <div className="bg-card p-6 sm:p-8 text-center">
                    <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-accent/45 mb-2">
                      {uc.label}
                    </p>
                    <p className="text-[12px] text-muted-foreground/30 leading-[1.8]">
                      {uc.description}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST LINE 1 ════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-10 sm:py-14 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p className="font-serif text-[13px] sm:text-sm text-muted-foreground/30 italic leading-[2]">
                Designed for long-term ownership — not short-term fixes.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — INTERACTIVE EDUCATION ════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-16 sm:mb-24">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">How It Works</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground mb-4">
                  Engineered, Not Decorative
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={160}>
                <p className="font-serif text-[13px] sm:text-sm text-muted-foreground/30 italic max-w-md mx-auto leading-relaxed">
                  Hover or tap each feature to understand why the horseshoe form matters.
                </p>
              </RevealOnScroll>
            </div>

            <RevealOnScroll direction="up" delay={200}>
              <GroundLockProductEducation />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ TRUST LINE 2 ════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-10 sm:py-14 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p className="font-serif text-[13px] sm:text-sm text-muted-foreground/30 italic leading-[2]">
                Built to handle real equine movement, not light-use assumptions.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — APPLICATIONS ═════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-14 sm:mb-20">
              <RevealOnScroll direction="up">
                <p className="text-overline mb-6">Applications</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <h2 className="heading-section text-foreground">
                  Where GroundLock Works
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/10">
              {APPLICATIONS.map((app, i) => (
                <RevealOnScroll key={app.title} direction="up" delay={i * 60}>
                  <div className="bg-background p-8 sm:p-10 h-full">
                    <p className="font-serif text-[15px] text-foreground/80 mb-2">{app.title}</p>
                    <p className="text-[12px] text-muted-foreground/30 leading-[1.8]">{app.description}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — DIFFERENCE ══════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-14 sm:mb-20">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <h2 className="heading-section text-foreground">
                  Not Another Ground Grid
                </h2>
              </RevealOnScroll>
            </div>

            <RevealOnScroll direction="up" delay={150}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/10">
                <div className="bg-card p-8 sm:p-10 lg:p-12">
                  <p className="text-overline mb-8 text-muted-foreground/30">Standard Systems</p>
                  <ul className="space-y-4">
                    {COMPARE.standard.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[13px] text-muted-foreground/35 leading-[1.8]">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/20 shrink-0 mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card p-8 sm:p-10 lg:p-12 border-l border-r border-accent/10">
                  <p className="text-overline mb-8 text-accent/50">GroundLock™</p>
                  <ul className="space-y-4">
                    {COMPARE.groundlock.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[13px] text-foreground/60 leading-[1.8]">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0 mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card p-8 sm:p-10 lg:p-12">
                  <p className="text-overline mb-8 text-muted-foreground/30">The Outcome</p>
                  <ul className="space-y-4">
                    {COMPARE.outcome.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[13px] text-muted-foreground/45 leading-[1.8]">
                        <span className="w-1 h-1 rounded-full bg-accent/25 shrink-0 mt-2" />
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

      {/* ═══ WHAT IT ELIMINATES ═══════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-20 bg-card/50 relative border-t border-border/10">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p className="text-overline mb-8">What This Eliminates</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <ul className="space-y-3 text-left max-w-xs mx-auto">
                {ELIMINATES.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[13px] text-muted-foreground/40 leading-[1.8]">
                    <span className="w-4 h-px bg-accent/25 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — INTEGRATION ══════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-12 sm:py-16 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p className="font-serif text-[13px] sm:text-sm text-muted-foreground/30 italic leading-[2]">
                Specified as part of complete site planning — not added later.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7 — CTA ══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, transparent 15%, hsl(var(--background) / 0.5) 100%)" }}
          />

          <div className="section-container relative z-10 text-center max-w-md mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-4">
                Specify GroundLock for Your Build
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/40 leading-[1.9] mb-10">
                Every site is different. We assess ground conditions, usage, and load requirements before recommending a system.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Button asChild variant="gold" size="lg">
                  <Link to="/contact">
                    Specify GroundLock <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline-light" size="lg">
                  <Link to="/contact">
                    Request System Details
                  </Link>
                </Button>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={350}>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/20">
                Used within Peninsula Equine builds and available for standalone specification
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
