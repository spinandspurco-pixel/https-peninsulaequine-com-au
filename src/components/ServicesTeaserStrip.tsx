import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/content";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const TEASER_SERVICES = services.slice(0, 6);

const ICONS: Record<string, string> = {
  "arena-construction": "◇",
  "barn-construction": "⌂",
  "fencing": "▯",
  "infrastructure": "⊞",
  "round-pens": "○",
  "renovations": "⟳",
};

export function ServicesTeaserStrip() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const { containerRef, visibleItems } = useStaggeredAnimation(TEASER_SERVICES.length);

  return (
    <section className="py-10 sm:py-14 bg-background border-b border-border" aria-labelledby="teaser-heading">
      <div className="section-container">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "text-center mb-8 transition-all duration-600",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <p className="text-muted-foreground uppercase tracking-[0.25em] text-xs mb-2">
            What We Build
          </p>
          <h3 id="teaser-heading" className="font-serif text-xl sm:text-2xl text-foreground">
            Specialist Equine Facilities
          </h3>
        </div>

        {/* Service pills grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8"
        >
          {TEASER_SERVICES.map((service, i) => (
            <Link
              key={service.id}
              to={`/services#${service.id}`}
              className={cn(
                "group flex flex-col items-center text-center p-4 sm:p-5 rounded-lg border border-border bg-card hover:border-accent/50 hover:shadow-[0_4px_20px_-6px_hsl(var(--accent)/0.2)] transition-all duration-500",
                visibleItems[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span
                className="text-2xl mb-2 text-accent/60 group-hover:text-accent group-hover:scale-110 transition-all duration-300"
                aria-hidden="true"
              >
                {ICONS[service.id] || "◆"}
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors duration-300 leading-tight">
                {service.title}
              </span>
              {service.startingPrice && (
                <span className="text-[11px] text-muted-foreground mt-1">
                  From {service.startingPrice}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className={cn(
            "text-center transition-all duration-600 delay-500",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
          >
            <span className="border-b border-accent/40 group-hover:border-accent pb-0.5">
              Explore All Services &amp; Pricing
            </span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
