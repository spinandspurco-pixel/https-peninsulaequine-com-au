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
      <div className="absolute top-[clamp(1.75rem,1rem+2vw,3rem)] left-[clamp(1.5rem,0.75rem+3vw,4rem)] z-10">
        <RevealOnScroll direction="none" duration={1200} delay={300}>
          <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
            Chapter I — Site
          </p>
        </RevealOnScroll>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+4vw,5rem)] z-10">
        <div className="max-w-6xl grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-9 space-y-[clamp(1rem,0.75rem+1vw,1.5rem)]">
            <RevealOnScroll direction="up" duration={900} delay={400}>
              <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                {location}
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={600}>
              <h1 className="font-serif text-primary-foreground tracking-[-0.02em] leading-[0.95] text-[clamp(2.5rem,1.4rem+5.2vw,5.25rem)]">
                {title}
              </h1>
            </RevealOnScroll>
          </div>
          <div className="hidden lg:block col-span-3">
            <RevealOnScroll direction="none" duration={1400} delay={900}>
              <div className="w-12 h-px bg-accent/50 mb-3" />
              <p className="font-mono uppercase text-primary-foreground/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                Built Properly.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
