import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type SenderKey = "hq" | "noreply" | "bookings" | "quotes" | "from";

interface LogEntry {
  ts: string;
  level: "info" | "ok" | "error";
  message: string;
  detail?: unknown;
}

const SENDERS: { key: SenderKey; label: string }[] = [
  { key: "hq", label: "HQ_EMAIL_FROM" },
  { key: "noreply", label: "NOREPLY_EMAIL_FROM" },
  { key: "bookings", label: "BOOKINGS_EMAIL_FROM" },
  { key: "quotes", label: "QUOTES_EMAIL_FROM" },
  { key: "from", label: "FROM_EMAIL" },
];

export function EmailDiagnostics() {
  const { user, isAdmin } = useAuth();
  const [sender, setSender] = useState<SenderKey>("hq");
  const [recipient, setRecipient] = useState(user?.email ?? "");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  if (!isAdmin) return null;

  const append = (entry: LogEntry) =>
    setLogs((prev) => [{ ...entry, ts: new Date().toISOString() }, ...prev].slice(0, 25));

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    append({ ts: "", level: "info", message: `Invoking send-test-email · sender=${sender} · to=${recipient || "(self)"}` });
    try {
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: { sender, recipient: recipient || undefined },
      });
      if (error) {
        append({ ts: "", level: "error", message: `Edge function error: ${error.message}`, detail: error });
      } else if (data?.ok) {
        append({
          ts: "",
          level: "ok",
          message: `Sent via ${data.from} → ${data.recipient}${data.resendId ? ` · id ${data.resendId}` : ""}`,
          detail: data,
        });
      } else {
        append({
          ts: "",
          level: "error",
          message: data?.error || "Send failed (no detail returned)",
          detail: data,
        });
      }
    } catch (err) {
      append({
        ts: "",
        level: "error",
        message: err instanceof Error ? err.message : String(err),
        detail: err,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-border/15 px-6 py-7 bg-background">
      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/55 mb-5">
        Email · Diagnostic Send
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">Sender secret</span>
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

      <div className="mt-8 border-t border-border/10 pt-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-3">
          Result log
        </p>
        {logs.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/45">No diagnostics yet.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((entry, i) => (
              <li key={i} className="font-mono text-[11px] leading-relaxed">
                <div className="flex items-baseline gap-3">
                  <span
                    className={
                      entry.level === "ok"
                        ? "text-accent"
                        : entry.level === "error"
                        ? "text-destructive"
                        : "text-muted-foreground/60"
                    }
                  >
                    {entry.level === "ok" ? "✓" : entry.level === "error" ? "✕" : "·"}
                  </span>
                  <span className="text-muted-foreground/45 text-[10px]">{entry.ts}</span>
                  <span className="text-foreground/80">{entry.message}</span>
                </div>
                {entry.detail !== undefined && (
                  <pre className="mt-1 ml-6 text-[10px] text-muted-foreground/55 whitespace-pre-wrap break-all">
                    {typeof entry.detail === "string"
                      ? entry.detail
                      : JSON.stringify(entry.detail, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
