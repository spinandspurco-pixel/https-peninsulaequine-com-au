import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Check, RefreshCw, Mail, Phone, Calendar, MessageSquare, Inbox } from "lucide-react";
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
    <div className="relative">
      {/* Architectural grid texture behind list */}
      <div className="absolute inset-0 engineering-grid pointer-events-none opacity-40" />

      {/* Filter bar — minimal, architectural */}
      <div className="flex items-baseline justify-between mb-10 relative">
        <div className="flex items-baseline gap-6">
          <button
            onClick={() => setFilter("unread")}
            className={`text-[10px] uppercase tracking-[0.3em] transition-colors duration-500 ${
              filter === "unread"
                ? "text-foreground/90"
                : "text-muted-foreground/30 hover:text-foreground/60"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 font-mono text-[9px] tracking-[0.2em] text-accent/70">
                {String(unreadCount).padStart(2, "0")}
              </span>
            )}
          </button>

          <div className="w-8 h-px bg-gradient-to-r from-accent/20 to-transparent" />

          <button
            onClick={() => setFilter("all")}
            className={`text-[10px] uppercase tracking-[0.3em] transition-colors duration-500 ${
              filter === "all"
                ? "text-foreground/90"
                : "text-muted-foreground/30 hover:text-foreground/60"
            }`}
          >
            Archive
            <span className="ml-2 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/25">
              {String(items.length).padStart(2, "0")}
            </span>
          </button>
        </div>

        <button
          onClick={load}
          className="text-muted-foreground/25 hover:text-accent/70 transition-colors duration-500"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Empty states */}
      {loading && items.length === 0 ? (
        <div className="py-20 relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/25 text-center">
            Loading enquiries…
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-20 relative">
          <div className="flex flex-col items-center gap-4">
            <Inbox className="h-5 w-5 text-muted-foreground/15" strokeWidth={1} />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/25 text-center">
              {filter === "unread" ? "All enquiries reviewed" : "No enquiries yet"}
            </p>
          </div>
        </div>
      ) : (
        <ul className="relative">
          {visible.map((i, idx) => {
            const unread = i.status === "new";
            return (
              <li
                key={i.id}
                className={`group relative pb-8 pt-6 ${idx > 0 ? "border-t border-border/[0.07]" : ""}`}
              >
                {/* Unread accent thread */}
                {unread && (
                  <div className="absolute left-0 top-6 bottom-8 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent" />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-12">
                  {/* Left: identity + details */}
                  <div className={unread ? "pl-5" : "pl-0"}>
                    {/* Name + timestamp row */}
                    <div className="flex items-baseline gap-4 mb-3">
                      <h3
                        className={`font-serif text-[17px] leading-tight tracking-wide transition-colors duration-700 ${
                          unread ? "text-foreground/95" : "text-foreground/40"
                        }`}
                      >
                        {i.name}
                      </h3>
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/25">
                        {format(new Date(i.created_at), "d MMM yyyy")}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/20">
                        {format(new Date(i.created_at), "HH:mm")}
                      </span>
                    </div>

                    {/* Contact metadata — architectural spec-line style */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
                      <a
                        href={`mailto:${i.email}`}
                        className={`inline-flex items-center gap-1.5 transition-colors duration-500 hover:text-accent/80 ${
                          unread ? "text-muted-foreground/55" : "text-muted-foreground/30"
                        }`}
                      >
                        <Mail className="h-3 w-3" />
                        <span className="font-light">{i.email}</span>
                      </a>

                      {i.phone && (
                        <a
                          href={`tel:${i.phone}`}
                          className={`inline-flex items-center gap-1.5 transition-colors duration-500 hover:text-accent/80 ${
                            unread ? "text-muted-foreground/55" : "text-muted-foreground/30"
                          }`}
                        >
                          <Phone className="h-3 w-3" />
                          <span className="font-light">{i.phone}</span>
                        </a>
                      )}

                      {i.preferred_start && (
                        <span
                          className={`inline-flex items-center gap-1.5 ${
                            unread ? "text-muted-foreground/55" : "text-muted-foreground/30"
                          }`}
                        >
                          <Calendar className="h-3 w-3" />
                          <span className="font-light">{i.preferred_start}</span>
                        </span>
                      )}
                    </div>

                    {/* Project vision preview */}
                    {i.project_vision && (
                      <div className="mt-4 flex items-start gap-2 max-w-xl">
                        <MessageSquare
                          className={`h-3 w-3 mt-0.5 shrink-0 ${
                            unread ? "text-accent/40" : "text-muted-foreground/15"
                          }`}
                        />
                        <p
                          className={`text-[12px] leading-relaxed font-light ${
                            unread ? "text-foreground/45" : "text-foreground/25"
                          }`}
                        >
                          {i.project_vision}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: action */}
                  <div className="flex items-start justify-end lg:pt-1">
                    {unread ? (
                      <button
                        onClick={() => markRead(i.id)}
                        className="group/btn flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/30 hover:text-accent/80 transition-all duration-500"
                        title="Mark as reviewed"
                      >
                        <span className="w-4 h-px bg-muted-foreground/20 group-hover/btn:bg-accent/50 transition-colors duration-500" />
                        <span className="font-light">Reviewed</span>
                        <Check className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/20">
                        <span className="w-4 h-px bg-muted-foreground/10" />
                        <span className="font-light">Reviewed</span>
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
