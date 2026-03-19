import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/RevealOnScroll";

const CRITERIA = [
  { label: "Drainage", standard: "Surface runoff — pooling, mud", engineered: "Engineered sub-base channels water laterally" },
  { label: "Stability", standard: "Degrades under traffic and weather", engineered: "Interlocking panels distribute load permanently" },
  { label: "Longevity", standard: "2–5 years before rework", engineered: "Designed for decades of consistent performance" },
  { label: "Consistency", standard: "Uneven, seasonal variation", engineered: "Uniform surface — wet or dry" },
  { label: "Maintenance", standard: "Ongoing regrading, material top-up", engineered: "Designed to reduce maintenance over time" },
  { label: "Horse Welfare", standard: "Inconsistent footing, joint stress", engineered: "Engineered for skeletal health and soundness" },
];

export function GroundLockComparison() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-20">
        <RevealOnScroll direction="up">
          <p className="text-overline mb-6">Why It Matters</p>
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={80}>
          <h2 className="heading-section text-foreground">
            Standard Build<br />
            <span className="text-muted-foreground/30">vs</span> Engineered System
          </h2>
        </RevealOnScroll>
      </div>

      {/* Header */}
      <RevealOnScroll direction="up" delay={120}>
        <div className="grid grid-cols-12 gap-4 mb-6 px-2">
          <div className="col-span-4" />
          <div className="col-span-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
              Standard Build
            </p>
          </div>
          <div className="col-span-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/60">
              GroundLock™ System
            </p>
          </div>
        </div>
      </RevealOnScroll>

      {/* Rows */}
      <div className="space-y-0">
        {CRITERIA.map((row, i) => (
          <RevealOnScroll key={row.label} direction="up" stagger={i} staggerInterval={60}>
            <div className="grid grid-cols-12 gap-4 py-5 border-b border-border/15 items-start px-2">
              <div className="col-span-4 sm:col-span-3">
                <p className="text-[13px] font-medium text-foreground/70">{row.label}</p>
              </div>
              <div className="col-span-4 sm:col-span-4 sm:col-start-5">
                <p className="text-[12px] text-muted-foreground/35 leading-[1.7]">{row.standard}</p>
              </div>
              <div className="col-span-4 sm:col-span-4">
                <p className="text-[12px] text-foreground/55 leading-[1.7]">{row.engineered}</p>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
