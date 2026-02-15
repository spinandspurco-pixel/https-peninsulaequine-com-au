import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { faqs, siteConfig } from "@/data/content";
import { useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import blueprintDetail from "@/assets/blueprint-detail.png";

import horseAction from "@/assets/horse-action.png";

export default function FAQ() {
  const { containerRef, visibleItems } = useStaggeredAnimation(faqs.length, {
    threshold: 0.1,
  });

  return (
    <Layout>
      <PageHeader 
        title="Frequently Asked Questions"
        description="Got questions? We've got answers. If you don't find what you're looking for, don't hesitate to reach out."
      />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintDetail} opacity={0.025} direction="bottom-to-top" duration={1800} parallaxSpeed={0.06} />
        <BlueprintLineOverlay variant="detail" color="dark" />
        <div className="section-container max-w-3xl">
          <Accordion 
            type="single" 
            collapsible 
            className="space-y-4"
            ref={containerRef}
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
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
        </div>
      </section>

      {/* CTA with Parallax */}
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
