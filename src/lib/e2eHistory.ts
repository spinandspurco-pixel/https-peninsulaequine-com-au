// Local-only history of Google OAuth E2E attempts performed from /hq/diagnostics.
// Stored in localStorage; never sent anywhere. Capped at MAX entries.

export type E2eStatus = "ok" | "warn" | "fail";

export type E2eHistoryEntry = {
  id: string;
  at: number; // epoch ms
  status: E2eStatus;
  detail: string;
  mismatch?: string;
  origin?: string;
  durationMs?: number;
  label?: string;
};

const LABELS_KEY = "pe.e2e.labels.v1";
const LABELS_MAX = 12;

export function listE2eLabels(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LABELS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]).filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function rememberE2eLabel(label: string): void {
  if (typeof window === "undefined") return;
  const trimmed = label.trim();
  if (!trimmed) return;
  const existing = listE2eLabels().filter((l) => l.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...existing].slice(0, LABELS_MAX);
  try {
    window.localStorage.setItem(LABELS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function forgetE2eLabel(label: string): void {
  if (typeof window === "undefined") return;
  const next = listE2eLabels().filter((l) => l.toLowerCase() !== label.trim().toLowerCase());
  try {
    window.localStorage.setItem(LABELS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

const KEY = "pe.e2e.history.v1";
const MAX = 20;

function read(): E2eHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as E2eHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: E2eHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* ignore quota */
  }
}

export function listE2eHistory(): E2eHistoryEntry[] {
  return read();
}

export function recordE2eHistory(entry: Omit<E2eHistoryEntry, "id" | "at"> & { at?: number }): E2eHistoryEntry {
  const full: E2eHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: entry.at ?? Date.now(),
    status: entry.status,
    detail: entry.detail,
    mismatch: entry.mismatch,
    origin: entry.origin ?? (typeof window !== "undefined" ? window.location.origin : undefined),
    durationMs: entry.durationMs,
  };
  const next = [full, ...read()].slice(0, MAX);
  write(next);
  return full;
}

export function clearE2eHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function formatE2eTime(at: number): string {
  try {
    const d = new Date(at);
    return d.toLocaleString();
  } catch {
    return new Date(at).toISOString();
  }
}
