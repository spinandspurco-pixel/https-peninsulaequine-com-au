/**
 * Tiny client-side CSV/JSON exporters for the deploy-health audit log.
 * Kept dependency-free so support handoffs work even in degraded preview modes.
 */

export type AuditExportRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  status: string | null;
  payload?: unknown;
};

const CSV_COLUMNS = [
  "id",
  "created_at",
  "actor_email",
  "action",
  "status",
  "payload",
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw =
    typeof value === "string" ? value : JSON.stringify(value);
  // Quote if it contains a comma, quote, CR, or LF.
  if (/[",\r\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function auditRowsToCsv(rows: AuditExportRow[]): string {
  const header = CSV_COLUMNS.join(",");
  const body = rows
    .map((row) =>
      CSV_COLUMNS.map((col) =>
        csvEscape((row as Record<string, unknown>)[col]),
      ).join(","),
    )
    .join("\r\n");
  return body.length > 0 ? `${header}\r\n${body}\r\n` : `${header}\r\n`;
}

export function auditRowsToJson(rows: AuditExportRow[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: "/hq/deploy-health",
      table: "deploy_health_audit",
      count: rows.length,
      rows,
    },
    null,
    2,
  );
}

export function downloadTextFile(
  filename: string,
  mime: string,
  contents: string,
): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke on next tick so the click handler completes the download first.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function timestampedFilename(prefix: string, ext: "csv" | "json"): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${stamp}.${ext}`;
}
