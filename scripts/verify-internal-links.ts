/**
 * Build-time internal-link checker.
 *
 * Walks src/ for every internal `to="/..."` (React Router Link) and
 * `href="/..."` reference, then verifies:
 *
 *   1. The path matches a <Route> defined in src/App.tsx
 *      (literal match or `:param` pattern match), OR is a static asset
 *      that exists under public/.
 *   2. If the link contains a `#anchor`, that anchor exists somewhere in
 *      src/ as an `id="anchor"` / `id={"anchor"}` / `id={`anchor`}`.
 *
 * Exits non-zero on any broken link so `bun run build` fails loudly.
 *
 * Allowlists below cover legitimate exceptions (auth-gated routes that
 * use Navigate, hash-only smooth-scroll targets, etc).
 */

import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";

const REPORT_DIR = resolve(process.env.LINK_REPORT_DIR ?? "reports/internal-links");
const REPORT_JSON = join(REPORT_DIR, "report.json");
const REPORT_HTML = join(REPORT_DIR, "report.html");

const ROOT = resolve(".");
const SRC = resolve("src");
const PUBLIC_DIR = resolve("public");
const APP_TSX = resolve("src/App.tsx");

// Paths we never want to validate (external-ish, mailto, tel, etc are
// already filtered by the `/`-prefix check).
const PATH_ALLOWLIST = new Set<string>([
  "/", // root
]);

// Anchors that are known-good but live in code we don't statically reach
// (e.g. injected by third parties or generated at runtime).
const ANCHOR_ALLOWLIST = new Set<string>([]);

// ── 1. Parse routes from App.tsx ─────────────────────────────────────
function parseRoutes(): { literals: Set<string>; patterns: RegExp[] } {
  const src = readFileSync(APP_TSX, "utf8");
  const literals = new Set<string>();
  const patterns: RegExp[] = [];
  const re = /<Route\s+path="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const p = m[1];
    // Skip the catch-all NotFound route — it matches everything and would
    // mask genuinely broken paths.
    if (p === "*" || p === "/*") continue;
    if (p.includes(":") || p.includes("*")) {
      const pattern = p
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/:[A-Za-z_]+/g, "[^/]+")
        .replace(/\*/g, "[^/]*");
      patterns.push(new RegExp(`^${pattern}$`));
    } else {
      literals.add(p);
    }
  }
  return { literals, patterns };
}

// ── 2. Walk src/ collecting source text ──────────────────────────────
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

// ── 3. Extract internal link targets ─────────────────────────────────
type LinkRef = { target: string; file: string; line: number };

function extractLinks(files: string[]): LinkRef[] {
  const refs: LinkRef[] = [];
  // Match: to="/foo"  |  href="/foo"  (must start with `/` and not `//`)
  const re = /(?:to|href)=["'`](\/[^"'`\s?]+)["'`]/g;
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const target = m[1];
      if (target.startsWith("//")) continue; // protocol-relative
      const line = text.slice(0, m.index).split("\n").length;
      refs.push({ target, file: relative(ROOT, file), line });
    }
  }
  return refs;
}

// ── 4. Collect every id="..." in src/ for anchor validation ──────────
function collectIds(files: string[]): Set<string> {
  const ids = new Set<string>();
  const patterns = [
    /\bid=["']([A-Za-z][\w-]*)["']/g,
    /\bid=\{["'`]([A-Za-z][\w-]*)["'`]\}/g,
  ];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const re of patterns) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) ids.add(m[1]);
    }
  }
  return ids;
}

// ── 5. Match path against route table ────────────────────────────────
function pathMatches(
  path: string,
  routes: { literals: Set<string>; patterns: RegExp[] },
): boolean {
  if (routes.literals.has(path)) return true;
  if (PATH_ALLOWLIST.has(path)) return true;
  for (const p of routes.patterns) if (p.test(path)) return true;
  // Static public asset?
  const candidate = join(PUBLIC_DIR, path);
  if (existsSync(candidate) && statSync(candidate).isFile()) return true;
  return false;
}

