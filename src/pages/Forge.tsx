import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight, ShoppingCart, Mail, Wrench, Fence, Sparkles, Building2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const quickLinks = [
  { icon: ShoppingCart, label: "Browse Catalog", to: "/shop", desc: "View all steel products" },
  { icon: Mail, label: "Request a Quote", to: "/contact", desc: "Custom fabrication inquiry" },
  { icon: Wrench, label: "Our Services", to: "/services", desc: "Full build capabilities" },
];

const capabilities = [
  { icon: Fence, title: "Gates & Panels", desc: "Swing gates, sliding gates & modular stable panels — sized to your opening, not off the shelf." },
  { icon: Wrench, title: "Steel Fixtures", desc: "Tie-up rails, saddle racks, wash-bay fittings — designed for daily punishment, not weekend use." },
  { icon: Sparkles, title: "Decorative Metalwork", desc: "Laser-cut property signs, ornamental brackets & bespoke embellishments that say 'this is serious horse country'." },
  { icon: Building2, title: "Structural Steel", desc: "I-beam brackets, arena perimeter fencing & load-bearing fabrications — engineered, not guessed." },
];

export default function Forge() {
  const heroAnim = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const capAnim = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const ctaAnim = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  return (
    <Layout>
      {/* Hero */}
      <section
        ref={heroAnim.ref}
        className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-primary text-primary-foreground overflow-hidden"
      >
        {/* Diagonal hatch */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 18px, currentColor 18px, currentColor 19px)",
        }} />
        {/* Horizontal blueprint lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, currentColor 60px, currentColor 61px)",
        }} />

        <div className={`section-container relative z-10 text-center max-w-3xl mx-auto transition-all duration-700 ${
          heroAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-10 bg-accent/50" />
            <Flame className="h-6 w-6 text-accent" />
            <span className="h-px w-10 bg-accent/50" />
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-4 leading-[1.05]">
            The Forge{" "}
            <span className="text-accent">at P.E.</span>
          </h1>

          <p className="text-accent text-sm font-medium uppercase tracking-[0.25em] mb-6">
            Steel With Soul · Forged by Horsemen
          </p>

          <p className="text-primary-foreground/70 text-lg md:text-xl mb-10 max-w-xl mx-auto font-light leading-relaxed">
            We don't just build barns — we bend steel to your will. Every gate, panel, and fixture is
            custom-fabricated by people who know the difference between a paddock latch and a fashion statement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider px-8">
              <Link to="/shop">
                View Catalog <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary uppercase tracking-wider px-8">
              <Link to="/contact">
                Request a Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tagline Strip */}
      <section className="py-6 bg-accent text-accent-foreground">
        <div className="section-container flex items-center justify-center gap-4 text-center">
          <Flame className="h-4 w-4 flex-shrink-0 opacity-70" />
          <p className="font-serif text-lg md:text-xl italic">
            "Heavy gauge. Hot-dip galvanised. Horseman's tolerances."
          </p>
          <Flame className="h-4 w-4 flex-shrink-0 opacity-70" />
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 md:py-24">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl mb-3">What We <span className="text-accent">Forge</span></h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Every piece is built to order — no catalogue sizes, no compromises.</p>
          </div>
          <div
            ref={capAnim.ref}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${
              capAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {capabilities.map((cap) => (
              <div key={cap.title} className="border border-border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow flex flex-col">
                <cap.icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-serif text-lg font-semibold mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="section-container">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl mb-3">Get <span className="text-accent">Started</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex flex-col items-center text-center p-8 rounded-lg border border-border bg-card hover:shadow-lg hover:border-accent/40 transition-all"
              >
                <link.icon className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-serif text-lg font-semibold mb-1">{link.label}</h3>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        ref={ctaAnim.ref}
        className="relative py-20 bg-primary text-primary-foreground overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, currentColor 20px, currentColor 21px)",
        }} />
        <div className={`section-container relative z-10 text-center max-w-2xl mx-auto transition-all duration-700 ${
          ctaAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <Flame className="h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Need Something <span className="text-accent">Bespoke?</span>
          </h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            Send us your specs — no job too big, no detail too small. We'll quote it, forge it, and deliver it to your gate.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider">
            <Link to="/contact">
              Request Custom Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
