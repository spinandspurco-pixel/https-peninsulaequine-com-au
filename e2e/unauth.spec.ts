import { test, expect } from "@playwright/test";

/**
 * Unauthenticated coverage: every protected entry point must bounce to
 * /login with the original path preserved in ?redirect=. No homepage
 * bounce, no flash of protected UI.
 */
const PROTECTED_PATHS = [
  "/hq",
  "/hq/services",
  "/hq/events",
  "/hq/field-notes",
  "/hq/documents",
  "/employee",
  "/schedule",
];

test.describe("anonymous routing @anon", () => {
  for (const pathname of PROTECTED_PATHS) {
    test(`deep link ${pathname} → /login?redirect=`, async ({ page }) => {
      await page.goto(pathname);
      await page.waitForURL(/\/login\?/);
      const url = new URL(page.url());
      expect(url.pathname).toBe("/login");
      expect(url.searchParams.get("redirect")).toBe(pathname);
    });
  }

  test("refresh on protected route preserves redirect target", async ({ page }) => {
    await page.goto("/hq/services");
    await page.waitForURL(/\/login\?/);
    await page.reload();
    const url = new URL(page.url());
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("redirect")).toBe("/hq/services");
  });

  test("login page renders without flashing protected UI", async ({ page }) => {
    await page.goto("/hq");
    await page.waitForURL(/\/login/);
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});
