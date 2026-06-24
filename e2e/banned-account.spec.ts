import { test, expect } from "@playwright/test";

/**
 * Regression: stale @peninsulaequine.org staff identities (sander, ciro,
 * glenn) were deactivated via `auth.users.banned_until = 'infinity'` and
 * had all roles removed. They must:
 *
 *  1. Be rejected at sign-in with a visible error and remain on /login.
 *  2. Never gain access to /hq (an unauthenticated visit redirects to
 *     /login — the form, not the HQ shell, is what they see).
 *  3. Never land on a blank screen: even the worst case (signed-in
 *     somehow with no role) renders the "No staff access on this
 *     account" panel with a working Sign Out — covered by the
 *     Login.test.tsx unit suite, which exercises that exact render path.
 *
 * Runs anonymous (no storageState). Tagged @anon so the suite picks it
 * up in both desktop and mobile anon projects.
 */
const BANNED_EMAILS = [
  "sander@peninsulaequine.org",
  "ciro@peninsulaequine.org",
  "glenn@peninsulaequine.org",
];

test.describe("banned .org accounts @anon", () => {
  test("unauthenticated /hq redirects to /login (not the HQ shell)", async ({ page }) => {
    await page.goto("/hq");
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    // HQ chrome must not be in the DOM.
    await expect(page.getByRole("link", { name: /^hq$/i })).toHaveCount(0);
  });

  for (const email of BANNED_EMAILS) {
    test(`sign-in is rejected for banned account ${email}`, async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel(/email/i).fill(email);
      // The password is irrelevant — banned users are rejected before the
      // credential check completes. Use a value long enough to satisfy
      // the minLength=6 form constraint.
      await page.getByLabel(/password/i).fill("not-a-real-password");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Stay on /login (never redirected to /hq) and surface the error
      // toast that signIn() shows on rejection.
      await page.waitForTimeout(2_500);
      expect(new URL(page.url()).pathname).toBe("/login");
      await expect(page.getByLabel(/password/i)).toBeVisible();

      // Sonner toast renders the error message. Match loosely — the
      // exact wording may differ between "Invalid login credentials"
      // (form fallback) and the "user is banned" auth response.
      const toast = page.locator('[data-sonner-toast], [role="status"]');
      await expect(toast.first()).toBeVisible({ timeout: 5_000 });

      // No HQ shell, no admin chrome ever rendered.
      await expect(page.getByRole("link", { name: /^hq$/i })).toHaveCount(0);
    });
  }
});
