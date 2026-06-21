// Pure scanning logic for the Preview Mint Gate.
// Kept separate from index.ts so it can be unit-tested without a Deno serve
// bootstrap and without a live Supabase client.

export const NAME_BLOCKLIST = [
  "Josh Smith",
  "Test User",
  "Test Client",
  "Demo User",
  "Placeholder User",
  "Placeholder",
  "John Doe",
  "Jane Doe",
  "Operator",
  "Lorem Ipsum",
];

export const ALLOWED_EMAIL_DOMAINS = [
  "example.com",
  "example.org",
  "peninsulaequine.com.au",
  "peninsulaequine.org",
  "peninsulaequine.systems",
  "notify.peninsulaequine.org",
  "notify.peninsulaequine.systems",
];

export const FAKE_PHONE_MARKERS = [
  /0400[\s-]?000[\s-]?000/,
  /\+614000000000/,
];

export interface ScanTarget {
  table: string;
  nameCols: string[];
  emailCols: string[];
  phoneCols?: string[];
}

export interface Finding {
  table: string;
  column: string;
  match: string;
  rowId?: string | null;
  value: string;
}

export const TARGETS: ScanTarget[] = [
  { table: "inquiries", nameCols: ["name"], emailCols: ["email"], phoneCols: ["phone"] },
  {
    table: "quotes",
    nameCols: ["client_name", "accepted_by_name"],
    emailCols: ["client_email", "accepted_by_email"],
  },
  { table: "managed_testimonials", nameCols: ["client_name"], emailCols: [] },
  { table: "managed_projects", nameCols: ["name"], emailCols: [] },
  {
    table: "client_followups",
    nameCols: ["client_name", "project_name"],
    emailCols: ["client_email"],
  },
  { table: "event_rsvps", nameCols: ["name"], emailCols: ["email"], phoneCols: ["phone"] },
  {
    table: "equus_ridge_interest",
    nameCols: ["name"],
    emailCols: ["email"],
    phoneCols: ["phone"],
  },
  {
    table: "bookings",
    nameCols: ["client_name"],
    emailCols: ["client_email"],
    phoneCols: ["client_phone"],
  },
  {
    table: "lesson_bookings",
    nameCols: ["client_name"],
    emailCols: ["client_email"],
    phoneCols: ["client_phone"],
  },
  {
    table: "site_assessments",
    nameCols: ["client_name"],
    emailCols: ["client_email"],
    phoneCols: ["client_phone"],
  },
  { table: "newsletter_subscribers", nameCols: ["name"], emailCols: ["email"] },
];

export function scanRow(
  target: ScanTarget,
  row: Record<string, unknown>,
): Finding[] {
  const findings: Finding[] = [];
  const rowId = (row.id as string) ?? null;

  for (const col of target.nameCols) {
    const v = (row[col] ?? "") as string;
    if (!v) continue;
    for (const needle of NAME_BLOCKLIST) {
      const re = new RegExp(
        `\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i",
      );
      if (re.test(v)) {
        findings.push({
          table: target.table,
          column: col,
          match: `placeholder:${needle}`,
          rowId,
          value: v,
        });
      }
    }
  }

  for (const col of target.emailCols) {
    const v = ((row[col] ?? "") as string).toLowerCase().trim();
    if (!v) continue;
    const domain = v.split("@")[1] ?? "";
    const ok = ALLOWED_EMAIL_DOMAINS.some(
      (d) => domain === d || domain.endsWith("." + d),
    );
    if (!ok) {
      findings.push({
        table: target.table,
        column: col,
        match: "real_email_domain",
        rowId,
        value: v,
      });
    }
  }

  for (const col of target.phoneCols ?? []) {
    const v = ((row[col] ?? "") as string).trim();
    if (!v) continue;
    const isFake = FAKE_PHONE_MARKERS.some((re) => re.test(v));
    if (!isFake) {
      findings.push({
        table: target.table,
        column: col,
        match: "real_phone_pii",
        rowId,
        value: v,
      });
    }
  }

  return findings;
}
