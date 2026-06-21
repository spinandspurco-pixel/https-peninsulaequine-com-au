import { test, expect } from "@playwright/test";
import { skipIfNoRoleCreds } from "./utils/roleAuth";

/**
 * Guarantees that E2E test users (created by the `e2e-seed-users` edge
 * function) never surface anywhere a Client Preview viewer can reach.
 *
 * Scope of leak detection on every preview-visible route:
 *   1. Visible DOM text — no test-account email, local-part, or label.
 *   2. Full HTML payload — covers tooltips, hidden attrs, inline JSON.
 *   3. The `E2E TEST` badge used by Staff/Admin views must never appear.
 *
 * Tagged @preview so it runs only in the `preview` Playwright project
 * (storageState = e2e/.auth/preview.json). Skips cleanly when the
 * preview credentials are absent so CI without secrets stays green.
 */

const TEST_ACCOUNT_LOCAL_PARTS = [
  "test-admin",
  "test-preview",
  "test-employee",
  "test-trainer",
] as const;

const TEST_ACCOUNT_EMAILS = TEST_ACCOUNT_LOCAL_PARTS.map(
  (p) => `${p}@peninsulaequine.org`,
);

// Routes a preview viewer can reach — kept in sync with App.tsx
// `allowedRoles` lists that include "preview".
const PREVIEW_ROUTES = [
  "/hq",
  "/hq?view=preview",
  "/hq/services",
  "/hq/testimonials",
  "/hq/events",
  "/hq/selected-works",
  "/hq/field-notes",
  "/hq/documents",
] as const;

const FORBIDDEN_SUBSTRINGS = [
  ...TEST_ACCOUNT_EMAILS,
  ...TEST_ACCOUNT_LOCAL_PARTS,
  "is_e2e_test",
  "E2E TEST",
];

test.describe("@preview Client Preview must not leak E2E test users", () => {
  skipIfNoRoleCreds("preview");

  for (const route of PREVIEW_ROUTES) {
    test(`no E2E test-user leakage on ${route}`, async ({ page }) => {
      const trace: { url: string; status: number | null }[] = [];
      page.on("response", (r) => {
        trace.push({ url: r.url(), status: r.status() });
      });

      await page.goto(route, { waitUntil: "networkidle" });

      // Preview viewers must never be bounced to the public homepage.
      expect(
        new URL(page.url()).pathname,
        `Preview was redirected away from ${route} to ${page.url()} — trace: ${JSON.stringify(
          trace.slice(-10),
        )}`,
      ).not.toBe("/");

      const bodyText = (await page.locator("body").innerText()).toLowerCase();
      const html = (await page.content()).toLowerCase();

      for (const needle of FORBIDDEN_SUBSTRINGS) {
        const lowered = needle.toLowerCase();
        expect(
          bodyText.includes(lowered),
          `Visible text on ${route} contains forbidden token "${needle}"`,
        ).toBe(false);
        expect(
          html.includes(lowered),
          `HTML payload on ${route} contains forbidden token "${needle}"`,
        ).toBe(false);
      }
    });
  }
});
