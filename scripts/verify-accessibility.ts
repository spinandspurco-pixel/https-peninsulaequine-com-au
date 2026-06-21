/**
 * Accessibility CI gate — runs axe-core (via Playwright) against every
 * public route in the built site and fails the build on new critical
 * (or serious, if AXE_FAIL_LEVEL=serious) violations.
 *
 * Outputs reports/accessibility/report.json and report.html. In GitHub
 * Actions, emits ::error annotations so violations surface inline on PRs.
 *
 * Env:
 *   A11Y_BASE_URL     Override base URL (default: http://127.0.0.1:4173)
 *   A11Y_FAIL_LEVEL   "critical" (default) | "serious"
 *   A11Y_REPORT_DIR   Override report dir (default: reports/accessibility)
 *   A11Y_ROUTES       Comma-separated route override
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium, type Browser } from "playwright";

const BASE_URL = process.env.A11Y_BASE_URL ?? "http://127.0.0.1:4173";
const FAIL_LEVEL = (process.env.A11Y_FAIL_LEVEL ?? "critical").toLowerCase();
const REPORT_DIR = resolve(process.env.A11Y_REPORT_DIR ?? "reports/accessibility");
const REPORT_JSON = join(REPORT_DIR, "report.json");
const REPORT_HTML = join(REPORT_DIR, "report.html");
const IN_CI = process.env.GITHUB_ACTIONS === "true";

const FAIL_IMPACTS =
  FAIL_LEVEL === "serious"
    ? new Set(["critical", "serious"])
    : new Set(["critical"]);

const DEFAULT_ROUTES = [
  "/",
  "/services",
  "/arenas",
  "/stables",
  "/infrastructure",
  "/lumenarc",
  "/equine-estates",
  "/selected-works",
  "/selected-works/main-ridge-pavilion",
  "/selected-works/aberdeen",
  "/field-notes",
  "/field-notes/covered-arena-stables-build",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

const ROUTES = (process.env.A11Y_ROUTES?.split(",").map((r) => r.trim()).filter(Boolean)) ?? DEFAULT_ROUTES;

interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}
interface AxeViolation {
  id: string;
  impact?: "minor" | "moderate" | "serious" | "critical" | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}
interface RouteResult {
  route: string;
  url: string;
  violations: AxeViolation[];
  blocking: AxeViolation[];
  error?: string;
}

const AXE_SOURCE = (() => {
  // Load axe-core source from node_modules so we don't need a network round-trip.
  const candidates = [
    resolve("node_modules/axe-core/axe.min.js"),
    resolve("node_modules/axe-core/axe.js"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return readFileSync(c, "utf8");
  }
  throw new Error(
    "axe-core not found in node_modules. Install with: bun add -d axe-core"
  );
})();

async function auditRoute(browser: Browser, route: string): Promise<RouteResult> {
  const url = new URL(route, BASE_URL).toString();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await context.new_page?.() ?? (await context.newPage());
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    if (!response || !response.ok()) {
      throw new Error(`HTTP ${response?.status() ?? "no response"} for ${url}`);
    }
    await page.addScriptTag({ content: AXE_SOURCE });
    const violations = (await page.evaluate(async () => {
      // @ts-expect-error injected
      const results = await window.axe.run(document, {
        resultTypes: ["violations"],
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
      });
      return results.violations;
    })) as AxeViolation[];
    const blocking = violations.filter((v) => FAIL_IMPACTS.has(v.impact ?? ""));
    return { route, url, violations, blocking };
  } catch (err) {
    return {
      route,
      url,
      violations: [],
      blocking: [],
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await context.close();
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function renderHtml(results: RouteResult[], blockingCount: number, totalViolations: number): string {
  const status = blockingCount === 0 ? "pass" : "fail";
  const rows = results
    .map((r) => {
      const items = r.blocking.length
        ? r.blocking
            .map(
              (v) => `<li><strong>${escapeHtml(v.id)}</strong> <em>(${v.impact})</em> — ${escapeHtml(v.help)} <a href="${v.helpUrl}">docs</a><br/><small>${v.nodes.length} node(s)</small></li>`
            )
            .join("")
        : r.error
          ? `<li class="err">${escapeHtml(r.error)}</li>`
          : `<li class="ok">No blocking issues</li>`;
      const cls = r.blocking.length || r.error ? "fail" : "ok";
      return `<tr class="${cls}"><td>${escapeHtml(r.route)}</td><td>${r.blocking.length}</td><td>${r.violations.length}</td><td><ul>${items}</ul></td></tr>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Accessibility report — ${status}</title>
<style>
body{font:14px/1.5 -apple-system,system-ui,sans-serif;max-width:1100px;margin:2rem auto;padding:0 1rem;color:#111}
h1{margin:0 0 .5rem}
.pill{display:inline-block;padding:.25rem .6rem;border-radius:999px;font-weight:600;font-size:12px;letter-spacing:.05em;text-transform:uppercase}
.pass{background:#dcfce7;color:#166534}
.fail{background:#fee2e2;color:#991b1b}
table{width:100%;border-collapse:collapse;margin-top:1rem}
th,td{text-align:left;padding:.5rem;border-bottom:1px solid #e5e7eb;vertical-align:top}
tr.fail td:first-child{color:#991b1b;font-weight:600}
ul{margin:0;padding-left:1.1rem}
li.ok{color:#166534}
li.err{color:#991b1b}
small{color:#6b7280}
</style></head><body>
<h1>Accessibility report <span class="pill ${status}">${status}</span></h1>
<p>Fail level: <strong>${FAIL_LEVEL}</strong> • Routes: <strong>${results.length}</strong> • Blocking violations: <strong>${blockingCount}</strong> • Total violations (all impacts): <strong>${totalViolations}</strong></p>
<table><thead><tr><th>Route</th><th>Blocking</th><th>All</th><th>Details</th></tr></thead><tbody>${rows}</tbody></table>
<p><small>Generated ${new Date().toISOString()} by scripts/verify-accessibility.ts</small></p>
</body></html>`;
}

function writeReports(results: RouteResult[]) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const blockingCount = results.reduce((n, r) => n + r.blocking.length, 0);
  const totalViolations = results.reduce((n, r) => n + r.violations.length, 0);
  const status = blockingCount === 0 && !results.some((r) => r.error) ? "pass" : "fail";
  writeFileSync(
    REPORT_JSON,
    JSON.stringify(
      {
        status,
        failLevel: FAIL_LEVEL,
        baseUrl: BASE_URL,
        routesChecked: results.length,
        blockingCount,
        totalViolations,
        generatedAt: new Date().toISOString(),
        routes: results,
      },
      null,
      2
    )
  );
  writeFileSync(REPORT_HTML, renderHtml(results, blockingCount, totalViolations));
  return { status, blockingCount, totalViolations };
}

function annotate(results: RouteResult[]) {
  if (!IN_CI) return;
  for (const r of results) {
    if (r.error) {
      console.log(`::error title=Accessibility audit failed::${r.route} — ${r.error}`);
      continue;
    }
    for (const v of r.blocking) {
      const sample = v.nodes[0]?.target?.join(" ") ?? "";
      console.log(
        `::error title=A11y ${v.impact}: ${v.id}::${r.route} — ${v.help} (${v.nodes.length} node(s)) ${sample} ${v.helpUrl}`
      );
    }
  }
}

async function main() {
  console.log(`[a11y] base=${BASE_URL} failLevel=${FAIL_LEVEL} routes=${ROUTES.length}`);
  const browser = await chromium.launch({ headless: true });
  const results: RouteResult[] = [];
  try {
    for (const route of ROUTES) {
      process.stdout.write(`[a11y] ${route} … `);
      const r = await auditRoute(browser, route);
      results.push(r);
      if (r.error) console.log(`error: ${r.error}`);
      else console.log(`${r.blocking.length} blocking / ${r.violations.length} total`);
    }
  } finally {
    await browser.close();
  }
  const { status, blockingCount, totalViolations } = writeReports(results);
  annotate(results);
  console.log(`[a11y] ${status.toUpperCase()} — blocking=${blockingCount} total=${totalViolations}`);
  console.log(`[a11y] reports: ${REPORT_JSON}, ${REPORT_HTML}`);
  if (status !== "pass") process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
