import { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";
import { services } from "@/data/content";

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

export default function Services() {
  const navigate = useNavigate();

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
        features: s.features || [],
        startingPrice: s.starting_price || "Contact Us",
      }));
    }
    return services.map((s) => ({
      id: s.id,
      title: s.title,
      shortDescription: s.shortDescription,
      features: s.features,
      startingPrice: s.startingPrice,
    }));
  }, [dbServices]);

  useEffect(() => {
    document.title = "Services | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      <ServicesSchemaMarkup />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-primary/75" />
        <BlueprintScene preset="facility" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <p className="text-overline text-accent tracking-[0.25em]">What We Build</p>
          <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Services
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            World-class equine construction. Every project custom-quoted after an on-site consultation.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, i) => (
              <div
                key={service.id}
                className="group border border-border rounded-lg overflow-hidden bg-card transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 flex flex-col"
              >
                <Link to={`/services/${service.id}`} className="block flex-1">
                  <div className="aspect-[16/10] bg-muted overflow-hidden">
                    <img
                      src={serviceImages[service.id] || equitanaArena}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-accent/60 font-mono mb-1">
                      0{i + 1}
                    </p>
                    <h3 className="font-serif text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {service.shortDescription}
                    </p>
                    <ul className="space-y-1 mb-3">
                      {service.features.slice(0, 3).map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-foreground/80">
                          <CheckCircle className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="font-semibold text-accent text-sm">
                      From {service.startingPrice}
                    </p>
                  </div>
                </Link>
                <div className="px-5 pb-5">
                  <Button
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="w-full bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                    size="sm"
                  >
                    Learn More <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-5">
          <p className="text-overline text-accent tracking-[0.25em]">Free Consultation</p>
          <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground">
            Not sure where to start?
          </h2>
          <p className="text-primary-foreground/60 text-sm">
            We'll visit your property and provide a no-obligation quote at no cost.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs">
            <Link to="/contact">
              Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
