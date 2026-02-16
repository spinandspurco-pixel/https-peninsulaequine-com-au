import { Link } from "react-router-dom";
import { ArrowRight, Star, Quote, TrendingUp, CalendarIcon, CheckCircle, Users, Award } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintDivider } from "@/components/BlueprintDivider";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { Button } from "@/components/ui/button";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { glennBrowitt } from "@/data/content";
import blueprintDetail from "@/assets/blueprint-detail.png";
import blueprintBarn from "@/assets/blueprint-barn.png";
import ciroWithHorse from "@/assets/ciro-with-horse.png";

// ── Student Spotlight Data ────────────────────────────

const STUDENT_STORIES = [
  {
    id: "jessica",
    name: "Jessica T.",
    tagline: "Adult Returner → Confident Trot & Canter",
    path: "Foundation → Development",
    weeks: 12,
    before: {
      label: "Before",
      points: ["15 years away from riding", "Extreme anxiety around horses", "No confidence mounting independently"],
    },
    after: {
      label: "After 12 Weeks",
      points: ["Confident walk, trot & canter", "Trail riding independently", "Considering her first competition"],
    },
    quote: "Glenn completely changed my relationship with riding. After 15 years away from horses, I was terrified to get back on. Within three sessions, he had me trotting confidently.",
    milestones: [
      { week: 1, label: "First mount in 15 years" },
      { week: 3, label: "Confident at walk, steering independently" },
      { week: 6, label: "Rising trot — no more death grip" },
      { week: 10, label: "First canter without fear" },
      { week: 12, label: "Graduated to Development path" },
    ],
  },
  {
    id: "karen-lily",
    name: "Karen & Lily M.",
    tagline: "Mother-Daughter Duo → Jumping & Cantering",
    path: "Foundation (Karen) + Development (Lily)",
    weeks: 16,
    before: {
      label: "Before",
      points: ["Karen: Complete beginner at 42", "Lily: Keen but no formal training", "No riding experience between them"],
    },
    after: {
      label: "After 16 Weeks",
      points: ["Karen: Cantering confidently", "Lily: Jumping small courses at 12", "Riding together every weekend"],
    },
    quote: "He adjusts his approach perfectly for each of us. Lily is now jumping small courses and I can finally canter without gripping the mane!",
    milestones: [
      { week: 1, label: "First lesson — both nervous but excited" },
      { week: 4, label: "Karen: walk confidence; Lily: trot mastered" },
      { week: 8, label: "Karen: first trot; Lily: canter transitions" },
      { week: 12, label: "Karen: cantering; Lily: pole work" },
      { week: 16, label: "Karen: trail ready; Lily: first jumps" },
    ],
  },
  {
    id: "steve",
    name: "Steve R.",
    tagline: "Competitive Dressage → Personal Bests",
    path: "Performance",
    weeks: 6,
    before: {
      label: "Before",
      points: ["Tension in lateral work", "Plateaued competition scores", "Horse resistance in collection"],
    },
    after: {
      label: "After 6 Weeks",
      points: ["Fluid lateral movements", "Personal bests at 3 competitions", "Horse visibly relaxed and willing"],
    },
    quote: "His groundwork-first approach unlocked something I'd been fighting for months. We scored personal bests at our next three competitions.",
    milestones: [
      { week: 1, label: "Groundwork assessment — found the tension source" },
      { week: 2, label: "Lateral work breakthrough under saddle" },
      { week: 3, label: "Collection without resistance" },
      { week: 4, label: "First competition — personal best" },
      { week: 6, label: "Three PBs in a row" },
    ],
  },
  {
    id: "amanda",
    name: "Amanda P.",
    tagline: "Problem Horse → Confident Partnership",
    path: "Development",
    weeks: 4,
    before: {
      label: "Before",
      points: ["Horse nappy and difficult to load", "Trust issues between horse and rider", "Considering selling the horse"],
    },
    after: {
      label: "After 4 Weeks",
      points: ["Loads willingly every time", "Calm, trusting partnership restored", "Trail riding together again"],
    },
    quote: "He doesn't just fix the symptom—he addresses the root cause. Can't recommend him enough.",
    milestones: [
      { week: 1, label: "Groundwork — rebuilding trust" },
      { week: 2, label: "Loading exercise — first calm load" },
      { week: 3, label: "Under-saddle confidence restored" },
      { week: 4, label: "Problem fully resolved" },
    ],
  },
];

