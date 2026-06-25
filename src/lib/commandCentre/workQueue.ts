/**
 * Work Queue — the primary answer to
 *   "If I open HQ at 7:00am, what should I do first?"
 *
 * Pure types + scoring + localStorage helpers. No data fetching here; the
 * hook composes signals from existing tables and feeds them through `rank()`.
 *
 * Items are ranked by an urgency-weighted score (higher = more urgent).
 * Dismiss / snooze state lives in localStorage so the queue genuinely gets
 * quieter as the operator works through it.
 */

export type WorkItemKind =
  | "followup"
  | "enquiry"
  | "review"
  | "media"
  | "project-stale"
  | "smoke";

export type WorkItemSeverity = "info" | "warn" | "critical";

export interface WorkItem {
  /** Stable id used as the snooze/dismiss key. */
  id: string;
  kind: WorkItemKind;
  /** Primary call-to-action sentence — what to do, not what happened. */
  label: string;
  /** Optional supporting context (deadline, count, project). */
  detail?: string;
  /** Where clicking goes. */
  href: string;
  severity: WorkItemSeverity;
  /** Raw score before snooze/dismiss filtering. Exposed for tests. */
  score: number;
}

// ─── Scoring weights ─────────────────────────────────────────────
// Higher = appears further up the queue.
export const SCORE = {
  smokeFailed: 110,
  followupOverdue: 100, // + 10 per day overdue, capped at +80
  newEnquiry: 90,
  reviewPending: 60,
  mediaPending: 50,
  projectStale: 40,
} as const;

export function scoreFollowup(daysOverdue: number): number {
  const bump = Math.min(Math.max(daysOverdue, 0), 8) * 10;
  return SCORE.followupOverdue + bump;
}

export function rank(items: WorkItem[]): WorkItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}

// ─── Snooze / dismiss persistence ────────────────────────────────
const STORAGE_KEY = "hq.commandCentre.workQueue.v1";
const SNOOZE_MS = 24 * 60 * 60 * 1000;
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

interface HiddenRecord {
  until: number; // epoch ms
  reason: "snoozed" | "dismissed";
}

type HiddenMap = Record<string, HiddenRecord>;

function readStore(): HiddenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HiddenMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(map: HiddenMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota / private mode — silently no-op */
  }
}

/** Returns map with expired entries pruned. */
function activeHidden(now = Date.now()): HiddenMap {
  const store = readStore();
  const next: HiddenMap = {};
  let changed = false;
  for (const [id, rec] of Object.entries(store)) {
    if (rec.until > now) next[id] = rec;
    else changed = true;
  }
  if (changed) writeStore(next);
  return next;
}

export function isHidden(id: string, now = Date.now()): boolean {
  const map = activeHidden(now);
  return !!map[id];
}

export function snoozeItem(id: string, now = Date.now()): void {
  const map = activeHidden(now);
  map[id] = { until: now + SNOOZE_MS, reason: "snoozed" };
  writeStore(map);
}

export function dismissItem(id: string, now = Date.now()): void {
  const map = activeHidden(now);
  map[id] = { until: now + DISMISS_MS, reason: "dismissed" };
  writeStore(map);
}

export function restoreAll(): void {
  writeStore({});
}

export function hiddenCount(now = Date.now()): number {
  return Object.keys(activeHidden(now)).length;
}

/** Filter ranked items, hiding snoozed/dismissed, then cap at `limit`. */
export function applyHiddenAndCap(
  items: WorkItem[],
  limit: number,
  now = Date.now(),
): WorkItem[] {
  const hidden = activeHidden(now);
  return items.filter((i) => !hidden[i.id]).slice(0, limit);
}
