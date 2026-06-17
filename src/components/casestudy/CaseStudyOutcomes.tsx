import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyOutcome } from "@/data/caseStudyData";

interface Props {
  outcomes: CaseStudyOutcome[];
}

export function CaseStudyOutcomes({ outcomes }: Props) {
  return (
    <section className="py-28 sm:py-36 bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-14 sm:mb-20 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45">
              Key Outcomes
            </p>
            <RevealLine width="w-8" delay={200} />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-foreground/[0.05]">
          {outcomes.map((o, i) => (
            <RevealOnScroll key={o.label} direction="up" delay={i * 120}>
              <div className="group bg-background px-8 py-14 sm:py-20 relative">
                <span
                  className="absolute top-0 left-0 h-px bg-accent/30 transition-all duration-[1100ms] ease-[cubic-bezier(0.45,0,0.15,1)]"
                  style={{ width: "1.5rem" }}
                />
                <p className="font-serif text-5xl sm:text-6xl text-foreground/85 tracking-tight leading-none">
                  {o.metric}
                </p>
                <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/40">
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
