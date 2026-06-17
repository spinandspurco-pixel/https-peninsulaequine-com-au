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
    <section ref={ref} className="py-36 sm:py-52 bg-background">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center space-y-14">
        <RevealLine className="mx-auto" width="w-10" />

        <RevealOnScroll direction="up" duration={900}>
          <p className="font-serif text-xl sm:text-2xl lg:text-[1.65rem] text-foreground/70 italic leading-[1.45] tracking-[-0.005em]">
            {closingLine}
          </p>
        </RevealOnScroll>

        <RevealOnScroll direction="none" duration={1200} delay={600}>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.5em] italic"
            style={{ color: "hsl(var(--muted-foreground) / 0.18)" }}
          >
            From Dirt to Dynasty
          </p>
        </RevealOnScroll>

        {/* Minimal text-link CTAs — no boxes */}
        <RevealOnScroll direction="up" delay={400}>
          <div
            className="flex flex-col sm:flex-row gap-8 sm:gap-14 justify-center items-center pt-4"
            style={{
              opacity: ctaReady ? 1 : 0.25,
              transition: "opacity 800ms cubic-bezier(0.45, 0, 0.15, 1)",
              pointerEvents: ctaReady ? "auto" : "none",
            }}
          >
            <Link
              to="/apply"
              className="group inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/70 hover:text-foreground transition-colors duration-500"
            >
              <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
              Apply to Build
            </Link>
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/40 hover:text-foreground/80 transition-colors duration-500"
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
