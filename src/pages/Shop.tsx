import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Droplets, Gem } from "lucide-react";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { InteractiveLayerStack } from "@/components/InteractiveLayerStack";

import heroVideo from "@/assets/videos/hero-blueprint-gold.mp4";

const APPLICATIONS = [
  { title: "Front Gate Entries", desc: "Engineered for the first 20 metres — where floats, trucks, and daily traffic meet the property." },
  { title: "Float & Truck Access", desc: "Stabilised surfaces designed for repeated heavy vehicle turning and braking loads." },
  { title: "Estate Driveways", desc: "Premium arrival zones that perform under load while maintaining architectural finish." },
  { title: "High-Traffic Zones", desc: "Stable entries, wash bays, and service paths built for continuous daily use." },
];

const PROOF = [
  { icon: Truck, title: "Traffic-Ready", body: "Built for floats, trucks, and repeated front-entry movement where ordinary surfaces break down." },
  { icon: Droplets, title: "Drainage-Led", body: "Supports water movement beneath the finish to reduce rutting and long-term surface instability." },
  { icon: Gem, title: "Architectural Finish", body: "Pairs engineered performance with a resolved entry outcome — stone, gravel, or cobble specification." },
];

export default function Shop() {
  return (
    <Layout>
      {/* ═══ 1. CINEMATIC HERO ═══════════════════════════════ */}
      <section className="relative min-h-[80vh] overflow-hidden flex items-center justify-center">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover img-hero"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/60" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 45% at 50% 50%, transparent 10%, hsl(var(--background)) 100%)" }}
        />
        <div className="absolute inset-0 grain-hero" />

        <div className="relative z-10 section-container text-center max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-8 sm:gap-10">
            <div
              className="flex items-center gap-5"
              style={{ opacity: 0, animation: "heroFadeIn 300ms ease-out 100ms forwards" }}
            >
              <div className="w-10 h-px bg-accent/20" />
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/50">GroundLock Systems</p>
              <div className="w-10 h-px bg-accent/20" />
            </div>

            <h1
              className="font-serif font-bold text-foreground leading-[0.9] tracking-[-0.01em]"
              style={{
                opacity: 0,
                animation: "heroFadeIn 300ms ease-out 250ms forwards",
                fontSize: "clamp(2.5rem, 1.2rem + 5.5vw, 5.5rem)",
              }}
            >
              Engineered Ground<br className="hidden sm:block" /> Systems
            </h1>

            <p
              className="text-muted-foreground/30 text-[11px] sm:text-[12px] tracking-[0.2em] uppercase max-w-md leading-[2.2]"
              style={{ opacity: 0, animation: "heroFadeIn 300ms ease-out 450ms forwards" }}
            >
              Proprietary infrastructure for entries, driveways, and high-traffic zones — specified per project.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              style={{ opacity: 0, animation: "heroFadeIn 300ms ease-out 600ms forwards" }}
            >
              <Button asChild variant="gold" size="lg" className="px-8">
                <Link to="/site-assessment">
                  Request a Quote <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-transparent border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/25 hover:bg-foreground/[0.03] transition-all duration-700 px-8">
                <Link to="/groundlock">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. SYSTEM BREAKDOWN ═════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture opacity-30" />

          <div className="section-container relative z-10 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              {/* Visual */}
              <RevealOnScroll direction="up">
                <InteractiveLayerStack />
              </RevealOnScroll>

              {/* Copy */}
              <div>
                <RevealOnScroll direction="up" delay={100}>
                  <RevealLine className="mb-8" width="w-8" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-5">The System</p>
                  <h2 className="heading-section text-foreground mb-6 leading-[1.15]">
                    Five Layers.<br />One Resolved Surface.
                  </h2>
                  <p className="text-[14px] text-muted-foreground/45 leading-[2] mb-6 max-w-[360px]">
                    GroundLock is a multi-layer ground stabilisation system — engineered
                    beneath the surface for drainage, load distribution, and long-term performance
                    under real daily use.
                  </p>
                  <p className="text-[11px] text-muted-foreground/20 italic tracking-[0.04em]">
                    What sits underneath determines what lasts above.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. PROOF — WHY IT WORKS ═════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />

          <div className="section-container relative z-[1] max-w-5xl mx-auto">
            <div className="text-center mb-16 sm:mb-20">
              <RevealOnScroll direction="up">
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40 mb-4">Performance</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground/80 leading-[1.25] max-w-lg mx-auto">
                  Engineered for the Way Properties Actually Work
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border/8">
              {PROOF.map((card, i) => (
                <RevealOnScroll key={card.title} direction="up" stagger={i} staggerInterval={100}>
                  <div className="bg-background p-8 sm:p-10 min-h-[240px] flex flex-col">
                    <card.icon className="w-[18px] h-[18px] text-muted-foreground/20 mb-7" strokeWidth={1.5} />
                    <h3 className="font-serif text-[15px] font-medium text-foreground/60 tracking-[0.02em] mb-4">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-muted-foreground/30 leading-[2] max-w-[260px]">
                      {card.body}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. APPLICATIONS ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-20" />

          <div className="section-container relative z-[1] max-w-5xl mx-auto">
            <div className="mb-16 sm:mb-20">
              <RevealOnScroll direction="up">
                <RevealLine className="mb-8" width="w-8" />
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-4">Applications</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground/80 leading-[1.25] max-w-lg">
                  Where GroundLock Is Specified
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {APPLICATIONS.map((app, i) => (
                <RevealOnScroll key={app.title} direction="up" stagger={i} staggerInterval={80}>
                  <div className="p-8 sm:p-10 border border-border/15">
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/25 mb-5 block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif text-[17px] font-medium text-foreground/65 tracking-[0.02em] mb-4">
                      {app.title}
                    </h3>
                    <p className="text-[12px] text-muted-foreground/30 leading-[2] max-w-[300px]">
                      {app.desc}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. CTA ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="absolute inset-0 grain-texture" />

          <div className="section-container relative z-10 text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-12" width="w-8" />
              <h2 className="heading-section text-foreground mb-6 leading-[1.1]">
                Start with a Site Assessment.
              </h2>
              <p className="text-[13px] text-muted-foreground/30 mb-10 leading-[2] max-w-[360px] mx-auto">
                Every GroundLock specification begins on site. We assess conditions,
                usage, and requirements before recommending a system.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={150}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Button asChild variant="gold" size="lg" className="px-8">
                  <Link to="/site-assessment">
                    Start a Project <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-transparent border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/25 hover:bg-foreground/[0.03] transition-all duration-700 px-8">
                  <Link to="/contact">Talk to Us</Link>
                </Button>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={250}>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {["No obligation", "Project-assessed specification", "Engineered for decades"].map((line) => (
                  <div key={line} className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-accent/25" strokeWidth={1.5} />
                    <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/25">{line}</span>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </Layout>
  );
}
