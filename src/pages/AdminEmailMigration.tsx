import { useEffect, useMemo, useState } from "react";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";

import { Check, X, Minus, RotateCw, Lock, Download, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import ResendDomainPanel from "@/components/admin/ResendDomainPanel";
import DnsPropagationChecker from "@/components/admin/DnsPropagationChecker";


type Status = "pass" | "fail" | "pending";

interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
  status: Status;
  note?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  description: string;
  dependsOn?: string; // section id that must be fully passed before this unlocks
  items: ChecklistItem[];
}

const STORAGE_KEY = "pe.email-migration.checklist.v2";

const INITIAL_SECTIONS: ChecklistSection[] = [
  {
    id: "verification",
    title: "1 · Domain Verification",
    description: "Google Workspace and Resend ownership proofs.",
    items: [
      { id: "gws-txt", label: "Google Workspace TXT record present", detail: "google-site-verification=iMvRcyyPNi6aHBd0py3awRWPqS6-Yh2hXIl9y4vkKDU on @", status: "pending" },
      { id: "gws-verified", label: "Google Workspace marks domain verified", status: "pending" },
      { id: "resend-systems-verified", label: "notify.peninsulaequine.systems verified in Resend", status: "pending" },
      { id: "lovable-custom-domain", label: "peninsulaequine.systems live on Lovable (A 185.158.133.1)", status: "pass" },
    ],
  },
  {
    id: "dns",
    title: "2 · DNS Records",
    description: "Inbound (Google) and outbound (Resend) routing.",
    dependsOn: "verification",
    items: [
      { id: "mx-google", label: "MX → smtp.google.com (priority 1)", status: "pending" },
      { id: "spf", label: "SPF includes _spf.google.com + Resend", detail: "v=spf1 include:_spf.google.com include:amazonses.com ~all", status: "pending" },
      { id: "dkim-google", label: "Google Workspace DKIM published", status: "pending" },
      { id: "dkim-resend", label: "Resend DKIM CNAMEs on notify subdomain", status: "pending" },
      { id: "dmarc", label: "DMARC published (p=none, rua reporting)", status: "pending" },
      { id: "ns-delegation", label: "notify.peninsulaequine.systems NS delegated", status: "pending" },
    ],
  },
  {
    id: "senders",
    title: "3 · Sender Identities",
    description: "Secrets routed to @peninsulaequine.systems.",
    dependsOn: "dns",
    items: [
      { id: "notification-email", label: "NOTIFICATION_EMAIL", status: "pass" },
      { id: "hq-email-from", label: "HQ_EMAIL_FROM", status: "pass" },
      { id: "noreply-email-from", label: "NOREPLY_EMAIL_FROM", status: "pass" },
      { id: "bookings-email-from", label: "BOOKINGS_EMAIL_FROM", status: "pass" },
      { id: "quotes-email-from", label: "QUOTES_EMAIL_FROM", status: "pass" },
      { id: "from-email", label: "FROM_EMAIL", status: "pass" },
      { id: "resend-key", label: "RESEND_API_KEY bound to .systems domain", status: "pending" },
    ],
  },
  {
    id: "auth",
    title: "4 · Auth Identity Migration",
    description: "auth.users rows rewritten from .org → .systems.",
    dependsOn: "senders",
    items: [
      { id: "auth-info", label: "info@peninsulaequine.systems", status: "pending" },
      { id: "auth-sander", label: "sander@peninsulaequine.systems", status: "pending" },
      { id: "auth-ciro", label: "ciro@peninsulaequine.systems", status: "pending" },
      { id: "auth-glenn", label: "glenn@peninsulaequine.systems", status: "pending" },
    ],
  },
  {
    id: "smoke",
    title: "5 · Smoke Tests",
    description: "Live send + log verification via send-test-email and email_send_log.",
    dependsOn: "auth",
    items: [
      { id: "smoke-inquiry", label: "send-inquiry-notification delivers", status: "pending" },
      { id: "smoke-rsvp", label: "send-rsvp-confirmation delivers", status: "pending" },
      { id: "smoke-document", label: "send-document-notification delivers", status: "pending" },
      { id: "smoke-welcome", label: "send-welcome-series delivers", status: "pending" },
      { id: "smoke-quote", label: "Quote share email delivers", status: "pending" },
      { id: "smoke-ops-status", label: "email-ops-status reports matchesVerifiedDomain", status: "pending" },
    ],
  },
];

