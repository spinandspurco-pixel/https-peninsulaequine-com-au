import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  LogOut,
  Loader2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react";

/* ── Western Horse Avatars ──────────────────────────────── */
const HORSE_AVATARS = [
  { id: "mustang", emoji: "🐴", label: "Mustang", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "stallion", emoji: "🏇", label: "Stallion", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "cowboy", emoji: "🤠", label: "Cowboy", bg: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "horseshoe", emoji: "🧲", label: "Lucky Shoe", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { id: "sunset", emoji: "🌅", label: "Sunset Rider", bg: "bg-rose-100 dark:bg-rose-900/30" },
  { id: "cactus", emoji: "🌵", label: "Trail Boss", bg: "bg-lime-100 dark:bg-lime-900/30" },
  { id: "lasso", emoji: "🪢", label: "Lasso", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: "saddle", emoji: "🐎", label: "Saddle Up", bg: "bg-purple-100 dark:bg-purple-900/30" },
];

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

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isEmployee, setIsEmployee] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem("pe-avatar") || "mustang";
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [greeting, setGreeting] = useState("");

  // Set dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good mornin'");
    else if (hour < 17) setGreeting("Howdy");
    else setGreeting("Evenin'");
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/hq");
        return;
      }
      checkEmployeeRole(user.id);
    }
  }, [user, loading, navigate]);

  const checkEmployeeRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["employee", "admin"])
      .maybeSingle();

    if (!data) {
      toast.error("Access denied. Staff role required.");
      navigate("/hq");
      return;
    }

    setIsEmployee(true);
    setCheckingRole(false);
    fetchData();
  };

  const fetchData = async () => {
    setLoadingData(true);
    const today = new Date().toISOString().split("T")[0];

    const [tasksRes, announcementsRes] = await Promise.all([
      supabase
        .from("employee_tasks")
        .select("*")
        .eq("scheduled_date", today)
        .order("scheduled_time", { ascending: true }),
      supabase
        .from("announcements")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false }),
    ]);

    setTasks(tasksRes.data || []);
    setAnnouncements(announcementsRes.data || []);
    setLoadingData(false);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from("employee_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task");
    } else {
      toast.success(`Task marked as ${newStatus}`);
      fetchData();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/hq");
    toast.success("Signed out. See ya later! 🤠");
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    localStorage.setItem("pe-avatar", avatarId);
    setShowAvatarPicker(false);
    toast.success("Avatar updated! Lookin' good 🤠");
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const currentAvatar = HORSE_AVATARS.find((a) => a.id === selectedAvatar) || HORSE_AVATARS[0];

  if (loading || checkingRole) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
          <div className="text-5xl animate-bounce">🐴</div>
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Saddling up...</p>
        </div>
      </Layout>
    );
  }

  if (!isEmployee) return null;

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const importantAnnouncements = announcements.filter((a) => a.priority === "important").length;
  const displayName = user?.email?.split("@")[0] || "Partner";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Avatar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAvatarPicker(true)}
              className={`w-14 h-14 rounded-full ${currentAvatar.bg} flex items-center justify-center text-3xl hover:scale-110 transition-transform cursor-pointer ring-2 ring-accent/20 hover:ring-accent/50`}
              title="Change avatar"
            >
              {currentAvatar.emoji}
            </button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {greeting}, {displayName}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loadingData}>
              <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats with animated icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="group hover:border-accent/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:scale-110 transition-all" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
            </CardContent>
          </Card>

          <Card className="group hover:border-accent/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 group-hover:animate-pulse transition-all" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "in-progress").length}</div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>

          <Card className="group hover:border-accent/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 group-hover:scale-110 transition-all" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Not started</p>
            </CardContent>
          </Card>

          <Card className="group hover:border-accent/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:animate-bounce transition-all" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
              <p className="text-xs text-muted-foreground">{importantAnnouncements} important</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <CardDescription>Your tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="text-3xl animate-bounce">🐎</div>
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-3">🌅</div>
                  <p className="font-medium">All clear for today!</p>
                  <p className="text-sm mt-1">No tasks on the schedule. Enjoy the ride.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : task.status === "in-progress" ? (
                          <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                        )}
                        <div>
                          <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(task.scheduled_time)}
                            {task.priority === "urgent" && (
                              <Badge variant="destructive" className="ml-2 text-xs">Urgent</Badge>
                            )}
                            {task.priority === "high" && (
                              <Badge variant="default" className="ml-2 text-xs">High</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "in-progress")}>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {task.status === "in-progress" && (
                          <Button size="sm" variant="default" onClick={() => updateTaskStatus(task.id, "completed")}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </CardTitle>
              <CardDescription>Team updates & notices</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm">No announcements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3 rounded-lg border ${
                        a.priority === "important"
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {a.priority === "important" && (
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{a.title}</p>
                          {a.content && (
                            <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Avatar Picker Dialog */}
        <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Choose Your Avatar
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-3 py-4">
              {HORSE_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all hover:scale-105 ${
                    selectedAvatar === avatar.id
                      ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                      : "border-border hover:border-accent/40"
                  }`}
                >
                  <span className="text-2xl">{avatar.emoji}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center">{avatar.label}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
