import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SharedCalendarView } from "@/components/SharedCalendarView";
import { TrainerAvailabilityManager } from "@/components/TrainerAvailabilityManager";
import { toast } from "sonner";
import {
  CalendarDays, ClipboardList, Clock, LogOut, Loader2, Bell,
  CheckCircle2, AlertCircle, Play, RefreshCw, BookOpen, Users, Mail, Phone,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  scheduled_time: string | null;
  scheduled_date: string;
  priority: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string | null;
  priority: string;
}

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  service_type: string;
  booking_date: string;
  booking_time: string | null;
  duration_minutes: number | null;
  status: string;
  notes: string | null;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  services: string[];
  status: string;
  created_at: string;
  experience_level: string | null;
  horse_name: string | null;
}

export default function EmployeeDashboard() {
  const { user, loading, isTrainer } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [trainerBookings, setTrainerBookings] = useState<Booking[]>([]);
  const [trainerInquiries, setTrainerInquiries] = useState<Inquiry[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate("/hq"); return; }
      checkEmployeeRole(user.id);
    }
  }, [user, loading, navigate]);

  const checkEmployeeRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["employee", "admin", "trainer"])
      .maybeSingle();
    if (!data) { toast.error("Access denied."); navigate("/hq"); return; }
    setHasAccess(true);
    setCheckingRole(false);
    fetchData();
  };

  const fetchData = async () => {
    setLoadingData(true);
    const today = new Date().toISOString().split("T")[0];
    const [tasksRes, announcementsRes] = await Promise.all([
      supabase.from("employee_tasks").select("*").eq("scheduled_date", today).order("scheduled_time", { ascending: true }),
      supabase.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false }),
    ]);
    setTasks(tasksRes.data || []);
    setAnnouncements(announcementsRes.data || []);
    if (isTrainer) {
      const [bookingsRes, inquiriesRes] = await Promise.all([
        supabase.from("bookings").select("*").in("service_type", ["riding-lessons", "lesson", "clinic", "clinics-events"]).order("booking_date", { ascending: true }).limit(50),
        supabase.from("inquiries").select("*").overlaps("services", ["riding-lessons", "clinics-events"]).order("created_at", { ascending: false }).limit(50),
      ]);
      setTrainerBookings(bookingsRes.data || []);
      setTrainerInquiries(inquiriesRes.data || []);
    }
    setLoadingData(false);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from("employee_tasks").update({ status: newStatus }).eq("id", taskId);
    if (error) toast.error("Failed to update task");
    else { toast.success(`Task updated`); fetchData(); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/hq");
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? "PM" : "AM"}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });

  if (loading || checkingRole) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary">
          <div className="text-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Loading…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) return null;

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const importantAnnouncements = announcements.filter((a) => a.priority === "important").length;
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Team Member";
  const upcomingBookings = trainerBookings.filter((b) => b.status !== "cancelled");
  const newInquiries = trainerInquiries.filter((i) => i.status === "new");

  return (
    <Layout>
      <div className="bg-secondary min-h-screen">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">
                {isTrainer ? "Trainer Portal" : "Team Portal"}
              </p>
              <h1 className="font-serif text-2xl tracking-tight text-foreground">
                Welcome, {displayName}
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isTrainer && <Badge variant="outline" className="mr-2 text-[9px] uppercase tracking-wider border-accent/30 text-accent">Trainer</Badge>}
                {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={isTrainer ? "/trainer/documents" : "/staff/documents"}>
                <Button variant="outline" size="sm" className="text-[11px] uppercase tracking-wider border-border/40 h-9">
                  <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                  Documents
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="h-9 w-9 border-border/40" onClick={fetchData} disabled={loadingData}>
                <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-[11px] uppercase tracking-wider border-border/40 h-9">
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Stats */}
          <div className={`grid grid-cols-2 ${isTrainer ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-3`}>
            {[
              { label: "Today's Tasks", value: tasks.length, sub: `${completedTasks} done`, icon: ClipboardList },
              ...(isTrainer ? [{ label: "Bookings", value: upcomingBookings.length, sub: `${newInquiries.length} new inquiries`, icon: BookOpen }] : []),
              { label: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length, sub: "Active", icon: Clock },
              { label: "Notices", value: announcements.length, sub: `${importantAnnouncements} important`, icon: Bell },
            ].map((stat) => (
              <Card key={stat.label} className="bg-card/80 border-border/40">
                <CardHeader className="pb-1 pt-4 px-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">{stat.label}</p>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-serif font-semibold text-foreground">{stat.value}</span>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">{stat.sub}</p>
                    </div>
                    <stat.icon className="h-4 w-4 text-accent/50" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content */}
          {isTrainer ? (
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="bg-card/60 border border-border/30 p-0.5 rounded-sm">
                {[
                  { value: "bookings", label: "Bookings", icon: BookOpen, count: upcomingBookings.length },
                  { value: "inquiries", label: "Inquiries", icon: Mail, count: newInquiries.length },
                  { value: "schedule", label: "Tasks", icon: ClipboardList },
                  { value: "availability", label: "Availability", icon: Clock },
                  { value: "calendar", label: "Calendar", icon: CalendarDays },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-[11px] uppercase tracking-wider data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-sm gap-1.5"
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {tab.count ? <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">{tab.count}</Badge> : null}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="bookings">
                <Card className="bg-card/80 border-border/40">
                  <CardHeader>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Schedule</p>
                    <CardTitle className="text-base font-medium">Lesson & Clinic Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingData ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-accent/60" /></div>
                    ) : upcomingBookings.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CalendarDays className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-sm font-medium">No upcoming bookings</p>
                        <p className="text-[11px] mt-1 text-muted-foreground/60">New bookings will appear here automatically.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingBookings.map((b) => (
                          <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm border border-border/30 bg-background/40 hover:border-accent/20 transition-all duration-200">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{b.client_name}</span>
                                <Badge variant="outline" className="text-[9px] uppercase tracking-wider">{b.status}</Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(b.booking_date)}</span>
                                {b.booking_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(b.booking_time)}</span>}
                                <span className="capitalize">{b.service_type.replace(/-/g, " ")}</span>
                              </div>
                              <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground/60">
                                <a href={`mailto:${b.client_email}`} className="flex items-center gap-1 hover:text-accent transition-colors"><Mail className="h-3 w-3" />{b.client_email}</a>
                                {b.client_phone && <a href={`tel:${b.client_phone}`} className="flex items-center gap-1 hover:text-accent transition-colors"><Phone className="h-3 w-3" />{b.client_phone}</a>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inquiries">
                <Card className="bg-card/80 border-border/40">
                  <CardHeader>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Pipeline</p>
                    <CardTitle className="text-base font-medium">Lesson Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingData ? (
                      <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-accent/60" /></div>
                    ) : trainerInquiries.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Mail className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-sm font-medium">No inquiries yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trainerInquiries.map((inq) => (
                          <div key={inq.id} className="p-4 rounded-sm border border-border/30 bg-background/40 hover:border-accent/20 transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{inq.name}</span>
                                <Badge variant="outline" className="text-[9px] uppercase tracking-wider">{inq.status}</Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground/60">{formatDate(inq.created_at)}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {inq.services.map((s) => (
                                <Badge key={s} variant="outline" className="text-[9px] uppercase tracking-wider capitalize border-border/30">{s.replace(/-/g, " ")}</Badge>
                              ))}
                            </div>
                            <div className="flex gap-3 text-[10px] text-muted-foreground/60">
                              <a href={`mailto:${inq.email}`} className="flex items-center gap-1 hover:text-accent transition-colors"><Mail className="h-3 w-3" />{inq.email}</a>
                              {inq.phone && <a href={`tel:${inq.phone}`} className="flex items-center gap-1 hover:text-accent transition-colors"><Phone className="h-3 w-3" />{inq.phone}</a>}
                              {inq.experience_level && <span>Level: {inq.experience_level}</span>}
                              {inq.horse_name && <span>Horse: {inq.horse_name}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <TasksCard tasks={tasks} loadingData={loadingData} formatTime={formatTime} updateTaskStatus={updateTaskStatus} />
                  <AnnouncementsCard announcements={announcements} loadingData={loadingData} />
                </div>
              </TabsContent>

              <TabsContent value="availability">
                <TrainerAvailabilityManager />
              </TabsContent>

              <TabsContent value="calendar">
                <SharedCalendarView />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TasksCard tasks={tasks} loadingData={loadingData} formatTime={formatTime} updateTaskStatus={updateTaskStatus} />
              <AnnouncementsCard announcements={announcements} loadingData={loadingData} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ── Extracted Components ── */

function TasksCard({ tasks, loadingData, formatTime, updateTaskStatus }: {
  tasks: Task[];
  loadingData: boolean;
  formatTime: (t: string | null) => string;
  updateTaskStatus: (id: string, status: string) => void;
}) {
  return (
    <Card className="lg:col-span-2 bg-card/80 border-border/40">
      <CardHeader>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Schedule</p>
        <CardTitle className="text-base font-medium">Today's Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingData ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-accent/60" /></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium">All clear for today</p>
            <p className="text-[11px] mt-1 text-muted-foreground/60">No tasks scheduled.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-sm border border-border/30 bg-background/40 hover:border-accent/20 transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : task.status === "in-progress" ? (
                    <Clock className="h-4 w-4 text-accent" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground/50" : ""}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.scheduled_time && <span className="text-[10px] text-muted-foreground/60">{formatTime(task.scheduled_time)}</span>}
                      {task.priority === "urgent" && <Badge variant="destructive" className="text-[8px] uppercase tracking-wider h-4 px-1">Urgent</Badge>}
                      {task.priority === "high" && <Badge className="text-[8px] uppercase tracking-wider h-4 px-1 bg-accent text-accent-foreground">High</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {task.status === "pending" && (
                    <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase tracking-wider border-border/30" onClick={() => updateTaskStatus(task.id, "in-progress")}>
                      <Play className="h-3 w-3 mr-1" />Start
                    </Button>
                  )}
                  {task.status === "in-progress" && (
                    <Button size="sm" className="h-7 text-[10px] uppercase tracking-wider bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => updateTaskStatus(task.id, "completed")}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Done
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnnouncementsCard({ announcements, loadingData }: {
  announcements: Announcement[];
  loadingData: boolean;
}) {
  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader>
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Team</p>
        <CardTitle className="text-base font-medium">Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingData ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-accent/60" /></div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-[11px]">No announcements</p>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-sm border ${
                  a.priority === "important" ? "border-accent/30 bg-accent/[0.04]" : "border-border/30 bg-background/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  {a.priority === "important" && <AlertCircle className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.content && <p className="text-[11px] text-muted-foreground/60 mt-1">{a.content}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