const statusMeta: Record<Status, { label: string; className: string; Icon: typeof Check }> = {
  pass: { label: "Pass", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", Icon: Check },
  fail: { label: "Fail", className: "bg-red-500/15 text-red-300 border-red-500/30", Icon: X },
  pending: { label: "Pending", className: "bg-muted/40 text-muted-foreground border-border", Icon: Minus },
};

const nextStatus: Record<Status, Status> = { pending: "pass", pass: "fail", fail: "pending" };

function loadState(): ChecklistSection[] {
  if (typeof window === "undefined") return INITIAL_SECTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SECTIONS;
    const saved = JSON.parse(raw) as ChecklistSection[];
    return INITIAL_SECTIONS.map((sec) => {
      const savedSec = saved.find((s) => s.id === sec.id);
      return {
        ...sec,
        items: sec.items.map((item) => {
          const savedItem = savedSec?.items.find((i) => i.id === item.id);
          return savedItem ? { ...item, status: savedItem.status, note: savedItem.note } : item;
        }),
      };
    });
  } catch {
    return INITIAL_SECTIONS;
  }
}

export default function AdminEmailMigration() {
  const [sections, setSections] = useState<ChecklistSection[]>(loadState);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }, [sections]);

  const sectionStats = useMemo(() => {
    const map = new Map<string, { total: number; pass: number; fail: number; complete: boolean }>();
    for (const sec of sections) {
      const total = sec.items.length;
      const pass = sec.items.filter((i) => i.status === "pass").length;
      const fail = sec.items.filter((i) => i.status === "fail").length;
      map.set(sec.id, { total, pass, fail, complete: pass === total });
    }
    return map;
  }, [sections]);

  const lockedSections = useMemo(() => {
    const locked = new Set<string>();
    for (const sec of sections) {
      if (sec.dependsOn) {
        const dep = sectionStats.get(sec.dependsOn);
        if (!dep?.complete) locked.add(sec.id);
      }
    }
    return locked;
  }, [sections, sectionStats]);

  const totals = useMemo(() => {
    const all = sections.flatMap((s) => s.items);
    return {
      total: all.length,
      pass: all.filter((i) => i.status === "pass").length,
      fail: all.filter((i) => i.status === "fail").length,
      pending: all.filter((i) => i.status === "pending").length,
    };
  }, [sections]);

  const overallPct = totals.total === 0 ? 0 : Math.round((totals.pass / totals.total) * 100);
  const currentStep = sections.findIndex((s) => !sectionStats.get(s.id)?.complete);
  const activeSection = currentStep === -1 ? sections[sections.length - 1] : sections[currentStep];

  const updateItem = (sectionId: string, itemId: string, patch: Partial<ChecklistItem>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : s,
      ),
    );
  };

  const resetAll = () => {
    setSections(INITIAL_SECTIONS.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i, status: "pending" as Status, note: undefined })) })));
  };

  const runSmokeTest = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: { template: "ops-check" },
      });
      if (error) throw error;
      updateItem("smoke", "smoke-ops-status", { status: "pass", note: typeof data === "object" ? JSON.stringify(data).slice(0, 160) : undefined });
      toast({ title: "Smoke test triggered", description: "Check email_send_log for delivery state." });
    } catch (e: any) {
      updateItem("smoke", "smoke-ops-status", { status: "fail", note: e?.message?.slice(0, 200) });
      toast({ title: "Smoke test failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const exportResults = () => {
    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        domain: "peninsulaequine.systems",
        source: "AdminEmailMigration",
        version: "1.0",
      },
      summary: {
        overallPct,
        total: totals.total,
        pass: totals.pass,
        fail: totals.fail,
        pending: totals.pending,
      },
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        dependsOn: s.dependsOn,
        stats: sectionStats.get(s.id),
        items: s.items.map((i) => ({
          id: i.id,
          label: i.label,
          detail: i.detail,
          status: i.status,
          note: i.note,
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `pe-email-migration-audit-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Audit exported", description: "JSON download started." });
  };

  const escapeCSV = (val: string | undefined) => {
    if (val == null) return "";
    const s = String(val).replace(/"/g, '""');
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s}"`;
    }
    return s;
  };

  const exportCSV = () => {
    const rows: string[] = [];
    rows.push("Section,Step,Item ID,Label,Detail,Status,Note,Section Pass Rate");
    sections.forEach((sec, secIdx) => {
      const stats = sectionStats.get(sec.id)!;
      const pct = stats.total === 0 ? 0 : Math.round((stats.pass / stats.total) * 100);
      sec.items.forEach((item) => {
        rows.push(
          [
            escapeCSV(sec.title),
            String(secIdx + 1),
            escapeCSV(item.id),
            escapeCSV(item.label),
            escapeCSV(item.detail),
            escapeCSV(item.status),
            escapeCSV(item.note),
            `${pct}%`,
          ].join(",")
        );
      });
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `pe-email-migration-audit-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", description: "Spreadsheet download started." });
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 md:px-12">
      <HqBreadcrumbs current="Email Migration" />
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 border-b border-border/40 pb-8">
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-muted-foreground/70">HQ · Infrastructure</p>
          <h1 className="font-serif text-4xl md:text-5xl mt-3 tracking-tight">Email Migration Checklist</h1>
          <p className="mt-4 max-w-2xl text-sm font-light text-muted-foreground/80 leading-relaxed">
            Cut-over from <span className="font-mono">peninsulaequine.org</span> to{" "}
            <span className="font-mono">peninsulaequine.systems</span>. Steps unlock as the prior section reaches full pass.
          </p>

          {/* Progress summary */}
          <div className="mt-8 space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground/60">Currently on</p>
                <p className="font-serif text-xl mt-1">{activeSection?.title ?? "Complete"}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground/60">Overall</p>
                <p className="font-mono text-2xl mt-1">{overallPct}%</p>
              </div>
            </div>
            <Progress value={overallPct} className="h-1" />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              {sections.map((sec, idx) => {
                const stats = sectionStats.get(sec.id)!;
                const locked = lockedSections.has(sec.id);
                const pct = Math.round((stats.pass / stats.total) * 100);
                return (
                  <a
                    key={sec.id}
                    href={`#section-${sec.id}`}
                    className={`block border border-border/40 px-3 py-3 transition-colors ${
                      locked ? "opacity-40" : "hover:border-foreground/40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground/70">
                      <span>Step {idx + 1}</span>
                      {locked ? <Lock className="h-3 w-3" /> : stats.complete ? <Check className="h-3 w-3 text-emerald-400" /> : null}
                    </div>
                    <p className="mt-2 font-mono text-sm">{stats.pass}/{stats.total}</p>
                    <div className="mt-2 h-px bg-border/30">
                      <div className="h-full bg-emerald-400/60" style={{ width: `${pct}%` }} />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.3em]">
            <span className="text-muted-foreground/60">Total <span className="text-foreground font-mono ml-2">{totals.total}</span></span>
            <span className="text-emerald-400/80">Pass <span className="font-mono ml-2">{totals.pass}</span></span>
            <span className="text-red-400/80">Fail <span className="font-mono ml-2">{totals.fail}</span></span>
            <span className="text-muted-foreground/60">Pending <span className="font-mono ml-2">{totals.pending}</span></span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={runSmokeTest} disabled={running || lockedSections.has("smoke")}>
                <RotateCw className={`h-3 w-3 mr-2 ${running ? "animate-spin" : ""}`} />
                Run ops smoke test
              </Button>
              <Button size="sm" variant="outline" onClick={exportResults}>
                <Download className="h-3 w-3 mr-2" />
                Export audit
              </Button>
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <FileSpreadsheet className="h-3 w-3 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" variant="ghost" onClick={resetAll}>Reset</Button>
            </div>
          </div>
        </header>

        <DnsPropagationChecker />
        <ResendDomainPanel />

        <div className="space-y-16">

          {sections.map((section) => {
            const locked = lockedSections.has(section.id);
            const stats = sectionStats.get(section.id)!;
            const depTitle = section.dependsOn
              ? sections.find((s) => s.id === section.dependsOn)?.title
              : null;
            return (
              <section key={section.id} id={`section-${section.id}`} className={locked ? "opacity-50" : ""}>
                <div className="mb-6 flex items-start justify-between gap-6">
                  <div>
                    <h2 className="font-serif text-2xl tracking-tight flex items-center gap-3">
                      {section.title}
                      {locked && <Lock className="h-4 w-4 text-muted-foreground/60" />}
                      {stats.complete && <Check className="h-4 w-4 text-emerald-400" />}
                    </h2>
                    <p className="mt-1 text-sm font-light text-muted-foreground/70">
                      {locked ? `Locked — complete ${depTitle} first.` : section.description}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/60 shrink-0">
                    {stats.pass}/{stats.total}
                  </span>
                </div>

                <ul className="divide-y divide-border/30 border-t border-b border-border/30">
                  {section.items.map((item) => {
                    const meta = statusMeta[item.status];
                    const Icon = meta.Icon;
                    return (
                      <li key={item.id} className="py-4 flex items-start gap-6">
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => updateItem(section.id, item.id, { status: nextStatus[item.status] })}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${meta.className} transition-colors disabled:cursor-not-allowed`}
                          aria-label={`Toggle status for ${item.label}`}
                        >
                          <Icon className="h-3 w-3" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-4">
                            <p className="text-sm font-light leading-snug">{item.label}</p>
                            <Badge variant="outline" className={`text-[0.6rem] uppercase tracking-[0.25em] ${meta.className}`}>
                              {meta.label}
                            </Badge>
                          </div>
                          {item.detail && (
                            <p className="mt-1 text-xs font-mono text-muted-foreground/60 break-all">{item.detail}</p>
                          )}
                          {item.note && (
                            <p className="mt-2 text-xs text-muted-foreground/70 italic">Note: {item.note}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
