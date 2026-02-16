import { ShieldCheck, HardHat, FileSignature, AlertTriangle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const SAFETY_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Fully Insured",
    detail: "Comprehensive public liability and professional indemnity insurance covers all work on your property.",
  },
  {
    icon: HardHat,
    title: "Helmets Mandatory",
    detail: "All riders must wear an approved riding helmet (AS/NZS 3838 or equivalent) at all times while mounted.",
  },
  {
    icon: FileSignature,
    title: "Waiver Required",
    detail: "All participants must sign a liability waiver before any lesson or on-site activity. Waivers are provided at your first session.",
  },
  {
    icon: AlertTriangle,
    title: "Safety First On-Site",
    detail: "Closed-toe boots required. No loose clothing, scarves, or jewellery near horses. Children must be supervised at all times.",
  },
];

export function InsuranceSafetyCard() {
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
            <h2 className="heading-section text-foreground mb-3">Insurance & Safety Policy</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Your safety and peace of mind are non-negotiable. Here's how we protect you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {SAFETY_ITEMS.map((item, i) => (
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
        </div>
      </div>
    </section>
  );
}
