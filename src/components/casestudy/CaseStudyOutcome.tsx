import { RevealOnScroll } from "@/components/RevealOnScroll";
import type { CaseStudyAct } from "@/data/caseStudyData";

interface Props {
  act: CaseStudyAct;
}

export function CaseStudyOutcome({ act }: Props) {
  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
      <img
        src={act.image}
        alt={act.alt}
        className="absolute inset-0 w-full h-full object-cover img-header"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-primary/40" />

      {act.line && (
        <div className="absolute inset-0 flex items-end justify-start p-10 sm:p-16 z-10">
          <RevealOnScroll direction="up" duration={900} delay={300}>
            <p className="font-serif text-lg sm:text-xl text-primary-foreground/80 italic">
              {act.line}
            </p>
          </RevealOnScroll>
        </div>
      )}
    </section>
  );
}
