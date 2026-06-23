import { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { TodaysPlan } from "@/components/TodaysPlan";
import { FollowUpCommandView } from "@/components/FollowUpCommandView";
import { WholePropertyInbox } from "@/components/admin/WholePropertyInbox";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { AdminStaffOnboarding } from "@/components/AdminStaffOnboarding";
import { EmailDiagnostics } from "@/components/hq/EmailDiagnostics";
import { PreviewMintGate } from "@/components/hq/PreviewMintGate";

/* ── Status tag ────────────────────────────────────────── */
type Status = "nominal" | "action" | "blocked" | "internal";

const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  nominal:  { label: "Operational", cls: "text-emerald-400/80 border-emerald-400/25 bg-emerald-400/5" },
  action:   { label: "Attention",   cls: "text-amber-300/85  border-amber-300/30  bg-amber-300/5" },
  blocked:  { label: "Blocked",     cls: "text-rose-300/85   border-rose-300/30   bg-rose-300/5" },
  internal: { label: "Restricted",  cls: "text-accent/70     border-accent/25     bg-accent/5" },
};

function StatusTag({ status }: { status: Status }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center px-2 py-[3px] border font-mono text-[9px] uppercase tracking-[0.22em] ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ── Summary card (default collapsed surface) ─────────── */
function SummaryCard({
  label,
  status,
  hint,
  lastChecked,
  onOpen,
  openTab,
}: {
  label: string;
  status: Status;
  hint: string;
  lastChecked?: string;
  onOpen: () => void;
  openTab: string;
}) {
  return (
    <button
      onClick={onOpen}
      className="group text-left bg-background border border-border/10 hover:border-accent/30 transition-colors px-5 py-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55 group-hover:text-foreground/75 transition-colors">
          {label}
        </span>
        <StatusTag status={status} />
      </div>
      <p className="text-[12px] text-foreground/70 leading-relaxed">{hint}</p>
      <div className="flex items-center justify-between mt-1">
        {lastChecked ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/35">
            Last checked · {lastChecked}
          </span>
        ) : <span />}
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent/40 group-hover:text-accent/80 transition-colors">
          Open {openTab} →
        </span>
      </div>
    </button>
  );
}

/* ── Tab definitions ───────────────────────────────────── */
type TabKey = "daily" | "commercial" | "team" | "systems" | "preview";

type Tab = {
  key: TabKey;
  label: string;
  description: string;
  adminOnly?: boolean;
};

const ALL_TABS: Tab[] = [
  { key: "daily",      label: "Daily Command",     description: "Plan, follow-ups, whole-property inbox." },
  { key: "commercial", label: "Commercial Control",description: "Financials, jobs, quotes, payments.",     adminOnly: true },
  { key: "team",       label: "Team & Access",     description: "Staff directory, invitations, preview accounts." },
  { key: "systems",    label: "Systems Health",    description: "Email, DNS, diagnostics, templates.",     adminOnly: true },
  { key: "preview",    label: "Preview Safety",    description: "Client preview gate and pre-mint scan.",  adminOnly: true },
];

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-6">
      <h3 className="font-serif text-base font-light text-foreground/90">{title}</h3>
      {note && <p className="text-[12px] text-muted-foreground/55 mt-1 leading-relaxed">{note}</p>}
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="border border-border/10 bg-background/40 px-5 py-6">{children}</div>
  );
}

