import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, CalendarIcon, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { siteConfig, testimonials, services } from "@/data/content";

const steps = [
  { title: "Inquiry Received", description: "We've logged your details and project requirements." },
  { title: "Team Review", description: "Our team will review your inquiry within 1–2 business days." },
  { title: "Follow-Up Call", description: "We'll reach out to discuss your project and schedule a site visit." },
  { title: "Custom Quote", description: "You'll receive a detailed, no-obligation quote tailored to your needs." },
];

const SERVICE_DURATIONS: Record<string, number> = {
  "riding-lessons": 30,
  "arena-construction": 60,
  "barn-construction": 60,
  "full-facility": 90,
  "fencing": 45,
  "round-pens": 45,
  "infrastructure": 60,
  "renovations": 45,
  "clinics-events": 60,
};

function buildCalendarLink(serviceIds: string[], name?: string, email?: string): string {
  const primary = serviceIds[0] || "";
  const svc = services.find((s) => s.id === primary);
  const title = svc ? `PE Consultation: ${svc.title}` : "Peninsula Equine Consultation";
  const duration = SERVICE_DURATIONS[primary] || 45;
  const details = serviceIds.length > 1
    ? `Services of interest: ${serviceIds.map((id) => services.find((s) => s.id === id)?.title || id).join(", ")}`
    : svc ? `Regarding: ${svc.title}` : "General consultation";

  // Build a Google Calendar link as a suggested follow-up
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 3); // suggest 3 days from now
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: details + (name ? `\nClient: ${name}` : "") + (email ? `\nEmail: ${email}` : ""),
    location: "Peninsula Equine - On-site or Phone",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const featured = testimonials[0];

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const serviceIds = searchParams.get("services")?.split(",").filter(Boolean) || [];
  const clientName = searchParams.get("name") || "";
  const clientEmail = searchParams.get("email") || "";
  const calendarUrl = serviceIds.length > 0 ? buildCalendarLink(serviceIds, clientName, clientEmail) : null;
  const primaryService = services.find((s) => s.id === serviceIds[0]);
  const suggestedDuration = SERVICE_DURATIONS[serviceIds[0]] || 45;
  return (
    <Layout>
      <section className="relative pt-32 pb-20 bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-primary-foreground mb-4">
            Thank You!
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
            Your inquiry has been submitted successfully. Here's what happens next.
          </p>
        </div>
      </section>

      {/* Next Steps */}
      <section className="section-padding bg-background">
        <div className="section-container max-w-3xl">
          <h2 className="font-serif text-2xl text-foreground text-center mb-10">What Happens Next</h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <span className="text-accent font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial snippet */}
      <section className="py-12 bg-card border-y border-border">
        <div className="section-container max-w-2xl text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(featured.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-accent fill-accent" />
            ))}
          </div>
          <blockquote className="font-serif text-lg text-foreground italic leading-relaxed mb-4">
            "{featured.quote}"
          </blockquote>
          <p className="text-sm text-muted-foreground">
            — {featured.name}, {featured.role}
          </p>
        </div>
      </section>

      {/* Smart Calendar CTA */}
      {calendarUrl && (
        <section className="py-10 bg-accent/5 border-y border-accent/20">
          <div className="section-container max-w-xl text-center">
            <CalendarIcon className="h-6 w-6 text-accent mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Book Your {primaryService?.title || "Consultation"} Follow-Up
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We've prepared a suggested {suggestedDuration}-minute consultation slot. Add it to your calendar and we'll confirm.
            </p>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Add to Google Calendar
              </a>
            </Button>
          </div>
        </section>
      )}

      {/* CTAs */}
      <section className="section-padding bg-background">
        <div className="section-container max-w-xl text-center space-y-4">
          <p className="text-muted-foreground text-sm mb-6">In the meantime, you can:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to={`/schedule${serviceIds.length ? `?services=${serviceIds.join(",")}` : ""}`}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule a Call
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call Us Now
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/gallery">
                View Our Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
