import { test, expect } from "@playwright/test";

/**
 * Regression test for the HQ auth loop fix.
 *
 * Verifies that the renamed admin identity (info@peninsulaequine.systems)
 * can sign in through the real /login form and lands on /hq with the
 * admin-only navigation visible — without bouncing back to /login.
 *
 * Runs in the dedicated `admin-login` Playwright project, which uses NO
 * storageState so the sign-in is exercised end-to-end on every run.
 *
 * Required env vars (skipped cleanly if either is missing):
 *   TEST_ADMIN_EMAIL     — expected to equal info@peninsulaequine.systems
 *   TEST_ADMIN_PASSWORD  — that account's password
 */

const EXPECTED_EMAIL = "info@peninsulaequine.systems";

test.describe("admin login — info@peninsulaequine.systems @admin-login", () => {
  test.beforeEach(() => {
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;
    test.skip(
      !email || !password,
      "TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD not set — skipping admin login regression.",
    );
    test.skip(
      !!email && email.toLowerCase() !== EXPECTED_EMAIL,
      `TEST_ADMIN_EMAIL is ${email}, expected ${EXPECTED_EMAIL} — skipping.`,
    );
  });

  test("signs in, lands on /hq, and renders admin navigation", async ({ page }) => {
    const email = process.env.TEST_ADMIN_EMAIL!;
    const password = process.env.TEST_ADMIN_PASSWORD!;

    // 1. Fresh visit to /login (no prior session).
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login(\?|$)/);

    // 2. Sign in with the renamed identity.
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // 3. Router must redirect to /hq once auth + roles resolve.
    //    A failure here is the exact regression we fixed: auth landed
    //    but role lookup or ProtectedRoute bounced back to /login.
    await page.waitForURL((url) => url.pathname === "/hq", { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/hq");

    // 4. HQ nav rail is visible and contains admin-only entries.
    const nav = page.getByRole("navigation", { name: /hq sections/i });
    await expect(nav).toBeVisible();

    // "DNS Verify" is admin-only in hqAccess.ts — its presence proves
    // the role fetch resolved as admin (not employee/trainer/preview).
    await expect(nav.getByRole("link", { name: /dns verify/i })).toBeVisible();

    // Sanity: a few shared entries are present too.
    await expect(nav.getByRole("link", { name: /overview/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /services/i })).toBeVisible();

    // 5. Refresh must not bounce back to /login (session persistence).
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/hq");
    await expect(
      page.getByRole("navigation", { name: /hq sections/i }).getByRole("link", { name: /dns verify/i }),
    ).toBeVisible();
  });
});
