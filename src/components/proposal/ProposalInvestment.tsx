import type { QuoteData, LineItem } from "@/pages/ClientQuote";

const CATEGORY_LABELS: Record<string, string> = {
  earthworks: "Site Works",
  "ground-systems": "Ground Systems",
  fencing: "Fencing",
  construction: "Construction",
  drainage: "Drainage",
  surface: "Surface Works",
  services: "Professional Services",
  logistics: "Logistics",
  general: "General",
};

interface Props {
  quote: QuoteData;
  lineItems: LineItem[];
  groundlockOn: boolean;
  exclusions: string | null;
}

export function ProposalInvestment({ quote, lineItems, groundlockOn, exclusions }: Props) {
  // Group totals by category
  const categoryTotals = lineItems.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category || "general";
    // If groundlock is off, exclude ground-systems from total
    if (!groundlockOn && cat === "ground-systems") return acc;
    acc[cat] = (acc[cat] || 0) + item.line_total;
    return acc;
  }, {});

  const adjustedSubtotal = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const adjustedGst = adjustedSubtotal * 0.1;
  const adjustedTotal = adjustedSubtotal + adjustedGst;

  const fmt = (n: number) => n.toLocaleString("en-AU", { minimumFractionDigits: 2 });

  return (
    <section className="pb-20">
      <p
        className="text-[10px] font-sans uppercase tracking-[0.2em] mb-10"
        style={{ color: "#8C6A3B", opacity: 0.4 }}
      >
        Investment
      </p>

      {/* Breakdown rows */}
      <div className="space-y-4 mb-10">
        {Object.entries(categoryTotals).map(([cat, total]) => (
          <div key={cat} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(43,43,43,0.04)" }}>
            <p className="text-[13px] font-sans" style={{ color: "#2B2B2B", opacity: 0.45 }}>
              {CATEGORY_LABELS[cat] || cat}
            </p>
            <p className="text-[14px] font-sans tabular-nums" style={{ color: "#2B2B2B", opacity: 0.55 }}>
              ${fmt(total)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.5)" }}>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <p className="text-[13px] font-sans" style={{ color: "#2B2B2B", opacity: 0.4 }}>Subtotal</p>
            <p className="text-[14px] font-sans tabular-nums" style={{ color: "#2B2B2B", opacity: 0.55 }}>
              ${fmt(adjustedSubtotal)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-[13px] font-sans" style={{ color: "#2B2B2B", opacity: 0.4 }}>GST (10%)</p>
            <p className="text-[14px] font-sans tabular-nums" style={{ color: "#2B2B2B", opacity: 0.55 }}>
              ${fmt(adjustedGst)}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-between items-center" style={{ borderColor: "rgba(140,106,59,0.15)" }}>
          <p className="text-[11px] font-sans uppercase tracking-[0.15em]" style={{ color: "#2B2B2B", opacity: 0.5 }}>
            Total Investment
          </p>
          <p className="font-serif text-2xl sm:text-3xl tabular-nums" style={{ color: "#2B2B2B" }}>
            ${fmt(adjustedTotal)}
          </p>
        </div>
      </div>

      {/* Exclusions */}
      {exclusions && (
        <div className="mt-12">
          <p
            className="text-[10px] font-sans uppercase tracking-[0.2em] mb-4"
            style={{ color: "#2B2B2B", opacity: 0.2 }}
          >
            Exclusions & Notes
          </p>
          <p className="text-[12px] font-sans leading-[1.9] whitespace-pre-line" style={{ color: "#2B2B2B", opacity: 0.3 }}>
            {exclusions}
          </p>
        </div>
      )}
    </section>
  );
}
