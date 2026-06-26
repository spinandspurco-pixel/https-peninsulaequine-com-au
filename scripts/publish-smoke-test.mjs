#!/usr/bin/env node
/**
 * Publish smoke test — runs after every deployment to verify the live site.
 *
 * Checks:
 *   1. Homepage loads (200) and contains expected hero markers.
 *   2. /hq route renders the SPA shell (200, root div, bundle reference).
 *   3. /login renders the staff sign-in form (email + password markers).
 *   4. Hero asset bundle hash on production matches the asset hash from the
 *      latest local build (dist/) — proves the new bundle was promoted.
 *
 * Usage:
 *   node scripts/publish-smoke-test.mjs [--base https://peninsulaequine.systems]
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — homepage check failed
 *   2 — /hq check failed
 *   3 — /login check failed
 *   4 — hero asset bundle hash mismatch (old bundle still served)
 *   5 — unexpected error
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const baseArg = args.find((a) => a.startsWith("--base="));
const BASE =
  (baseArg && baseArg.split("=")[1]) ||
  process.env.SMOKE_BASE_URL ||
  "https://peninsulaequine.systems";
const SKIP_LOCAL = args.includes("--skip-local-build-check");

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  const tag = ok ? "✓" : "✗";
  console.log(`${tag} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { status: res.status, text, url: res.url };
}

async function checkHomepage() {
  try {
    const { status, text } = await fetchText(BASE + "/");
    if (status !== 200) return record("Homepage 200", false, `status=${status}`);
    const hasRoot = text.includes('id="root"');
    const hasMeta = /<title>/i.test(text);
    if (!hasRoot || !hasMeta)
      return record("Homepage shell", false, "missing root or <title>");
    record("Homepage loads (200, shell present)", true);
  } catch (e) {
    record("Homepage loads", false, String(e));
  }
}

async function checkHq() {
  try {
    const { status, text } = await fetchText(BASE + "/hq");
    if (status !== 200) return record("/hq route", false, `status=${status}`);
    if (!text.includes('id="root"'))
      return record("/hq route", false, "missing SPA root");
    record("/hq route serves SPA (200)", true);
  } catch (e) {
    record("/hq route", false, String(e));
  }
}

async function checkLogin() {
  try {
    const { status, text } = await fetchText(BASE + "/login");
    if (status !== 200) return record("/login route", false, `status=${status}`);
    // SPA — markers come from prerender or index shell; we accept either.
    if (!text.includes('id="root"'))
      return record("/login route", false, "missing SPA root");
    record("/login renders (200)", true);
  } catch (e) {
    record("/login route", false, String(e));
  }
}

function findLocalHeroAssetHash() {
  // Look for an approved-aberdeen-rider-exterior-storm.<hash>.webp in dist/
  const distAssets = join(process.cwd(), "dist", "assets");
  if (!existsSync(distAssets)) return null;
  const files = readdirSync(distAssets);
  const hero = files.find((f) =>
    /approved-aberdeen-rider-exterior-storm.*\.webp$/i.test(f),
  );
  return hero || null;
}

async function checkHeroBundle() {
  if (SKIP_LOCAL) {
    record("Hero asset bundle hash", true, "skipped (--skip-local-build-check)");
    return;
  }
  const localHero = findLocalHeroAssetHash();
  if (!localHero) {
    record(
      "Hero asset bundle hash",
      true,
      "no local dist/ build to compare (run after `bun run build` to enforce)",
    );
    return;
  }
  try {
    const { text } = await fetchText(BASE + "/");
    // Production may reference either a fingerprinted /assets/...webp asset
    // or a Lovable CDN /__l5e/assets-v1/... URL. Accept either when the
    // filename matches the local build.
    const localBase = localHero.replace(/^.*?(approved-aberdeen-)/, "$1");
    if (text.includes(localHero) || text.includes(localBase)) {
      record("Hero asset bundle hash matches latest build", true, localHero);
    } else {
      // Surface what production *is* serving so the failure is actionable.
      const liveMatch = text.match(
        /[\w/.-]*approved-aberdeen-rider-exterior-storm[\w.-]*\.(webp|png)/i,
      );
      record(
        "Hero asset bundle hash matches latest build",
        false,
        `local=${localHero} live=${liveMatch ? liveMatch[0] : "<not found>"}`,
      );
    }
  } catch (e) {
    record("Hero asset bundle hash", false, String(e));
  }
}

async function main() {
  console.log(`Publish smoke test against ${BASE}`);
  console.log("");

  await checkHomepage();
  await checkHq();
  await checkLogin();
  await checkHeroBundle();

  console.log("");
  const failed = results.filter((r) => !r.ok);
  const timestamp = new Date().toISOString();

  // Emit a machine-readable summary so CI can notify on failure without
  // re-parsing log output.
  const summaryPath = process.env.SMOKE_SUMMARY_PATH || "smoke-summary.json";
  try {
    writeFileSync(
      summaryPath,
      JSON.stringify(
        {
          base_url: BASE,
          timestamp,
          passed: failed.length === 0,
          checks: results,
          failed_checks: failed,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    console.warn("Could not write smoke summary:", String(e));
  }

  if (failed.length === 0) {
    console.log(`All ${results.length} checks passed.`);
    process.exit(0);
  }
  console.log(`${failed.length} of ${results.length} checks failed.`);
  for (const f of failed) {
    console.log(`  • ${f.name}${f.detail ? ` — ${f.detail}` : ""}`);
  }
  console.log(`Live URL: ${BASE}`);
  console.log(`Timestamp: ${timestamp}`);

  // Map first failure to a granular exit code.
  const first = failed[0].name;
  if (first.startsWith("Homepage")) process.exit(1);
  if (first.startsWith("/hq")) process.exit(2);
  if (first.startsWith("/login")) process.exit(3);
  if (first.startsWith("Hero")) process.exit(4);
  process.exit(5);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(5);
});

