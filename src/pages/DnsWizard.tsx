import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

type Mx = { priority: string; host: string };

const DEFAULT_MX: Mx[] = [
  { priority: "1", host: "smtp.google.com" },
];

const STEPS = ["Domain", "Verification TXT", "MX records", "DKIM", "Review"] as const;

export default function DnsWizard() {
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState("peninsulaequine.systems");
  const [dmarcRua, setDmarcRua] = useState("admin@peninsulaequine.systems");
  const [verifyTxt, setVerifyTxt] = useState("");
  const [mx, setMx] = useState<Mx[]>(DEFAULT_MX);
  const [dkimSelector, setDkimSelector] = useState("google");
  const [dkimKey, setDkimKey] = useState("");

  const cleanedVerify = verifyTxt.trim().replace(/^"|"$/g, "");
  const cleanedKey = dkimKey
    .replace(/\s+/g, "")
    .replace(/"/g, "");
  const dkimValue = cleanedKey.startsWith("v=DKIM1")
    ? cleanedKey
    : `v=DKIM1; k=rsa; p=${cleanedKey}`;

  const block = useMemo(() => {
    const lines: string[] = [];
    lines.push(`; Registrar-ready DNS for ${domain}`);
    lines.push(`; Generated ${new Date().toISOString()}`);
    lines.push("");
    lines.push("; --- Google site verification ---");
    if (cleanedVerify) {
      lines.push(`@\t3600\tIN\tTXT\t"${cleanedVerify}"`);
    }
    lines.push("");
    lines.push("; --- MX (Google Workspace) ---");
    for (const r of mx) {
      if (r.host.trim()) {
        const host = r.host.trim().replace(/\.?$/, ".");
        lines.push(`@\t3600\tIN\tMX\t${r.priority || "1"} ${host}`);
      }
    }
    lines.push("");
    lines.push("; --- SPF ---");
    lines.push(`@\t3600\tIN\tTXT\t"v=spf1 include:_spf.google.com ~all"`);
    lines.push("");
    lines.push("; --- DKIM ---");
    if (cleanedKey) {
      const name = `${dkimSelector}._domainkey`;
      // Split long TXT into 255-char chunks
      const chunks = dkimValue.match(/.{1,255}/g) || [];
      const quoted = chunks.map((c) => `"${c}"`).join(" ");
      lines.push(`${name}\t3600\tIN\tTXT\t${quoted}`);
    }
    lines.push("");
    lines.push("; --- DMARC ---");
    lines.push(
      `_dmarc\t3600\tIN\tTXT\t"v=DMARC1; p=quarantine; rua=mailto:${dmarcRua}; ruf=mailto:${dmarcRua}; fo=1; adkim=s; aspf=s; pct=100"`,
    );
    return lines.join("\n");
  }, [domain, cleanedVerify, mx, dkimSelector, cleanedKey, dkimValue, dmarcRua]);

  const copy = async () => {
    await navigator.clipboard.writeText(block);
    toast({ title: "Copied", description: "DNS block on clipboard." });
  };

  const download = () => {
    const blob = new Blob([block], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${domain}-dns.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = () => {
    if (step === 0) return domain.trim().length > 0 && dmarcRua.trim().length > 0;
    if (step === 1) return cleanedVerify.startsWith("google-site-verification=");
    if (step === 2) return mx.some((r) => r.host.trim().length > 0);
    if (step === 3) return cleanedKey.length > 0 && dkimSelector.trim().length > 0;
    return true;
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.45em] text-foreground/45 mb-6">
          Workspace · DNS Assembly
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] mb-8">
          Registrar-ready DNS
        </h1>

        <div className="mb-10">
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-px" />
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.3em] text-foreground/45">
            {STEPS.map((s, i) => (
              <span key={s} className={i === step ? "text-foreground" : ""}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <Card className="p-8 border-border/40">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.trim())}
                  placeholder="peninsulaequine.systems"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="rua">DMARC reporting address (rua)</Label>
                <Input
                  id="rua"
                  value={dmarcRua}
                  onChange={(e) => setDmarcRua(e.target.value.trim())}
                  placeholder="admin@peninsulaequine.systems"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <Label htmlFor="verify">Google verification TXT</Label>
              <p className="text-sm text-foreground/55">
                Paste the full string beginning with{" "}
                <code className="text-foreground/80">google-site-verification=</code>
              </p>
              <Textarea
                id="verify"
                rows={3}
                value={verifyTxt}
                onChange={(e) => setVerifyTxt(e.target.value)}
                placeholder="google-site-verification=abc123..."
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>MX records</Label>
                <p className="text-sm text-foreground/55 mt-1">
                  Modern Google Workspace uses a single record: priority{" "}
                  <code>1</code> → <code>smtp.google.com</code>. Adjust if your
                  console shows the legacy set.
                </p>
              </div>
              {mx.map((r, i) => (
                <div key={i} className="grid grid-cols-[80px_1fr_auto] gap-3 items-end">
                  <div>
                    <Label className="text-xs">Priority</Label>
                    <Input
                      value={r.priority}
                      onChange={(e) =>
                        setMx((m) => m.map((x, j) => (j === i ? { ...x, priority: e.target.value } : x)))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Host</Label>
                    <Input
                      value={r.host}
                      onChange={(e) =>
                        setMx((m) => m.map((x, j) => (j === i ? { ...x, host: e.target.value } : x)))
                      }
                      placeholder="smtp.google.com"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMx((m) => m.filter((_, j) => j !== i))}
                    disabled={mx.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMx((m) => [...m, { priority: "5", host: "" }])}
              >
                Add MX record
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="sel">DKIM selector</Label>
                <Input
                  id="sel"
                  value={dkimSelector}
                  onChange={(e) => setDkimSelector(e.target.value.trim())}
                  placeholder="google"
                  className="mt-2"
                />
                <p className="text-xs text-foreground/55 mt-1">
                  Published as <code>{dkimSelector || "google"}._domainkey</code>
                </p>
              </div>
              <div>
                <Label htmlFor="key">DKIM public key</Label>
                <p className="text-xs text-foreground/55 mt-1 mb-2">
                  Paste either the raw <code>p=</code> base64 value, or the full{" "}
                  <code>v=DKIM1; k=rsa; p=…</code> string. Whitespace and quotes
                  are stripped automatically.
                </p>
                <Textarea
                  id="key"
                  rows={8}
                  value={dkimKey}
                  onChange={(e) => setDkimKey(e.target.value)}
                  placeholder="v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFA..."
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>Registrar-ready zone snippet</Label>
              <pre className="text-xs bg-muted/40 border border-border/40 rounded p-4 overflow-x-auto whitespace-pre">
                {block}
              </pre>
              <div className="flex gap-3">
                <Button onClick={copy}>Copy</Button>
                <Button variant="outline" onClick={download}>
                  Download .txt
                </Button>
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!canNext()}>
                Continue
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setStep(0)}>
                Start over
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
