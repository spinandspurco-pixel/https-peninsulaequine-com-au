import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyAct } from "@/data/caseStudyData";

interface Props {
  act: CaseStudyAct;
}

export function CaseStudySolution({ act }: Props) {
  return (
    <section className="py-20 sm:py-28 bg-card">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up">
          <div className="aspect-[16/10] relative overflow-hidden">
            <img
              src={act.image}
              alt={act.alt}
              className="absolute inset-0 w-full h-full object-cover img-gallery"
              loading="lazy"
            />
          </div>
        </RevealOnScroll>

        {act.line && (
          <RevealOnScroll direction="up" delay={200}>
            <div className="mt-8 sm:mt-10 space-y-3">
              <RevealLine width="w-6" delay={300} />
              {act.label && (
                <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent/30 mb-1">
                  {act.label}
                </p>
              )}
              <p className="font-serif text-[13px] sm:text-sm text-foreground/30 italic max-w-sm">
                {act.line}
              </p>
            </div>
          </RevealOnScroll>
        )}
      </div>
    </section>
  );
}
