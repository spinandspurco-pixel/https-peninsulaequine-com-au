/**
 * Pure, side-effect-free core of the prerender verifier.
 *
 * Lives separately from `verify-prerender.ts` so the CLI (file I/O,
 * argv parsing, GitHub Actions output, process.exit) stays out of unit
 * tests. Tests import `checkHtml` and feed it inline HTML fixtures.
 */

export type FailureCode =
  | "missing"
  | "mismatch"
  | "too-short"
  | "placeholder"
  | "not-absolute"
  | "wrong-origin"
  | "file-missing"
  | "schema";

export interface Failure {
  /** Route path the failure was found on (e.g. `/about`). */
  route: string;
  /** Symbolic name of the check that failed (e.g. `og:image`). */
  check: string;
  /** Machine-readable failure category. */
  code: FailureCode;
  /** CSS-style locator (or file path) of the offending element. */
  path: string;
  /** The value the verifier expected, when applicable. */
  expected: string | null;
  /** The value the verifier actually observed, when applicable. */
  received: string | null;
  /** Human-readable summary, derived from the structured fields. */
  detail: string;
}

export interface Expectation {
  path: string;
  titleIncludes: string;
}

export const metaName = (n: string) => `meta[name="${n}"]`;
export const metaProp = (p: string) => `meta[property="${p}"]`;

export function buildDetail(
  code: FailureCode,
  check: string,
  expected: string | null,
  received: string | null,
  path: string,
): string {
  switch (code) {
    case "missing":
      return `missing ${check}`;
    case "mismatch":
      return `expected ${JSON.stringify(expected)}, got ${JSON.stringify(received)}`;
    case "too-short":
      return `${check} too short${received != null ? ` (${received})` : ""}`;
    case "placeholder":
      return `${check} is a placeholder — needs route-specific value: ${JSON.stringify(received)}`;
    case "not-absolute":
      return `${check} is not an absolute URL: ${received}`;
    case "wrong-origin":
      return `${check} not on expected origin ${expected}: ${received}`;
    case "file-missing":
      return `missing prerendered HTML at ${path}`;
    case "schema":
      return `schema validation failed: ${received}`;
  }
}

/** Extract the value of an attribute from the first tag matching `tagRe`. */
export function extract(
  html: string,
  tagRe: RegExp,
  attr: string,
): string | null {
  const tag = html.match(tagRe)?.[0];
  if (!tag) return null;
  const m = tag.match(new RegExp(`${attr}=["']([^"']*)["']`, "i"));
  return m ? m[1] : null;
}

export function extractTitle(html: string): string | null {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
}

/**
 * Run every head-tag check against a single prerendered HTML string and
 * return the list of structured failures (empty when the route passes).
 *
 * Pure: no file I/O, no globals, no exits.
 */
