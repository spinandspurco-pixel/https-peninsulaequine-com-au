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

vi.mock("@/hooks/command/useWorkQueue", () => ({
  useWorkQueue: () => ({
    items: [
      {
        id: "followup:1",
        kind: "followup",
        label: "Reply to Sarah Thompson",
        detail: "Follow-up 2 days overdue",
        href: "/hq/inquiries",
        severity: "warn",
        score: 120,
      },
      {
        id: "enquiry:2",
        kind: "enquiry",
        label: "Triage new enquiry — Acme Stud",
        detail: "Arrived overnight",
        href: "/hq/inquiries",
        severity: "warn",
        score: 90,
      },
      {
        id: "media:pending:3",
        kind: "media",
        label: "Approve 3 media assets",
        href: "/hq/media",
        severity: "info",
        score: 50,
      },
    ],
    isLoading: false,
    error: null,
    snooze: vi.fn(),
    dismiss: vi.fn(),
    restore: vi.fn(),
    hiddenCount: 0,
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

  it("renders ranked work-queue items pointing at their drill-down routes", () => {
    renderPage();
    const followUp = screen.getByRole("link", { name: /Reply to Sarah Thompson/i });
    expect(followUp.getAttribute("href")).toBe("/hq/inquiries");
    const enquiry = screen.getByRole("link", { name: /Triage new enquiry/i });
    expect(enquiry.getAttribute("href")).toBe("/hq/inquiries");
    const media = screen.getByRole("link", { name: /Approve 3 media assets/i });
    expect(media.getAttribute("href")).toBe("/hq/media");
  });

  it("exposes Snooze and Done controls per work-queue item", () => {
    renderPage();
    expect(
      screen.getAllByRole("button", { name: /Snooze .* for 24 hours/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /^Dismiss /i }).length).toBeGreaterThan(0);
  });

  it("shows the admin-only system-health band including Graph Smoke", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /system health/i })).toBeTruthy();
    const link = screen.getByRole("link", { name: /graph smoke test/i });
    expect(link.getAttribute("href")).toBe("/hq/graph-smoke");
  });
});
