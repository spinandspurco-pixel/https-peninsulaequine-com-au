import { useEffect } from "react";
import { siteConfig } from "@/data/content";

// Schema.org structured data for SEO
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://peninsulaequine.lovable.app/#business",
  name: siteConfig.name,
  description: siteConfig.description,
  url: "https://peninsulaequine.lovable.app",
  telephone: siteConfig.phone,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.zip,
    addressCountry: "AU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -38.3739, // Mornington Peninsula approximate
    longitude: 145.0267,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "17:00",
    },
  ],
  priceRange: "$$$",
  image: "https://peninsulaequine.lovable.app/og-image.jpg",
  sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: -38.3739,
      longitude: 145.0267,
    },
    geoRadius: "100000", // 100km radius
  },
  knowsAbout: [
    "Arena Construction",
    "Barn Construction",
    "Equine Facility Construction",
    "Horse Arena Footing",
    "Equestrian Infrastructure",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Equine Construction Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Arena Construction",
          description: "Custom riding arenas engineered for optimal footing, drainage, and durability.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Barn & Stable Building",
          description: "Functional, beautiful barns designed for horse health and operational efficiency.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Equine Fencing",
          description: "Safe, durable fencing systems that protect your investment.",
        },
      },
    ],
  },
};

const sportsActivityLocationSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": "https://peninsulaequine.lovable.app/#facility",
  name: `${siteConfig.name} Training Facility`,
  description:
    "Professional equine training facility offering riding lessons and horse training on the Mornington Peninsula.",
  url: "https://peninsulaequine.lovable.app",
  telephone: siteConfig.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.zip,
    addressCountry: "AU",
  },
  sport: "Horseback Riding",
  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "Covered Arena",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Professional Footing",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Training Facilities",
      value: true,
    },
  ],
  event: {
    "@type": "Event",
    name: "Riding Lessons",
    description: "Professional riding lessons available Thursdays and Fridays.",
    eventSchedule: {
      "@type": "Schedule",
      byDay: ["Thursday", "Friday"],
      startTime: "09:00",
      endTime: "17:00",
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://peninsulaequine.lovable.app/#organization",
  name: siteConfig.name,
  url: "https://peninsulaequine.lovable.app",
  logo: "https://peninsulaequine.lovable.app/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteConfig.phone,
    contactType: "customer service",
    email: siteConfig.email,
    areaServed: "AU",
    availableLanguage: "English",
  },
  founder: {
    "@type": "Person",
    name: "Ciro",
    jobTitle: "Founder & Master Builder",
  },
};

export function SEOSchema() {
  useEffect(() => {
    // Clean up any existing schema scripts
    const existingScripts = document.querySelectorAll('script[data-schema="seo"]');
    existingScripts.forEach((script) => script.remove());

    // Add schema scripts
    const schemas = [localBusinessSchema, sportsActivityLocationSchema, organizationSchema];

    schemas.forEach((schema, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema", "seo");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[data-schema="seo"]');
      scripts.forEach((script) => script.remove());
    };
  }, []);

  return null;
}
