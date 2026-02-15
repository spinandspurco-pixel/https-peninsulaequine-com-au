import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { testimonials, siteConfig } from "@/data/content";
import blueprintBarn from "@/assets/blueprint-barn.png";

import ciroWithHorse from "@/assets/ciro-with-horse.png";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(rating)].map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-accent"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <Layout>
      <PageHeader 
        title="Testimonials"
        description="Don't just take our word for it. Here's what our clients have to say about working with Peninsula Equine."
      />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintBarn} opacity={0.025} direction="right-to-left" duration={2000} parallaxSpeed={0.05} />
        <BlueprintLineOverlay variant="barn" color="dark" />
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-8 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
              >
                <StarRating rating={testimonial.rating} />
                <blockquote className="mt-6 text-foreground leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="font-serif font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Parallax */}
      <ParallaxCTA
        title="Join Our Satisfied Clients"
        description="Ready to experience the Peninsula Equine difference? Let's discuss your project."
        backgroundImage={ciroWithHorse}
        primaryButtonText="Get a Quote"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />
    </Layout>
  );
}
