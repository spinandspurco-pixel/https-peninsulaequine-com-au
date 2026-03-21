import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, addMonths } from "date-fns";
import {
  Copy, Check, ChevronDown, ChevronRight, Users, FileText,
  Send, CalendarCheck, Plus, CheckCircle, Clock,
} from "lucide-react";
import { generateOnboardingPDF } from "@/lib/clientOnboardingExport";

/* ── Types ──────────────────────────────────── */

interface Followup {
  id: string;
  job_id: string | null;
  client_name: string;
  client_email: string;
  followup_type: string;
  due_date: string;
  status: string;
  notes: string | null;
  completed_at: string | null;
}

/* ── Templates ──────────────────────────────── */

function weeklyUpdateTemplate(clientName: string, week: string) {
  return `Hi ${clientName},

Here's your project update for ${week}.

COMPLETED
—

IN PROGRESS
—

NEXT WEEK
—

NOTES
—

If you have any questions, we're always available.

Peninsula Equine`;
}

function handoverTemplate(clientName: string, projectName: string) {
  return `Hi ${clientName},

Your project is now complete.

${projectName} has been handed over as specified — built to perform, built to last.

A few things to note:
• All works have been completed and inspected
• Any relevant documentation has been provided
• We'll check in at 2 weeks and again at 2 months

If anything comes up in the meantime, you know where to find us.

Thank you for trusting us with this build.

Peninsula Equine`;
}

/* ── Copy Button ────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-accent">
      {copied ? <Check className="h-3 w-3 mr-1 text-emerald-500/80" /> : <Copy className="h-3 w-3 mr-1" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

/* ── Section Toggle ─────────────────────────── */

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: typeof Users;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/30 rounded-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-accent/60" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0 border-t border-border/20">{children}</div>}
    </div>
  );
}

/* ── Main Component ─────────────────────────── */

