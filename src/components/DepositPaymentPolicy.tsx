import { Link } from "react-router-dom";
import { ShieldCheck, CreditCard, CalendarIcon, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const POLICY_ITEMS = [
  {
    icon: CreditCard,
    title: "Accepted Payment Methods",
    detail: "Bank transfer, credit/debit card, and cash on site. Larger projects can be arranged with staged milestone payments.",
  },
  {
    icon: CalendarIcon,
    title: "Deposit Requirements",
    detail: "Construction projects require a 20% deposit upon accepting the quote. Lesson bookings are paid at the time of booking or on the day.",
  },
  {
    icon: AlertCircle,
    title: "Cancellation & Refunds",
    detail: "Lessons cancelled with less than 48 hours' notice may incur a fee. Construction deposits are non-refundable once materials have been ordered.",
  },
  {
    icon: ShieldCheck,
    title: "Construction Payment Schedule",
    detail: "20% deposit on acceptance → progress payments at key milestones → balance on completion. A clear schedule is provided upfront with your quote.",
  },
];

interface DepositPaymentPolicyProps {
  ctaHref?: string;
  ctaLabel?: string;
}

export function DepositPaymentPolicy({
  ctaHref = "/contact",
  ctaLabel = "Get a Free Quote",
}: DepositPaymentPolicyProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div
          ref={ref}
          className={cn(
            "max-w-4xl mx-auto transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="text-center mb-10">
            <div
              className={cn(
                "w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100",
                isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
              )}
            />
            <h2 className="heading-section text-foreground mb-3">Deposit & Payment Policy</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Transparent terms so you know exactly what to expect — no surprises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {POLICY_ITEMS.map((item, i) => (
              <div
                key={item.title}
                className={cn(
                  "rounded-xl border border-border bg-background p-5 sm:p-6 transition-all duration-500",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-foreground mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to={ctaHref}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Full terms are provided with every quote and booking confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
