import { describe, expect, it } from "vitest";
import { formatBytes, shortMime } from "@/lib/attachmentFormat";

describe("formatBytes", () => {
  it.each([
    [Number.NaN, ""],
    [Number.POSITIVE_INFINITY, ""],
    [-1, ""],
    [0, "0 B"],
    [1023, "1023 B"],
    [1024, "1 KB"],
    [1536, "2 KB"],
    [1024 * 1024, "1.0 MB"],
    [2.25 * 1024 * 1024, "2.3 MB"],
  ])("formats %s bytes as %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe("shortMime", () => {
  it.each([
    ["IMAGE/JPEG", "JPG"],
    ["image/png", "PNG"],
    ["image/webp", "WEBP"],
    ["application/pdf", "PDF"],
    ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "DOCX"],
    ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "XLSX"],
  ])("maps %s to %s", (mime, expected) => {
    expect(shortMime(mime)).toBe(expected);
  });

  it("derives a compact uppercase label for an unknown structured subtype", () => {
    expect(shortMime("application/problem+json")).toBe("PROBLE");
  });

  it("handles an unknown value without a slash", () => {
    expect(shortMime("custom")).toBe("CUSTOM");
  });
});
