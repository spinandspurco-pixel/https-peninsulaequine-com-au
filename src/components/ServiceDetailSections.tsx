import { CheckCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { services } from "@/data/content";
import { servicePricingTiers, serviceFaqs, type PricingTier } from "@/data/servicePricingFaq";

/* ── Pricing notes panel ──────────────────────────────── */

export function PricingNotesPanel() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`rounded-lg border border-accent/20 bg-accent/5 p-6 sm:p-8 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
        Important Pricing Notes
      </h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {[
          "All prices shown are starting estimates for typical projects. Your final quote will reflect site-specific conditions, materials, and scope.",
          "Every project begins with a free on-site consultation where Ciro personally assesses your property and goals.",
          "We provide detailed, itemised quotes—no hidden costs, no surprise extras.",
          "Staged payment plans are available for larger builds. A deposit secures your position in our build schedule.",
          "Prices are in AUD and exclude GST unless stated otherwise. Council permit fees are quoted separately.",
        ].map((note, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="text-accent font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
            <span className="leading-relaxed">{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Single tier card ─────────────────────────────────── */

function TierCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={`rounded-lg border p-5 sm:p-6 transition-all duration-300 ${
        tier.popular
          ? "border-accent/40 bg-accent/5 shadow-md ring-1 ring-accent/10"
          : "border-border bg-card"
      }`}
    >
      {tier.popular && (
        <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-accent font-medium mb-2">
          Most Popular
        </span>
      )}
      <h4 className="font-serif text-lg font-semibold text-foreground">{tier.name}</h4>
      <p className="font-serif text-2xl font-bold text-accent mt-1">{tier.price}</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{tier.description}</p>
      <ul className="space-y-1.5">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
            <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Single service detail block ──────────────────────── */

function ServiceDetailBlock({ service, index }: {
  service: typeof services[number];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.05 });
  const tiers = servicePricingTiers[service.id] || [];
  const faqs = serviceFaqs[service.id] || [];

  return (
    <div
      ref={ref}
      id={service.id}
      className={`scroll-mt-24 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Divider */}
      {index > 0 && <div className="w-full h-px bg-border mb-12" />}

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
        {/* Left: title & description */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="text-accent font-mono text-xs tracking-[0.3em] block mb-2">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
            {service.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            {service.description}
          </p>
          <p className="text-xs text-muted-foreground/70 italic">
            Starting from <span className="text-accent font-semibold not-italic">{service.startingPrice}</span>
          </p>
        </div>

        {/* Right: tiers + FAQ */}
        <div className="space-y-8">
          {/* Tier cards */}
          {tiers.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <TierCard key={tier.name} tier={tier} />
              ))}
            </div>
          )}

          {/* FAQ accordion */}
          {faqs.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Common Questions
              </p>
              <Accordion type="single" collapsible className="space-y-1">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`${service.id}-faq-${i}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium text-foreground hover:text-accent py-3">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── All service detail sections ──────────────────────── */

export function ServiceDetailSections() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
            Detailed Breakdown
          </p>
          <h2 className="heading-section text-foreground mb-3">
            Service Tiers & Pricing
          </h2>
          <p className="text-muted-foreground text-sm">
            Each service includes tiered options so you can match scope and budget. All pricing is indicative—your final quote is tailored after consultation.
          </p>
        </div>

        <div className="space-y-12">
          {services.map((service, index) => (
            <ServiceDetailBlock key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Pricing notes */}
        <div className="mt-16">
          <PricingNotesPanel />
        </div>
      </div>
    </section>
  );
}
