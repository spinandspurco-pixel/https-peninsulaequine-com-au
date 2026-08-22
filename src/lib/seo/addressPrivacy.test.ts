import { describe, expect, it } from "vitest";

import { siteConfig } from "@/data/content";
import { localBusinessNode } from "@/lib/seo/localBusinessJsonLd";

describe("public address privacy", () => {
  it("publishes locality data without a street address", () => {
    expect(siteConfig.address).toEqual({
      city: "Merricks North",
      state: "VIC",
      zip: "3926",
    });
    expect(localBusinessNode.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Merricks North",
      addressRegion: "VIC",
      postalCode: "3926",
      addressCountry: "AU",
    });
    expect(localBusinessNode.address).not.toHaveProperty("streetAddress");
  });
});
