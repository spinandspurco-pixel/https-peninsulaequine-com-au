import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DOMAIN = "peninsulaequine.systems";
const TOKEN =
  "google-site-verification=iMvRcyyPNi6aHBd0py3awRWPqS6-Yh2hXIl9y4vkKDU";
const TTL = "300";
const TYPE = "TXT";
const HOST = "@";

const LOVABLE_DOMAINS_URL =
  "https://lovable.dev/projects/ebeb5b18-7fa0-4d1b-b9a3-22ec57bd6cff/settings/domains";

type Field = { label: string; value: string };

export default function DnsPublish() {
  const [copied, setCopied] = useState<string | null>(null);

  const fields: Field[] = useMemo(
    () => [
      { label: "Type", value: TYPE },
      { label: "Host / Name", value: HOST },
      { label: "Value", value: TOKEN },
      { label: "TTL", value: TTL },
    ],
    [],
  );

  const copy = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Unable to copy");
    }
  }, []);

  const copyAll = useCallback(async () => {
    const block = fields.map((f) => `${f.label}: ${f.value}`).join("\n");
    try {
      await navigator.clipboard.writeText(block);
      setCopied("all");
      toast.success("All record fields copied");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Unable to copy");
    }
  }, [fields]);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-3">
          <p className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
            Infrastructure / DNS publish
          </p>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">
            Google Workspace TXT record
          </h1>
          <p className="text-sm text-foreground/60 leading-relaxed">
            One paste into Lovable's managed DNS panel for{" "}
            <span className="font-mono text-foreground/80">{DOMAIN}</span>.
            Existing A and _lovable records stay untouched.
          </p>
        </header>

        <section className="space-y-6 border-t border-foreground/10 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
              Record
            </h2>
            <button
              type="button"
              onClick={copyAll}
              className="text-[0.625rem] uppercase tracking-[0.3em] text-foreground hover:opacity-60 transition-opacity"
            >
              {copied === "all" ? "✓ Copied" : "→ Copy all"}
            </button>
          </div>

          <dl className="space-y-5">
            {fields.map((f) => (
              <div
                key={f.label}
                className="flex items-start justify-between gap-6 border-b border-foreground/10 pb-4"
              >
                <div className="min-w-0 flex-1">
                  <dt className="text-[0.625rem] uppercase tracking-[0.35em] text-foreground/40">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-sm font-mono text-foreground/85 break-all">
                    {f.value}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={() => copy(f.label, f.value)}
                  className="shrink-0 text-[0.625rem] uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  {copied === f.label ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-4 border-t border-foreground/10 pt-8">
          <h2 className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
            Publish path
          </h2>
          <ol className="space-y-3 text-sm text-foreground/70 leading-relaxed list-decimal pl-5">
            <li>Open the Lovable Domains panel below.</li>
            <li>
              Find <span className="font-mono">{DOMAIN}</span> → ⋯ →{" "}
              <span className="font-mono">Configure</span> →{" "}
              <span className="font-mono">Manage DNS records</span>.
            </li>
            <li>
              Add record · paste the four fields above (or use{" "}
              <span className="font-mono">Copy all</span>).
            </li>
            <li>Save. Leave the existing A record and MX records alone.</li>
            <li>Come back here and run the verifier.</li>
          </ol>

          <div className="flex flex-wrap gap-6 pt-2 text-xs uppercase tracking-[0.3em]">
            <a
              href={LOVABLE_DOMAINS_URL}
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:opacity-60 transition-opacity"
            >
              → Open Lovable DNS
            </a>
            <Link
              to={`/hq/dns-verify?domain=${encodeURIComponent(
                DOMAIN,
              )}&txt=${encodeURIComponent(TOKEN)}`}
              className="text-foreground/60 hover:opacity-80 transition-opacity"
            >
              ↻ Run verifier
            </Link>
            <a
              href="https://admin.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-foreground/60 hover:opacity-80 transition-opacity"
            >
              ↗ Google Admin
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
