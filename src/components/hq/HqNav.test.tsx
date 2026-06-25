import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HqNav } from "./HqNav";
import { HQ_SECTIONS, activeHqSection } from "./hqAccess";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ roles: ["admin"], isPreview: false }),
}));
vi.mock("@/hooks/useHqMode", () => ({
  useHqMode: () => ({ isPreview: false }),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <HqNav />
    </MemoryRouter>,
  );
}

describe("HqNav primary sections", () => {
  it("declares the four institutional sections with real default paths", () => {
    const map = Object.fromEntries(HQ_SECTIONS.map((s) => [s.key, s.defaultPath]));
    expect(map).toEqual({
      applications: "/hq",
      content: "/hq/media",
      projects: "/hq/projects",
      clients: "/hq/clients",
    });
  });

  it("renders each top-level item as a clickable link pointing at its section default", () => {
    renderAt("/hq");
    for (const section of HQ_SECTIONS) {
      const link = screen.getByRole("link", { name: section.label });
      expect(link).toBeTruthy();
      expect(link.getAttribute("href")).toBe(section.defaultPath);
    }
  });

  it("activeHqSection resolves section landing pages", () => {
    const roles = ["admin"] as const;
    expect(activeHqSection("/hq", [...roles])).toBe("applications");
    expect(activeHqSection("/hq/media", [...roles])).toBe("content");
    expect(activeHqSection("/hq/projects", [...roles])).toBe("projects");
    expect(activeHqSection("/hq/clients", [...roles])).toBe("clients");
    expect(activeHqSection("/hq/staff", [...roles])).toBe("clients");
  });
});
