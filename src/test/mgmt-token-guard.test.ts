import { describe, expect, it, vi, afterEach } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  assertMgmtToken,
  scrubError,
  scrub,
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

  it("scrubError() strips the token from message, stack, and cause chain", () => {
    const token = "sbp_deep_secret_9876";
    assertMgmtToken({
      env: { SB_MGMT_ACCESS_TOKEN: token },
      skipConsoleSanitiser: true,
      skipProcessHandlers: true,
    });

    const inner = new Error(`upstream 401 with header Bearer ${token}`);
    const outer = new Error(`fetch failed for token ${token}`);
    (outer as { cause?: unknown }).cause = inner;

    const safe = scrubError(outer);
    expect(safe.message).not.toContain(token);
    expect(safe.message).toContain("[REDACTED:SB_MGMT_ACCESS_TOKEN]");
    expect(safe.stack ?? "").not.toContain(token);
    const cause = (safe as { cause?: Error }).cause;
    expect(cause).toBeInstanceOf(Error);
    expect(cause!.message).not.toContain(token);
    expect(cause!.message).toContain("[REDACTED:SB_MGMT_ACCESS_TOKEN]");
  });

  it("scrub() redacts the token inside nested plain objects", () => {
    const token = "sbp_object_secret_5555";
    assertMgmtToken({
      env: { SB_MGMT_ACCESS_TOKEN: token },
      skipConsoleSanitiser: true,
      skipProcessHandlers: true,
    });
    const payload = { req: { headers: { authorization: `Bearer ${token}` } }, note: "ok" };
    const safe = scrub(payload) as typeof payload;
    expect(JSON.stringify(safe)).not.toContain(token);
    expect(JSON.stringify(safe)).toContain("[REDACTED:SB_MGMT_ACCESS_TOKEN]");
  });
});
