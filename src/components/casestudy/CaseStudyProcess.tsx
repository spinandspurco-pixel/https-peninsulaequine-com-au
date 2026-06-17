import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyImage } from "@/data/caseStudyData";

interface Props {
  images: CaseStudyImage[];
}

export function CaseStudyProcess({ images }: Props) {
  return (
    <section className="py-28 sm:py-36 bg-background">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-12 sm:mb-16 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45">
              Construction
            </p>
            <p className="font-serif italic text-[13px] sm:text-sm text-foreground/30 max-w-md">
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
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-4 font-mono text-[9px] uppercase tracking-[0.3em] text-accent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {String(i + 1).padStart(2, "0")} — {img.alt}
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
