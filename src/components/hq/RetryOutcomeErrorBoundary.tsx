import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional serialisable snapshot of the retry outcome for debugging copy. */
  debugPayload?: unknown;
  /** Called when the user clicks "Reset". Typically clears retryOutcome state. */
  onReset?: () => void;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

/**
 * Error boundary that isolates the /hq/deploy-health retry outcome panel.
 * A syntax/runtime issue in the outcome renderer (e.g. an unexpected shape
 * from runRetryPromotion) should surface as a friendly fallback with
 * copyable debug info — not white-screen the whole page.
 */
export class RetryOutcomeErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("[RetryOutcomeErrorBoundary]", error, info);
  }

  private reset = () => {
    this.setState({ error: null, info: null });
    this.props.onReset?.();
  };

  private copyDebug = async () => {
    const { error, info } = this.state;
    const payload = {
      surface: "hq/deploy-health/retry-outcome",
      timestamp: new Date().toISOString(),
      href: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      error: error
        ? { name: error.name, message: error.message, stack: error.stack }
        : null,
      componentStack: info?.componentStack ?? null,
      retryOutcome: this.props.debugPayload ?? null,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    } catch {
      // Clipboard blocked — fall back to console so the payload is still recoverable.
      // eslint-disable-next-line no-console
      console.info("[RetryOutcomeErrorBoundary] debug payload", payload);
    }
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
            className="text-xs tracking-[0.3em] uppercase text-foreground/80 underline underline-offset-8"
          >
            Copy debug payload
          </button>
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
