import { test, expect } from "@playwright/test";

/**
 * Authenticated regression: visiting /login while already signed in must
 * immediately redirect to /hq (or the role landing page) without ever
 * flashing the Staff Portal login form or exposing a Sign Out control
 * from a stale header. Guards against the timing window where
 * `useAuth.ready` flips before the redirect effect fires.
 *
 * Runs under the `admin` Playwright project, which carries the admin
 * storageState minted by e2e/auth.setup.ts.
 */
test.describe("authenticated /login redirect @admin", () => {
  test("visiting /login while signed in lands on /hq without flashing the form", async ({ page }) => {
    const seenForm: string[] = [];
    const seenSignOut: string[] = [];

    // Sample the DOM aggressively during the redirect window. If the login
    // form (email/password inputs or the "Sign In" submit) or a Sign Out
    // control ever appears, the test fails with the offending URL.
    const sampler = setInterval(async () => {
      try {
        const probe = await page.evaluate(() => {
          const has = (sel: string) => !!document.querySelector(sel);
          const hasText = (re: RegExp) =>
            Array.from(document.querySelectorAll("button"))
              .some((b) => re.test(b.textContent ?? ""));
          return {
            url: location.pathname,
            emailInput: has('input[type="email"]'),
            passwordInput: has('input[type="password"]'),
            signIn: hasText(/sign\s*in/i),
            signOut: hasText(/sign\s*out/i),
          };
        });
        if (probe.emailInput || probe.passwordInput || probe.signIn) {
          seenForm.push(`${probe.url} (email=${probe.emailInput} pw=${probe.passwordInput} signIn=${probe.signIn})`);
        }
        if (probe.signOut && probe.url === "/login") {
          seenSignOut.push(probe.url);
        }
      } catch {
        // Page may be navigating — ignore transient evaluate failures.
      }
    }, 25);

    await page.goto("/login");
    await page.waitForURL((url) => url.pathname === "/hq", { timeout: 10_000 });
    clearInterval(sampler);

    expect(new URL(page.url()).pathname).toBe("/hq");
    expect(
      seenForm,
      `Login form flashed during redirect: ${seenForm.join(", ")}`,
    ).toEqual([]);
    expect(
      seenSignOut,
      `Sign Out button rendered on /login before redirect: ${seenSignOut.join(", ")}`,
    ).toEqual([]);

    // After landing, no login form artefacts remain.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test("reloading /login while signed in still redirects to /hq", async ({ page }) => {
    await page.goto("/hq");
    await page.waitForURL((url) => url.pathname === "/hq");

    await page.goto("/login");
    await page.waitForURL((url) => url.pathname === "/hq", { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe("/hq");
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^sign in$/i })).toHaveCount(0);
  });
});
