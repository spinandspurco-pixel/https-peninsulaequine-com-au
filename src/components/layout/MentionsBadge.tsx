import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";

/**
 * Tiny mentions indicator for the slim HqHeader.
 * - Hidden for client-preview users.
 * - Shows unread @mention count for the signed-in staff member.
 * - Zero state: subtle inactive icon (no count).
 * - Click → /hq#mentions (MentionsCard on the Overview).
 */
export function MentionsBadge() {
  const { user } = useAuth();
  const { isPreview } = useHqMode();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    if (!user || isPreview) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("project_note_mentions")
        .select("id", { count: "exact", head: true })
        .eq("mentioned_user_id", user.id)
        .is("read_at", null);
      if (!cancelled && typeof count === "number") setUnread(count);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isPreview]);

  if (!user || isPreview) return null;

  const active = unread > 0;

  return (
    <Link
      to="/hq#mentions"
      aria-label={active ? `${unread} unread mentions` : "No unread mentions"}
      title={active ? `${unread} unread mention${unread === 1 ? "" : "s"}` : "No unread mentions"}
      className={`hidden sm:inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] transition-colors ${
        active
          ? "text-amber-300/90 hover:text-amber-200"
          : "text-muted-foreground/30 hover:text-muted-foreground/60"
      }`}
    >
      <AtSign className="h-3 w-3" />
      {active && <span>{unread}</span>}
    </Link>
  );
}
