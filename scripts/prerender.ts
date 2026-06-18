/**
 * Post-build prerender for public marketing routes.
 *
 * Reads dist/index.html and writes dist/<route>/index.html with the
 * <title>, <meta name=description>, <link rel=canonical>, and og:*
 * tags rewritten to match each route. The body still hydrates from
 * the SPA bundle — only the static <head> is per-route, which is all
 * crawlers (Google, LinkedIn, Slack, Twitter, Facebook) need.
 *
 * Routes mirror public/sitemap.xml. Redirects, dynamic params, and
 * auth-gated routes are intentionally excluded.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const SITE_ORIGIN = "https://peninsulaequine.com.au";
const DIST = resolve("dist");

// Sitewide fallback OG card — the branded 1200×630 root card. Used by
// any route that doesn't define its own image and as the og:image baked
// into the static homepage index.html.
const DEFAULT_OG_IMAGE =
  "/__l5e/assets-v1/0fb3dbec-500e-400e-bb23-455301cadcde/og-root.png";
const DEFAULT_OG_ALT =
  "Peninsula Equine — premium equine environments on the Mornington Peninsula.";

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  /** Absolute path under the project origin, e.g. "/__l5e/..." */
  image?: string;
  imageAlt?: string;
}

// Keep in sync with public/sitemap.xml and src/components/RouteCanonical.tsx.
// Each route ships its own dedicated 1200×630 branded social card.
const ROUTES: RouteMeta[] = [
  {
    path: "/arenas",
    title: "Arenas | Peninsula Equine",
    description:
      "Sand, rubber and all-weather arenas engineered for performance — built by riders on the Mornington Peninsula.",
    image: "/__l5e/assets-v1/71d7e4e8-b1c2-4004-8706-4092927dbff8/og-arenas.png",
    imageAlt:
      "Peninsula Equine social card — Arenas. Covered arena at dusk with engineered footing being graded.",
  },
  {
    path: "/stables",
    title: "Stables | Peninsula Equine",
    description:
      "Bespoke stables, barns and shelters designed around how horses actually live, work and recover.",
    image: "/__l5e/assets-v1/4c5e4f1e-0d18-494f-bab8-acfa31539459/og-stables.png",
    imageAlt:
      "Peninsula Equine social card — Stables. Cinematic stable aisle interior.",
  },
  {
    path: "/equine-estates",
    title: "Whole-Property Planning | Peninsula Equine",
    description:
      "Whole-property equine estate planning — arenas, stables, paddocks and infrastructure resolved as one system.",
    image:
      "/__l5e/assets-v1/b4c45153-b6fc-49c1-93b5-ce421e0077af/og-equine-estates.png",
    imageAlt:
      "Peninsula Equine social card — Equine Estates. Aerial masterplan of a whole-property estate at dusk.",
  },
  {
    path: "/infrastructure",
    title: "Infrastructure | Peninsula Equine",
    description:
      "Fencing, water, drainage, tracks and yards — the unglamorous infrastructure that makes a property work.",
    image:
      "/__l5e/assets-v1/8fce50f6-6134-4757-b362-d88c9d6b0a61/og-infrastructure.png",
    imageAlt:
      "Peninsula Equine social card — Infrastructure. Engineered site works and groundworks in progress.",
  },
  {
    path: "/gallery",
    title: "Gallery | Peninsula Equine",
    description:
      "Selected works across arenas, stables and equine estates on the Mornington Peninsula.",
    image: "/__l5e/assets-v1/5d473238-b765-40e8-86cf-ce8e3947fd1a/og-gallery.png",
    imageAlt:
      "Peninsula Equine social card — Gallery. Main Ridge pavilion interior at golden hour.",
  },
  {
    path: "/about",
    title: "About | Peninsula Equine",
    description:
      "Peninsula Equine is built by horse people — arenas, stables and rural builds shaped by real experience with horses, ground and property life on the Mornington Peninsula.",
    image: "/__l5e/assets-v1/1d391d4c-696d-4196-8df4-20fa4c23bc38/og-about.png",
    imageAlt:
      "Peninsula Equine social card — About. Built by horse people on the Mornington Peninsula.",
  },
  {
    path: "/contact",
    title: "Contact | Peninsula Equine",
    description:
      "Talk to Peninsula Equine about an arena, stable, or whole-property build on the Mornington Peninsula.",
    image: "/__l5e/assets-v1/4f99afa6-c250-4084-9b63-93d2a4e9a11d/og-contact.png",
    imageAlt: "Peninsula Equine social card — Contact.",
  },
  {
    path: "/process",
    title: "Process | Peninsula Equine",
    description:
      "How Peninsula Equine takes a property from first assessment through resolved build.",
    image: "/__l5e/assets-v1/a022152e-e50e-45d5-969f-2ece81072971/og-process.png",
    imageAlt:
      "Peninsula Equine social card — Process. How we take a property from assessment through resolved build.",
  },
  {
    path: "/testimonials",
    title: "Testimonials | Peninsula Equine",
    description:
      "What owners, riders and trainers say about working with Peninsula Equine.",
    image:
      "/__l5e/assets-v1/2214b391-0534-4fab-a73d-4f7b8e4b7ef5/og-testimonials.png",
    imageAlt:
      "Peninsula Equine social card — Testimonials. What owners, riders and trainers say.",
  },
  {
    path: "/faq",
    title: "FAQ | Peninsula Equine",
    description:
      "Common questions about arenas, stables, estates, timelines and how Peninsula Equine works.",
    image: "/__l5e/assets-v1/f1d04f26-b54f-4fde-b601-96cca86611fe/og-faq.png",
    imageAlt:
      "Peninsula Equine social card — FAQ. Common questions answered.",
  },
  {
    path: "/privacy",
    title: "Privacy | Peninsula Equine",
    description: "Peninsula Equine privacy policy.",
    image: "/__l5e/assets-v1/d3ae53c0-9bd2-45cc-9312-46178f55bb9a/og-privacy.png",
    imageAlt: "Peninsula Equine social card — Privacy policy.",
  },
  {
    path: "/terms",
    title: "Terms | Peninsula Equine",
    description: "Peninsula Equine terms of use.",
    image: "/__l5e/assets-v1/a898c2d8-15d2-460b-9e8f-9ebca6d021d4/og-terms.png",
    imageAlt: "Peninsula Equine social card — Terms of use.",
  },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Replace an existing tag matching `pattern`, or inject `tag` before </head>. */
function upsert(html: string, pattern: RegExp, tag: string): string {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n  </head>`);
}

function rewriteHead(html: string, meta: RouteMeta): string {
  const url = `${SITE_ORIGIN}${meta.path}`;
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const imagePath = meta.image ?? DEFAULT_OG_IMAGE;
  const imageUrl = `${SITE_ORIGIN}${imagePath}`;
  const imageAlt = escapeHtml(meta.imageAlt ?? DEFAULT_OG_ALT);

  let out = html;

  out = upsert(out, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = upsert(
    out,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${desc}" />`,
  );
  out = upsert(
    out,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${url}" />`,
  );

  // Open Graph
  out = upsert(
    out,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  out = upsert(
    out,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${url}" />`,
  );
  out = upsert(
    out,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${desc}" />`,
  );
  out = upsert(
    out,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${imageUrl}" />`,
  );
  out = upsert(
    out,
    /<meta\s+property=["']og:image:alt["'][^>]*>/i,
    `<meta property="og:image:alt" content="${imageAlt}" />`,
  );

  // Twitter
  out = upsert(
    out,
    /<meta\s+name=["']twitter:card["'][^>]*>/i,
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  out = upsert(
    out,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${title}" />`,
  );
  out = upsert(
    out,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${desc}" />`,
  );
  out = upsert(
    out,
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    `<meta name="twitter:image" content="${imageUrl}" />`,
  );
  out = upsert(
    out,
    /<meta\s+name=["']twitter:image:alt["'][^>]*>/i,
    `<meta name="twitter:image:alt" content="${imageAlt}" />`,
  );

  return out;
}

function main() {
  const indexPath = resolve(DIST, "index.html");
  const template = readFileSync(indexPath, "utf8");

  writeFileSync(
    indexPath,
    rewriteHead(template, {
      path: "/",
      title: "Peninsula Equine — Premium Equine Environments",
      description:
        "Arenas, stables, equine estates, recovery stations and infrastructure — built by riders, crafted for performance. Mornington Peninsula.",
      image: DEFAULT_OG_IMAGE,
      imageAlt: "Sliding stop — Peninsula Equine.",
    }),
  );

  let written = 0;
  for (const meta of ROUTES) {
    const outPath = resolve(DIST, meta.path.replace(/^\//, ""), "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, rewriteHead(template, meta));
    written++;
  }
  console.log(`prerendered ${written} route(s) + root index.html`);
}

main();

