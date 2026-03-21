import type { LineItem } from "@/pages/ClientQuote";

const CATEGORY_LABELS: Record<string, string> = {
  earthworks: "Site Preparation",
  "ground-systems": "Ground Systems",
  fencing: "Fencing & Boundaries",
  construction: "Arena / Infrastructure",
  drainage: "Drainage",
  surface: "Surface Works",
  services: "Professional Services",
  logistics: "Access + Movement Zones",
  general: "General Works",
};

interface Props {
  groupedItems: Record<string, LineItem[]>;
  scopeSummary: string | null;
}

export function ProposalScope({ groupedItems, scopeSummary }: Props) {
  const categories = Object.entries(groupedItems);
  if (categories.length === 0 && !scopeSummary) return null;

  return (
    <section className="pb-20">
      <p
        className="text-[10px] font-sans uppercase tracking-[0.2em] mb-10"
        style={{ color: "#8C6A3B", opacity: 0.4 }}
      >
        Scope of Works
      </p>

      {scopeSummary && (
        <p
          className="text-[13px] font-sans leading-[2] max-w-2xl mb-12 whitespace-pre-line"
          style={{ color: "#2B2B2B", opacity: 0.35 }}
        >
          {scopeSummary}
        </p>
      )}

      <div className="space-y-8">
        {categories.map(([category, items]) => (
          <div
            key={category}
            className="p-8 sm:p-10"
            style={{
              background: "rgba(255,255,255,0.5)",
              borderLeft: "2px solid rgba(140,106,59,0.12)",
            }}
          >
            <p
              className="text-[12px] font-sans uppercase tracking-[0.15em] mb-5"
              style={{ color: "#2B2B2B", opacity: 0.6 }}
            >
              {CATEGORY_LABELS[category] || category}
            </p>
            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className="w-1 h-1 rounded-full mt-2 shrink-0"
                    style={{ background: "#8C6A3B", opacity: 0.3 }}
                  />
                  <div className="flex-1">
                    <p className="text-[13px] font-sans" style={{ color: "#2B2B2B", opacity: 0.65 }}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-[11px] font-sans mt-0.5" style={{ color: "#2B2B2B", opacity: 0.3 }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
