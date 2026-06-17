import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyOutcome } from "@/data/caseStudyData";

interface Props {
  outcomes: CaseStudyOutcome[];
}

export function CaseStudyOutcomes({ outcomes }: Props) {
  return (
    <section className="py-32 sm:py-44 bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-16 sm:mb-24 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45">
              Chapter VI — Outcomes
            </p>
            <RevealLine width="w-8" delay={200} />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-foreground/[0.05]">
          {outcomes.map((o, i) => (
            <RevealOnScroll key={o.label} direction="up" delay={i * 120}>
              <div className="group bg-background px-8 sm:px-10 py-16 sm:py-24 relative">
                <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-[1100ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:w-20" />
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-8">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-serif text-[3.4rem] sm:text-[4.5rem] text-foreground/90 tracking-[-0.03em] leading-[0.9]">
                  {o.metric}
                </p>
                <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/45">
                  {o.label}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
