import { Link } from "react-router-dom";
import { FileDown, CalendarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { cn } from "@/lib/utils";
import { services } from "@/data/content";

function generatePricingPDF(): string {
  const lines = [
    "PENINSULA EQUINE — SERVICE PRICING GUIDE",
    "=========================================",
    "",
    `Generated: ${new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}`,
    "",
    "All pricing is indicative. Final quotes are provided after a free on-site consultation.",
    "",
    "─────────────────────────────────────────",
    "",
  ];

  services.forEach((s) => {
    lines.push(`■ ${s.title.toUpperCase()}`);
    lines.push(`  Starting from: ${s.startingPrice || "Contact Us"}`);
    lines.push(`  ${s.shortDescription}`);
    lines.push("");
    if (s.features?.length) {
      s.features.forEach((f) => lines.push(`  ✓ ${f}`));
      lines.push("");
    }
    lines.push("─────────────────────────────────────────");
    lines.push("");
  });

  lines.push(
    "",
    "PAYMENT TERMS",
    "• 20% deposit on acceptance of quote",
    "• Progress payments at key milestones",
    "• Balance on completion",
    "",
    "CONTACT US",
    "Web: peninsulaequine.lovable.app/contact",
    "Phone: 0400 000 000",
    "",
    "© Peninsula Equine. All rights reserved.",
  );

  return lines.join("\n");
}

function handleDownload() {
  const content = generatePricingPDF();
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Peninsula-Equine-Pricing-Guide.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  trackCtaClick("pricing_pdf_download", { source: "services_page" });
}

export function PricingDownloadCTA() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="section-padding bg-muted/50 border-y border-border">
      <div className="section-container">
        <div
          ref={ref}
          className={cn(
            "max-w-3xl mx-auto text-center transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div
            className={cn(
              "w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100",
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )}
          />

          <h2 className="heading-section text-foreground mb-3">
            Download Our Pricing Guide
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-8">
            Take our full service list and indicative pricing with you. Compare options offline, share with partners, or use it to plan your project budget.
          </p>

          <div
            className={cn(
              "inline-flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-border bg-background p-6 shadow-sm transition-all duration-500 delay-200",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            {/* File preview */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <FileDown className="h-6 w-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">PE Pricing Guide</p>
                <p className="text-xs text-muted-foreground">{services.length} services · Updated {new Date().toLocaleDateString("en-AU", { month: "short", year: "numeric" })}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDownload}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <FileDown className="h-4 w-4 mr-1.5" />
                Download
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact?ref=pricing-pdf">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  Book a Consultation
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-5">
            All pricing is indicative. A free on-site consultation is included with every quote.
          </p>
        </div>
      </div>
    </section>
  );
}
