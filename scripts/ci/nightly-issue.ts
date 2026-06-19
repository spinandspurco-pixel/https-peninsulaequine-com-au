/**
 * Builds the issue body and decides whether to create a new tracking
 * issue or comment on the existing one for the nightly security scan.
 *
 * Extracted from `.github/workflows/nightly-security-scan.yml` so the
 * logic can be unit-tested deterministically (see
 * `src/test/nightly-issue.test.ts`).
 */

export const NIGHTLY_ISSUE_TITLE =
  "Nightly security scan: new findings detected";
export const NIGHTLY_ISSUE_LABELS = ["security", "nightly-scan"];

export type Outcome = "success" | "failure" | "cancelled" | "skipped";

export interface BuildBodyInput {
  serverUrl: string;
  repository: string;
  runId: string;
  gateOutcome: Outcome;
  regressionOutcome: Outcome;
  gateOutput?: string | null;
}

export function buildIssueBody(input: BuildBodyInput): string {
  const {
    serverUrl,
    repository,
    runId,
    gateOutcome,
    regressionOutcome,
    gateOutput,
  } = input;

  let body = "## Nightly security scan detected new findings\n\n";
  body += `- Run: ${serverUrl}/${repository}/actions/runs/${runId}\n`;
  body += `- Gate: **${gateOutcome}**\n`;
  body += `- Regression suite: **${regressionOutcome}**\n\n`;

  if (gateOutput && gateOutput.trim().length > 0) {
    const truncated = gateOutput.slice(0, 60000);
    body +=
      "<details><summary>Gate output (diff vs baseline)</summary>\n\n```\n" +
      truncated +
      "\n```\n\n</details>\n";
  }

  return body;
}

export interface IssueLike {
  number: number;
  title: string;
}

export interface IssueClient {
  list: () => Promise<IssueLike[]>;
  create: (args: {
    title: string;
    body: string;
    labels: string[];
  }) => Promise<{ number: number }>;
  comment: (args: { issue_number: number; body: string }) => Promise<void>;
}

export type ReconcileResult =
  | { action: "created"; issueNumber: number }
  | { action: "commented"; issueNumber: number };

export async function reconcileIssue(
  client: IssueClient,
  body: string,
  title: string = NIGHTLY_ISSUE_TITLE,
  labels: string[] = NIGHTLY_ISSUE_LABELS,
): Promise<ReconcileResult> {
  const existing = await client.list();
  const match = existing.find((i) => i.title === title);
  if (match) {
    await client.comment({ issue_number: match.number, body });
    return { action: "commented", issueNumber: match.number };
  }
  const created = await client.create({ title, body, labels });
  return { action: "created", issueNumber: created.number };
}
