import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { format } from "date-fns";
import { AtSign } from "lucide-react";

interface MentionPreview {
  id: string;
  note_id: string;
  read_at: string | null;
  created_at: string;
  note: {
    id: string;
    body: string;
    author_id: string;
    project_id: string;
    created_at: string;
    project: { id: string; name: string; code: string } | null;
  } | null;
}

/**
 * Compact card for HQ Overview showing the signed-in staff member's
 * unread @mentions across all projects. Hidden in client-preview mode.
 */
export function MentionsCard() {
  const { user } = useAuth();
  const { isPreview } = useHqMode();
  const navigate = useNavigate();
  const [items, setItems] = useState<MentionPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || isPreview) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("project_note_mentions")
        .select(
          `id, note_id, read_at, created_at,
           note:project_notes!inner (
             id, body, author_id, project_id, created_at,
             project:managed_projects!inner ( id, name, code )
           )`
        )
        .eq("mentioned_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!cancelled) {
        setItems((data ?? []) as unknown as MentionPreview[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isPreview]);

  if (isPreview) return null;

  const unread = items.filter((m) => !m.read_at).length;
  const latest = items.slice(0, 3);

  const markRead = async (mentionId: string) => {
    await supabase
      .from("project_note_mentions")
      .update({ read_at: new Date().toISOString() })
      .eq("id", mentionId);
    setItems((prev) =>
      prev.map((m) => (m.id === mentionId ? { ...m, read_at: new Date().toISOString() } : m))
    );
  };

  return (
    <div className="border border-border/15 bg-background/40 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AtSign className="h-3.5 w-3.5 text-accent/70" />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Mentions
          </p>
        </div>
        {unread > 0 && (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-amber-300/85 border border-amber-300/30 bg-amber-300/5 px-2 py-[3px]">
            {unread} unread
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-[12px] text-muted-foreground/45 italic">Loading…</p>
      ) : latest.length === 0 ? (
        <p className="text-[12px] text-muted-foreground/55 italic">
          You haven't been mentioned in any project notes.
        </p>
      ) : (
        <ul className="space-y-4">
          {latest.map((m) => {
            const projectName = m.note?.project?.name ?? "Project";
            const projectId = m.note?.project_id;
            const snippet =
              m.note && m.note.body.length > 120 ? `${m.note.body.slice(0, 120)}…` : m.note?.body ?? "";
            return (
              <li key={m.id}>
                <button
                  onClick={() => {
                    if (!m.read_at) markRead(m.id);
                    if (projectId) navigate(`/hq/projects/${projectId}`);
                  }}
                  className="text-left w-full group"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent/70 group-hover:text-accent transition-colors">
                    {projectName}
                    <span className="text-muted-foreground/40 ml-3 normal-case tracking-[0.18em]">
                      {format(new Date(m.created_at), "d MMM · HH:mm")}
                    </span>
                    {!m.read_at && (
                      <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-300/80" />
                    )}
                  </p>
                  <p className="text-[12px] text-foreground/75 leading-relaxed mt-1 line-clamp-2">
                    {snippet}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
