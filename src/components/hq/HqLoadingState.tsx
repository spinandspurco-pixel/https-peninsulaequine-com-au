import logoPeMark from "@/assets/logo-pe-square.png";

interface HqLoadingStateProps {
  /** Primary line, e.g. "Preparing HQ…" or "Checking access…" */
  label?: string;
  /** Optional secondary line for context (kept very quiet) */
  hint?: string;
  /** Reserve full viewport height — use on dedicated pages */
  fullHeight?: boolean;
}

/**
 * Calm, premium HQ loading state. No spinner-first design — uses the PE
 * mark with a slow architectural pulse so it reads as "system is working"
 * without the generic dashboard-spinner feel.
 */
export function HqLoadingState({
  label = "Preparing HQ…",
  hint,
  fullHeight = true,
}: HqLoadingStateProps) {
  return (
    <div
      className={
        (fullHeight ? "min-h-[80vh] " : "py-24 ") +
        "relative flex items-center justify-center bg-secondary overflow-hidden"
      }
      role="status"
      aria-live="polite"
    >
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, hsl(var(--accent) / 0.05), transparent)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="hq-loading-mark inline-flex items-center justify-center w-14 h-14 rounded-sm bg-accent/10 border border-accent/20 mb-6">
          <img
            src={logoPeMark}
            alt=""
            aria-hidden
            className="h-8 w-8 object-contain"
            decoding="async"
          />
        </div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent/80 font-sans">
          Peninsula Equine
        </p>
        <p className="mt-4 text-sm tracking-[0.18em] uppercase text-foreground/70">
          {label}
        </p>
        {hint && (
          <p className="mt-2 text-xs text-muted-foreground/70 max-w-xs leading-relaxed">
            {hint}
          </p>
        )}
      </div>

      <style>{`
        @keyframes hqLoadingPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.02); }
        }
        .hq-loading-mark {
          animation: hqLoadingPulse 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hq-loading-mark { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
