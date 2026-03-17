import { Layout } from "@/components/layout/Layout";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import peBrandSplitHero from "@/assets/pe-brand-split-hero.png";
import peRopeRing from "@/assets/pe-rope-ring.png";
import peBlueprintBarnPoster from "@/assets/pe-blueprint-barn-poster.png";
import peBlueprintDoorDetailPoster from "@/assets/pe-blueprint-door-detail-poster.png";
import peHatCloseup from "@/assets/pe-hat-embroidered-closeup.png";

const pillars = [
  {
    title: "Design for the Horse",
    body: "Layouts begin with horse movement, airflow, and safe daily handling.",
  },
  {
    title: "Build for Generations",
    body: "Structural systems and material choices are engineered for long-life performance.",
  },
  {
    title: "Craft Over Convenience",
    body: "Traditional craftsmanship meets modern precision and disciplined project delivery.",
  },
];

export default function Index() {
  return (
    <Layout>
      <FloatingContactButton />

      <section className="relative min-h-[90vh] overflow-hidden">
        <img
          src={peBrandSplitHero}
          alt="Peninsula Equine blueprint inspired hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/65" />
        <BlueprintScene
          preset="hero"
          className="absolute inset-0"
          gradient="linear-gradient(180deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.58))"
        />

        <div className="relative z-10 section-container section-padding-lg text-primary-foreground">
          <div className="max-w-3xl stack-md">
            <p className="text-overline text-accent">Peninsula Equine</p>
            <h1 className="heading-display text-primary-foreground">From Dirt to Dynasty.</h1>
            <p className="text-body-lg text-primary-foreground/80 max-w-2xl">
              We simplified the experience to give clear decisions, fewer distractions, and deeper project confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/contact">Start Your Project</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/35 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/process">See the Build Process</Link>
              </Button>
            </div>
          </div>
          <img src={peRopeRing} alt="Peninsula Equine rope emblem" className="mt-12 h-32 w-32 animate-rope-drift" loading="lazy" />
        </div>
      </section>

      <section className="section-padding-lg">
        <div className="section-container grid-cards">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="surface-card card-hover-glow">
              <CardContent className="p-7 stack-sm">
                <p className="text-overline">Core Principle</p>
                <h2 className="heading-card">{pillar.title}</h2>
                <p className="text-body">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-padding-lg bg-secondary/20">
        <div className="section-container stack-lg">
          <div className="max-w-2xl stack-sm">
            <p className="text-overline">Live Blueprint Experience</p>
            <h2 className="heading-section">Construction drawings come to life as you scroll.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg border border-border min-h-[420px]">
              <img src={peBlueprintBarnPoster} alt="Horse barn blueprint visual" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <BlueprintScene
                layers={[{ image: "elevation", opacity: 0.07, parallaxSpeed: 0.05 }, { image: "detail", opacity: 0.05, direction: "right-to-left", parallaxSpeed: 0.08 }]}
                lineOverlays={[{ variant: "dimensions", color: "light" }]}
                className="absolute inset-0"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border min-h-[420px]">
              <img src={peBlueprintDoorDetailPoster} alt="Custom forged door hardware blueprint" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <BlueprintScene
                layers={[{ image: "door-detail", opacity: 0.1, parallaxSpeed: 0.06 }]}
                lineOverlays={[{ variant: "detail", color: "light" }]}
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding-lg">
        <div className="section-container grid gap-8 lg:grid-cols-2 items-center">
          <div className="stack-sm">
            <p className="text-overline">Brand Gear</p>
            <h2 className="heading-section">Wear the build philosophy.</h2>
            <p className="text-body max-w-lg">We’ve integrated hat and merchandise storytelling into the cleaner flow so brand, craftsmanship, and project trust all align.</p>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit">
              <Link to="/shop">Explore Forge Store</Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <img src={peHatCloseup} alt="Peninsula Equine embroidered cap" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>
    </Layout>
  );
}
