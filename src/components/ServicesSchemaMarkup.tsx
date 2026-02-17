import { useEffect } from "react";
import { services, siteConfig } from "@/data/content";
import { servicePricingTiers, serviceFaqs } from "@/data/servicePricingFaq";

/**
 * Injects schema.org structured data for the Services landing page:
 * - OfferCatalog with individual Service offers
 * - FAQPage aggregating all service FAQs
 * - BreadcrumbList for navigation
 */
export function ServicesSchemaMarkup() {
  useEffect(() => {
    const baseUrl = "https://peninsulaequine.lovable.app";

    // 1. OfferCatalog — each service as an Offer > Service
    const offerCatalog = {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      "@id": `${baseUrl}/services#catalog`,
      name: "Equine Facility Construction Services",
      description: siteConfig.description,
      provider: {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#business`,
        name: siteConfig.name,
        telephone: siteConfig.phone,
        email: siteConfig.email,
      },
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Offer",
          url: `${baseUrl}/services/${s.id}`,
          itemOffered: {
            "@type": "Service",
            name: s.title,
            description: s.description,
            url: `${baseUrl}/services/${s.id}`,
            provider: { "@id": `${baseUrl}/#business` },
            areaServed: {
              "@type": "State",
              name: "Victoria",
              containedInPlace: { "@type": "Country", name: "Australia" },
            },
            ...(servicePricingTiers[s.id]?.length
              ? {
                  offers: servicePricingTiers[s.id].map((tier) => ({
                    "@type": "Offer",
                    name: tier.name,
                    description: tier.description,
                    price: tier.price.replace(/[^0-9.]/g, ""),
                    priceCurrency: "AUD",
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      price: tier.price.replace(/[^0-9.]/g, ""),
                      priceCurrency: "AUD",
                      valueAddedTaxIncluded: false,
                    },
                  })),
                }
              : {}),
          },
        },
      })),
    };

    // 2. FAQPage — aggregate all service FAQs
    const allFaqs = services.flatMap((s) =>
      (serviceFaqs[s.id] || []).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      }))
    );

    const faqSchema =
      allFaqs.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${baseUrl}/services#faq`,
            mainEntity: allFaqs,
          }
        : null;

    // 3. BreadcrumbList
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Services", item: `${baseUrl}/services` },
      ],
    };

    // Inject all schemas
    const schemas = [offerCatalog, faqSchema, breadcrumb].filter(Boolean);
    const tag = "services-schema";

    document.querySelectorAll(`script[data-schema="${tag}"]`).forEach((el) => el.remove());

    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", tag);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll(`script[data-schema="${tag}"]`).forEach((el) => el.remove());
    };
  }, []);

  return null;
}
