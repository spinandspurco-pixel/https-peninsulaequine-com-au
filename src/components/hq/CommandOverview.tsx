import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHqMode } from "@/hooks/useHqMode";
import { format, formatDistanceToNow } from "date-fns";

interface Metric {
  label: string;
  value: number | string;
  hint?: string;
}

interface ActivityRow {
  id: string;
  title: string;
  action_type: string;
  entity_type: string | null;
  created_at: string;
}


const SKELETON = "—";

export function CommandOverview() {
  const navigate = useNavigate();
  const { isPreview } = useHqMode();
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Active projects", value: SKELETON },
    { label: "New enquiries", value: SKELETON, hint: "last 7 days" },
    { label: "Site visits booked", value: SKELETON },
    { label: "Proposals sent", value: SKELETON },
    { label: "In-progress builds", value: SKELETON },
    { label: "Completed projects", value: SKELETON, hint: "this quarter" },
  ]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const since7 = new Date(Date.now() - 7 * 86400_000).toISOString();
      const sinceQ = new Date(Date.now() - 90 * 86400_000).toISOString();

      const [
        activeProjects,
        newEnquiries,
        siteVisits,
        proposals,
        inProgress,
        completed,
        activityLog,
        managedActive,
      ] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase
          .from("inquiries")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7),
        supabase
          .from("site_assessments")
          .select("id", { count: "exact", head: true })
          .gte("preferred_date", new Date().toISOString().slice(0, 10)),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "sent"),
        supabase
          .from("managed_projects")
          .select("id", { count: "exact", head: true })
          .eq("status", "in_progress"),
        supabase
          .from("managed_projects")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("updated_at", sinceQ),
        supabase
          .from("activity_log")
          .select("id, title, action_type, entity_type, created_at")
          .order("created_at", { ascending: false })
          .limit(8),

        supabase.from("managed_projects").select("id", { count: "exact", head: true }),
      ]);

      if (cancelled) return;

      setMetrics([
        { label: "Active projects", value: (activeProjects.count ?? managedActive.count) ?? 0 },
        { label: "New enquiries", value: newEnquiries.count ?? 0, hint: "last 7 days" },
        { label: "Site visits booked", value: siteVisits.count ?? 0 },
        { label: "Proposals sent", value: proposals.count ?? 0 },
        { label: "In-progress builds", value: inProgress.count ?? 0 },
        { label: "Completed projects", value: completed.count ?? 0, hint: "this quarter" },
      ]);
      setActivity(activityLog.data ?? []);
    };

    load().catch((err) => console.warn("[CommandOverview] load failed", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const quickActions = [
    { label: "New enquiry", action: () => navigate("/contact"), locked: false },
    { label: "Create quote", action: () => navigate("/hq?compose=quote"), locked: isPreview },
    {
      label: "Log site visit",
      action: () =>
        document.getElementById("zone-pipeline")?.scrollIntoView({ behavior: "smooth" }),
      locked: false,
    },
    {
      label: "Open pipeline",
      action: () =>
        document.getElementById("zone-pipeline")?.scrollIntoView({ behavior: "smooth" }),
      locked: false,
    },
    {
      label: "Open applications",
      action: () =>
        document.getElementById("zone-applications")?.scrollIntoView({ behavior: "smooth" }),
      locked: false,
    },
  ];

  return (
    <div className="space-y-14">
      {/* Metrics manifest strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`px-5 py-6 border-border/10 ${
              i % 2 === 0 ? "border-r" : "lg:border-r"
            } ${i < 3 ? "border-b lg:border-b-0" : ""} ${
              i === metrics.length - 1 ? "border-r-0" : ""
            }`}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-3">
              {m.label}
            </p>
            <p className="font-serif text-3xl font-light text-foreground/95 leading-none">
              {m.value}
            </p>
            {m.hint && (
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/40 mt-2">
                {m.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-12 lg:gap-20">
        {/* Activity feed */}
        <div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40">
              Activity
            </span>
            <span className="text-[10px] text-muted-foreground/35">
              {activity.length ? `Last ${activity.length}` : ""}
            </span>
          </div>

          {activity.length === 0 ? (
            <p className="text-[12px] text-muted-foreground/45 italic">
              No recorded activity yet. New enquiries and quotes will appear here.
            </p>
          ) : (
            <ul className="space-y-px border-l border-accent/15 pl-6">
              {activity.map((row) => (
                <li key={row.id} className="py-3 group">
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="text-[13px] text-foreground/85 font-light leading-relaxed">
                      {row.title}
                      {row.entity_type && (
                        <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent/45">
                          {row.entity_type}
                        </span>
                      )}
                    </p>
                    <time
                      dateTime={row.created_at}
                      title={format(new Date(row.created_at), "PPpp")}
                      className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/40 whitespace-nowrap"
                    >
                      {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions rail */}
        <div className="lg:w-48">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">
            Quick actions
          </p>
          <ul className="space-y-3">
            {quickActions.map((a) => (
              <li key={a.label}>
                <button
                  onClick={a.action}
                  disabled={a.locked}
                  className="text-[12px] text-foreground/75 hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-left"
                >
                  → {a.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
