import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import peBrandSplitHero from "@/assets/pe-brand-split-hero.png";
import { ArrowRight } from "lucide-react";
export default function Index() {
  return (
    <Layout>
      {/* Hero — full-bleed, minimal copy */}
      <section className="relative min-h-[92vh] overflow-hidden flex items-center">
        <img
          src={peBrandSplitHero}
          alt="Peninsula Equine blueprint inspired hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/60" />
        <BlueprintScene
          preset="hero"
          className="absolute inset-0"
          gradient="linear-gradient(180deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.55))"
        />

        <div className="relative z-10 section-container text-primary-foreground">
          <div className="max-w-2xl space-y-6">
            <p className="text-overline text-accent tracking-[0.25em]">Peninsula Equine</p>
            <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] leading-[1.05]">
              From Dirt<br />to Dynasty.
            </h1>
            <p className="text-lg text-primary-foreground/75 max-w-md leading-relaxed">
              World-class equine construction. Fewer decisions, deeper confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.12em] text-xs">
                <Link to="/contact">
                  Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 uppercase tracking-[0.12em] text-xs">
                <Link to="/gallery">View Portfolio</Link>
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Single CTA band */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-xl mx-auto space-y-5">
          <p className="text-overline text-accent">Ready to Build?</p>
          <h2 className="heading-section text-primary-foreground">
            Let's design something that lasts generations.
          </h2>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs">
            <Link to="/contact">
              Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
