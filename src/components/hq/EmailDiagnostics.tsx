import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PreflightFrame, BronzeRule, StatusLamp, lampLabel, type LampState } from "./HqPrimitives";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

type SenderKey = "hq" | "noreply" | "bookings" | "quotes" | "from";

interface SenderStatus {
  secret: string;
  configured: boolean;
  raw?: string;
  address?: string;
  domain?: string;
  invalid?: boolean;
  resendDevDetected?: boolean;
  matchesVerifiedDomain?: boolean;
}

interface DiagnosticLog {
  id: string;
  created_at: string;
  sender_key: string;
  from_address: string;
  recipient: string;
  status: "sent" | "failed";
  resend_id: string | null;
  error_message: string | null;
  triggered_by_email: string | null;
}

interface OpsStatus {
  verifiedDomain: string;
  senders: SenderStatus[];
  resendDomain: {
    requested: string;
    found: boolean;
    status?: string;
    records?: Array<{ record: string; name: string; status?: string; value?: string }>;
    error?: string;
  };
  lastSuccess: DiagnosticLog | null;
  lastFailure: DiagnosticLog | null;
  history: DiagnosticLog[];
  checklist: {
    domainVerified: boolean;
    spfVerified: boolean;
    dkimVerified: boolean;
    dmarcVerified: boolean | null;
    sendersConfigured: boolean;
    diagnosticSendPassed: boolean;
  };
  checkedAt: string;
}

const SENDERS: { key: SenderKey; label: string }[] = [
  { key: "hq", label: "HQ_EMAIL_FROM" },
  { key: "noreply", label: "NOREPLY_EMAIL_FROM" },
  { key: "bookings", label: "BOOKINGS_EMAIL_FROM" },
  { key: "quotes", label: "QUOTES_EMAIL_FROM" },
  { key: "from", label: "FROM_EMAIL" },
];

const TEMPLATE_PLACEHOLDERS = [
  { name: "Contact form confirmation", sender: "FROM_EMAIL", trigger: "Public contact form submit" },
  { name: "Apply to Build receipt", sender: "FROM_EMAIL", trigger: "Application submission" },
  { name: "RSVP confirmation", sender: "BOOKINGS_EMAIL_FROM", trigger: "Event RSVP" },
  { name: "Quote sent / accepted", sender: "QUOTES_EMAIL_FROM", trigger: "Quote workflow" },
  { name: "HQ internal notifications", sender: "HQ_EMAIL_FROM", trigger: "New lead / booking" },
  { name: "Password reset / auth", sender: "NOREPLY_EMAIL_FROM", trigger: "Supabase auth" },
];

// ─────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────

function StatusDot({ state }: { state: "ok" | "warn" | "fail" | "muted" }) {
  const color =
    state === "ok"
      ? "bg-accent"
      : state === "fail"
      ? "bg-destructive"
      : state === "warn"
      ? "bg-amber-500"
      : "bg-muted-foreground/30";
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}

