import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { services as hardcodedServices } from "@/data/content";
import { CheckCircle, ArrowRight, Send, Filter, CalendarIcon } from "lucide-react";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// Images mapped by slug
import equitanaArena from "@/assets/equitana-arena-1.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import qldFacilityConstruction from "@/assets/qld-facility-construction.jpg";
import qldFacilityCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";

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

// Category mapping for filtering
const CATEGORIES: { label: string; slugs: string[] }[] = [
  { label: "All Services", slugs: [] },
  { label: "Construction", slugs: ["arena-construction", "barn-construction", "full-facility"] },
  { label: "Training Spaces", slugs: ["round-pens", "arena-construction"] },
  { label: "Site Work", slugs: ["infrastructure", "fencing"] },
  { label: "Upgrades", slugs: ["renovations"] },
  { label: "Events", slugs: ["clinics-events"] },
];

interface DisplayService {
  id: string;
  title: string;
  shortDescription: string;
  features: string[];
  startingPrice: string;
}

interface ServicesGalleryProps {
  onQuoteClick: (serviceId: string) => void;
}

export function ServicesGallery({ onQuoteClick }: ServicesGalleryProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch from DB, fallback to hardcoded
  const { data: dbServices } = useQuery({
    queryKey: ["gallery-managed-services"],
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

  const allServices: DisplayService[] = useMemo(() => {
    if (dbServices?.length) {
      return dbServices.map((s) => ({
        id: s.slug,
        title: s.title,
        shortDescription: s.short_description || "",
        features: s.features || [],
        startingPrice: s.starting_price || "Contact Us",
      }));
    }
    return hardcodedServices.map((s) => ({
      id: s.id,
      title: s.title,
      shortDescription: s.shortDescription,
      features: s.features,
      startingPrice: s.startingPrice || "Contact Us",
    }));
  }, [dbServices]);

  const filtered = useMemo(() => {
    const cat = CATEGORIES[activeCategory];
    if (!cat || cat.slugs.length === 0) return allServices;
    return allServices.filter((s) => cat.slugs.includes(s.id));
  }, [allServices, activeCategory]);

  const { containerRef, visibleItems } = useStaggeredAnimation(filtered.length);

  // Announce filter changes for screen readers
  const liveRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `Showing ${filtered.length} service${filtered.length !== 1 ? "s" : ""} in ${CATEGORIES[activeCategory].label}`;
    }
  }, [filtered.length, activeCategory]);

  return (
    <section
      id="services-gallery"
      className="section-padding bg-card scroll-mt-24"
      aria-labelledby="gallery-heading"
    >
      <div className="section-container">
        {/* Screen reader live region */}
        <div ref={liveRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "text-center max-w-3xl mx-auto mb-10 transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div
            className={cn(
              "w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100",
              headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )}
          />
          <h2 id="gallery-heading" className="heading-section text-foreground mb-3">
            Services &amp; Pricing
          </h2>
          <p className="text-muted-foreground">
            Browse our full range of equine facility services. Filter by category and request a quote in seconds.
          </p>
        </div>

        {/* Filter bar */}
        <nav aria-label="Service categories" className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2" role="tablist">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                role="tab"
                aria-selected={activeCategory === i}
                aria-controls="services-grid"
                onClick={() => setActiveCategory(i)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  activeCategory === i
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
                )}
              >
                {i === 0 && <Filter className="h-3.5 w-3.5" />}
                {cat.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Results count */}
        <p className="text-xs text-muted-foreground text-center mb-6">
          {filtered.length} service{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Gallery grid */}
        <div
          ref={(el) => {
            // Combine refs
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            (gridRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          id="services-grid"
          role="tabpanel"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((service, index) => (
            <ServiceGalleryCard
              key={service.id}
              service={service}
              index={index}
              isVisible={visibleItems[index] ?? false}
              onQuoteClick={onQuoteClick}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-16 text-muted-foreground" role="status">
            No services in this category yet.
          </p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          All pricing is indicative. Final quotes provided after a free on-site consultation.
        </p>
      </div>
    </section>
  );
}

function ServiceGalleryCard({
  service,
  index,
  isVisible,
  onQuoteClick,
}: {
  service: DisplayService;
  index: number;
  isVisible: boolean;
  onQuoteClick: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const featuresId = `features-${service.id}`;

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-background overflow-hidden transition-all duration-700 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        "hover:border-accent hover:shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.25)]"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
      aria-labelledby={`title-${service.id}`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={serviceImages[service.id] || serviceImages["arena-construction"]}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        {/* Price badge overlay */}
        <div className="absolute bottom-3 left-4">
          <Badge className="bg-accent text-accent-foreground text-sm font-semibold px-3 py-1 shadow-lg">
            From {service.startingPrice}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          id={`title-${service.id}`}
          className="font-serif text-lg font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-accent"
        >
          {service.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {service.shortDescription}
        </p>

        {/* Expandable features */}
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={featuresId}
          className="text-xs text-accent hover:text-accent/80 font-medium mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          {expanded ? "Hide details ▲" : "View inclusions ▼"}
        </button>

        <div
          id={featuresId}
          role="region"
          aria-label={`${service.title} features`}
          className={cn(
            "overflow-hidden transition-all duration-400",
            expanded ? "max-h-64 opacity-100 mb-4" : "max-h-0 opacity-0"
          )}
        >
          <ul className="space-y-1.5" aria-label="Included features">
            {service.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <CheckCircle className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-auto">
          <Button
            onClick={() => {
              trackCtaClick("service_card_inquiry", { source: "services_gallery", service: service.id });
              onQuoteClick(service.id);
            }}
            size="sm"
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Quick Inquiry
          </Button>
          <Button
            onClick={() => {
              trackCtaClick("service_card_quick_book", { source: "services_gallery", service: service.id });
              navigate(`/contact?services=${service.id}&ref=quick-book&view=calendar`);
            }}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Quick Book
          </Button>
        </div>
      </div>
    </article>
  );
}
