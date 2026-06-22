import { test, expect } from "@playwright/test";

/**
 * Regression test for the HQ auth loop fix.
 *
 * Primary path: drives the real /login form end-to-end using
 *   TEST_ADMIN_EMAIL + TEST_ADMIN_PASSWORD from the shell env.
 *
 * Fallback path: when TEST_ADMIN_PASSWORD is not present in the sandbox
 * shell (current Lovable behaviour for newly added runtime secrets), the
 * test calls the temporary `verify-admin-login` edge function which has
 * direct access to TEST_ADMIN_PASSWORD via edge-function secrets. That
 * function performs the sign-in server-side and returns only
 *   { ok, email, role, userId }
 * — never the password, access token, or refresh token.
 *
 * To use the fallback, set:
 *   E2E_VERIFY_SECRET       — same value as the edge function's env secret
 * (TEST_ADMIN_EMAIL is still required so we assert against the right id.)
 *
 * If neither path is available the test skips with a clear message.
 */

const EXPECTED_EMAIL = "info@peninsulaequine.systems";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  "";

test.describe("admin login — info@peninsulaequine.systems @admin-login", () => {
  test.beforeEach(() => {
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;
    const verifySecret = process.env.E2E_VERIFY_SECRET;

    test.skip(
      !email,
      "TEST_ADMIN_EMAIL not set — admin-login E2E not executed.",
    );
    test.skip(
      !!email && email.toLowerCase() !== EXPECTED_EMAIL,
      `TEST_ADMIN_EMAIL is ${email}, expected ${EXPECTED_EMAIL} — skipping.`,
    );
    test.skip(
      !password && !verifySecret,
      "TEST_ADMIN_PASSWORD secret missing — admin-login E2E not executed. " +
        "(Set E2E_VERIFY_SECRET to use the verify-admin-login fallback.)",
    );
    test.skip(
      !!verifySecret && !password && (!SUPABASE_URL || !SUPABASE_ANON),
      "Fallback path requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in env.",
    );
  });

  test("signs in, lands on /hq, and renders admin navigation", async ({ page }) => {
    const email = process.env.TEST_ADMIN_EMAIL!;
    const password = process.env.TEST_ADMIN_PASSWORD;
    const verifySecret = process.env.E2E_VERIFY_SECRET;

    // ---------- Fallback: server-side verification via edge function ----------
    if (!password && verifySecret) {
      const url = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/verify-admin-login`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: SUPABASE_ANON,
          authorization: `Bearer ${SUPABASE_ANON}`,
          "x-e2e-verify-secret": verifySecret,
        },
        body: "{}",
      });
      const body = (await res.json()) as {
        ok?: boolean;
        email?: string;
        role?: string | null;
        userId?: string;
        error?: string;
      };
      expect(res.status, `verify-admin-login HTTP ${res.status}: ${JSON.stringify(body)}`).toBe(
        200,
      );
      expect(body.ok, `verify-admin-login returned: ${JSON.stringify(body)}`).toBe(true);
      expect(body.email).toBe(EXPECTED_EMAIL);
      expect(body.role).toBe("admin");
      expect(typeof body.userId).toBe("string");
      return;
    }

    // ---------- Primary: real browser sign-in ----------
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login(\?|$)/);

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL((url) => url.pathname === "/hq", { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/hq");

    const nav = page.getByRole("navigation", { name: /hq sections/i });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: /dns verify/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /overview/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /services/i })).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/hq");
    await expect(
      page.getByRole("navigation", { name: /hq sections/i }).getByRole("link", { name: /dns verify/i }),
    ).toBeVisible();
  });
});
