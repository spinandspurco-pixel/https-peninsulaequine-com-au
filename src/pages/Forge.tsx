import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { ArrowRight, Flame } from "lucide-react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { cn } from "@/lib/utils";
import { GroundLockHero } from "@/components/groundlock/GroundLockHero";

import glIconHero from "@/assets/gl-icon-hero.jpg";
import glAbstractPattern from "@/assets/gl-abstract-pattern.jpg";
import glApplicationHint from "@/assets/gl-application-hint.jpg";

/* ── Product Families ─────────────────────────────── */

interface FamilyEntry {
  title: string;
  trademark?: boolean;
  status: "active" | "development" | "future";
  summary: string;
  scope: string[];
  href?: string;
  cta?: string;
}

const FAMILIES: FamilyEntry[] = [
  {
    title: "GroundLock",
    trademark: true,
    status: "active",
    summary:
      "Sub-surface entry systems for gates, driveways, and high-traffic zones.",
    scope: [
      "Starter, Pro & Complete configurations",
      "Drainage-integrated base layers",
      "Float-grade load engineering",
    ],
    href: "/groundlock",
    cta: "Explore GroundLock",
  },
  {
    title: "Forge Hardware",
    status: "development",
    summary:
      "Architectural steelwork for equine properties — precision-fabricated, site-specific, built to last decades.",
    scope: [
      "Swing & sliding gate systems",
      "Structural steel fabrications",
      "Tie-up rails, wash-bay fittings & stable hardware",
    ],
  },
  {
    title: "Custom Property Elements",
    status: "future",
    summary:
      "Bespoke estate details that complete the built environment with architectural precision.",
    scope: [
      "Laser-cut property signage",
      "Threshold hardware & ornamental brackets",
      "Entry and boundary finishing elements",
    ],
  },
];

const STATUS_MAP: Record<FamilyEntry["status"], { label: string; style: string }> = {
  active: { label: "Available Now", style: "text-accent/70" },
  development: { label: "In Development", style: "text-foreground/35" },
  future: { label: "Future Division", style: "text-foreground/20" },
};

/* ── Image strip data ─────────────────────────────── */

const MATERIAL_IMAGES = [
  { src: steelBarnFrame, alt: "Structural steel barn frame" },
  { src: reclaimedBeam, alt: "Workshop beam preparation" },
  { src: roofingDetail, alt: "Steel roofing detail" },
];

/* ── Family card ──────────────────────────────────── */

