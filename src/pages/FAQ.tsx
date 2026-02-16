import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { faqs } from "@/data/content";
import { useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import blueprintDetail from "@/assets/blueprint-detail.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import horseAction from "@/assets/horse-action.png";

export default function FAQ() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [search]);

  const { containerRef, visibleItems } = useStaggeredAnimation(filtered.length, {
    threshold: 0.1,
  });

  return (
    <Layout>
      <PageHeader 
        title="Frequently Asked Questions"
        description="Got questions? We've got answers. If you don't find what you're looking for, don't hesitate to reach out."
      />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintDetail} opacity={0.03} direction="bottom-to-top" duration={1800} parallaxSpeed={0.06} />
        <BlueprintBackground image={blueprintFacility} opacity={0.02} direction="left-to-right" duration={2800} parallaxSpeed={0.04} className="scale-110" />
        <BlueprintLineOverlay variant="detail" color="dark" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/90 to-background pointer-events-none z-[1]" />

        <div className="section-container max-w-3xl relative z-[2]">
          {/* Search filter */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-11 pr-10 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-shadow text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No results for "{search}"</p>
              <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              className="space-y-4"
              ref={containerRef}
            >
              {filtered.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className={`border border-border rounded-lg px-6 data-[state=open]:border-accent transition-all duration-500 ${
                    visibleItems[index]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <AccordionTrigger className="text-left font-serif text-lg font-semibold text-foreground hover:text-accent hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      <ParallaxCTA
        title="Still Have Questions?"
        description="We're here to help. Reach out and we'll get back to you as soon as possible."
        backgroundImage={horseAction}
        primaryButtonText="Contact Us"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />
    </Layout>
  );
}
