import { useState } from "react";
import { Download, FileText, Shield, ScrollText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig, services } from "@/data/content";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface PolicyDocument {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  generate: () => string;
}

function generatePrivacyHTML(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Privacy Policy — ${siteConfig.name}</title>
<style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.7}
h1{font-size:28px;margin-bottom:4px}h2{font-size:18px;margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:6px}
.meta{color:#888;font-size:13px;margin-bottom:32px}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#999}
ul{padding-left:20px}li{margin-bottom:6px}
@media print{body{margin:0;padding:20px}}</style></head><body>
<h1>${siteConfig.name}</h1><p class="meta">Privacy Policy · Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
<h2>Information We Collect</h2><p>When you contact us through our website, we collect the information you provide, including your name, email address, phone number, and message content. This information is used solely to respond to your inquiries and provide our services.</p>
<h2>How We Use Your Information</h2><ul><li>Respond to your inquiries and service requests</li><li>Provide quotes and consultations</li><li>Communicate about ongoing projects</li><li>Send occasional updates about our services (with your consent)</li></ul>
<h2>Information Sharing</h2><p>We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information with trusted partners who assist us in operating our website or conducting our business, as long as those parties agree to keep this information confidential.</p>
<h2>Data Retention</h2><p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.</p>
<h2>Contact Us</h2><p>If you have questions about this Privacy Policy, please contact us at ${siteConfig.email}.</p>
<div class="footer">${siteConfig.name} · ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.zip} · ${siteConfig.phone}</div>
</body></html>`;
}

function generateTermsHTML(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Terms of Service — ${siteConfig.name}</title>
<style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.7}
h1{font-size:28px;margin-bottom:4px}h2{font-size:18px;margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:6px}
.meta{color:#888;font-size:13px;margin-bottom:32px}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#999}
@media print{body{margin:0;padding:20px}}</style></head><body>
<h1>${siteConfig.name}</h1><p class="meta">Terms of Service · Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
<h2>Agreement to Terms</h2><p>By accessing this website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
<h2>Use License</h2><p>Permission is granted to temporarily view the materials on ${siteConfig.name}'s website for personal, non-commercial use only.</p>
<h2>Disclaimer</h2><p>The materials on this website are provided on an 'as is' basis. ${siteConfig.name} makes no warranties, expressed or implied.</p>
<h2>Service Terms</h2><p>All construction and service agreements are subject to separate written contracts. Quotes provided through this website are estimates only and subject to change based on site conditions, material costs, and project specifications.</p>
<h2>Contact Us</h2><p>If you have questions about these Terms of Service, please contact us at ${siteConfig.email}.</p>
<div class="footer">${siteConfig.name} · ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.zip} · ${siteConfig.phone}</div>
</body></html>`;
}

