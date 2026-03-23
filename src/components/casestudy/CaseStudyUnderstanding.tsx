import { useState } from "react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyAct } from "@/data/caseStudyData";

interface Props {
  act: CaseStudyAct;
}

export function CaseStudyUnderstanding({ act }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="py-28 sm:py-36 bg-background">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up">
          <div
            className="relative overflow-hidden cursor-crosshair"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="aspect-[16/10] relative">
              <img
                src={act.image}
                alt={act.alt}
                className="absolute inset-0 w-full h-full object-cover img-gallery"
                loading="lazy"
              />

              {/* Subtle overlay on hover */}
              <div
                className="absolute inset-0 bg-primary/20 flex items-end p-8 sm:p-10"
                style={{
                  opacity: hovered ? 1 : 0,
                  transition: "opacity 500ms cubic-bezier(0.45, 0, 0.15, 1)",
                }}
              >
                {act.label && (
                  <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent/50">
                    {act.label}
                  </p>
                )}
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {act.line && (
          <RevealOnScroll direction="up" delay={200}>
            <div className="mt-8 sm:mt-10 space-y-3">
              <RevealLine width="w-8" delay={300} />
              <p className="font-serif text-[13px] sm:text-sm text-foreground/30 italic max-w-md">
                {act.line}
              </p>
            </div>
          </RevealOnScroll>
        )}
      </div>
    </section>
  );
}
