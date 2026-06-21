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

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";

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
    if (p.includes(":") || p.includes("*")) {
      const pattern = p
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/:[A-Za-z_]+/g, "[^/]+")
        .replace(/\*/g, ".*");
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
  if (failures.length === 0) {
    console.log(
      `✓ internal-link check: ${checked} link(s) verified across ${files.length} file(s)`,
    );
    return;
  }

  console.error(
    `✗ internal-link check failed: ${failures.length} broken link(s) of ${checked} checked\n`,
  );
  for (const f of failures) {
    console.error(
      `  [${f.kind}] ${f.ref.file}:${f.ref.line}  →  ${f.ref.target}\n          ${f.detail}`,
    );
  }
  process.exit(1);
}

main();
