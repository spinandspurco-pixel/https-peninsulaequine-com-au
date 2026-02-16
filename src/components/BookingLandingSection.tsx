import { Link } from "react-router-dom";
import { CalendarIcon, Clock, Star, Award, Target, ArrowRight, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonAvailabilityCalendar } from "@/components/LessonAvailabilityCalendar";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const OFFERINGS = [
  {
    value: "beginner",
    label: "Foundation Lesson",
    icon: Star,
    price: "$95",
    duration: "45 min",
    detail: "Build confidence from the ground up — perfect for newcomers.",
    highlights: ["Seat & balance fundamentals", "Horse handling basics"],
  },
  {
    value: "intermediate",
    label: "Development Lesson",
    icon: Target,
    price: "$120",
    duration: "60 min",
    detail: "Refine your aids, develop lateral work and jumping basics.",
    highlights: ["Canter transitions", "Pole work & ground lines"],
    featured: true,
  },
  {
    value: "advanced",
    label: "Performance Lesson",
    icon: Award,
    price: "$150",
    duration: "60 min",
    detail: "Precision training for competitors and serious riders.",
    highlights: ["Collection & extension", "Show preparation"],
  },
  {
    value: "consult",
    label: "Free Consultation",
    icon: Users,
    price: "Free",
    duration: "30 min",
    detail: "Not sure where to start? Chat with Glenn about your goals.",
    highlights: ["Level assessment", "Custom training plan"],
    isConsult: true,
  },
];

export function BookingLandingSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggeredAnimation(OFFERINGS.length);

  return (
    <section id="book" className="section-padding bg-background relative overflow-hidden">
      <div className="section-container relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div
            className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
              headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`}
          />
          <h2 className="heading-section text-foreground mb-3">Book a Lesson or Consult</h2>
          <p className="text-muted-foreground">
            Private, one-on-one sessions with Glenn — available Thursdays &amp; Fridays.
            Pick a program or check the live calendar for open spots.
          </p>
        </div>

        {/* Offering cards */}
        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {OFFERINGS.map((item, i) => (
            <div
              key={item.value}
              className={cn(
                "group relative rounded-xl border bg-card p-5 flex flex-col transition-all duration-700",
                visibleItems[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                item.featured
                  ? "border-accent shadow-[0_4px_24px_-6px_hsl(var(--accent)/0.2)] ring-1 ring-accent/15"
                  : "border-border card-hover-glow"
              )}
            >
              {item.featured && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-widest">
                  Popular
                </span>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent/20">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-foreground leading-tight group-hover:text-accent transition-colors">
                    {item.label}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-serif text-lg font-bold text-accent">{item.price}</span>
                    <span className="text-[11px] text-muted-foreground">· {item.duration}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                {item.detail}
              </p>

              <ul className="space-y-1.5 mb-4">
                {item.highlights.map((h, j) => (
                  <li key={j} className="flex items-center gap-1.5 text-xs text-foreground/75">
                    <CheckCircle className="h-3 w-3 text-accent shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="sm"
                className={cn(
                  "mt-auto w-full",
                  item.isConsult
                    ? "bg-muted text-foreground hover:bg-accent/10 border border-border"
                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                )}
              >
                <Link to={item.isConsult ? "/contact" : `/book-lesson?type=${item.value}`}>
                  {item.isConsult ? "Request Consult" : "Book Now"}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Live calendar */}
        <LessonAvailabilityCalendar />

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
            <Link to="/book-lesson">
              <CalendarIcon className="mr-2 h-4 w-4" />
              View Full Booking Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
