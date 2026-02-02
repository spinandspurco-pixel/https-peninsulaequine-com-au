import { Link } from "react-router-dom";
import { ArrowRight, Award, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// Import event images
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena5 from "@/assets/equitana-arena-5.jpg";
import caulfieldEvent from "@/assets/caulfield-event.jpg";

const majorEvents = [
  {
    id: "equitana",
    title: "Equitana Melbourne",
    subtitle: "Australia's Premier Equine Event",
    description:
      "Peninsula Equine is the exclusive arena preparation partner for Equitana Melbourne, responsible for creating perfect competition footing for thousands of horses and riders.",
    credentials: [
      "Exclusive recurring partner",
      "Competition-grade arena preparation",
      "Multi-arena sand management",
    ],
    image: equitanaArena1,
    secondaryImage: equitanaArena5,
    badgeText: "Exclusive Partner",
    badgeVariant: "default" as const,
  },
  {
    id: "melbourne-cup",
    title: "Ranch Roundup",
    subtitle: "Melbourne Racing Club",
    description:
      "Trusted by the Victoria Racing Club to prepare and maintain arena surfaces at Caulfield Racecourse during one of Australia's most prestigious racing events.",
    credentials: [
      "Official arena contractor",
      "Precision surface preparation",
      "Race-day excellence",
    ],
    image: caulfieldEvent,
    badgeText: "Official Contractor",
    badgeVariant: "secondary" as const,
  },
];

interface EventCardProps {
  event: typeof majorEvents[0];
  index: number;
}

function EventCard({ event, index }: EventCardProps) {
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px",
  });
  
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px",
  });

  const isReversed = index % 2 === 1;

  return (
    <div
      className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
        isReversed ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Image Section */}
      <div
        ref={imageRef}
        className={cn(
          "transition-all duration-700 ease-out group cursor-pointer",
          isReversed ? "lg:order-2" : "",
          imageVisible
            ? "opacity-100 translate-x-0"
            : isReversed
            ? "opacity-0 translate-x-12"
            : "opacity-0 -translate-x-12"
        )}
      >
        <div className="relative transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-accent/10 rounded-sm">
          {/* Main Image */}
          <div className="aspect-[4/3] overflow-hidden rounded-sm">
            <img
              src={event.image}
              alt={event.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105",
                imageVisible ? "scale-100" : "scale-110"
              )}
            />
            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          {/* Secondary Image (if exists) */}
          {event.secondaryImage && (
            <div
              className={cn(
                "absolute -bottom-6 -right-6 w-1/2 aspect-square overflow-hidden rounded-sm border-4 border-card shadow-lg hidden md:block transition-all duration-700 delay-300 group-hover:scale-105 group-hover:shadow-xl group-hover:-translate-y-1",
                imageVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <img
                src={event.secondaryImage}
                alt={`${event.title} detail`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          )}
          
          {/* Badge overlay */}
          <div
            className={cn(
              "absolute top-4 left-4 transition-all duration-500 delay-200 group-hover:scale-105",
              imageVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}
          >
            <Badge 
              variant={event.badgeVariant}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 group-hover:shadow-lg"
            >
              {event.badgeText}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        ref={contentRef}
        className={cn(
          "transition-all duration-700 ease-out delay-150",
          isReversed ? "lg:order-1" : "",
          contentVisible
            ? "opacity-100 translate-x-0"
            : isReversed
            ? "opacity-0 -translate-x-12"
            : "opacity-0 translate-x-12"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-accent mb-3 transition-all duration-500",
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm uppercase tracking-[0.15em] font-medium">
            {event.subtitle}
          </span>
        </div>
        
        <h3
          className={cn(
            "font-serif text-3xl sm:text-4xl text-foreground mb-6 transition-all duration-500 delay-100 hover:text-accent cursor-pointer",
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {event.title}
        </h3>
        
        <p
          className={cn(
            "text-muted-foreground leading-relaxed mb-8 text-lg transition-all duration-500 delay-200",
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {event.description}
        </p>

        {/* Credentials List */}
        <ul className="space-y-3 mb-8">
          {event.credentials.map((credential, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 text-foreground transition-all duration-300 hover:translate-x-2 hover:text-accent cursor-default group/item",
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              )}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110" />
              <span>{credential}</span>
            </li>
          ))}
        </ul>

        {/* Stats/Trust Indicator */}
        <div
          className={cn(
            "flex items-center gap-6 pt-6 border-t border-border transition-all duration-500 delay-500",
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="group/stat cursor-default transition-transform duration-300 hover:scale-105">
            <p className="font-serif text-3xl text-accent transition-all duration-300 group-hover/stat:text-foreground">5+</p>
            <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover/stat:text-accent">Years Running</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="group/stat cursor-default transition-transform duration-300 hover:scale-105">
            <p className="font-serif text-3xl text-accent transition-all duration-300 group-hover/stat:text-foreground">100%</p>
            <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover/stat:text-accent">Return Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MajorEventsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.3,
  });

  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.5,
  });

  return (
    <section className="section-padding bg-card overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 lg:mb-20 transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div
            className={cn(
              "divider mx-auto mb-8 transition-all duration-500 delay-100",
              headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )}
          />
          <div
            className={cn(
              "flex items-center justify-center gap-3 mb-4 transition-all duration-500 delay-200",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Award className="h-5 w-5 text-accent" />
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm">
              Major Events
            </p>
          </div>
          <h2
            className={cn(
              "heading-section text-foreground mb-6 transition-all duration-500 delay-300",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Trusted at Australia's Biggest Stages
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-lg leading-relaxed transition-all duration-500 delay-400",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            When Australia's premier equine events need perfect arenas, they call Ciro. 
            His expertise in sand preparation and arena surfaces has made Peninsula Equine 
            the trusted partner for events that demand excellence.
          </p>
        </div>

        {/* Events Grid */}
        <div className="space-y-20 lg:space-y-32">
          {majorEvents.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          ref={ctaRef}
          className={cn(
            "text-center mt-20 transition-all duration-700",
            ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-muted-foreground mb-6">
            Looking for arena preparation for your event or competition?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center text-foreground font-medium hover:text-accent transition-colors group"
          >
            <span className="border-b border-foreground group-hover:border-accent transition-colors pb-1">
              Discuss your event with Ciro
            </span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

