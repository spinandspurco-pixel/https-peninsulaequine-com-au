import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HqNav } from "@/components/hq/HqNav";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { supabase } from "@/integrations/supabase/client";
import {
  listOpenSuggestions,
  acceptSuggestion,
  dismissSuggestion,
} from "@/lib/graph/edges";
import type { GraphEdge } from "@/lib/graph/types";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface ProjectCtx {
  id: string;
  code: string;
  name: string;
}
interface MediaCtx {
  id: string;
  title: string;
  storage_path: string | null;
  asset_type: string;
}

const RULE_LABEL: Record<string, string> = {
  filename_alias: "filename",
  project_tag: "tag",
  text_mention: "mention",
  legacy_column: "legacy link",
};

export default function HqReview() {
  const navigate = useNavigate();
  const { user, isAdmin, roles, loading: authLoading } = useAuth();
  const { isPreview } = useHqMode();
  const canWrite = isAdmin || roles.includes("moderator");

  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [projects, setProjects] = useState<Map<string, ProjectCtx>>(new Map());
  const [media, setMedia] = useState<Map<string, MediaCtx>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Needs Review | Peninsula Equine HQ";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const open = await listOpenSuggestions(200);
      setEdges(open);
      const projectIds = Array.from(new Set(open.filter((e) => e.from_type === "project").map((e) => e.from_id)));
      const mediaIds = Array.from(new Set(open.filter((e) => e.to_type === "media").map((e) => e.to_id)));
      const [projRes, mediaRes] = await Promise.all([
        projectIds.length
          ? supabase.from("managed_projects").select("id, code, name").in("id", projectIds)
          : Promise.resolve({ data: [], error: null } as { data: ProjectCtx[]; error: null }),
        mediaIds.length
          ? supabase
              .from("media_assets")
              .select("id, title, storage_path, asset_type")
              .in("id", mediaIds)
          : Promise.resolve({ data: [], error: null } as { data: MediaCtx[]; error: null }),
      ]);
      setProjects(new Map((projRes.data ?? []).map((p) => [p.id, p as ProjectCtx])));
      setMedia(new Map((mediaRes.data ?? []).map((m) => [m.id, m as MediaCtx])));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onAccept = async (edge: GraphEdge) => {
    if (!canWrite || isPreview) {
      toast.error("View-only");
      return;
    }
    setBusyId(edge.id);
    try {
      await acceptSuggestion(edge.id);
      setEdges((cur) => cur.filter((e) => e.id !== edge.id));
      toast.success("Verified");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  const onDismiss = async (edge: GraphEdge) => {
    if (!canWrite || isPreview) {
      toast.error("View-only");
      return;
    }
    setBusyId(edge.id);
    try {
      await dismissSuggestion(edge.id);
      setEdges((cur) => cur.filter((e) => e.id !== edge.id));
      toast.success("Dismissed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="bg-background text-foreground min-h-screen">
        <div className="section-container max-w-[1100px] pt-28 pb-24">
          <HqNav className="mb-12" />

          <header className="mb-10 flex items-baseline gap-5">
            <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">
              HQ / Review
            </span>
            <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
            <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">
              Knowledge Graph
            </span>
          </header>

          <div className="mb-12 max-w-2xl">
            <h1 className="font-serif text-[2.1rem] leading-tight text-foreground/95 mb-3 tracking-tight">
              Suggested attachments.
            </h1>
            <p className="text-[13px] text-muted-foreground/65 leading-relaxed">
              Relationships the system inferred from filenames, tags, and prose. Verify
              what reads true; dismiss what doesn't. Nothing here was auto-attached.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/45">
              Verify confirms the suggested project link · Dismiss hides it from review.
            </p>
            {!canWrite && (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55">
                View-only · admin or moderator role required to action.
              </p>
            )}
          </div>

          {loading ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/40">
              Loading the queue…
            </p>
          ) : edges.length === 0 ? (
            <div className="py-16 max-w-md border-t border-border/10">
              <p className="font-serif italic text-foreground/55 text-[1.05rem] leading-relaxed pt-8">
                The queue is clear. Every suggested attachment has been resolved.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/10 border-y border-border/10">
              {edges.map((edge) => {
                const proj = projects.get(edge.from_id);
                const med = media.get(edge.to_id);
                const busy = busyId === edge.id;
                return (
                  <li key={edge.id} className="py-6 grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-6 items-start">
                    <div className="space-y-2">
                      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/55">
                        {proj?.code ?? "—"} · {proj?.name ?? "Unknown project"}
                      </p>
                      <p className="font-serif text-[1.05rem] text-foreground/90 leading-snug">
                        {med?.title ?? edge.to_id}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/55">
                        {edge.to_type}
                        {med?.asset_type ? ` · ${med.asset_type}` : ""}
                        {edge.matched_rules.length > 0 && (
                          <>
                            {" · matched on "}
                            {edge.matched_rules.map((r) => RULE_LABEL[r] ?? r).join(", ")}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 sm:justify-end">
                      <button
                        type="button"
                        disabled={!canWrite || isPreview || busy}
                        onClick={() => onDismiss(edge)}
                        className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        disabled={!canWrite || isPreview || busy}
                        onClick={() => onAccept(edge)}
                        className="text-[10px] uppercase tracking-[0.28em] text-accent/80 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Verify →
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </Layout>
  );
}
