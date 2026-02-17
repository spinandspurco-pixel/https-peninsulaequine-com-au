import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintScene } from "@/components/BlueprintScene";
import { trackCtaClick } from "@/hooks/useCtaTracking";

import heroVideo from "@/assets/videos/main-ridge-woodwork-1.mp4";
import peLogo from "@/assets/pe-logo-new.png";

export function HeroSection() {
  const handleQuoteClick = () => {
    trackCtaClick("hero_get_quote");
    document.getElementById("free-quote")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-primary">
      <video
        autoPlay muted loop playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/70" />
      <BlueprintScene preset="hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--primary))_85%)]" />

      <div className="relative z-10 text-center px-6">
        <img
          src={peLogo}
          alt="Peninsula Equine"
          loading="eager"
          className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8 drop-shadow-[0_4px_30px_hsl(var(--accent)/0.3)]"
        />
        <div className="w-16 h-px mx-auto mb-8 bg-accent" />
        <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[0.25em] uppercase text-primary-foreground leading-[1.3] mb-4">
          Peninsula <span className="text-accent">Equine</span>
        </h1>
        <p className="font-sans text-xs sm:text-sm tracking-[0.4em] uppercase text-primary-foreground/50 mb-3">
          From Dirt to Dynasty
        </p>
        <p className="text-sm sm:text-base text-primary-foreground/70 max-w-lg mx-auto mb-8 leading-relaxed">
          World-class arenas, barns &amp; facilities — designed by a horseman, built to last.
        </p>

        {/* Primary CTA cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Button
            size="lg"
            variant="gold"
            className="text-sm px-10"
            onClick={handleQuoteClick}
          >
            Get a Free Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            asChild
            variant="outline-light"
            size="lg"
            className="text-sm px-10"
          >
            <Link to="/services">View Our Work</Link>
          </Button>
        </div>

        {/* Secondary micro-CTA */}
        <a
          href="tel:0412345678"
          onClick={() => trackCtaClick("hero_call_now")}
          className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-accent text-xs tracking-widest uppercase transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          Or Call Us Now
        </a>
      </div>

      <button
        onClick={() => document.getElementById("about-teaser")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors cursor-pointer"
        aria-label="Scroll to content"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}
