import { CRMRecord } from "./crmTypes";

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
    { label: "Active", value: activeEnquiries },
    { label: "Awaiting", value: quotesAwaitingFollowUp },
    { label: "Won", value: wonThisMonth },
    { label: "Overdue", value: overdueFollowUps, alert: overdueFollowUps > 0 },
  ];

  return (
    <div className="flex items-center gap-8">
      {cards.map((card) => (
        <div key={card.label} className="flex items-baseline gap-2.5">
          <p
            className={`font-serif text-xl ${
              card.alert ? "text-amber-600/80" : "text-foreground"
            }`}
          >
            {card.value}
          </p>
          <p className="text-[9px] font-sans uppercase tracking-[0.18em] text-muted-foreground/45">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
