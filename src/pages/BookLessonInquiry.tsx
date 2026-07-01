import LessonInquiry from "./LessonInquiry";
import {
  SITE_BASE as BASE,
  localBusinessNode,
  reserveEntryPoint,
} from "@/lib/seo/localBusinessJsonLd";

const PATH = "/lessons/book";

const jsonLd = [
  localBusinessNode,
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
    potentialAction: reserveEntryPoint(`${BASE}${PATH}`, "Book a lesson"),
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
