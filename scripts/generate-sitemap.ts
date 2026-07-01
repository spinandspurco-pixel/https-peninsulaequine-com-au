/**
 * Generates public/sitemap.xml from a single source of truth.
 *
 * Runs automatically before `vite dev` (predev) and `vite build` (prebuild)
 * so newly added public routes stay in sync without manual edits.
 *
 * To add a route:
 *   - Static page   → add to STATIC_ROUTES below
 *   - Dynamic page  → extend the dynamic collectors (services, case studies,
 *                     trainers) or add a new collector.
 *
 * Anything gated behind auth (/hq/*, /portal, /employee, /schedule,
 * /bookings, /documents, /trainer/*, /staff/*, /admin/*), redirects,
 * callbacks, /thank-you, and 404 catch-alls are intentionally excluded.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { services } from "../src/data/content";
import { CASE_STUDIES } from "../src/data/caseStudyData";

const BASE_URL = "https://peninsulaequine.systems";

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface SitemapEntry {
  path: string;
  changefreq?: ChangeFreq;
  priority?: string;
  lastmod?: string;
}

// ── Static public routes ──────────────────────────────────────────────
const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },

  // Capability pages
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/arenas", changefreq: "monthly", priority: "0.85" },
  { path: "/stables", changefreq: "monthly", priority: "0.85" },
  { path: "/infrastructure", changefreq: "monthly", priority: "0.8" },
  { path: "/lumenarc", changefreq: "monthly", priority: "0.8" },

  // Instructional
  { path: "/lessons", changefreq: "monthly", priority: "0.8" },
  { path: "/lessons/book", changefreq: "monthly", priority: "0.8" },
  { path: "/consult", changefreq: "monthly", priority: "0.8" },
  { path: "/consult/request", changefreq: "monthly", priority: "0.8" },
  { path: "/pricing", changefreq: "monthly", priority: "0.7" },
  { path: "/group-booking", changefreq: "monthly", priority: "0.6" },
  { path: "/estimate", changefreq: "monthly", priority: "0.6" },
  { path: "/site-assessment", changefreq: "monthly", priority: "0.7" },

  // Editorial
  { path: "/selected-works", changefreq: "weekly", priority: "0.9" },
  { path: "/selected-works/aberdeen", changefreq: "monthly", priority: "0.8" },
  { path: "/selected-works/main-ridge-pavilion", changefreq: "monthly", priority: "0.8" },
  { path: "/field-notes", changefreq: "weekly", priority: "0.8" },
  { path: "/field-notes/covered-arena-stables-build", changefreq: "weekly", priority: "0.7" },

  // Guides
  { path: "/guides/dressage-arena-construction", changefreq: "monthly", priority: "0.7" },

  // Events
  { path: "/events", changefreq: "weekly", priority: "0.7" },

  // Organisation
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.9" },

  // Legal
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

// ── Dynamic collectors ────────────────────────────────────────────────
const SERVICE_ROUTES: SitemapEntry[] = services.map((s) => ({
  path: `/services/${s.id}`,
  changefreq: "monthly",
  priority: "0.75",
}));

// CASE_STUDIES power both /selected-works/:custom and /project/:slug.
// Emit /project/:slug for coverage without duplicating the two custom
// pages already listed in STATIC_ROUTES.
const CUSTOM_CASE_STUDY_PATHS = new Set([
  "/selected-works/aberdeen",
  "/selected-works/main-ridge-pavilion",
]);
const CASE_STUDY_ROUTES: SitemapEntry[] = CASE_STUDIES.map((c) => ({
  path: `/project/${c.slug}`,
  changefreq: "monthly",
  priority: "0.7",
})).filter((e) => !CUSTOM_CASE_STUDY_PATHS.has(e.path));

// Trainers — kept in the TrainerProfile page's TRAINERS map. Duplicated
// here as a small allowlist so the sitemap doesn't need to import a React
// module. Update when trainers are added.
const TRAINER_SLUGS = ["glenn-browitt", "ciro-postiglione"];
const TRAINER_ROUTES: SitemapEntry[] = TRAINER_SLUGS.map((slug) => ({
  path: `/trainers/${slug}`,
  changefreq: "monthly",
  priority: "0.6",
}));

// ── Assemble & de-duplicate ───────────────────────────────────────────
function dedupe(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Map<string, SitemapEntry>();
  for (const e of entries) if (!seen.has(e.path)) seen.set(e.path, e);
  return Array.from(seen.values());
}

const entries = dedupe([
  ...STATIC_ROUTES,
  ...SERVICE_ROUTES,
  ...CASE_STUDY_ROUTES,
  ...TRAINER_ROUTES,
]);

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateSitemap(rows: SitemapEntry[]) {
  const urls = rows.map((e) =>
    [
      `  <url>`,
      `    <loc>${xmlEscape(BASE_URL + e.path)}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
