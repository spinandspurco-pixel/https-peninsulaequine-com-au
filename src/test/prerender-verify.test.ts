import { describe, it, expect } from "vitest";
import {
  checkHtml,
  type Expectation,
  type Failure,
} from "../../scripts/verify-prerender-core";

const SITE = "https://peninsulaequine.com.au";

const ROUTE: Expectation = { path: "/about", titleIncludes: "About" };

/**
 * Build a fully-valid prerendered head, then let individual tests
 * mutate one tag to exercise a single failure mode. Anything not
 * overridden must produce a passing check, otherwise every test would
 * be polluted with unrelated failures.
 */
function buildHtml(overrides: Partial<Record<string, string | null>> = {}): string {
  const ogImage = `${SITE}/og/about.jpg`;
  const ogAlt =
    "Aerial view of a finished arena at the Mornington Peninsula site";
  const url = `${SITE}/about`;

  const tags: Record<string, string | null> = {
    title: `<title>About — Peninsula Equine</title>`,
    description: `<meta name="description" content="About Peninsula Equine — equine infrastructure built properly on the Mornington Peninsula.">`,
    canonical: `<link rel="canonical" href="${url}">`,
    "og:url": `<meta property="og:url" content="${url}">`,
    "og:title": `<meta property="og:title" content="About — Peninsula Equine">`,
    "og:description": `<meta property="og:description" content="About Peninsula Equine.">`,
    "og:image": `<meta property="og:image" content="${ogImage}">`,
    "og:image:alt": `<meta property="og:image:alt" content="${ogAlt}">`,
    "twitter:card": `<meta name="twitter:card" content="summary_large_image">`,
    "twitter:title": `<meta name="twitter:title" content="About — Peninsula Equine">`,
    "twitter:description": `<meta name="twitter:description" content="About Peninsula Equine.">`,
    "twitter:image": `<meta name="twitter:image" content="${ogImage}">`,
    "twitter:image:alt": `<meta name="twitter:image:alt" content="${ogAlt}">`,
    ...overrides,
  };

  const head = Object.values(tags)
    .filter((t): t is string => typeof t === "string")
    .join("\n    ");

  return `<!doctype html><html><head>\n    ${head}\n</head><body></body></html>`;
}

function findFailure(failures: Failure[], check: string): Failure | undefined {
  return failures.find((f) => f.check === check);
}