export function ClientExperiencePanel() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [jobs, setJobs] = useState<{ id: string; job_name: string; client_name: string | null }[]>([]);
  const [weeklyClient, setWeeklyClient] = useState("");
  const [weeklyWeek, setWeeklyWeek] = useState(format(new Date(), "'Week of' MMM d"));
  const [handoverClient, setHandoverClient] = useState("");
  const [handoverProject, setHandoverProject] = useState("");
  const [onboardingClient, setOnboardingClient] = useState("");
  const [onboardingProject, setOnboardingProject] = useState("");
  const [newFollowupJob, setNewFollowupJob] = useState("");
  const [newFollowupName, setNewFollowupName] = useState("");
  const [newFollowupEmail, setNewFollowupEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const [followupRes, jobsRes] = await Promise.all([
      supabase.from("client_followups").select("*").order("due_date", { ascending: true }),
      supabase.from("jobs").select("id, job_name, client_name").eq("status", "active"),
    ]);
    if (followupRes.data) setFollowups(followupRes.data as Followup[]);
    if (jobsRes.data) setJobs(jobsRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const scheduleFollowups = async () => {
    if (!newFollowupName || !newFollowupEmail) {
      toast.error("Client name and email required");
      return;
    }
    setIsLoading(true);
    const today = new Date();
    const items = [
      { followup_type: "two_week", due_date: format(addDays(today, 14), "yyyy-MM-dd") },
      { followup_type: "two_month", due_date: format(addMonths(today, 2), "yyyy-MM-dd") },
    ];
    const { error } = await supabase.from("client_followups").insert(
      items.map((item) => ({
        ...item,
        job_id: newFollowupJob || null,
        client_name: newFollowupName,
        client_email: newFollowupEmail,
        status: "pending",
      }))
    );
    if (error) toast.error("Failed to schedule follow-ups");
    else {
      toast.success("Follow-up reminders scheduled");
      setNewFollowupName("");
      setNewFollowupEmail("");
      setNewFollowupJob("");
      fetchData();
    }
    setIsLoading(false);
  };

  const completeFollowup = async (id: string) => {
    const { error } = await supabase.from("client_followups").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success("Marked complete"); fetchData(); }
  };

  const pendingFollowups = followups.filter((f) => f.status === "pending");
  const completedFollowups = followups.filter((f) => f.status === "completed");

  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-accent/60" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Experience</p>
            <CardTitle className="text-base font-medium">Client Experience</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* 1 — Weekly Update Template */}
        <Section title="Weekly Update Template" icon={Send}>
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Name</Label>
                <Input
                  value={weeklyClient}
                  onChange={(e) => setWeeklyClient(e.target.value)}
                  placeholder="Client name"
                  className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Week</Label>
                <Input
                  value={weeklyWeek}
                  onChange={(e) => setWeeklyWeek(e.target.value)}
                  className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                />
              </div>
            </div>
            <div className="relative">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-background/40 border border-border/20 rounded-sm p-4 font-sans leading-relaxed">
                {weeklyUpdateTemplate(weeklyClient || "[Client]", weeklyWeek)}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={weeklyUpdateTemplate(weeklyClient || "[Client]", weeklyWeek)} />
              </div>
            </div>
          </div>
        </Section>

        {/* 2 — Onboarding PDF */}
        <Section title="Client Onboarding Pack" icon={FileText}>
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Name</Label>
                <Input
                  value={onboardingClient}
                  onChange={(e) => setOnboardingClient(e.target.value)}
                  placeholder="Client name"
                  className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Project Name</Label>
                <Input
                  value={onboardingProject}
                  onChange={(e) => setOnboardingProject(e.target.value)}
                  placeholder="e.g. Arena & Stables Build"
                  className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              Generates a branded PDF covering project overview, build stages, communication expectations, and key contacts.
            </p>
            <Button
              size="sm"
              onClick={() => generateOnboardingPDF(onboardingClient || "Client", onboardingProject || "Project")}
              className="text-[11px] uppercase tracking-wider"
            >
              <FileText className="h-3.5 w-3.5 mr-2" />
              Download Onboarding Pack
            </Button>
          </div>
        </Section>

        {/* 3 — Handover Message */}
        <Section title="Handover Message" icon={CheckCircle}>
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Name</Label>
                <Input
                  value={handoverClient}
                  onChange={(e) => setHandoverClient(e.target.value)}
                  placeholder="Client name"
                  className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Project Name</Label>
                <Input
                  value={handoverProject}
                  onChange={(e) => setHandoverProject(e.target.value)}
                  placeholder="Project name"
                  className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                />
              </div>
            </div>
            <div className="relative">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-background/40 border border-border/20 rounded-sm p-4 font-sans leading-relaxed">
                {handoverTemplate(handoverClient || "[Client]", handoverProject || "[Project]")}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={handoverTemplate(handoverClient || "[Client]", handoverProject || "[Project]")} />
              </div>
            </div>
          </div>
        </Section>

        {/* 4 — Follow-Up Reminders */}
        <Section title="Post-Completion Follow-Ups" icon={CalendarCheck} defaultOpen>
          <div className="space-y-4 pt-3">

            {/* Schedule new */}
            <div className="space-y-3 bg-background/40 border border-border/20 rounded-sm p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Schedule Follow-Ups</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Name</Label>
                  <Input
                    value={newFollowupName}
                    onChange={(e) => setNewFollowupName(e.target.value)}
                    placeholder="Client name"
                    className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input
                    value={newFollowupEmail}
                    onChange={(e) => setNewFollowupEmail(e.target.value)}
                    placeholder="client@email.com"
                    className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Link to Job</Label>
                  <Select value={newFollowupJob} onValueChange={setNewFollowupJob}>
                    <SelectTrigger className="h-9 mt-1 bg-background/60 border-border/40 rounded-sm text-sm">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((j) => (
                        <SelectItem key={j.id} value={j.id}>{j.job_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={scheduleFollowups}
                  disabled={isLoading}
                  className="text-[11px] uppercase tracking-wider"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Schedule 2-Week + 2-Month
                </Button>
                <p className="text-[10px] text-muted-foreground/50">Creates reminders at 14 days and 2 months from today</p>
              </div>
            </div>

            {/* Pending */}
            {pendingFollowups.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
                  Pending ({pendingFollowups.length})
                </p>
                {pendingFollowups.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 border border-border/20 rounded-sm bg-background/30">
                    <div className="flex items-center gap-3">
                      <Clock className="h-3.5 w-3.5 text-accent/50" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.client_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {f.followup_type === "two_week" ? "2-Week Check-In" : "2-Month Check-In"} · Due {format(new Date(f.due_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${
                        new Date(f.due_date) <= new Date() ? "border-accent text-accent" : "text-muted-foreground"
                      }`}>
                        {new Date(f.due_date) <= new Date() ? "Due" : "Upcoming"}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => completeFollowup(f.id)} className="text-[10px] text-muted-foreground hover:text-emerald-500">
                        <Check className="h-3 w-3 mr-1" /> Done
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed */}
            {completedFollowups.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
                  Completed ({completedFollowups.length})
                </p>
                {completedFollowups.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-sm opacity-50">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-3 w-3 text-emerald-500/60" />
                      <p className="text-[11px] text-muted-foreground line-through">{f.client_name} — {f.followup_type === "two_week" ? "2-Week" : "2-Month"}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground/40">
                      {f.completed_at && format(new Date(f.completed_at), "MMM d")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {followups.length === 0 && (
              <p className="text-[11px] text-muted-foreground/40 text-center py-4">
                No follow-ups scheduled yet. Complete a project handover and schedule check-ins above.
              </p>
            )}
          </div>
        </Section>

      </CardContent>
    </Card>
  );
}
