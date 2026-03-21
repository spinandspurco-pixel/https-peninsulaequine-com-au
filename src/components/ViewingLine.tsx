import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import viewingLineBg from "@/assets/viewing-line-bg.jpg";

export function ViewingLine() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[80vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background image — soft blur */}
      <div className="absolute inset-0">
        <img
          src={viewingLineBg}
          alt=""
          className="w-full h-full object-cover scale-105 blur-[2px]"
          loading="lazy"
        />
      </div>

      {/* Warm gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            hsl(var(--background) / 0.6) 0%,
            hsl(30 25% 8% / 0.65) 40%,
            hsl(var(--background) / 0.8) 100%
          )`,
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Label */}
        <div
          className="flex items-center justify-center gap-5 mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1000ms ease-out 200ms",
          }}
        >
          <div className="w-8 h-px bg-accent/30" />
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/40 font-mono">
            The Viewing Line
          </p>
          <div className="w-8 h-px bg-accent/30" />
        </div>

        {/* Heading */}
        <h2
          className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-[0.03em] mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1200ms ease-out 400ms",
          }}
        >
          Stand above it all.
        </h2>

        {/* Subtext */}
        <p
          className="font-serif text-base sm:text-lg italic text-muted-foreground/50 leading-relaxed mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1200ms ease-out 700ms",
          }}
        >
          Every line, every movement, every decision — visible from here.
        </p>

        {/* CTA */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1000ms ease-out 1000ms",
          }}
        >
          <Button asChild variant="gold" size="lg">
            <Link to="/contact">
              Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