describe("prerender verifier: structured failure fields", () => {
  it("returns no failures for a fully-valid head", () => {
    const failures = checkHtml(ROUTE, buildHtml(), SITE);
    expect(failures).toEqual([]);
  });

  describe("missing tags", () => {
    it("reports og:image as missing with null expected/received", () => {
      // Drop og:image entirely; twitter:image then mismatches against
      // an undefined og:image, so we ignore that downstream failure.
      const failures = checkHtml(
        ROUTE,
        buildHtml({ "og:image": null }),
        SITE,
      );
      const f = findFailure(failures, "og:image");
      expect(f).toBeDefined();
      expect(f).toMatchObject({
        route: "/about",
        check: "og:image",
        code: "missing",
        path: 'meta[property="og:image"]',
        expected: null,
        received: null,
        detail: "missing og:image",
      });
    });

    it("reports canonical as missing with the link locator", () => {
      const failures = checkHtml(
        ROUTE,
        buildHtml({ canonical: null }),
        SITE,
      );
      const f = findFailure(failures, "canonical");
      expect(f).toMatchObject({
        check: "canonical",
        code: "missing",
        path: 'link[rel="canonical"]',
        expected: null,
        received: null,
      });
    });

    it("reports a missing <title> with the head>title locator", () => {
      const failures = checkHtml(ROUTE, buildHtml({ title: null }), SITE);
      const f = findFailure(failures, "title");
      expect(f).toMatchObject({
        check: "title",
        code: "missing",
        path: "head > title",
        expected: null,
        received: null,
      });
    });

    it("reports twitter:image as missing", () => {
      const failures = checkHtml(
        ROUTE,
        buildHtml({ "twitter:image": null }),
        SITE,
      );
      const f = findFailure(failures, "twitter:image");
      expect(f).toMatchObject({
        code: "missing",
        path: 'meta[name="twitter:image"]',
        expected: null,
        received: null,
      });
    });
  });

  describe("mismatched tags", () => {
    it("populates expected and received for a wrong canonical", () => {
      const wrong = `${SITE}/about-us`;
      const failures = checkHtml(
        ROUTE,
        buildHtml({
          canonical: `<link rel="canonical" href="${wrong}">`,
        }),
        SITE,
      );
      const f = findFailure(failures, "canonical");
      expect(f).toMatchObject({
        check: "canonical",
        code: "mismatch",
        path: 'link[rel="canonical"]',
        expected: `${SITE}/about`,
        received: wrong,
      });
      // Detail should mention both sides for human readability.
      expect(f?.detail).toContain(`${SITE}/about`);
      expect(f?.detail).toContain(wrong);
    });

    it("populates expected and received for a wrong twitter:card", () => {
      const failures = checkHtml(
        ROUTE,
        buildHtml({
          "twitter:card": `<meta name="twitter:card" content="summary">`,
        }),
        SITE,
      );
      const f = findFailure(failures, "twitter:card");
      expect(f).toMatchObject({
        code: "mismatch",
        path: 'meta[name="twitter:card"]',
        expected: "summary_large_image",
        received: "summary",
      });
    });

    it("flags a title that doesn't include the expected substring", () => {
      const failures = checkHtml(
        ROUTE,
        buildHtml({ title: `<title>Home — Peninsula Equine</title>` }),
        SITE,
      );
      const f = findFailure(failures, "title");
      expect(f).toMatchObject({
        code: "mismatch",
        path: "head > title",
        expected: "*About*",
        received: "Home — Peninsula Equine",
      });
    });

    it("flags og:image on the wrong origin with the wrong-origin code", () => {
      const wrong = "https://cdn.example.com/og/about.jpg";
      const failures = checkHtml(
        ROUTE,
        buildHtml({
          "og:image": `<meta property="og:image" content="${wrong}">`,
          // Keep twitter:image aligned to suppress the cascading mismatch.
          "twitter:image": `<meta name="twitter:image" content="${wrong}">`,
        }),
        SITE,
      );
      const f = findFailure(failures, "og:image");
      expect(f).toMatchObject({
        code: "wrong-origin",
        path: 'meta[property="og:image"]',
        expected: SITE,
        received: wrong,
      });
    });

    it("flags a non-absolute og:image with the not-absolute code", () => {
      const wrong = "/og/about.jpg";
      const failures = checkHtml(
        ROUTE,
        buildHtml({
          "og:image": `<meta property="og:image" content="${wrong}">`,
          "twitter:image": `<meta name="twitter:image" content="${wrong}">`,
        }),
        SITE,
      );
      const f = findFailure(failures, "og:image");
      expect(f).toMatchObject({
        code: "not-absolute",
        path: 'meta[property="og:image"]',
        expected: "absolute http(s) URL",
        received: wrong,
      });
    });

    it("flags a too-short description with character-count received", () => {
      const failures = checkHtml(
        ROUTE,
        buildHtml({
          description: `<meta name="description" content="Too short.">`,
        }),
        SITE,
      );
      const f = findFailure(failures, "description");
      expect(f).toMatchObject({
        code: "too-short",
        path: 'meta[name="description"]',
        expected: ">=30 chars",
        received: "10 chars",
      });
    });

    it("flags a placeholder og:image:alt", () => {
      const failures = checkHtml(
        ROUTE,
        buildHtml({
          "og:image:alt": `<meta property="og:image:alt" content="Peninsula Equine">`,
          "twitter:image:alt": `<meta name="twitter:image:alt" content="Peninsula Equine">`,
        }),
        SITE,
      );
      const f = findFailure(failures, "og:image:alt");
      expect(f).toMatchObject({
        code: "placeholder",
        path: 'meta[property="og:image:alt"]',
        expected: "route-specific description",
        received: "Peninsula Equine",
      });
    });
  });

  it("every failure carries the full structured field set", () => {
    // Two simultaneous failures, one missing + one mismatch, to confirm
    // both shapes carry route/check/code/path/expected/received/detail.
    const failures = checkHtml(
      ROUTE,
      buildHtml({
        "og:image": null,
        "twitter:image": null,
        canonical: `<link rel="canonical" href="${SITE}/">`,
      }),
      SITE,
    );
    expect(failures.length).toBeGreaterThanOrEqual(2);
    for (const f of failures) {
      expect(f).toEqual(
        expect.objectContaining({
          route: expect.any(String),
          check: expect.any(String),
          code: expect.any(String),
          path: expect.any(String),
          detail: expect.any(String),
        }),
      );
      expect(["string", "object"]).toContain(typeof f.expected); // string | null
      expect(["string", "object"]).toContain(typeof f.received);
    }
  });
});