export function checkHtml(
  route: Expectation,
  html: string,
  siteOrigin: string,
): Failure[] {
  const failures: Failure[] = [];
  const push = (
    check: string,
    code: FailureCode,
    path: string,
    opts: {
      expected?: string | null;
      received?: string | null;
      detail?: string;
    } = {},
  ): void => {
    const expected = opts.expected ?? null;
    const received = opts.received ?? null;
    const detail =
      opts.detail ?? buildDetail(code, check, expected, received, path);
    failures.push({
      route: route.path,
      check,
      code,
      path,
      expected,
      received,
      detail,
    });
  };

  const expectedUrl = `${siteOrigin}${route.path === "/" ? "/" : route.path}`;

  // <title>
  const title = extractTitle(html);
  if (!title) {
    push("title", "missing", "head > title");
  } else if (!title.includes(route.titleIncludes)) {
    push("title", "mismatch", "head > title", {
      expected: `*${route.titleIncludes}*`,
      received: title,
      detail: `expected to include "${route.titleIncludes}", got "${title}"`,
    });
  }

  // description
  const desc = extract(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    "content",
  );
  if (!desc) {
    push("description", "missing", metaName("description"));
  } else if (desc.length < 30) {
    push("description", "too-short", metaName("description"), {
      expected: ">=30 chars",
      received: `${desc.length} chars`,
    });
  }

  // canonical
  const canonical = html
    .match(/<link\s+rel=["']canonical["'][^>]*>/i)?.[0]
    ?.match(/href=["']([^"']+)["']/i)?.[1];
  const canonicalPath = `link[rel="canonical"]`;
  if (!canonical) {
    push("canonical", "missing", canonicalPath);
  } else if (route.path === "/") {
    if (canonical !== expectedUrl && canonical !== siteOrigin) {
      push("canonical", "mismatch", canonicalPath, {
        expected: expectedUrl,
        received: canonical,
      });
    }
  } else if (canonical !== expectedUrl) {
    push("canonical", "mismatch", canonicalPath, {
      expected: expectedUrl,
      received: canonical,
      detail: `expected ${expectedUrl}, got ${canonical} (likely still pointing at homepage)`,
    });
  }

  // og:url
  const ogUrl = extract(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    "content",
  );
  if (!ogUrl) {
    push("og:url", "missing", metaProp("og:url"));
  } else if (route.path !== "/" && ogUrl !== expectedUrl) {
    push("og:url", "mismatch", metaProp("og:url"), {
      expected: expectedUrl,
      received: ogUrl,
    });
  }

  // og:title / og:description
  const ogTitle = extract(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    "content",
  );
  if (!ogTitle) push("og:title", "missing", metaProp("og:title"));
  const ogDesc = extract(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    "content",
  );
  if (!ogDesc) push("og:description", "missing", metaProp("og:description"));

  // og:image
  const ogImage = extract(
    html,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    "content",
  );
  if (!ogImage) {
    push("og:image", "missing", metaProp("og:image"));
  } else if (!/^https?:\/\//.test(ogImage)) {
    push("og:image", "not-absolute", metaProp("og:image"), {
      expected: "absolute http(s) URL",
      received: ogImage,
    });
  } else if (!ogImage.startsWith(siteOrigin)) {
    push("og:image", "wrong-origin", metaProp("og:image"), {
      expected: siteOrigin,
      received: ogImage,
    });
  }

  // og:image:alt
  const ogAlt = extract(
    html,
    /<meta\s+property=["']og:image:alt["'][^>]*>/i,
    "content",
  );
  if (!ogAlt) {
    push("og:image:alt", "missing", metaProp("og:image:alt"));
  } else if (ogAlt.trim().length < 12) {
    push("og:image:alt", "too-short", metaProp("og:image:alt"), {
      expected: ">=12 chars",
      received: ogAlt,
    });
  } else if (/^peninsula equine\.?$/i.test(ogAlt.trim())) {
    push("og:image:alt", "placeholder", metaProp("og:image:alt"), {
      expected: "route-specific description",
      received: ogAlt,
    });
  }

  // Twitter
  const twCard = extract(
    html,
    /<meta\s+name=["']twitter:card["'][^>]*>/i,
    "content",
  );
  if (twCard !== "summary_large_image") {
    if (twCard == null) {
      push("twitter:card", "missing", metaName("twitter:card"));
    } else {
      push("twitter:card", "mismatch", metaName("twitter:card"), {
        expected: "summary_large_image",
        received: twCard,
      });
    }
  }
  const twImage = extract(
    html,
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    "content",
  );
  if (!twImage) {
    push("twitter:image", "missing", metaName("twitter:image"));
  } else if (twImage !== ogImage) {
    push("twitter:image", "mismatch", metaName("twitter:image"), {
      expected: ogImage,
      received: twImage,
      detail: `should match og:image — og:${ogImage} vs twitter:${twImage}`,
    });
  }
  const twAlt = extract(
    html,
    /<meta\s+name=["']twitter:image:alt["'][^>]*>/i,
    "content",
  );
  if (!twAlt) {
    push("twitter:image:alt", "missing", metaName("twitter:image:alt"));
  } else if (twAlt !== ogAlt) {
    push("twitter:image:alt", "mismatch", metaName("twitter:image:alt"), {
      expected: ogAlt,
      received: twAlt,
      detail: "should match og:image:alt",
    });
  }
  const twTitle = extract(
    html,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    "content",
  );
  if (!twTitle) push("twitter:title", "missing", metaName("twitter:title"));
  const twDesc = extract(
    html,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    "content",
  );
  if (!twDesc)
    push("twitter:description", "missing", metaName("twitter:description"));

  return failures;
}
