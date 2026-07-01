import type { SpamGuard } from "@/lib/spamGuard";

/**
 * Off-screen honeypot field paired with useSpamGuard().
 * Real users never see or focus this input; bots that autofill every
 * field will trip it and their submission is silently discarded.
 */
export function HoneypotField({ guard }: { guard: SpamGuard }) {
  return (
    <div style={guard.honeypotWrapperStyle} aria-hidden="true">
      <label>
        Website (leave blank)
        <input type="text" {...guard.honeypotProps} />
      </label>
    </div>
  );
}
