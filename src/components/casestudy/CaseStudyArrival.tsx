import { RevealOnScroll } from "@/components/RevealOnScroll";

interface Props {
  title: string;
  location: string;
  hero: string;
  heroAlt: string;
}

export function CaseStudyArrival({ title, location, hero, heroAlt }: Props) {
  return (
    <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
      <img
        src={hero}
        alt={heroAlt}
        className="absolute inset-0 w-full h-full object-cover img-header"
      />
      {/* layered cinematic grade — top vignette + bottom anchor */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/15 to-primary/75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,transparent,hsl(var(--primary)/0.35))]" />

      {/* chapter marker — top left */}
      <div className="absolute top-8 sm:top-12 left-8 sm:left-16 z-10">
        <RevealOnScroll direction="none" duration={1200} delay={300}>
          <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-accent/55">
            Chapter I — Site
          </p>
        </RevealOnScroll>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-16 pb-14 sm:pb-20 z-10">
        <div className="max-w-6xl grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-9 space-y-5">
            <RevealOnScroll direction="up" duration={900} delay={400}>
              <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/55">
                {location}
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={600}>
              <h1 className="font-serif text-[2.4rem] sm:text-6xl lg:text-7xl xl:text-[5.25rem] text-primary-foreground tracking-[-0.02em] leading-[0.95]">
                {title}
              </h1>
            </RevealOnScroll>
          </div>
          <div className="hidden lg:block col-span-3">
            <RevealOnScroll direction="none" duration={1400} delay={900}>
              <div className="w-12 h-px bg-accent/50 mb-3" />
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-primary-foreground/45">
                Built Properly.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
