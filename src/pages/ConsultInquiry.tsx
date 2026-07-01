import LessonInquiry from "./LessonInquiry";
import {
  SITE_BASE as BASE,
  localBusinessNode,
  reserveEntryPoint,
} from "@/lib/seo/localBusinessJsonLd";

const PATH = "/consult/request";

const jsonLd = [
  localBusinessNode,
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
    potentialAction: reserveEntryPoint(`${BASE}${PATH}`, "Request a consult"),
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
