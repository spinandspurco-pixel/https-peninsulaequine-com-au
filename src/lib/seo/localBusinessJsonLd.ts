import { siteConfig } from "@/data/content";

export const SITE_BASE = "https://peninsulaequine.systems";

// Merricks North, VIC 3926 — approximate HQ coordinates
const HQ_GEO = { latitude: -38.3547, longitude: 145.0389 };

// Convert "0418 585 489" → "+61418585489" (E.164, AU)
function toE164AU(local: string): string {
  const digits = local.replace(/\D/g, "");
  return digits.startsWith("0") ? `+61${digits.slice(1)}` : `+${digits}`;
}

export const localBusinessNode = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_BASE}/#localbusiness`,
  name: siteConfig.name,
  description: siteConfig.description,
  url: SITE_BASE,
  telephone: toE164AU(siteConfig.phone),
  email: siteConfig.email,
  image: `${SITE_BASE}/og-image.jpg`,
  logo: `${SITE_BASE}/favicon.png`,
  priceRange: "$$",
  areaServed: [
    { "@type": "Place", name: "Mornington Peninsula" },
    { "@type": "AdministrativeArea", name: "Victoria" },
  ],
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
    latitude: HQ_GEO.latitude,
    longitude: HQ_GEO.longitude,
  },
  // Only spec compliant OHS entries (opens/closes required by Google).
  // Saturday "by appointment" is a business note, not machine-readable hours.
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "06:00",
      closes: "17:00",
    },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: toE164AU(siteConfig.phone),
    email: siteConfig.email,
    contactType: "customer service",
    areaServed: "AU",
    availableLanguage: ["en"],
  },
  sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
};

export function reserveEntryPoint(url: string, name: string) {
  return {
    "@type": "ReserveAction",
    name,
    target: {
      "@type": "EntryPoint",
      urlTemplate: url,
      inLanguage: "en-AU",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
  };
}
