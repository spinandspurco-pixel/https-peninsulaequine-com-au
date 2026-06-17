import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import type { CaseStudyTransformation as Transformation } from "@/data/caseStudyData";

interface Props {
  t: Transformation;
}

export function CaseStudyTransformation({ t }: Props) {
  return (
    <section className="py-24 sm:py-32 bg-card">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up" duration={900}>
          <div className="flex items-end justify-between mb-10 sm:mb-14">
            <div className="space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45">
                Transformation
              </p>
              <RevealLine width="w-8" delay={200} />
            </div>
            {t.caption && (
              <p className="font-serif italic text-[13px] sm:text-sm text-foreground/30 max-w-xs text-right">
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
