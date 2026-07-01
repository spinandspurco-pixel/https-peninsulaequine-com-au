import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type {
  RetryOutcome,
  RetryStatus,
  RetrySnapshot,
} from "@/lib/deployHealth/retry";

/**
 * Integration test — clicks the "Retry promotion" button on HqDeployHealth
 * and asserts that the outcome banner renders the correct heading, message
 * and per-domain row status for each of the four RetryStatus classifications
 * ("success", "partial", "no_change", "error").
 *
 * Everything below the retry classifier (auth, layout, supabase audit log,
 * network probes, toasts) is stubbed so the test stays hermetic and only
 * asserts the retry branch of the UI.
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
vi.mock("@/components/hq/RetryOutcomeErrorBoundary", () => ({
  RetryOutcomeErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

// Mock the retry lib — leaves `isStuck` real, replaces `runRetryPromotion`
// with a per-test stub so we can force each RetryStatus classification.
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

// Silence the mount-time `run()` probe (which calls global fetch against
// the real production domains).
beforeEach(() => {
  runRetryPromotionMock.mockReset();
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
  vi.unstubAllGlobals();
});

// -------- fixture helpers ----------------------------------------------

const before: RetrySnapshot[] = [
  { label: "Custom domain", bundleFile: "index-OLD.js", stuck: true },
  { label: "Lovable published", bundleFile: "index-OLD.js", stuck: true },
];

function makeOutcome(
  status: RetryStatus,
  after: RetrySnapshot[],
  message: string,
): RetryOutcome {
  return {
    startedAt: "2026-07-01T00:00:00.000Z",
    finishedAt: "2026-07-01T00:00:05.000Z",
    attempts: status === "no_change" ? 4 : 2,
    before,
    after,
    status,
    message,
  };
}

const outcomes: Record<RetryStatus, RetryOutcome> = {
  success: makeOutcome(
    "success",
    [
      { label: "Custom domain", bundleFile: "index-NEW.js", stuck: false },
      { label: "Lovable published", bundleFile: "index-NEW.js", stuck: false },
    ],
    "Promotion landed — fresh bundle on 2/2 target(s).",
  ),
  partial: makeOutcome(
    "partial",
    [
      { label: "Custom domain", bundleFile: "index-NEW.js", stuck: false },
      { label: "Lovable published", bundleFile: "index-OLD.js", stuck: true },
    ],
    "Partial — 1 target(s) updated, 1 still stale.",
  ),
  no_change: makeOutcome(
    "no_change",
    [
      { label: "Custom domain", bundleFile: "index-OLD.js", stuck: true },
      { label: "Lovable published", bundleFile: "index-OLD.js", stuck: true },
    ],
    "No change after 4 attempt(s) — promotion still stuck. Escalate to Lovable Support.",
  ),
  error: makeOutcome(
    "error",
    before,
    "Retry failed: probe network error",
  ),
};

async function renderPage() {
  const HqDeployHealth = (await import("@/pages/HqDeployHealth")).default;
  render(
    <MemoryRouter>
      <HqDeployHealth />
    </MemoryRouter>,
  );
  return screen.findByRole("button", { name: /retry promotion/i });
}

async function clickRetryWith(status: RetryStatus) {
  const outcome = outcomes[status];
  runRetryPromotionMock.mockResolvedValueOnce({
    outcome,
    finalProbes: outcome.after.map((a) => ({
      label: a.label,
      url: "https://example.test",
      fetchedAt: "2026-07-01T00:00:05.000Z",
      ok: !a.stuck,
      bundleFile: a.bundleFile,
      bundleUrl: null,
      hasLegacyKey: a.stuck,
      hasModernKey: !a.stuck,
      bundleBytes: 1000,
      error: null,
    })),
  });
  const btn = await renderPage();
  fireEvent.click(btn);
  return outcome;
}

// -------- tests ---------------------------------------------------------

describe("HqDeployHealth · retry classifications", () => {
  it("renders SUCCESS banner and per-domain success rows", async () => {
    const outcome = await clickRetryWith("success");
    await waitFor(() =>
      expect(screen.getByText(/Retry succeeded/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(outcome.message)).toBeInTheDocument();
    // Both domains classified as success in the per-domain table.
    const rows = screen.getAllByText(/^success$/i);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    // Escalation actions must NOT appear on success.
    expect(screen.queryByText(/Escalate to Lovable Support/i)).toBeNull();
  });

  it("renders PARTIAL banner with mixed row statuses and escalation actions", async () => {
    const outcome = await clickRetryWith("partial");
    await waitFor(() =>
      expect(screen.getByText(/Retry partial/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(outcome.message)).toBeInTheDocument();
    expect(screen.getAllByText(/^success$/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/no change/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Escalate to Lovable Support/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy payload as JSON/i)).toBeInTheDocument();
  });

  it("renders NO_CHANGE banner with escalation actions and no fresh rows", async () => {
    const outcome = await clickRetryWith("no_change");
    await waitFor(() =>
      expect(screen.getByText(/Retry — no change/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(outcome.message)).toBeInTheDocument();
    expect(screen.getAllByText(/no change/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Escalate to Lovable Support/i)).toBeInTheDocument();
    // Attempts value from fixture (4) rendered in the summary.
    expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
  });

  it("renders ERROR banner and does NOT surface escalation actions", async () => {
    const outcome = await clickRetryWith("error");
    await waitFor(() =>
      expect(screen.getByText(/Retry error/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(outcome.message)).toBeInTheDocument();
    // Copy promotion report is always present; escalation is gated to
    // partial/no_change only, not to raw error outcomes.
    expect(screen.getByText(/Copy promotion report/i)).toBeInTheDocument();
    expect(screen.queryByText(/Escalate to Lovable Support/i)).toBeNull();
  });

  it("Dismiss button clears the outcome banner", async () => {
    await clickRetryWith("success");
    await waitFor(() =>
      expect(screen.getByText(/Retry succeeded/i)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /^dismiss$/i }));
    await waitFor(() =>
      expect(screen.queryByText(/Retry succeeded/i)).toBeNull(),
    );
  });
});
