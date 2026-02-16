import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarIcon,
  CheckCircle,
  Clock,
  Star,
  Target,
  Award,
  Users,
  Quote,
  ExternalLink,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { glennBrowitt, lessonInfo, siteConfig } from "@/data/content";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";

// ── Program Data ─────────────────────────────────────

const PROGRAMS = [
  {
    value: "beginner",
    label: "Foundation",
    icon: Star,
    tagline: "Build confidence from the ground up",
    description:
      "Perfect for newcomers or riders returning after a break. Focus on seat, balance, and building a trusting relationship with your horse.",
    topics: [
      "Mounting & dismounting safely",
      "Walk & rising trot fundamentals",
      "Groundwork & horse handling",
      "Basic arena etiquette",
    ],
    price: "$95",
    pricePer: "per session",
    duration: "45 min",
    frequency: "Weekly recommended",
    bestFor: "Beginners & returners",
    featured: false,
  },
  {
    value: "intermediate",
    label: "Development",
    icon: Target,
    tagline: "Refine your skills, deepen your partnership",
    description:
      "For riders comfortable at walk, trot, and canter who are ready to develop more refined aids, lateral work, and jumping basics.",
    topics: [
      "Canter transitions & lead changes",
      "Introduction to lateral movements",
      "Pole work & ground lines",
      "Developing an independent seat",
    ],
    price: "$120",
    pricePer: "per session",
    duration: "60 min",
    frequency: "Weekly or fortnightly",
    bestFor: "Confident walk/trot/canter",
    featured: true,
  },
  {
    value: "advanced",
    label: "Performance",
    icon: Award,
    tagline: "Precision training for serious riders",
    description:
      "Tailored sessions for experienced riders working on competition preparation, advanced dressage movements, or complex jumping courses.",
    topics: [
      "Collection & extension",
      "Advanced lateral work",
      "Course building & show prep",
      "Rider biomechanics analysis",
    ],
    price: "$150",
    pricePer: "per session",
    duration: "60 min",
    frequency: "As needed",
    bestFor: "Competitors & advanced riders",
    featured: false,
  },
];

const LESSON_FAQS = [
  {
    q: "Do I need my own horse?",
    a: "Lessons are available on your own horse only at this stage. If you don't have a horse, contact us and we can discuss options.",
  },
  {
    q: "What should I wear?",
    a: "An approved riding helmet is mandatory. We recommend close-fitting trousers, boots with a small heel, and gloves. No loose clothing or open-toed shoes.",
  },
  {
    q: "How long is each lesson?",
    a: "Sessions run 45–60 minutes depending on the program level and rider fitness. Beginners typically start with shorter sessions.",
  },
  {
    q: "What's the cancellation policy?",
    a: "We require 24 hours notice for cancellations. Late cancellations may incur a fee. Weather-related cancellations are handled on a case-by-case basis.",
  },
  {
    q: "Can I book a trial lesson?",
    a: "Absolutely. Your first session is treated as an assessment so we can place you in the right program level. No long-term commitment required.",
  },
  {
    q: "Are group lessons available?",
    a: "Currently all lessons are private (one-on-one). Small group clinics may be offered seasonally — join our mailing list to stay updated.",
  },
];

// ── Components ───────────────────────────────────────

