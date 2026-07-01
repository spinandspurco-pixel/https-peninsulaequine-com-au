import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RetryOutcomeErrorBoundary } from "./RetryOutcomeErrorBoundary";

function Bomb({ message = "kaboom" }: { message?: string }): JSX.Element {
  throw new Error(message);
}

function Safe(): JSX.Element {
  return <div data-testid="safe-child">safe</div>;
}

describe("RetryOutcomeErrorBoundary", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("renders children when no error is thrown", () => {
    render(
      <RetryOutcomeErrorBoundary>
        <Safe />
      </RetryOutcomeErrorBoundary>,
    );
    expect(screen.getByTestId("safe-child")).toBeInTheDocument();
  });

  it("renders the friendly fallback UI when a child throws", () => {
    render(
      <RetryOutcomeErrorBoundary>
        <Bomb message="outcome exploded" />
      </RetryOutcomeErrorBoundary>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/Retry outcome — render error/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The retry outcome panel failed to render/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/outcome exploded/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Component stack/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Stack trace/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Copy debug payload/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dismiss/i })).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("copies a JSON debug payload including retryOutcome to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const debugPayload = { classification: "no_change", attempts: 4 };
    render(
      <RetryOutcomeErrorBoundary debugPayload={debugPayload}>
        <Bomb message="copy-me" />
      </RetryOutcomeErrorBoundary>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy debug payload/i }));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(writeText.mock.calls[0][0] as string);
    expect(payload.surface).toBe("hq/deploy-health/retry-outcome");
    expect(payload.error).toMatchObject({ name: "Error", message: "copy-me" });
    expect(payload.error.stack).toEqual(expect.any(String));
    expect(payload.componentStack).toEqual(expect.any(String));
    expect(payload.retryOutcome).toEqual(debugPayload);
    expect(payload.timestamp).toEqual(expect.any(String));

    // UX confirmation must be surfaced via an aria-live status region.
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/Copied to clipboard/i);
    expect(status).toHaveAttribute("data-copy-status", "copied");
  });

  it("copies retryContext (loop inputs, IDs, log trail) alongside the outcome", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const debugPayload = { status: "no_change", attempts: 4 };
    const debugContext = {
      projectId: "proj-123",
      actorEmail: "ops@example.com",
      lastCheckedAt: "2026-07-01T00:00:00.000Z",
      retryProgress: { attempt: 3, max: 4 },
      lastRetryError: null,
      config: {
        targets: [{ label: "Custom domain", url: "https://example.systems" }],
        maxAttempts: 4,
        backoffScheduleMs: [1500, 3000, 4500, 6000],
        logTrailLimit: 8,
      },
      recentLogEvents: [
        {
          command: "runRetryPromotion",
          phase: "attempt",
          attempt: 1,
          maxAttempts: 4,
          durationMs: 812,
          classification: { stillStuck: true, changed: false, willRetry: true },
        },
      ],
    };

    render(
      <RetryOutcomeErrorBoundary
        debugPayload={debugPayload}
        debugContext={debugContext}
      >
        <Bomb message="ctx-me" />
      </RetryOutcomeErrorBoundary>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy debug payload/i }));
    });

    const payload = JSON.parse(writeText.mock.calls[0][0] as string);
    expect(payload.retryOutcome).toEqual(debugPayload);
    expect(payload.retryContext).toEqual(debugContext);
    expect(payload.retryContext.config.backoffScheduleMs).toEqual([1500, 3000, 4500, 6000]);
    expect(payload.retryContext.config.targets[0].url).toBe("https://example.systems");
    expect(payload.retryContext.recentLogEvents[0].classification.willRetry).toBe(true);
  });

  it("auto-clears the copied confirmation after the display window", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <RetryOutcomeErrorBoundary>
        <Bomb />
      </RetryOutcomeErrorBoundary>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy debug payload/i }));
    });
    expect(screen.getByRole("status")).toHaveAttribute("data-copy-status", "copied");

    await act(async () => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.getByRole("status")).toHaveAttribute("data-copy-status", "idle");
    vi.useRealTimers();
  });

  it("falls back to console.info and shows a failure confirmation when clipboard throws", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    render(
      <RetryOutcomeErrorBoundary debugPayload={{ x: 1 }}>
        <Bomb />
      </RetryOutcomeErrorBoundary>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy debug payload/i }));
    });

    expect(infoSpy).toHaveBeenCalledWith(
      "[RetryOutcomeErrorBoundary] debug payload",
      expect.objectContaining({
        surface: "hq/deploy-health/retry-outcome",
        retryOutcome: { x: 1 },
      }),
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/Copy failed/i);
    expect(status).toHaveAttribute("data-copy-status", "failed");
  });

  it("shows the failure confirmation when the clipboard API is unavailable", async () => {
    Object.assign(navigator, { clipboard: undefined });
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    render(
      <RetryOutcomeErrorBoundary>
        <Bomb />
      </RetryOutcomeErrorBoundary>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy debug payload/i }));
    });

    expect(infoSpy).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveAttribute("data-copy-status", "failed");
  });

  it("resets state and invokes onReset when the reset button is clicked", () => {
    const onReset = vi.fn();
    function Toggle({ shouldThrow }: { shouldThrow: boolean }): JSX.Element {
      if (shouldThrow) throw new Error("boom");
      return <div data-testid="recovered">recovered</div>;
    }

    const { rerender } = render(
      <RetryOutcomeErrorBoundary onReset={onReset}>
        <Toggle shouldThrow />
      </RetryOutcomeErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Fix the child so a reset can actually recover.
    rerender(
      <RetryOutcomeErrorBoundary onReset={onReset}>
        <Toggle shouldThrow={false} />
      </RetryOutcomeErrorBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Dismiss/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByTestId("recovered")).toBeInTheDocument();
  });

  it("omits component-stack and stack-trace disclosures when they are absent", () => {
    // Force getDerivedStateFromError to produce an error without stack info,
    // and suppress componentDidCatch's info by throwing a plain object-like error.
    class NoStackError extends Error {
      constructor(msg: string) {
        super(msg);
        this.name = "NoStackError";
        this.stack = undefined;
      }
    }
    function BombNoStack(): JSX.Element {
      throw new NoStackError("bare");
    }

    render(
      <RetryOutcomeErrorBoundary>
        <BombNoStack />
      </RetryOutcomeErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/NoStackError: bare/)).toBeInTheDocument();
    // Stack trace disclosure should be hidden when error.stack is falsy.
    expect(screen.queryByText(/Stack trace/i)).not.toBeInTheDocument();
  });
});
