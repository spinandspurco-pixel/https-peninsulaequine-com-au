#!/usr/bin/env tsx
/**
 * Pre-build asset reference verifier.
 *
 * Scans every src/**\/*.{ts,tsx,js,jsx,css} file for imports or string
 * references to *.asset.json pointer files. It also verifies that every
 * Lovable pointer has a matching, correctly-sized file under public/ so a
 * static host such as GitHub Pages never publishes CDN pointers without the
 * underlying images.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";

const ROOT = resolve(process.cwd());
const SRC = join(ROOT, "src");
const ASSETS = join(SRC, "assets");
const PUBLIC = join(ROOT, "public");

const SCAN_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".css"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (SCAN_EXT.has(full.slice(full.lastIndexOf(".")))) out.push(full);
  }
  return out;
}

function walkPointers(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkPointers(full, out);
    else if (full.endsWith(".asset.json")) out.push(full);
  }
  return out;
}

// Capture both `from "..."` imports and bare `import "..."` / `require("...")`.
const REF_RE = /['"]([^'"]+\.asset\.json)['"]/g;

type Missing = { ref: string; resolved: string; file: string; line: number };
const missing: Missing[] = [];
type BundleIssue = { pointer: string; asset: string; problem: string };
const bundleIssues: BundleIssue[] = [];

for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  REF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = REF_RE.exec(text)) !== null) {
    const ref = m[1];
    let resolved: string;
    if (ref.startsWith("@/")) resolved = join(SRC, ref.slice(2));
    else if (ref.startsWith(".")) resolved = resolve(dirname(file), ref);
    else continue; // ignore bare specifiers / URLs
    if (!existsSync(resolved)) {
      const line = text.slice(0, m.index).split("\n").length;
      missing.push({ ref, resolved, file, line });
    }
  }
}

for (const pointer of walkPointers(ASSETS)) {
  let data: { url?: unknown; size?: unknown };
  try {
    data = JSON.parse(readFileSync(pointer, "utf8"));
  } catch {
    bundleIssues.push({ pointer, asset: "(unknown)", problem: "pointer is not valid JSON" });
    continue;
  }

  if (typeof data.url !== "string" || !data.url.startsWith("/")) {
    bundleIssues.push({ pointer, asset: "(unknown)", problem: "pointer URL must be root-relative" });
    continue;
  }

  const asset = resolve(PUBLIC, data.url.slice(1));
  const assetRel = relative(PUBLIC, asset);
  if (assetRel.startsWith("..")) {
    bundleIssues.push({ pointer, asset, problem: "pointer URL escapes public/" });
    continue;
  }
  if (!existsSync(asset) || !statSync(asset).isFile()) {
    bundleIssues.push({ pointer, asset, problem: "bundled asset is missing" });
    continue;
  }
  if (typeof data.size === "number" && statSync(asset).size !== data.size) {
    bundleIssues.push({
      pointer,
      asset,
      problem: `size mismatch (expected ${data.size}, found ${statSync(asset).size})`,
    });
  }
}

const inCI = process.env.GITHUB_ACTIONS === "true";
if (missing.length > 0) {
  console.error(`\n✗ asset verification failed — ${missing.length} missing reference(s):\n`);
}
for (const { ref, resolved, file, line } of missing) {
  const rel = relative(ROOT, file);
  console.error(`  • ${rel}:${line}`);
  console.error(`      import:   ${ref}`);
  console.error(`      expected: ${relative(ROOT, resolved)}\n`);
  if (inCI) {
    const msg = `Missing asset pointer: ${ref} (expected ${relative(ROOT, resolved)})`;
    console.log(`::error file=${rel},line=${line},title=Missing .asset.json::${msg}`);
  }
}

if (bundleIssues.length > 0) {
  console.error(`\n✗ asset bundle verification failed — ${bundleIssues.length} issue(s):\n`);
  for (const { pointer, asset, problem } of bundleIssues) {
    const pointerRel = relative(ROOT, pointer);
    console.error(`  • ${pointerRel}`);
    console.error(`      problem: ${problem}`);
    console.error(`      asset:   ${asset === "(unknown)" ? asset : relative(ROOT, asset)}\n`);
    if (inCI) {
      console.log(`::error file=${pointerRel},title=Missing bundled asset::${problem}`);
    }
  }
}

if (missing.length > 0 || bundleIssues.length > 0) process.exit(1);

console.log(
  `✓ asset verification passed: references resolve and ${walkPointers(ASSETS).length} bundled assets match their pointers`,
);
