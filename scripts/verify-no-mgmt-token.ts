#!/usr/bin/env tsx
/**
 * Build-time guard: fails the build if SB_MGMT_ACCESS_TOKEN — either the
 * literal env-var name or its runtime value — appears anywhere in the
 * emitted client bundle under dist/.
 *
 * Emits two artifacts alongside stdout so CI can surface exactly which
 * dist file (and which line) triggered the guard:
 *   • dist/verify-no-mgmt-token.report.json  — structured report
 *   • dist/verify-no-mgmt-token.summary.md   — GitHub step-summary markdown
 *
 * Wired into `postbuild` and the `verify-no-mgmt-token-leak` workflow.
 */
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const TOKEN_NAME = "SB_MGMT_ACCESS_TOKEN";
const ROOT = resolve(process.cwd());
const DIST_DIR = resolve(ROOT, "dist");
const REPORT_JSON = resolve(DIST_DIR, "verify-no-mgmt-token.report.json");
const REPORT_MD = resolve(DIST_DIR, "verify-no-mgmt-token.summary.md");

const SCANNED_EXT = /\.(js|mjs|cjs|css|html|map|json|txt|svg)$/i;
const MAX_SNIPPETS_PER_FILE = 3;
const SNIPPET_CONTEXT = 60;

type Match = { file: string; line: number; column: number; snippet: string };
type Report = {
  ok: boolean;
  scannedAt: string;
  scannedFiles: number;
  tokenValueChecked: boolean;
  nameMatches: Match[];
  valueMatches: Match[];
};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (SCANNED_EXT.test(entry)) out.push(full);
  }
  return out;
}

function findMatches(content: string, needle: string, relPath: string): Match[] {
  const out: Match[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length && out.length < MAX_SNIPPETS_PER_FILE; i++) {
    const col = lines[i].indexOf(needle);
    if (col === -1) continue;
    const start = Math.max(0, col - SNIPPET_CONTEXT);
    const end = Math.min(lines[i].length, col + needle.length + SNIPPET_CONTEXT);
    // Never echo a raw token value — mask it in snippets.
    const rawSnippet = lines[i].slice(start, end);
    const safeSnippet = rawSnippet.replaceAll(needle, "«REDACTED»");
    out.push({ file: relPath, line: i + 1, column: col + 1, snippet: safeSnippet });
  }
  return out;
}

function writeReports(report: Report) {
  mkdirSync(dirname(REPORT_JSON), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));

  const md: string[] = [];
  if (report.ok) {
    md.push(`## ✓ SB_MGMT_ACCESS_TOKEN leak check passed`);
    md.push("");
    md.push(`- Files scanned: **${report.scannedFiles}**`);
    md.push(`- Token value probed: **${report.tokenValueChecked ? "yes" : "no (env var unset)"}**`);
    md.push(`- Scanned at: \`${report.scannedAt}\``);
  } else {
    md.push(`## ✗ SB_MGMT_ACCESS_TOKEN leak detected`);
    md.push("");
    md.push(`Scanned **${report.scannedFiles}** files under \`dist/\` at \`${report.scannedAt}\`.`);
    md.push("");
    if (report.nameMatches.length > 0) {
      md.push(`### Literal \`SB_MGMT_ACCESS_TOKEN\` (${report.nameMatches.length})`);
      md.push("");
      md.push("| File | Line:Col | Snippet |");
      md.push("| --- | --- | --- |");
      for (const m of report.nameMatches) {
        md.push(`| \`${m.file}\` | ${m.line}:${m.column} | \`${m.snippet.replaceAll("|", "\\|")}\` |`);
      }
      md.push("");
    }
    if (report.valueMatches.length > 0) {
      md.push(`### Token **value** leaked (${report.valueMatches.length})`);
      md.push("");
      md.push("| File | Line:Col | Snippet (value masked) |");
      md.push("| --- | --- | --- |");
      for (const m of report.valueMatches) {
        md.push(`| \`${m.file}\` | ${m.line}:${m.column} | \`${m.snippet.replaceAll("|", "\\|")}\` |`);
      }
      md.push("");
    }
    md.push("");
    md.push("`SB_MGMT_ACCESS_TOKEN` is server-only. Move the caller into a script, edge function, or CI job — never import from `scripts/ci/assertMgmtToken.ts` in `src/`.");
  }
  writeFileSync(REPORT_MD, md.join("\n") + "\n");
}

function printHuman(report: Report) {
  if (report.ok) {
    console.log(
      `✓ verify-no-mgmt-token: no ${TOKEN_NAME} references in dist/ ` +
        `(${report.scannedFiles} files; ${report.tokenValueChecked ? "name + value" : "name only; value not set in this env"}).`,
    );
    console.log(`  report: ${REPORT_JSON.replace(ROOT + "/", "")}`);
    console.log(`  summary: ${REPORT_MD.replace(ROOT + "/", "")}`);
    return;
  }
  console.error(`\n✗ verify-no-mgmt-token: SB_MGMT_ACCESS_TOKEN leak detected in dist/`);
  for (const m of report.nameMatches) {
    console.error(`  [name]  ${m.file}:${m.line}:${m.column}  ${m.snippet}`);
  }
  for (const m of report.valueMatches) {
    console.error(`  [value] ${m.file}:${m.line}:${m.column}  ${m.snippet}`);
  }
  console.error(`\n  report: ${REPORT_JSON.replace(ROOT + "/", "")}`);
  console.error(`  summary: ${REPORT_MD.replace(ROOT + "/", "")}`);
  console.error(
    "\nSB_MGMT_ACCESS_TOKEN is a server-only secret. Any browser bundle reference\n" +
      "leaks it to every visitor. Move the caller into a script, edge function,\n" +
      "or CI job — never import from `scripts/ci/assertMgmtToken.ts` in src/.",
  );
}

if (!existsSync(DIST_DIR)) {
  console.error("✗ verify-no-mgmt-token: dist/ not found — run `bun run build` first.");
  process.exit(1);
}

const tokenValue = process.env[TOKEN_NAME]?.trim() ?? "";
const tokenValueChecked = tokenValue.length >= 8;
const nameMatches: Match[] = [];
const valueMatches: Match[] = [];

const files = walk(DIST_DIR);
for (const file of files) {
  const content = readFileSync(file, "utf8");
  const rel = file.replace(ROOT + "/", "");
  if (content.includes(TOKEN_NAME)) {
    nameMatches.push(...findMatches(content, TOKEN_NAME, rel));
  }
  if (tokenValueChecked && content.includes(tokenValue)) {
    valueMatches.push(...findMatches(content, tokenValue, rel));
  }
}

const report: Report = {
  ok: nameMatches.length === 0 && valueMatches.length === 0,
  scannedAt: new Date().toISOString(),
  scannedFiles: files.length,
  tokenValueChecked,
  nameMatches,
  valueMatches,
};

writeReports(report);
printHuman(report);
process.exit(report.ok ? 0 : 1);