function FamilyCard({ family, delay = 0 }: { family: FamilyEntry; delay?: number }) {
  const { label, style } = STATUS_MAP[family.status];
  const isActive = family.status === "active";

  return (
    <RevealOnScroll delay={delay}>
      <div
        className={cn(
          "group relative p-8 sm:p-10 transition-colors duration-500",
          isActive
            ? "border border-accent/20 bg-accent/[0.02]"
            : "border border-border/10 bg-card/40",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-5">
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-500 leading-snug">
            {family.title}
            {family.trademark && <span className="text-accent/40">™</span>}
          </h3>
          <span className={cn("text-[10px] tracking-[0.2em] uppercase font-medium whitespace-nowrap mt-2", style)}>
            {label}
          </span>
        </div>

        {/* Summary */}
        <p className="text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2] max-w-lg mb-6">
          {family.summary}
        </p>

        {/* Scope list */}
        <ul className="space-y-2 mb-8">
          {family.scope.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="w-1 h-1 rounded-full bg-accent/30 mt-[7px] flex-shrink-0" />
              <span className="text-[11px] sm:text-[12px] text-foreground/25 leading-[1.8]">
                {item}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {family.href ? (
          <Link
            to={family.href}
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-accent/50 hover:text-accent/80 transition-colors duration-500"
          >
            {family.cta} <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-[11px] tracking-[0.15em] uppercase text-foreground/15">
            Details to follow
          </span>
        )}
      </div>
    </RevealOnScroll>
  );
}

/* ── Page ──────────────────────────────────────────── */

export default function Forge() {
  return (
    <Layout>
      <StickySubpageCTA ctaLabel="Enquire About GroundLock" ctaHref="/contact" showAfter={600} hideSecondary />
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-44 sm:pt-56 pb-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 pointer-events-none grain-texture" />

        <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/30" />
            <Flame className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/60">Systems Division</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            GroundLock Systems
          </h1>

          <p
            className="mt-3 text-[11px] tracking-[0.2em] uppercase text-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "550ms", animationFillMode: "both" }}
          >
            by Peninsula Equine
          </p>

          <p
            className="mt-10 text-sm sm:text-[15px] text-muted-foreground/40 max-w-[420px] mx-auto leading-[1.9] opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            The systems and product division of Peninsula Equine.
            Purpose-built ground stabilisation systems, hardware, and estate elements —
            designed for equine properties, fabricated by the people who build them.
          </p>
        </div>
      </section>

      {/* ── Material strip ────────────────────────────── */}
      <section className="relative overflow-hidden" aria-label="Material details">
        <RevealOnScroll duration={700}>
          <div className="grid grid-cols-3">
            {MATERIAL_IMAGES.map((img, i) => (
              <div key={i} className="relative aspect-[2/1] sm:aspect-[16/9] overflow-hidden group">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover img-portfolio transition-all duration-[900ms]"
                />
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* ── Positioning ───────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-xl mx-auto relative z-[1] text-center">
            <RevealOnScroll>
              <RevealLine className="mx-auto mb-14" width="w-8" />
              <p className="text-[13px] sm:text-[14px] text-muted-foreground/30 leading-[2.2]">
                GroundLock Systems gives Peninsula Equine clients access to the same
                engineered components we use in our own builds — heavy gauge,
                hot-dip galvanised, and specified to the tolerances of working
                rural properties.
              </p>
              <p className="mt-8 text-[12px] text-muted-foreground/20 leading-[2] italic font-serif">
                Not a catalogue. A systems division.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Product Families ──────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll>
              <p className="text-overline text-accent/50 mb-6 text-center">Product Families</p>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground/25 leading-[2] max-w-lg mx-auto text-center mb-16">
                Three core divisions — each one engineered to integrate with
                Peninsula Equine's design-build methodology and proprietary
                Signature Systems.
              </p>
            </RevealOnScroll>

            <div className="space-y-4 sm:space-y-6">
              {FAMILIES.map((family, i) => (
                <FamilyCard key={family.title} family={family} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Expansion horizon ─────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-xl mx-auto relative z-[1] text-center">
            <RevealOnScroll>
              <p className="text-overline text-foreground/20 mb-10">Future Scope</p>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground/25 leading-[2.2] mb-10">
                As Peninsula Equine's project library grows, GroundLock Systems will expand
                to include entry kits, gate automation packages, signage systems,
                stable forecourt products, and threshold hardware — each one
                validated through real-world builds before release.
              </p>
              <Link
                to="/systems"
                className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-accent/40 hover:text-accent/70 transition-colors duration-500"
              >
                View Signature Systems <ArrowRight className="w-3 h-3" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Dual CTA ──────────────────────────────────── */}
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
            <RevealOnScroll>
              <RevealLine className="mx-auto mb-16" width="w-8" />
              <h2 className="heading-section text-foreground mb-8">
                Work With Us
              </h2>
              <p className="text-sm text-muted-foreground/35 mb-12 leading-[1.9]">
                Whether you're configuring a GroundLock system, specifying
                custom hardware, or planning a bespoke element for your
                property — we'll scope it, quote it, and build it.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="gold" size="lg">
                  <Link to="/groundlock">
                    Explore GroundLock <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline-light" size="lg">
                  <Link to="/contact">
                    Enquire About Systems
                  </Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