const AGGREGATE_STATS = [
  { label: "Students Trained", value: "200+", icon: Users },
  { label: "Avg. Weeks to Breakthrough", value: "4–6", icon: TrendingUp },
  { label: "Years Teaching", value: "25+", icon: Award },
  { label: "Avg. Rating", value: "5.0", icon: Star },
];

// ── Components ────────────────────────────────────────

function StoryCard({ story, index }: { story: typeof STUDENT_STORIES[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-border">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold uppercase tracking-wider mb-3">
                <TrendingUp className="h-3 w-3" />
                {story.path}
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">{story.name}</h3>
              <p className="text-sm text-accent font-medium">{story.tagline}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-serif text-2xl font-bold text-foreground">{story.weeks}</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weeks</p>
            </div>
          </div>

          {/* Quote */}
          <div className="relative mt-4 pl-4 border-l-2 border-accent/30">
            <Quote className="absolute -left-2.5 -top-1 h-5 w-5 text-accent/30 bg-card" />
            <p className="text-sm text-muted-foreground italic leading-relaxed">"{story.quote}"</p>
          </div>
        </div>

        {/* Before / After */}
        <div className="grid sm:grid-cols-2">
          <div className="p-6 border-b sm:border-b-0 sm:border-r border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{story.before.label}</p>
            <ul className="space-y-2">
              {story.before.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">{story.after.label}</p>
            <ul className="space-y-2">
              {story.after.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="p-6 sm:p-8 bg-background border-t border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Progress Timeline</p>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-3">
              {story.milestones.map((ms, i) => (
                <div key={i} className="relative pl-7 flex items-center gap-3">
                  <div className="absolute left-0 w-[15px] h-[15px] rounded-full border-2 border-accent bg-background flex items-center justify-center">
                    <div className="w-[5px] h-[5px] rounded-full bg-accent" />
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                    Wk {ms.week}
                  </span>
                  <span className="text-sm text-foreground/80">{ms.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────

export default function StudentSpotlight() {
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  return (
    <Layout>
      <PageHeader
        title="Student Spotlight"
        description="Real riders. Real breakthroughs. See how Glenn's students progress from their very first lesson to milestone moments."
      />

      {/* Aggregate Stats */}
      <section className="section-padding bg-card relative overflow-hidden">
        <BlueprintBackground image={blueprintDetail} opacity={0.03} direction="bottom-to-top" duration={1800} />
        <div className="section-container relative z-10">
          <div
            ref={statsRef}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {AGGREGATE_STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-background transition-all duration-700 ${
                  statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <stat.icon className="h-5 w-5 text-accent" />
                <span className="font-serif text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-[11px] text-muted-foreground text-center leading-tight">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BlueprintDivider variant="elevation" />

      {/* Student Stories */}
      <section className="section-padding bg-background relative overflow-hidden">
        <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="left-to-right" duration={2200} />
        <div className="section-container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <AnimatedDivider className="mx-auto mb-8" />
            <SectionTransition variant="fade-up" delay={100}>
              <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
                Progress Stories
              </p>
            </SectionTransition>
            <SectionTransition variant="scale-up" delay={200}>
              <h2 className="heading-section text-foreground mb-4">
                Before & After: Real Transformations
              </h2>
            </SectionTransition>
            <SectionTransition variant="fade-up" delay={300}>
              <p className="text-muted-foreground leading-relaxed">
                Every rider starts somewhere different. Here's how Glenn's structured approach delivers measurable results — week by week.
              </p>
            </SectionTransition>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {STUDENT_STORIES.map((story, index) => (
              <StoryCard key={story.id} story={story} index={index} />
            ))}
          </div>
        </div>
      </section>

      <BlueprintDivider variant="structural" />

      {/* More Testimonials Strip */}
      <section className="section-padding bg-card">
        <div className="section-container">
          <SectionTransition variant="fade-up" className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Want to hear from more of Glenn's students?
            </p>
            <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent/10">
              <Link to="/testimonials">
                Read All Reviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </SectionTransition>
        </div>
      </section>

      {/* CTA */}
      <ParallaxCTA
        title="Start Your Own Story"
        subtitle="Training with Glenn"
        description="Book a Foundation lesson and begin your riding journey. Private, one-on-one sessions every Thursday & Friday."
        backgroundImage={ciroWithHorse}
        primaryButtonText="Book a Lesson"
        primaryButtonLink="/book-lesson"
        showPhoneButton={true}
      />
    </Layout>
  );
}
