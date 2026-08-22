import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const DIST_DIR = join(process.cwd(), "dist");
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".map", ".txt", ".xml"]);
const PRIVATE_ADDRESS_PATTERNS = [/Tubbarubba/i, /59\s+Tubbarubba/i];

async function listTextFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return listTextFiles(path);
      return TEXT_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
    }),
  );

  return files.flat();
}

const violations: string[] = [];

for (const file of await listTextFiles(DIST_DIR)) {
  const contents = await readFile(file, "utf8");
  if (PRIVATE_ADDRESS_PATTERNS.some((pattern) => pattern.test(contents))) {
    violations.push(relative(process.cwd(), file));
  }
}

if (violations.length > 0) {
  console.error("Private Peninsula Equine street address found in published files:");
  violations.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("Address privacy check passed: published files use locality-only address data.");
