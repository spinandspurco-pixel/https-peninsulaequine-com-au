import * as React from "react";
import type { HqIdentity } from "./hqIdentity";

/**
 * HQ visual primitives.
 *
 * Strictly architectural: bronze separators, blueprint backgrounds,
 * monospace overlines, pre-flight status lamps. Used across every HQ surface
 * to keep the Command Centre coherent.
 */

// ─────────────────────────────────────────────────────
// Blueprint field — drafting-grid backdrop at 2-3% opacity
// ─────────────────────────────────────────────────────

export function BlueprintField({
  intensity = "soft",
  className = "",
  children,
}: {
  intensity?: "soft" | "medium";
  className?: string;
  children?: React.ReactNode;
}) {
  const opacity = intensity === "medium" ? 0.06 : 0.035;
  const style: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(to right, hsl(var(--accent) / ${opacity}) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--accent) / ${opacity}) 1px, transparent 1px)
    `,
    backgroundSize: "80px 80px",
  };
  return (
    <div className={`relative ${className}`} style={style}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Bronze rule — a thin separator with optional left tick
// ─────────────────────────────────────────────────────

export function BronzeRule({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-1.5 h-1.5 border border-accent/50 rotate-45" />
      <div className="flex-1 h-px bg-gradient-to-r from-accent/30 via-accent/10 to-transparent" />
      {label && (
        <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/55">
          {label}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Status lamp — pre-flight indicator
// ─────────────────────────────────────────────────────

export type LampState = "nominal" | "armed" | "verify" | "fault" | "standby";

const LAMP_TOKENS: Record<LampState, { color: string; ring: string; label: string }> = {
  nominal: { color: "bg-accent", ring: "ring-accent/40", label: "Nominal" },
  armed: { color: "bg-accent/80", ring: "ring-accent/30", label: "Armed" },
  verify: { color: "bg-amber-500", ring: "ring-amber-500/30", label: "Verify" },
  fault: { color: "bg-destructive", ring: "ring-destructive/30", label: "Fault" },
  standby: { color: "bg-muted-foreground/40", ring: "ring-border/30", label: "Standby" },
};

export function StatusLamp({ state, glow = false }: { state: LampState; glow?: boolean }) {
  const t = LAMP_TOKENS[state];
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${t.color} ring-1 ${t.ring} ${
        glow && state === "nominal" ? "shadow-[0_0_8px_hsl(var(--accent)/0.5)]" : ""
      }`}
      aria-label={t.label}
    />
  );
}

export function lampLabel(state: LampState): string {
  return LAMP_TOKENS[state].label;
}

// ─────────────────────────────────────────────────────
// Section mark — HQ-grade section header
// ─────────────────────────────────────────────────────

