import { useRef, useCallback, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import { GroundLockHero } from "@/components/groundlock/GroundLockHero";
import { supabase } from "@/integrations/supabase/client";

/* ─── Data shape ─── */
interface ProposalData {
  clientName: string;
  propertyName: string;
  date: string;
  quoteNumber: string;
  overview: string;
  scopeItems: { phase: string; description: string }[];
  investmentTotal: string;
  investmentNote: string;
  layoutNotes?: string;
}

const SAMPLE: ProposalData = {
  clientName: "Client Name",
  propertyName: "Property Name",
  date: "March 2026",
  quoteNumber: "GL-0001",
  overview:
    "This proposal outlines a GroundLock system approach based on your site conditions, intended use, and long-term performance requirements.\n\nRather than applying a surface layer, the system is designed to create a stable, interlocking foundation that performs consistently under load.",
  scopeItems: [
    { phase: "Site Preparation", description: "Survey, profiling, and base formation to establish correct drainage grades and compaction levels." },
    { phase: "Panel Installation", description: "GroundLock panels laid in alternating geometry with precision alignment across all traffic zones." },
    { phase: "System Integration", description: "Edge restraint, connection detailing, and transition zones between stabilised and natural surfaces." },
    { phase: "Surface Completion", description: "Final surface preparation, levelling, and finishing for intended use." },
  ],
  investmentTotal: "[INSERT PRICE]",
  investmentNote: "The system is designed and delivered as a complete solution. Detailed breakdowns can be provided if required.",
};

/* ─── Grain overlay ─── */
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] grain-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.028,
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* ─── Divider ─── */
function Divider() {
  return (
    <div className="w-full py-2">
      <div className="h-px" style={{ background: "hsl(var(--border))", opacity: 0.3 }} />
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children, number }: { children: string; number: string }) {
  return (
    <div className="flex items-center gap-4 mb-12 sm:mb-16">
      <span className="text-[10px] font-sans tabular-nums" style={{ color: "hsl(var(--accent))", opacity: 0.3 }}>
        {number}
      </span>
      <span className="text-[9px] font-sans uppercase tracking-[0.25em] font-medium" style={{ color: "hsl(var(--accent))", opacity: 0.4 }}>
        {children}
      </span>
    </div>
  );
}

