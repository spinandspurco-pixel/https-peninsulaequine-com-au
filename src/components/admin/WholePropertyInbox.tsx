import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Check, RefreshCw, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_start: string | null;
  project_vision: string | null;
  status: string;
  created_at: string;
}

export function WholePropertyInbox() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"unread" | "all">("unread");

  const load = useCallback(async () => {
    setLoading(true);
    const query = supabase
      .from("inquiries")
      .select("id,name,email,phone,preferred_start,project_vision,status,created_at")
      .contains("services", ["whole-property-planning"])
      .order("created_at", { ascending: false })
      .limit(50);
    const { data, error } = await query;
    setLoading(false);
    if (error) {
      toast.error("Couldn't load enquiries.");
      return;
    }
    setItems((data ?? []) as Inquiry[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    const prev = items;
    setItems((s) => s.map((i) => (i.id === id ? { ...i, status: "reviewed" } : i)));
    const { error } = await supabase
      .from("inquiries")
      .update({ status: "reviewed" })
      .eq("id", id);
    if (error) {
      setItems(prev);
      toast.error("Couldn't mark as read.");
    }
  };

  const visible = items.filter((i) => (filter === "unread" ? i.status === "new" : true));
  const unreadCount = items.filter((i) => i.status === "new").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter("unread")}
            className={`text-[11px] uppercase tracking-[0.18em] transition-colors ${
              filter === "unread" ? "text-foreground" : "text-muted-foreground/40 hover:text-foreground/70"
            }`}
          >
            Unread {unreadCount > 0 && <span className="ml-1 text-accent">({unreadCount})</span>}
          </button>
          <span className="text-muted-foreground/20">·</span>
          <button
            onClick={() => setFilter("all")}
            className={`text-[11px] uppercase tracking-[0.18em] transition-colors ${
              filter === "all" ? "text-foreground" : "text-muted-foreground/40 hover:text-foreground/70"
            }`}
          >
            All ({items.length})
          </button>
        </div>
        <button
          onClick={load}
          className="text-muted-foreground/40 hover:text-foreground/70 transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && items.length === 0 ? (
        <p className="text-[12px] text-muted-foreground/50 py-8">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-[12px] text-muted-foreground/50 py-8">
          {filter === "unread" ? "No unread enquiries." : "No enquiries yet."}
        </p>
      ) : (
        <ul className="divide-y divide-border/10">
          {visible.map((i) => {
            const unread = i.status === "new";
            return (
              <li key={i.id} className="py-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    {unread && <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />}
                    <p className={`font-serif text-[15px] ${unread ? "text-foreground" : "text-foreground/60"}`}>
                      {i.name}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                      {format(new Date(i.created_at), "d MMM, HH:mm")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-muted-foreground/60 pl-4">
                    <a
                      href={`mailto:${i.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      {i.email}
                    </a>
                    {i.phone && (
                      <a
                        href={`tel:${i.phone}`}
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        {i.phone}
                      </a>
                    )}
                    {i.preferred_start && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {i.preferred_start}
                      </span>
                    )}
                  </div>
                </div>
                {unread && (
                  <button
                    onClick={() => markRead(i.id)}
                    className="self-start inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Mark read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
