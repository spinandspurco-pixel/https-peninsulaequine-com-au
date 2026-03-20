import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Layers, Wrench, Sparkles } from "lucide-react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { cn } from "@/lib/utils";

/* ── Product families ─────────────────────────────── */

interface ProductFamily {
  title: string;
  trademark?: boolean;
  status: "live" | "development" | "planned";
  description: string;
  href?: string;
  cta?: string;
  icon: typeof Flame;
}

const PRODUCT_FAMILIES: ProductFamily[] = [
  {
    title: "GroundLock Systems",
    trademark: true,
    status: "live",
    icon: Layers,
    description:
      "Permanent sub-surface entry systems for gates, driveways, and high-traffic equine zones — engineered for drainage, stability, and float-grade load.",
    href: "/groundlock",
    cta: "Explore GroundLock",
  },
  {
    title: "Forge Hardware",
    status: "development",
    icon: Wrench,
    description:
      "Architectural steelwork and gate elements — swing gates, sliding systems, tie-up rails, and structural fabrications built to horseman's tolerances.",
  },
  {
    title: "Custom Property Elements",
    status: "planned",
    icon: Sparkles,
    description:
      "Bespoke estate details — laser-cut property signage, ornamental brackets, threshold hardware, and finishing elements that complete the built environment.",
  },
];

const STATUS_LABEL: Record<ProductFamily["status"], string> = {
  live: "Available Now",
  development: "In Development",
  planned: "Future Division",
};

const STATUS_STYLE: Record<ProductFamily["status"], string> = {
  live: "text-accent/70",
  development: "text-foreground/35",
  planned: "text-foreground/20",
};

/* ── Family row ───────────────────────────────────── */

function FamilyRow({ family, delay = 0 }: { family: ProductFamily; delay?: number }) {
  const Icon = family.icon;
  return (
    <RevealOnScroll delay={delay}>
      <div className="group py-12 sm:py-14">
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-accent/40" strokeWidth={1.5} />
            <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground/70 group-hover:text-foreground/90 transition-colors duration-500">
              {family.title}
              {family.trademark && <span className="text-accent/40">™</span>}
            </h3>
          </div>
          <span
            className={cn(
              "text-[10px] tracking-[0.2em] uppercase font-medium whitespace-nowrap mt-1.5",
              STATUS_STYLE[family.status],
            )}
          >
            {STATUS_LABEL[family.status]}
          </span>
        </div>

        <p className="text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2] max-w-xl mb-5 pl-7">
          {family.description}
        </p>

        {family.href ? (
          <Link
            to={family.href}
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-accent/50 hover:text-accent/80 transition-colors duration-500 pl-7"
          >
            {family.cta} <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-[11px] tracking-[0.15em] uppercase text-foreground/15 pl-7">
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
            <p className="text-overline text-accent/60">Product & Systems Division</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Equus Forge
          </h1>

          <p
            className="mt-3 text-[11px] tracking-[0.2em] uppercase text-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "550ms", animationFillMode: "both" }}
          >
            by Peninsula Equine
          </p>

          <p
            className="mt-10 text-sm sm:text-[15px] text-muted-foreground/40 max-w-md mx-auto leading-[1.9] opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Engineered rural hardware and signature systems — designed, fabricated,
            and installed by the same team that builds the property.
          </p>
        </div>
      </section>

      {/* ── Positioning statement ─────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-24 sm:py-32 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-xl mx-auto relative z-[1] text-center">
            <RevealOnScroll>
              <RevealLine className="mx-auto mb-14" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll delay={80}>
              <p className="text-[13px] sm:text-[14px] text-muted-foreground/35 leading-[2.1] italic font-serif">
                Every component is purpose-built for equine environments — heavy gauge,
                hot-dip galvanised, engineered to the tolerances of working rural properties.
                No catalogue sizes. No compromises.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Product Families ──────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll>
              <p className="text-overline text-accent/50 mb-4 text-center">Product Families</p>
            </RevealOnScroll>

            <div className="divide-y divide-border/15">
              {PRODUCT_FAMILIES.map((family, i) => (
                <FamilyRow key={family.title} family={family} delay={i * 80} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Systems connection ────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll>
              <div className="border border-accent/15 bg-accent/[0.02] p-8 sm:p-12 text-center">
                <p className="text-overline text-accent/50 mb-6">Part of Signature Systems</p>
                <p className="text-[13px] sm:text-[14px] text-muted-foreground/35 leading-[2] max-w-lg mx-auto mb-8">
                  Equus Forge products integrate directly with Peninsula Equine's
                  proprietary Signature Systems — ensuring every component works
                  as part of a resolved, engineered whole.
                </p>
                <Link
                  to="/systems"
                  className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-accent/50 hover:text-accent/80 transition-colors duration-500"
                >
                  View Signature Systems <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
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
                Request a Specification
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delay={150}>
              <p className="text-sm text-muted-foreground/35 mb-12 leading-[1.9]">
                Whether it's a GroundLock configuration, custom gate system,
                or bespoke property element — we'll scope it, quote it, and build it.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={250}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Enquire About Forge Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
