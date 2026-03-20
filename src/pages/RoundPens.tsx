import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CheckCircle, ArrowRight, Phone, Ruler, Shield, Layers, CircleDot } from "lucide-react";
import { siteConfig, services } from "@/data/content";

import coveredArenaLit from "@/assets/covered-arena-finished-lit.jpg";
import arenaSandPrep1 from "@/assets/arena-sand-prep-1.jpg";
import arenaSandPrep2 from "@/assets/arena-sand-prep-2.jpg";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
import roundPenDiagram from "@/assets/round-pen-diagram.png";
import paddockDiagram from "@/assets/paddock-diagram.png";

const serviceData = services.find((s) => s.id === "round-pens")!;

const PRICING_TIERS = [
  {
    name: "Portable Panel Pen",
    diameter: "40–50 ft",
    price: "From $8,000",
    features: [
      "Pre-fabricated steel panels",
      "Easy relocation",
      "Standard gate included",
      "Compacted dirt base",
    ],
  },
  {
    name: "Permanent Round Pen",
    diameter: "50–60 ft",
    price: "From $14,000",
    features: [
      "Concreted post footings",
      "Timber or pipe rail fencing",
      "Engineered footing (sand/fiber)",
      "Drainage grading included",
      "Custom gate placement",
    ],
    popular: true,
  },
  {
    name: "Premium Training Pen",
    diameter: "60–70 ft",
    price: "From $22,000",
    features: [
      "Full engineered base & drainage",
      "Premium fiber-sand footing",
      "Spectator rail or viewing area",
      "Integrated lighting option",
      "Shade structure ready",
      "Adjacent paddock tie-in",
    ],
  },
];

const PADDOCK_PRICING = [
  { label: "Single Paddock (up to ½ acre)", price: "From $5,000" },
  { label: "Multi-Paddock System (2–4)", price: "From $12,000" },
  { label: "Large Turnout Paddock (1+ acre)", price: "From $8,500" },
  { label: "Paddock Shelter Structure", price: "From $4,000" },
];

function PricingCard({ tier }: { tier: typeof PRICING_TIERS[number] }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`relative rounded-xl border p-6 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${
        tier.popular
          ? "border-accent bg-accent/5 ring-2 ring-accent/20"
          : "border-border bg-card"
      }`}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Most Popular
        </span>
      )}
      <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{tier.name}</h3>
      <p className="text-sm text-muted-foreground mb-2">{tier.diameter} diameter</p>
      <p className="text-2xl font-bold text-accent mb-6">{tier.price}</p>
      <ul className="space-y-3 mb-6">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className="w-full" variant={tier.popular ? "default" : "outline"}>
        <Link to={`/contact?services=round-pens`}>Get a Quote</Link>
      </Button>
    </div>
  );
}

function DiagramSection({
  title,
  description,
  image,
  alt,
  reverse,
}: {
  title: string;
  description: string;
  image: string;
  alt: string;
  reverse?: boolean;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-8 items-center transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className={reverse ? "md:order-2" : ""}>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className={`rounded-xl overflow-hidden border border-border bg-secondary/30 ${reverse ? "md:order-1" : ""}`}>
        <img src={image} alt={alt} className="w-full h-auto" loading="lazy" />
      </div>
    </div>
  );
}

export default function RoundPens() {
  return (
    <Layout>
      <StickySubpageCTA
        ctaLabel="Get a Quote"
        ctaIcon={<Phone className="h-4 w-4" />}
        onCtaClick={() => (window.location.href = `/contact?services=round-pens`)}
      />

      <PageHeader
        title="Round Pens & Paddocks"
        description={serviceData.description}
        backgroundImage={coveredArenaLit}
        dividerVariant="contact"
      />

      {/* Features Overview */}
      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="right-to-left" duration={2000} parallaxSpeed={0.06} />
        <div className="section-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Built for Training & Turnout
            </h2>
            <p className="text-muted-foreground">
              Every pen and paddock is purpose-built for natural horsemanship, groundwork, rehabilitation, and safe turnout.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: CircleDot, label: "Custom Diameters", desc: "40–70 ft to suit your discipline" },
              { icon: Layers, label: "Engineered Footing", desc: "Sand, fiber-sand, or rubber options" },
              { icon: Shield, label: "Horse-Safe Design", desc: "No sharp edges, smooth rail joins" },
              { icon: Ruler, label: "Precision Grading", desc: "Proper drainage & crown engineering" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Included features list */}
          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
              What's Included in Every Build
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {serviceData.features.map((f) => (
                <div key={f} className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diagrams */}
      <section className="section-padding bg-secondary/30 relative overflow-hidden">
        <BlueprintBackground image={blueprintDetail} opacity={0.025} direction="bottom-to-top" duration={2400} parallaxSpeed={0.1} />
        <div className="section-container relative z-10 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Design & Layout
            </h2>
            <p className="text-muted-foreground">
              Blueprint-grade planning ensures every pen and paddock fits your property perfectly.
            </p>
          </div>

          <DiagramSection
            title="Round Pen Layout"
            description="Our round pens range from 40 ft portable panel setups to 70 ft permanent training pens with engineered footing. Gate placement, drainage fall, and fence post spacing are all calculated for safety and performance."
            image={roundPenDiagram}
            alt="Round pen blueprint diagram showing dimensions and gate placement"
          />

          <DiagramSection
            title="Paddock Planning"
            description="Paddock systems are designed for safe turnout with shelter integration, water trough placement, and fencing that ties into your broader property layout. We grade for drainage and plan access gates for ease of management."
            image={paddockDiagram}
            alt="Paddock layout blueprint showing shelter, water, and gate positions"
            reverse
          />
        </div>
      </section>

      {/* Gallery strip */}
      <section className="section-padding relative overflow-hidden">
        <div className="section-container relative z-10">
          <h2 className="font-serif text-3xl font-semibold text-foreground text-center mb-8">
            Recent Builds
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { src: coveredArenaLit, alt: "Covered arena at dusk" },
              { src: arenaSandPrep1, alt: "Footing preparation for round pen" },
              { src: arenaSandPrep2, alt: "Arena surface grading" },
            ].map((img) => (
              <div key={img.alt} className="aspect-[4/3] rounded-xl overflow-hidden border border-border">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding bg-secondary/30 relative overflow-hidden">
        <BlueprintLineOverlay variant="dimensions" color="dark" />
        <div className="section-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Round Pen Pricing
            </h2>
            <p className="text-muted-foreground">
              Starting from {serviceData.startingPrice}. Final pricing is determined after on-site consultation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {PRICING_TIERS.map((tier) => (
              <PricingCard key={tier.name} tier={tier} />
            ))}
          </div>

          {/* Paddock Pricing */}
          <div className="max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl font-semibold text-foreground text-center mb-8">
              Paddock Pricing
            </h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {PADDOCK_PRICING.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-6 py-4 ${
                    i < PADDOCK_PRICING.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-foreground font-medium">{item.label}</span>
                  <span className="text-accent font-bold">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding relative overflow-hidden">
        <div className="section-container relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
            Ready to Build?
          </h2>
          <p className="text-muted-foreground mb-8">
            Tell us about your property and training goals. We'll design a round pen or paddock system that fits your space and discipline perfectly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/contact?services=round-pens">
                Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="mr-2 h-4 w-4" /> Call Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
