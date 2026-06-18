/**
 * Post-prerender verification.
 *
 * Walks every prerendered route's dist/<route>/index.html and asserts
 * the head ships:
 *   - <title> matching the route's expected title
 *   - <meta name="description">
 *   - <link rel="canonical"> self-referencing the route (not the homepage)
 *   - og:title / og:url / og:description / og:image / og:image:alt
 *   - twitter:card=summary_large_image, twitter:title,
 *     twitter:description, twitter:image, twitter:image:alt
 *   - non-empty, route-specific image alt text (not just "Peninsula Equine")
 *
 * Exits non-zero on any failure so the postbuild chain fails loudly.
 *
 * Keep the ROUTES list in sync with scripts/prerender.ts. Single source
 * of truth would be nicer; intentionally duplicated to keep this
 * verifier independent — if prerender silently regresses a route, this
 * file still knows what to expect.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const SITE_ORIGIN = "https://peninsulaequine.com.au";
const DIST = resolve("dist");

interface Expectation {
  path: string;
  titleIncludes: string;
}

const ROUTES: Expectation[] = [
  { path: "/", titleIncludes: "Peninsula Equine" },
  { path: "/arenas", titleIncludes: "Arenas" },
  { path: "/stables", titleIncludes: "Stables" },
  { path: "/equine-estates", titleIncludes: "Whole-Property" },
  { path: "/infrastructure", titleIncludes: "Infrastructure" },
  { path: "/gallery", titleIncludes: "Gallery" },
  { path: "/about", titleIncludes: "About" },
  { path: "/contact", titleIncludes: "Contact" },
  { path: "/process", titleIncludes: "Process" },
  { path: "/testimonials", titleIncludes: "Testimonials" },
  { path: "/faq", titleIncludes: "FAQ" },
  { path: "/privacy", titleIncludes: "Privacy" },
  { path: "/terms", titleIncludes: "Terms" },
];

type Failure = { route: string; check: string; detail: string };
const failures: Failure[] = [];

function fail(route: string, check: string, detail: string): void {
  failures.push({ route, check, detail });
}

/** Extract the value of an attribute from the first tag matching `tagRe`. */
function extract(html: string, tagRe: RegExp, attr: string): string | null {
  const tag = html.match(tagRe)?.[0];
  if (!tag) return null;
  // Match attr="..." or attr='...'.
  const m = tag.match(new RegExp(`${attr}=["']([^"']*)["']`, "i"));
  return m ? m[1] : null;
}

function extractTitle(html: string): string | null {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
}

