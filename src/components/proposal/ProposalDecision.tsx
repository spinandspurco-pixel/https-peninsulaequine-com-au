import { format } from "date-fns";
import type { QuoteData } from "@/pages/ClientQuote";
import { Check, ArrowRight, MessageSquare, Phone } from "lucide-react";

interface Props {
  quote: QuoteData;
  accepted: boolean;
  isExpired: boolean;
  onAccept: () => void;
}

export function ProposalDecision({ quote, accepted, isExpired, onAccept }: Props) {
  if (accepted) {
    return (
      <section className="py-24 text-center">
        <Check className="w-8 h-8 mx-auto mb-4" style={{ color: "#8C6A3B", opacity: 0.6 }} />
        <p className="font-serif text-2xl font-semibold mb-2" style={{ color: "#2B2B2B", letterSpacing: "0.01em" }}>Proposal Accepted</p>
        {quote.accepted_at && (
          <p className="text-[11px] font-sans" style={{ color: "#2B2B2B", opacity: 0.28 }}>
            {format(new Date(quote.accepted_at), "d MMMM yyyy")}
          </p>
        )}
        <p className="text-[12px] font-sans mt-4" style={{ color: "#2B2B2B", opacity: 0.32 }}>
          We'll be in touch to confirm next steps.
        </p>
      </section>
    );
  }

  if (isExpired) {
    return (
      <section className="py-24 text-center">
        <p className="font-serif text-2xl font-semibold mb-3" style={{ color: "#2B2B2B", opacity: 0.6, letterSpacing: "0.01em" }}>Quote Expired</p>
        <p className="text-[12px] font-sans mb-8" style={{ color: "#2B2B2B", opacity: 0.32 }}>
          This proposal is no longer valid. Contact us for an updated quote.
        </p>
        <a
          href="mailto:info@peninsulaequine.org?subject=Updated quote request"
          className="inline-flex items-center gap-2 px-8 py-3.5 text-[11px] font-sans uppercase tracking-[0.16em] font-medium transition-opacity duration-300 hover:opacity-85"
          style={{ background: "#8C6A3B", color: "#F6F3EE" }}
        >
          Request Updated Quote <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    );
  }

  return (
    <section className="py-24 border-t" style={{ borderColor: "rgba(43,43,43,0.05)" }}>
      <div className="text-center max-w-md mx-auto">
        <p className="font-serif text-2xl sm:text-3xl font-semibold mb-3" style={{ color: "#2B2B2B", lineHeight: 1.1, letterSpacing: "0.01em" }}>
          Proceed with Project
        </p>
        <p className="text-[11px] font-sans mb-10" style={{ color: "#2B2B2B", opacity: 0.28 }}>
          We take on a limited number of projects each year.
        </p>

        {/* Primary CTA */}
        <button
          onClick={onAccept}
          className="w-full px-8 py-4 text-[11px] font-sans uppercase tracking-[0.16em] font-medium transition-opacity duration-300 hover:opacity-88 mb-4"
          style={{ background: "#8C6A3B", color: "#F6F3EE" }}
        >
          Accept Proposal
          <ArrowRight className="inline-block w-4 h-4 ml-2" />
        </button>

        {/* Secondary CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`mailto:info@peninsulaequine.org?subject=Quote ${quote.quote_number} — Changes Requested`}
            className="flex items-center justify-center gap-2 px-4 py-3.5 text-[10px] font-sans uppercase tracking-[0.13em] transition-opacity duration-300 hover:opacity-65 border"
            style={{ borderColor: "rgba(43,43,43,0.08)", color: "#2B2B2B", opacity: 0.45 }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Request Changes
          </a>
          <a
            href="tel:0418585489"
            className="flex items-center justify-center gap-2 px-4 py-3.5 text-[10px] font-sans uppercase tracking-[0.13em] transition-opacity duration-300 hover:opacity-65 border"
            style={{ borderColor: "rgba(43,43,43,0.08)", color: "#2B2B2B", opacity: 0.45 }}
          >
            <Phone className="w-3.5 h-3.5" />
            Book a Call
          </a>
        </div>

        <p className="text-[9px] font-sans" style={{ color: "#2B2B2B", opacity: 0.14 }}>
          By accepting, you agree to the scope and investment outlined above.
        </p>
      </div>
    </section>
  );
}
