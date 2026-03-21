import { useState } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type BuildTier = "essential" | "performance" | "estate";

const tiers: { id: BuildTier; title: string; description: string; featured?: boolean }[] = [
  {
    id: "essential",
    title: "Essential Build",
    description:
      "A clean, functional build designed to deliver performance without unnecessary complexity.",
  },
  {
    id: "performance",
    title: "Performance Build",
    description:
      "A balanced build combining performance, durability, and long-term reliability.",
    featured: true,
  },
  {
    id: "estate",
    title: "Estate Build",
    description:
      "A fully resolved build designed for long-term ownership, performance, and presence.",
  },
];

interface Props {
  onSelect?: (tier: BuildTier) => void;
}

export function BuildOptions({ onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        <RevealOnScroll direction="up" duration={DURATION.normal}>
          <div className="text-center mb-14 sm:mb-18 lg:mb-20">
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="w-8 h-px bg-accent/25" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
                Build Options
              </p>
              <div className="w-8 h-px bg-accent/25" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em] mb-4">
              Choose Your Build Level
            </h2>
            <p className="text-sm text-muted-foreground/35 font-serif italic max-w-lg mx-auto leading-relaxed">
              We typically structure builds in three ways depending on how far you want to take it.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="up" duration={DURATION.normal} delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-4xl mx-auto">
            {tiers.map((tier) => {
              const isHovered = hovered === tier.id;
              const isFeatured = tier.featured;

              return (
                <button
                  key={tier.id}
                  onClick={() => onSelect?.(tier.id)}
                  onMouseEnter={() => setHovered(tier.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "group relative text-left p-7 sm:p-8 lg:p-9 border rounded-sm cursor-pointer bg-transparent transition-all",
                    isFeatured && "sm:scale-[1.03] sm:-my-1"
                  )}
                  style={{
                    borderColor: isFeatured
                      ? isHovered
                        ? "hsl(var(--accent) / 0.35)"
                        : "hsl(var(--accent) / 0.18)"
                      : isHovered
                        ? "hsl(var(--accent) / 0.2)"
                        : "hsl(var(--accent) / 0.06)",
                    transition: `border-color ${DURATION.fast}ms ${EASE.interactive}, box-shadow ${DURATION.fast}ms ${EASE.interactive}, transform ${DURATION.fast}ms ${EASE.interactive}`,
                    boxShadow: isFeatured
                      ? isHovered
                        ? "0 0 40px hsl(var(--accent) / 0.08)"
                        : "0 0 24px hsl(var(--accent) / 0.04)"
                      : isHovered
                        ? "0 0 24px hsl(var(--accent) / 0.04)"
                        : "none",
                  }}
                >
                  {/* Featured indicator */}
                  {isFeatured && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  )}

                  {/* Tier label */}
                  {isFeatured && (
                    <p className="text-[8px] uppercase tracking-[0.35em] text-accent/40 font-mono mb-4">
                      Most Selected
                    </p>
                  )}

                  <h3 className="font-serif text-base sm:text-lg text-foreground/85 tracking-[0.02em] mb-3">
                    {tier.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-muted-foreground/35 leading-relaxed font-serif italic mb-6">
                    {tier.description}
                  </p>

                  <div
                    className="flex items-center gap-2"
                    style={{
                      opacity: isHovered ? 1 : isFeatured ? 0.5 : 0.3,
                      transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent/50">
                      Enquire
                    </span>
                    <span className="text-accent/40 text-xs transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
