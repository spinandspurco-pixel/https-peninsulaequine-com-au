import { Link } from "react-router-dom";
import { ArrowRight, Download, Shield, Heart, Droplets, Wind, Sun, Utensils, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { Button } from "@/components/ui/button";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// Facility images
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenStallsDetail from "@/assets/aberdeen-stalls-detail.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import aberdeenDeck from "@/assets/aberdeen-deck.jpg";
import qldFacilityStalls from "@/assets/qld-facility-stalls.jpg";
import qldFacilityCourtyard from "@/assets/qld-facility-courtyard.jpg";
import qldFacilityExterior1 from "@/assets/qld-facility-exterior-1.jpg";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintElevation from "@/assets/blueprint-elevation.png";

// ── Data ──────────────────────────────────────────────

const AMENITIES = [
  { image: aberdeenStalls, title: "Spacious Stalls", description: "Oversized stalls with rubber matting and premium bedding" },
  { image: aberdeenAisle, title: "Wide Aisles", description: "Well-lit, clean aisles for safe horse handling" },
  { image: aberdeenBarnInterior, title: "Barn Interior", description: "Natural ventilation and abundant natural light" },
  { image: aberdeenStallsDetail, title: "Stall Details", description: "Heavy-duty hardware and quality timber finishes" },
  { image: qldFacilityCourtyard, title: "Courtyard Area", description: "Covered wash bays and grooming areas" },
  { image: aberdeenDeck, title: "Viewing Deck", description: "Elevated viewing for owners and visitors" },
  { image: qldFacilityExterior1, title: "Paddock Turnout", description: "Safe, well-fenced individual and group paddocks" },
  { image: aberdeenExterior, title: "Facility Grounds", description: "Landscaped grounds with secure perimeter fencing" },
];

const CARE_STANDARDS = [
  {
    icon: Utensils,
    title: "Nutrition",
    points: [
      "Customised feeding programs per horse",
      "Premium hay twice daily, hard feed as directed",
      "Supplements administered per owner instructions",
      "Fresh water checked and refilled multiple times daily",
    ],
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    points: [
      "Daily health checks by experienced staff",
      "Prompt vet call protocols for illness or injury",
      "Worming and dental schedules maintained",
      "Detailed observation logs for every horse",
    ],
  },
  {
    icon: Shield,
    title: "Safety & Security",
    points: [
      "Secure perimeter fencing inspected weekly",
      "Fire safety equipment and evacuation plan",
      "24/7 on-call emergency contacts",
      "CCTV monitoring of barn and paddock areas",
    ],
  },
  {
    icon: Wind,
    title: "Environment",
    points: [
      "Optimal ventilation design in all barns",
      "Stalls cleaned and bedded daily",
      "Fly control and pest management program",
      "Temperature-aware management in extreme weather",
    ],
  },
  {
    icon: Sun,
    title: "Turnout & Exercise",
    points: [
      "Daily paddock turnout (weather permitting)",
      "Individual or group turnout options",
      "Arena access for owners to ride",
      "Lunging and groundwork facilities",
    ],
  },
  {
    icon: Droplets,
    title: "Facilities",
    points: [
      "Hot and cold wash bays",
      "Tack room with individual lockers",
      "Feed room with secure storage",
      "Trailer parking and easy access",
    ],
  },
];

const POLICIES = [
  { name: "Boarding Agreement", description: "Terms, fees, and responsibilities" },
  { name: "Emergency Procedures", description: "Vet protocols and evacuation plans" },
  { name: "Feeding & Medication Policy", description: "How we handle nutrition and supplements" },
  { name: "Turnout & Paddock Rules", description: "Scheduling, groupings, and safety" },
];

// ── Amenities Gallery ─────────────────────────────────

function AmenitiesGallery() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(AMENITIES.length);

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">Facility Amenities</h2>
          <p className="text-muted-foreground">
            Purpose-built with horse welfare and owner convenience at the centre of every design decision.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AMENITIES.map((item, index) => (
            <div
              key={item.title}
              className={`group rounded-lg overflow-hidden border border-border card-hover-glow transition-all duration-700 ${
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-4 bg-background">
                <h3 className="font-serif text-sm font-semibold text-foreground mb-1 transition-colors duration-300 group-hover:text-accent">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Care Standards ────────────────────────────────────

function CareStandardsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(CARE_STANDARDS.length);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="left-to-right" duration={2400} parallaxSpeed={0.06} />
      <BlueprintLineOverlay variant="dimensions" color="dark" />

      <div className="section-container relative z-10">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">Our Care Standards</h2>
          <p className="text-muted-foreground">
            Every horse in our care receives consistent, attentive management. Here's what you can expect.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARE_STANDARDS.map((standard, index) => (
            <div
              key={standard.title}
              className={`group rounded-xl border border-border bg-card p-6 card-hover-glow transition-all duration-700 ${
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                <standard.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-3 transition-colors duration-300 group-hover:text-accent">
                {standard.title}
              </h3>
              <ul className="space-y-2">
                {standard.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Policy Downloads ──────────────────────────────────

function PolicySection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-10">
            <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`} />
            <h2 className="heading-section text-foreground mb-4">Policies & Documentation</h2>
            <p className="text-muted-foreground">
              Transparency is important to us. Review our policies before booking or request copies at any time.
            </p>
          </div>

          <div className="space-y-3 mb-10">
            {POLICIES.map((policy) => (
              <div
                key={policy.name}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4 sm:p-5 transition-colors hover:border-accent/30"
              >
                <div>
                  <h3 className="font-medium text-foreground text-sm sm:text-base">{policy.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{policy.description}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 border-accent/30 text-accent hover:bg-accent/10" asChild>
                  <Link to="/contact?subject=policy-request">
                    <Download className="h-4 w-4 mr-1.5" />
                    Request
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Ready to secure a spot for your horse? Get in touch to arrange a facility tour.
            </p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/contact?service=boarding">
                Enquire About Boarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────

export default function Boarding() {
  return (
    <Layout>
      <PageHeader
        title="Boarding & Facilities"
        description="A safe, well-managed home for your horse. Purpose-built amenities, attentive daily care, and transparent policies you can trust."
        backgroundImage={qldFacilityStalls}
      />

      <AmenitiesGallery />
      <CareStandardsSection />
      <PolicySection />
    </Layout>
  );
}