export function SectionMark({
  index,
  title,
  meta,
}: {
  index: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/55">
          {index}
        </span>
        <div className="w-5 h-px bg-accent/30" />
        <h3 className="font-serif text-base font-light text-foreground/90 tracking-tight">
          {title}
        </h3>
        {meta && (
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
            {meta}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Role marker — bronze identity tag
// ─────────────────────────────────────────────────────

export function RoleMarker({
  identity,
  size = "sm",
}: {
  identity: HqIdentity;
  size?: "sm" | "lg";
}) {
  const small = size === "sm";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`block w-px ${small ? "h-3" : "h-4"} bg-accent/55`} />
      <span
        className={`font-mono uppercase tracking-[0.28em] text-accent/75 ${
          small ? "text-[9px]" : "text-[10px]"
        }`}
      >
        {identity.rank}
      </span>
    </span>
  );
}

// ─────────────────────────────────────────────────────
// Bronze role tag — short pill used inside the user badge
// ─────────────────────────────────────────────────────

export function BronzeRoleTag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center font-mono text-[9px] uppercase tracking-[0.28em] text-accent/80 border border-accent/30 px-2 py-[3px] rounded-[2px] bg-accent/[0.04]"
      style={{ lineHeight: 1 }}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────
// User badge — refined name · role · handle for the masthead
// ─────────────────────────────────────────────────────

export function UserBadge({
  identity,
  align = "right",
}: {
  identity: HqIdentity;
  align?: "left" | "right";
}) {
  const isPreview = identity.tag === "Client Preview";
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"} gap-2`}>
      <div className="flex items-center gap-3">
        <span className="font-serif text-sm font-light text-foreground/90 tracking-tight">
          {identity.name}
        </span>
        <span className="text-muted-foreground/25 text-[10px]" aria-hidden>·</span>
        <BronzeRoleTag label={identity.tag} />
      </div>
      {identity.handle && (
        <p className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground/45 lowercase">
          {identity.handle}
        </p>
      )}
      {isPreview && (
        <p className="text-[10px] text-muted-foreground/40 italic">
          View-only demonstration environment
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Identity header — name + role line for masthead
// ─────────────────────────────────────────────────────

export function IdentityHeader({
  identity,
  greetingOverline,
}: {
  identity: HqIdentity;
  greetingOverline?: string;
}) {
  return (
    <div>
      {greetingOverline && (
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/55 mb-3">
          {greetingOverline}
        </p>
      )}
      <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground tracking-tight leading-[1.05]">
        {identity.name}
      </h1>
      <div className="mt-3 flex items-center gap-3">
        <RoleMarker identity={identity} />
        <span className="text-muted-foreground/30 text-[10px]">·</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
          {identity.role}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Pre-flight panel frame — used by Email Ops + other ops cards
// ─────────────────────────────────────────────────────

export function PreflightFrame({
  title,
  subtitle,
  designation,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  designation: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="relative border border-border/15 bg-background overflow-hidden">
      {/* Top blueprint band */}
      <BlueprintField intensity="soft" className="border-b border-border/10">
        <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/55">
              {designation}
            </span>
            <div className="w-6 h-px bg-accent/25" />
            <div>
              <p className="font-serif text-lg font-light text-foreground/90 leading-tight">
                {title}
              </p>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground/55 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions}
        </div>
      </BlueprintField>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Preview welcome — client preview orientation panel
// ─────────────────────────────────────────────────────

export function PreviewWelcome({ identity }: { identity: HqIdentity }) {
  const surfaces = [
    { idx: "01", label: "Command Overview", note: "Live operational metrics and activity feed" },
    { idx: "02", label: "Pipeline", note: "From new enquiry through to archive (read-only)" },
    { idx: "03", label: "Applications", note: "Apply to Build submissions" },
    { idx: "04", label: "Content", note: "Editorial surfaces — services, works, field notes" },
    { idx: "05", label: "Projects", note: "Live build register with scope and timeline" },
  ];
  return (
    <div className="relative">
      <BlueprintField intensity="soft" className="border-y border-border/10">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/55 mb-4">
            Client Preview · Orientation
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-foreground tracking-tight leading-[1.02]">
            Welcome, {identity.firstName}.
          </h1>
          <div className="mt-4 mb-10 flex items-center gap-3">
            <RoleMarker identity={identity} />
          </div>

          <div className="max-w-2xl space-y-5 text-[14px] text-foreground/75 leading-[1.7] font-light">
            <p>
              This is Peninsula Equine HQ — the operating system behind every project from first
              enquiry to final handover.
            </p>
            <p className="text-muted-foreground/65">
              Explore the project pipeline, content systems and operational workflows used to manage
              Peninsula Equine. This is a view-only preview — nothing you do here will alter live
              data or dispatch communications. Move freely.
            </p>
          </div>


          <div className="mt-12">
            <BronzeRule label="Surfaces available to you" />
          </div>

          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
            {surfaces.map((s) => (
              <li key={s.idx} className="flex items-baseline gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/55">
                  {s.idx}
                </span>
                <div>
                  <p className="font-serif text-base font-light text-foreground/90">{s.label}</p>
                  <p className="text-[12px] text-muted-foreground/55 mt-1 leading-relaxed">
                    {s.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/40 mt-14">
            Built properly. Resolve it completely.
          </p>
        </div>
      </BlueprintField>
    </div>
  );
}
