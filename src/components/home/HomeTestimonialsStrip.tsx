import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { fetchFeaturedTestimonials, type TestimonialItem } from "@/lib/testimonials";

export function HomeTestimonialsStrip() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedTestimonials(3)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loaded && items.length === 0) return null;

  return (
    <section className="relative py-[clamp(4rem,2.5rem+6vw,9rem)] bg-background overflow-hidden">
      <div className="section-container">
        <RevealOnScroll direction="up" duration={900}>
          <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2vw,4rem)]">
            <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">
              05
            </span>
            <span className="h-px w-12 bg-accent/30" />
            <span className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.5em]">
              Witness
            </span>
          </div>
        </RevealOnScroll>

        <div className="grid gap-[clamp(2rem,1rem+2vw,3.5rem)] md:grid-cols-3">
          {items.map((t, i) => (
            <RevealOnScroll key={t.id} direction="up" duration={1000} delay={150 + i * 120}>
              <figure className="flex h-full flex-col justify-between gap-8 border-l border-accent/15 pl-6">
                <blockquote className="font-serif text-foreground/85 leading-[1.5] text-[clamp(1rem,0.85rem+0.4vw,1.15rem)] tracking-[-0.005em]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="space-y-1">
                  <div className="font-mono uppercase text-foreground/72 text-[10px] tracking-[0.32em]">
                    {t.name}
                  </div>
                  {t.role && (
                    <div className="font-sans font-light text-foreground/45 text-[12px]">
                      {t.role}
                    </div>
                  )}
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll direction="none" duration={1100} delay={500}>
          <div className="mt-[clamp(2.5rem,1.5rem+2vw,4rem)] flex justify-end">
            <Link
              to="/testimonials"
              className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/72 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
            >
              <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
              All accounts
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
