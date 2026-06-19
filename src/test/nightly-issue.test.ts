/**
 * Verifies the nightly security scan correctly:
 *  1. Builds an issue body that includes the run URL, both step outcomes,
 *     and the gate diff output (so reviewers can see what changed).
 *  2. Creates a new tracking issue when none is open.
 *  3. Comments on the existing tracking issue instead of duplicating it.
 */

import { describe, it, expect, vi } from "vitest";
import {
  buildIssueBody,
  reconcileIssue,
  NIGHTLY_ISSUE_TITLE,
  NIGHTLY_ISSUE_LABELS,
} from "../../scripts/ci/nightly-issue";

const SAMPLE_GATE_OUTPUT = `## Security Gate
- Project: \`aizkqajrzkvwuobisnzr\`
- Current findings: **3**
- Baseline findings: **1**
- New (must fix or acknowledge): **2**

### ❌ New security findings

| Level | Name | Object | Fingerprint |
| --- | --- | --- | --- |
| WARN | rls_disabled_in_public | public.new_table | \`abc123\` |
| ERROR | exposed_auth_users | public.leak_view | \`def456\` |
`;

describe("nightly security scan — issue body", () => {
  it("includes run URL, both outcomes, and the diff details", () => {
    const body = buildIssueBody({
      serverUrl: "https://github.com",
      repository: "acme/peninsula-equine",
      runId: "1234567890",
      gateOutcome: "failure",
      regressionOutcome: "success",
      gateOutput: SAMPLE_GATE_OUTPUT,
    });

    expect(body).toContain(
      "https://github.com/acme/peninsula-equine/actions/runs/1234567890",
    );
    expect(body).toContain("- Gate: **failure**");
    expect(body).toContain("- Regression suite: **success**");
    expect(body).toContain("New security findings");
    expect(body).toContain("public.new_table");
    expect(body).toContain("public.leak_view");
    expect(body).toContain("<details><summary>Gate output");
  });

  it("omits the diff block when gate output is empty", () => {
    const body = buildIssueBody({
      serverUrl: "https://github.com",
      repository: "acme/x",
      runId: "1",
      gateOutcome: "success",
      regressionOutcome: "failure",
      gateOutput: "",
    });
    expect(body).not.toContain("<details>");
  });

  it("truncates very large gate output to keep the issue under GitHub's limit", () => {
    const huge = "x".repeat(200_000);
    const body = buildIssueBody({
      serverUrl: "https://github.com",
      repository: "acme/x",
      runId: "1",
      gateOutcome: "failure",
      regressionOutcome: "failure",
      gateOutput: huge,
    });
    // 60k truncation + scaffolding stays well under GitHub's 65k issue body cap.
    expect(body.length).toBeLessThan(64_000);
  });
});

describe("nightly security scan — issue reconciliation", () => {
  it("creates a new issue when none is open with the tracking title", async () => {
    const create = vi.fn().mockResolvedValue({ number: 42 });
    const comment = vi.fn();
    const list = vi.fn().mockResolvedValue([
      { number: 7, title: "Some unrelated security issue" },
    ]);

    const result = await reconcileIssue(
      { list, create, comment },
      "body-here",
    );

    expect(result).toEqual({ action: "created", issueNumber: 42 });
    expect(create).toHaveBeenCalledWith({
      title: NIGHTLY_ISSUE_TITLE,
      body: "body-here",
      labels: NIGHTLY_ISSUE_LABELS,
    });
    expect(comment).not.toHaveBeenCalled();
  });

  it("comments on the existing tracking issue instead of duplicating", async () => {
    const create = vi.fn();
    const comment = vi.fn().mockResolvedValue(undefined);
    const list = vi.fn().mockResolvedValue([
      { number: 99, title: NIGHTLY_ISSUE_TITLE },
      { number: 7, title: "unrelated" },
    ]);

    const result = await reconcileIssue(
      { list, create, comment },
      "body-here",
    );

    expect(result).toEqual({ action: "commented", issueNumber: 99 });
    expect(comment).toHaveBeenCalledWith({
      issue_number: 99,
      body: "body-here",
    });
    expect(create).not.toHaveBeenCalled();
  });
});
