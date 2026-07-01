import { describe, expect, it, vi, afterEach } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  assertMgmtToken,
  MissingMgmtTokenError,
  ClientSideMgmtTokenError,
} from "../../scripts/ci/assertMgmtToken";

const TOKEN_NAME = "SB_MGMT_ACCESS_TOKEN";

const ROOT = resolve(__dirname, "../..");
const SRC_DIR = resolve(ROOT, "src");
const DIST_DIR = resolve(ROOT, "dist");

// This test file itself must reference the token name to assert on it, so we
// skip it (and the assertion helper source, which references it in server-side
// error messages) when walking `src/`.
const ALLOWED_REFERENCES = new Set<string>([
  resolve(__dirname, "mgmt-token-guard.test.ts"),
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs|css|html)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe("SB_MGMT_ACCESS_TOKEN client-side leakage", () => {
  it("is never referenced by name in client-side src/", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC_DIR)) {
      if (ALLOWED_REFERENCES.has(file)) continue;
      const content = readFileSync(file, "utf8");
      if (content.includes(TOKEN_NAME)) {
        offenders.push(file.replace(ROOT + "/", ""));
      }
    }
    expect(
      offenders,
      `SB_MGMT_ACCESS_TOKEN must never appear in client-side code. Offending files:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("is never referenced by name in dist/ (when a build exists)", () => {
    if (!existsSync(DIST_DIR)) {
      return; // no build in this run — CI covers this separately
    }
    const offenders: string[] = [];
    for (const file of walk(DIST_DIR)) {
      const content = readFileSync(file, "utf8");
      if (content.includes(TOKEN_NAME)) {
        offenders.push(file.replace(ROOT + "/", ""));
      }
    }
    expect(
      offenders,
      `SB_MGMT_ACCESS_TOKEN was baked into the client bundle:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});

describe("assertMgmtToken() runtime guard", () => {
  const originalConsole = { ...console };
  afterEach(() => {
    // restore console after each test (sanitiser installs wrappers)
    Object.assign(console, originalConsole);
    vi.restoreAllMocks();
  });

  it("throws MissingMgmtTokenError when the env var is undefined", () => {
    expect(() => assertMgmtToken({ env: {}, skipConsoleSanitiser: true })).toThrow(
      MissingMgmtTokenError,
    );
  });

  it("throws MissingMgmtTokenError when the env var is empty/whitespace", () => {
    expect(() =>
      assertMgmtToken({ env: { SB_MGMT_ACCESS_TOKEN: "   " }, skipConsoleSanitiser: true }),
    ).toThrow(MissingMgmtTokenError);
  });

  it("returns the token when set", () => {
    const token = assertMgmtToken({
      env: { SB_MGMT_ACCESS_TOKEN: "sbp_test_abc" },
      skipConsoleSanitiser: true,
    });
    expect(token).toBe("sbp_test_abc");
  });

  it("refuses to run in a browser-like environment", () => {
    // Simulate a browser bundle: window present, node process hidden.
    const g = globalThis as unknown as { process?: unknown; window?: unknown };
    const originalProcess = g.process;
    // vitest's jsdom env already provides `window`; hide `process.versions.node`
    g.process = undefined;
    try {
      expect(() =>
        assertMgmtToken({
          env: { SB_MGMT_ACCESS_TOKEN: "sbp_test_abc" },
          skipConsoleSanitiser: true,
        }),
      ).toThrow(ClientSideMgmtTokenError);
    } finally {
      g.process = originalProcess;
    }
  });

  it("redacts the token from console.log output when the sanitiser is installed", () => {
    const spy = vi.spyOn(originalConsole, "log").mockImplementation(() => {});
    // Rebind console.log so the sanitiser wraps our spy, not the real console.
    console.log = originalConsole.log;

    const token = "sbp_supersecret_value_123";
    assertMgmtToken({ env: { SB_MGMT_ACCESS_TOKEN: token } });

    console.log(`about to call api with token ${token} appended`);
    console.log({ authorization: `Bearer ${token}` });

    const logged = spy.mock.calls.flat().map((arg) =>
      typeof arg === "string" ? arg : JSON.stringify(arg),
    );
    for (const line of logged) {
      expect(line).not.toContain(token);
      expect(line).toContain("[REDACTED:SB_MGMT_ACCESS_TOKEN]");
    }
  });
});
