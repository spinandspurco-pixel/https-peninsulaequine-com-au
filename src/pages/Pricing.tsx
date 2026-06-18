import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Zap, Users, Award, Star, UserPlus, DollarSign, MapPin, Truck, ShieldCheck, HelpCircle, Flame, Mountain, Trees, CloudRain, Ruler, Building, CreditCard, RefreshCcw, Milestone, Clock, Ban, ArrowRightLeft, Navigation, Car, Plane, Shield, Phone, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { LessonPricingCalculator } from "@/components/LessonPricingCalculator";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/data/content";

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
                  "relative border bg-card p-6 flex flex-col transition-all duration-500",
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
                <Button
                  asChild
                  variant={lesson.popular ? "default" : "outline"}
                  className={cn("w-full", lesson.popular && "bg-accent text-accent-foreground hover:bg-accent/90")}
                  onClick={() => trackCtaClick("pricing_single_lesson", { tier: lesson.name })}
                >
                  <Link to={`/book-lesson?type=${lesson.name.toLowerCase()}`}>
                    Book {lesson.name} Lesson
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
                    "relative border bg-background p-6 flex flex-col transition-all duration-500",
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
                  <div className="w-10 h-10 bg-accent/10 flex items-center justify-center mb-4">
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
                  " border border-border bg-card p-5 text-center transition-all duration-500",
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
            <Button asChild size="lg" variant="secondary" onClick={() => trackCtaClick("pricing_cta_trial")}>
              <Link to="/book-lesson">Book a Trial Lesson — No Commitment <ArrowRight className="ml-2 h-4 w-4" /></Link>
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

// ── AUD Budgeting & Regional Cost FAQ ───────────────

const AUD_PRICING_FAQS = [
  {
    icon: DollarSign,
    question: "Are all prices listed in Australian Dollars?",
    answer: "Yes — every price on this site is in AUD. Lesson prices are inclusive of GST. Construction and facility quotes are ex. GST unless otherwise noted, as GST treatment varies by project scope and your ABN status.",
  },
  {
    icon: MapPin,
    question: "How does location affect pricing on the Mornington Peninsula?",
    answer: "The Mornington Peninsula has specific cost drivers: BAL (Bushfire Attack Level) compliance can add 8–15% to barn and facility builds. Steep or coastal blocks require additional cut-and-fill earthworks. Council approval timelines vary by shire — Mornington Peninsula Shire typically runs 6–12 weeks for equine structures. We factor all of this into your quote upfront so there are no surprises.",
  },
  {
    icon: Truck,
    question: "What regional factors drive construction costs in Victoria?",
    answer: "Key cost drivers include: distance from Melbourne for material delivery (sand, timber, steel), soil type and drainage requirements (clay-heavy Peninsula soils need deeper foundations), seasonal weather windows for earthworks (spring–autumn is ideal), and current material pricing — steel and quality arena sand fluctuate quarterly. We lock in material costs at quote stage wherever possible.",
  },
  {
    icon: ShieldCheck,
    question: "What's included in the 50% deposit for lessons?",
    answer: "Your 50% deposit secures your time slot and covers booking administration. The remaining balance is due on the day of your lesson. Deposits are non-refundable within 24 hours of the session but can be transferred to a different date with notice. Package purchases require full payment upfront at the discounted rate.",
  },
  {
    icon: HelpCircle,
    question: "How should I budget for a full equine facility project?",
    answer: "Start with your must-haves: a quality arena ($65K–$350K+) and functional barn ($95K–$450K+) form the core. Add infrastructure (access roads, drainage, fencing) at roughly 15–25% of the build cost. We recommend a 10% contingency for soil surprises or council variations. Every project gets a detailed staged quote so you can prioritise and build in phases if needed.",
  },
  {
    icon: DollarSign,
    question: "Do you offer payment plans for construction projects?",
    answer: "Construction projects follow a milestone payment structure: typically 20% deposit at contract signing, 30% at slab/foundation stage, 30% at frame/fit-out, and 20% at practical completion. This protects both parties and aligns payments with visible progress. We can discuss variations for staged builds.",
  },
  {
    icon: MapPin,
    question: "Do you service areas outside the Mornington Peninsula?",
    answer: "Our core service area covers the Mornington Peninsula and greater Melbourne region. We take on select projects across regional Victoria and interstate for larger facility builds — travel and accommodation costs are quoted separately. Lessons are on-site at our Merricks North property only.",
  },
];

