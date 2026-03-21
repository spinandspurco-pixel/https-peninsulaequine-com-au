import { useState } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";
import { ArrowRight } from "lucide-react";

export type ProjectType = "full-property" | "arena" | "ground-systems";

const options: { id: ProjectType; title: string; description: string }[] = [
  {
    id: "full-property",
    title: "Full Property Build",
    description: "Arena, stables, and full-site infrastructure",
  },
  {
    id: "arena",
    title: "Arena Construction",
    description: "Indoor or outdoor arena builds",
  },
  {
    id: "ground-systems",
    title: "Ground Systems & Access",
    description: "Driveways, float access, stabilisation",
  },
];

interface Props {
  onSelect: (type: ProjectType) => void;
}

export function ProjectQualification({ onSelect }: Props) {
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
                Begin Here
              </p>
              <div className="w-8 h-px bg-accent/25" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em] mb-4">
              Start With the Right Project
            </h2>
            <p className="text-sm text-muted-foreground/35 font-serif italic max-w-lg mx-auto leading-relaxed">
              Every build is different. We start by understanding the scale, intent, and outcome you're aiming for.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="up" duration={DURATION.normal} delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-3xl mx-auto">
            {options.map((opt) => {
              const isHovered = hovered === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelect(opt.id)}
                  onMouseEnter={() => setHovered(opt.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="group relative text-left p-6 sm:p-7 lg:p-8 border rounded-sm cursor-pointer bg-transparent"
                  style={{
                    borderColor: isHovered
                      ? "hsl(var(--accent) / 0.25)"
                      : "hsl(var(--accent) / 0.08)",
                    transition: `border-color ${DURATION.fast}ms ${EASE.interactive}, box-shadow ${DURATION.fast}ms ${EASE.interactive}`,
                    boxShadow: isHovered
                      ? "0 0 30px hsl(var(--accent) / 0.06)"
                      : "none",
                  }}
                >
                  <h3 className="font-serif text-base sm:text-lg text-foreground/85 tracking-[0.02em] mb-2">
                    {opt.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-muted-foreground/35 leading-relaxed font-serif italic mb-5">
                    {opt.description}
                  </p>
                  <div
                    className="flex items-center gap-2"
                    style={{
                      opacity: isHovered ? 1 : 0.4,
                      transition: `opacity ${DURATION.fast}ms ${EASE.interactive}`,
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent/50">
                      Select
                    </span>
                    <ArrowRight
                      size={12}
                      className="text-accent/40 transition-transform duration-200 group-hover:translate-x-1"
                    />
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
