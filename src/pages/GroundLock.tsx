import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockSystemLayout } from "@/components/GroundLockSystemLayout";
import { GroundLockCrossSection } from "@/components/GroundLockCrossSection";
import { ArrowRight, Layers } from "lucide-react";

import foundationPour from "@/assets/main-ridge-foundation-pour.jpg";
import rebarDeep from "@/assets/rebar-foundation-deep.jpg";
import sitePrep from "@/assets/main-ridge-site-prep.jpg";

/* ── Data ─────────────────────────────────────────── */
const PROBLEMS = [
  "Unstable ground under load",
  "Poor drainage and pooling",
  "Surface breakdown after weather",
  "Ongoing, recurring maintenance",
];

const STEPS = [
  {
    number: "01",
    title: "Stabilise the Base",
    description: "Subgrade preparation and compacted foundation — engineered to site conditions.",
  },
  {
    number: "02",
    title: "Distribute Load",
    description: "Interlocking GroundLock grid distributes weight and prevents lateral movement.",
  },
  {
    number: "03",
    title: "Maintain Performance",
    description: "Drainage continuity and aggregate infill ensure long-term surface integrity.",
  },
];

const APPLICATIONS = [
  "Performance Arenas",
  "Stable Surrounds & Wash Bays",
  "Access Roads & Laneways",
  "High-Traffic Arrival Zones",
];

const PROOF_IMAGES = [
  { src: foundationPour, alt: "Foundation pour — GroundLock base preparation", label: "Base Preparation" },
  { src: rebarDeep, alt: "Reinforcement grid installation", label: "Grid Installation" },
  { src: sitePrep, alt: "Site preparation and grading", label: "Site Grading" },
];

/* ── Page ─────────────────────────────────────────── */
export default function GroundLock() {
  return (
    <Layout>
      {/* ═══ 1. OPENING ═══════════════════════════════════ */}
      <section className="relative pt-44 sm:pt-52 pb-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(var(--accent) / 0.02) 0%, transparent 65%)" }}
        />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center gap-8">
          <div
            className="flex items-center gap-5 opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            <div className="w-8 h-px bg-accent/30" />
            <Layers className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/60">Engineered Ground System</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            What You Don't See<br />Is What Fails First
          </h1>

          <p
            className="text-muted-foreground/40 text-sm sm:text-[15px] max-w-lg mx-auto opacity-0 animate-fade-in leading-[1.9]"
            style={{ animationDelay: "1200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Most arena and access issues don't start on the surface — they start underneath.
          </p>
        </div>
      </section>

      {/* ═══ CONSEQUENCE ══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground/40 leading-[2]">
                  Ground failure doesn't show up immediately.<br />
                  It shows up later — as movement, drainage issues, and surface breakdown.
                </p>
                <p className="text-sm text-foreground/55 leading-[2]">
                  GroundLock prevents it before it starts.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 2. PROBLEM ═══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-44 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-16" width="w-8" />
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={100}>
              <p className="text-overline mb-6">The Problem</p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={150}>
              <h2 className="heading-section text-foreground mb-12">
                The Ground Fails First.
              </h2>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={200}>
              <ul className="space-y-4 text-left max-w-xs mx-auto">
                {PROBLEMS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 text-sm text-muted-foreground/45 leading-[1.8]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ 3. UNIFIED SYSTEM — Layout → Cross-Section → Toggle ═ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-48 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            {/* Shared section header */}
            <div className="text-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">The System</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground mb-4">
                  Five Layers. One System.
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={160}>
                <p className="font-serif text-[13px] sm:text-sm text-muted-foreground/30 italic max-w-md mx-auto leading-relaxed">
                  GroundLock is a layered system — not a single product.
                </p>
              </RevealOnScroll>
            </div>

            {/* Layout → Cross-Section in continuous flow */}
            <div className="space-y-24 sm:space-y-32">
              <RevealOnScroll direction="up" delay={200}>
                <GroundLockSystemLayout />
              </RevealOnScroll>

              <RevealOnScroll direction="up" delay={100}>
                <GroundLockCrossSection />
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. HOW IT WORKS — 3 STEPS ═══════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">How It Works</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Three Principles. Zero Compromise.
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/10">
              {STEPS.map((step, i) => (
                <RevealOnScroll key={step.number} direction="up" delay={i * 100}>
                  <div className="bg-background p-8 sm:p-10 lg:p-12 h-full">
                    <span className="font-mono text-[10px] text-accent/40 tracking-[0.2em] block mb-6">
                      {step.number}
                    </span>
                    <h3 className="font-serif text-[17px] font-medium text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground/40 leading-[1.9]">
                      {step.description}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. APPLICATIONS ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <div className="text-center mb-16 sm:mb-24">
              <RevealOnScroll direction="up">
                <p className="text-overline mb-6">Applications</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <h2 className="heading-section text-foreground">
                  Built for Real Properties
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/10">
              {APPLICATIONS.map((app, i) => (
                <RevealOnScroll key={app} direction="up" delay={i * 80}>
                  <div className="bg-card p-8 sm:p-10">
                    <p className="font-serif text-[15px] text-foreground/80">{app}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. PROOF ═════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-16 sm:mb-24">
              <RevealOnScroll direction="up">
                <p className="text-overline mb-6">From the Field</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <h2 className="heading-section text-foreground">
                  Not Theoretical. Built.
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PROOF_IMAGES.map((img, i) => (
                <RevealOnScroll key={img.label} direction="up" delay={i * 100}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, hsl(var(--background) / 0.7) 0%, transparent 50%)" }}
                    />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent/50">
                        {img.label}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. CTA ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-44 relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, transparent 15%, hsl(222 20% 3% / 0.5) 100%)" }}
          />

          <div className="section-container relative z-10 text-center max-w-md mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-16" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-4">
                Request GroundLock Assessment
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/35 mb-12 leading-[1.9]">
                We'll review your site and recommend the right system.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <Button asChild variant="gold" size="lg">
                <Link to="/site-assessment">
                  Request Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
