import { Link } from "react-router-dom";
import { ArrowRight, Award, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    title: "Melbourne Cup",
    subtitle: "Caulfield Racecourse",
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

export function MajorEventsSection() {
  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="divider mx-auto mb-8" />
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="h-5 w-5 text-accent" />
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm">
              Major Events
            </p>
          </div>
          <h2 className="heading-section text-foreground mb-6">
            Trusted at Australia's Biggest Stages
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            When Australia's premier equine events need perfect arenas, they call Ciro. 
            His expertise in sand preparation and arena surfaces has made Peninsula Equine 
            the trusted partner for events that demand excellence.
          </p>
        </div>

        {/* Events Grid */}
        <div className="space-y-20 lg:space-y-32">
          {majorEvents.map((event, index) => (
            <div
              key={event.id}
              className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image Section */}
              <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative">
                  {/* Main Image */}
                  <div className="aspect-[4/3] overflow-hidden rounded-sm">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Secondary Image (if exists) */}
                  {event.secondaryImage && (
                    <div className="absolute -bottom-6 -right-6 w-1/2 aspect-square overflow-hidden rounded-sm border-4 border-card shadow-lg hidden md:block">
                      <img
                        src={event.secondaryImage}
                        alt={`${event.title} detail`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Badge overlay */}
                  <div className="absolute top-4 left-4">
                    <Badge 
                      variant={event.badgeVariant}
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                    >
                      {event.badgeText}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="flex items-center gap-2 text-accent mb-3">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-[0.15em] font-medium">
                    {event.subtitle}
                  </span>
                </div>
                
                <h3 className="font-serif text-3xl sm:text-4xl text-foreground mb-6">
                  {event.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  {event.description}
                </p>

                {/* Credentials List */}
                <ul className="space-y-3 mb-8">
                  {event.credentials.map((credential, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>{credential}</span>
                    </li>
                  ))}
                </ul>

                {/* Stats/Trust Indicator */}
                <div className="flex items-center gap-6 pt-6 border-t border-border">
                  <div>
                    <p className="font-serif text-3xl text-accent">5+</p>
                    <p className="text-sm text-muted-foreground">Years Running</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div>
                    <p className="font-serif text-3xl text-accent">100%</p>
                    <p className="text-sm text-muted-foreground">Return Rate</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
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
