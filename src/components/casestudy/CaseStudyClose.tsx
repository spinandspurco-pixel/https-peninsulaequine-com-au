import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Props {
  closingLine: string;
}

export function CaseStudyClose({ closingLine }: Props) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.4 });
  const [ctaReady, setCtaReady] = useState(false);

  /* 2-second readiness delay after section enters view */
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setCtaReady(true), 2000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <section ref={ref} className="py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background">
      <div className="max-w-3xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(2.5rem,1.5rem+3vw,3.5rem)]">
        <RevealLine className="mx-auto" width="w-10" />

        <RevealOnScroll direction="up" duration={900}>
          <p className="font-serif text-foreground/70 italic leading-[1.45] tracking-[-0.005em] text-[clamp(1.125rem,0.9rem+1vw,1.65rem)]">
            {closingLine}
          </p>
        </RevealOnScroll>

        <RevealOnScroll direction="none" duration={1200} delay={600}>
          <p
            className="font-mono uppercase italic text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]"
            style={{ color: "hsl(var(--muted-foreground) / 0.18)" }}
          >
            From Dirt to Dynasty
          </p>
        </RevealOnScroll>

        {/* Minimal text-link CTAs — no boxes */}
        <RevealOnScroll direction="up" delay={400}>
          <div
            className="flex flex-col sm:flex-row gap-[clamp(1.75rem,1rem+2vw,3.5rem)] justify-center items-center pt-4"
            style={{
              opacity: ctaReady ? 1 : 0.25,
              transition: "opacity 800ms cubic-bezier(0.45, 0, 0.15, 1)",
              pointerEvents: ctaReady ? "auto" : "none",
            }}
          >
            <Link
              to="/apply"
              className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]"
            >
              <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
              Apply to Build
            </Link>
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/40 hover:text-foreground/80 transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]"
            >
              Selected Work
              <span className="w-6 h-px bg-foreground/20 transition-all duration-700 group-hover:w-12 group-hover:bg-foreground/60" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
