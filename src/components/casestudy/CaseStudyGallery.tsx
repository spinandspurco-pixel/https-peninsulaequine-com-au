import { useState } from "react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import type { CaseStudyImage } from "@/data/caseStudyData";

interface Props {
  images: CaseStudyImage[];
}

export function CaseStudyGallery({ images }: Props) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-card">
      <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
        <RevealOnScroll direction="up" duration={900}>
          <div className="mb-[clamp(3rem,2rem+4vw,5rem)] flex items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                Chapter V — Completed
              </p>
              <p className="font-serif italic text-foreground/35 max-w-md leading-[1.55] text-[clamp(0.75rem,0.7rem+0.2vw,0.875rem)]">
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
                  className="absolute inset-0 w-full h-full object-cover img-header transition-transform group-hover:scale-[1.03]"
                  style={{ transitionDuration: "1400ms", transitionTimingFunction: "cubic-bezier(0.45,0,0.15,1)" }}
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
                      className="absolute inset-0 w-full h-full object-cover img-gallery transition-transform group-hover:scale-[1.04]"
                      style={{ transitionDuration: "1400ms", transitionTimingFunction: "cubic-bezier(0.45,0,0.15,1)" }}
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
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono uppercase text-accent/50 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
            Close
          </span>
        </button>
      )}
    </section>
  );
}
