import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ArrowRight, Lock, Layers, Fence, Home, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── System catalogue ─────────────────────────────── */

interface SystemEntry {
  title: string;
  status: "live" | "development" | "planned";
  description: string;
  href?: string;
  cta?: string;
}

const SYSTEMS: SystemEntry[] = [
  {
    title: "GroundLock",
    status: "live",
    description:
      "A premium stabilised entry system designed for floats, trucks, gated arrivals, and high-traffic rural entries. Engineered beneath the surface to resolve drainage, movement, and long-term wear.",
    href: "/groundlock",
    cta: "Explore GroundLock",
  },
  {
    title: "Arrival Packages",
    status: "development",
    description:
      "Integrated front-entry concepts combining surface systems, gate logic, edging, and architectural presentation into a single resolved arrival experience.",
  },
  {
    title: "Arena Edge / Threshold Systems",
    status: "planned",
    description:
      "Engineered transitions between arena surfaces, hard standings, and surrounding infrastructure — designed to manage water, movement, and material integrity at the boundary.",
  },
  {
    title: "Stable Forecourt Systems",
    status: "planned",
    description:
      "High-traffic surface solutions for stable entries, wash bays, and daily-use zones where drainage performance and durability are non-negotiable.",
  },
  {
    title: "Forge-Integrated Entry Details",
    status: "planned",
    description:
      "Custom forged hardware, gate elements, signage, and threshold details that complete the entry system with architectural precision.",
    href: "/shop",
    cta: "Explore Equus Forge",
  },
];

const STATUS_LABEL: Record<SystemEntry["status"], string> = {
  live: "Available Now",
  development: "In Development",
  planned: "Planned",
};

const STATUS_STYLE: Record<SystemEntry["status"], string> = {
  live: "text-accent/70",
  development: "text-foreground/30",
  planned: "text-foreground/20",
};

/* ── Page ──────────────────────────────────────────── */

export default function SignatureSystems() {
  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-44 sm:pt-56 pb-32 sm:pb-44 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 pointer-events-none grain-texture" />

        <div className="section-container relative z-10 max-w-3xl mx-auto text-center">
          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-[10px] tracking-[0.35em] uppercase text-accent/50 font-medium">
              Peninsula Equine
            </p>
            <div className="w-8 h-px bg-accent/40" />
          </div>

          <h1
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-foreground leading-[1.1] opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Signature Systems
          </h1>

          <p
            className="mt-10 text-[13px] sm:text-[14px] text-muted-foreground/40 max-w-lg mx-auto leading-[2] opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Proprietary systems and engineered details designed to solve the way
            equine properties actually move, wear, and endure.
          </p>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────── */}
      <section className="py-24 sm:py-32 border-t border-border/30">
        <div className="section-container max-w-2xl mx-auto text-center">
          <RevealOnScroll>
            <p className="text-[10px] tracking-[0.35em] uppercase text-accent/40 mb-8">
              Our Approach
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/70 leading-relaxed mb-8">
              Every system begins beneath the surface.
            </h2>
            <p className="text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2] max-w-md mx-auto">
              Peninsula Equine signature systems are not off-the-shelf products.
              Each one is engineered around real equine use — traffic patterns,
              drainage behaviour, material endurance, and the way a property
              needs to perform every single day.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Systems Index ────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="section-container">
          <RevealOnScroll>
            <p className="text-[10px] tracking-[0.35em] uppercase text-accent/40 mb-16 text-center">
              System Index
            </p>
          </RevealOnScroll>

          <div className="max-w-3xl mx-auto space-y-0 divide-y divide-border/20">
            {SYSTEMS.map((system, i) => (
              <RevealOnScroll key={system.title} delay={i * 80}>
                <div className="group py-12 sm:py-16 first:pt-0 last:pb-0">
                  {/* Status + Title */}
                  <div className="flex items-start justify-between gap-6 mb-5">
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-foreground/70 group-hover:text-foreground/90 transition-colors duration-500">
                      {system.title}
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

                  {/* Description */}
                  <p className="text-[12px] sm:text-[13px] text-muted-foreground/30 leading-[2] max-w-xl mb-6">
                    {system.description}
                  </p>

                  {/* CTA */}
                  {system.href ? (
                    <Link
                      to={system.href}
                      className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-accent/50 hover:text-accent/80 transition-colors duration-500"
                    >
                      {system.cta}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-[11px] tracking-[0.15em] uppercase text-foreground/15">
                      Details coming soon
                    </span>
                  )}
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── How We Develop ───────────────────────────── */}
      <section className="py-24 sm:py-32 border-t border-border/30">
        <div className="section-container max-w-3xl mx-auto">
          <RevealOnScroll>
            <p className="text-[10px] tracking-[0.35em] uppercase text-accent/40 mb-12 text-center">
              Development Process
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border/8">
            {[
              {
                step: "01",
                title: "Field Testing",
                body: "Every system is developed through real equine property use — not lab conditions.",
              },
              {
                step: "02",
                title: "Engineering",
                body: "Drainage, load, movement, and material behaviour are resolved before anything is specified.",
              },
              {
                step: "03",
                title: "Integration",
                body: "Systems are designed to work together — surface, threshold, hardware, and finish as one.",
              },
            ].map((item, i) => (
              <RevealOnScroll key={item.step} delay={i * 100}>
                <div className="bg-card p-8 sm:p-10 min-h-[200px]">
                  <span className="text-[10px] tracking-[0.3em] text-accent/30 mb-6 block">
                    {item.step}
                  </span>
                  <h4 className="font-serif text-[15px] font-medium text-foreground/60 mb-4">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-muted-foreground/30 leading-[2]">
                    {item.body}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Register Interest CTA ────────────────────── */}
      <section className="py-28 sm:py-36 border-t border-border/30">
        <div className="section-container max-w-xl mx-auto text-center">
          <RevealOnScroll>
            <p className="text-[10px] tracking-[0.35em] uppercase text-accent/40 mb-8">
              Stay Informed
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/70 leading-relaxed mb-6">
              New systems are in development.
            </h2>
            <p className="text-[12px] text-muted-foreground/30 leading-[2] max-w-sm mx-auto mb-10">
              Register your interest to be the first to know when new Peninsula
              Equine signature systems become available.
            </p>
            <Link to="/contact">
              <button className="px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-medium border border-accent/30 text-accent/60 hover:bg-accent/10 hover:text-accent transition-all duration-500">
                Register Interest
              </button>
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
