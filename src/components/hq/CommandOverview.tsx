import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHqMode } from "@/hooks/useHqMode";
import { useAuth } from "@/hooks/useAuth";
import { format, formatDistanceToNow } from "date-fns";
import { useHqMount, withHqTimeout } from "@/lib/hqDiagnostics";
import { MentionsCard } from "@/components/hq/MentionsCard";

// ──────────────────────────────────────────────────────────────────────────────
// Command Centre
// Cinematic "site office" — calm density, blueprint restraint, living signal.
// Morning Brief is the hero; everything below is supporting instrumentation.
// ──────────────────────────────────────────────────────────────────────────────

interface ActivityRow {
  id: string;
  title: string;
  action_type: string;
  entity_type: string | null;
  created_at: string;
}

interface SpotlightProject {
  id: string;
  code: string | null;
  name: string;
  location: string | null;
  status: string | null;
  next_action: string | null;
  last_update: string | null;
  updated_at: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
}

interface Signal {
  enquiries7: number;
  activeProjects: number;
  totalProjects: number;
  proposalsOut: number;
  siteVisits: number;
  completedQ: number;
}

const JOSH_EMAIL = "josh.dales@peninsulaequine.systems";
const SKELETON = "—";

const greetingFor = (hour: number) => {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Late shift";
};

const humanNameFrom = (
  user: { email?: string | null; user_metadata?: Record<string, unknown> } | null,
  directoryName: string | null,
): string => {
  // Priority: staff directory display_name → auth metadata → derived email → "HQ Admin"
  if (directoryName) {
    const first = directoryName.trim().split(/\s+/)[0];
    if (first) return first;
  }
  if (!user) return "HQ Admin";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const display = (meta.full_name as string) || (meta.name as string) || "";
  if (display) {
    const first = display.trim().split(/\s+/)[0];
    if (first) return first;
  }
  const local = (user.email ?? "").split("@")[0] ?? "";
  if (!local) return "HQ Admin";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  const first = cleaned.split(/\s+/)[0] ?? "";
  if (!first) return "HQ Admin";
  // Reject generic local-parts like "admin", "info", "hq"
  const generic = new Set(["admin", "info", "hq", "hello", "team", "office", "contact"]);
  if (generic.has(first.toLowerCase())) return "HQ Admin";
  return first.charAt(0).toUpperCase() + first.slice(1);
};

