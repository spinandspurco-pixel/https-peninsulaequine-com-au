import { test, expect } from "@playwright/test";
import { skipIfNoRoleCreds } from "./utils/roleAuth";

/**
 * Per-role landing, deep-link, and refresh coverage. Each test runs in
 * the project whose storageState matches the role (see playwright.config.ts).
 */

type Role = "admin" | "preview" | "employee" | "trainer";

interface RoleSpec {
  role: Role;
  landing: string;
  deepLinks: string[];
  tag: string;
}

const SPECS: RoleSpec[] = [
  { role: "admin", landing: "/hq", deepLinks: ["/hq", "/hq/services", "/hq/field-notes"], tag: "@admin" },
  { role: "preview", landing: "/hq", deepLinks: ["/hq", "/hq/services"], tag: "@preview" },
  { role: "employee", landing: "/employee", deepLinks: ["/employee", "/hq/field-notes"], tag: "@employee" },
  { role: "trainer", landing: "/schedule", deepLinks: ["/schedule", "/hq/events"], tag: "@trainer" },
];

for (const spec of SPECS) {
  test.describe(`${spec.role} dashboard ${spec.tag}`, () => {
    test.beforeEach(() => skipIfNoRoleCreds(spec.role));

    test(`visiting /login redirects to ${spec.landing}`, async ({ page }) => {
      await page.goto("/login");
      await page.waitForURL((u) => u.pathname === spec.landing, { timeout: 15_000 });
      expect(new URL(page.url()).pathname).toBe(spec.landing);
    });

    for (const deepLink of spec.deepLinks) {
      test(`deep link ${deepLink} resolves directly`, async ({ page }) => {
        await page.goto(deepLink);
        // Must not bounce to /, /login, or anywhere else.
        await page.waitForLoadState("networkidle");
        expect(new URL(page.url()).pathname).toBe(deepLink);
      });

      test(`refresh on ${deepLink} stays on ${deepLink}`, async ({ page }) => {
        await page.goto(deepLink);
        await page.waitForLoadState("networkidle");
        await page.reload();
        await page.waitForLoadState("networkidle");
        expect(new URL(page.url()).pathname).toBe(deepLink);
      });
    }
  });
}
