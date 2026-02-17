import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell, Home, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/hooks/useCtaTracking";

interface ServiceTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  headline: string;
  description: string;
  features: string[];
  cta: { label: string; to: string };
  accent: string;
}

const SERVICE_TABS: ServiceTab[] = [
  {
    id: "training",
    label: "Training",
    icon: <Dumbbell className="h-4 w-4" />,
    headline: "Expert Riding Tuition & Horsemanship",
    description:
      "Progressive lessons led by Glenn Browitt — from first-time riders to advanced competitors. Every session starts with groundwork and builds toward confident, connected riding.",
    features: [
      "Private & group lessons (Thurs–Fri)",
      "All levels: beginner to advanced",
      "Natural horsemanship foundation",
      "Competition preparation & clinics",
      "Purpose-built arena with premium footing",
    ],
    cta: { label: "Book a Lesson", to: "/lessons" },
    accent: "from-accent/20 to-accent/5",
  },
  {
    id: "boarding",
    label: "Boarding",
    icon: <Home className="h-4 w-4" />,
    headline: "Premium Agistment & Spelling",
    description:
      "Safe, spacious paddocks and custom-built stabling on our Merricks North property. Daily care, quality pasture, and facilities designed by someone who rides.",
    features: [
      "Full & paddock agistment options",
      "Daily feeding, water & welfare checks",
      "Access to arena & round pen",
      "Safe post-and-rail fencing",
      "On-site owner presence & vet coordination",
    ],
    cta: { label: "Enquire About Boarding", to: "/contact" },
    accent: "from-primary-foreground/10 to-primary-foreground/5",
  },
  {
    id: "sales",
    label: "Sales & Builds",
    icon: <TrendingUp className="h-4 w-4" />,
    headline: "Facility Design, Construction & Consultation",
    description:
      "Turnkey equine properties — from arena resurfacing to full facility master plans. Every project is designed by a horseman and built to outlast the competition.",
    features: [
      "Custom arenas, barns & fencing",
      "Full-facility master planning",
      "Renovations & drainage upgrades",
      "Permits, engineering & council liaison",
      "Mornington Peninsula & Victoria-wide",
    ],
    cta: { label: "Get a Free Quote", to: "/services" },
    accent: "from-accent/15 to-accent/5",
  },
];

export function ServiceTabsSection() {
  const [activeId, setActiveId] = useState("training");
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const active = SERVICE_TABS.find((t) => t.id === activeId) ?? SERVICE_TABS[0];

  return (
    <BlueprintChapter
      chapter="03"
      chapterTitle="What We Offer"
      scenePreset="services"
      bg="bg-primary"
      textColor="text-primary-foreground"
      specLabels={[{ text: "DWG-ST01 · SERVICE TABS", position: "bottom-left" }]}
      className="section-padding overflow-hidden"
    >
      <div className="section-container" ref={ref}>
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <AnimatedDivider className="mx-auto mb-8 bg-accent" />
          <SectionTransition variant="fade-up">
            <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-sm mb-3">
              What We Offer
            </p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-3">
              Training · Boarding · Builds
            </h2>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={200}>
            <p className="text-primary-foreground/60 text-base leading-relaxed">
              Three pillars of Peninsula Equine — each backed by decades of hands-on experience.
            </p>
          </SectionTransition>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-primary-foreground/[0.04] border border-primary-foreground/10 rounded-lg p-1 gap-1">
            {SERVICE_TABS.map((tab) => {
              const isActive = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveId(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
                    isActive
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/[0.06]"
                  }`}
                  aria-pressed={isActive}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active tab content */}
        <div
          key={active.id}
          className={`grid md:grid-cols-2 gap-8 md:gap-12 items-start transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Text column */}
          <div className="space-y-5">
            <h3 className="font-serif text-2xl text-primary-foreground leading-snug animate-fade-in">
              {active.headline}
            </h3>
            <p className="text-primary-foreground/60 leading-relaxed animate-fade-in">
              {active.description}
            </p>
            <ul className="space-y-2.5 animate-fade-in">
              {active.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-primary-foreground/70"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="gold" size="lg" className="text-sm px-8">
                <Link
                  to={active.cta.to}
                  onClick={() => trackCtaClick(`service_tab_${active.id}`)}
                >
                  {active.cta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline-light"
                size="lg"
                className="text-sm px-8"
              >
                <Link to="/contact">Talk to Us</Link>
              </Button>
            </div>
          </div>

          {/* Visual column — accent card */}
          <div
            className={`rounded-xl border border-primary-foreground/10 bg-gradient-to-br ${active.accent} p-8 md:p-10 animate-fade-in`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                {active.icon}
              </div>
              <span className="text-xs text-primary-foreground/40 uppercase tracking-[0.25em] font-sans">
                {active.label}
              </span>
            </div>

            {/* Feature highlight cards */}
            <div className="space-y-3">
              {active.features.slice(0, 3).map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/40 border border-primary-foreground/[0.06] transition-colors hover:bg-primary/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-2 h-2 rounded-full bg-accent/60" />
                  <span className="text-sm text-primary-foreground/70">{f}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-primary-foreground/25 uppercase tracking-[0.3em] mt-6 font-sans">
              Peninsula Equine · Merricks North, VIC
            </p>
          </div>
        </div>
      </div>
    </BlueprintChapter>
  );
}