function indexPathFor(routePath: string): string {
  if (routePath === "/") return resolve(DIST, "index.html");
  return resolve(DIST, routePath.replace(/^\//, ""), "index.html");
}

function check(route: Expectation): void {
  const file = indexPathFor(route.path);
  if (!existsSync(file)) {
    fail(route.path, "file", `missing prerendered HTML at ${file}`);
    return;
  }
  const html = readFileSync(file, "utf8");
  const expectedUrl = `${SITE_ORIGIN}${route.path === "/" ? "/" : route.path}`;

  // <title>
  const title = extractTitle(html);
  if (!title) fail(route.path, "title", "no <title> tag");
  else if (!title.includes(route.titleIncludes)) {
    fail(
      route.path,
      "title",
      `expected to include "${route.titleIncludes}", got "${title}"`,
    );
  }

  // description
  const desc = extract(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    "content",
  );
  if (!desc) fail(route.path, "description", "missing meta description");
  else if (desc.length < 30) {
    fail(route.path, "description", `too short (${desc.length} chars)`);
  }

  // canonical — must self-reference, not point at homepage for non-root routes
  const canonical = html
    .match(/<link\s+rel=["']canonical["'][^>]*>/i)?.[0]
    ?.match(/href=["']([^"']+)["']/i)?.[1];
  if (!canonical) fail(route.path, "canonical", "missing <link rel=canonical>");
  else if (route.path === "/") {
    if (canonical !== expectedUrl && canonical !== `${SITE_ORIGIN}`) {
      fail(route.path, "canonical", `expected ${expectedUrl}, got ${canonical}`);
    }
  } else if (canonical !== expectedUrl) {
    fail(
      route.path,
      "canonical",
      `expected ${expectedUrl}, got ${canonical} (likely still pointing at homepage)`,
    );
  }

  // og:url — must self-reference
  const ogUrl = extract(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    "content",
  );
  if (!ogUrl) fail(route.path, "og:url", "missing og:url");
  else if (route.path !== "/" && ogUrl !== expectedUrl) {
    fail(route.path, "og:url", `expected ${expectedUrl}, got ${ogUrl}`);
  }

  // og:title / og:description
  const ogTitle = extract(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    "content",
  );
  if (!ogTitle) fail(route.path, "og:title", "missing og:title");
  const ogDesc = extract(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    "content",
  );
  if (!ogDesc) fail(route.path, "og:description", "missing og:description");

  // og:image — absolute URL, on the project origin
  const ogImage = extract(
    html,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    "content",
  );
  if (!ogImage) fail(route.path, "og:image", "missing og:image");
  else if (!/^https?:\/\//.test(ogImage)) {
    fail(route.path, "og:image", `not absolute: ${ogImage}`);
  } else if (!ogImage.startsWith(SITE_ORIGIN)) {
    fail(
      route.path,
      "og:image",
      `not on project origin (${SITE_ORIGIN}): ${ogImage}`,
    );
  }

  // og:image:alt — must be specific (not the bare brand name)
  const ogAlt = extract(
    html,
    /<meta\s+property=["']og:image:alt["'][^>]*>/i,
    "content",
  );
  if (!ogAlt) fail(route.path, "og:image:alt", "missing og:image:alt");
  else if (ogAlt.trim().length < 12) {
    fail(
      route.path,
      "og:image:alt",
      `too short to be descriptive: "${ogAlt}"`,
    );
  } else if (/^peninsula equine\.?$/i.test(ogAlt.trim())) {
    fail(
      route.path,
      "og:image:alt",
      `placeholder alt — needs route-specific description: "${ogAlt}"`,
    );
  }

  // Twitter card + image
  const twCard = extract(
    html,
    /<meta\s+name=["']twitter:card["'][^>]*>/i,
    "content",
  );
  if (twCard !== "summary_large_image") {
    fail(
      route.path,
      "twitter:card",
      `expected summary_large_image, got ${twCard ?? "missing"}`,
    );
  }
  const twImage = extract(
    html,
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    "content",
  );
  if (!twImage) fail(route.path, "twitter:image", "missing twitter:image");
  else if (twImage !== ogImage) {
    fail(
      route.path,
      "twitter:image",
      `should match og:image — og:${ogImage} vs twitter:${twImage}`,
    );
  }
  const twAlt = extract(
    html,
    /<meta\s+name=["']twitter:image:alt["'][^>]*>/i,
    "content",
  );
  if (!twAlt) fail(route.path, "twitter:image:alt", "missing twitter:image:alt");
  else if (twAlt !== ogAlt) {
    fail(
      route.path,
      "twitter:image:alt",
      `should match og:image:alt`,
    );
  }
  const twTitle = extract(
    html,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    "content",
  );
  if (!twTitle) fail(route.path, "twitter:title", "missing twitter:title");
  const twDesc = extract(
    html,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    "content",
  );
  if (!twDesc)
    fail(route.path, "twitter:description", "missing twitter:description");
}

for (const r of ROUTES) check(r);

if (failures.length > 0) {
  console.error(
    `\n✗ prerender verification failed: ${failures.length} issue(s) across ${ROUTES.length} routes\n`,
  );
  for (const f of failures) {
    console.error(`  [${f.route}] ${f.check}: ${f.detail}`);
  }
  console.error("");
  process.exit(1);
}

console.log(
  `✓ prerender verification passed: ${ROUTES.length} routes, all head tags present and self-referencing`,
);
