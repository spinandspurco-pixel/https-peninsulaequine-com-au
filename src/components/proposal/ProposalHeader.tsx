import { format } from "date-fns";
import type { QuoteData } from "@/pages/ClientQuote";
import { Check } from "lucide-react";

interface Props {
  quote: QuoteData;
  accepted: boolean;
  isExpired: boolean;
}

export function ProposalHeader({ quote, accepted, isExpired }: Props) {
  return (
    <>
      {/* Top strip */}
      <div className="flex items-center justify-between py-6 border-b" style={{ borderColor: "rgba(43,43,43,0.06)" }}>
        <p className="text-[11px] font-sans uppercase tracking-[0.22em] font-medium" style={{ color: "#8C6A3B", opacity: 0.7 }}>
          Peninsula Equine
        </p>
        <div className="text-right">
          <p className="text-[11px] font-sans font-medium" style={{ color: "#2B2B2B", opacity: 0.6 }}>
            {quote.client_name}
          </p>
          {quote.location && (
            <p className="text-[10px] font-sans" style={{ color: "#2B2B2B", opacity: 0.3 }}>
              {quote.location}
            </p>
          )}
          <p className="text-[9px] font-sans" style={{ color: "#2B2B2B", opacity: 0.2 }}>
            {format(new Date(quote.created_at), "d MMMM yyyy")}
          </p>
        </div>
      </div>

      {/* Hero heading */}
      <section className="pt-24 pb-18 sm:pt-32 sm:pb-24">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold"
              style={{ color: "#2B2B2B", lineHeight: 1.02, letterSpacing: "0.01em" }}
            >
              Project Proposal
            </h1>
            <p
              className="text-[13px] sm:text-[14px] font-sans mt-5 max-w-lg leading-[1.85]"
              style={{ color: "#2B2B2B", opacity: 0.38 }}
            >
              From Dirt to Dynasty.
            </p>
          </div>

          <div className="hidden sm:block text-right pt-2">
            {accepted ? (
              <div className="flex items-center gap-2" style={{ color: "#8C6A3B" }}>
                <Check className="w-4 h-4" />
                <span className="text-[10px] font-sans uppercase tracking-[0.18em] font-medium">Accepted</span>
              </div>
            ) : isExpired ? (
              <span className="text-[10px] font-sans uppercase tracking-[0.18em]" style={{ color: "#2B2B2B", opacity: 0.25 }}>
                Expired
              </span>
            ) : (
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.18em]" style={{ color: "#8C6A3B", opacity: 0.5 }}>
                  {quote.quote_number}
                </span>
                {quote.expiry_date && (
                  <p className="text-[9px] font-sans mt-1" style={{ color: "#2B2B2B", opacity: 0.2 }}>
                    Valid until {format(new Date(quote.expiry_date), "d MMMM yyyy")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Client context */}
        {quote.property_name && (
          <div className="mt-12 pt-8 border-t" style={{ borderColor: "rgba(43,43,43,0.05)" }}>
            <p className="text-[9px] font-sans uppercase tracking-[0.22em] mb-3" style={{ color: "#8C6A3B", opacity: 0.4 }}>
              Prepared for
            </p>
            <p className="font-serif text-xl font-medium" style={{ color: "#2B2B2B", opacity: 0.8, letterSpacing: "0.01em" }}>
              {quote.property_name}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
