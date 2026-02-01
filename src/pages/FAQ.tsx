import { Link } from "react-router-dom";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { faqs, siteConfig } from "@/data/content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function PageHeader() {
  return (
    <section className="pt-32 pb-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="max-w-3xl">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h1 className="heading-display mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-primary-foreground/80">
            Got questions? We've got answers. If you don't find what you're looking for, 
            don't hesitate to reach out.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function FAQ() {
  return (
    <Layout>
      <PageHeader />

      <section className="section-padding">
        <div className="section-container max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 data-[state=open]:border-accent"
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

      {/* CTA */}
      <section className="section-padding bg-card">
        <div className="section-container text-center">
          <h2 className="heading-section text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We're here to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`tel:${siteConfig.phone}`}>Call {siteConfig.phone}</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
