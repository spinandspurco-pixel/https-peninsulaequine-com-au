/**
 * Unit tests for the affected-areas mapper used by the nightly security
 * scan. The mapper is pure over an injected `searcher`, so we exercise
 * the de-dup, cap, error-tolerance, and rendering behaviour without
 * touching the filesystem or spawning ripgrep.
 */

import { describe, it, expect, vi } from "vitest";
import {
  mapAffectedAreas,
  renderAffectedAreas,
  type AddedFinding,
} from "../../scripts/ci/affected-areas";

const finding = (over: Partial<AddedFinding> = {}): AddedFinding => ({
  source: "supabase",
  fingerprint: "abc",
  name: "rls_disabled_in_public",
  level: "ERROR",
  schema: "public",
  object: "new_table",
  searchHints: ["new_table", "public.new_table"],
  ...over,
});

describe("mapAffectedAreas", () => {
  it("resolves files via the injected searcher and de-duplicates hints", async () => {
    const search = vi.fn(async (token: string) =>
      token === "new_table"
        ? ["supabase/migrations/0001_new_table.sql"]
        : ["src/components/NewTable.tsx", "supabase/migrations/0001_new_table.sql"],
    );

    const out = await mapAffectedAreas([finding()], search);

    expect(out[0].affectedFiles.sort()).toEqual([
      "src/components/NewTable.tsx",
      "supabase/migrations/0001_new_table.sql",
    ]);
    expect(search).toHaveBeenCalledTimes(2);
  });

  it("caps affected files per finding to stay under GitHub's issue body limit", async () => {
    const search = vi.fn(async () =>
      Array.from({ length: 50 }, (_, i) => `src/f${i}.ts`),
    );
    const out = await mapAffectedAreas([finding()], search, { maxFilesPerFinding: 5 });
    expect(out[0].affectedFiles).toHaveLength(5);
  });

  it("skips short or empty hints that would match almost any file", async () => {
    const search = vi.fn(async () => ["src/should-not-appear.ts"]);
    const out = await mapAffectedAreas(
      [finding({ searchHints: ["", "a", "ok"] })],
      search,
    );
    expect(out[0].affectedFiles).toEqual([]);
    expect(search).not.toHaveBeenCalled();
  });

  it("does not abort the run when one hint's searcher throws", async () => {
    const search = vi.fn(async (token: string) => {
      if (token === "new_table") throw new Error("rg crashed");
      return ["src/ok.ts"];
    });
    const out = await mapAffectedAreas([finding()], search);
    expect(out[0].affectedFiles).toEqual(["src/ok.ts"]);
  });
});

describe("renderAffectedAreas", () => {
  it("returns empty string when no finding has affected files", () => {
    expect(
      renderAffectedAreas([{ ...finding(), affectedFiles: [] }]),
    ).toBe("");
  });

  it("groups files under their finding with source and label", () => {
    const md = renderAffectedAreas([
      {
        ...finding({ source: "wiz", name: "open-bucket", object: "leak-bucket" }),
        affectedFiles: ["supabase/storage.sql", "src/lib/upload.ts"],
      },
    ]);
    expect(md).toContain("### Affected code areas");
    expect(md).toContain("**[wiz] open-bucket**");
    expect(md).toContain("`public.leak-bucket`");
    expect(md).toContain("`supabase/storage.sql`");
    expect(md).toContain("`src/lib/upload.ts`");
  });
});
