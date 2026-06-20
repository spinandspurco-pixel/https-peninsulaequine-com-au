import { test, expect } from "@playwright/test";
import { skipIfNoRoleCreds } from "./utils/roleAuth";

/**
 * Mobile resume simulates the common iOS Safari behaviour: a user opens
 * /hq, backgrounds the tab, and returns. We model "resume" as a tab being
 * hidden, the JS event loop pausing briefly, then visibility returning
 * followed by a soft navigation. The session must persist, the route must
 * stay on /hq, and no homepage bounce should occur.
 */
test.describe("mobile @mobile-auth", () => {
  test.beforeEach(() => skipIfNoRoleCreds("admin"));

  test("resume from background keeps user on /hq", async ({ page }) => {
    await page.goto("/hq");
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/hq");

    // Simulate background → foreground via the Page Visibility API.
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("focus"));
    });

    // Soft refresh — the SPA should hydrate the existing session and stay put.
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/hq");
  });

  test("deep link to nested HQ route survives mobile reload", async ({ page }) => {
    await page.goto("/hq/services");
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/hq/services");

    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/hq/services");
  });
});