function InfoCards() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const cards = [
    { icon: CalendarIcon, title: "Available Days", detail: "Thursdays & Fridays" },
    { icon: Clock, title: "Session Length", detail: "45–60 minutes" },
    { icon: CheckCircle, title: "All Levels", detail: "Beginner to advanced" },
  ];

  return (
    <div ref={ref} className="grid sm:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={cn(
            "text-center p-6 rounded-xl bg-card border border-border card-hover-glow transition-all duration-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: `${i * 120}ms` }}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <card.icon className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{card.title}</h3>
          <p className="text-sm text-muted-foreground">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

function ProgramCard({
  program,
  index,
}: {
  program: (typeof PROGRAMS)[number];
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const Icon = program.icon;

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl border bg-card overflow-hidden transition-all duration-600",
        program.featured
          ? "border-accent shadow-[0_0_30px_-8px_hsl(var(--accent)/0.25)]"
          : "border-border",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {program.featured && (
        <div className="bg-accent text-accent-foreground text-[11px] font-semibold uppercase tracking-widest text-center py-1.5">
          Most Popular
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">{program.label}</h3>
            <p className="text-sm text-muted-foreground">{program.tagline}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          <span className="text-3xl font-serif font-bold text-foreground">{program.price}</span>
          <span className="text-sm text-muted-foreground ml-1.5">/ {program.pricePer}</span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
            <Clock className="h-3 w-3" /> {program.duration}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
            <Users className="h-3 w-3" /> {program.bestFor}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{program.description}</p>

        {/* Topics */}
        <ul className="space-y-2 mb-6">
          {program.topics.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              {t}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          asChild
          className={cn(
            "w-full",
            program.featured
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Link to={`/book-lesson?type=${program.value}`}>
            Book {program.label} Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────

export default function Lessons() {
  const { ref: trainerRef, isVisible: trainerVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  return (
    <Layout>
      <StickySubpageCTA ctaLabel="Book a Lesson" ctaHref="/book-lesson" />

      <PageHeader
        title="Riding Lessons"
        description="Expert tuition for every level — from first sit to show ring"
      />

      {/* Quick-info cards */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <InfoCards />
        </div>
      </section>

      {/* Program levels with pricing */}
      <section className="section-padding bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
              Program Levels
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3">
              Find Your Level
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every rider's journey is different. Choose the program that matches where you are
              now — your first session doubles as an assessment so we place you perfectly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {PROGRAMS.map((p, i) => (
              <ProgramCard key={p.value} program={p} index={i} />
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            All prices are starting-at rates. Prices may vary for specialised sessions or extended durations.
          </p>
        </div>
      </section>

      {/* Trainer spotlight */}
      <section ref={trainerRef} className="section-padding bg-background overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden aspect-[4/3] transition-all duration-700",
                trainerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              )}
            >
              <img
                src={aberdeenBarnInterior}
                alt="Riding lesson at Peninsula Equine arena"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs uppercase tracking-widest text-white/70">Your Trainer</span>
                <h3 className="font-serif text-xl text-white font-semibold">{glennBrowitt.name}</h3>
                <p className="text-sm text-white/80">{glennBrowitt.title}</p>
              </div>
            </div>

            {/* Bio */}
            <div
              className={cn(
                "transition-all duration-700 delay-200",
                trainerVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              )}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
                Meet Your Instructor
              </p>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
                {glennBrowitt.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{glennBrowitt.bio[0]}</p>

              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Specialties
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                {glennBrowitt.specialties.slice(0, 6).map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/book-lesson">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Book a Lesson
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={glennBrowitt.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Glenn's Website
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {glennBrowitt.testimonials.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="section-container">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
                Student Stories
              </p>
              <h2 className="font-serif text-3xl font-semibold text-foreground">
                What Our Riders Say
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {glennBrowitt.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col"
                >
                  <Quote className="h-5 w-5 text-accent/40 mb-3" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                      {t.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="section-padding bg-background">
        <div className="section-container max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium mb-3">
              Common Questions
            </p>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Lesson FAQs</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {LESSON_FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 bg-card"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:text-accent py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="section-container text-center max-w-2xl">
          <div className="w-12 h-px bg-accent mx-auto mb-8" />
          <h2 className="font-serif text-3xl font-semibold mb-4">Ready to Ride?</h2>
          <p className="text-primary-foreground/70 mb-8">
            Book your first session today — no long-term commitment required. Your initial lesson
            doubles as an assessment so we find the perfect program for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/book-lesson">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Book a Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href={`tel:${siteConfig.phone}`}>
                Call {siteConfig.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
