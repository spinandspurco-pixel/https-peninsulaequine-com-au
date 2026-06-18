import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://peninsulaequine.com.au";

const DEFAULT_OG_IMAGE =
  "/__l5e/assets-v1/a006cbde-92fd-4c76-a17d-db3530672d7a/sliding-stop-hero.png";

// Per-route OG image overrides, mirrored from scripts/prerender.ts so
// client-side navigation updates og:image / twitter:image alongside
// canonical + og:url. Keep both lists in sync.
const ROUTE_IMAGES: Record<string, { image: string; alt: string }> = {
  "/arenas": {
    image:
      "/__l5e/assets-v1/37069802-9f36-4073-aed4-0659270ccafe/pe-arena-grading.png",
    alt: "Covered equestrian arena interior with engineered footing under controlled light.",
  },
  "/stables": {
    image:
      "/__l5e/assets-v1/94caa649-4df5-456a-9871-684b90f34580/pe-stable-aisle-cinematic.png",
    alt: "Cinematic stable aisle interior.",
  },
  "/equine-estates": {
    image:
      "/__l5e/assets-v1/8564a7af-7ef2-4267-9ee1-6b10228eecbe/pe-estate-aerial-masterplan.png",
    alt: "Aerial masterplan of an equine estate at dusk.",
  },
  "/infrastructure": {
    image:
      "/__l5e/assets-v1/743392aa-050a-4f00-89df-2e018966f2c0/pe-groundworks-dozer.png",
    alt: "Engineered site works and infrastructure in progress.",
  },
  "/gallery": {
    image:
      "/__l5e/assets-v1/8da1740b-3fe0-4f86-b3bf-02bfca528210/main-ridge-pavilion-wide-fireplace-table.png",
    alt: "Main Ridge pavilion interior at golden hour.",
  },
  "/about": {
    image:
      "/__l5e/assets-v1/8da1740b-3fe0-4f86-b3bf-02bfca528210/main-ridge-pavilion-wide-fireplace-table.png",
    alt: "Main Ridge pavilion interior at golden hour.",
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
