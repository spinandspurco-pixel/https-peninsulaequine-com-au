import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyImage } from "@/data/caseStudyData";

interface Props {
  images: CaseStudyImage[];
}

export function CaseStudyProcess({ images }: Props) {
  return (
    <section className="py-32 sm:py-44 bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-14 sm:mb-20 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45">
              Chapter IV — Construction
            </p>
            <p className="font-serif italic text-[13px] sm:text-sm text-foreground/35 max-w-md leading-relaxed">
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
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-accent/65">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif italic text-[10px] sm:text-[11px] text-foreground/45 truncate text-right">
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
