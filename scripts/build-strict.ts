#!/usr/bin/env tsx
/**
 * Strict production build wrapper.
 *
 * Runs `vite build`, streams output to the user, and fails if any
 * Tailwind or PostCSS warnings are detected in the output. The
 * separate `verify-internal-links` step (run in postbuild) already
 * fails the build on broken internal links.
 */
import { spawn } from "node:child_process";

const FORBIDDEN_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /^warn\s*-\s/m, label: "Tailwind warning (`warn -`)" },
  { pattern: /is ambiguous and matches multiple utilities/i, label: "Tailwind ambiguous-utility warning" },
  { pattern: /A PostCSS plugin did not pass the `from` option/i, label: "PostCSS `from` option warning" },
  { pattern: /\[postcss\][^\n]*\bwarning\b/i, label: "PostCSS warning" },
];

const child = spawn("bunx", ["vite", "build"], { stdio: ["inherit", "pipe", "pipe"] });

let combined = "";

function relay(stream: NodeJS.ReadableStream, sink: NodeJS.WriteStream) {
  stream.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    combined += text;
    sink.write(text);
  });
}

relay(child.stdout!, process.stdout);
relay(child.stderr!, process.stderr);

child.on("exit", (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
  }

  const hits = FORBIDDEN_PATTERNS.filter(({ pattern }) => pattern.test(combined));
  if (hits.length > 0) {
    console.error("\n✗ strict build check failed: build emitted forbidden warnings:");
    for (const { label } of hits) console.error(`  • ${label}`);
    console.error(
      "\nFix the warning at its source (usually a Tailwind class like `[var(--token)]`\n" +
        "that should be written as `ease-[var(--token)]`, `duration-[var(--token)]`, etc.),\n" +
        "or update scripts/build-strict.ts if a warning is intentional.",
    );
    process.exit(1);
  }

  console.log("\n✓ strict build check passed: no Tailwind/PostCSS warnings detected.");
});