/* ── Main component ────────────────────────────────────── */
export function ControlRoom({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("daily");
  const tabs = ALL_TABS.filter((t) => !t.adminOnly || isAdmin);
  const today = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const openTab = (k: TabKey) => { setTab(k); setOpen(true); };

  return (
    <section className="border-t border-border/10 pt-14 sm:pt-20 pb-20 sm:pb-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40">∞</span>
          <div className="w-6 h-px bg-accent/20" />
          <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/90">Control Room</h2>
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hover:text-foreground/80 transition-colors"
          >
            {open ? "Collapse −" : "Expand +"}
          </button>
        </div>
        <p className="text-[12px] text-muted-foreground/55 max-w-xl mb-10 leading-relaxed">
          Internal tooling. Only urgent signals show by default — open a card or tab to reach deeper controls.
        </p>

        {/* Default summary grid (always visible) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            label="Today's Plan"
            status="nominal"
            hint="Your scheduled work for today, in order."
            onOpen={() => openTab("daily")}
            openTab="Daily Command"
          />
          <SummaryCard
            label="Urgent Follow-Ups"
            status="action"
            hint="Conversations that need a reply today."
            onOpen={() => openTab("daily")}
            openTab="Daily Command"
          />
          {isAdmin && (
            <SummaryCard
              label="Financial Snapshot"
              status="internal"
              hint="Cashflow, margin and active job profitability."
              onOpen={() => openTab("commercial")}
              openTab="Commercial Control"
            />
          )}
          {isAdmin && (
            <SummaryCard
              label="Email Infrastructure"
              status="nominal"
              hint="Deliverability, DNS and diagnostic sends."
              lastChecked={today}
              onOpen={() => openTab("systems")}
              openTab="Systems Health"
            />
          )}
          {isAdmin && (
            <SummaryCard
              label="Client Preview Gate"
              status="internal"
              hint="Mint guarded preview accounts for clients."
              onOpen={() => openTab("preview")}
              openTab="Preview Safety"
            />
          )}
          <SummaryCard
            label="Team & Access"
            status="internal"
            hint="Staff directory, invitations, role checks."
            onOpen={() => openTab("team")}
            openTab="Team & Access"
          />
        </div>

        {/* Expanded panel */}
        {open && (
          <div className="mt-12 border-t border-border/10 pt-10">
            {/* Tabs */}
            <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-4 border-b border-border/5">
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`font-mono text-[10px] uppercase tracking-[0.22em] whitespace-nowrap transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground/45 hover:text-foreground/75"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-muted-foreground/55 mt-4 leading-relaxed">
              {tabs.find((t) => t.key === tab)?.description}
            </p>

            <div className="mt-10 space-y-12">
              {tab === "daily" && (
                <>
                  <div>
                    <SectionHeading title="Today's Plan" note="Scheduled work, in order." />
                    <Card><TodaysPlan /></Card>
                  </div>
                  <div>
                    <SectionHeading title="Follow-Ups" note="Conversations waiting on you." />
                    <Card><FollowUpCommandView /></Card>
                  </div>
                  <div>
                    <SectionHeading title="Whole-Property Inbox" note="Every incoming signal in one view." />
                    <Card><WholePropertyInbox /></Card>
                  </div>
                </>
              )}

              {tab === "commercial" && isAdmin && (
                <>
                  <div>
                    <SectionHeading title="Financial Snapshot" note="Cashflow, overheads, runway." />
                    <Card><FinancialDashboard /></Card>
                  </div>
                  <div>
                    <SectionHeading title="Job Profit · Quote Calculator · Payment Tracker" note="Open inside the Financial Snapshot panels above." />
                    <Card>
                      <p className="text-[12px] text-muted-foreground/55 leading-relaxed">
                        Job-level profit, quote calculator and payment tracker are accessible through the
                        Financial Snapshot tabs. We'll surface them as standalone cards in the next iteration.
                      </p>
                    </Card>
                  </div>
                </>
              )}

              {tab === "team" && (
                <div>
                  <SectionHeading title="Staff Directory & Invitations" note="Invite staff and manage roles." />
                  <Card><AdminStaffOnboarding /></Card>
                </div>
              )}

              {tab === "systems" && isAdmin && (
                <>
                  <div>
                    <SectionHeading title="Email Operations Centre" note={`Last checked · ${today}`} />
                    <Card><EmailDiagnostics /></Card>
                  </div>
                  <div>
                    <SectionHeading title="Domain & DNS" note="Verify Google Workspace and project DNS." />
                    <Card>
                      <div className="flex flex-col gap-3">
                        <Link
                          to="/hq/dns-verify?domain=peninsulaequine.systems&txt=google-site-verification=iMvRcyyPNi6aHBd0py3awRWPqS6-Yh2hXIl9y4vkKDU"
                          className="text-[12px] text-foreground/75 hover:text-foreground transition-colors"
                        >
                          → Verify Google Workspace DNS
                        </Link>
                        <Link to="/hq/dns-status" className="text-[12px] text-foreground/75 hover:text-foreground transition-colors">
                          → DNS status overview
                        </Link>
                        <Link to="/hq/dns-wizard" className="text-[12px] text-foreground/75 hover:text-foreground transition-colors">
                          → DNS wizard
                        </Link>
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {tab === "preview" && isAdmin && (
                <div>
                  <SectionHeading title="Client Preview Gate" note="Mint a guarded preview account before sharing." />
                  <Card><PreviewMintGate /></Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
