/**
 * Shared JSON-LD builders for public routes. Each returns a plain object
 * compatible with `usePageMeta({ jsonLd })`, which handles injection and
 * cleanup automatically.
 */

import { SITE_BASE } from "@/lib/seo/localBusinessJsonLd";

const BUSINESS_REF = { "@id": `${SITE_BASE}/#localbusiness` };

type FaqEntry = { question: string; answer: string };

type BreadcrumbEntry = { name: string; path: string };

type PriceTier = { name: string; price: string; description?: string };

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_BASE}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function breadcrumbSchema(entries: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      item: absoluteUrl(e.path),
    })),
  };
}

export function faqSchema(faqs: FaqEntry[], id?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(id ? { "@id": id } : {}),
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceSchema(input: {
  id: string;
  name: string;
  description: string;
  path: string;
  image?: string;
  tiers?: PriceTier[];
}) {
  const url = absoluteUrl(input.path);
  const priceOffers = (input.tiers ?? [])
    .map((t) => {
      const numeric = (t.price || "").replace(/[^0-9.]/g, "");
      if (!numeric) return null;
      return {
        "@type": "Offer",
        name: t.name,
        ...(t.description ? { description: t.description } : {}),
        price: numeric,
        priceCurrency: "AUD",
        availability: "https://schema.org/InStock",
        url,
      };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: input.name,
    description: input.description,
    url,
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    serviceType: input.name,
    provider: BUSINESS_REF,
    areaServed: [
      { "@type": "Place", name: "Mornington Peninsula" },
      { "@type": "AdministrativeArea", name: "Victoria" },
    ],
    ...(priceOffers.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "AUD",
            offerCount: priceOffers.length,
            lowPrice: Math.min(
              ...priceOffers.map((o) => Number(o.price)),
            ).toString(),
            offers: priceOffers,
          },
        }
      : {}),
  };
}

type EventInput = {
  id: string;
  title: string;
  description?: string | null;
  event_date: string; // ISO date (yyyy-mm-dd)
  event_time?: string | null; // HH:mm[:ss]
  location?: string | null;
  capacity?: number | null;
  image_url?: string | null;
  price?: string | null;
};

function combineDateTime(date: string, time?: string | null): string {
  if (!time) return date;
  const t = time.length === 5 ? `${time}:00` : time;
  return `${date}T${t}`;
}

export function eventSchema(e: EventInput) {
  const url = `${SITE_BASE}/events#${e.id}`;
  const numericPrice = e.price ? e.price.replace(/[^0-9.]/g, "") : "";
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": url,
    name: e.title,
    ...(e.description ? { description: e.description } : {}),
    startDate: combineDateTime(e.event_date, e.event_time ?? undefined),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url,
    ...(e.image_url ? { image: absoluteUrl(e.image_url) } : {}),
    location: {
      "@type": "Place",
      name: e.location || "Peninsula Equine HQ",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Merricks North",
        addressRegion: "VIC",
        addressCountry: "AU",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Peninsula Equine",
      url: SITE_BASE,
    },
    ...(numericPrice
      ? {
          offers: {
            "@type": "Offer",
            price: numericPrice,
            priceCurrency: "AUD",
            availability: "https://schema.org/InStock",
            url,
            validFrom: new Date().toISOString(),
          },
        }
      : {}),
    ...(e.capacity ? { maximumAttendeeCapacity: e.capacity } : {}),
  };
}

export function eventListSchema(events: EventInput[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_BASE}/events#list`,
    itemListElement: events.map((ev, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: eventSchema(ev),
    })),
  };
}
