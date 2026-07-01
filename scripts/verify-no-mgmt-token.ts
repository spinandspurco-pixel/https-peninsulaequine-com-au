#!/usr/bin/env tsx
/**
 * Build-time guard: fails the build if SB_MGMT_ACCESS_TOKEN — either the
 * literal env-var name or its runtime value — appears anywhere in the
 * emitted client bundle under dist/.
 *
 * This complements the vitest suite in src/test/mgmt-token-guard.test.ts:
 * that test runs on source files (and dist/ when present); this script is
 * wired into `postbuild` so every production build is checked, whether or
 * not tests are run afterwards.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const TOKEN_NAME = "SB_MGMT_ACCESS_TOKEN";
const ROOT = resolve(__dirname, "..");
const DIST_DIR = resolve(ROOT, "dist");

const SCANNED_EXT = /\.(js|mjs|cjs|css|html|map|json|txt|svg)$/i;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (SCANNED_EXT.test(entry)) out.push(full);
  }
  return out;
}

function fail(reason: string, offenders: string[]): never {
  console.error(`\n✗ verify-no-mgmt-token: ${reason}`);
  for (const f of offenders) console.error(`  • ${f}`);
  console.error(
    "\nSB_MGMT_ACCESS_TOKEN is a server-only secret. Any browser bundle reference\n" +
      "leaks it to every visitor. Move the caller into a script, edge function,\n" +
      "or CI job — never import from `scripts/ci/assertMgmtToken.ts` in src/.",
  );
  process.exit(1);
}

if (!existsSync(DIST_DIR)) {
  console.error("✗ verify-no-mgmt-token: dist/ not found — run `bun run build` first.");
  process.exit(1);
}

const tokenValue = process.env[TOKEN_NAME]?.trim() ?? "";
const nameOffenders: string[] = [];
const valueOffenders: string[] = [];

for (const file of walk(DIST_DIR)) {
  const content = readFileSync(file, "utf8");
  const rel = file.replace(ROOT + "/", "");
  if (content.includes(TOKEN_NAME)) nameOffenders.push(rel);
  if (tokenValue && tokenValue.length >= 8 && content.includes(tokenValue)) {
    valueOffenders.push(rel);
  }
}

if (nameOffenders.length > 0) {
  fail(`literal "${TOKEN_NAME}" found in built bundle`, nameOffenders);
}
if (valueOffenders.length > 0) {
  fail(`SB_MGMT_ACCESS_TOKEN value found in built bundle`, valueOffenders);
}

console.log(
  `✓ verify-no-mgmt-token: no SB_MGMT_ACCESS_TOKEN references in dist/ (` +
    (tokenValue ? "name + value" : "name only; value not set in this env") +
    ").",
);
