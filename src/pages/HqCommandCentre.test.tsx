import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HqCommandCentre from "@/pages/HqCommandCentre";

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "admin@peninsulaequine.com.au" },
    loading: false,
    roles: ["admin"],
    isAdmin: true,
    isPreview: false,
  }),
}));

vi.mock("@/hooks/useHqMode", () => ({
  useHqMode: () => ({ isPreview: false }),
}));

vi.mock("@/hooks/command/useMorningBrief", () => ({
  useMorningBrief: () => ({
    brief: {
      greeting: "Good morning",
      displayName: "Jordynn",
      sentence: "Good morning, Jordynn — 2 new enquiries arrived overnight.",
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/command/usePriorityCounts", () => ({
  usePriorityCounts: () => ({
    data: {
      enquiries: 2,
      projects: 4,
      clients_active: 1,
      media_pending: 3,
      review_pending: 0,
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/command/useActivityFeed", () => ({
  useActivityFeed: () => ({
    data: [
      {
        id: "smoke:1",
        kind: "smoke",
        ts: new Date().toISOString(),
        summary: "Graph Smoke · PASS · exit 0",
        href: "/hq/graph-smoke",
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/command/useWatchlist", () => ({
  useWatchlist: () => ({
    data: [
      {
        id: "media-pending",
        label: "3 media awaiting review",
        href: "/hq/media",
        severity: "info" as const,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/hq"]}>
        <HqCommandCentre />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("HqCommandCentre", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the four bands for an admin user", async () => {
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/Good morning, Jordynn — 2 new enquiries arrived overnight\./),
      ).toBeTruthy(),
    );
    expect(screen.getByRole("heading", { name: /priorities/i })).toBeTruthy();
    expect(screen.getByText(/Activity/)).toBeTruthy();
    expect(screen.getByText(/Watchlist/)).toBeTruthy();
  });

  it("each priority card is a link pointing at an existing HQ route", () => {
    renderPage();
    const expected: Array<[RegExp, string]> = [
      [/^Enquiries — /, "/hq/inquiries"],
      [/^Projects — /, "/hq/projects"],
      [/^Clients — /, "/hq/clients"],
      [/^Media — /, "/hq/media"],
      [/^Review Queue — /, "/hq/review"],
    ];
    for (const [label, href] of expected) {
      const link = screen.getByRole("link", { name: label });
      expect(link.getAttribute("href")).toBe(href);
    }
  });

  it("shows the admin-only system-health band including Graph Smoke", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /system health/i })).toBeTruthy();
    const link = screen.getByRole("link", { name: /graph smoke test/i });
    expect(link.getAttribute("href")).toBe("/hq/graph-smoke");
  });
});
