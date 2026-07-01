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
  });

  it("falls back to console.info when the clipboard write throws", async () => {
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
