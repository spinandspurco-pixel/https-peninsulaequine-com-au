import { useState } from "react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyImage } from "@/data/caseStudyData";

interface Props {
  images: CaseStudyImage[];
}

export function CaseStudyGallery({ images }: Props) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-28 sm:py-36 bg-card">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-12 sm:mb-16 flex items-end justify-between">
            <div className="space-y-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45">
                Completed
              </p>
              <p className="font-serif italic text-[13px] sm:text-sm text-foreground/30 max-w-md">
                Resolved. In use.
              </p>
            </div>
            <RevealLine width="w-12" delay={200} />
          </div>
        </RevealOnScroll>

        {/* Editorial mosaic: first full bleed, rest split */}
        <div className="space-y-px bg-foreground/[0.05]">
          {images[0] && (
            <RevealOnScroll direction="up">
              <button
                type="button"
                onClick={() => setActive(0)}
                className="block w-full group relative overflow-hidden bg-background aspect-[21/9]"
              >
                <img
                  src={images[0].src}
                  alt={images[0].alt}
                  className="absolute inset-0 w-full h-full object-cover img-header transition-transform duration-[1400ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.03]"
                />
              </button>
            </RevealOnScroll>
          )}
          {images.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
              {images.slice(1).map((img, i) => (
                <RevealOnScroll key={img.src} direction="up" delay={i * 100}>
                  <button
                    type="button"
                    onClick={() => setActive(i + 1)}
                    className="block w-full group relative overflow-hidden bg-background aspect-[4/3]"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover img-gallery transition-transform duration-[1400ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.04]"
                    />
                  </button>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && images[active] && (
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-label="Close image"
          className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 sm:p-12 animate-fade-in cursor-zoom-out"
        >
          <img
            src={images[active].src}
            alt={images[active].alt}
            className="max-w-full max-h-full object-contain"
          />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-accent/50">
            Close
          </span>
        </button>
      )}
    </section>
  );
}
