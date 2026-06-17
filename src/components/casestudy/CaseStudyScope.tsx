import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyScope as Scope } from "@/data/caseStudyData";

interface Props {
  location: string;
  scope: Scope;
}

export function CaseStudyScope({ location, scope }: Props) {
  return (
    <section className="relative py-32 sm:py-48 bg-background">
      {/* thin vertical thread */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Left — overline + brief */}
        <div className="lg:col-span-7 space-y-10">
          <RevealOnScroll direction="up" duration={900}>
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45">
              Chapter II — Dossier
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" duration={1000} delay={200}>
            <p className="font-serif text-[1.65rem] sm:text-[2.1rem] lg:text-[2.6rem] text-foreground/85 leading-[1.18] tracking-[-0.015em]">
              {scope.brief}
            </p>
          </RevealOnScroll>
          <RevealLine width="w-10" delay={400} />
        </div>

        {/* Right — meta panel */}
        <div className="lg:col-span-5 space-y-10">
          <RevealOnScroll direction="up" delay={300}>
            <dl className="space-y-6">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/30 mb-2">
                  Location
                </dt>
                <dd className="font-serif text-base text-foreground/70">{location}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/30 mb-3">
                  Scope
                </dt>
                <dd>
                  <ul className="space-y-2.5">
                    {scope.items.map((item) => (
                      <li
                        key={item}
                        className="font-sans font-light text-[13px] sm:text-sm text-foreground/55 flex items-start gap-3"
                      >
                        <span className="mt-[0.7em] inline-block w-3 h-px bg-accent/40 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
