import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyOutcome } from "@/data/caseStudyData";

interface Props {
  outcomes: CaseStudyOutcome[];
}

export function CaseStudyOutcomes({ outcomes }: Props) {
  return (
    <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background">
      <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-[clamp(3.5rem,2.25rem+5vw,6rem)] space-y-3">
            <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
              Chapter VI — Outcomes
            </p>
            <RevealLine width="w-8" delay={200} />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-foreground/[0.05]">
          {outcomes.map((o, i) => (
            <RevealOnScroll key={o.label} direction="up" delay={i * 120}>
              <div className="group bg-background px-[clamp(1.75rem,1.25rem+2vw,2.5rem)] py-[clamp(3.5rem,2.25rem+5vw,6rem)] relative">
                <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-[1100ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:w-20" />
                <p className="font-mono uppercase text-foreground/25 mb-[clamp(1.5rem,1rem+1.5vw,2rem)] text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-serif text-foreground/90 tracking-[-0.03em] leading-[0.9] text-[clamp(2.75rem,1.5rem+5vw,4.5rem)]">
                  {o.metric}
                </p>
                <p className="mt-[clamp(1.5rem,1rem+1.5vw,2rem)] font-mono uppercase text-foreground/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
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
