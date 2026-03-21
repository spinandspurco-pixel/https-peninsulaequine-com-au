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
      <section className="py-20 text-center">
        <Check className="w-8 h-8 mx-auto mb-4" style={{ color: "#8C6A3B", opacity: 0.6 }} />
        <p className="font-serif text-2xl mb-2" style={{ color: "#2B2B2B" }}>Proposal Accepted</p>
        {quote.accepted_at && (
          <p className="text-[12px] font-sans" style={{ color: "#2B2B2B", opacity: 0.3 }}>
            {format(new Date(quote.accepted_at), "d MMMM yyyy")}
          </p>
        )}
        <p className="text-[13px] font-sans mt-4" style={{ color: "#2B2B2B", opacity: 0.35 }}>
          We'll be in touch to confirm next steps.
        </p>
      </section>
    );
  }

  if (isExpired) {
    return (
      <section className="py-20 text-center">
        <p className="font-serif text-2xl mb-3" style={{ color: "#2B2B2B", opacity: 0.6 }}>Quote Expired</p>
        <p className="text-[13px] font-sans mb-8" style={{ color: "#2B2B2B", opacity: 0.35 }}>
          This proposal is no longer valid. Contact us for an updated quote.
        </p>
        <a
          href="mailto:info@peninsulaequine.org?subject=Updated quote request"
          className="inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-sans uppercase tracking-[0.15em] transition-all duration-300 hover:opacity-80"
          style={{ background: "#8C6A3B", color: "#F6F3EE" }}
        >
          Request Updated Quote <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    );
  }

  return (
    <section className="py-20 border-t" style={{ borderColor: "rgba(43,43,43,0.05)" }}>
      <div className="text-center max-w-md mx-auto">
        <p className="font-serif text-2xl sm:text-3xl mb-3" style={{ color: "#2B2B2B", lineHeight: 1.15 }}>
          Proceed with Project
        </p>
        <p className="text-[12px] font-sans mb-10" style={{ color: "#2B2B2B", opacity: 0.3 }}>
          We take on a limited number of projects each year.
        </p>

        {/* Primary CTA */}
        <button
          onClick={onAccept}
          className="w-full px-8 py-4 text-[12px] font-sans uppercase tracking-[0.15em] transition-all duration-300 hover:opacity-90 mb-4"
          style={{ background: "#8C6A3B", color: "#F6F3EE" }}
        >
          Accept Proposal
          <ArrowRight className="inline-block w-4 h-4 ml-2" />
        </button>

        {/* Secondary CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`mailto:info@peninsulaequine.org?subject=Quote ${quote.quote_number} — Changes Requested`}
            className="flex items-center justify-center gap-2 px-4 py-3.5 text-[11px] font-sans uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-70 border"
            style={{ borderColor: "rgba(43,43,43,0.1)", color: "#2B2B2B", opacity: 0.5 }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Request Changes
          </a>
          <a
            href="tel:0418585489"
            className="flex items-center justify-center gap-2 px-4 py-3.5 text-[11px] font-sans uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-70 border"
            style={{ borderColor: "rgba(43,43,43,0.1)", color: "#2B2B2B", opacity: 0.5 }}
          >
            <Phone className="w-3.5 h-3.5" />
            Book a Call
          </a>
        </div>

        <p className="text-[11px] font-sans italic mt-8 mb-2" style={{ color: "#8C6A3B", opacity: 0.6 }}>
          GroundLock™ is specified where long-term performance matters.
        </p>
        <p className="text-[10px] font-sans" style={{ color: "#2B2B2B", opacity: 0.15 }}>
          By accepting, you agree to the scope and investment outlined above.
        </p>
      </div>
    </section>
  );
}
