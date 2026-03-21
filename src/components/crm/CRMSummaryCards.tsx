import { CRMRecord, PIPELINE_STAGES } from "./crmTypes";
import { Users, FileText, CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  records: CRMRecord[];
  quotes: { status: string; accepted_at: string | null }[];
  followUps: { status: string; due_date: string }[];
}

export function CRMSummaryCards({ records, quotes, followUps }: Props) {
  const activeEnquiries = records.filter(
    (r) => !["won", "live_project", "closed"].includes(r.deal_stage || "new")
  ).length;

  const quotesAwaitingFollowUp = quotes.filter(
    (q) => q.status === "sent" && !q.accepted_at
  ).length;

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  const wonThisMonth = records.filter(
    (r) => r.deal_stage === "won" && r.updated_at?.startsWith(thisMonth)
  ).length;

  const overdueFollowUps = followUps.filter(
    (f) => f.status === "pending" && f.due_date < today
  ).length;

  const cards = [
    { label: "Active Enquiries", value: activeEnquiries, icon: Users },
    { label: "Quotes Awaiting", value: quotesAwaitingFollowUp, icon: FileText },
    { label: "Won This Month", value: wonThisMonth, icon: CheckCircle },
    { label: "Overdue Follow-Ups", value: overdueFollowUps, icon: AlertTriangle, alert: overdueFollowUps > 0 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-5 bg-card/80 border border-border/40 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/60">
              {card.label}
            </p>
            <card.icon
              className={`h-4 w-4 ${
                card.alert ? "text-amber-500/70" : "text-accent/50"
              }`}
            />
          </div>
          <p
            className={`font-serif text-2xl ${
              card.alert ? "text-amber-600" : "text-foreground"
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
