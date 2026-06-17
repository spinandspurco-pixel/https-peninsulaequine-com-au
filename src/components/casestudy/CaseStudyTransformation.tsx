import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import type { CaseStudyTransformation as Transformation } from "@/data/caseStudyData";

interface Props {
  t: Transformation;
}

export function CaseStudyTransformation({ t }: Props) {
  return (
    <section className="py-[clamp(5.5rem,3.5rem+7vw,10rem)] bg-card">
      <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
        <RevealOnScroll direction="up" duration={900}>
          <div className="flex items-end justify-between mb-[clamp(2.5rem,1.5rem+3vw,4rem)] gap-6">
            <div className="space-y-3">
              <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                Chapter III — Transformation
              </p>
              <RevealLine width="w-8" delay={200} />
            </div>
            {t.caption && (
              <p className="font-serif italic text-foreground/35 max-w-xs text-right leading-[1.55] text-[clamp(0.75rem,0.7rem+0.2vw,0.875rem)]">
                {t.caption}
              </p>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="up" delay={150}>
          <BeforeAfterSlider before={t.before} after={t.after} alt="Project transformation" />
        </RevealOnScroll>
      </div>
    </section>
  );
}
