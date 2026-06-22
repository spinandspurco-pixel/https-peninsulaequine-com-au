import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for /hq + role dashboards.
 *
 * Auth fixtures live in e2e/.auth/<role>.json and are produced by
 * e2e/auth.setup.ts using TEST_<ROLE>_EMAIL / TEST_<ROLE>_PASSWORD env vars.
 * Roles for which creds are missing are skipped at runtime — the suite still
 * runs unauthenticated coverage.
 */
const PORT = Number(process.env.E2E_PORT ?? 8080);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 7_500 },

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: {
    command: "bun run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },

  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },

    {
      name: "anon-desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /auth\.setup\.ts/,
      grep: /@anon/,
    },
    {
      name: "anon-mobile",
      use: { ...devices["iPhone 13"] },
      testIgnore: /auth\.setup\.ts/,
      grep: /@anon|@mobile/,
    },

    {
      name: "admin",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/admin.json" },
      dependencies: ["setup"],
      grep: /@admin/,
    },
    {
      name: "preview",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/preview.json" },
      dependencies: ["setup"],
      grep: /@preview/,
    },
    {
      name: "employee",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/employee.json" },
      dependencies: ["setup"],
      grep: /@employee/,
    },
    {
      name: "trainer",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/trainer.json" },
      dependencies: ["setup"],
      grep: /@trainer/,
    },
    {
      name: "admin-mobile",
      use: { ...devices["iPhone 13"], storageState: "e2e/.auth/admin.json" },
      dependencies: ["setup"],
      grep: /@mobile-auth/,
    },
    {
      // Exercises the real /login form end-to-end for the renamed admin
      // identity (info@peninsulaequine.systems). No storageState — the
      // sign-in itself is what we're regression-testing.
      name: "admin-login",
      use: { ...devices["Desktop Chrome"] },
      grep: /@admin-login/,
      testMatch: /admin-login\.spec\.ts/,
    },
  ],
});
