import type { RetryOutcome } from "@/lib/deployHealth/retry";

/**
 * Renders the per-domain results table for a retry outcome.
 *
 * Extracted from HqDeployHealth so that any runtime failure caused by a
 * malformed RetryOutcome (e.g. `after` missing, non-array, or containing
 * unexpected shapes) is thrown during THIS component's render — which lets
 * the surrounding RetryOutcomeErrorBoundary catch it. Inline JSX inside the
 * parent's render would otherwise throw in the parent's own scope, bypassing
 * the boundary.
 */
export function RetryOutcomeRows({ outcome }: { outcome: RetryOutcome }): JSX.Element {
  return (
    <>
      {outcome.after.map((a, idx) => {
        const b = outcome.before[idx];
        const beforeHash = b?.bundleFile ?? null;
        const afterHash = a.bundleFile ?? null;
        const changed = !!(beforeHash && afterHash && beforeHash !== afterHash);
        let rowStatus: "success" | "partial" | "no_change" | "error";
        let tone: string;
        if (!afterHash) {
          rowStatus = "error";
          tone = "text-red-700";
        } else if (!a.stuck && changed) {
          rowStatus = "success";
          tone = "text-emerald-700";
        } else if (!a.stuck) {
          rowStatus = "success";
          tone = "text-emerald-700";
        } else if (changed) {
          rowStatus = "partial";
          tone = "text-amber-700";
        } else {
          rowStatus = "no_change";
          tone = "text-amber-700";
        }
        const label = rowStatus === "no_change" ? "no change" : rowStatus;
        return (
          <tr key={`row-${a.label}`} className="border-t border-border/10 align-top">
            <td className="px-3 py-2 text-foreground/70">{a.label}</td>
            <td className="px-3 py-2 text-foreground/70">{outcome.attempts}</td>
            <td className="px-3 py-2">
              <code className={b?.stuck ? "text-amber-700" : "text-foreground/70"}>
                {beforeHash ?? "—"}
              </code>
            </td>
            <td className="px-3 py-2">
              <code className={a.stuck ? "text-amber-700" : "text-emerald-700"}>
                {afterHash ?? "—"}
              </code>
            </td>
            <td className={`px-3 py-2 uppercase tracking-[0.25em] text-[0.6rem] ${tone}`}>
              {label}
            </td>
          </tr>
        );
      })}
    </>
  );
}
