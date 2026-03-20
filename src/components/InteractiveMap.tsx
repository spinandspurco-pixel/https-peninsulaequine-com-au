import { useState, useRef, useEffect } from "react";
import { MapPin, ExternalLink, Navigation, ChevronRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const locations = [
  {
    id: "hq",
    name: "Peninsula Equine HQ",
    address: "59 Tubbarubba Road, Merricks North",
    suburb: "Merricks North, VIC 3926",
    type: "hq" as const,
    description: "Our home base — lessons, consultations & site visits start here.",
    lat: -38.3833,
    lng: 145.1167,
  },
  {
    id: "main-ridge",
    name: "Main Ridge Private Arena",
    address: "Main Ridge, VIC",
    suburb: "Main Ridge",
    type: "project" as const,
    description: "Full arena build with custom timber posts and engineered footing.",
    lat: -38.41,
    lng: 144.99,
  },
  {
    id: "aberdeen",
    name: "Private Client — Mornington Peninsula Barn & Stonework",
    address: "Red Hill, VIC",
    suburb: "Red Hill",
    type: "project" as const,
    description: "Heritage stonework barn with hand-finished stalls and aisle.",
    lat: -38.37,
    lng: 145.02,
  },
  {
    id: "balnarring",
    name: "Balnarring Equine Facility",
    address: "Balnarring, VIC",
    suburb: "Balnarring",
    type: "project" as const,
    description: "Multi-paddock facility with covered arena and fencing.",
    lat: -38.365,
    lng: 145.16,
  },
  {
    id: "flinders",
    name: "Flinders Arena & Fencing",
    address: "Flinders, VIC",
    suburb: "Flinders",
    type: "project" as const,
    description: "Coastal property arena with post-and-rail boundary fencing.",
    lat: -38.48,
    lng: 145.02,
  },
  {
    id: "somerville",
    name: "Somerville Training Complex",
    address: "Somerville, VIC",
    suburb: "Somerville",
    type: "project" as const,
    description: "Full training complex with round pen and wash bay.",
    lat: -38.23,
    lng: 145.18,
  },
];

const hqAddress = "59 Tubbarubba Road, Merricks North VIC 3926 Australia";

function getDirectionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function InteractiveMap() {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.08 });
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Stagger card reveal on scroll
  useEffect(() => {
    if (!isVisible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    locations.forEach((loc, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleCards((prev) => new Set(prev).add(loc.id));
        }, 120 * i)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  const activeData = locations.find((l) => l.id === activeLocation);
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
    activeData ? activeData.address : hqAddress
  )}&zoom=${activeData ? 13 : 11}&maptype=roadmap`;

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Section header */}
      <div
        className={cn(
          "transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        <p className="text-overline mb-2">Mornington Peninsula</p>
        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-foreground tracking-tight">
          Our Location &amp; Project Sites
        </h3>
        <div
          className={cn(
            "w-16 h-0.5 bg-accent mt-3 transition-all duration-500 delay-200",
            isVisible ? "opacity-100 scale-x-100 origin-left" : "opacity-0 scale-x-0 origin-left"
          )}
        />
      </div>

      {/* Map + locations grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map embed — takes 3 cols on large screens */}
        <div
          className={cn(
            "lg:col-span-3 transition-all duration-700 delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="relative aspect-[16/10] sm:aspect-video rounded-lg overflow-hidden border border-border shadow-sm group">
            <iframe
              src={mapSrc}
              className="w-full h-full transition-opacity duration-500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peninsula Equine location map"
            />
            {/* Subtle overlay gradient at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
          </div>

          {/* HQ callout bar */}
          <div
            className={cn(
              "mt-3 flex items-center justify-between p-3 rounded-lg border border-accent/20 bg-accent/5 transition-all duration-500 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Peninsula Equine HQ</p>
                <p className="text-xs text-muted-foreground">59 Tubbarubba Rd, Merricks North</p>
              </div>
            </div>
            <a
              href={getDirectionsUrl(hqAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors btn-hover-lift"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Directions</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Locations list — 2 cols on large screens */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium mb-3">
            Completed Project Sites
          </p>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            {locations
              .filter((l) => l.type === "project")
              .map((loc) => {
                const isActive = activeLocation === loc.id;
                const isCardVisible = visibleCards.has(loc.id);

                return (
                  <button
                    key={loc.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(loc.id, el);
                    }}
                    onClick={() =>
                      setActiveLocation(isActive ? null : loc.id)
                    }
                    className={cn(
                      "w-full text-left p-3.5 rounded-lg border transition-all duration-300 group/card",
                      isCardVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4",
                      isActive
                        ? "border-accent/40 bg-accent/8 shadow-sm"
                        : "border-border bg-card hover:border-accent/20 hover:bg-accent/[0.03]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                          isActive
                            ? "bg-accent/20 text-accent"
                            : "bg-muted text-muted-foreground group-hover/card:bg-accent/10 group-hover/card:text-accent"
                        )}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {loc.name}
                          </p>
                          <ChevronRight
                            className={cn(
                              "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-300",
                              isActive && "rotate-90 text-accent"
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {loc.suburb}
                        </p>

                        {/* Expandable detail */}
                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-300",
                            isActive ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0"
                          )}
                        >
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {loc.description}
                          </p>
                          <a
                            href={getDirectionsUrl(loc.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                          >
                            <Navigation className="h-3 w-3" />
                            Get Directions
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Project count badge */}
          <div
            className={cn(
              "text-center pt-2 transition-all duration-500 delay-500",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="text-spec">
              {locations.filter((l) => l.type === "project").length} completed sites across the peninsula
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