function Pill({ tone, children }: { tone: "ok" | "warn" | "fail" | "muted"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "text-accent border-accent/40"
      : tone === "fail"
      ? "text-destructive border-destructive/40"
      : tone === "warn"
      ? "text-amber-500 border-amber-500/40"
      : "text-muted-foreground/55 border-border/30";
  return (
    <span className={`inline-block px-2 py-0.5 border ${cls} font-mono text-[9px] uppercase tracking-[0.18em]`}>
      {children}
    </span>
  );
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/55">{index}</span>
      <div className="w-5 h-px bg-accent/20" />
      <h3 className="font-serif text-base font-light text-foreground/90">{title}</h3>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────

export function EmailDiagnostics() {
  const { user, isAdmin } = useAuth();
  const [sender, setSender] = useState<SenderKey>("hq");
  const [recipient, setRecipient] = useState(user?.email ?? "");
  const [sending, setSending] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [status, setStatus] = useState<OpsStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("email-ops-status");
      if (error) throw new Error(error.message);
      setStatus(data as OpsStatus);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin, refresh]);

  if (!isAdmin) return null;

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const { error } = await supabase.functions.invoke("send-test-email", {
        body: { sender, recipient: recipient || undefined },
      });
      if (error) setError(error.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
      await refresh();
    }
  };

  const checklist = status?.checklist;
  const resend = status?.resendDomain;

  // Checklist row definitions
  const checklistRows: { label: string; ok: boolean | null; note?: string }[] = checklist
    ? [
        { label: "Sender domain verified", ok: checklist.domainVerified, note: status?.verifiedDomain },
        { label: "SPF verified", ok: checklist.spfVerified },
        { label: "DKIM verified", ok: checklist.dkimVerified },
        { label: "DMARC verified", ok: checklist.dmarcVerified, note: checklist.dmarcVerified === null ? "Customer-owned root record" : undefined },
        { label: "Sender secrets configured", ok: checklist.sendersConfigured },
        { label: "Diagnostic send passed", ok: checklist.diagnosticSendPassed },
      ]
    : [];

  return (
    <PreflightFrame
      designation="EOC-01"
      title="Email Operations Centre"
      subtitle="Pre-flight checks · sender authority · diagnostic ledger"
      actions={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusLamp
              state={
                checklist?.domainVerified && checklist.sendersConfigured
                  ? "nominal"
                  : checklist
                  ? "verify"
                  : "standby"
              }
              glow
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/65">
              {checklist?.domainVerified && checklist.sendersConfigured
                ? "Systems nominal"
                : checklist
                ? "Action required"
                : "Standby"}
            </span>
          </div>
          <button
            onClick={refresh}
            disabled={loadingStatus}
            className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55 hover:text-foreground/85 transition-colors disabled:opacity-40"
          >
            {loadingStatus ? "Polling…" : "Re-poll ↻"}
          </button>
        </div>
      }
    >
      {error && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-6 py-3 text-[11px] text-destructive font-mono">
          {error}
        </div>
      )}

      <div className="px-6 py-8 space-y-14">
        {/* ════════════════════════════════════════════ */}
        {/* 01 — PRE-FLIGHT CHECKLIST                   */}
        {/* ════════════════════════════════════════════ */}
        <section>
          <SectionHeader index="01" title="Pre-flight checklist" />
          <BronzeRule className="mb-6" />
          {!checklist ? (
            <p className="text-[11px] text-muted-foreground/45 font-mono">Polling systems…</p>
          ) : (
            <ul className="divide-y divide-border/10 border-y border-border/10">
              {checklistRows.map((row, i) => {
                const lampState: LampState =
                  row.ok === true ? "nominal" : row.ok === false ? "fault" : "standby";
                return (
                  <li
                    key={row.label}
                    className="flex items-center gap-5 py-3 px-1 hover:bg-muted/[0.03] transition-colors"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent/45 w-10">
                      T-{String(i + 1).padStart(2, "0")}
                    </span>
                    <StatusLamp state={lampState} glow={lampState === "nominal"} />
                    <span className="text-[12.5px] text-foreground/85 flex-1 font-light">
                      {row.label}
                    </span>
                    {row.note && (
                      <span className="font-mono text-[10px] text-muted-foreground/45">
                        {row.note}
                      </span>
                    )}
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/60 w-20 text-right">
                      {lampLabel(lampState)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>


        {/* ════════════════════════════════════════════ */}
        {/* 02 — SENDER VERIFICATION                    */}
        {/* ════════════════════════════════════════════ */}
        <section>
          <SectionHeader index="02" title="Sender verification" />
          <div className="border border-border/10">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border/10 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
              <div className="col-span-4">Secret</div>
              <div className="col-span-5">Address</div>
              <div className="col-span-3 text-right">State</div>
            </div>
            {(status?.senders ?? []).map((s) => {
              const state = !s.configured
                ? "fail"
                : s.invalid || s.resendDevDetected
                ? "fail"
                : !s.matchesVerifiedDomain
                ? "warn"
                : "ok";
              const stateLabel = !s.configured
                ? "Missing"
                : s.resendDevDetected
                ? "resend.dev"
                : s.invalid
                ? "Invalid"
                : !s.matchesVerifiedDomain
                ? "Off-domain"
                : "Verified";
              return (
                <div
                  key={s.secret}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/5 last:border-0 items-center"
                >
                  <div className="col-span-4 font-mono text-[11px] text-foreground/85">{s.secret}</div>
                  <div className="col-span-5 font-mono text-[11px] text-muted-foreground/75 break-all">
                    {s.address ?? <span className="text-muted-foreground/40">—</span>}
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <Pill tone={state as any}>{stateLabel}</Pill>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 03 — RESEND HEALTH                          */}
        {/* ════════════════════════════════════════════ */}
        <section>
          <SectionHeader index="03" title="Resend health" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/10">
            <div className="bg-background px-5 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 mb-2">
                Domain
              </p>
              <p className="font-mono text-[12px] text-foreground/85">{resend?.requested}</p>
              <div className="mt-2">
                <Pill
                  tone={
                    resend?.status === "verified"
                      ? "ok"
                      : resend?.found
                      ? "warn"
                      : "fail"
                  }
                >
                  {resend?.error
                    ? "API error"
                    : !resend?.found
                    ? "Not added"
                    : (resend?.status ?? "unknown")}
                </Pill>
              </div>
              {resend?.error && (
                <p className="text-[10px] text-destructive mt-2 font-mono break-all">{resend.error}</p>
              )}
            </div>

            <div className="bg-background px-5 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 mb-2">
                Last successful send
              </p>
              {status?.lastSuccess ? (
                <>
                  <p className="font-mono text-[11px] text-foreground/80 break-all">
                    {status.lastSuccess.from_address} → {status.lastSuccess.recipient}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/55 mt-1">
                    {new Date(status.lastSuccess.created_at).toLocaleString()}
                    {status.lastSuccess.resend_id ? ` · ${status.lastSuccess.resend_id}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground/45">No successful diagnostic recorded.</p>
              )}
            </div>

            <div className="bg-background px-5 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 mb-2">
                Last failed send
              </p>
              {status?.lastFailure ? (
                <>
                  <p className="font-mono text-[11px] text-foreground/80 break-all">
                    {status.lastFailure.from_address} → {status.lastFailure.recipient}
                  </p>
                  <p className="font-mono text-[10px] text-destructive/85 mt-1 break-all">
                    {status.lastFailure.error_message ?? "(no detail)"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/45 mt-1">
                    {new Date(status.lastFailure.created_at).toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground/45">No failures recorded.</p>
              )}
            </div>

            <div className="bg-background px-5 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 mb-2">
                DNS records ({resend?.records?.length ?? 0})
              </p>
              {resend?.records?.length ? (
                <ul className="space-y-1">
                  {resend.records.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-mono">
                      <StatusDot state={r.status === "verified" ? "ok" : "warn"} />
                      <span className="text-foreground/80">{r.record}</span>
                      <span className="text-muted-foreground/45 truncate flex-1">{r.name}</span>
                      <span className="text-muted-foreground/60">{r.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-muted-foreground/45">No record data.</p>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 04 — DIAGNOSTIC SEND                        */}
        {/* ════════════════════════════════════════════ */}
        <section>
          <SectionHeader index="04" title="Diagnostic send" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">Sender</span>
              <select
                value={sender}
                onChange={(e) => setSender(e.target.value as SenderKey)}
                className="bg-transparent border border-border/20 px-3 py-2 text-[12px] text-foreground/85 font-mono"
                disabled={sending}
              >
                {SENDERS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Recipient (defaults to your account)
              </span>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={user?.email ?? "name@example.com"}
                className="bg-transparent border border-border/20 px-3 py-2 text-[12px] text-foreground/85 font-mono"
                disabled={sending}
              />
            </label>
          </div>
          <button
            onClick={handleSend}
            disabled={sending}
            className="text-[11px] uppercase tracking-[0.22em] text-foreground/85 hover:text-accent transition-colors disabled:opacity-40"
          >
            {sending ? "Sending…" : "Send test email →"}
          </button>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 05 — DELIVERY HISTORY                       */}
        {/* ════════════════════════════════════════════ */}
        <section>
          <SectionHeader index="05" title="Delivery status history" />
          <div className="border border-border/10">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-border/10 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
              <div className="col-span-3">Timestamp</div>
              <div className="col-span-2">Sender</div>
              <div className="col-span-3">Recipient</div>
              <div className="col-span-3">Message ID</div>
              <div className="col-span-1 text-right">State</div>
            </div>
            {!status?.history.length ? (
              <div className="px-4 py-6 text-[11px] text-muted-foreground/45">No diagnostic sends recorded yet.</div>
            ) : (
              status.history.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-border/5 last:border-0 items-start font-mono text-[10px]"
                >
                  <div className="col-span-3 text-muted-foreground/75">
                    {new Date(row.created_at).toLocaleString()}
                  </div>
                  <div className="col-span-2 text-foreground/80">{row.sender_key}</div>
                  <div className="col-span-3 text-muted-foreground/70 break-all">{row.recipient}</div>
                  <div className="col-span-3 text-muted-foreground/50 break-all">{row.resend_id ?? "—"}</div>
                  <div className="col-span-1 flex justify-end">
                    <Pill tone={row.status === "sent" ? "ok" : "fail"}>
                      {row.status === "sent" ? "Sent" : "Failed"}
                    </Pill>
                  </div>
                  {row.error_message && (
                    <div className="col-span-12 text-[10px] text-destructive/80 pl-0 break-all">
                      {row.error_message}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 06 — TEMPLATE STUDIO (placeholder)          */}
        {/* ════════════════════════════════════════════ */}
        <section>
          <SectionHeader index="06" title="Email Studio · Templates" />
          <p className="text-[11px] text-muted-foreground/55 max-w-xl mb-5 leading-relaxed">
            Future home of Peninsula Equine template management. Each surface below is wired to a sender;
            editing, previewing and version control will land here.
          </p>
          <div className="border border-border/10">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-border/10 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
              <div className="col-span-5">Template</div>
              <div className="col-span-4">Sender</div>
              <div className="col-span-3 text-right">Status</div>
            </div>
            {TEMPLATE_PLACEHOLDERS.map((t) => (
              <div
                key={t.name}
                className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-border/5 last:border-0 items-center"
              >
                <div className="col-span-5">
                  <p className="text-[12px] text-foreground/85">{t.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5">{t.trigger}</p>
                </div>
                <div className="col-span-4 font-mono text-[10px] text-muted-foreground/65">{t.sender}</div>
                <div className="col-span-3 flex justify-end">
                  <Pill tone="muted">Coming</Pill>
                </div>
              </div>
            ))}
          </div>
        </section>

        {status?.checkedAt && (
          <p className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-[0.22em]">
            Snapshot · {new Date(status.checkedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
