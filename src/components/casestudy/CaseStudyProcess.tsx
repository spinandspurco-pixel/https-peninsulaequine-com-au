import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyImage } from "@/data/caseStudyData";

interface Props {
  images: CaseStudyImage[];
}

export function CaseStudyProcess({ images }: Props) {
  return (
    <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background">
      <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-[clamp(3rem,2rem+4vw,5rem)] space-y-3">
            <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
              Chapter IV — Construction
            </p>
            <p className="font-serif italic text-foreground/35 max-w-md leading-[1.55] text-[clamp(0.75rem,0.7rem+0.2vw,0.875rem)]">
              The work, recorded as it was built.
            </p>
            <RevealLine width="w-8" delay={200} />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-foreground/[0.05]">
          {images.map((img, i) => (
            <RevealOnScroll key={img.src + i} direction="up" delay={i * 80}>
              <figure className="group relative overflow-hidden bg-background aspect-[4/5]">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover img-gallery transition-transform duration-[1400ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.04]"
                />

                {/* persistent vignette so caption stays legible */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/85 via-background/30 to-transparent" />
                {/* persistent index */}
                <figcaption className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 flex items-center justify-between gap-3">
                  <span className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif italic text-foreground/45 truncate text-right text-[clamp(0.625rem,0.6rem+0.1vw,0.75rem)]">
                    {img.alt}
                  </span>
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
