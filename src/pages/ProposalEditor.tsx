import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, RefreshCw, Trash2, Plus } from "lucide-react";

interface ScopeItem {
  phase: string;
  description: string;
}

interface ProposalDraft {
  id: string;
  proposal_ref: string;
  inquiry_id: string | null;
  client_name: string;
  client_email: string | null;
  property_name: string | null;
  location: string | null;
  project_type: string | null;
  project_size: string | null;
  proposal_date: string;
  overview: string | null;
  system_notes: string | null;
  layout_notes: string | null;
  scope_items: ScopeItem[];
  investment_total: string | null;
  investment_note: string | null;
  attachment_urls: string[] | null;
  status: string;
}

export default function ProposalEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [draft, setDraft] = useState<ProposalDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("groundlock_proposals")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Proposal not found");
        navigate("/admin");
        return;
      }
      // Parse scope_items from JSONB
      const scopeItems = Array.isArray(data.scope_items)
        ? (data.scope_items as unknown as ScopeItem[])
        : [];
      setDraft({ ...data, scope_items: scopeItems } as ProposalDraft);
      setLoading(false);
    })();
  }, [id, navigate]);

  const update = <K extends keyof ProposalDraft>(key: K, value: ProposalDraft[K]) => {
    setDraft((d) => d ? { ...d, [key]: value } : d);
  };

  const updateScope = (idx: number, field: keyof ScopeItem, value: string) => {
    if (!draft) return;
    const items = [...draft.scope_items];
    items[idx] = { ...items[idx], [field]: value };
    update("scope_items", items);
  };

  const addScopeItem = () => {
    if (!draft) return;
    update("scope_items", [...draft.scope_items, { phase: "", description: "" }]);
  };

  const removeScopeItem = (idx: number) => {
    if (!draft) return;
    update("scope_items", draft.scope_items.filter((_, i) => i !== idx));
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await supabase
      .from("groundlock_proposals")
      .update({
        client_name: draft.client_name,
        client_email: draft.client_email,
        property_name: draft.property_name,
        location: draft.location,
        project_type: draft.project_type,
        project_size: draft.project_size,
        overview: draft.overview,
        system_notes: draft.system_notes,
        layout_notes: draft.layout_notes,
        scope_items: draft.scope_items as unknown as any,
        investment_total: draft.investment_total,
        investment_note: draft.investment_note,
        status: draft.status,
      })
      .eq("id", draft.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Proposal saved");
    }
  };

  const preview = () => {
    if (!draft) return;
    // Open proposal template with draft data via query params
    const params = new URLSearchParams({ proposalId: draft.id });
    window.open(`/proposal?${params.toString()}`, "_blank");
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
        </div>
      </Layout>
    );
  }

  if (!draft) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="pt-32 sm:pt-40 pb-8">
          <div className="max-w-4xl mx-auto px-6">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 hover:text-foreground/70 transition-opacity duration-300 mb-6"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to HQ
            </button>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40 mb-2">
                  {draft.proposal_ref}
                </p>
                <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground tracking-tight">
                  GroundLock Proposal Editor
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={preview} className="gap-2 text-xs">
                  <Eye className="w-3 h-3" />
                  Preview
                </Button>
                <Button size="sm" onClick={save} disabled={saving} className="gap-2 text-xs">
                  <Save className="w-3 h-3" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-4 mt-4">
              <span className={`text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full ${
                draft.status === "draft"
                  ? "bg-amber-500/10 text-amber-400"
                  : draft.status === "sent"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {draft.status}
              </span>
              <p className="text-[11px] text-muted-foreground/40">
                for {draft.client_name}
              </p>
            </div>
          </div>
        </header>

        {/* Editor sections */}
        <div className="max-w-4xl mx-auto px-6 pb-24 space-y-12">

          {/* Cover details */}
          <EditorSection title="Cover Details" number="01">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Client Name" value={draft.client_name} onChange={(v) => update("client_name", v)} />
              <Field label="Client Email" value={draft.client_email || ""} onChange={(v) => update("client_email", v)} />
              <Field label="Property Name" value={draft.property_name || ""} onChange={(v) => update("property_name", v)} />
              <Field label="Location" value={draft.location || ""} onChange={(v) => update("location", v)} />
              <Field label="Project Type" value={draft.project_type || ""} onChange={(v) => update("project_type", v)} />
              <Field label="Project Size" value={draft.project_size || ""} onChange={(v) => update("project_size", v)} />
            </div>
          </EditorSection>

          {/* Project Overview */}
          <EditorSection title="Project Overview" number="02">
            <TextAreaField
              label="Overview"
              value={draft.overview || ""}
              onChange={(v) => update("overview", v)}
              rows={6}
              hint="Two paragraphs. Separated by a blank line."
            />
          </EditorSection>

          {/* The GroundLock System */}
          <EditorSection title="The GroundLock System" number="03">
            <TextAreaField
              label="System Notes (optional)"
              value={draft.system_notes || ""}
              onChange={(v) => update("system_notes", v)}
              rows={3}
              hint="Additional notes about the system specific to this project."
            />
          </EditorSection>

          {/* Proposed Layout */}
          <EditorSection title="Proposed Layout" number="04">
            <TextAreaField
              label="Layout Notes"
              value={draft.layout_notes || ""}
              onChange={(v) => update("layout_notes", v)}
              rows={3}
              hint="Describe the proposed layout approach for the client's site."
            />
            {draft.attachment_urls && draft.attachment_urls.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-2">
                  Client Attachments ({draft.attachment_urls.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {draft.attachment_urls.map((url, i) => (
                    <span key={i} className="text-[11px] text-accent/60 bg-accent/5 px-3 py-1 rounded">
                      {url.split("/").pop()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </EditorSection>

          {/* Scope of Work */}
          <EditorSection title="Scope of Work" number="05">
            <div className="space-y-6">
              {draft.scope_items.map((item, i) => (
                <div key={i} className="relative group p-5 rounded-lg" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono text-accent/35">Phase {String(i + 1).padStart(2, "0")}</span>
                    <button onClick={() => removeScopeItem(i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3 text-destructive/50" />
                    </button>
                  </div>
                  <Field label="Phase Name" value={item.phase} onChange={(v) => updateScope(i, "phase", v)} />
                  <div className="mt-3">
                    <TextAreaField label="Description" value={item.description} onChange={(v) => updateScope(i, "description", v)} rows={2} />
                  </div>
                </div>
              ))}
              <button
                onClick={addScopeItem}
                className="flex items-center gap-2 text-[11px] text-accent/50 hover:text-accent transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Phase
              </button>
            </div>
          </EditorSection>

          {/* Investment */}
          <EditorSection title="Investment" number="06">
            <Field label="Total Investment" value={draft.investment_total || ""} onChange={(v) => update("investment_total", v)} />
            <div className="mt-4">
              <TextAreaField
                label="Investment Note"
                value={draft.investment_note || ""}
                onChange={(v) => update("investment_note", v)}
                rows={2}
              />
            </div>
          </EditorSection>

          {/* Actions */}
          <div className="flex items-center justify-between pt-8" style={{ borderTop: "1px solid hsl(var(--border))" }}>
            <select
              value={draft.status}
              onChange={(e) => update("status", e.target.value)}
              className="bg-transparent text-[11px] text-muted-foreground/60 border border-border/30 rounded px-3 py-1.5"
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready to Send</option>
              <option value="sent">Sent</option>
            </select>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={preview} className="gap-2 text-xs">
                <Eye className="w-3 h-3" /> Preview
              </Button>
              <Button size="sm" onClick={save} disabled={saving} className="gap-2 text-xs">
                <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Reusable editor sub-components ─── */

function EditorSection({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <section className="pt-8" style={{ borderTop: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-[9px] text-accent/30">{number}</span>
        <h2 className="font-serif text-lg font-light text-foreground/80">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1.5 block">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-border/30 text-foreground/70 text-sm"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 4, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1.5 block">{label}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="bg-transparent border-border/30 text-foreground/70 text-sm resize-y"
      />
      {hint && <p className="text-[10px] text-muted-foreground/25 mt-1">{hint}</p>}
    </div>
  );
}
