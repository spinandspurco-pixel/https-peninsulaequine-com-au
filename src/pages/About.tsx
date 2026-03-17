import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { aboutCiro } from "@/data/content";

import ciroWithHorse from "@/assets/ciro-with-horse.png";
import horseAction from "@/assets/horse-action.png";

export default function About() {
  useEffect(() => {
    document.title = "About | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-primary/75" />
        <BlueprintScene preset="elevation" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <p className="text-overline text-accent tracking-[0.25em] opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>Our Story</p>
          <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] opacity-0 animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
            About Us
          </h1>
          <p className="text-primary-foreground/70 text-lg opacity-0 animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "both" }}>
            Construction expertise meets genuine horsemanship.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 sm:py-28">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto">
            <RevealOnScroll direction="left" duration={900}>
              <div className="relative">
                <div className="aspect-[4/5] rounded-lg overflow-hidden">
                  <img
                    src={ciroWithHorse}
                    alt="Ciro Parisella, founder of Peninsula Equine"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-accent/30 rounded-lg -z-10" />
              </div>
            </RevealOnScroll>
            <div>
              <RevealLine className="mb-7" width="w-14" />
              <RevealOnScroll direction="up" delay={100}>
                <h2 className="heading-section text-foreground mb-1">{aboutCiro.name}</h2>
                <p className="text-accent font-medium mb-6 text-sm">{aboutCiro.title}</p>
              </RevealOnScroll>
              <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                {aboutCiro.bio.map((p, i) => (
                  <RevealOnScroll key={i} direction="up" stagger={i + 1} staggerInterval={120}>
                    <p>{p}</p>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-24 sm:py-32 bg-background relative grain-texture overflow-hidden">
        <div className="section-container max-w-2xl mx-auto text-center space-y-8 relative z-[1]">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="heading-section text-foreground">Our Approach</h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <div className="space-y-5 text-sm sm:text-base text-muted-foreground leading-[1.9] max-w-lg mx-auto">
              <p>
                We don't separate design from construction.<br />
                Every decision — from ground preparation to final finish —<br />
                is considered as part of a complete system.
              </p>
              <p className="text-foreground/50 italic">
                Because when it's done properly,<br />
                everything works together.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card">
        <div className="section-container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <RevealLine className="mx-auto mb-7" width="w-12" />
            <RevealOnScroll direction="up" delay={100}>
              <h2 className="heading-section text-foreground mb-3">Our Values</h2>
              <p className="text-muted-foreground text-sm">
                The principles behind every build.
              </p>
            </RevealOnScroll>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutCiro.values.map((value, i) => (
              <RevealOnScroll key={value.title} direction="up" stagger={i} staggerInterval={120}>
                <div className="group text-center p-6 rounded-lg border border-border bg-background transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-mono mb-3">0{i + 1}</p>
                  <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Image break */}
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden">
        <img
          src={horseAction}
          alt="Horse and rider training in a Peninsula Equine arena"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <RevealOnScroll direction="scale" duration={900}>
            <blockquote className="text-center max-w-xl px-6">
              <p className="font-serif text-xl sm:text-2xl text-primary-foreground italic leading-relaxed drop-shadow-lg">
                "When you understand how a horse thinks and moves, you build facilities
                that work with their nature, not against it."
              </p>
              <footer className="mt-3 text-accent font-medium text-sm">— Ciro</footer>
            </blockquote>
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="absolute inset-8 border border-accent/[0.06] pointer-events-none" aria-hidden="true" />
        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-5">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground">
              Let's build something <span className="text-accent">great.</span>
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs btn-hover-lift">
              <Link to="/contact">
                Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
