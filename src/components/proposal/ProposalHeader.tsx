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
        <p className="text-[11px] font-sans uppercase tracking-[0.2em]" style={{ color: "#8C6A3B", opacity: 0.7 }}>
          Peninsula Equine
        </p>
        <div className="text-right">
          <p className="text-[12px] font-sans" style={{ color: "#2B2B2B", opacity: 0.6 }}>
            {quote.client_name}
          </p>
          {quote.location && (
            <p className="text-[11px] font-sans" style={{ color: "#2B2B2B", opacity: 0.3 }}>
              {quote.location}
            </p>
          )}
          <p className="text-[10px] font-sans" style={{ color: "#2B2B2B", opacity: 0.2 }}>
            {format(new Date(quote.created_at), "d MMMM yyyy")}
          </p>
        </div>
      </div>

      {/* Hero heading */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl"
              style={{ color: "#2B2B2B", lineHeight: 1.05 }}
            >
              Project Proposal
            </h1>
            <p
              className="text-[14px] sm:text-[15px] font-sans mt-5 max-w-lg leading-[1.8]"
              style={{ color: "#2B2B2B", opacity: 0.4 }}
            >
              Engineered equine infrastructure — built properly from the ground up.
            </p>
          </div>

          <div className="hidden sm:block text-right pt-2">
            {accepted ? (
              <div className="flex items-center gap-2" style={{ color: "#8C6A3B" }}>
                <Check className="w-4 h-4" />
                <span className="text-[11px] font-sans uppercase tracking-[0.15em]">Accepted</span>
              </div>
            ) : isExpired ? (
              <span className="text-[11px] font-sans uppercase tracking-[0.15em]" style={{ color: "#2B2B2B", opacity: 0.25 }}>
                Expired
              </span>
            ) : (
              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.15em]" style={{ color: "#8C6A3B", opacity: 0.5 }}>
                  {quote.quote_number}
                </span>
                {quote.expiry_date && (
                  <p className="text-[10px] font-sans mt-1" style={{ color: "#2B2B2B", opacity: 0.2 }}>
                    Valid until {format(new Date(quote.expiry_date), "d MMMM yyyy")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Client context */}
        {quote.property_name && (
          <div className="mt-10 pt-8 border-t" style={{ borderColor: "rgba(43,43,43,0.05)" }}>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] mb-3" style={{ color: "#8C6A3B", opacity: 0.4 }}>
              Prepared for
            </p>
            <p className="font-serif text-xl" style={{ color: "#2B2B2B", opacity: 0.8 }}>
              {quote.property_name}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