// ── 6. Run check ─────────────────────────────────────────────────────
function main() {
  const routes = parseRoutes();
  const files = walk(SRC);
  const ids = collectIds(files);
  const refs = extractLinks(files);

  type Failure = { kind: "route" | "anchor"; ref: LinkRef; detail: string };
  const failures: Failure[] = [];

  for (const ref of refs) {
    const [pathPart, anchor] = ref.target.split("#");
    if (!pathMatches(pathPart, routes)) {
      failures.push({
        kind: "route",
        ref,
        detail: `No <Route> matches "${pathPart}"`,
      });
      continue;
    }
    if (anchor && !ids.has(anchor) && !ANCHOR_ALLOWLIST.has(anchor)) {
      failures.push({
        kind: "anchor",
        ref,
        detail: `No element with id="${anchor}" found in src/`,
      });
    }
  }

  const checked = refs.length;
  writeReports({
    checked,
    filesScanned: files.length,
    failures,
    generatedAt: new Date().toISOString(),
  });

  if (failures.length === 0) {
    console.log(
      `✓ internal-link check: ${checked} link(s) verified across ${files.length} file(s)`,
    );
    console.log(`  report: ${relative(ROOT, REPORT_JSON)} | ${relative(ROOT, REPORT_HTML)}`);
    return;
  }

  console.error(
    `✗ internal-link check failed: ${failures.length} broken link(s) of ${checked} checked\n`,
  );
  for (const f of failures) {
    console.error(
      `  [${f.kind}] ${f.ref.file}:${f.ref.line}  →  ${f.ref.target}\n          ${f.detail}`,
    );
    // GitHub Actions inline annotation on the offending source line.
    if (process.env.GITHUB_ACTIONS === "true") {
      const msg = `${f.detail} (target: ${f.ref.target})`;
      console.log(
        `::error file=${f.ref.file},line=${f.ref.line},title=Broken internal ${f.kind}::${msg}`,
      );
    }
  }
  console.error(`\n  report: ${relative(ROOT, REPORT_JSON)} | ${relative(ROOT, REPORT_HTML)}`);
  process.exit(1);
}

type Failure = { kind: "route" | "anchor"; ref: LinkRef; detail: string };

function writeReports(data: {
  checked: number;
  filesScanned: number;
  failures: Failure[];
  generatedAt: string;
}) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const status = data.failures.length === 0 ? "pass" : "fail";
  writeFileSync(REPORT_JSON, JSON.stringify({ status, ...data }, null, 2));
  writeFileSync(REPORT_HTML, renderHtml(status, data));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(
  status: "pass" | "fail",
  data: { checked: number; filesScanned: number; failures: Failure[]; generatedAt: string },
): string {
  const rows = data.failures
    .map(
      (f) => `<tr>
        <td><span class="kind ${f.kind}">${f.kind}</span></td>
        <td><code>${escapeHtml(f.ref.file)}:${f.ref.line}</code></td>
        <td><code>${escapeHtml(f.ref.target)}</code></td>
        <td>${escapeHtml(f.detail)}</td>
      </tr>`,
    )
    .join("\n");

  const body = data.failures.length === 0
    ? `<p class="ok">All ${data.checked} internal links resolved.</p>`
    : `<table>
        <thead><tr><th>Kind</th><th>Source</th><th>Target</th><th>Reason</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Internal link check — ${status.toUpperCase()}</title>
  <style>
    body { font: 14px/1.5 -apple-system, system-ui, sans-serif; margin: 2rem; color: #1a1a1a; }
    h1 { margin: 0 0 .25rem; }
    .meta { color: #666; font-size: 12px; margin-bottom: 1.5rem; }
    .pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-weight: 600; font-size: 12px; }
    .pill.pass { background: #d1fae5; color: #065f46; }
    .pill.fail { background: #fee2e2; color: #991b1b; }
    table { border-collapse: collapse; width: 100%; font-size: 13px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
    th { background: #f7f7f8; font-weight: 600; }
    code { font: 12px ui-monospace, Menlo, monospace; background: #f4f4f5; padding: 1px 5px; border-radius: 4px; }
    .kind { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .kind.route { background: #fde68a; color: #78350f; }
    .kind.anchor { background: #c7d2fe; color: #312e81; }
    .ok { color: #065f46; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Internal link check <span class="pill ${status}">${status.toUpperCase()}</span></h1>
  <div class="meta">
    ${data.checked} link(s) checked across ${data.filesScanned} file(s) — ${data.failures.length} failure(s)<br>
    Generated ${escapeHtml(data.generatedAt)}
  </div>
  ${body}
</body>
</html>`;
}

main();
