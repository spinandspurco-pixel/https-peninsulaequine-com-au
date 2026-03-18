import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

const InstallerAccess = () => {
  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative py-32 sm:py-44 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/85" />
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.03]" />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <div
            className="flex items-center justify-center gap-4 mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-10 h-px bg-accent" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
              Installer Program
            </span>
            <div className="w-10 h-px bg-accent" />
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground/95 tracking-tight leading-[1.05] mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both" }}
          >
            GroundLock™<br />Installer Access
          </h1>
          <p
            className="text-sm sm:text-[15px] text-primary-foreground/40 max-w-md mx-auto leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "650ms", animationFillMode: "both" }}
          >
            A controlled system for qualified contractors.
          </p>
        </div>
      </section>

      {/* ═══ WHAT YOU GET ═══════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-10" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/60 mb-6">
              What You Get
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={150}>
            <div className="space-y-8">
              {[
                "Access to the GroundLock™ system methodology",
                "Guidance on correct installation",
                "Ability to implement a proven ground stabilisation system",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-px h-5 bg-accent/40 mt-1 shrink-0" />
                  <p className="text-sm sm:text-[15px] text-foreground/70 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={250}>
            <div className="mt-16 space-y-5 text-sm text-muted-foreground/50 leading-[2]">
              <p>
                This is not general contracting.<br />
                It's a specific system, applied properly.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ EXCLUSIVITY ═══════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.02]" />
        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/30 mx-auto mb-14" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground/90 leading-[1.2] mb-10">
              Limited by Design
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <p className="text-sm sm:text-[15px] text-primary-foreground/40 leading-[2] max-w-md mx-auto mb-6">
              We work with a limited number of installers<br />
              to maintain quality and consistency.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <p className="text-xs text-primary-foreground/25 italic">
              This isn't a franchise. It's a controlled methodology.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════ */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground/90 leading-[1.2] mb-6">
              Enquire About Access
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <p className="text-sm text-muted-foreground/50 leading-relaxed mb-10 max-w-sm mx-auto">
              If you're an experienced contractor interested in the GroundLock™ system,
              get in touch to discuss availability.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift px-10 py-3.5"
            >
              <Link to="/contact">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
};

export default InstallerAccess;
