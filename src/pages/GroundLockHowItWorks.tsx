import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockProductEducation } from "@/components/groundlock/GroundLockProductEducation";
import { PanelSpecimen, SystemDiagram, LockSequence } from "@/components/groundlock/GroundLockSystemSVG";
import groundlockCutaway from "@/assets/groundlock-cutaway.jpg";
import { ArrowRight } from "lucide-react";

export default function GroundLockHowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-36 sm:pt-44 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="section-container relative z-10 max-w-3xl mx-auto text-center">
          <div
            className="flex items-center justify-center gap-4 mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <div className="w-8 h-px bg-accent/30" />
            <p className="text-overline text-accent/50">Technical Deep-Dive</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground mb-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            How It Works
          </h1>

          <p
            className="text-[13px] text-muted-foreground/40 leading-[1.7] max-w-md mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Stronger by geometry, not by mass. Explore the engineering behind the GroundLock™ system.
          </p>
        </div>
      </section>

      {/* Interactive Education Module */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <GroundLockProductEducation />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* System Architecture Detail */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-4xl mx-auto relative z-[1]">
            <div className="text-center mb-14 sm:mb-20">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-10" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-5">System Architecture</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground mb-4">
                  The Panel → The Lock → The System
                </h2>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={160}>
                <p className="text-[13px] text-muted-foreground/32 leading-[1.7] max-w-md mx-auto">
                  Crown into opening. Tab into slot. A unified field that resists movement in every direction.
                </p>
              </RevealOnScroll>
            </div>

            <div className="space-y-16 sm:space-y-20">
              <PanelSpecimen />
              <div className="w-10 h-px bg-accent/8 mx-auto" />
              <LockSequence />
              <div className="w-10 h-px bg-accent/8 mx-auto" />
              <SystemDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* Cutaway */}
      <section className="relative overflow-hidden">
        <div className="py-16 sm:py-24 bg-card/50 relative border-t border-border/8">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto relative z-[1]">
            <RevealOnScroll direction="up">
              <img
                src={groundlockCutaway}
                alt="GroundLock system cutaway — surface layer, interlocking panel system, and prepared sub-base"
                className="w-full h-auto rounded-sm"
                loading="lazy"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1] text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <p className="font-serif text-xl sm:text-2xl text-foreground/50 italic tracking-wide leading-relaxed mb-8">
                Ready to start your project?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/site-assessment">
                  <Button variant="gold" size="lg">
                    Request System Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/groundlock">
                  <Button variant="outline" className="border-accent/15 text-accent/60 hover:bg-accent/5 hover:border-accent/25 text-xs tracking-[0.2em] uppercase font-mono h-12 px-8">
                    Back to GroundLock
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
