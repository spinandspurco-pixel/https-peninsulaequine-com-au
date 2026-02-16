import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Phone, Star } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { ServicePricingCalculator } from "@/components/ServicePricingCalculator";
import { services, siteConfig } from "@/data/content";
import { servicePricingTiers, serviceFaqs } from "@/data/servicePricingFaq";
import { cn } from "@/lib/utils";

import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.id === slug);

  if (!service) return <Navigate to="/services" replace />;

  const tiers = servicePricingTiers[service.id] || [];
  const faqs = serviceFaqs[service.id] || [];

  return (
    <Layout>
      <StickySubpageCTA
        ctaLabel="Get a Quote"
        ctaIcon={<Phone className="h-4 w-4" />}
        onCtaClick={() => (window.location.href = `/contact?services=${service.id}`)}
      />

      <PageHeader
        title={service.title}
        description={service.shortDescription}
        backgroundImage={aberdeenExterior}
        dividerVariant="structural"
      />

      {/* Breadcrumb + back */}
      <section className="bg-background border-b border-border">
        <div className="section-container py-4">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Services
          </Link>
        </div>
      </section>

      {/* About this service */}
      <section className="section-padding bg-background">
        <div className="section-container max-w-4xl">
          <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
            What We Offer
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-6">
            {service.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg mb-8">
            {service.description}
          </p>

          {/* Features list */}
          <ul className="grid sm:grid-cols-2 gap-3">
            {service.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-foreground text-sm">
                <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing tiers */}
      {tiers.length > 0 && (
        <section className="section-padding bg-secondary/30">
          <div className="section-container max-w-5xl">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3 text-center">
              Pricing
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 text-center">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Every project is unique — these tiers give you a starting point. We'll customise to your exact needs.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "relative rounded-xl border bg-card p-6 flex flex-col transition-shadow hover:shadow-lg",
                    tier.popular
                      ? "border-accent shadow-md ring-1 ring-accent/20"
                      : "border-border"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                        <Star className="h-3 w-3" /> Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-2xl font-bold text-accent mb-2">{tier.price}</p>
                  <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={tier.popular ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      tier.popular && "bg-accent text-accent-foreground hover:bg-accent/90"
                    )}
                  >
                    <Link to={`/contact?services=${service.id}&ref=tier-${tier.name.toLowerCase()}`}>
                      Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing calculator */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <ServicePricingCalculator serviceId={service.id} />
        </div>
      </section>

      {/* FAQs with inline inquiry CTA */}
      {faqs.length > 0 && (
        <section className="section-padding bg-background">
          <div className="section-container max-w-3xl">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3 text-center">
              Common Questions
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-8 text-center">
              {service.title} FAQ
            </h2>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-lg border border-border bg-card px-5"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Quick inquiry CTA below FAQ */}
            <div className="mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 sm:p-8 text-center">
              <p className="font-serif text-lg font-semibold text-foreground mb-2">
                Still have questions about {service.title.toLowerCase()}?
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                Send us a quick message and we'll get back to you within 1–2 business days.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to={`/contact?services=${service.id}&ref=faq`}>
                    Ask a Question <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${siteConfig.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="section-container text-center max-w-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/60 mb-8">
            Tell us about your project and we'll prepare a personalised quote within 1–2 business days.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to={`/contact?services=${service.id}`}>
                Request a Quote <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
