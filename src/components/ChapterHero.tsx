import { RevealOnScroll, RevealLine, RevealImage } from "@/components/RevealOnScroll";

export interface ChapterHeroProps {
  /** Chapter number, e.g. "I", "II", "01" */
  number: string;
  /** Small uppercase overline above the heading */
  overline: string;
  /** Main chapter heading */
  title: string;
  /** Supporting body copy */
  body: string;
  /** Chapter feature image */
  image: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** Image position relative to the copy */
  align?: "left" | "right";
  /** Background variant for alternating sections */
  background?: "background" | "card";
  /** Optional brand monogram (e.g. PE) shown in a reserved zone above the chapter number */
  monogram?: string;
}

/**
 * ChapterHero
 *
 * A reusable editorial chapter section with explicit, reserved zones for:
 *   1. Brand monogram (optional)
 *   2. Chapter number
 *   3. Overline label
 *   4. Heading
 *   5. Body copy
 *
 * Each zone is laid out in normal document flow (no absolute positioning over
 * shared space), so z-index collisions with the fixed header, the chapter
 * number, the logo, or the title cannot reappear.
 */
export function ChapterHero({
  number,
  overline,
  title,
  body,
  image,
  imageAlt,
  align = "left",
  background = "background",
  monogram,
}: ChapterHeroProps) {
  const bgClass = background === "card" ? "bg-card" : "bg-background";
  const imageOrderClass = align === "right" ? "lg:order-2" : "";
  const copyOrderClass = align === "right" ? "lg:order-1 lg:pr-4" : "lg:pl-4";
  const imageBleedClass = align === "left" ? "lg:-ml-[3rem]" : "lg:-mr-[3rem]";

  return (
    <section className={`relative py-[clamp(5rem,3rem+7vw,10rem)] ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
        {/* ── IMAGE ZONE ── */}
        <div className={`col-span-12 lg:col-span-8 ${imageOrderClass}`}>
          <RevealImage delay={100} duration={1200}>
            <div className={`relative aspect-[16/10] overflow-hidden ${imageBleedClass}`}>
              <img
                src={image}
                alt={imageAlt ?? `${overline} — chapter ${number}`}
                loading="lazy"
                width={1792}
                height={1024}
                className="absolute inset-0 w-full h-full object-cover img-feature transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.15,1)] hover:scale-[1.03]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
          </RevealImage>
        </div>

        {/* ── COPY ZONE — explicit vertical stack, no overlapping layers ── */}
        <div
          className={`col-span-12 lg:col-span-4 flex flex-col gap-[clamp(1.25rem,0.9rem+1.2vw,2rem)] ${copyOrderClass}`}
        >
          {/* Zone 1 — Brand monogram (reserved row, only renders if provided) */}
          {monogram && (
            <RevealOnScroll direction="none" duration={900}>
              <p className="font-serif text-foreground/35 leading-none tracking-[-0.02em] text-[clamp(1.1rem,0.9rem+0.6vw,1.4rem)]">
                {monogram}
              </p>
            </RevealOnScroll>
          )}

          {/* Zone 2 — Chapter number (its own row, never sits behind other text) */}
          <RevealOnScroll direction="up" duration={900}>
            <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
              Chapter {number}
            </p>
          </RevealOnScroll>

          {/* Zone 3 — Overline */}
          <RevealOnScroll direction="up" duration={900} delay={80}>
            <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
              {overline}
            </p>
          </RevealOnScroll>

          {/* Zone 4 — Heading */}
          <RevealOnScroll direction="up" duration={1000} delay={150}>
            <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)]">
              {title}
            </h2>
          </RevealOnScroll>

          <RevealLine width="w-8" delay={300} />

          {/* Zone 5 — Body copy */}
          <RevealOnScroll direction="up" duration={1000} delay={400}>
            <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)]">
              {body}
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
