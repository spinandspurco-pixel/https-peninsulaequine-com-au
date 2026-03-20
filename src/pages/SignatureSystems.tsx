import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── System catalogue ─────────────────────────────── */

interface SystemEntry {
  title: string;
  trademark?: boolean;
  status: "live" | "development" | "planned";
  description: string;
  href?: string;
  cta?: string;
}

const FLAGSHIP: SystemEntry = {
  title: "GroundLock",
  trademark: true,
  status: "live",
  description:
    "Peninsula Equine's flagship ground stabilisation system — resolving drainage, load distribution, and surface integrity for front entries, laneways, and high-traffic arrival zones.",
  href: "/groundlock",
  cta: "Explore GroundLock",
};

const DEVELOPING: SystemEntry[] = [
  {
    title: "Arrival Packages",
    status: "development",
    description:
      "Integrated front-entry concepts combining surface systems, gate logic, edging, and architectural finish into a single resolved arrival.",
  },
];

const PLANNED: SystemEntry[] = [
  {
    title: "Arena Edge",
    status: "planned",
    description:
      "Engineered transitions between arena surfaces, hard standings, and surrounding infrastructure — managing water, movement, and material integrity at the boundary.",
  },
  {
    title: "Stable Forecourt Systems",
    status: "planned",
    description:
      "High-traffic surface solutions for stable entries, wash bays, and daily-use zones where drainage and durability are non-negotiable.",
  },
  {
    title: "Forge-Integrated Entry Details",
    status: "planned",
    description:
      "Custom forged hardware, gate elements, and threshold details that complete the entry system with architectural precision.",
    href: "/forge",
    cta: "Explore Equus Forge",
  },
];

const STATUS_LABEL: Record<SystemEntry["status"], string> = {
  live: "Available Now",
  development: "In Development",
  planned: "Future System",
};

const STATUS_STYLE: Record<SystemEntry["status"], string> = {
  live: "text-accent/70",
  development: "text-foreground/35",
  planned: "text-foreground/20",
};

/* ── Shared row renderer ──────────────────────────── */
function SystemRow({ system, delay = 0 }: { system: SystemEntry; delay?: number }) {
  return (
    <RevealOnScroll delay={delay}>
      <div className="group py-12 sm:py-14">
        <div className="flex items-start justify-between gap-6 mb-4">
          <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground/70 group-hover:text-foreground/90 transition-colors duration-500">
            {system.title}
            {system.trademark && <span className="text-accent/40">™</span>}
          </h3>
          <span
            className={cn(
              "text-[10px] tracking-[0.2em] uppercase font-medium whitespace-nowrap mt-1.5",
              STATUS_STYLE[system.status],
            )}
          >
            {STATUS_LABEL[system.status]}
          </span>
        </div>

        <p className="text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2] max-w-xl mb-5">
          {system.description}
        </p>

        {system.href ? (
          <Link
            to={system.href}
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-accent/50 hover:text-accent/80 transition-colors duration-500"
          >
            {system.cta} <ArrowRight className="w-3 h-3" />
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

export default function SignatureSystems() {
  return (
    <Layout>
      <StickySubpageCTA ctaLabel="Enquire About Systems" ctaHref="/contact" showAfter={600} />
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
            <Layers className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/60">Product & Systems Layer</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Signature Systems
          </h1>

          <p
            className="mt-10 text-sm sm:text-[15px] text-muted-foreground/40 max-w-md mx-auto leading-[1.9] opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Proprietary engineered systems developed by Peninsula Equine —
            each one designed around how equine properties actually move, wear, and endure.
          </p>
        </div>
      </section>

      {/* ── Flagship — GroundLock ─────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll>
              <p className="text-overline text-accent/50 mb-16 text-center">Flagship System</p>
            </RevealOnScroll>

            <RevealOnScroll delay={80}>
              <div className="border border-accent/15 bg-accent/[0.02] p-8 sm:p-12">
                <div className="flex items-start justify-between gap-6 mb-5">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground leading-snug">
                      P.E. GroundLock<span className="text-accent/50">™</span>
                    </h2>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-accent/70 whitespace-nowrap mt-2">
                    Available Now
                  </span>
                </div>

                <p className="text-[13px] sm:text-[14px] text-muted-foreground/40 leading-[2] max-w-xl mb-8">
                  {FLAGSHIP.description}
                </p>

                <Button asChild variant="gold" size="lg">
                  <Link to="/groundlock">
                    Explore GroundLock <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── In Development ───────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll>
              <p className="text-overline text-foreground/25 mb-4 text-center">In Development</p>
            </RevealOnScroll>

            <div className="divide-y divide-border/15">
              {DEVELOPING.map((system, i) => (
                <SystemRow key={system.title} system={system} delay={i * 80} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Future Systems ───────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll>
              <p className="text-overline text-foreground/20 mb-4 text-center">Future Direction</p>
            </RevealOnScroll>

            <div className="divide-y divide-border/10">
              {PLANNED.map((system, i) => (
                <SystemRow key={system.title} system={system} delay={i * 80} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Forge cross-link ─────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-xl mx-auto relative z-[1] text-center">
            <RevealOnScroll>
              <RevealLine className="mx-auto mb-14" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll delay={80}>
              <p className="text-overline text-foreground/20 mb-6">Product Division</p>
            </RevealOnScroll>
            <RevealOnScroll delay={140}>
              <p className="text-[13px] sm:text-[14px] text-muted-foreground/30 leading-[2.2] mb-10">
                Signature Systems are developed and distributed through
                Equus Forge — Peninsula Equine's product engineering arm,
                housing GroundLock, custom hardware, and future property elements.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <Link
                to="/forge"
                className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-accent/40 hover:text-accent/70 transition-colors duration-500"
              >
                Explore Equus Forge <ArrowRight className="w-3 h-3" />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
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
            </RevealOnScroll>
            <RevealOnScroll delay={80}>
              <h2 className="heading-section text-foreground mb-8">
                Discuss a System
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={150}>
              <p className="text-sm text-muted-foreground/35 mb-12 leading-[1.9]">
                Whether you're planning an entry, upgrading a high-traffic zone,
                or interested in a future system — we're happy to talk through it.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={250}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Enquire About Signature Systems <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
