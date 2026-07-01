import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { RetryOutcome } from "@/lib/deployHealth/retry";

/**
 * End-to-end integration test for /hq/deploy-health.
 *
 * Simulates a runtime failure INSIDE the retry outcome renderer by returning
 * a malformed RetryOutcome (`after: null`) from runRetryPromotion. The
 * outcome section calls `retryOutcome.after.map(...)` while rendering per-
 * domain rows — that access throws, which must be caught by the real
 * RetryOutcomeErrorBoundary and surfaced as its friendly fallback UI.
 *
 * Unlike HqDeployHealth.retry.test.tsx, the boundary is NOT mocked here —
 * we want to exercise the full crash → capture → fallback pipeline.
 */

// -------- module mocks --------------------------------------------------

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/hq/HqNav", () => ({
  HqNav: () => <nav data-testid="hq-nav" />,
}));
vi.mock("@/components/hq/HqBreadcrumbs", () => ({
  HqBreadcrumbs: () => <div data-testid="hq-breadcrumbs" />,
}));
// NOTE: RetryOutcomeErrorBoundary is intentionally NOT mocked.

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "admin@peninsulaequine.com.au" },
    loading: false,
    isAdmin: true,
    isPreview: false,
    roles: ["admin"],
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/deployHealth", () => ({
  recordResults: vi.fn(),
  computeStreak: vi.fn(() => ({ streak: 0, worstAt: null })),
}));

vi.mock("@/lib/deployHealthAudit", () => ({
  logDeployHealthAudit: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/auditExport", () => ({
  auditRowsToCsv: () => "",
  auditRowsToJson: () => "[]",
  downloadTextFile: vi.fn(),
  timestampedFilename: () => "test.json",
}));

vi.mock("@/integrations/supabase/client", () => {
  const chain = {
    select: () => chain,
    order: () => chain,
    limit: () => Promise.resolve({ data: [], error: null }),
  };
  return { supabase: { from: () => chain } };
});

const runRetryPromotionMock = vi.fn();
vi.mock("@/lib/deployHealth/retry", async () => {
  const actual = await vi.importActual<typeof import("@/lib/deployHealth/retry")>(
    "@/lib/deployHealth/retry",
  );
  return {
    ...actual,
    runRetryPromotion: (...args: unknown[]) => runRetryPromotionMock(...args),
  };
});

// -------- lifecycle -----------------------------------------------------

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  runRetryPromotionMock.mockReset();
  // Swallow the expected React componentDidCatch noise so the test output
  // stays readable. We still assert on the fallback UI below.
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(""),
      } as unknown as Response),
    ),
  );
});

afterEach(() => {
  cleanup();
  errorSpy.mockRestore();
  vi.unstubAllGlobals();
});

// -------- test ----------------------------------------------------------

describe("HqDeployHealth · RetryOutcomeErrorBoundary integration", () => {
  it("catches a render-time crash in the outcome section and shows the friendly fallback", async () => {
    // Malformed outcome: `after` is null, so `retryOutcome.after.map(...)`
    // inside the outcome renderer will throw at render time.
    const brokenOutcome = {
      startedAt: "2026-07-01T00:00:00.000Z",
      finishedAt: "2026-07-01T00:00:05.000Z",
      attempts: 1,
      before: [
        { label: "Custom domain", bundleFile: "index-OLD.js", stuck: true },
      ],
      after: null as unknown as RetryOutcome["after"],
      status: "success" as const,
      message: "Boundary integration probe",
    } as unknown as RetryOutcome;

    runRetryPromotionMock.mockResolvedValueOnce({
      outcome: brokenOutcome,
      finalProbes: [],
    });

    const HqDeployHealth = (await import("@/pages/HqDeployHealth")).default;
    render(
      <MemoryRouter>
        <HqDeployHealth />
      </MemoryRouter>,
    );

    const btn = await screen.findByRole("button", { name: /retry promotion/i });
    fireEvent.click(btn);

    // Friendly fallback surfaces — role="alert" heading + descriptive copy
    // + Dismiss button + copy-payload affordance.
    const alert = await waitFor(() => screen.getByRole("alert"));
    expect(alert).toBeInTheDocument();
    expect(
      screen.getByText(/Retry outcome renderer crashed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Copy debug payload/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Dismiss$/i }),
    ).toBeInTheDocument();

    // The normal outcome banner must NOT render alongside the fallback.
    expect(screen.queryByText(/Retry succeeded/i)).toBeNull();

    // React logged the caught error at least once via componentDidCatch.
    expect(errorSpy).toHaveBeenCalled();
  });
});
