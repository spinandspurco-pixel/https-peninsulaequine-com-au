import { useRef } from "react";
import { ArrowRight, MessageSquare, Phone } from "lucide-react";
import { GroundLockPanelSVG, PanelDefs } from "@/components/groundlock/GroundLockPanelSVG";

/* ─── Placeholder data shape ─── */
interface ProposalData {
  clientName: string;
  propertyName: string;
  location: string;
  date: string;
  quoteNumber: string;
  overview: string;
  scopeItems: { phase: string; description: string }[];
  investmentTotal: string;
  investmentNote: string;
}

const SAMPLE: ProposalData = {
  clientName: "Client Name",
  propertyName: "Property Name",
  location: "Mornington Peninsula, VIC",
  date: "March 2026",
  quoteNumber: "PE-2026-001",
  overview:
    "This proposal outlines a GroundLock system approach for your property based on the intended use, site conditions, and long-term performance requirements.\n\nRather than applying a surface layer, the system is designed to create a stable, interlocking foundation that performs consistently under load.",
  scopeItems: [
    { phase: "Site Preparation", description: "Survey, profiling, and base formation to establish correct drainage grades and compaction levels." },
    { phase: "Panel Installation", description: "GroundLock panels laid in alternating geometry with precision alignment across all traffic zones." },
    { phase: "System Integration", description: "Edge restraint, connection detailing, and transition zones between stabilised and natural surfaces." },
    { phase: "Surface Completion", description: "Final surface preparation, levelling, and finishing for intended use." },
  ],
  investmentTotal: "[INSERT PRICE]",
  investmentNote:
    "The system is designed and delivered as a complete solution rather than individual components. Detailed breakdowns can be provided if required.",
};

/* ─── Grain texture overlay ─── */
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.028,
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* ─── Section divider ─── */
function Divider() {
  return (
    <div className="w-full flex items-center py-2">
      <div className="h-px flex-1" style={{ background: "hsl(var(--border))", opacity: 0.35 }} />
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children, number }: { children: string; number: string }) {
  return (
    <div className="flex items-center gap-4 mb-10 sm:mb-14">
      <span
        className="text-[10px] font-sans tabular-nums"
        style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
      >
        {number}
      </span>
      <span
        className="text-[9px] font-sans uppercase tracking-[0.25em] font-medium"
        style={{ color: "hsl(var(--accent))", opacity: 0.45 }}
      >
        {children}
      </span>
    </div>
  );
}

