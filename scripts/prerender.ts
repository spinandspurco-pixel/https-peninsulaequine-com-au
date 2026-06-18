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

// Sitewide fallback OG image — the homepage sliding-stop hero. Used by
// routes without a more specific hero (contact, process, testimonials,
// faq, privacy, terms) and as the og:image baked into the static
// index.html for the homepage.
const DEFAULT_OG_IMAGE =
  "/__l5e/assets-v1/a006cbde-92fd-4c76-a17d-db3530672d7a/sliding-stop-hero.png";

interface RouteMeta {
  path: string;
  title: string;
  description: string;
  /** Absolute path under the project origin, e.g. "/__l5e/..." */
  image?: string;
  imageAlt?: string;
}

// Keep in sync with public/sitemap.xml.
const ROUTES: RouteMeta[] = [
  {
    path: "/arenas",
    title: "Arenas | Peninsula Equine",
    description:
      "Sand, rubber and all-weather arenas engineered for performance — built by riders on the Mornington Peninsula.",
    image:
      "/__l5e/assets-v1/37069802-9f36-4073-aed4-0659270ccafe/pe-arena-grading.png",
    imageAlt:
      "Covered equestrian arena interior with engineered footing under controlled light.",
  },
  {
    path: "/stables",
    title: "Stables | Peninsula Equine",
    description:
      "Bespoke stables, barns and shelters designed around how horses actually live, work and recover.",
    image:
      "/__l5e/assets-v1/94caa649-4df5-456a-9871-684b90f34580/pe-stable-aisle-cinematic.png",
    imageAlt: "Cinematic stable aisle interior.",
  },
  {
    path: "/equine-estates",
    title: "Whole-Property Planning | Peninsula Equine",
    description:
      "Whole-property equine estate planning — arenas, stables, paddocks and infrastructure resolved as one system.",
    image:
      "/__l5e/assets-v1/8564a7af-7ef2-4267-9ee1-6b10228eecbe/pe-estate-aerial-masterplan.png",
    imageAlt: "Aerial masterplan of an equine estate at dusk.",
  },
  {
    path: "/infrastructure",
    title: "Infrastructure | Peninsula Equine",
    description:
      "Fencing, water, drainage, tracks and yards — the unglamorous infrastructure that makes a property work.",
    image:
      "/__l5e/assets-v1/743392aa-050a-4f00-89df-2e018966f2c0/pe-groundworks-dozer.png",
    imageAlt: "Engineered site works and infrastructure in progress.",
  },
  {
    path: "/gallery",
    title: "Gallery | Peninsula Equine",
    description:
      "Selected works across arenas, stables and equine estates on the Mornington Peninsula.",
    image:
      "/__l5e/assets-v1/8da1740b-3fe0-4f86-b3bf-02bfca528210/main-ridge-pavilion-wide-fireplace-table.png",
    imageAlt: "Main Ridge pavilion interior at golden hour.",
  },
  {
    path: "/about",
    title: "About | Peninsula Equine",
    description:
      "Peninsula Equine is built by horse people — arenas, stables and rural builds shaped by real experience with horses, ground and property life on the Mornington Peninsula.",
    image:
      "/__l5e/assets-v1/8da1740b-3fe0-4f86-b3bf-02bfca528210/main-ridge-pavilion-wide-fireplace-table.png",
    imageAlt: "Main Ridge pavilion interior at golden hour.",
  },
  {
    path: "/contact",
    title: "Contact | Peninsula Equine",
    description:
      "Talk to Peninsula Equine about an arena, stable, or whole-property build on the Mornington Peninsula.",
  },
  {
    path: "/process",
    title: "Process | Peninsula Equine",
    description:
      "How Peninsula Equine takes a property from first assessment through resolved build.",
  },
  {
    path: "/testimonials",
    title: "Testimonials | Peninsula Equine",
    description:
      "What owners, riders and trainers say about working with Peninsula Equine.",
  },
  {
    path: "/faq",
    title: "FAQ | Peninsula Equine",
    description:
      "Common questions about arenas, stables, estates, timelines and how Peninsula Equine works.",
  },
  {
    path: "/privacy",
    title: "Privacy | Peninsula Equine",
    description: "Peninsula Equine privacy policy.",
  },
  {
    path: "/terms",
    title: "Terms | Peninsula Equine",
    description: "Peninsula Equine terms of use.",
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
  const imageAlt = escapeHtml(meta.imageAlt ?? meta.title);

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

