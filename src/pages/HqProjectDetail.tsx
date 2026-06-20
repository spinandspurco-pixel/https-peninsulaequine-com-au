import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { HqPreviewBanner } from "@/components/hq/HqPreviewBanner";
import { WriteGuard } from "@/components/hq/WriteGuard";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Project {
  id: string;
  code: string;
  name: string;
  location: string | null;
  build_type: string | null;
  status: string;
  priority: string;
  scope: string | null;
  internal_notes: string | null;
  client_summary: string | null;
  next_action: string | null;
  last_update: string | null;
  hero_image: string | null;
  updated_at: string;
}

const TABS = [
  { key: "status", label: "Status" },
  { key: "scope", label: "Scope" },
  { key: "notes", label: "Notes" },
  { key: "gallery", label: "Gallery" },
  { key: "timeline", label: "Internal Timeline" },
  { key: "summary", label: "Client Summary" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function HqProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { isPreview } = useHqMode();
  const [tab, setTab] = useState<TabKey>("status");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Partial<Project>>({});
  const [activity, setActivity] = useState<{ id: string; title: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isPreview))) navigate("/login");
  }, [user, isAdmin, isPreview, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([
      supabase.from("managed_projects").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("activity_log")
        .select("id, title, created_at")
        .eq("entity_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]).then(([proj, log]) => {
      if (cancelled) return;
      setProject(proj.data as Project | null);
      setDraft(proj.data ?? {});
      setActivity(log.data ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const save = async (patch: Partial<Project>) => {
    if (!project) return;
    if (isPreview) {
      toast.error("View-only in client preview");
      return;
    }
    const { error } = await supabase
      .from("managed_projects")
      .update(patch)
      .eq("id", project.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    setProject({ ...project, ...patch });
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-6 pt-40 pb-24 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/50 mb-4">
            Not found
          </p>
          <h1 className="font-serif text-3xl font-light text-foreground/90">No project at this code.</h1>
          <button
            onClick={() => navigate("/hq")}
            className="mt-8 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/55 hover:text-foreground"
          >
            ← Back to HQ
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HqPreviewBanner />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="pt-32 sm:pt-40 pb-10">
          <div className="max-w-5xl mx-auto px-6">
            <button
              onClick={() => navigate("/hq")}
              className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hover:text-foreground mb-6"
            >
              ← HQ · Projects
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-4">
              {project.code} · {project.priority}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-foreground tracking-tight">
              {project.name}
            </h1>
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground/55 mt-4">
              {project.location ?? "Location TBC"} · {project.build_type ?? "—"} · {project.status}
            </p>
          </div>
        </header>

        {/* Tab rail */}
        <nav className="border-y border-border/10 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-8 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${
                  tab === t.key ? "text-foreground" : "text-muted-foreground/45 hover:text-foreground/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <section className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-10">
          {tab === "status" && (
            <div className="space-y-8">
              <Field label="Status">
                <WriteGuard>
                  <select
                    defaultValue={project.status}
                    onChange={(e) => save({ status: e.target.value })}
                    className="bg-transparent border border-border/30 px-3 py-2 text-[13px] text-foreground/90 focus:border-accent/40 focus:outline-none"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="archived">Archived</option>
                  </select>
                </WriteGuard>
              </Field>
              <Field label="Priority">
                <p className="text-[14px] text-foreground/85">{project.priority}</p>
              </Field>
              <Field label="Next action">
                <Editable
                  value={draft.next_action ?? ""}
                  onChange={(v) => setDraft({ ...draft, next_action: v })}
                  onSave={() => save({ next_action: draft.next_action })}
                  placeholder="What needs to happen next?"
                />
              </Field>
              <Field label="Last update">
                <Editable
                  value={draft.last_update ?? ""}
                  onChange={(v) => setDraft({ ...draft, last_update: v })}
                  onSave={() => save({ last_update: draft.last_update })}
                  placeholder="Most recent field note"
                />
              </Field>
            </div>
          )}

          {tab === "scope" && (
            <Field label="Scope summary">
              <Editable
                multiline
                value={draft.scope ?? ""}
                onChange={(v) => setDraft({ ...draft, scope: v })}
                onSave={() => save({ scope: draft.scope })}
                placeholder="What this build delivers."
              />
            </Field>
          )}

          {tab === "notes" && (
            <Field label="Internal notes" hint="Visible only to HQ staff">
              <Editable
                multiline
                value={draft.internal_notes ?? ""}
                onChange={(v) => setDraft({ ...draft, internal_notes: v })}
                onSave={() => save({ internal_notes: draft.internal_notes })}
                placeholder="Site conditions, conversations, blockers."
              />
            </Field>
          )}

          {tab === "gallery" && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-4">
                Hero image URL
              </p>
              <Editable
                value={draft.hero_image ?? ""}
                onChange={(v) => setDraft({ ...draft, hero_image: v })}
                onSave={() => save({ hero_image: draft.hero_image })}
                placeholder="/src/assets/…"
              />
              {project.hero_image && (
                <div className="mt-8 border border-border/20">
                  <img
                    src={project.hero_image}
                    alt={project.name}
                    className="w-full"
                    style={{ filter: "brightness(0.85) contrast(1.1) saturate(0.8)" }}
                  />
                </div>
              )}
            </div>
          )}

          {tab === "timeline" && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">
                Internal timeline
              </p>
              {activity.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/45 italic">
                  No activity recorded yet for this project.
                </p>
              ) : (
                <ul className="border-l border-accent/15 pl-6 space-y-4">
                  {activity.map((a) => (
                    <li key={a.id} className="text-[13px] text-foreground/80">
                      <p>{a.title}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">
                        {format(new Date(a.created_at), "d MMM yyyy · HH:mm")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "summary" && (
            <Field
              label="Client-facing summary"
              hint="Visible in Client Portal — write in finished prose."
            >
              <Editable
                multiline
                value={draft.client_summary ?? ""}
                onChange={(v) => setDraft({ ...draft, client_summary: v })}
                onSave={() => save({ client_summary: draft.client_summary })}
                placeholder="One paragraph the client will read."
              />
            </Field>
          )}
        </section>
      </div>
    </Layout>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/45">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground/45 italic">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Editable({
  value,
  onChange,
  onSave,
  multiline,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <WriteGuard>
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder={placeholder}
            className="w-full bg-transparent border border-border/30 px-3 py-2 text-[14px] text-foreground/90 leading-relaxed focus:border-accent/40 focus:outline-none transition-colors"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border border-border/30 px-3 py-2 text-[14px] text-foreground/90 focus:border-accent/40 focus:outline-none transition-colors"
          />
        )}
        <button
          onClick={onSave}
          className="text-[10px] uppercase tracking-[0.22em] text-accent/70 hover:text-accent transition-colors"
        >
          Save →
        </button>
      </div>
    </WriteGuard>
  );
}