export default function ProposalTemplate() {
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("proposalId");
  const [data, setData] = useState<ProposalData>(SAMPLE);
  const [loading, setLoading] = useState(!!proposalId);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!proposalId) return;
    (async () => {
      const { data: p } = await supabase
        .from("groundlock_proposals")
        .select("*")
        .eq("id", proposalId)
        .single();
      if (p) {
        const scopeItems = Array.isArray(p.scope_items)
          ? (p.scope_items as unknown as { phase: string; description: string }[])
          : SAMPLE.scopeItems;
        setData({
          clientName: p.client_name || "Client Name",
          propertyName: p.property_name || "",
          date: new Date(p.proposal_date).toLocaleDateString("en-AU", { month: "long", year: "numeric" }),
          quoteNumber: p.proposal_ref,
          overview: p.overview || SAMPLE.overview,
          scopeItems,
          investmentTotal: p.investment_total || "[INSERT PRICE]",
          investmentNote: p.investment_note || SAMPLE.investmentNote,
          layoutNotes: p.layout_notes || undefined,
        });
      }
      setLoading(false);
    })();
  }, [proposalId]);

  const handlePrint = useCallback(() => window.print(), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
        <p className="text-[11px] font-sans" style={{ color: "hsl(var(--foreground))", opacity: 0.3 }}>Loading proposal…</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen relative proposal-root" style={{ background: "hsl(var(--background))" }}>
      <GrainOverlay />

      {/* Export button */}
      <button
        onClick={handlePrint}
        className="no-print fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 text-[9px] font-sans uppercase tracking-[0.18em] font-medium transition-opacity duration-300 hover:opacity-80"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", opacity: 0.5 }}
        aria-label="Export as PDF"
      >
        <Download className="w-3 h-3" />
        Export PDF
      </button>

      <div className="relative z-[2] max-w-3xl mx-auto px-8 sm:px-12 lg:px-16">

        {/* ══════════════════════════════════════
            1. COVER
        ══════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col relative proposal-cover">
          {/* Architectural vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 70% 55% at 50% 45%, transparent 0%, hsl(var(--background)) 100%),
              radial-gradient(ellipse 90% 80% at 50% 50%, hsla(var(--accent) / 0.02) 0%, transparent 70%)`,
          }} />

          {/* Engineering grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(hsla(var(--accent) / 0.03) 1px, transparent 1px),
              linear-gradient(90deg, hsla(var(--accent) / 0.03) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 80%)",
          }} />

          {/* Top strip */}
          <div className="relative z-10 flex items-center justify-between pt-14 pb-6">
            <p className="text-[9px] font-sans uppercase tracking-[0.3em] font-medium" style={{ color: "hsl(var(--accent))", opacity: 0.35 }}>
              Peninsula Equine
            </p>
            <p className="text-[8px] font-sans tabular-nums tracking-wider" style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}>
              {data.quoteNumber}
            </p>
          </div>

          {/* Central composition */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-20 sm:py-28">
            {/* PE Monogram */}
            <div className="mb-14">
              <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.6" style={{ opacity: 0.15 }} />
                <circle cx="60" cy="60" r="46" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.4" style={{ opacity: 0.08 }} />
                <path d="M38 85 V35 H55 C62 35 68 38 68 46 C68 54 62 57 55 57 H38" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }} />
                <path d="M74 85 H56 V35 H74 M56 60 H70" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }} />
              </svg>
            </div>

            <h1
              className="font-serif text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem] font-semibold mb-8"
              style={{ color: "hsl(var(--foreground))", lineHeight: 1.02, letterSpacing: "0.015em" }}
            >
              GroundLock System<br />Proposal
            </h1>

            <div className="w-10 h-px mx-auto mb-8" style={{ background: "hsl(var(--accent))", opacity: 0.25 }} />

            <p
              className="text-[12px] sm:text-[13px] font-sans tracking-wide max-w-sm leading-[1.9]"
              style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}
            >
              Designed for performance, stability, and long-term integrity.
            </p>
          </div>

          {/* Bottom metadata */}
          <div className="relative z-10 pb-14">
            <div className="h-px mb-8" style={{ background: "hsl(var(--border))", opacity: 0.25 }} />
            <div className="flex items-end justify-between">
              <div className="space-y-4">
                {data.clientName && (
                  <div>
                    <p className="text-[7px] font-sans uppercase tracking-[0.28em] mb-1" style={{ color: "hsl(var(--accent))", opacity: 0.3 }}>Prepared For</p>
                    <p className="text-[12px] font-sans" style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}>{data.clientName}</p>
                  </div>
                )}
                {data.propertyName && (
                  <div>
                    <p className="text-[7px] font-sans uppercase tracking-[0.28em] mb-1" style={{ color: "hsl(var(--accent))", opacity: 0.3 }}>Property</p>
                    <p className="text-[12px] font-sans" style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}>{data.propertyName}</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                {data.date && (
                  <div>
                    <p className="text-[7px] font-sans uppercase tracking-[0.28em] mb-1" style={{ color: "hsl(var(--accent))", opacity: 0.3 }}>Date</p>
                    <p className="text-[12px] font-sans" style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}>{data.date}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            2. PROJECT OVERVIEW
        ══════════════════════════════════════ */}
        <section className="pt-32 sm:pt-40 pb-28 sm:pb-36 proposal-section print-avoid-break">
          <SectionLabel number="01">Project Overview</SectionLabel>

          <div className="max-w-xl">
            {data.overview.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-[14px] font-sans leading-[2.05] mb-8 last:mb-0"
                style={{ color: "hsl(var(--foreground))", opacity: 0.38 }}
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            3. THE GROUNDLOCK SYSTEM
        ══════════════════════════════════════ */}
        <section className="py-28 sm:py-36 proposal-section print-page-break">
          <SectionLabel number="02">The GroundLock System</SectionLabel>

          {/* System visual */}
          <div
            className="w-full py-16 sm:py-20 mb-16 sm:mb-20 flex flex-col items-center text-center"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <GroundLockHero size="max-w-[160px]" opacity={0.55} className="mb-8" />
            <p className="text-[8px] font-sans uppercase tracking-[0.25em]" style={{ color: "hsl(var(--accent))", opacity: 0.35 }}>
              GroundLock™ Panel Unit
            </p>
          </div>

          {/* Copy — single version, no duplication */}
          <div className="max-w-xl space-y-6">
            <p className="text-[14px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.38 }}>
              GroundLock is designed as an interlocking system — not a surface layer.
            </p>
            <p className="text-[14px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.38 }}>
              Each panel connects in an alternating geometry, allowing the system to behave as a unified field under load.
            </p>
            <p className="text-[13px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.32 }}>
              This results in:
            </p>

            {/* Benefits — clean list */}
            <div className="space-y-3 pl-1">
              {[
                "More consistent load distribution",
                "Reduced long-term movement",
                "A more stable, predictable surface",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "hsl(var(--accent))", opacity: 0.35 }} />
                  <p className="text-[13px] font-sans" style={{ color: "hsl(var(--foreground))", opacity: 0.4 }}>{item}</p>
                </div>
              ))}
            </div>

            <p className="text-[13px] font-sans leading-[2] pt-4 italic" style={{ color: "hsl(var(--foreground))", opacity: 0.3 }}>
              Built to perform with intention — not just appearance.
            </p>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            4. PROPOSED LAYOUT
        ══════════════════════════════════════ */}
        <section className="py-28 sm:py-36 proposal-section print-page-break">
          <SectionLabel number="03">Proposed Layout</SectionLabel>

          {/* Layout placeholder */}
          <div
            className="w-full aspect-[16/10] relative overflow-hidden mb-6"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(hsla(var(--accent) / 0.04) 1px, transparent 1px),
                linear-gradient(90deg, hsla(var(--accent) / 0.04) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-8 h-8 mb-5" style={{ border: "1px solid hsl(var(--accent))", opacity: 0.15, transform: "rotate(45deg)" }} />
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] mb-2" style={{ color: "hsl(var(--foreground))", opacity: 0.2 }}>
                Site Layout
              </p>
              <p className="text-[9px] font-sans max-w-xs leading-[1.8]" style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}>
                Layout diagram or aerial view inserted here
              </p>
            </div>
          </div>

          <div className="max-w-lg space-y-4">
            <p className="text-[13px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.35 }}>
              System configuration will be tailored to your site dimensions and usage patterns.
            </p>
            <p className="text-[12px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.25 }}>
              Layout will be finalised prior to installation.
            </p>
            {data.layoutNotes && (
              <p className="text-[12px] font-sans leading-[2] pt-4" style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}>
                {data.layoutNotes}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <p className="text-[8px] font-sans uppercase tracking-[0.2em]" style={{ color: "hsl(var(--accent))", opacity: 0.2 }}>Fig. 01</p>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            5. SCOPE OF WORK
        ══════════════════════════════════════ */}
        <section className="py-28 sm:py-36 proposal-section print-avoid-break">
          <SectionLabel number="04">Scope of Work</SectionLabel>

          <p className="text-[13px] font-sans leading-[2] mb-12 max-w-lg" style={{ color: "hsl(var(--foreground))", opacity: 0.32 }}>
            The proposed system includes:
          </p>

          <div className="max-w-xl">
            {data.scopeItems.map((item, i) => (
              <div
                key={item.phase}
                className="pb-8 mb-8 last:pb-0 last:mb-0"
                style={{ borderBottom: i < data.scopeItems.length - 1 ? "1px solid hsl(var(--border))" : "none" }}
              >
                <div className="flex items-baseline gap-5 mb-2">
                  <span className="text-[9px] font-sans tabular-nums shrink-0" style={{ color: "hsl(var(--accent))", opacity: 0.3 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-sans font-medium" style={{ color: "hsl(var(--foreground))", opacity: 0.6 }}>
                    {item.phase}
                  </h3>
                </div>
                <p className="text-[12px] font-sans leading-[1.95] ml-[calc(0.5rem+20px)]" style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[12px] font-sans leading-[2] mt-12 max-w-lg" style={{ color: "hsl(var(--foreground))", opacity: 0.25 }}>
            Each stage is executed to ensure the system performs as designed over time.
          </p>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            6. INVESTMENT
        ══════════════════════════════════════ */}
        <section className="py-28 sm:py-36 proposal-section print-page-break">
          <SectionLabel number="05">Investment</SectionLabel>

          <div className="max-w-2xl mx-auto text-center py-16 sm:py-24">
            <p className="text-[13px] font-sans leading-[2] mb-16 max-w-md mx-auto" style={{ color: "hsl(var(--foreground))", opacity: 0.32 }}>
              This proposal reflects a complete GroundLock system approach tailored to your site.
            </p>

            <p className="text-[8px] font-sans uppercase tracking-[0.35em] mb-10" style={{ color: "hsl(var(--accent))", opacity: 0.35 }}>
              Total Investment
            </p>

            <p
              className="font-serif text-[3rem] sm:text-[4rem] lg:text-[5rem] font-semibold"
              style={{ color: "hsl(var(--foreground))", letterSpacing: "0.015em", lineHeight: 1, opacity: 0.9 }}
            >
              {data.investmentTotal}
            </p>

            <div className="w-12 h-px mx-auto mt-12 mb-12" style={{ background: "hsl(var(--accent))", opacity: 0.18 }} />

            <p className="text-[12px] font-sans leading-[2] max-w-md mx-auto" style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}>
              {data.investmentNote}
            </p>
          </div>

          <p className="text-[9px] font-sans mt-8 leading-[1.8] text-center" style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}>
            Final pricing confirmed following site assessment. All figures include GST where applicable.
          </p>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            7. NEXT STEPS
        ══════════════════════════════════════ */}
        <section className="py-28 sm:py-36 proposal-section print-page-break">
          <SectionLabel number="06">Next Steps</SectionLabel>

          <div className="max-w-xl space-y-6">
            <p className="text-[14px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.38 }}>
              If you'd like to proceed, we'll finalise the layout and confirm scheduling.
            </p>
            <p className="text-[14px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.38 }}>
              From there, we move into preparation and installation.
            </p>
            <p className="text-[13px] font-sans leading-[2]" style={{ color: "hsl(var(--foreground))", opacity: 0.3 }}>
              If you'd like to refine the approach or walk through the system, we're happy to do so.
            </p>
          </div>

          {/* Contact block */}
          <div
            className="mt-16 p-8 sm:p-10 max-w-sm"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <p className="text-[7px] font-sans uppercase tracking-[0.28em] mb-6" style={{ color: "hsl(var(--accent))", opacity: 0.3 }}>
              Contact
            </p>
            <div className="space-y-3">
              {[
                { label: "Email", value: "info@peninsulaequine.org" },
                { label: "Phone", value: "By arrangement" },
                { label: "Web", value: "peninsulaequine.com.au" },
              ].map((c) => (
                <div key={c.label} className="flex items-baseline justify-between">
                  <p className="text-[8px] font-sans uppercase tracking-[0.2em]" style={{ color: "hsl(var(--foreground))", opacity: 0.15 }}>{c.label}</p>
                  <p className="text-[12px] font-sans" style={{ color: "hsl(var(--foreground))", opacity: 0.45 }}>{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            8. CLOSING
        ══════════════════════════════════════ */}
        <section
          className="relative py-32 sm:py-40 -mx-8 sm:-mx-12 lg:-mx-16 px-8 sm:px-12 lg:px-16 proposal-closing print-page-break"
          style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)", borderTop: "1px solid hsl(var(--border))" }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="font-serif text-[1.5rem] sm:text-[1.85rem] lg:text-[2.15rem] font-semibold italic leading-[1.3]"
              style={{ color: "hsl(var(--foreground))", opacity: 0.7 }}
            >
              Built to interlock.<br />Not just sit in place.
            </p>

            <div className="w-10 h-px mx-auto mt-14 mb-14" style={{ background: "hsl(var(--accent))", opacity: 0.2 }} />

            <p className="text-[8px] font-sans uppercase tracking-[0.35em]" style={{ color: "hsl(var(--accent))", opacity: 0.22 }}>
              Peninsula Equine · Mornington Peninsula, VIC
            </p>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