function generateServiceAgreementHTML(): string {
  const serviceList = services.map(
    (s) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${s.title}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${s.startingPrice}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#666">${s.shortDescription}</td></tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Service Agreement Template — ${siteConfig.name}</title>
<style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.7}
h1{font-size:28px;margin-bottom:4px}h2{font-size:18px;margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:6px}
.meta{color:#888;font-size:13px;margin-bottom:32px}table{width:100%;border-collapse:collapse;margin:16px 0}
th{text-align:left;padding:8px 12px;background:#f5f5f0;border-bottom:2px solid #ddd;font-size:13px;text-transform:uppercase;letter-spacing:0.05em}
.sig{display:flex;gap:40px;margin-top:40px}.sig-line{flex:1;border-top:1px solid #1a1a1a;padding-top:6px;font-size:13px;color:#666}
.footer{margin-top:48px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#999}
.fill{border-bottom:1px dotted #999;min-width:200px;display:inline-block;margin:0 4px}
@media print{body{margin:0;padding:20px}}</style></head><body>
<h1>${siteConfig.name}</h1><p class="meta">Service Agreement Template · Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
<p>This Service Agreement ("Agreement") is entered into between <strong>${siteConfig.name}</strong> ("Provider") and <span class="fill">&nbsp;</span> ("Client") on <span class="fill">&nbsp;</span>.</p>
<h2>Scope of Services</h2>
<p>The Provider agrees to perform the following services as selected by the Client:</p>
<table><thead><tr><th>Service</th><th>Starting At</th><th>Description</th></tr></thead><tbody>${serviceList}</tbody></table>
<p><em>Check applicable services. Final pricing will be determined after on-site consultation.</em></p>
<h2>Payment Terms</h2><p>A deposit of 30% is required upon signing. Progress payments will be invoiced at agreed milestones. Final payment is due upon project completion and client walkthrough.</p>
<h2>Timeline</h2><p>Estimated project start: <span class="fill">&nbsp;</span><br/>Estimated completion: <span class="fill">&nbsp;</span><br/>Timeline is subject to weather, material availability, and permit processing.</p>
<h2>Warranties</h2><p>Provider warrants all workmanship for a period of 12 months from completion. Materials are covered under their respective manufacturer warranties.</p>
<h2>Signatures</h2>
<div class="sig"><div class="sig-line">Provider Signature / Date</div><div class="sig-line">Client Signature / Date</div></div>
<div class="footer">${siteConfig.name} · ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.zip} · ${siteConfig.phone}</div>
</body></html>`;
}

function generateCancellationHTML(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cancellation & Refund Policy — ${siteConfig.name}</title>
<style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.7}
h1{font-size:28px;margin-bottom:4px}h2{font-size:18px;margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:6px}
.meta{color:#888;font-size:13px;margin-bottom:32px}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#999}
ul{padding-left:20px}li{margin-bottom:6px}
table{width:100%;border-collapse:collapse;margin:16px 0}th{text-align:left;padding:8px 12px;background:#f5f5f0;border-bottom:2px solid #ddd;font-size:13px;text-transform:uppercase;letter-spacing:0.05em}
td{padding:8px 12px;border-bottom:1px solid #eee}
@media print{body{margin:0;padding:20px}}</style></head><body>
<h1>${siteConfig.name}</h1><p class="meta">Cancellation &amp; Refund Policy · Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>

<h2>Lesson Cancellations</h2>
<table><thead><tr><th>Notice Given</th><th>Outcome</th></tr></thead><tbody>
<tr><td>48+ hours</td><td>Full refund or free reschedule</td></tr>
<tr><td>24–48 hours</td><td>50% cancellation fee applies</td></tr>
<tr><td>Less than 24 hours</td><td>Full session fee charged</td></tr>
<tr><td>No-show</td><td>Full session fee charged</td></tr>
</tbody></table>
<p>Weather-related cancellations are handled on a case-by-case basis at the instructor's discretion. If we cancel due to unsafe conditions, you will receive a full credit toward a future session.</p>

<h2>Lesson Packages</h2>
<ul>
<li>Lesson packages (5-pack, 10-pack) are valid for 3 months from date of purchase.</li>
<li>Unused sessions are non-refundable after the 3-month validity period.</li>
<li>Packages may be transferred between family members with prior notice.</li>
</ul>

<h2>Construction Project Deposits</h2>
<ul>
<li>A 20% deposit is required upon acceptance of the quote to secure your project in our schedule.</li>
<li>Deposits are <strong>non-refundable</strong> once materials have been ordered or fabrication has commenced.</li>
<li>If the project is cancelled before materials are ordered, the deposit is refundable minus a 5% administration fee.</li>
</ul>

<h2>Construction Progress Payments</h2>
<ul>
<li>Progress payments are invoiced at agreed milestones as outlined in your Service Agreement.</li>
<li>Payments are due within 7 days of invoice.</li>
<li>Late payments may incur a 2% per month late fee.</li>
<li>Work may be paused if payments are more than 14 days overdue.</li>
</ul>

<h2>Refund Requests</h2>
<p>All refund requests must be submitted in writing to <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>. Refunds are processed within 10 business days of approval.</p>

<h2>Disputes</h2>
<p>If you are unsatisfied with any service, please contact us directly. We are committed to resolving issues promptly and fairly. All disputes are governed by the laws of the State of Victoria, Australia.</p>

<h2>Contact</h2>
<p>Email: ${siteConfig.email}<br/>Phone: ${siteConfig.phone}</p>
<div class="footer">${siteConfig.name} · ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.zip} · ${siteConfig.phone}</div>
</body></html>`;
}

const POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal information.",
    icon: Shield,
    generate: generatePrivacyHTML,
  },
  {
    id: "terms",
    title: "Terms of Service",
    description: "Website usage terms and conditions of engagement.",
    icon: ScrollText,
    generate: generateTermsHTML,
  },
  {
    id: "cancellation",
    title: "Cancellation & Refund Policy",
    description: "Lesson cancellation fees, deposit terms, and refund process.",
    icon: FileText,
    generate: generateCancellationHTML,
  },
  {
    id: "service-agreement",
    title: "Service Agreement Template",
    description: "Pre-filled agreement template with all services and pricing.",
    icon: FileText,
    generate: generateServiceAgreementHTML,
  },
];

function downloadAsHTML(doc: PolicyDocument) {
  const html = doc.generate();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  
  // Open in new window for print-to-PDF
  const win = window.open(url, "_blank");
  if (win) {
    win.addEventListener("afterprint", () => URL.revokeObjectURL(url));
  }
  // Cleanup after a delay if window wasn't opened
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function PolicyDownloadCenter() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  const handleDownload = (doc: PolicyDocument) => {
    downloadAsHTML(doc);
    setDownloaded((prev) => new Set(prev).add(doc.id));
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Download className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Document Center
          </h3>
          <p className="text-sm text-muted-foreground">
            Download policies &amp; agreement templates
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {POLICY_DOCUMENTS.map((doc, i) => {
          const Icon = doc.icon;
          const isDone = downloaded.has(doc.id);

          return (
            <button
              key={doc.id}
              onClick={() => handleDownload(doc)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all duration-300",
                "hover:border-accent/40 hover:shadow-sm group",
                isDone
                  ? "bg-accent/5 border-accent/30"
                  : "bg-background border-border"
              )}
              style={{
                transitionDelay: isVisible ? `${i * 80}ms` : "0ms",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-8px)",
                transition: "all 0.5s ease-out",
              }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isDone
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                )}
              >
                {isDone ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">
                  {doc.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {doc.description}
                </p>
              </div>
              <Download
                className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-300",
                  isDone
                    ? "text-accent"
                    : "text-muted-foreground group-hover:text-accent group-hover:-translate-y-0.5"
                )}
              />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Documents open in a new tab — use your browser's Print → Save as PDF.
      </p>
    </div>
  );
}
