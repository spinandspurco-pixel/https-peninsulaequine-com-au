import LessonInquiry from "./LessonInquiry";
import { siteConfig } from "@/data/content";

const BASE = "https://peninsulaequine.systems";
const PATH = "/consult/request";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE}/#localbusiness`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: BASE,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    image: `${BASE}/og-image.jpg`,
    priceRange: "$$",
    areaServed: [
      { "@type": "Place", name: "Mornington Peninsula" },
      { "@type": "State", name: "Victoria, Australia" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      addressCountry: "AU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "06:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        description: "By appointment only",
      },
    ],
    sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BASE}${PATH}#service`,
    name: "Horsemanship consult — Mornington Peninsula",
    serviceType: "Equine behaviour and groundwork consultation",
    description:
      "Horsemanship consults for behaviour, groundwork, and structured training plans across the Mornington Peninsula.",
    provider: { "@id": `${BASE}/#localbusiness` },
    areaServed: { "@type": "Place", name: "Mornington Peninsula, Victoria" },
    url: `${BASE}${PATH}`,
    potentialAction: {
      "@type": "ReserveAction",
      target: `${BASE}${PATH}`,
      name: "Request a consult",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Consult", item: `${BASE}/consult` },
      { "@type": "ListItem", position: 3, name: "Request a consult", item: `${BASE}${PATH}` },
    ],
  },
];

export default function ConsultInquiry() {
  return (
    <LessonInquiry
      lockedType="consult"
      metaTitle="Request a Horsemanship Consult — Peninsula Equine, Mornington Peninsula"
      metaDescription="Request a horsemanship consult on the Mornington Peninsula. Behaviour, groundwork, and a structured plan — response within one business day."
      metaPath={PATH}
      metaJsonLd={jsonLd}
      headerOverline="Consult request"
      headerTitle="Request a consult"
      headerSubtitle="Behaviour, groundwork, plan. A short intake — we'll respond within one business day."
      backLink={{ to: "/", label: "Return home" }}
    />
  );
}
