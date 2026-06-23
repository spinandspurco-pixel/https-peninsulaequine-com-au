#!/usr/bin/env tsx
/**
 * Verify that adjacent top-level <section> blocks on the homepage
 * (src/pages/Index.tsx) do not reuse the same *.asset.json image.
 *
 * Why: visually obvious duplication degrades the curated feel of the
 * homepage. This check runs in the prebuild step so a duplicate asset
 * shared between two consecutive sections fails CI before it ships.
 *
 * How it works:
 *  1. Parse all `import <ident> from "....asset.json"` lines and build
 *     ident → asset-path map.
 *  2. Resolve simple aliases of the form `const x = <ident>.url` and
 *     `const x = <ident>` so the alias inherits the same asset path.
 *  3. Walk the file tracking <section> / </section> tag depth to slice
 *     out each top-level section block.
 *  4. Collect every identifier used inside each section; intersect with
 *     adjacent sections. Any shared asset path = failure.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FILE = resolve(process.cwd(), "src/pages/Index.tsx");
const source = readFileSync(FILE, "utf8");

// 1. Imports of *.asset.json → ident → asset path
const importRe = /import\s+(\w+)\s+from\s+["']([^"']+\.asset\.json)["']/g;
const identToAsset = new Map<string, string>();
for (const m of source.matchAll(importRe)) identToAsset.set(m[1], m[2]);

// 2. Aliases: `const x = ident.url;` or `const x = ident;`
const aliasRe = /(?:const|let)\s+(\w+)\s*=\s*(\w+)(?:\.\w+)?\s*;/g;
for (const m of source.matchAll(aliasRe)) {
  const [, alias, base] = m;
  if (identToAsset.has(base)) identToAsset.set(alias, identToAsset.get(base)!);
}

// 3. Walk source, tracking <section>/</section> nesting to extract top-level sections.
type Section = { start: number; end: number; index: number };
const sections: Section[] = [];
const openRe = /<section\b/g;
const closeRe = /<\/section\s*>/g;
const events: { pos: number; kind: "open" | "close" }[] = [];
for (const m of source.matchAll(openRe)) events.push({ pos: m.index!, kind: "open" });
for (const m of source.matchAll(closeRe)) events.push({ pos: m.index! + m[0].length, kind: "close" });
events.sort((a, b) => a.pos - b.pos);

let depth = 0;
let currentStart = -1;
let secIndex = 0;
for (const e of events) {
  if (e.kind === "open") {
    if (depth === 0) currentStart = e.pos;
    depth++;
  } else {
    depth--;
    if (depth === 0 && currentStart >= 0) {
      sections.push({ start: currentStart, end: e.pos, index: secIndex++ });
      currentStart = -1;
    }
  }
}

// 4. For each section, gather asset identifiers it references.
const idRe = /\b([A-Za-z_$][\w$]*)\b/g;
const sectionAssets = sections.map((s) => {
  const body = source.slice(s.start, s.end);
  const used = new Set<string>();
  for (const m of body.matchAll(idRe)) {
    const ident = m[1];
    if (identToAsset.has(ident)) used.add(identToAsset.get(ident)!);
  }
  return used;
});

// 5. Check adjacent sections for overlap.
type Dup = { a: number; b: number; assets: string[] };
const dups: Dup[] = [];
for (let i = 0; i < sectionAssets.length - 1; i++) {
  const a = sectionAssets[i];
  const b = sectionAssets[i + 1];
  const shared = [...a].filter((x) => b.has(x));
  if (shared.length > 0) dups.push({ a: i, b: i + 1, assets: shared });
}

if (dups.length > 0) {
  console.error("\n✗ homepage image uniqueness check failed:");
  console.error("  Adjacent <section> blocks in src/pages/Index.tsx share image assets.");
  for (const d of dups) {
    console.error(`\n  Sections #${d.a} and #${d.b} both reference:`);
    for (const a of d.assets) console.error(`    • ${a}`);
  }
  console.error(
    "\nSwap one of the duplicates for a distinct asset so the homepage\n" +
      "doesn't reuse the same image back-to-back.",
  );
  process.exit(1);
}

console.log(
  `✓ homepage image uniqueness: ${sections.length} sections scanned, no adjacent duplicates.`,
);
