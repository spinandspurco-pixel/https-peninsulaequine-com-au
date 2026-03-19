import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";
import logoPeMark from "@/assets/logo-pe-mark.png";
import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

export default function GroundLockSystems() {
  return (
    <div className="min-h-screen bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/85" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(var(--primary)) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Logo mark */}
        <img
          src={logoPeMark}
          alt="Peninsula Equine"
          className="h-10 w-10 object-contain mb-12 opacity-60"
        />

        {/* Heading */}
        <div className="text-center space-y-4 mb-14 max-w-lg">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.015em] leading-[1.1]">
            P.E. GroundLock™
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary-foreground/30">
            A Ground Stabilisation System
          </p>
          <p className="text-sm sm:text-base text-primary-foreground/45 leading-[1.8] mt-6">
            Engineered to solve ground failure —<br />
            from the bottom up.
          </p>
        </div>

        {/* Interactive layers */}
        <div className="w-full max-w-md mb-14">
          <InteractiveLayerStack />
        </div>

        {/* CTA */}
        <div className="text-center space-y-6">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift px-10 py-3"
          >
            <Link to="/forge">
              Explore Equus Forge <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-primary-foreground/25 text-[10px] tracking-[0.15em]">
            Systems. Components. Built to scale.
          </p>
          <p className="text-primary-foreground/12 text-[9px] tracking-[0.15em] mt-2">
            We take on a limited number of projects each season.
          </p>
        </div>

        {/* Footer brand */}
        <div className="mt-20 text-center space-y-1">
          <p className="text-[10px] tracking-[0.2em] text-primary-foreground/20 uppercase">
            Peninsula Equine
          </p>
          <p className="text-[9px] text-primary-foreground/12 italic tracking-wide">
            Built properly. From the ground up.
          </p>
        </div>
      </div>
    </div>
  );
}