export default function ProposalTemplate() {
  const data = SAMPLE;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative"
      style={{ background: "hsl(var(--background))" }}
    >
      <GrainOverlay />

      {/* Content container */}
      <div className="relative z-[2] max-w-3xl mx-auto px-8 sm:px-12 lg:px-16">

        {/* ════════════════════════════════════════════
            1. COVER / HERO
        ════════════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col justify-between pt-16 pb-12">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <p
              className="text-[10px] font-sans uppercase tracking-[0.25em] font-medium"
              style={{ color: "hsl(var(--accent))", opacity: 0.5 }}
            >
              Peninsula Equine
            </p>
            <p
              className="text-[9px] font-sans tabular-nums"
              style={{ color: "hsl(var(--foreground))", opacity: 0.2 }}
            >
              {data.quoteNumber}
            </p>
          </div>

          {/* Central hero block */}
          <div className="flex-1 flex flex-col justify-center py-24 sm:py-32">
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6"
              style={{
                color: "hsl(var(--foreground))",
                lineHeight: 1.05,
                letterSpacing: "0.01em",
              }}
            >
              GroundLock System<br />Proposal
            </h1>
            <p
              className="text-[13px] sm:text-[14px] font-sans max-w-md leading-[1.9]"
              style={{ color: "hsl(var(--foreground))", opacity: 0.32 }}
            >
              Designed for performance, stability, and long-term integrity.
            </p>
          </div>

          {/* Bottom details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { label: "Prepared For", value: data.clientName },
              { label: "Property", value: data.propertyName },
              { label: "Date", value: data.date },
            ].map((item) => (
              <div key={item.label}>
                <p
                  className="text-[8px] font-sans uppercase tracking-[0.22em] mb-1.5"
                  style={{ color: "hsl(var(--accent))", opacity: 0.35 }}
                >
                  {item.label}
                </p>
                <p
                  className="text-[12px] font-sans"
                  style={{ color: "hsl(var(--foreground))", opacity: 0.55 }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            2. PROJECT OVERVIEW
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <SectionLabel number="01">Project Overview</SectionLabel>
          <div className="max-w-xl">
            {data.overview.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-[14px] font-sans leading-[2] mb-8 last:mb-0 whitespace-pre-line"
                style={{ color: "hsl(var(--foreground))", opacity: 0.4 }}
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            3. THE GROUNDLOCK SYSTEM
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <SectionLabel number="02">The GroundLock System</SectionLabel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Text */}
            <div>
              <h2
                className="font-serif text-2xl sm:text-3xl font-semibold mb-6"
                style={{
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.1,
                  letterSpacing: "0.01em",
                }}
              >
                Engineered to perform<br />under load, over time.
              </h2>

              <div className="space-y-5">
                {[
                  "Each panel interlocks in an alternating geometry, allowing the system to behave as a unified field rather than individual components.",
                  "This creates more consistent load distribution, reduced long-term movement, and a more stable, predictable surface.",
                  "The result is a system that performs with intention — not just appearance.",
                ].map((text, i) => (
                  <p
                    key={i}
                    className="text-[13px] font-sans leading-[1.95]"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.35 }}
                  >
                    {text}
                  </p>
                ))}
              </div>

              {/* Performance points */}
              <div className="mt-10 space-y-3">
                {["Consistent load distribution", "Reduced long-term movement", "Stable, predictable surface", "Unified field behaviour"].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ background: "hsl(var(--accent))", opacity: 0.4 }}
                    />
                    <p
                      className="text-[11px] font-sans"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.4 }}
                    >
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="flex items-center justify-center">
              <div
                className="w-full max-w-xs p-10 flex flex-col items-center"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <svg viewBox="0 0 100 110" className="w-40 h-auto mb-8" style={{ opacity: 0.6 }}>
                  <PanelDefs id="prop" />
                  <GroundLockPanelSVG active showTabs defsId="prop" direction="up" />
                </svg>
                <p
                  className="text-[9px] font-sans uppercase tracking-[0.2em] text-center"
                  style={{ color: "hsl(var(--accent))", opacity: 0.35 }}
                >
                  GroundLock™ Panel Unit
                </p>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            4. PROPOSED LAYOUT
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <SectionLabel number="03">Proposed Layout</SectionLabel>

          <div
            className="w-full aspect-[16/9] flex items-center justify-center"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <div className="text-center">
              <p
                className="text-[11px] font-sans uppercase tracking-[0.16em] mb-2"
                style={{ color: "hsl(var(--foreground))", opacity: 0.2 }}
              >
                Site Layout
              </p>
              <p
                className="text-[10px] font-sans"
                style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}
              >
                Layout diagram or site photo inserted here
              </p>
            </div>
          </div>

          <p
            className="text-[11px] font-sans mt-6 leading-[1.9]"
            style={{ color: "hsl(var(--foreground))", opacity: 0.25 }}
          >
            The proposed layout is based on the initial site assessment and may be refined during the preparation phase.
          </p>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            5. SCOPE OF WORK
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <SectionLabel number="04">Scope of Work</SectionLabel>

          <p
            className="text-[13px] font-sans leading-[2] max-w-xl mb-14"
            style={{ color: "hsl(var(--foreground))", opacity: 0.35 }}
          >
            Each stage is executed to ensure the system performs as designed over time.
          </p>

          <div className="space-y-0">
            {data.scopeItems.map((item, i) => (
              <div
                key={item.phase}
                className="py-8 sm:py-10"
                style={{
                  borderBottom: i < data.scopeItems.length - 1
                    ? "1px solid hsl(var(--border))"
                    : "none",
                  borderBottomWidth: i < data.scopeItems.length - 1 ? "1px" : "0",
                  opacity: 1,
                }}
              >
                <div className="flex items-start gap-6">
                  <span
                    className="text-[10px] font-sans tabular-nums pt-0.5 shrink-0"
                    style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3
                      className="text-[14px] font-sans font-medium mb-2"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.65 }}
                    >
                      {item.phase}
                    </h3>
                    <p
                      className="text-[12px] font-sans leading-[1.9] max-w-lg"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.3 }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            6. INVESTMENT
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <SectionLabel number="05">Investment</SectionLabel>

          <p
            className="text-[13px] font-sans leading-[2] max-w-xl mb-14"
            style={{ color: "hsl(var(--foreground))", opacity: 0.35 }}
          >
            This proposal reflects a complete GroundLock system approach tailored to your site.
          </p>

          {/* Investment block */}
          <div
            className="p-10 sm:p-14 text-center"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <p
              className="text-[9px] font-sans uppercase tracking-[0.22em] mb-6"
              style={{ color: "hsl(var(--accent))", opacity: 0.4 }}
            >
              Total Investment
            </p>
            <p
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6"
              style={{
                color: "hsl(var(--foreground))",
                letterSpacing: "0.01em",
                lineHeight: 1.1,
              }}
            >
              {data.investmentTotal}
            </p>
            <div
              className="w-12 h-px mx-auto mb-6"
              style={{ background: "hsl(var(--accent))", opacity: 0.2 }}
            />
            <p
              className="text-[11px] font-sans leading-[1.85] max-w-sm mx-auto"
              style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}
            >
              {data.investmentNote}
            </p>
          </div>

          {/* Includes */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            {["Site preparation & base formation", "GroundLock panel installation", "System alignment & integration", "Surface preparation & completion"].map((inc) => (
              <div key={inc} className="flex items-start gap-2.5">
                <span
                  className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                  style={{ background: "hsl(var(--accent))", opacity: 0.3 }}
                />
                <p
                  className="text-[10px] font-sans leading-[1.7]"
                  style={{ color: "hsl(var(--foreground))", opacity: 0.3 }}
                >
                  {inc}
                </p>
              </div>
            ))}
          </div>

          <p
            className="text-[9px] font-sans mt-10 leading-[1.8]"
            style={{ color: "hsl(var(--foreground))", opacity: 0.15 }}
          >
            Final pricing confirmed following site assessment. All figures include GST where applicable.
          </p>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            7. NEXT STEPS
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <SectionLabel number="06">Next Steps</SectionLabel>

          <div className="max-w-xl mb-16">
            {[
              "If you'd like to proceed, we'll finalise the layout and confirm scheduling.",
              "From there, we move into preparation and installation.",
              "If you have any questions or would like to refine the approach, we're happy to walk through it with you.",
            ].map((para, i) => (
              <p
                key={i}
                className="text-[13px] font-sans leading-[2] mb-6 last:mb-0"
                style={{ color: "hsl(var(--foreground))", opacity: 0.38 }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Process timeline */}
          <div className="space-y-0 mb-16">
            {[
              { step: "Confirm", desc: "Approve the proposal and lock in your build window." },
              { step: "Prepare", desc: "Site assessment, base profiling, and material coordination." },
              { step: "Install", desc: "GroundLock system laid, aligned, and finished on-site." },
              { step: "Handover", desc: "Final inspection, surface completion, and care guidance." },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-start gap-6 py-5">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center shrink-0 w-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1"
                    style={{ background: "hsl(var(--accent))", opacity: 0.35 }}
                  />
                  {i < arr.length - 1 && (
                    <div
                      className="w-px flex-1 mt-2"
                      style={{ background: "hsl(var(--accent))", opacity: 0.1, minHeight: 32 }}
                    />
                  )}
                </div>
                <div>
                  <p
                    className="text-[13px] font-sans font-medium mb-1"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.55 }}
                  >
                    {item.step}
                  </p>
                  <p
                    className="text-[11px] font-sans leading-[1.8]"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.25 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTAs */}
          <div
            className="p-10 sm:p-12"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <p
              className="text-[9px] font-sans uppercase tracking-[0.22em] mb-8"
              style={{ color: "hsl(var(--accent))", opacity: 0.4 }}
            >
              Contact
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { label: "Email", value: "info@peninsulaequine.org" },
                { label: "Phone", value: "By arrangement" },
                { label: "Web", value: "peninsulaequine.com.au" },
              ].map((c) => (
                <div key={c.label}>
                  <p
                    className="text-[8px] font-sans uppercase tracking-[0.2em] mb-1.5"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.18 }}
                  >
                    {c.label}
                  </p>
                  <p
                    className="text-[12px] font-sans"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}
                  >
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="mailto:info@peninsulaequine.org?subject=GroundLock Proposal — Proceed"
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-[10px] font-sans uppercase tracking-[0.16em] font-medium transition-opacity duration-300 hover:opacity-85"
                style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
              >
                Proceed with Project
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:info@peninsulaequine.org?subject=GroundLock Proposal — Question"
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-[10px] font-sans uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-65"
                style={{
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  opacity: 0.45,
                }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask a Question
              </a>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════ */}
        <footer className="py-12 border-t" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center justify-between">
            <p
              className="text-[9px] font-sans uppercase tracking-[0.2em]"
              style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
            >
              Peninsula Equine
            </p>
            <p
              className="text-[9px] font-sans"
              style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}
            >
              peninsulaequine.com.au
            </p>
          </div>
          <p
            className="text-center font-serif text-[14px] mt-10 italic"
            style={{ color: "hsl(var(--accent))", opacity: 0.2 }}
          >
            Built properly, from the ground up.
          </p>
        </footer>

        {/* Bottom breathing space */}
        <div className="h-16" />
      </div>
    </div>
  );
}
