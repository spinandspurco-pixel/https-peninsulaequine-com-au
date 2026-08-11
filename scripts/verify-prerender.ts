/**
 * Post-prerender verification.
 *
 * Walks every prerendered route's dist/<route>/index.html and asserts
 * the head ships:
 *   - <title> matching the route's expected title
 *   - <meta name="description">
 *   - <link rel="canonical"> self-referencing the route (not the homepage)
 *   - og:title / og:url / og:description / og:image / og:image:alt
 *   - twitter:card=summary_large_image, twitter:title,
 *     twitter:description, twitter:image, twitter:image:alt
 *   - non-empty, route-specific image alt text (not just "Peninsula Equine")
 *
 * Exits non-zero on any failure so the postbuild chain fails loudly.
 *
 * Keep the ROUTES list in sync with scripts/prerender.ts. Single source
 * of truth would be nicer; intentionally duplicated to keep this
 * verifier independent — if prerender silently regresses a route, this
 * file still knows what to expect.
 */

import { readFileSync, existsSync, appendFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  buildDetail,
  checkHtml,
  type Expectation,
  type Failure,
  type FailureCode,
} from "./verify-prerender-core";

const SITE_ORIGIN = "https://peninsulaequine.com.au";
const DIST = resolve("dist");
const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);
const SCHEMA_PATH = resolve("scripts/prerender-verify.schema.json");

const ROUTES: Expectation[] = [
  { path: "/", titleIncludes: "Peninsula Equine" },
  { path: "/arenas", titleIncludes: "Arenas" },
  { path: "/stables", titleIncludes: "Stables" },
  { path: "/equine-estates", titleIncludes: "Whole-Property" },
  { path: "/infrastructure", titleIncludes: "Infrastructure" },
  { path: "/gallery", titleIncludes: "Gallery" },
  { path: "/about", titleIncludes: "About" },
  { path: "/contact", titleIncludes: "Contact" },
  { path: "/process", titleIncludes: "Process" },
  { path: "/testimonials", titleIncludes: "Testimonials" },
  { path: "/faq", titleIncludes: "FAQ" },
  { path: "/privacy", titleIncludes: "Privacy" },
  { path: "/terms", titleIncludes: "Terms" },
];

const failures: Failure[] = [];

function fail(
  route: string,
  check: string,
  code: FailureCode,
  path: string,
  opts: { expected?: string | null; received?: string | null; detail?: string } = {},
): void {
  const expected = opts.expected ?? null;
  const received = opts.received ?? null;
  const detail = opts.detail ?? buildDetail(code, check, expected, received, path);
  failures.push({ route, check, code, path, expected, received, detail });
}

