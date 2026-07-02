// scripts/lib/publishPhase.mjs
//
// Classify a failed build/publish log into a specific phase so the retry
// reporter can say "bundle failed" instead of just "build failed". Patterns
// are tuned for vite + rollup + Lovable publish infra.

const PATTERNS = [
  { phase: "dependency-install", rx: /(EACCES|ENOTFOUND|npm ERR!|bun install|Cannot find module|failed to resolve import)/i },
  { phase: "compile",            rx: /(TS\d{3,5}:|Type error|Transform failed|esbuild.*Error|SyntaxError|Unexpected token|Parse error)/i },
  { phase: "bundle",             rx: /(rollup|Rollup failed|\[vite:.*\]|Could not resolve|Circular dependency|out of memory|JavaScript heap)/i },
  { phase: "asset-upload",       rx: /(asset upload|upload failed|S3|R2|storage.*(403|500|502|504)|ETIMEDOUT|ECONNRESET)/i },
  { phase: "publish-infra",      rx: /(Publishing failed due to an internal error|deploy.*(500|502|503|504)|gateway timeout|internal server error)/i },
  { phase: "lint",               rx: /(ESLint found|✖ \d+ problems)/i },
  { phase: "test",               rx: /(FAIL\s|Tests:.*failed|AssertionError)/i },
  { phase: "typecheck",          rx: /(error TS\d+|tsgo.*error)/i },
];

/**
 * @param {string} log
 * @param {string} stepKind
 * @returns {{ phase: string, hint: string | null }}
 */
export function classifyFailure(log, stepKind) {
  if (!log) return { phase: `${stepKind}-unknown`, hint: null };
  for (const { phase, rx } of PATTERNS) {
    const m = log.match(rx);
    if (m) {
      const line = (log.split("\n").find((l) => rx.test(l)) ?? m[0]).trim().slice(0, 240);
      return { phase, hint: line };
    }
  }
  const tail = log.trim().split("\n").slice(-3).join(" | ").slice(0, 240);
  return { phase: `${stepKind}-unclassified`, hint: tail || null };
}
