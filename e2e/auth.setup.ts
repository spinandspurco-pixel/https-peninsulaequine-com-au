import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Signs in each role via the real /login form and persists storageState
 * to e2e/.auth/<role>.json. A role with missing env vars is skipped (an
 * empty storage-state file is written so dependent projects can still
 * load — those specs will then skip themselves via the helper in
 * e2e/utils/roleAuth.ts).
 */
const AUTH_DIR = path.join(process.cwd(), "e2e", ".auth");
fs.mkdirSync(AUTH_DIR, { recursive: true });

const ROLES = [
  { role: "admin", landing: "/hq" },
  { role: "preview", landing: "/hq" },
  { role: "employee", landing: "/employee" },
  { role: "trainer", landing: "/schedule" },
] as const;

const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });

for (const { role, landing } of ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const envKey = role.toUpperCase();
    const email = process.env[`TEST_${envKey}_EMAIL`];
    const password = process.env[`TEST_${envKey}_PASSWORD`];
    const file = path.join(AUTH_DIR, `${role}.json`);

    if (!email || !password) {
      fs.writeFileSync(file, EMPTY_STATE);
      setup.skip(
        true,
        `TEST_${envKey}_EMAIL / TEST_${envKey}_PASSWORD not set — ${role} specs will skip.`,
      );
      return;
    }

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Auth gate resolves and router redirects to the role landing.
    await page.waitForURL((url) => url.pathname === landing, { timeout: 15_000 });
    await expect(page).toHaveURL(new RegExp(`${landing.replace("/", "\\/")}$`));

    await page.context().storageState({ path: file });
  });
}
