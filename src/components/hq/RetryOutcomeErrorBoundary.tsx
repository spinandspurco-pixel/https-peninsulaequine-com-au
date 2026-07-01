import { Component, type ErrorInfo, type ReactNode } from "react";

export interface RetryOutcomeErrorReport {
  surface: "retry-outcome";
  timestamp: string;
  href: string;
  userAgent: string;
  error: { name: string; message: string; stack?: string };
  componentStack: string | null;
  hasDebugPayload: boolean;
  hasDebugContext: boolean;
}

interface Props {
  children: ReactNode;
  /** Snapshot of the retry outcome (RetryOutcome) at the time of failure. */
  debugPayload?: unknown;
  /**
   * Additional structured context — retry-loop inputs (targets, maxAttempts,
   * backoff schedule), in-flight progress, and the recent RetryLogEvent trail.
   * Included in the copied JSON so support can reason about the failure
   * without reproducing it.
   */
  debugContext?: unknown;
  /** Called when the user clicks "Reset". Typically clears retryOutcome state. */
  onReset?: () => void;
  /**
   * Analytics/monitoring hook. Fired once per captured error inside
   * componentDidCatch with a compact, PII-free report (error name/message,
   * component stack, surface metadata). Wire this to trackEvent / Sentry /
   * whichever monitoring surface is active — defaults to a no-op so tests
   * and standalone renders stay quiet.
   */
  onCapture?: (report: RetryOutcomeErrorReport) => void;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
  copyStatus: "idle" | "copied" | "failed";
}

/**
 * Error boundary that isolates the /hq/deploy-health retry outcome panel.
 * A syntax/runtime issue in the outcome renderer (e.g. an unexpected shape
 * from runRetryPromotion) should surface as a friendly fallback with
 * copyable debug info — not white-screen the whole page.
 */
export class RetryOutcomeErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null, copyStatus: "idle" };
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("[RetryOutcomeErrorBoundary]", error, info);
    try {
      const report: RetryOutcomeErrorReport = {
        surface: "retry-outcome",
        timestamp: new Date().toISOString(),
        href: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        error: { name: error.name, message: error.message, stack: error.stack },
        componentStack: info.componentStack ?? null,
        hasDebugPayload: this.props.debugPayload !== undefined,
        hasDebugContext: this.props.debugContext !== undefined,
      };
      this.props.onCapture?.(report);
    } catch (hookError) {
      // Never let the monitoring hook itself break the fallback UI.
      // eslint-disable-next-line no-console
      console.error("[RetryOutcomeErrorBoundary] onCapture failed", hookError);
    }
  }

  componentWillUnmount() {
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
  }

  private reset = () => {
    if (this.copyResetTimer) {
      clearTimeout(this.copyResetTimer);
      this.copyResetTimer = null;
    }
    this.setState({ error: null, info: null, copyStatus: "idle" });
    this.props.onReset?.();
  };

  /** Exposed for tests — builds the exact JSON payload written to the clipboard. */
  buildDebugPayload() {
    const { error, info } = this.state;
    return {
      surface: "hq/deploy-health/retry-outcome",
      timestamp: new Date().toISOString(),
      href: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      error: error
        ? { name: error.name, message: error.message, stack: error.stack }
        : null,
      componentStack: info?.componentStack ?? null,
      retryOutcome: this.props.debugPayload ?? null,
      retryContext: this.props.debugContext ?? null,
    };
  }

  private scheduleCopyStatusReset() {
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
    this.copyResetTimer = setTimeout(() => {
      this.setState({ copyStatus: "idle" });
      this.copyResetTimer = null;
    }, 2500);
  }

  private copyDebug = async () => {
    const payload = this.buildDebugPayload();
    const serialised = JSON.stringify(payload, null, 2);
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(serialised);
      this.setState({ copyStatus: "copied" });
    } catch {
      // Clipboard blocked — fall back to console so the payload is still recoverable.
      // eslint-disable-next-line no-console
      console.info("[RetryOutcomeErrorBoundary] debug payload", payload);
      this.setState({ copyStatus: "failed" });
    }
    this.scheduleCopyStatusReset();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const { error, info } = this.state;
    return (
      <section
        role="alert"
        aria-live="polite"
        className="border border-red-600/40 bg-red-600/5 px-5 py-4 space-y-3"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-red-700">
            Retry outcome — render error
          </div>
          <button
            type="button"
            onClick={this.reset}
            className="text-[0.6rem] tracking-[0.3em] uppercase text-foreground/50 hover:text-foreground/80"
          >
            Reset
          </button>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
          The retry outcome panel failed to render. The rest of the page is
          unaffected. Copy the debug payload below and send it to Lovable
          Support so the underlying issue can be traced.
        </p>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-[0.7rem] text-foreground/70">
          <dt className="uppercase tracking-[0.3em] text-foreground/40">Error</dt>
          <dd className="break-words">
            <code>{error.name}: {error.message}</code>
          </dd>
        </dl>
        {info?.componentStack && (
          <details className="text-[0.7rem] text-foreground/60">
            <summary className="cursor-pointer uppercase tracking-[0.3em] text-foreground/40 text-[0.6rem]">
              Component stack
            </summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap border border-border/10 p-3 bg-background/40">
              {info.componentStack.trim()}
            </pre>
          </details>
        )}
        {error.stack && (
          <details className="text-[0.7rem] text-foreground/60">
            <summary className="cursor-pointer uppercase tracking-[0.3em] text-foreground/40 text-[0.6rem]">
              Stack trace
            </summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap border border-border/10 p-3 bg-background/40">
              {error.stack}
            </pre>
          </details>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
          <button
            type="button"
            onClick={this.copyDebug}
            aria-label="Copy debug payload"
            className="text-xs tracking-[0.3em] uppercase text-foreground/80 underline underline-offset-8"
          >
            Copy debug payload
          </button>
          <span
            role="status"
            aria-live="polite"
            data-copy-status={this.state.copyStatus}
            className={
              "text-[0.65rem] tracking-[0.3em] uppercase transition-opacity " +
              (this.state.copyStatus === "idle"
                ? "opacity-0"
                : this.state.copyStatus === "copied"
                  ? "text-emerald-700 opacity-100"
                  : "text-red-700 opacity-100")
            }
          >
            {this.state.copyStatus === "copied"
              ? "Copied to clipboard"
              : this.state.copyStatus === "failed"
                ? "Copy failed — payload logged to console"
                : ""}
          </span>
          <button
            type="button"
            onClick={this.reset}
            className="text-xs tracking-[0.3em] uppercase text-foreground/60 underline underline-offset-8"
          >
            Dismiss
          </button>
        </div>
      </section>
    );
  }
}

export default RetryOutcomeErrorBoundary;
