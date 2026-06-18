import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Mobile visual-regression guard for the LumenArc teaser.
 *
 * The baked-in "PE / LUMENARC / Performance Recovery System / A New Standard Is
 * Under Construction" lockup lives inside the source image. On narrow viewports
 * `object-cover` crops the lockup and clips the wordmark — see the previous
 * mobile bug. These tests pin the exact Tailwind classes that fix it so the
 * regression cannot silently reappear.
 *
 * If you intentionally change the hero layout, update both the component and
 * the assertions below in the same commit.
 */

const read = (rel: string) =>
  readFileSync(resolve(process.cwd(), rel), "utf8");

describe("LumenArc mobile clipping regression", () => {
  describe("LumenArcEntrance backdrop", () => {
    const source = read("src/components/lumenarc/LumenArcEntrance.tsx");

    it("uses object-contain so the baked-in lockup is never cropped on phones", () => {
      // The backdrop <img> must keep object-contain on every breakpoint —
      // the lockup composition is part of the source asset and cannot survive
      // a crop on a 360–414px viewport.
      expect(source).toMatch(
        /<img[\s\S]*?className="[^"]*\bobject-contain\b[^"]*"[\s\S]*?la-entrance-bg/,
      );
    });

    it("does not silently upgrade to object-cover at any breakpoint", () => {
      // Guard against well-meaning `md:object-cover` style additions that
      // re-introduce the clipping bug on tablets/desktops too.
      expect(source).not.toMatch(/la-entrance-bg[\s\S]{0,200}?object-cover/);
      expect(source).not.toMatch(/object-cover[\s\S]{0,200}?la-entrance-bg/);
    });

    it("centers the contained image so the lockup stays in frame", () => {
      expect(source).toMatch(
        /<img[\s\S]*?className="[^"]*\bobject-center\b[^"]*"[\s\S]*?la-entrance-bg/,
      );
    });
  });

  describe("RecoveryStation hero image", () => {
    const source = read("src/pages/RecoveryStation.tsx");

    it("defaults to object-contain on mobile and only switches to object-cover at md+", () => {
      // Mobile default must be object-contain; the md: breakpoint may upgrade
      // to object-cover because the lockup has room to breathe at ≥768px.
      expect(source).toMatch(
        /className="[^"]*\bobject-contain\b[^"]*\bmd:object-cover\b[^"]*"/,
      );
    });

    it("never ships a bare object-cover on the hero image (mobile clipping guard)", () => {
      // Bare `object-cover` without a mobile-first `object-contain` partner
      // is what caused the original clipping bug.
      const heroImgMatch = source.match(
        /<img[\s\S]*?alt="LumenArc coming soon teaser visual[\s\S]*?\/>/,
      );
      expect(heroImgMatch, "LumenArc hero <img> should exist").toBeTruthy();
      const heroImg = heroImgMatch![0];
      expect(heroImg).toMatch(/\bobject-contain\b/);
      expect(heroImg).toMatch(/\bmd:object-cover\b/);
      // The mobile default class must come before any object-cover — i.e.
      // object-contain wins on phones and only md+ upgrades to cover.
      const classMatch = heroImg.match(/className="([^"]+)"/);
      expect(classMatch, "hero img should have a className").toBeTruthy();
      const cls = classMatch![1];
      const containIdx = cls.indexOf("object-contain");
      const bareCoverIdx = cls.search(/(?<!:)\bobject-cover\b/);
      expect(containIdx).toBeGreaterThanOrEqual(0);
      // Either there is no bare (unprefixed) object-cover at all, or it appears
      // after object-contain — the responsive prefix `md:object-cover` is fine.
      expect(bareCoverIdx === -1 || containIdx < bareCoverIdx).toBe(true);
    });

    it("centers the hero image so the lockup stays in frame", () => {
      const heroImgMatch = source.match(
        /<img[\s\S]*?alt="LumenArc coming soon teaser visual[\s\S]*?\/>/,
      );
      expect(heroImgMatch![0]).toMatch(/\bobject-center\b/);
    });
  });
});
