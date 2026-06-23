export const INQUIRY_STATUSES = [
  "new",
  "in-progress",
  "awaiting-response",
  "quoted",
  "won",
  "closed",
  "archived",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

const LABELS: Record<string, string> = {
  new: "New",
  "in-progress": "In Progress",
  "awaiting-response": "Awaiting Response",
  quoted: "Quoted",
  won: "Won",
  closed: "Closed",
  archived: "Archived",
};

export function statusLabel(s: InquiryStatus | string | null | undefined): string {
  if (!s) return "—";
  return LABELS[s] ?? s;
}

export const STATUS_TONE: Record<string, string> = {
  new: "text-accent/85",
  "in-progress": "text-foreground/80",
  "awaiting-response": "text-amber-500/85",
  quoted: "text-sky-400/85",
  won: "text-emerald-400/85",
  closed: "text-foreground/45",
  archived: "text-foreground/35",
};
