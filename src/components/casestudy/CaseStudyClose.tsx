import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { StartProjectButton } from "@/components/StartProjectButton";

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
    <section ref={ref} className="py-28 sm:py-36 bg-background">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center space-y-10">
        <RevealLine className="mx-auto" width="w-10" />

        <RevealOnScroll direction="up" duration={900}>
          <p className="font-serif text-lg sm:text-xl text-foreground/60 italic">
            {closingLine}
          </p>
        </RevealOnScroll>

        <RevealOnScroll direction="up" delay={400}>
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            style={{
              opacity: ctaReady ? 1 : 0.3,
              transition: "opacity 600ms cubic-bezier(0.45, 0, 0.15, 1)",
            }}
          >
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift"
              onClick={() => trackCtaClick("case_study_start_project")}
            >
              <Link to="/contact">
                Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="uppercase tracking-[0.1em] text-xs">
              <Link to="/gallery">
                <ArrowLeft className="mr-2 h-3 w-3" /> Selected Work
              </Link>
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
