import { describe, expect, it } from "vitest";
import {
  firstNonEmpty,
  findProjectByCodeFamily,
  overlayProject,
  overlayService,
  type ManagedProject,
  type ManagedService,
} from "@/lib/managedContent";

// Regression coverage for the CMS-to-public overlay layer. These helpers
// power /services, /services/:id and /selected-works — if they break,
// public pages either go blank or stop reflecting admin edits.

const baseService = {
  k: "01",
  slug: "covered-arenas",
  title: "Covered Arenas",
  body: "hardcoded body",
  image: "/img.jpg",
  alt: "alt",
  href: "/arenas",
};

const baseProject = {
  slug: "/selected-works/aberdeen",
  code: "PE-AB-019",
  category: "Indoor Arena",
  title: "Aberdeen",
  location: "Mornington Peninsula",
  year: "2024",
  status: "Resolved" as const,
  thesis: "hardcoded thesis",
  scope: "hardcoded scope",
  challenge: "x",
  solution: "x",
  outcome: "x",
  image: "/img.jpg",
  alt: "alt",
  crop: "object-center",
};

describe("firstNonEmpty", () => {
  it("returns the first non-empty trimmed string", () => {
    expect(firstNonEmpty(null, undefined, "", "  ", "hit")).toBe("hit");
  });
  it("returns undefined when nothing matches", () => {
    expect(firstNonEmpty(null, undefined, "", "   ")).toBeUndefined();
  });
});

describe("overlayService", () => {
  it("returns hardcoded entry when no managed row is given", () => {
    expect(overlayService(baseService, undefined)).toEqual(baseService);
  });

  it("overlays title/body/href from managed row when present", () => {
    const managed: ManagedService = {
      id: "1",
      slug: "arena-construction",
      title: "Arenas (CMS)",
      short_description: null,
      description: null,
      summary: "summary body",
      body: null,
      features: null,
      starting_price: null,
      cta_label: null,
      cta_url: "/arenas-cms",
      image_url: null,
      sort_order: 0,
      active: true,
    };
    const result = overlayService(baseService, managed);
    expect(result.title).toBe("Arenas (CMS)");
    expect(result.body).toBe("summary body");
    expect(result.href).toBe("/arenas-cms");
    // Visual fields preserved.
    expect(result.image).toBe(baseService.image);
  });

  it("falls back to hardcoded values when managed fields are empty", () => {
    const managed: ManagedService = {
      id: "1",
      slug: "arena-construction",
      title: "",
      short_description: null,
      description: null,
      summary: null,
      body: null,
      features: null,
      starting_price: null,
      cta_label: null,
      cta_url: "",
      image_url: null,
      sort_order: 0,
      active: true,
    };
    expect(overlayService(baseService, managed)).toEqual(baseService);
  });
});

describe("overlayProject", () => {
  it("returns hardcoded entry when no managed row is given", () => {
    expect(overlayProject(baseProject, undefined)).toEqual(baseProject);
  });

  it("overlays editable fields and maps status to display labels", () => {
    const managed: ManagedProject = {
      id: "1",
      code: "PE-AB-019",
      name: "Aberdeen Estate",
      location: "Red Hill, VIC",
      build_type: "Indoor Arena · Stables",
      status: "in_progress",
      scope: "new scope copy",
      client_summary: "new thesis copy",
      hero_image: null,
      sort_order: 1,
    };
    const result = overlayProject(baseProject, managed);
    expect(result.title).toBe("Aberdeen Estate");
    expect(result.location).toBe("Red Hill, VIC");
    expect(result.category).toBe("Indoor Arena · Stables");
    expect(result.scope).toBe("new scope copy");
    expect(result.thesis).toBe("new thesis copy");
    expect(result.status).toBe("In Progress");
    // Imagery and slug preserved.
    expect(result.image).toBe(baseProject.image);
    expect(result.slug).toBe(baseProject.slug);
  });

  it("maps `completed` to `Resolved`", () => {
    const managed: ManagedProject = {
      id: "1",
      code: "PE-AB-019",
      name: null,
      location: null,
      build_type: null,
      status: "completed",
      scope: null,
      client_summary: null,
      hero_image: null,
      sort_order: 1,
    };
    expect(overlayProject(baseProject, managed).status).toBe("Resolved");
  });
});

describe("findProjectByCodeFamily", () => {
  const managed: ManagedProject[] = [
    {
      id: "1",
      code: "PE-MR-014",
      name: "Main Ridge",
      location: null,
      build_type: null,
      status: null,
      scope: null,
      client_summary: null,
      hero_image: null,
      sort_order: 0,
    },
    {
      id: "2",
      code: "PE-AB-019",
      name: "Aberdeen",
      location: null,
      build_type: null,
      status: null,
      scope: null,
      client_summary: null,
      hero_image: null,
      sort_order: 1,
    },
  ];

  it("matches by code family prefix even when numbers differ", () => {
    expect(findProjectByCodeFamily("PE-MR-024", managed)?.id).toBe("1");
    expect(findProjectByCodeFamily("PE-AB-019", managed)?.id).toBe("2");
  });

  it("returns undefined when no family matches", () => {
    expect(findProjectByCodeFamily("PE-XX-001", managed)).toBeUndefined();
  });
});
