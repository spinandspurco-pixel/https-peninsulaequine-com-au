import { useRef, useCallback } from "react";
import { ArrowRight, MessageSquare, Download } from "lucide-react";
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
      className="pointer-events-none fixed inset-0 z-[1] grain-overlay"
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
            1. COVER / HERO — Cinematic
        ════════════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col relative">

          {/* Architectural background texture — radial vignette + grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 70% 55% at 50% 45%, transparent 0%, hsl(var(--background)) 100%),
                radial-gradient(ellipse 90% 80% at 50% 50%, hsla(var(--accent) / 0.02) 0%, transparent 70%)
              `,
            }}
          />

          {/* Faint engineering grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(hsla(var(--accent) / 0.03) 1px, transparent 1px),
                linear-gradient(90deg, hsla(var(--accent) / 0.03) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
              maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 80%)",
            }}
          />

          {/* Top strip — branding + reference */}
          <div className="relative z-10 flex items-center justify-between pt-14 pb-6">
            <p
              className="text-[9px] font-sans uppercase tracking-[0.3em] font-medium"
              style={{ color: "hsl(var(--accent))", opacity: 0.35 }}
            >
              Peninsula Equine
            </p>
            <p
              className="text-[8px] font-sans tabular-nums tracking-wider"
              style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}
            >
              {data.quoteNumber}
            </p>
          </div>

          {/* ─── Central composition ─── */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-20 sm:py-28">

            {/* PE Monogram — static, resolved state */}
            <div className="mb-14 sm:mb-18">
              <svg
                viewBox="0 0 120 120"
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto"
              >
                {/* Outer circle */}
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.6"
                  style={{ opacity: 0.15 }}
                />
                {/* Inner circle */}
                <circle
                  cx="60" cy="60" r="46"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.4"
                  style={{ opacity: 0.08 }}
                />
                {/* P letterform */}
                <path
                  d="M38 85 V35 H55 C62 35 68 38 68 46 C68 54 62 57 55 57 H38"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.7 }}
                />
                {/* E letterform */}
                <path
                  d="M74 85 H56 V35 H74 M56 60 H70"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.7 }}
                />
              </svg>
            </div>

            {/* Title — large, dominant */}
            <h1
              className="font-serif text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem] font-semibold mb-8"
              style={{
                color: "hsl(var(--foreground))",
                lineHeight: 1.02,
                letterSpacing: "0.015em",
              }}
            >
              GroundLock System<br />Proposal
            </h1>

            {/* Accent rule */}
            <div
              className="w-10 h-px mx-auto mb-8"
              style={{ background: "hsl(var(--accent))", opacity: 0.25 }}
            />

            {/* Subline — refined, understated */}
            <p
              className="text-[12px] sm:text-[13px] font-sans tracking-wide max-w-sm leading-[1.9]"
              style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}
            >
              Designed for performance, stability, and long-term integrity.
            </p>
          </div>

          {/* ─── Bottom metadata strip ─── */}
          <div className="relative z-10 pb-14">
            {/* Thin rule */}
            <div
              className="h-px mb-8"
              style={{ background: "hsl(var(--border))", opacity: 0.25 }}
            />

            <div className="flex items-end justify-between">
              {/* Left — client + property */}
              <div className="space-y-4">
                {data.clientName && (
                  <div>
                    <p
                      className="text-[7px] font-sans uppercase tracking-[0.28em] mb-1"
                      style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
                    >
                      Prepared For
                    </p>
                    <p
                      className="text-[12px] font-sans"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}
                    >
                      {data.clientName}
                    </p>
                  </div>
                )}
                {data.propertyName && (
                  <div>
                    <p
                      className="text-[7px] font-sans uppercase tracking-[0.28em] mb-1"
                      style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
                    >
                      Property
                    </p>
                    <p
                      className="text-[12px] font-sans"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}
                    >
                      {data.propertyName}
                    </p>
                  </div>
                )}
              </div>

              {/* Right — date */}
              <div className="text-right">
                {data.date && (
                  <div>
                    <p
                      className="text-[7px] font-sans uppercase tracking-[0.28em] mb-1"
                      style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
                    >
                      Date
                    </p>
                    <p
                      className="text-[12px] font-sans"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}
                    >
                      {data.date}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            EDITORIAL DIVIDER — architectural rhythm
        ═══════════════════════════════════════════════════════ */}

        {/* ════════════════════════════════════════════
            2. PROJECT OVERVIEW
        ════════════════════════════════════════════ */}
        <section className="pt-32 sm:pt-40 pb-28 sm:pb-36">
          {/* Accent rule entry */}
          <div className="flex items-center gap-5 mb-16 sm:mb-20">
            <div className="h-px w-8" style={{ background: "hsl(var(--accent))", opacity: 0.25 }} />
            <SectionLabel number="01">Project Overview</SectionLabel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Heading column */}
            <div className="md:col-span-4">
              <h2
                className="font-serif text-xl sm:text-2xl font-semibold sticky top-24"
                style={{
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  opacity: 0.75,
                }}
              >
                A system approach,<br />not a surface layer.
              </h2>
            </div>

            {/* Body column */}
            <div className="md:col-span-7 md:col-start-6">
              {data.overview.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="text-[14px] font-sans leading-[2.05] mb-8 last:mb-0"
                  style={{ color: "hsl(var(--foreground))", opacity: 0.38 }}
                >
                  {para}
                </p>
              ))}

              {/* Summary markers */}
              <div className="mt-12 pt-8" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Approach", value: "Engineered" },
                    { label: "Foundation", value: "Interlocking" },
                    { label: "Performance", value: "Long-term" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p
                        className="text-[7px] font-sans uppercase tracking-[0.28em] mb-2"
                        style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-[13px] font-sans font-medium"
                        style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            3. THE GROUNDLOCK SYSTEM
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <div className="flex items-center gap-5 mb-16 sm:mb-20">
            <div className="h-px w-8" style={{ background: "hsl(var(--accent))", opacity: 0.25 }} />
            <SectionLabel number="02">The GroundLock System</SectionLabel>
          </div>

          {/* Full-width visual hero for system */}
          <div
            className="w-full py-16 sm:py-20 mb-16 sm:mb-20 flex flex-col items-center text-center"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <svg viewBox="0 0 100 110" className="w-32 sm:w-40 h-auto mb-10" style={{ opacity: 0.55 }}>
              <PanelDefs id="prop" />
              <GroundLockPanelSVG active showTabs defsId="prop" direction="up" />
            </svg>
            <p
              className="text-[8px] font-sans uppercase tracking-[0.25em] mb-3"
              style={{ color: "hsl(var(--accent))", opacity: 0.35 }}
            >
              GroundLock™ Panel Unit
            </p>
            <p
              className="text-[10px] font-sans max-w-xs leading-[1.8]"
              style={{ color: "hsl(var(--foreground))", opacity: 0.2 }}
            >
              Alternating geometry. Interlocking field behaviour.
            </p>
          </div>

          {/* Two-column editorial */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <div className="md:col-span-5">
              <h2
                className="font-serif text-2xl sm:text-3xl font-semibold mb-6"
                style={{
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.1,
                  letterSpacing: "0.01em",
                  opacity: 0.75,
                }}
              >
                Engineered to perform<br />under load, over time.
              </h2>
              <p
                className="text-[12px] font-sans leading-[1.95]"
                style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}
              >
                Most ground systems rely on flat, repeated structures that sit in place. GroundLock is designed differently.
              </p>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              <div className="space-y-5 mb-10">
                {[
                  "Each panel interlocks in an alternating geometry, allowing the system to behave as a unified field rather than individual components.",
                  "This creates more consistent load distribution, reduced long-term movement, and a more stable, predictable surface.",
                  "The result is a system that performs with intention — not just appearance.",
                ].map((text, i) => (
                  <p
                    key={i}
                    className="text-[13px] font-sans leading-[2]"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.35 }}
                  >
                    {text}
                  </p>
                ))}
              </div>

              {/* Performance attributes */}
              <div
                className="pt-8 space-y-4"
                style={{ borderTop: "1px solid hsl(var(--border))" }}
              >
                {[
                  { attr: "Load Distribution", note: "Consistent across surface" },
                  { attr: "Long-term Movement", note: "Significantly reduced" },
                  { attr: "Surface Behaviour", note: "Stable and predictable" },
                  { attr: "Field Unity", note: "Unified, not individual" },
                ].map((item) => (
                  <div key={item.attr} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ background: "hsl(var(--accent))", opacity: 0.35 }}
                      />
                      <p
                        className="text-[11px] font-sans"
                        style={{ color: "hsl(var(--foreground))", opacity: 0.45 }}
                      >
                        {item.attr}
                      </p>
                    </div>
                    <p
                      className="text-[10px] font-sans"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.2 }}
                    >
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            4. PROPOSED LAYOUT
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <div className="flex items-center gap-5 mb-16 sm:mb-20">
            <div className="h-px w-8" style={{ background: "hsl(var(--accent))", opacity: 0.25 }} />
            <SectionLabel number="03">Proposed Layout</SectionLabel>
          </div>

          {/* Layout visual zone */}
          <div
            className="w-full aspect-[16/10] relative overflow-hidden mb-8"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {/* Faint grid inside */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(hsla(var(--accent) / 0.04) 1px, transparent 1px),
                  linear-gradient(90deg, hsla(var(--accent) / 0.04) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div
                className="w-8 h-8 mb-5"
                style={{
                  border: "1px solid hsl(var(--accent))",
                  opacity: 0.15,
                  transform: "rotate(45deg)",
                }}
              />
              <p
                className="text-[10px] font-sans uppercase tracking-[0.2em] mb-2"
                style={{ color: "hsl(var(--foreground))", opacity: 0.2 }}
              >
                Site Layout
              </p>
              <p
                className="text-[9px] font-sans max-w-xs leading-[1.8]"
                style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}
              >
                Layout diagram, aerial view, or site photography inserted here
              </p>
            </div>
          </div>

          {/* Caption strip */}
          <div className="flex items-start justify-between gap-8">
            <p
              className="text-[10px] font-sans leading-[1.85] max-w-md"
              style={{ color: "hsl(var(--foreground))", opacity: 0.22 }}
            >
              The proposed layout is based on the initial site assessment and may be refined during the preparation phase.
            </p>
            <p
              className="text-[8px] font-sans uppercase tracking-[0.2em] shrink-0 pt-0.5"
              style={{ color: "hsl(var(--accent))", opacity: 0.2 }}
            >
              Fig. 01
            </p>
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            5. SCOPE OF WORK
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <div className="flex items-center gap-5 mb-16 sm:mb-20">
            <div className="h-px w-8" style={{ background: "hsl(var(--accent))", opacity: 0.25 }} />
            <SectionLabel number="04">Scope of Work</SectionLabel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left intro */}
            <div className="md:col-span-4">
              <p
                className="text-[13px] font-sans leading-[2] sticky top-24"
                style={{ color: "hsl(var(--foreground))", opacity: 0.32 }}
              >
                The proposed system includes four phases, each executed to ensure long-term performance.
              </p>
            </div>

            {/* Right — structured phases */}
            <div className="md:col-span-7 md:col-start-6">
              {data.scopeItems.map((item, i) => (
                <div
                  key={item.phase}
                  className="pb-10 mb-10 last:pb-0 last:mb-0"
                  style={{
                    borderBottom: i < data.scopeItems.length - 1
                      ? "1px solid hsl(var(--border))"
                      : "none",
                  }}
                >
                  <div className="flex items-baseline gap-5 mb-3">
                    <span
                      className="text-[9px] font-sans tabular-nums shrink-0"
                      style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className="text-[15px] font-sans font-medium"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.6 }}
                    >
                      {item.phase}
                    </h3>
                  </div>
                  <p
                    className="text-[12px] font-sans leading-[1.95] ml-[calc(0.5rem+20px)]"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            6. INVESTMENT
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <div className="flex items-center gap-5 mb-20 sm:mb-28">
            <div className="h-px w-8" style={{ background: "hsl(var(--accent))", opacity: 0.25 }} />
            <SectionLabel number="05">Investment</SectionLabel>
          </div>

          {/* Centred price presentation */}
          <div className="max-w-2xl mx-auto text-center py-20 sm:py-28">
            <p
              className="text-[8px] font-sans uppercase tracking-[0.35em] mb-12"
              style={{ color: "hsl(var(--accent))", opacity: 0.35 }}
            >
              Total Investment
            </p>

            <p
              className="font-serif text-[3rem] sm:text-[4rem] lg:text-[5rem] font-semibold"
              style={{
                color: "hsl(var(--foreground))",
                letterSpacing: "0.015em",
                lineHeight: 1,
                opacity: 0.9,
              }}
            >
              {data.investmentTotal}
            </p>

            <div
              className="w-12 h-px mx-auto mt-12 mb-12"
              style={{ background: "hsl(var(--accent))", opacity: 0.18 }}
            />

            <p
              className="text-[12px] font-sans leading-[2] max-w-md mx-auto"
              style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}
            >
              Detailed breakdowns can be provided if required, however the system is designed and delivered as a complete solution rather than individual components.
            </p>
          </div>

          {/* Supporting context — quiet, minimal */}
          <div className="max-w-2xl mx-auto">
            <div
              className="pt-10"
              style={{ borderTop: "1px solid hsl(var(--border))" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10">
                {["Site preparation & base formation", "GroundLock panel installation", "System alignment & integration", "Surface preparation & completion"].map((inc) => (
                  <div key={inc} className="flex items-start gap-3">
                    <span
                      className="w-1 h-1 rounded-full mt-[7px] shrink-0"
                      style={{ background: "hsl(var(--accent))", opacity: 0.25 }}
                    />
                    <p
                      className="text-[11px] font-sans leading-[1.8]"
                      style={{ color: "hsl(var(--foreground))", opacity: 0.28 }}
                    >
                      {inc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p
              className="text-[9px] font-sans mt-12 leading-[1.8]"
              style={{ color: "hsl(var(--foreground))", opacity: 0.12 }}
            >
              Final pricing confirmed following site assessment. All figures include GST where applicable.
            </p>
          </div>
        </section>

        <Divider />

        {/* ════════════════════════════════════════════
            7. NEXT STEPS
        ════════════════════════════════════════════ */}
        <section className="py-28 sm:py-36">
          <div className="flex items-center gap-5 mb-16 sm:mb-20">
            <div className="h-px w-8" style={{ background: "hsl(var(--accent))", opacity: 0.25 }} />
            <SectionLabel number="06">Next Steps</SectionLabel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left — message */}
            <div className="md:col-span-5">
              <div className="space-y-6">
                {[
                  "If you'd like to proceed, we'll finalise the layout and confirm scheduling.",
                  "From there, we move into preparation and installation.",
                  "If you have any questions or would like to refine the approach, we're happy to walk through it with you.",
                ].map((para, i) => (
                  <p
                    key={i}
                    className="text-[13px] font-sans leading-[2]"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.35 }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Right — process + contact */}
            <div className="md:col-span-6 md:col-start-7">
              {/* Process steps */}
              <div className="mb-14">
                <p
                  className="text-[7px] font-sans uppercase tracking-[0.28em] mb-8"
                  style={{ color: "hsl(var(--accent))", opacity: 0.25 }}
                >
                  The Process
                </p>
                {[
                  { step: "Confirm", desc: "Approve the proposal and lock in your build window." },
                  { step: "Prepare", desc: "Site assessment, base profiling, and material coordination." },
                  { step: "Install", desc: "GroundLock system laid, aligned, and finished on-site." },
                  { step: "Handover", desc: "Final inspection, surface completion, and care guidance." },
                ].map((item, i, arr) => (
                  <div key={item.step} className="flex items-start gap-5 mb-6 last:mb-0">
                    <div className="flex flex-col items-center shrink-0 w-3 pt-1">
                      <div
                        className="w-[5px] h-[5px] rounded-full"
                        style={{ background: "hsl(var(--accent))", opacity: 0.35 }}
                      />
                      {i < arr.length - 1 && (
                        <div
                          className="w-px mt-1.5"
                          style={{ background: "hsl(var(--accent))", opacity: 0.08, height: 36 }}
                        />
                      )}
                    </div>
                    <div>
                      <p
                        className="text-[12px] font-sans font-medium mb-0.5"
                        style={{ color: "hsl(var(--foreground))", opacity: 0.5 }}
                      >
                        {item.step}
                      </p>
                      <p
                        className="text-[10px] font-sans leading-[1.8]"
                        style={{ color: "hsl(var(--foreground))", opacity: 0.22 }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact block */}
              <div
                className="p-8 sm:p-10"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <p
                  className="text-[7px] font-sans uppercase tracking-[0.28em] mb-6"
                  style={{ color: "hsl(var(--accent))", opacity: 0.3 }}
                >
                  Contact
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { label: "Email", value: "info@peninsulaequine.org" },
                    { label: "Phone", value: "By arrangement" },
                    { label: "Web", value: "peninsulaequine.com.au" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-baseline justify-between">
                      <p
                        className="text-[8px] font-sans uppercase tracking-[0.2em]"
                        style={{ color: "hsl(var(--foreground))", opacity: 0.15 }}
                      >
                        {c.label}
                      </p>
                      <p
                        className="text-[12px] font-sans"
                        style={{ color: "hsl(var(--foreground))", opacity: 0.45 }}
                      >
                        {c.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="mailto:info@peninsulaequine.org?subject=GroundLock Proposal — Proceed"
                    className="flex items-center justify-center gap-2 px-5 py-3 text-[9px] font-sans uppercase tracking-[0.16em] font-medium transition-opacity duration-300 hover:opacity-85"
                    style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
                  >
                    Proceed
                    <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href="mailto:info@peninsulaequine.org?subject=GroundLock Proposal — Question"
                    className="flex items-center justify-center gap-2 px-5 py-3 text-[9px] font-sans uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-65"
                    style={{
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      opacity: 0.4,
                    }}
                  >
                    <MessageSquare className="w-3 h-3" />
                    Question
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            CLOSING
        ════════════════════════════════════════════ */}
        <section
          className="relative py-32 sm:py-40 -mx-6 sm:-mx-10 lg:-mx-16 px-6 sm:px-10 lg:px-16 mt-10"
          style={{
            background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)",
            borderTop: "1px solid hsl(var(--border))",
          }}
        >
          <div className="max-w-2xl mx-auto text-center">
            {/* Signature line */}
            <p
              className="font-serif text-[1.5rem] sm:text-[1.85rem] lg:text-[2.15rem] font-semibold italic leading-[1.3]"
              style={{ color: "hsl(var(--foreground))", opacity: 0.7 }}
            >
              Built to interlock.<br />
              Not just sit in place.
            </p>

            <div
              className="w-10 h-px mx-auto mt-12 mb-12"
              style={{ background: "hsl(var(--accent))", opacity: 0.2 }}
            />

            {/* Contact details */}
            <div className="space-y-2 mb-14">
              {[
                { label: "Email", value: "info@peninsulaequine.org" },
                { label: "Phone", value: "By arrangement" },
                { label: "Web", value: "peninsulaequine.com.au" },
              ].map((c) => (
                <div key={c.label} className="flex items-baseline justify-center gap-4">
                  <p
                    className="text-[8px] font-sans uppercase tracking-[0.2em] w-12 text-right"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.15 }}
                  >
                    {c.label}
                  </p>
                  <p
                    className="text-[12px] font-sans"
                    style={{ color: "hsl(var(--foreground))", opacity: 0.4 }}
                  >
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Branding */}
            <p
              className="text-[8px] font-sans uppercase tracking-[0.35em]"
              style={{ color: "hsl(var(--accent))", opacity: 0.22 }}
            >
              Peninsula Equine · Mornington Peninsula, VIC
            </p>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
