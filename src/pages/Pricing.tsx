import { Link } from "react-router-dom";
import { Check, ArrowRight, Zap, Users, Award, Star, UserPlus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// ── Package Data ─────────────────────────────────────

const SINGLE_LESSONS = [
  {
    name: "Foundation",
    price: 95,
    duration: "45 min",
    description: "Beginner-friendly session focused on seat, balance & groundwork.",
    features: ["Groundwork basics", "Walk & trot fundamentals", "Horse handling skills"],
  },
  {
    name: "Development",
    price: 120,
    duration: "60 min",
    description: "Build on your skills with canter work, lateral movements & pole work.",
    features: ["Canter transitions", "Lateral movement intro", "Pole work & ground lines"],
    popular: true,
  },
  {
    name: "Performance",
    price: 150,
    duration: "60 min",
    description: "Advanced training for competition prep, collection & precision riding.",
    features: ["Competition preparation", "Advanced dressage or jumping", "Video analysis included"],
  },
];

const PACKAGES = [
  {
    name: "5-Lesson Pack",
    lessons: 5,
    discount: 10,
    icon: Star,
    perks: ["10% off single rate", "Valid for 10 weeks", "Flexible scheduling"],
  },
  {
    name: "10-Lesson Pack",
    lessons: 10,
    discount: 15,
    icon: Zap,
    perks: ["15% off single rate", "Valid for 20 weeks", "Priority scheduling", "1 free arena hire"],
    popular: true,
  },
  {
    name: "20-Lesson Pack",
    lessons: 20,
    discount: 20,
    icon: Award,
    perks: ["20% off single rate", "Valid for 40 weeks", "Priority scheduling", "2 free arena hires", "Progress report included"],
  },
];

const CLINICS = [
  { name: "Half-Day Clinic", price: 220, duration: "3 hours", groupSize: "4–6 riders" },
  { name: "Full-Day Clinic", price: 380, duration: "6 hours", groupSize: "4–6 riders" },
  { name: "Private Intensive", price: 450, duration: "4 hours", groupSize: "1-on-1" },
];

// ── Components ───────────────────────────────────────

function SingleLessons() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-12">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <h2 className="heading-section text-foreground mb-3">Individual Lessons</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">One-on-one sessions tailored to your level and goals.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SINGLE_LESSONS.map((lesson, i) => (
              <div
                key={lesson.name}
                className={cn(
                  "relative rounded-xl border bg-card p-6 flex flex-col transition-all duration-500",
                  lesson.popular ? "border-accent shadow-lg ring-1 ring-accent/20" : "border-border",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                {lesson.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{lesson.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{lesson.duration} session</p>
                <div className="mb-4">
                  <span className="text-3xl font-serif font-bold text-foreground">${lesson.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/ session</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5 flex-1">{lesson.description}</p>
                <ul className="space-y-2 mb-6">
                  {lesson.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={lesson.popular ? "default" : "outline"} className="w-full">
                  <Link to="/book-lesson">Book Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BulkPackages() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-12">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <h2 className="heading-section text-foreground mb-3">Lesson Packages</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Commit to your riding journey and save. The more you ride, the more you save.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PACKAGES.map((pkg, i) => {
              const Icon = pkg.icon;
              return (
                <div
                  key={pkg.name}
                  className={cn(
                    "relative rounded-xl border bg-background p-6 flex flex-col transition-all duration-500",
                    pkg.popular ? "border-accent shadow-lg ring-1 ring-accent/20" : "border-border",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                  style={{ transitionDelay: `${150 + i * 100}ms` }}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Best Value
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{pkg.name}</h3>
                  <div className="mb-4">
                    <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-3 py-1 rounded-full">
                      Save {pkg.discount}%
                    </span>
                  </div>

                  {/* Price examples for each lesson type */}
                  <div className="space-y-1 mb-5 text-sm text-muted-foreground">
                    {SINGLE_LESSONS.map((l) => {
                      const discounted = Math.round(l.price * (1 - pkg.discount / 100));
                      return (
                        <div key={l.name} className="flex justify-between">
                          <span>{l.name}</span>
                          <span>
                            <span className="line-through text-muted-foreground/50 mr-1">${l.price * pkg.lessons}</span>
                            <span className="font-semibold text-foreground">${discounted * pkg.lessons}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={pkg.popular ? "default" : "outline"} className="w-full">
                    <Link to="/contact?subject=lesson-package">Purchase Package <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClinicPricing() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-12">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <h2 className="heading-section text-foreground mb-3">Clinics & Intensives</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Accelerate your progress with focused, immersive sessions.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {CLINICS.map((clinic, i) => (
              <div
                key={clinic.name}
                className={cn(
                  "rounded-xl border border-border bg-card p-5 text-center transition-all duration-500",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                <h3 className="font-serif text-base font-semibold text-foreground mb-2">{clinic.name}</h3>
                <div className="text-2xl font-serif font-bold text-foreground mb-1">${clinic.price}</div>
                <p className="text-xs text-muted-foreground mb-1">{clinic.duration} · {clinic.groupSize}</p>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to="/contact?subject=clinic">Enquire <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCTA() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="section-container">
        <div ref={ref} className={cn("text-center max-w-2xl mx-auto transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <Users className="h-8 w-8 mx-auto mb-4 opacity-60" />
          <h2 className="heading-section mb-4">Not Sure Which Package Is Right?</h2>
          <p className="text-primary-foreground/70 mb-8">
            Chat with us and we'll recommend the best option based on your experience level and goals. No pressure, just honest advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/book-lesson">Book a Trial Lesson <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Group Rates Teaser ──────────────────────────────

function GroupRatesTeaser() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div ref={ref} className={cn("max-w-3xl mx-auto text-center transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <UserPlus className="h-7 w-7 text-accent" />
          </div>
          <h2 className="heading-section text-foreground mb-3">Group Rates Available</h2>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            Bring your friends, family, or team and save up to <strong className="text-foreground">20%</strong> with our group discounts. Calendar-aware pricing means you always know the exact cost upfront.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm text-muted-foreground">
            <span className="px-3 py-1 rounded-full border border-border bg-background">2–3 riders: 5% off</span>
            <span className="px-3 py-1 rounded-full border border-border bg-background">4–6 riders: 10% off</span>
            <span className="px-3 py-1 rounded-full border border-border bg-background">7–10 riders: 15% off</span>
            <span className="px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent font-medium">11–20 riders: 20% off</span>
          </div>
          <Button asChild size="lg">
            <Link to="/group-booking">View Group Rates & Book <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────

export default function Pricing() {
  return (
    <Layout>
      <PageHeader
        title="Lesson Pricing"
        description="Transparent pricing for every level. Save more with lesson packages."
      />
      <SingleLessons />
      <BulkPackages />
      <ClinicPricing />
      <GroupRatesTeaser />
      <PricingCTA />
      <StickySubpageCTA
        ctaLabel="Book a Lesson"
        ctaHref="/book-lesson"
      />
    </Layout>
  );
}
