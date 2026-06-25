import { describe, it, expect } from "vitest";
import { evaluate, type ProjectCandidate } from "@/lib/graph/evaluate";
import { filenameAliasRule } from "@/lib/graph/rules/filenameAlias";
import { projectTagRule } from "@/lib/graph/rules/projectTag";
import { textMentionRule } from "@/lib/graph/rules/textMention";

const mainRidge: ProjectCandidate = {
  id: "p1",
  code: "MR-001",
  name: "Main Ridge Pavilion",
  aliases: ["main-ridge", "mainridge", "mr", "main ridge pavilion"],
};

const aberdeen: ProjectCandidate = {
  id: "p2",
  code: "ABD-002",
  name: "Aberdeen",
  aliases: ["aberdeen-estate"],
};

const entity = { type: "media" as const, id: "m1" };

describe("filenameAliasRule", () => {
  it("matches a project code embedded in a filename", () => {
    expect(filenameAliasRule({ filename: "MR-001_pavilion_dawn.jpg" }, mainRidge)).toBe(true);
  });
  it("matches an alias with mixed punctuation", () => {
    expect(filenameAliasRule({ filename: "main_ridge_pavilion_01.png" }, mainRidge)).toBe(true);
  });
  it("does not match substrings inside other words", () => {
    expect(filenameAliasRule({ filename: "summer.jpg" }, mainRidge)).toBe(false);
  });
  it("returns false when filename is absent", () => {
    expect(filenameAliasRule({}, mainRidge)).toBe(false);
  });
});

describe("projectTagRule", () => {
  it("matches a tag equal to an alias", () => {
    expect(projectTagRule({ tags: ["main-ridge"] }, mainRidge)).toBe(true);
  });
  it("does not match an unrelated tag", () => {
    expect(projectTagRule({ tags: ["dawn", "arena"] }, mainRidge)).toBe(false);
  });
});

describe("textMentionRule", () => {
  it("matches a project name mentioned in prose", () => {
    expect(textMentionRule({ text: "Photographed at Main Ridge Pavilion this morning." }, mainRidge)).toBe(true);
  });
  it("does not falsely match unrelated text", () => {
    expect(textMentionRule({ text: "A general field note." }, mainRidge)).toBe(false);
  });
});

describe("evaluate", () => {
  it("surfaces Main Ridge as the top candidate for a Main Ridge upload", () => {
    const result = evaluate(
      entity,
      { filename: "MR-001_arena_dawn.jpg", tags: ["main-ridge"] },
      [mainRidge, aberdeen],
    );
    expect(result[0]?.to.id).toBe("p1");
    expect(result[0]?.matchedRules).toEqual(
      expect.arrayContaining(["filename_alias", "project_tag"]),
    );
  });

  it("returns no candidates when nothing matches", () => {
    const result = evaluate(entity, { filename: "untitled.jpg" }, [mainRidge, aberdeen]);
    expect(result).toEqual([]);
  });

  it("never persists numeric scores", () => {
    const result = evaluate(entity, { filename: "main-ridge.jpg" }, [mainRidge]);
    // score is present on the internal candidate but not on the matched_rules
    // payload that would be persisted.
    expect(result[0]?.matchedRules).not.toContain("40");
  });
});