const formatStatus = (status: string | null) => {
  if (!status) return "Active";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatEventWhen = (e: UpcomingEvent) => {
  try {
    const d = new Date(`${e.event_date}T${e.event_time ?? "00:00"}`);
    return format(d, "d LLL");
  } catch {
    return e.event_date.slice(5);
  }
};

export function CommandOverview() {
  const navigate = useNavigate();
  const { isPreview } = useHqMode();
  const { user } = useAuth();
  useHqMount("CommandOverview");

  const [signal, setSignal] = useState<Signal>({
    enquiries7: 0,
    activeProjects: 0,
    totalProjects: 0,
    proposalsOut: 0,
    siteVisits: 0,
    completedQ: 0,
  });
  const [signalReady, setSignalReady] = useState(false);
  const [spotlight, setSpotlight] = useState<SpotlightProject | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [nextEvent, setNextEvent] = useState<UpcomingEvent | null>(null);
  const [joshPreviewReady, setJoshPreviewReady] = useState<boolean | null>(null);
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ok" | "timeout" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);

  const now = useMemo(() => new Date(), [reloadKey]);
  const firstName = useMemo(
    () => humanNameFrom(user, directoryName),
    [user, directoryName],
  );
  const greeting = greetingFor(now.getHours());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadState("loading");
      setSignalReady(false);
      const since7 = new Date(Date.now() - 7 * 86400_000).toISOString();
      const sinceQ = new Date(Date.now() - 90 * 86400_000).toISOString();
      const today = new Date().toISOString().slice(0, 10);

      const queries = Promise.all([
        supabase.from("inquiries").select("id", { count: "exact", head: true }).gte("created_at", since7),
        supabase
          .from("site_assessments")
          .select("id", { count: "exact", head: true })
          .gte("slot_date", today),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "sent"),
        supabase.from("managed_projects").select("id", { count: "exact", head: true }).in("status", ["in_progress", "active", "pre_construction"]),
        supabase
          .from("managed_projects")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("updated_at", sinceQ),
        supabase
          .from("activity_log")
          .select("id, title, action_type, entity_type, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("managed_projects").select("id", { count: "exact", head: true }),
        supabase
          .from("managed_projects")
          .select("id, code, name, location, status, next_action, last_update, updated_at")
          .in("status", ["in_progress", "active", "pre_construction"])
          .order("updated_at", { ascending: false })
          .limit(1),
        supabase
          .from("managed_events")
          .select("id, title, event_date, event_time, location")
          .eq("active", true)
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(1),
        supabase.rpc("list_staff_directory"),
      ]);

      const result = await withHqTimeout("CommandOverview:load", queries);
      if (cancelled) return;

      if (result.kind !== "ok") {
        setLoadState(result.kind);
        return;
      }
      const [
        newEnquiries,
        siteVisits,
        proposals,
        activeProjects,
        completed,
        activityLog,
        totalProjects,
        spotlightRes,
        eventRes,
        staffRes,
      ] = result.data;

      setSignal({
        enquiries7: newEnquiries.count ?? 0,
        activeProjects: activeProjects.count ?? 0,
        totalProjects: totalProjects.count ?? 0,
        proposalsOut: proposals.count ?? 0,
        siteVisits: siteVisits.count ?? 0,
        completedQ: completed.count ?? 0,
      });
      setSignalReady(true);
      setActivity(activityLog.data ?? []);
      setSpotlight(((spotlightRes.data ?? [])[0] as SpotlightProject | undefined) ?? null);
      setNextEvent(((eventRes.data ?? [])[0] as UpcomingEvent | undefined) ?? null);

      const staffRows = (staffRes.data ?? []) as Array<{ email: string; display_name: string; user_id: string }>;
      const josh = staffRows.find((r) => r.email?.toLowerCase() === JOSH_EMAIL);
      setJoshPreviewReady(josh ? true : false);
      const me = user?.email
        ? staffRows.find((r) => r.email?.toLowerCase() === user.email!.toLowerCase())
        : undefined;
      setDirectoryName(me?.display_name ?? null);

      setLoadState("ok");
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, user?.email]);

  // ─── Narrative brief: short, human, opinionated about today ───────────────
  const briefLines = useMemo(() => {
    if (!signalReady) return [] as string[];
    const lines: string[] = [];
    if (signal.enquiries7 === 0) {
      lines.push("No new enquiries in the last seven days. The line is quiet.");
    } else if (signal.enquiries7 === 1) {
      lines.push("One new enquiry in the last seven days.");
    } else {
      lines.push(`${signal.enquiries7} new enquiries in the last seven days.`);
    }
    if (signal.activeProjects > 0) {
      lines.push(
        `${signal.activeProjects} project${signal.activeProjects === 1 ? "" : "s"} on the ground, ${signal.proposalsOut} proposal${signal.proposalsOut === 1 ? "" : "s"} out.`,
      );
    } else if (signal.proposalsOut > 0) {
      lines.push(`${signal.proposalsOut} proposal${signal.proposalsOut === 1 ? "" : "s"} sitting with clients.`);
    }
    if (signal.siteVisits > 0) {
      lines.push(`${signal.siteVisits} site visit${signal.siteVisits === 1 ? "" : "s"} on the schedule.`);
    }
    if (nextEvent) {
      lines.push(`${nextEvent.title} — ${formatEventWhen(nextEvent)}.`);
    }
    return lines;
  }, [signal, signalReady, nextEvent]);

  const loadBanner =
    loadState === "timeout" || loadState === "error" ? (
      <div className="mb-10 border-y border-accent/20 px-1 py-3 flex items-center justify-between gap-4">
        <p className="text-[11px] text-muted-foreground/70 font-light">
          {loadState === "timeout"
            ? "Brief took longer than expected to load."
            : "Brief failed to load."}
        </p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="text-[10px] uppercase tracking-[0.28em] text-foreground/80 hover:text-accent transition-colors"
        >
          Retry →
        </button>
      </div>
    ) : null;

  const quickActions = [
    { label: "Open pipeline", action: () => document.getElementById("zone-pipeline")?.scrollIntoView({ behavior: "smooth" }), locked: false },
    { label: "Open applications", action: () => document.getElementById("zone-applications")?.scrollIntoView({ behavior: "smooth" }), locked: false },
    { label: "Log site visit", action: () => document.getElementById("zone-pipeline")?.scrollIntoView({ behavior: "smooth" }), locked: false },
    { label: "Compose quote", action: () => navigate("/hq?compose=quote"), locked: isPreview },
  ];

  const eventValue = nextEvent ? formatEventWhen(nextEvent) : signalReady ? "—" : SKELETON;
  const eventHint = nextEvent?.title
    ? nextEvent.title.length > 22
      ? nextEvent.title.slice(0, 21) + "…"
      : nextEvent.title
    : "no events scheduled";

  const joshValue =
    joshPreviewReady === null ? SKELETON : joshPreviewReady ? "Ready" : "Pending";
  const joshHint = joshPreviewReady === null ? "" : joshPreviewReady ? "preview minted" : "not provisioned";

  const opsSignals: { label: string; value: number | string; hint?: string; mono?: boolean }[] = [
    { label: "Enquiries", value: signalReady ? signal.enquiries7 : SKELETON, hint: "last 7 days" },
    { label: "Active projects", value: signalReady ? signal.activeProjects : SKELETON, hint: signalReady ? `of ${signal.totalProjects} managed` : "" },
    { label: "Next event", value: eventValue, hint: eventHint, mono: true },
    { label: "Josh preview", value: joshValue, hint: joshHint, mono: true },
  ];

  return (
    <div className="relative">
      {/* ── Drafting backdrop ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          color: "hsl(var(--foreground))",
        }}
      />

      <div className="relative space-y-16 sm:space-y-20">
        {loadBanner}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MORNING BRIEF — the hero                                          */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[180px,1fr] gap-x-10 gap-y-4 sm:gap-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/55">Brief</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/45">
              {format(now, "EEE d LLL · HH:mm")}
            </p>
          </div>
          <div className="space-y-5 sm:space-y-6">
            <h2 className="font-serif text-[2.25rem] leading-[1.02] sm:text-5xl lg:text-6xl font-light text-foreground/95 tracking-tight">
              {greeting}, <span className="italic text-foreground">{firstName}</span>.
            </h2>
            {briefLines.length > 0 ? (
              <div className="space-y-2 max-w-xl">
                {briefLines.map((line) => (
                  <p
                    key={line}
                    className="text-[15px] sm:text-[16px] font-light text-foreground/70 leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[14px] font-light text-muted-foreground/50 italic">
                Reading the day…
              </p>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TODAY'S SIGNAL STRIP                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[180px,1fr] gap-x-10 gap-y-4 sm:gap-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/55">Today</p>
            <div className="h-px w-10 bg-border/30" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border/15">
            {opsSignals.map((s, i) => (
              <div
                key={s.label}
                className={`py-5 sm:py-6 pr-4 sm:pr-6 ${i % 2 === 0 ? "border-r sm:border-r" : ""} ${i < 2 ? "border-b sm:border-b-0" : ""} ${i < opsSignals.length - 1 ? "sm:border-r" : ""} border-border/10`}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/45 mb-3">
                  {s.label}
                </p>
                {s.mono ? (
                  <p className="font-mono text-[18px] sm:text-[20px] font-light text-foreground/95 leading-none">
                    {s.value}
                  </p>
                ) : (
                  <p className="font-serif text-[30px] sm:text-[34px] font-light text-foreground/95 leading-none tabular-nums">
                    {typeof s.value === "number" ? String(s.value).padStart(2, "0") : s.value}
                  </p>
                )}
                {s.hint && (
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/40 mt-2 truncate">
                    {s.hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PROJECT SPOTLIGHT                                                 */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[180px,1fr] gap-x-10 gap-y-4 sm:gap-y-6">
          <div className="space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/55">Spotlight</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
              On the ground
            </p>
          </div>

          <div className="relative lg:-mr-[3rem]">
            <div className="border-t border-b border-border/15 pl-1 pr-6 sm:pr-12 py-8 sm:py-10 relative overflow-hidden">
              {/* Faint blueprint vignette */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  color: "hsl(var(--accent))",
                  maskImage: "radial-gradient(ellipse at 90% 50%, black 0%, transparent 70%)",
                }}
              />
              {spotlight ? (
                <div className="relative grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-6 sm:gap-8 items-end">
                  <div className="space-y-3 sm:space-y-4">
                    {spotlight.code && (
                      <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-accent/55">
                        {spotlight.code}
                      </p>
                    )}
                    <h3 className="font-serif text-2xl sm:text-4xl font-light text-foreground/95 leading-[1.05] italic tracking-tight">
                      {spotlight.name}
                    </h3>
                    {spotlight.location && (
                      <p className="text-[12px] uppercase tracking-[0.25em] text-muted-foreground/55">
                        {spotlight.location}
                      </p>
                    )}
                    {spotlight.last_update && (
                      <p className="text-[14px] font-light text-foreground/70 leading-relaxed max-w-md pt-2">
                        {spotlight.last_update}
                      </p>
                    )}
                    {spotlight.next_action && (
                      <p className="text-[12px] font-light text-muted-foreground/60 italic">
                        Next — {spotlight.next_action}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4 sm:text-right">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/45 mb-2">
                        Status
                      </p>
                      <p className="text-[13px] text-foreground/85 font-light">
                        {formatStatus(spotlight.status)}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-accent/45 mb-2">
                        Last touch
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/55">
                        {formatDistanceToNow(new Date(spotlight.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={() => document.getElementById("zone-projects")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-[11px] uppercase tracking-[0.28em] text-foreground/75 hover:text-accent transition-colors"
                    >
                      Open project →
                    </button>
                  </div>
                </div>
              ) : (
                // Polished empty state — keeps the architectural register
                <div className="relative grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-6 sm:gap-8 items-end">
                  <div className="space-y-3 sm:space-y-4 max-w-md">
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-accent/40">
                      Awaiting first build
                    </p>
                    <h3 className="font-serif text-2xl sm:text-4xl font-light text-foreground/80 leading-[1.05] italic tracking-tight">
                      Ground unbroken.
                    </h3>
                    <p className="text-[13px] sm:text-[14px] font-light text-foreground/55 leading-relaxed">
                      No managed project is on the ground yet. The next build will surface here the moment it moves into pre-construction.
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <button
                      onClick={() => document.getElementById("zone-projects")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 hover:text-accent transition-colors"
                    >
                      Open projects →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ACTIVITY + RAIL                                                   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[180px,1fr,auto] gap-x-10 gap-y-8">
          <div className="space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/55">Activity</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
              {activity.length ? `Last ${activity.length}` : "Quiet"}
            </p>
          </div>

          <div>
            {activity.length === 0 ? (
              <p className="text-[13px] text-muted-foreground/50 italic font-light">
                Nothing on the wire yet. New enquiries, quotes and project moves will record here.
              </p>
            ) : (
              <ul className="border-l border-accent/20 pl-5 sm:pl-6 space-y-0">
                {activity.map((row) => (
                  <li key={row.id} className="py-3.5 group relative">
                    <div className="absolute -left-[6px] sm:-left-[7px] top-5 h-px w-3 bg-accent/25 group-hover:bg-accent/60 transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                      <p className="text-[13px] text-foreground/85 font-light leading-relaxed">
                        {row.title}
                        {row.entity_type && (
                          <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.22em] text-accent/45">
                            {row.entity_type}
                          </span>
                        )}
                      </p>
                      <time
                        dateTime={row.created_at}
                        title={format(new Date(row.created_at), "PPpp")}
                        className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 whitespace-nowrap"
                      >
                        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="lg:w-56 space-y-10">
            {!isPreview && (
              <div id="mentions" className="scroll-mt-24">
                <MentionsCard />
              </div>
            )}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/55 mb-5">
                Move
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
          </aside>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* SYSTEM HEALTH                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-border/15 pt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/40 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-foreground/70">
              System nominal
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hidden sm:inline">
              · {signal.completedQ} completed this quarter
            </span>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground/40">
            From Dirt to Dynasty
          </p>
        </section>
      </div>
    </div>
  );
}
