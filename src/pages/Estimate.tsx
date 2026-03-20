import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowRight,
  Calculator,
  Info,
  FileText,
  Phone,
  Shield,
  HardHat,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { QuoteCalculator } from "@/components/QuoteCalculator";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import {
  servicePricingTiers,
  type PricingTier,
} from "@/data/servicePricingFaq";

// ── Service category metadata ────────────────────────
const SERVICE_CATEGORIES = [
  { id: "arena-construction", label: "Arenas" },
  { id: "barn-construction", label: "Barns & Stables" },
  { id: "fencing", label: "Fencing" },
  { id: "round-pens", label: "Round Pens" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "renovations", label: "Renovations" },
  { id: "full-facility", label: "Full Facility" },
  { id: "clinics-events", label: "Clinics & Events" },
];

// ── Tier Cards ───────────────────────────────────────
function TierCard({ tier, delay }: { tier: PricingTier; delay: number }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card p-6 flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-lg",
        tier.popular
          ? "border-accent shadow-md ring-1 ring-accent/20"
          : "border-border"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
        {tier.name}
      </h3>
      <div className="mb-2">
        <span className="text-2xl font-serif font-bold text-foreground">
          {tier.price}
        </span>
        <span className="text-xs text-muted-foreground ml-1">AUD ex. GST</span>
      </div>
      <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Button asChild variant={tier.popular ? "default" : "outline"} className="w-full">
        <Link to="/contact">
          Request Assessment <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

// ── Service Tier Section ─────────────────────────────
function ServiceTierSection({
  categoryId,
  label,
}: {
  categoryId: string;
  label: string;
}) {
  const tiers = servicePricingTiers[categoryId];
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  if (!tiers) return null;

  return (
    <div
      ref={ref}
      id={categoryId}
      className={cn(
        "scroll-mt-24 transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
        {label}
      </h2>
      <div className="grid md:grid-cols-3 gap-5">
        {tiers.map((tier, i) => (
          <TierCard key={tier.name} tier={tier} delay={100 + i * 80} />
        ))}
      </div>
    </div>
  );
}

// ── GST & Payment Info ───────────────────────────────
function TaxAndPaymentInfo() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div
          ref={ref}
          className={cn(
            "max-w-4xl mx-auto transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="text-center mb-10">
            <div
              className={cn(
                "w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100",
                isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
              )}
            />
            <h2 className="heading-section text-foreground mb-3">
              Pricing Notes & Payment Terms
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transparent pricing with no hidden fees. Here's how our pricing
              works.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: FileText,
                title: "All Prices Exclude GST",
                description:
                  "Prices shown are exclusive of Australia's 10% Goods & Services Tax. GST will be itemised separately on your formal quote and invoice.",
              },
              {
                icon: Shield,
                title: "Deposit & Milestone Payments",
                description:
                  "Projects require a 20% deposit to secure scheduling. Remaining payments are structured around construction milestones, agreed before work begins.",
              },
              {
                icon: HardHat,
                title: "Council & Permit Fees",
                description:
                  "Council application fees, engineering certifications, and BAL assessments are quoted separately as they vary by municipality and project scope.",
              },
              {
                icon: Info,
                title: "On-Site Consultation",
                description:
                  "All estimates are indicative. Final pricing is provided after a complimentary on-site consultation where Ciro assesses your property, soil, access, and vision.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={cn(
                    "flex gap-4 p-5 rounded-xl border border-border bg-background transition-all duration-500",
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────
function EstimateCTA() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="section-container">
        <div
          ref={ref}
          className={cn(
            "text-center max-w-2xl mx-auto transition-all duration-700",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          <Phone className="h-8 w-8 mx-auto mb-4 opacity-60" />
          <h2 className="heading-section mb-4">
            Ready for an Accurate Quote?
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Every property is unique. Book a free on-site consultation with
            Ciro to get an itemised quote tailored to your land, vision, and
            budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">
                Book Free Consultation{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href="tel:0418585489">Call 0418 585 489</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────
export default function Estimate() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <Layout>
      <PageHeader
        title="Construction Pricing"
        description="Premium equine facility pricing for the Australian market. Use our interactive calculator or browse tiered packages below."
      />

      {/* Jump-nav strip */}
      <section className="border-b border-border bg-card/50 sticky top-16 z-30">
        <div className="section-container">
          <div className="flex overflow-x-auto gap-1 py-2 -mx-2 px-2 no-scrollbar">
            <button
              onClick={() => {
                document
                  .getElementById("calculator")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
            >
              <Calculator className="inline h-3 w-3 mr-1 -mt-0.5" />
              Calculator
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  document
                    .getElementById(cat.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={cn(
                  "shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                  activeCategory === cat.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-accent/20"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section id="calculator" className="section-padding bg-background scroll-mt-24">
        <div className="section-container">
          <QuoteCalculator />
        </div>
      </section>

      {/* GST + Payment Notes */}
      <TaxAndPaymentInfo />

      {/* Tier Pricing by Service */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="font-mono text-xs tracking-widest uppercase text-accent/60 mb-2 block">
              Tier Pricing
            </span>
            <h2 className="heading-section text-foreground mb-3">
              Service Packages
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each service offers three tiers to match your scope and budget. All
              prices in AUD, exclusive of GST.
            </p>
          </div>

          <div className="space-y-16">
            {SERVICE_CATEGORIES.map((cat) => (
              <ServiceTierSection
                key={cat.id}
                categoryId={cat.id}
                label={cat.label}
              />
            ))}
          </div>
        </div>
      </section>

      <EstimateCTA />

      <StickySubpageCTA
        ctaLabel="Request Assessment"
        ctaHref="/contact"
        hideSecondary
      />
    </Layout>
  );
}