function indexPathFor(routePath: string): string {
  if (routePath === "/") return resolve(DIST, "index.html");
  return resolve(DIST, routePath.replace(/^\//, ""), "index.html");
}

function check(route: Expectation): void {
  const file = indexPathFor(route.path);
  if (!existsSync(file)) {
    fail(route.path, "file", "file-missing", file);
    return;
  }
  const html = readFileSync(file, "utf8");
  for (const f of checkHtml(route, html, SITE_ORIGIN)) failures.push(f);
}

// --- CLI arg parsing -------------------------------------------------
// Supports `--only=/arenas,/about` so a developer can re-verify just
// the routes that failed without re-checking everything.
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg
  ? new Set(
      onlyArg
        .slice("--only=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
  : null;

// `--json` or `--json=path/to/file.json` — write machine-readable results.
const jsonArg = process.argv.find((a) => a.startsWith("--json"));
const jsonOut = jsonArg ? (jsonArg.includes("=") ? jsonArg.slice("--json=".length) : "dist/prerender-verify.json") : null;

const selectedRoutes = only
  ? ROUTES.filter((r) => only.has(r.path))
  : ROUTES;

if (only && selectedRoutes.length === 0) {
  console.error(
    `✗ --only matched no known routes. Valid paths:\n  ${ROUTES.map((r) => r.path).join(", ")}`,
  );
  process.exit(2);
}

for (const r of selectedRoutes) check(r);

writeJsonReport();

/**
 * Escape a string for a GitHub Actions workflow command parameter
 * (title=, etc.). Newlines and commas would otherwise terminate the
 * parameter or break the line.
 * See https://docs.github.com/actions/reference/workflow-commands-for-github-actions
 */
function ghEscapeProp(s: string): string {
  return s
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A")
    .replace(/:/g, "%3A")
    .replace(/,/g, "%2C");
}
function ghEscapeMsg(s: string): string {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

/** Unique sorted list of routes that produced at least one failure. */
function failingRoutes(): string[] {
  return [...new Set(failures.map((f) => f.route))].sort();
}

/** The ready-to-run local command to re-verify only what broke. */
function rerunCommand(routes: string[]): string {
  if (routes.length === 0) return "bun run build";
  // Quote so shells treat the comma-separated list as one arg.
  return `bun run build && bunx tsx scripts/verify-prerender.ts --only="${routes.join(",")}"`;
}

interface RouteResult {
  path: string;
  file: string;
  passed: boolean;
  failures: Failure[];
}

interface Report {
  timestamp: string;
  siteOrigin: string;
  checked: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  rerunCommand: string;
  routes: RouteResult[];
}

function validateAgainstSchema(report: Report): string[] {
  if (!existsSync(SCHEMA_PATH)) {
    return [`Schema file missing at ${SCHEMA_PATH}`];
  }
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  const validate = ajv.compile(schema);
  const ok = validate(report);
  if (ok) return [];
  return (validate.errors ?? []).map(
    (e) => `${e.instancePath || "/"} ${e.message}`,
  );
}

/** Build and, if `--json` was passed, write the machine-readable report. */
function writeJsonReport(): void {
  if (!jsonOut) return;

  const report: Report = {
    timestamp: new Date().toISOString(),
    siteOrigin: SITE_ORIGIN,
    checked: selectedRoutes.length,
    passed: selectedRoutes.length - failingRoutes().length,
    failed: failingRoutes().length,
    allPassed: failures.length === 0,
    rerunCommand: rerunCommand(failingRoutes()),
    routes: selectedRoutes.map((r) => {
      const routeFailures = failures.filter((f) => f.route === r.path);
      return {
        path: r.path,
        file: indexPathFor(r.path),
        passed: routeFailures.length === 0,
        failures: routeFailures,
      };
    }),
  };

  // Validate the report against its JSON Schema so external tooling never
  // receives malformed output.
  const schemaErrors = validateAgainstSchema(report);
  if (schemaErrors.length > 0) {
    fail("_report", "json-schema", "schema", SCHEMA_PATH, {
      received: schemaErrors.join("; "),
    });
    console.error(
      `✗ JSON report failed schema validation:\n  ${schemaErrors.join("\n  ")}`,
    );
  }

  const json = JSON.stringify(report, null, 2);
  writeFileSync(resolve(jsonOut!), json, "utf8");
  console.log(`Wrote JSON report to ${jsonOut}`);
}

/**
 * On GitHub Actions, emit one `::error file=...,title=...` annotation
 * per failure and write a markdown summary (per-route grouping +
 * rerun command) to the job summary.
 */
function emitGithubAnnotations(): void {
  if (!process.env.GITHUB_ACTIONS) return;
  const file = "scripts/prerender.ts";
  for (const f of failures) {
    const title = ghEscapeProp(`[${f.route}] ${f.check}`);
    const msg = ghEscapeMsg(`${f.route} — ${f.check}: ${f.detail}`);
    console.log(`::error file=${file},title=${title}::${msg}`);
  }

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  const lines: string[] = [];
  lines.push(`## Prerender head-tag verification`);
  lines.push("");
  if (failures.length === 0) {
    lines.push(
      `Passed — ${selectedRoutes.length} route(s), all head tags present and self-referencing.`,
    );
  } else {
    const routes = failingRoutes();
    lines.push(
      `**Failed** — ${failures.length} issue(s) across ${routes.length} route(s): ${routes.map((r) => `\`${r}\``).join(", ")}.`,
    );
    lines.push("");
    lines.push("| Route | Check | Detail |");
    lines.push("| --- | --- | --- |");
    for (const f of failures) {
      const detail = f.detail.replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(`| \`${f.route}\` | \`${f.check}\` | ${detail} |`);
    }
    lines.push("");
    lines.push("### Re-verify locally");
    lines.push("");
    lines.push("```bash");
    lines.push(rerunCommand(routes));
    lines.push("```");
  }
  lines.push("");
  appendFileSync(summaryPath, lines.join("\n") + "\n");
}

emitGithubAnnotations();

if (failures.length > 0) {
  const routes = failingRoutes();

  // Group failures by route for a clean per-route summary.
  const byRoute = new Map<string, Failure[]>();
  for (const f of failures) {
    if (!byRoute.has(f.route)) byRoute.set(f.route, []);
    byRoute.get(f.route)!.push(f);
  }

  console.error(
    `\n✗ prerender verification failed: ${failures.length} issue(s) across ${routes.length} route(s) (of ${selectedRoutes.length} checked)\n`,
  );
  for (const route of routes) {
    console.error(`  ${route}`);
    for (const f of byRoute.get(route)!) {
      console.error(`    ✗ ${f.check}: ${f.detail}`);
    }
  }
  console.error("");
  console.error("Failing routes: " + routes.join(" "));
  console.error("Failing tags:   " + [...new Set(failures.map((f) => f.check))].sort().join(" "));
  console.error("");
  console.error("Re-verify locally (rebuild + check only the failing routes):");
  console.error(`  ${rerunCommand(routes)}`);
  console.error("");
  console.error("Or re-check everything:");
  console.error("  bun run build");
  console.error("");
  process.exit(1);
}

console.log(
  `✓ prerender verification passed: ${selectedRoutes.length} route(s), all head tags present and self-referencing`,
);
