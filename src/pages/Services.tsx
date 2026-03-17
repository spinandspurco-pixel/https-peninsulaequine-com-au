import { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { ServicesSchemaMarkup } from "@/components/ServicesSchemaMarkup";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { services } from "@/data/content";

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
        startingPrice: s.starting_price || "Contact Us",
      }));
    }
    return services.map((s) => ({
      id: s.id,
      title: s.title,
      shortDescription: s.shortDescription,
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
          <RevealOnScroll direction="up" delay={200}>
            <p className="text-overline text-accent tracking-[0.25em]">What We Build</p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={350}>
            <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Services
            </h1>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={500}>
            <p className="text-primary-foreground/70 text-lg">
              Every project custom-quoted after an on-site consultation.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Services list */}
      <section className="py-20">
        <div className="section-container max-w-3xl mx-auto">
          <div className="divide-y divide-border">
            {displayServices.map((service, i) => (
              <RevealOnScroll key={service.id} direction="up" stagger={i} staggerInterval={100}>
                <Link
                  to={`/services/${service.id}`}
                  className="group flex items-start justify-between gap-6 py-7 transition-colors hover:bg-accent/[0.03] -mx-4 px-4 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] font-mono tracking-[0.2em] text-accent/40 shrink-0">
                        0{i + 1}
                      </span>
                      <h3 className="font-serif text-lg font-semibold group-hover:text-accent transition-colors">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-10 line-clamp-1">
                      {service.shortDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 pt-1">
                    <span className="text-sm font-medium text-accent hidden sm:block">
                      From {service.startingPrice}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="section-container relative z-10 text-center max-w-lg mx-auto space-y-5">
          <RevealLine className="mx-auto mb-2" width="w-10" />
          <RevealOnScroll direction="up">
            <h2 className="font-serif text-2xl md:text-3xl text-primary-foreground">
              Not sure where to start?
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <p className="text-primary-foreground/50 text-sm">
              Free on-site consultation. We'll walk the land with you.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs">
              <Link to="/contact">
                Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
