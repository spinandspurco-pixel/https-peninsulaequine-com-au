import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyScope as Scope } from "@/data/caseStudyData";

interface Props {
  location: string;
  scope: Scope;
}

export function CaseStudyScope({ location, scope }: Props) {
  return (
    <section className="relative py-[clamp(6rem,4rem+8vw,12rem)] bg-background">
      {/* thin vertical thread */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />

      <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2.5rem,1.5rem+4vw,5rem)]">
        {/* Left — overline + brief */}
        <div className="lg:col-span-7 space-y-[clamp(1.75rem,1.25rem+2vw,2.5rem)]">
          <RevealOnScroll direction="up" duration={900}>
            <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
              Chapter II — Dossier
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" duration={1000} delay={200}>
            <p className="font-serif text-foreground/85 leading-[1.18] tracking-[-0.015em] text-[clamp(1.5rem,1rem+2vw,2.6rem)]">
              {scope.brief}
            </p>
          </RevealOnScroll>
          <RevealLine width="w-10" delay={400} />
        </div>

        {/* Right — meta panel */}
        <div className="lg:col-span-5 space-y-[clamp(1.75rem,1.25rem+2vw,2.5rem)]">
          <RevealOnScroll direction="up" delay={300}>
            <dl className="space-y-[clamp(1.25rem,1rem+1vw,1.75rem)]">
              <div>
                <dt className="font-mono uppercase text-foreground/30 mb-2 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                  Location
                </dt>
                <dd className="font-serif text-foreground/70 text-[clamp(0.9375rem,0.875rem+0.3vw,1.0625rem)]">{location}</dd>
              </div>
              <div>
                <dt className="font-mono uppercase text-foreground/30 mb-3 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                  Scope
                </dt>
                <dd>
                  <ul className="space-y-[clamp(0.5rem,0.45rem+0.2vw,0.75rem)]">
                    {scope.items.map((item) => (
                      <li
                        key={item}
                        className="font-sans font-light text-foreground/55 flex items-start gap-3 text-[clamp(0.8125rem,0.78rem+0.15vw,0.9375rem)] leading-[1.7]"
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
