import { RevealOnScroll } from "@/components/RevealOnScroll";

interface Props {
  title: string;
  location: string;
  hero: string;
  heroAlt: string;
}

export function CaseStudyArrival({ title, location, hero, heroAlt }: Props) {
  return (
    <section className="relative h-[80vh] min-h-[520px] overflow-hidden">
      <img
        src={hero}
        alt={heroAlt}
        className="absolute inset-0 w-full h-full object-cover img-header"
      />
      <div className="absolute inset-0 bg-primary/50" />

      <div className="absolute bottom-0 left-0 right-0 p-10 sm:p-16 z-10">
        <div className="max-w-5xl">
          <RevealOnScroll direction="up" duration={900} delay={400}>
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40 mb-3">
              {location}
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" duration={900} delay={600}>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-primary-foreground tracking-tight">
              {title}
            </h1>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
