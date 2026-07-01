import LessonInquiry from "./LessonInquiry";
import { siteConfig } from "@/data/content";

const BASE = "https://peninsulaequine.systems";
const PATH = "/lessons/book";

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
    name: "Riding lessons — Mornington Peninsula",
    serviceType: "Equestrian riding lessons",
    description:
      "Structured riding lessons on the Mornington Peninsula. Guided intake, confirmed within one business day.",
    provider: { "@id": `${BASE}/#localbusiness` },
    areaServed: { "@type": "Place", name: "Mornington Peninsula, Victoria" },
    url: `${BASE}${PATH}`,
    potentialAction: {
      "@type": "ReserveAction",
      target: `${BASE}${PATH}`,
      name: "Book a lesson",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Lessons", item: `${BASE}/lessons` },
      { "@type": "ListItem", position: 3, name: "Book a lesson", item: `${BASE}${PATH}` },
    ],
  },
];

export default function BookLessonInquiry() {
  return (
    <LessonInquiry
      lockedType="lesson"
      metaTitle="Book a Riding Lesson — Peninsula Equine, Mornington Peninsula"
      metaDescription="Book a structured riding lesson on the Mornington Peninsula with Peninsula Equine. Guided intake, confirmed within one business day."
      metaPath={PATH}
      metaJsonLd={jsonLd}
      headerOverline="Lesson request"
      headerTitle="Book a lesson"
      headerSubtitle="Tell us about you and your horse. We'll confirm timing within one business day."
      backLink={{ to: "/lessons", label: "Back to lessons" }}
    />
  );
}
