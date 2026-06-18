import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://peninsulaequine.com.au";

// Dedicated 1200×630 branded social card. Sitewide fallback for routes
// not in ROUTE_IMAGES below.
const DEFAULT_OG_IMAGE =
  "/__l5e/assets-v1/0fb3dbec-500e-400e-bb23-455301cadcde/og-root.png";
const DEFAULT_OG_ALT =
  "Peninsula Equine — premium equine environments on the Mornington Peninsula.";

// Per-route 1200×630 OG cards, mirrored from scripts/prerender.ts so
// client-side navigation updates og:image / twitter:image alongside
// canonical + og:url. Keep both lists in sync.
const ROUTE_IMAGES: Record<string, { image: string; alt: string }> = {
  "/arenas": {
    image: "/__l5e/assets-v1/71d7e4e8-b1c2-4004-8706-4092927dbff8/og-arenas.png",
    alt: "Peninsula Equine social card — Arenas. Covered arena at dusk with engineered footing being graded.",
  },
  "/stables": {
    image: "/__l5e/assets-v1/4c5e4f1e-0d18-494f-bab8-acfa31539459/og-stables.png",
    alt: "Peninsula Equine social card — Stables. Cinematic stable aisle interior.",
  },
  "/equine-estates": {
    image: "/__l5e/assets-v1/b4c45153-b6fc-49c1-93b5-ce421e0077af/og-equine-estates.png",
    alt: "Peninsula Equine social card — Equine Estates. Aerial masterplan of a whole-property estate at dusk.",
  },
  "/infrastructure": {
    image: "/__l5e/assets-v1/8fce50f6-6134-4757-b362-d88c9d6b0a61/og-infrastructure.png",
    alt: "Peninsula Equine social card — Infrastructure. Engineered site works and groundworks in progress.",
  },
  "/gallery": {
    image: "/__l5e/assets-v1/5d473238-b765-40e8-86cf-ce8e3947fd1a/og-gallery.png",
    alt: "Peninsula Equine social card — Gallery. Main Ridge pavilion interior at golden hour.",
  },
  "/about": {
    image: "/__l5e/assets-v1/1d391d4c-696d-4196-8df4-20fa4c23bc38/og-about.png",
    alt: "Peninsula Equine social card — About. Built by horse people on the Mornington Peninsula.",
  },
  "/contact": {
    image: "/__l5e/assets-v1/4f99afa6-c250-4084-9b63-93d2a4e9a11d/og-contact.png",
    alt: "Peninsula Equine social card — Contact.",
  },
  "/process": {
    image: "/__l5e/assets-v1/a022152e-e50e-45d5-969f-2ece81072971/og-process.png",
    alt: "Peninsula Equine social card — Process. How we take a property from assessment through resolved build.",
  },
  "/testimonials": {
    image: "/__l5e/assets-v1/2214b391-0534-4fab-a73d-4f7b8e4b7ef5/og-testimonials.png",
    alt: "Peninsula Equine social card — Testimonials. What owners, riders and trainers say.",
  },
  "/faq": {
    image: "/__l5e/assets-v1/f1d04f26-b54f-4fde-b601-96cca86611fe/og-faq.png",
    alt: "Peninsula Equine social card — FAQ. Common questions answered.",
  },
  "/privacy": {
    image: "/__l5e/assets-v1/d3ae53c0-9bd2-45cc-9312-46178f55bb9a/og-privacy.png",
    alt: "Peninsula Equine social card — Privacy policy.",
  },
  "/terms": {
    image: "/__l5e/assets-v1/a898c2d8-15d2-460b-9e8f-9ebca6d021d4/og-terms.png",
    alt: "Peninsula Equine social card — Terms of use.",
  },
};

function upsertMeta(
  selector: string,
  attr: "name" | "property",
  key: string,
  value: string,
) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/**
 * Keeps canonical, og:url and og:image / twitter:image in sync with
 * the current route. Mounted once inside <BrowserRouter>.
 */
export function RouteCanonical() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalised =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
    const url = `${SITE_ORIGIN}${normalised}`;

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    upsertMeta('meta[property="og:url"]', "property", "og:url", url);

    const match = ROUTE_IMAGES[normalised];
    const imagePath = match?.image ?? DEFAULT_OG_IMAGE;
    const imageAlt = match?.alt ?? "Peninsula Equine";
    const imageUrl = `${SITE_ORIGIN}${imagePath}`;

    upsertMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    upsertMeta(
      'meta[property="og:image:alt"]',
      "property",
      "og:image:alt",
      imageAlt,
    );
    upsertMeta(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card",
      "summary_large_image",
    );
    upsertMeta(
      'meta[name="twitter:image"]',
      "name",
      "twitter:image",
      imageUrl,
    );
    upsertMeta(
      'meta[name="twitter:image:alt"]',
      "name",
      "twitter:image:alt",
      imageAlt,
    );
  }, [pathname]);

  return null;
}
