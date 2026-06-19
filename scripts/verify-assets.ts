#!/usr/bin/env tsx
/**
 * Pre-build asset reference verifier.
 *
 * Scans every src/**\/*.{ts,tsx,js,jsx,css} file for imports or string
 * references to *.asset.json pointer files and fails with a clear report
 * if any referenced file is missing from disk. Run before `vite build`
 * to catch broken asset pointers before Rollup chokes on them.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";

const ROOT = resolve(process.cwd());
const SRC = join(ROOT, "src");

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

// Capture both `from "..."` imports and bare `import "..."` / `require("...")`.
const REF_RE = /['"]([^'"]+\.asset\.json)['"]/g;

type Missing = { ref: string; resolved: string; file: string; line: number };
const missing: Missing[] = [];

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

if (missing.length === 0) {
  console.log(`✓ asset verification passed: all *.asset.json references resolve`);
  process.exit(0);
}

console.error(`\n✗ asset verification failed — ${missing.length} missing reference(s):\n`);
for (const { ref, resolved, file, line } of missing) {
  console.error(`  • ${relative(ROOT, file)}:${line}`);
  console.error(`      import:   ${ref}`);
  console.error(`      expected: ${relative(ROOT, resolved)}\n`);
}
console.error(
  `Fix by either (a) creating the missing .asset.json pointer with ` +
    `\`lovable-assets create --file <path>\`, or (b) updating the import to ` +
    `reference an existing approved asset.\n`,
);
process.exit(1);
