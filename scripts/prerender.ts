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

interface RouteMeta {
  path: string;
  title: string;
  description: string;
}

// Keep in sync with public/sitemap.xml.
const ROUTES: RouteMeta[] = [
  {
    path: "/arenas",
    title: "Arenas | Peninsula Equine",
    description:
      "Sand, rubber and all-weather arenas engineered for performance — built by riders on the Mornington Peninsula.",
  },
  {
    path: "/stables",
    title: "Stables | Peninsula Equine",
    description:
      "Bespoke stables, barns and shelters designed around how horses actually live, work and recover.",
  },
  {
    path: "/equine-estates",
    title: "Whole-Property Planning | Peninsula Equine",
    description:
      "Whole-property equine estate planning — arenas, stables, paddocks and infrastructure resolved as one system.",
  },
  {
    path: "/infrastructure",
    title: "Infrastructure | Peninsula Equine",
    description:
      "Fencing, water, drainage, tracks and yards — the unglamorous infrastructure that makes a property work.",
  },
  {
    path: "/gallery",
    title: "Gallery | Peninsula Equine",
    description:
      "Selected works across arenas, stables and equine estates on the Mornington Peninsula.",
  },
  {
    path: "/about",
    title: "About | Peninsula Equine",
    description:
      "Peninsula Equine is built by horse people — arenas, stables and rural builds shaped by real experience with horses, ground and property life on the Mornington Peninsula.",
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

function rewriteHead(html: string, meta: RouteMeta): string {
  const url = `${SITE_ORIGIN}${meta.path}`;
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);

  let out = html;

  // <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // <meta name="description">
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${desc}" />`,
  );

  // <link rel="canonical">
  out = out.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${url}" />`,
  );

  // og:title / og:url / og:description
  out = out.replace(
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${url}" />`,
  );
  out = out.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${desc}" />`,
  );

  // twitter:title
  out = out.replace(
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${title}" />`,
  );

  return out;
}

function main() {
  const indexPath = resolve(DIST, "index.html");
  const template = readFileSync(indexPath, "utf8");

  // Rewrite the root index.html as well so og:description (which is
  // missing in source) is present on the homepage's static head.
  writeFileSync(
    indexPath,
    rewriteHead(template, {
      path: "/",
      title: "Peninsula Equine — Premium Equine Environments",
      description:
        "Arenas, stables, equine estates, recovery stations and infrastructure — built by riders, crafted for performance. Mornington Peninsula.",
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
