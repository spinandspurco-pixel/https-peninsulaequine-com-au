import { describe, it, expect, beforeEach } from "vitest";
import {
  rank,
  scoreFollowup,
  SCORE,
  snoozeItem,
  dismissItem,
  isHidden,
  restoreAll,
  applyHiddenAndCap,
  hiddenCount,
  type WorkItem,
} from "./workQueue";

function item(id: string, score: number): WorkItem {
  return {
    id,
    kind: "followup",
    label: id,
    href: "/x",
    severity: "info",
    score,
  };
}

describe("workQueue scoring", () => {
  it("scoreFollowup bumps with days overdue and caps at +80", () => {
    expect(scoreFollowup(0)).toBe(SCORE.followupOverdue);
    expect(scoreFollowup(3)).toBe(SCORE.followupOverdue + 30);
    expect(scoreFollowup(20)).toBe(SCORE.followupOverdue + 80);
  });

  it("rank orders by score desc", () => {
    const out = rank([item("a", 10), item("b", 90), item("c", 50)]);
    expect(out.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });
});

describe("workQueue snooze/dismiss", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("snoozeItem hides an id, restoreAll clears it", () => {
    snoozeItem("followup:1");
    expect(isHidden("followup:1")).toBe(true);
    expect(hiddenCount()).toBe(1);
    restoreAll();
    expect(isHidden("followup:1")).toBe(false);
    expect(hiddenCount()).toBe(0);
  });

  it("dismissItem hides for longer than snooze", () => {
    dismissItem("review:open:3");
    expect(isHidden("review:open:3")).toBe(true);
  });

  it("hidden entries expire after their `until` timestamp", () => {
    snoozeItem("x", 1000);
    expect(isHidden("x", 1000 + 60_000)).toBe(true);
    // 24h + 1ms later → expired
    expect(isHidden("x", 1000 + 24 * 60 * 60 * 1000 + 1)).toBe(false);
  });

  it("applyHiddenAndCap filters and caps", () => {
    snoozeItem("a");
    const items = [item("a", 100), item("b", 90), item("c", 80), item("d", 70)];
    const out = applyHiddenAndCap(items, 2);
    expect(out.map((i) => i.id)).toEqual(["b", "c"]);
  });
});
