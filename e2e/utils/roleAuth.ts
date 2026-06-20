import { test } from "@playwright/test";

/**
 * Skips the current test if the storage state for `role` is empty —
 * i.e. credentials were not provided to auth.setup.ts. Keeps the suite
 * green on machines without test users while still exercising every role
 * where creds are configured.
 */
export function skipIfNoRoleCreds(role: "admin" | "preview" | "employee" | "trainer") {
  const envKey = role.toUpperCase();
  const hasCreds =
    !!process.env[`TEST_${envKey}_EMAIL`] && !!process.env[`TEST_${envKey}_PASSWORD`];
  test.skip(!hasCreds, `No TEST_${envKey}_EMAIL/PASSWORD — skipping ${role} coverage.`);
}
