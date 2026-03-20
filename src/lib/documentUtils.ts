import { format } from "date-fns";
import {
  FileText,
  DollarSign,
  HardHat,
  ClipboardCheck,
  ShieldCheck,
  FileWarning,
  ClipboardList,
  AlertTriangle,
  Heart,
} from "lucide-react";

// ── Shared Document Type Configs ──────────────────────────────
export const DOC_TYPES = {
  swms: {
    label: "SWMS",
    description: "Safe Work Method Statement",
    icon: HardHat,
    color: "text-orange-500",
  },
  work_permit: {
    label: "Work Permit",
    description: "Hot works, confined space & excavation permits",
    icon: ShieldCheck,
    color: "text-amber-600",
  },
  risk_assessment: {
    label: "Risk Assessment",
    description: "Job-specific risk assessment & controls",
    icon: FileWarning,
    color: "text-red-500",
  },
  payment_slip: {
    label: "Payment Slip",
    description: "Weekly timesheet — due every Wednesday",
    icon: DollarSign,
    color: "text-green-500",
  },
  site_inspection: {
    label: "Site Inspection",
    description: "Construction site condition report",
    icon: ClipboardCheck,
    color: "text-blue-500",
  },
  event_checklist: {
    label: "Event Safety",
    description: "Pre-event safety sign-off",
    icon: FileText,
    color: "text-purple-500",
  },
  daily_site_report: {
    label: "Daily Report",
    description: "End-of-day site progress report",
    icon: ClipboardList,
    color: "text-cyan-500",
  },
  incident_report: {
    label: "Incident Report",
    description: "Safety incident & near-miss reporting",
    icon: AlertTriangle,
    color: "text-rose-500",
  },
  horse_care_log: {
    label: "Horse Care Log",
    description: "Training, health & care record",
    icon: Heart,
    color: "text-pink-500",
  },
} as const;

export type DocType = keyof typeof DOC_TYPES;

// ── PDF Export Utility ──────────────────────────────
export function exportDocumentAsPDF(doc: any) {
  const cfg = DOC_TYPES[doc.document_type as DocType];
  const title = doc.title || "Document";
  const formData = doc.form_data || {};

  const formatValue = (key: string, value: any): string => {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    if (Array.isArray(value)) {
      if (value.length === 0) return "";
      if (typeof value[0] === "object") {
        return `<tr><td colspan="2" style="padding:8px;border-bottom:1px solid #ddd;"><strong>${label}</strong><br/>${value.map(item =>
          Object.entries(item).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" | ")
        ).join("<br/>")}</td></tr>`;
      }
      return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:600;width:35%">${label}</td><td style="padding:8px;border-bottom:1px solid #ddd">${value.join(", ")}</td></tr>`;
    }
    if (typeof value === "boolean") {
      return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:600;width:35%">${label}</td><td style="padding:8px;border-bottom:1px solid #ddd">${value ? "Yes" : "No"}</td></tr>`;
    }
    if (value && typeof value === "object") {
      return Object.entries(value).map(([k, v]) => formatValue(k, v)).join("");
    }
    if (!value && value !== 0) return "";
    return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:600;width:35%">${label}</td><td style="padding:8px;border-bottom:1px solid #ddd">${String(value)}</td></tr>`;
  };

  const rows = Object.entries(formData).map(([k, v]) => formatValue(k, v)).filter(Boolean).join("");

  const html = `<!DOCTYPE html><html><head><title>${title}</title><style>
    body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px 30px;color:#1a1a2e}
    .header{background:#171A23;color:#F5F1E8;padding:24px;border-radius:8px;margin-bottom:24px}
    .header h1{margin:0;font-size:22px;color:#E8C067} .header p{margin:6px 0 0;opacity:.7;font-size:13px}
    table{width:100%;border-collapse:collapse;font-size:14px} .status{display:inline-block;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#888;text-align:center}
    @media print{body{padding:20px}}
  </style></head><body>
    <div class="header"><h1>📋 ${cfg?.label || doc.document_type} — Peninsula Equine</h1>
    <p>${title} · ${doc.submitted_at ? format(new Date(doc.submitted_at), "d MMMM yyyy, h:mm a") : format(new Date(doc.created_at), "d MMMM yyyy")}</p>
    <p>Status: <span class="status" style="background:${doc.status === "approved" ? "#22c55e" : doc.status === "rejected" ? "#ef4444" : "#3b82f6"};color:#fff">${doc.status.toUpperCase()}</span></p></div>
    <table>${rows}</table>
    ${doc.review_notes ? `<div style="margin-top:20px;padding:12px;background:#fef2f2;border-radius:6px;font-size:13px"><strong>Admin Review Notes:</strong> ${doc.review_notes}</div>` : ""}
    <div class="footer">Peninsula Equine · 59 Tubbarubba Rd, Merricks North VIC 3926 · peninsulaequine.org<br/>Generated ${format(new Date(), "d MMM yyyy, h:mm a")}</div>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.onload = () => { setTimeout(() => { printWindow.print(); }, 300); };
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ── Status Config ──────────────────────────────
export const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "outline" as const, color: "text-muted-foreground" },
  submitted: { label: "Submitted", variant: "default" as const, color: "text-blue-500" },
  approved: { label: "Approved", variant: "secondary" as const, color: "text-green-500" },
  rejected: { label: "Needs Revision", variant: "destructive" as const, color: "text-destructive" },
};
