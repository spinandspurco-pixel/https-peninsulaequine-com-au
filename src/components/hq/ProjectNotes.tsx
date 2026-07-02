import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface StaffEntry {
  user_id: string;
  email: string;
  display_name: string;
}

interface NoteRow {
  id: string;
  project_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface MentionRow {
  id: string;
  note_id: string;
  mentioned_user_id: string;
}

const MENTION_RE = /@([a-z0-9][a-z0-9._-]{1,40})/gi;

function extractMentionTokens(body: string): string[] {
  const out = new Set<string>();
  for (const m of body.matchAll(MENTION_RE)) out.add(m[1].toLowerCase());
  return [...out];
}

function resolveMentions(tokens: string[], staff: StaffEntry[]): StaffEntry[] {
  if (!tokens.length) return [];
  const byHandle = new Map<string, StaffEntry>();
  for (const s of staff) {
    const handle = (s.display_name || s.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
    byHandle.set(handle, s);
    byHandle.set(s.email.split("@")[0].toLowerCase(), s);
  }
  const hits: StaffEntry[] = [];
  for (const t of tokens) {
    const s = byHandle.get(t);
    if (s && !hits.find((h) => h.user_id === s.user_id)) hits.push(s);
  }
  return hits;
}

function MentionedBody({ body, staff }: { body: string; staff: StaffEntry[] }) {
  const parts = body.split(MENTION_RE);
  // split returns [text, token, text, token, ...]
  return (
    <p className="text-[13px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
      {parts.map((seg, i) => {
        if (i % 2 === 1) {
          const match = resolveMentions([seg], staff)[0];
          return (
            <span
              key={i}
              className={`font-medium ${match ? "text-accent/90" : "text-muted-foreground/55"}`}
            >
              @{match ? match.display_name : seg}
            </span>
          );
        }
        return <span key={i}>{seg}</span>;
      })}
    </p>
  );
}

export function ProjectNotes({ projectId }: { projectId: string }) {
  const { user, isAdmin, roles } = useAuth();
  const { isPreview } = useHqMode();

  const canWrite = useMemo(
    () =>
      !isPreview &&
      (roles.includes("admin") || roles.includes("moderator") || roles.includes("employee")),
    [isPreview, roles]
  );

  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [mentions, setMentions] = useState<MentionRow[]>([]);
  const [staff, setStaff] = useState<StaffEntry[]>([]);
  const [authors, setAuthors] = useState<Map<string, StaffEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestQuery, setSuggestQuery] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  /* ── Initial load ─────────────────────────────────────── */
  const load = useCallback(async () => {
    if (isPreview) return;
    setLoading(true);
    const [notesRes, staffRes] = await Promise.all([
      supabase
        .from("project_notes")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase.rpc("list_staff_for_mentions"),
    ]);

    if (notesRes.error) toast.error(notesRes.error.message);
    if (staffRes.error) toast.error(staffRes.error.message);

    const noteList = (notesRes.data ?? []) as NoteRow[];
    const staffList = (staffRes.data ?? []) as StaffEntry[];
    setNotes(noteList);
    setStaff(staffList);

    const authorMap = new Map<string, StaffEntry>();
    for (const s of staffList) authorMap.set(s.user_id, s);
    setAuthors(authorMap);

    if (noteList.length) {
      const ids = noteList.map((n) => n.id);
      const { data: mRows } = await supabase
        .from("project_note_mentions")
        .select("id, note_id, mentioned_user_id")
        .in("note_id", ids);
      setMentions((mRows ?? []) as MentionRow[]);
    } else {
      setMentions([]);
    }
    setLoading(false);
  }, [isPreview, projectId]);

  useEffect(() => {
    if (isPreview) return;
    load();
  }, [isPreview, load]);

  /* ── @ suggestion ─────────────────────────────────────── */
  const onBodyChange = (v: string) => {
    setBody(v);
    const caret = taRef.current?.selectionStart ?? v.length;
    const upto = v.slice(0, caret);
    const m = upto.match(/@([a-z0-9._-]*)$/i);
    if (m) {
      setSuggestOpen(true);
      setSuggestQuery(m[1].toLowerCase());
    } else {
      setSuggestOpen(false);
    }
  };

  const insertMention = (s: StaffEntry) => {
    const handle = (s.display_name || s.email.split("@")[0]).replace(/\s+/g, "");
    const caret = taRef.current?.selectionStart ?? body.length;
    const before = body.slice(0, caret).replace(/@([a-z0-9._-]*)$/i, `@${handle} `);
    const after = body.slice(caret);
    const next = before + after;
    setBody(next);
    setSuggestOpen(false);
    requestAnimationFrame(() => {
      taRef.current?.focus();
      const pos = before.length;
      taRef.current?.setSelectionRange(pos, pos);
    });
  };

  const suggestions = useMemo(() => {
    if (!suggestOpen) return [];
    return staff
      .filter((s) => {
        const handle = (s.display_name || s.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
        return handle.startsWith(suggestQuery) || s.email.toLowerCase().includes(suggestQuery);
      })
      .slice(0, 6);
  }, [staff, suggestQuery, suggestOpen]);

  /* ── Hard guard: never render anything in client preview ── */
  if (isPreview) return null;

  /* ── Post note ────────────────────────────────────────── */
  const post = async () => {
    if (!user || !body.trim()) return;
    setPosting(true);
    const { data, error } = await supabase
      .from("project_notes")
      .insert({ project_id: projectId, author_id: user.id, body: body.trim() })
      .select("*")
      .single();

    if (error || !data) {
      toast.error(error?.message ?? "Could not post note");
      setPosting(false);
      return;
    }

    const tokens = extractMentionTokens(data.body);
    const mentioned = resolveMentions(tokens, staff);
    if (mentioned.length) {
      const { error: mErr } = await supabase
        .from("project_note_mentions")
        .insert(
          mentioned.map((s) => ({
            note_id: data.id,
            mentioned_user_id: s.user_id,
          }))
        );
      if (mErr) toast.error(`Note saved but mentions failed: ${mErr.message}`);
    }

    setBody("");
    setPosting(false);
    load();
  };

  /* ── Soft delete (admin only) ─────────────────────────── */
  const archive = async (id: string) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from("project_notes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {canWrite && (
        <div className="border border-border/20 bg-background/40 px-4 py-4 relative">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/45 mb-3">
            Add note · @ to mention
          </p>
          <textarea
            ref={taRef}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            rows={4}
            placeholder="Site conditions, conversations, blockers — visible to HQ staff only."
            className="w-full bg-transparent border border-border/20 px-3 py-2 text-[13px] text-foreground/90 leading-relaxed focus:border-accent/40 focus:outline-none transition-colors"
          />
          {suggestOpen && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 border border-border/30 bg-background shadow-lg max-w-xs">
              {suggestions.map((s) => (
                <button
                  key={s.user_id}
                  onClick={() => insertMention(s)}
                  className="w-full text-left px-3 py-2 text-[12px] text-foreground/85 hover:bg-accent/10 transition-colors"
                >
                  <span className="font-medium">@{s.display_name}</span>
                  <span className="text-muted-foreground/55 ml-2">{s.email}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
              Internal · not visible to clients
            </p>
            <button
              onClick={post}
              disabled={posting || !body.trim()}
              className="text-[10px] uppercase tracking-[0.22em] text-accent/80 hover:text-accent disabled:text-muted-foreground/30 transition-colors"
            >
              {posting ? "Posting…" : "Post note →"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground/55">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading notes…
        </div>
      ) : notes.length === 0 ? (
        <p className="text-[12px] text-muted-foreground/55 italic">
          No notes yet. {canWrite ? "Start the thread above." : "Read-only — speak with an admin to post."}
        </p>
      ) : (
        <ul className="space-y-6">
          {notes.map((n) => {
            const author = authors.get(n.author_id);
            const mentioned = mentions
              .filter((m) => m.note_id === n.id)
              .map((m) => authors.get(m.mentioned_user_id))
              .filter(Boolean) as StaffEntry[];
            return (
              <li key={n.id} className="border-l border-accent/15 pl-5">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/75">
                    {author?.display_name ?? "Unknown"}
                    <span className="text-muted-foreground/40 ml-3 normal-case tracking-[0.18em]">
                      {format(new Date(n.created_at), "d MMM · HH:mm")}
                    </span>
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => archive(n.id)}
                      title="Archive note (admin)"
                      className="text-muted-foreground/35 hover:text-rose-400/70 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <MentionedBody body={n.body} staff={staff} />
                {mentioned.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mentioned.map((m) => (
                      <span
                        key={m.user_id}
                        className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent/65 border border-accent/25 px-2 py-[3px]"
                      >
                        notified · {m.display_name}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