function AudPricingFAQ() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-background" id="pricing-faq">
      <div className="section-container">
        <div ref={ref} className={cn("max-w-3xl mx-auto transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-10">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <h2 className="heading-section text-foreground mb-3">Pricing & Budgeting FAQs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Understanding AUD pricing, regional cost drivers, and how to budget for your equine project on the Mornington Peninsula.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {AUD_PRICING_FAQS.map((faq, i) => {
              const Icon = faq.icon;
              return (
                <AccordionItem
                  key={i}
                  value={`aud-faq-${i}`}
                  className={cn(
                    "border border-border px-5 data-[state=open]:bg-card transition-all duration-500",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: `${200 + i * 60}ms` }}
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-accent hover:no-underline py-4 text-sm sm:text-base">
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-accent shrink-0" />
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground pl-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Have a specific budgeting question?{" "}
            <Link to="/contact" className="text-accent hover:underline">Get in touch</Link> for a no-obligation conversation.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Regional Cost Drivers ────────────────────────────

const COST_DRIVERS = [
  {
    icon: Flame,
    title: "BAL Compliance",
    stat: "8–15%",
    statLabel: "added cost",
    description: "Many Peninsula properties sit in BAL-12.5 to BAL-40 zones. Fire-rated cladding, ember guards, and non-combustible framing add to material and labour costs — but are non-negotiable for council approval.",
  },
  {
    icon: Mountain,
    title: "Steep & Coastal Sites",
    stat: "$15–40K",
    statLabel: "earthworks premium",
    description: "Rolling hills from Red Hill to Flinders often require cut-and-fill, retaining walls, and engineered drainage. Coastal properties add salt-rated fixings and wind bracing to every structure.",
  },
  {
    icon: Trees,
    title: "Vegetation & Overlays",
    stat: "6–12 wks",
    statLabel: "added approval time",
    description: "Significant Landscape Overlays (SLO) and native vegetation removal permits are common across Merricks, Balnarring, and Main Ridge. Planning consultants and arborist reports are often required before a build can begin.",
  },
  {
    icon: CloudRain,
    title: "Peninsula Clay Soils",
    stat: "20–30%",
    statLabel: "deeper foundations",
    description: "Heavy clay across Hastings, Somerville, and Moorooduc means reactive soil classifications (Class H1–H2). Arena bases, barn footings, and post holes all need engineered solutions to prevent movement.",
  },
  {
    icon: Truck,
    title: "Material Freight",
    stat: "80–120 km",
    statLabel: "from Melbourne suppliers",
    description: "Sand, steel, and hardwood travel from Dandenong South and western suburbs. Delivery surcharges apply — we consolidate loads and lock in pricing at quote stage to minimise freight cost.",
  },
  {
    icon: Ruler,
    title: "Council & Shire Permits",
    stat: "$2–8K",
    statLabel: "in permit fees",
    description: "Mornington Peninsula Shire requires planning permits for most equine structures. Building permits, engineering certification, and BAL assessments are separate line items we include transparently in every quote.",
  },
];

function RegionalCostDrivers() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-card border-y border-border" id="cost-drivers">
      <div className="section-container">
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-12">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
              <MapPin className="h-3 w-3" />
              Mornington Peninsula Specific
            </div>
            <h2 className="heading-section text-foreground mb-3">Regional Cost Drivers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Building equine facilities on the Peninsula comes with unique challenges. Here's what shapes your quote — and why we factor it all in upfront.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {COST_DRIVERS.map((driver, i) => {
              const Icon = driver.icon;
              return (
                <div
                  key={driver.title}
                  className={cn(
                    " border border-border bg-background p-6 transition-all duration-500 hover:border-accent/30 hover:shadow-md",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                  style={{ transitionDelay: `${150 + i * 80}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-foreground">{driver.title}</h3>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg font-bold text-accent">{driver.stat}</span>
                        <span className="text-xs text-muted-foreground">{driver.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{driver.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">
              Every project is different. Get a quote that accounts for <em>your</em> site conditions.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/estimate">
                <Building className="mr-2 h-4 w-4" />
                Get a Custom Estimate
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Deposit & Payment Policy ────────────────────────

const LESSON_DEPOSIT_ITEMS = [
  { icon: CreditCard, label: "50% deposit at booking", detail: "Secures your time slot. Remaining balance due on lesson day." },
  { icon: ArrowRightLeft, label: "Reschedule with 48 hrs notice", detail: "Move your booking to another available date at no charge." },
  { icon: Ban, label: "No refund within 24 hrs", detail: "Deposits are non-refundable within 24 hours of the session." },
  { icon: DollarSign, label: "Packages paid upfront", detail: "Multi-lesson packs are paid in full at the discounted rate." },
];

const CONSTRUCTION_MILESTONES = [
  { pct: "20%", label: "Contract Signing", description: "Deposit secures your build slot and locks in material pricing." },
  { pct: "30%", label: "Slab & Foundation", description: "Due when concrete is poured and footings are inspected." },
  { pct: "30%", label: "Frame & Fit-Out", description: "Due at frame completion, roof-on, and internal fit-out." },
  { pct: "20%", label: "Practical Completion", description: "Final payment on handover after your walk-through sign-off." },
];

function DepositPolicySection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-background" id="deposit-policy">
      <div className="section-container">
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-12">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <h2 className="heading-section text-foreground mb-3">Deposits, Refunds & Milestones</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe in transparent payment terms. Here's exactly how deposits and payments work — no hidden fees, no surprises.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Lesson Deposits */}
            <div className={cn(
              " border border-border bg-card p-6 transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )} style={{ transitionDelay: "150ms" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">Lesson Deposits</h3>
                  <p className="text-xs text-muted-foreground">For all individual & clinic bookings</p>
                </div>
              </div>

              <div className="space-y-4">
                {LESSON_DEPOSIT_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-accent/5 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 p-3 bg-accent/5 border border-accent/15">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Example:</strong> A Development lesson ($120) requires a $60 deposit at booking. Pay the remaining $60 on the day. Package buyers pay $1,020 upfront (10-pack at 15% off) — no further payments needed.
                </p>
              </div>
            </div>

            {/* Construction Milestones */}
            <div className={cn(
              " border border-border bg-card p-6 transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )} style={{ transitionDelay: "250ms" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
                  <Milestone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">Construction Milestones</h3>
                  <p className="text-xs text-muted-foreground">Progress-based payments for builds</p>
                </div>
              </div>

              <div className="relative space-y-0">
                {CONSTRUCTION_MILESTONES.map((ms, i) => (
                  <div key={i} className="flex gap-4 pb-5 last:pb-0">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent">{ms.pct}</span>
                      </div>
                      {i < CONSTRUCTION_MILESTONES.length - 1 && (
                        <div className="w-0.5 flex-1 bg-accent/15 mt-1" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className="text-sm font-medium text-foreground">{ms.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ms.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3 bg-accent/5 border border-accent/15">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Your protection:</strong> Payments are tied to inspected milestones — you only pay when work is verified. Variations or extras are quoted in writing before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Service Area & Travel Fees ───────────────────────

const SERVICE_ZONES = [
  {
    zone: "Core",
    region: "Mornington Peninsula",
    areas: "Merricks North, Balnarring, Red Hill, Main Ridge, Flinders, Hastings, Somerville, Moorooduc",
    travelFee: "Included",
    highlight: true,
    note: "Our home turf — no travel surcharges for construction or lessons.",
  },
  {
    zone: "Extended",
    region: "Greater Melbourne & Surrounds",
    areas: "Frankston, Cranbourne, Pakenham, Dandenong Ranges, Yarra Valley, Geelong corridor",
    travelFee: "$150–$350",
    highlight: false,
    note: "Travel fee covers crew transport and equipment relocation. Quoted per project.",
  },
  {
    zone: "Regional",
    region: "Regional Victoria & Interstate",
    areas: "Gippsland, Ballarat, Bendigo, Northern VIC, NSW & QLD (select projects)",
    travelFee: "Custom quote",
    highlight: false,
    note: "Accommodation and travel quoted separately. We take on select large-scale facility builds only.",
  },
];

function ServiceAreaSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-card border-y border-border" id="service-area">
      <div className="section-container">
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-12">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <h2 className="heading-section text-foreground mb-3">Service Area & Travel Fees</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're based in Merricks North on the Mornington Peninsula. Here's how travel costs work depending on your location.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {SERVICE_ZONES.map((zone, i) => (
              <div
                key={zone.zone}
                className={cn(
                  " border p-6 transition-all duration-500",
                  zone.highlight ? "border-accent/40 bg-accent/5 ring-1 ring-accent/10" : "border-border bg-background",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  {i === 0 && <MapPin className="h-5 w-5 text-accent" />}
                  {i === 1 && <Car className="h-5 w-5 text-accent" />}
                  {i === 2 && <Plane className="h-5 w-5 text-accent" />}
                  <div>
                    <h3 className="font-serif text-base font-semibold text-foreground">{zone.zone} Zone</h3>
                    <p className="text-xs text-muted-foreground">{zone.region}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-lg font-bold text-accent">{zone.travelFee}</span>
                  {zone.travelFee !== "Included" && zone.travelFee !== "Custom quote" && (
                    <span className="text-xs text-muted-foreground ml-1">per project</span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{zone.note}</p>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Covers:</span> {zone.areas}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-8 p-4 bg-background border border-border">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Lessons are on-site only</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All riding lessons are conducted at our Merricks North property (59 Tubbarubba Rd). Construction services extend across all zones listed above. Not sure if we cover your area? <Link to="/contact" className="text-accent hover:underline">Get in touch</Link> — we're happy to discuss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sales Hero ───────────────────────────────────────

function SalesHero() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-gradient-to-b from-primary to-primary/95 text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />
      <div className="section-container relative z-10">
        <div
          ref={ref}
          className={cn(
            "max-w-3xl mx-auto text-center transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="h-3 w-3" />
            Limited Spots — Thursdays & Fridays Only
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
            Invest in Your Riding.{" "}
            <span className="text-accent">See Results Fast.</span>
          </h1>

          <p className="text-primary-foreground/70 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            One-on-one lessons with Glenn Browitt — 25+ years' experience, a purpose-built arena, 
            and a proven system that's transformed over 200 riders on the Mornington Peninsula.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button
              asChild
              size="xl"
              variant="gold"
              className="text-sm px-10"
              onClick={() => trackCtaClick("pricing_hero_book")}
            >
              <Link to="/book-lesson">
                Book Your First Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contact">
                <Phone className="mr-2 h-4 w-4" />
                Free Consultation
              </Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-primary-foreground/50 uppercase tracking-widest">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-accent" />
              50% deposit — pay balance on the day
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RefreshCcw className="h-3 w-3 text-accent" />
              48-hour free reschedule
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3 w-3 text-accent" />
              200+ riders trained
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Social Proof Strip ──────────────────────────────

function SocialProofStrip() {
  return (
    <div className="bg-accent/5 border-y border-accent/10 py-4">
      <div className="section-container flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="flex -space-x-1.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="h-3.5 w-3.5 text-accent fill-accent" />
            ))}
          </span>
          <span className="font-medium text-foreground">5.0 average</span> from 40+ reviews
        </span>
        <span>·</span>
        <span><strong className="text-foreground">25+ years</strong> teaching experience</span>
        <span>·</span>
        <span>All levels welcome — <strong className="text-foreground">beginner to competition</strong></span>
      </div>
    </div>
  );
}

// ── Pricing Schema Markup ───────────────────────────

function PricingSchemaMarkup() {
  useEffect(() => {
    const baseUrl = "https://peninsulaequine.lovable.app";
    const tag = "pricing-schema";

    const offerCatalog = {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      "@id": `${baseUrl}/pricing#catalog`,
      name: "Riding Lesson Pricing — Peninsula Equine",
      provider: { "@type": "LocalBusiness", "@id": `${baseUrl}/#business` },
      itemListElement: [
        ...SINGLE_LESSONS.map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Offer",
            name: `${l.name} Lesson`,
            description: l.description,
            price: String(l.price),
            priceCurrency: "AUD",
            url: `${baseUrl}/book-lesson`,
            itemOffered: {
              "@type": "Service",
              name: `${l.name} Riding Lesson`,
              description: l.description,
              provider: { "@id": `${baseUrl}/#business` },
            },
          },
        })),
        ...CLINICS.map((c, i) => ({
          "@type": "ListItem",
          position: SINGLE_LESSONS.length + i + 1,
          item: {
            "@type": "Offer",
            name: c.name,
            price: String(c.price),
            priceCurrency: "AUD",
            description: `${c.duration} · ${c.groupSize}`,
            url: `${baseUrl}/contact?subject=clinic`,
          },
        })),
      ],
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${baseUrl}/pricing#faq`,
      mainEntity: AUD_PRICING_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Pricing", item: `${baseUrl}/pricing` },
      ],
    };

    document.querySelectorAll(`script[data-schema="${tag}"]`).forEach((el) => el.remove());
    [offerCatalog, faqSchema, breadcrumb].forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", tag);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll(`script[data-schema="${tag}"]`).forEach((el) => el.remove());
    };
  }, []);

  return null;
}

// ── Page ─────────────────────────────────────────────

export default function Pricing() {
  // SEO meta
  useEffect(() => {
    const prev = document.title;
    document.title = "Riding Lesson Pricing & Packages | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Book private riding lessons from $95 AUD. Save up to 20% with lesson packages. Clinics & group rates available. Mornington Peninsula."
    );
    return () => {
      document.title = prev;
      meta?.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <Layout>
      <div className="type-architectural">
      <PricingSchemaMarkup />
      <SalesHero />
      <SocialProofStrip />
      <SingleLessons />
      <BulkPackages />
      <ClinicPricing />
      <LessonPricingCalculator />
      <GroupRatesTeaser />
      <DepositPolicySection />
      <ServiceAreaSection />
      <RegionalCostDrivers />
      <AudPricingFAQ />
      <PricingCTA />
      <StickySubpageCTA
        ctaLabel="Book a Lesson"
        ctaHref="/book-lesson"
      />
      </div>
    </Layout>
  );
}
