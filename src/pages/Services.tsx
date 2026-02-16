import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Phone, Images, BarChart3, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintScene } from "@/components/BlueprintScene";
import { QuickQuoteModal } from "@/components/QuickQuoteModal";
import { QuoteCalculator } from "@/components/QuoteCalculator";
import { ServiceDetailSections } from "@/components/ServiceDetailSections";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { services, siteConfig } from "@/data/content";
import { servicePricingTiers } from "@/data/servicePricingFaq";

// Service card images
import equitanaArena from "@/assets/equitana-arena-1.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import qldFacilityConstruction from "@/assets/qld-facility-construction.jpg";
import qldFacilityCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";

const serviceImages: Record<string, string> = {
  "arena-construction": equitanaArena,
  "barn-construction": aberdeenBarnInterior,
  "fencing": aberdeenStalls,
  "infrastructure": qldFacilityConstruction,
  "round-pens": qldFacilityCourtyard,
  "renovations": mainRidgeCiroWoodwork,
  "full-facility": qldFacilityConstruction,
  "clinics-events": equitanaArena,
};

/* ── Service Card ─────────────────────────────────────── */

function ServiceOverviewCard({
  service,
  index,
  onQuoteClick,
}: {
  service: { id: string; title: string; shortDescription: string; features: string[]; startingPrice: string };
  index: number;
  onQuoteClick: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const tiers = servicePricingTiers[service.id] || [];

  return (
    <div
      ref={ref}
      className={`group rounded-xl border border-border bg-card overflow-hidden transition-all duration-700 hover:shadow-lg hover:border-accent/30 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={serviceImages[service.id] || equitanaArena}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Starting at</p>
          <p className="font-serif text-2xl font-bold text-foreground drop-shadow-sm">
            {service.startingPrice}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
          {service.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {service.shortDescription}
        </p>

        {/* Quick features */}
        <ul className="space-y-1.5 mb-5">
          {service.features.slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
              <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
          {service.features.length > 3 && (
            <li className="text-[11px] text-muted-foreground pl-5">
              +{service.features.length - 3} more included
            </li>
          )}
        </ul>

        {/* Tier summary */}
        {tiers.length > 0 && (
          <div className="flex gap-1.5 mb-5">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex-1 text-center rounded-md py-1.5 px-1 border transition-colors ${
                  tier.popular
                    ? "bg-accent/10 border-accent/30"
                    : "bg-background border-border"
                }`}
              >
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                  {tier.name}
                </p>
                <p className={`font-serif text-xs font-bold leading-tight ${
                  tier.popular ? "text-accent" : "text-foreground"
                }`}>
                  {tier.price}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/services/${service.id}`)}
            className="flex-1 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
            size="sm"
          >
            Learn More
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => {
              trackCtaClick("get_a_quote", { source: "services_overview", service: service.id });
              onQuoteClick(service.id);
            }}
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Quote
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────── */

export default function Services() {
  const [quoteServiceId, setQuoteServiceId] = useState<string | null>(null);
  const activeService = services.find((s) => s.id === quoteServiceId);

  // Fetch dynamic services from database, fall back to hardcoded
  const { data: dbServices } = useQuery({
    queryKey: ["managed-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_services")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error || !data?.length) return null;
      return data;
    },
    staleTime: 60_000,
  });

  const displayServices = useMemo(() => {
    if (dbServices?.length) {
      return dbServices.map((s) => ({
        id: s.slug,
        title: s.title,
        shortDescription: s.short_description || "",
        description: s.description || "",
        features: s.features || [],
        startingPrice: s.starting_price || "Contact Us",
        icon: s.icon || "arena",
      }));
    }
    return services;
  }, [dbServices]);

  return (
    <Layout>
      <PageHeader
        title="Our Services"
        description="From custom arenas to complete barn construction, we deliver equine facilities built to last. Every project reflects our commitment to quality and our understanding of what horses—and their owners—truly need."
      />

      {/* Services Grid */}
      <section className="section-padding bg-background relative overflow-hidden">
        <BlueprintScene preset="facility" />

        <div className="section-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
              What We Build
            </p>
            <h2 className="heading-section text-foreground mb-3">
              Investment Guide
            </h2>
            <p className="text-muted-foreground text-sm">
              Every project is custom-quoted after an on-site consultation. Below are starting points to help you plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, index) => (
              <ServiceOverviewCard
                key={service.id}
                service={service}
                index={index}
                onQuoteClick={setQuoteServiceId}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground">
              All pricing is indicative. Final quotes are provided after a free on-site consultation.
            </p>
          </div>
        </div>
      </section>

      {/* Service Detail Sections */}
      <ServiceDetailSections />

      {/* Quote Calculator */}
      <section className="section-padding bg-card">
        <div className="section-container">
          <QuoteCalculator />
        </div>
      </section>

      {/* CTA */}
      <ParallaxCTA
        title="Let's Discuss Your Project"
        description="Every great facility starts with a conversation. Tell us about your vision, and we'll show you how to make it reality."
        backgroundImage={mainRidgeBarnFrame}
        primaryButtonText="Get a Free Quote"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />

      {/* Quick Quote Modal */}
      <QuickQuoteModal
        open={!!quoteServiceId}
        onOpenChange={(open) => { if (!open) setQuoteServiceId(null); }}
        serviceId={quoteServiceId || ""}
        serviceTitle={activeService?.title || ""}
        startingPrice={activeService?.startingPrice}
      />
    </Layout>
  );
}
