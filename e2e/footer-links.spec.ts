import { test, expect, type Page } from "@playwright/test";

/**
 * Footer link contract.
 *
 * Locks in that every footer link — capability anchors, studio pages, and the
 * bottom-bar legal/staff row — returns HTTP 200 and renders its expected H1
 * (or, for in-page anchors, scrolls to a section with the expected id).
 *
 * Tagged @anon and @mobile so it runs in both anon-desktop and anon-mobile
 * projects defined in playwright.config.ts.
 */

type PageCheck = { href: string; h1: RegExp };
type AnchorCheck = { href: string; sectionId: string };

const PAGE_LINKS: PageCheck[] = [
  { href: "/lumenarc", h1: /lumenarc/i },
  { href: "/selected-works", h1: /works that.*speak for themselves/i },
  { href: "/field-notes", h1: /real progress\. real conditions\. real builds\./i },
  { href: "/about", h1: /built by horse people/i },
  { href: "/contact", h1: /first conversation starts with the ground/i },
  { href: "/privacy", h1: /privacy policy/i },
  { href: "/terms", h1: /terms of service/i },
];

// /hq bounces unauth users to /login — assert that contract instead of an H1.
const HQ_LINK = "/hq";

const CAPABILITY_ANCHORS: AnchorCheck[] = [
  { href: "/services#covered-arenas", sectionId: "covered-arenas" },
  { href: "/services#stables-barn-structures", sectionId: "stables-barn-structures" },
  { href: "/services#pavilions-rural-builds", sectionId: "pavilions-rural-builds" },
  { href: "/services#drainage-surfacing", sectionId: "drainage-surfacing" },
  { href: "/services#equine-infrastructure", sectionId: "equine-infrastructure" },
];

async function gotoOk(page: Page, href: string) {
  const response = await page.goto(href);
  expect(response, `no response for ${href}`).not.toBeNull();
  expect(response!.status(), `expected 200 for ${href}`).toBe(200);
  return response!;
}

test.describe("footer links @anon @mobile", () => {
  test("footer renders only the documented hrefs (no stale /arenas, /stables, /infrastructure)", async ({ page }) => {
    await gotoOk(page, "/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    const hrefs = await footer.locator("a[href]").evaluateAll((els) =>
      Array.from(new Set(els.map((el) => (el as HTMLAnchorElement).getAttribute("href") || "")))
    );
    for (const stale of ["/arenas", "/stables", "/infrastructure"]) {
      expect(hrefs, `footer should not link to ${stale}`).not.toContain(stale);
    }
    // Sanity: documented links are present.
    for (const { href } of [...PAGE_LINKS, ...CAPABILITY_ANCHORS, { href: HQ_LINK }]) {
      expect(hrefs).toContain(href);
    }
  });

  for (const { href, h1 } of PAGE_LINKS) {
    test(`page link ${href} → 200 + expected H1`, async ({ page }) => {
      await gotoOk(page, href);
      await expect(page.locator("h1").first()).toHaveText(h1);
    });
  }

  test(`staff link ${HQ_LINK} → 200 and bounces anon to /login`, async ({ page }) => {
    await gotoOk(page, HQ_LINK);
    await page.waitForURL(/\/login\?/);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("redirect")).toBe(HQ_LINK);
  });

  for (const { href, sectionId } of CAPABILITY_ANCHORS) {
    test(`capability anchor ${href} → 200 + section #${sectionId} exists`, async ({ page }) => {
      await gotoOk(page, href);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator(`#${sectionId}`)).toHaveCount(1);
    });
  }
});
