import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Phone, HelpCircle, Filter, CalendarIcon, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintScene } from "@/components/BlueprintScene";
import { QuickQuoteModal } from "@/components/QuickQuoteModal";
import { QuoteCalculator } from "@/components/QuoteCalculator";
import { ServiceDetailSections } from "@/components/ServiceDetailSections";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { cn } from "@/lib/utils";
import { services, siteConfig } from "@/data/content";
import { servicePricingTiers, serviceFaqs } from "@/data/servicePricingFaq";

// Service card images
import equitanaArena from "@/assets/equitana-arena-1.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import qldFacilityConstruction from "@/assets/qld-facility-construction.jpg";
import qldFacilityCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";

/* ── Category filters ─────────────────────────────────── */

const SERVICE_CATEGORIES = [
  { key: "all", label: "All Services" },
  { key: "arenas", label: "Arenas & Pens", ids: ["arena-construction", "round-pens"] },
  { key: "structures", label: "Barns & Structures", ids: ["barn-construction", "full-facility"] },
  { key: "site", label: "Site & Infrastructure", ids: ["fencing", "infrastructure"] },
  { key: "other", label: "Events & Renovations", ids: ["renovations", "clinics-events"] },
] as const;

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

/* ── Pricing Block ────────────────────────────────────── */

function PricingTiersBlock({ serviceId }: { serviceId: string }) {
  const tiers = servicePricingTiers[serviceId] || [];
  if (!tiers.length) return null;

  return (
    <div className="mb-5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-medium">
        Investment Tiers
      </p>
      <div className="space-y-2">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "rounded-lg border p-3 transition-all",
              tier.popular
                ? "border-accent/40 bg-accent/[0.06] ring-1 ring-accent/10"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  tier.popular ? "text-accent" : "text-foreground"
                )}>
                  {tier.name}
                </h4>
                {tier.popular && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[8px] font-bold uppercase tracking-widest">
                    <Star className="h-2 w-2 fill-current" />
                    Popular
                  </span>
                )}
              </div>
              <p className={cn(
                "font-serif text-sm font-bold",
                tier.popular ? "text-accent" : "text-foreground"
              )}>
                {tier.price}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">{tier.description}</p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {tier.features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-1 text-[10px] text-foreground/70">
                  <CheckCircle className="h-2.5 w-2.5 text-accent shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const faqs = serviceFaqs[service.id] || [];

  return (
    <div
      ref={ref}
      className={cn(
        "group rounded-xl border border-border bg-card overflow-hidden transition-all duration-700 hover:shadow-lg hover:border-accent/30 flex flex-col",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={serviceImages[service.id] || equitanaArena}
          alt={`${service.title} — Peninsula Equine construction project`}
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
      <div className="p-5 sm:p-6 flex flex-col flex-1">
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

        {/* Pricing tiers block */}
        <PricingTiersBlock serviceId={service.id} />

        {/* Per-service FAQ accordion */}
        {faqs.length > 0 && (
          <div className="mb-5 border-t border-border pt-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">
              <HelpCircle className="h-3 w-3" />
              Common Questions
            </p>
            <Accordion type="single" collapsible className="space-y-0">
              {faqs.slice(0, 3).map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b-0">
                  <AccordionTrigger className="py-2 text-xs text-foreground/85 hover:text-accent hover:no-underline [&[data-state=open]]:text-accent">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* CTAs — pushed to bottom */}
        <div className="flex gap-2 mt-auto pt-2">
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

/* ── Book a Consult CTA Section ───────────────────────── */

function BookConsultCTA() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="bg-primary text-primary-foreground py-16 sm:py-20 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <BlueprintScene preset="barn" />
      </div>

      <div
        ref={ref}
        className={cn(
          "section-container relative z-10 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left — copy */}
            <div>
              <div className={cn(
                "w-12 h-0.5 bg-accent mb-6 transition-all duration-500 delay-100",
                isVisible ? "opacity-100 scale-x-100 origin-left" : "opacity-0 scale-x-0"
              )} />
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                Free · No Obligation
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-4 leading-tight">
                Not sure where to start?<br />
                <span className="text-accent">Book a free consultation.</span>
              </h2>
              <p className="text-primary-foreground/60 leading-relaxed mb-6 text-sm">
                Every great facility begins with a conversation. We'll visit your property,
                understand your goals, and provide a no-obligation quote — all at no cost.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  "On-site property assessment",
                  "Custom project scoping & 3D concepts",
                  "Detailed, itemised quote within 5 business days",
                  "No pressure — just expert advice",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-primary-foreground/80">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — CTA buttons */}
            <div className="flex flex-col gap-4 items-center md:items-start">
              <Button
                asChild
                variant="gold"
                size="xl"
                className="w-full sm:w-auto text-sm px-10"
                onClick={() => trackCtaClick("services_book_consult")}
              >
                <Link to="/contact?services=consultation">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Book a Free Consultation
                </Link>
              </Button>
              <Button
                asChild
                variant="outline-light"
                size="lg"
                className="w-full sm:w-auto text-sm px-8"
              >
                <Link to="/schedule">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Schedule a Call Instead
                </Link>
              </Button>
              <a
                href={`tel:${siteConfig.phone}`}
                onClick={() => trackCtaClick("services_call_now")}
                className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-accent text-xs tracking-widest uppercase transition-colors mt-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                <Phone className="h-3.5 w-3.5" />
                Or call {siteConfig.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main Page ────────────────────────────────────────── */

export default function Services() {
  const [quoteServiceId, setQuoteServiceId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
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
    const base = dbServices?.length
      ? dbServices.map((s) => ({
          id: s.slug,
          title: s.title,
          shortDescription: s.short_description || "",
          description: s.description || "",
          features: s.features || [],
          startingPrice: s.starting_price || "Contact Us",
          icon: s.icon || "arena",
        }))
      : services;

    if (activeFilter === "all") return base;
    const cat = SERVICE_CATEGORIES.find((c) => c.key === activeFilter);
    if (!cat || !("ids" in cat)) return base;
    return base.filter((s) => (cat as any).ids.includes(s.id));
  }, [dbServices, activeFilter]);

  // SEO: dynamic document head
  useEffect(() => {
    const prev = document.title;
    document.title = "Equine Facility Construction Services | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Arena construction, barn building, fencing & full facility design on the Mornington Peninsula. Free consultation — get a custom quote today."
    );
    return () => {
      document.title = prev;
      meta?.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <Layout>
      <ServicesSchemaMarkup />
      <PageHeader
        title="Equine Facility Construction Services"
        description="From custom arenas to complete barn construction, we deliver equine facilities built to last. Every project reflects our commitment to quality and our understanding of what horses—and their owners—truly need."
      />

      {/* Services Grid */}
      <section className="section-padding bg-background relative overflow-hidden">
        <BlueprintScene preset="facility" />

        <div className="section-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-2 sm:mb-3">
              What We Build
            </p>
            <h2 className="heading-section text-foreground mb-2 sm:mb-3">
              Investment Guide
            </h2>
            <p className="text-body">
              Every project is custom-quoted after an on-site consultation. Below are starting points to help you plan.
            </p>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all duration-300",
                  activeFilter === cat.key
                    ? "bg-accent text-accent-foreground shadow-[0_2px_12px_hsl(var(--accent)/0.25)]"
                    : "bg-card border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                )}
              >
                {cat.key === "all" && <Filter className="h-3 w-3" />}
                {cat.label}
              </button>
            ))}
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

      {/* Book a Consult CTA */}
      <BookConsultCTA />

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
