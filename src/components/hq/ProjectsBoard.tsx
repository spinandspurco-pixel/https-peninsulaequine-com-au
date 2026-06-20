import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  code: string;
  name: string;
  location: string | null;
  build_type: string | null;
  status: string;
  priority: string;
  next_action: string | null;
  last_update: string | null;
  updated_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
  archived: "Archived",
};

export function ProjectsBoard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("managed_projects")
      .select("id, code, name, location, build_type, status, priority, next_action, last_update, updated_at")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.warn("[ProjectsBoard]", error);
        setProjects((data as Project[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-[12px] text-muted-foreground/45 italic">Loading projects…</p>;
  }

  if (projects.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground/45 italic">
        No managed projects yet. Convert an application or seed the demo dataset.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/10">
      {projects.map((p) => (
        <li key={p.id}>
          <button
            onClick={() => navigate(`/hq/projects/${p.id}`)}
            className="w-full text-left py-6 px-1 grid grid-cols-12 gap-4 items-baseline hover:bg-muted/10 transition-colors group"
          >
            <span className="col-span-12 sm:col-span-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent/55">
              {p.code}
            </span>
            <div className="col-span-12 sm:col-span-4">
              <p className="font-serif text-[17px] font-light text-foreground/95 group-hover:text-foreground transition-colors">
                {p.name}
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/45 mt-1">
                {p.location ?? "Location TBC"} · {p.build_type ?? "—"}
              </p>
            </div>
            <span className="col-span-6 sm:col-span-2 text-[11px] uppercase tracking-[0.18em] text-foreground/70">
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
            <div className="col-span-6 sm:col-span-3 text-[12px] text-muted-foreground/70 leading-snug">
              <p className="text-foreground/75">{p.next_action ?? "Awaiting next action"}</p>
              {p.last_update && (
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/40 mt-1">
                  {p.last_update}
                </p>
              )}
            </div>
            <span className="col-span-12 sm:col-span-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent/40 group-hover:text-accent/80 transition-colors sm:text-right">
              Open →
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
