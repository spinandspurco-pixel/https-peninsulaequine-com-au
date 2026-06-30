import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Regression guard: if `tsconfig.app.json` ever drops `"node"` from its
 * `types` array (or @types/node disappears), these `node:*` imports and
 * the `process`/`Buffer` references below will fail to typecheck.
 *
 * The assertions also confirm the values exist at runtime under Vitest 4.
 */
describe("node globals", () => {
  it("exposes process with a platform string", () => {
    expect(typeof process).toBe("object");
    expect(typeof process.platform).toBe("string");
    expect(process.platform.length).toBeGreaterThan(0);
  });

  it("exposes Buffer with a working from()/toString() round-trip", () => {
    const round = Buffer.from("peninsula", "utf8").toString("utf8");
    expect(round).toBe("peninsula");
  });

  it("can resolve and read a file via node:fs / node:path / node:url", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const setupPath = resolve(here, "setup.ts");
    const contents = readFileSync(setupPath, "utf8");
    expect(contents).toContain("@testing-library/jest-dom");
  });
});
