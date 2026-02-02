import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  CalendarDays, 
  ClipboardList, 
  Clock, 
  LogOut, 
  Loader2,
  User,
  Bell,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw
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

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isEmployee, setIsEmployee] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
      toast.error("Access denied. Employee or admin role required.");
      navigate("/hq");
      return;
    }

    setIsEmployee(true);
    setCheckingRole(false);
    fetchData();
  };

  const fetchData = async () => {
    setLoadingData(true);
    
    // Fetch today's tasks
    const today = new Date().toISOString().split('T')[0];
    const { data: tasksData, error: tasksError } = await supabase
      .from("employee_tasks")
      .select("*")
      .eq("scheduled_date", today)
      .order("scheduled_time", { ascending: true });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
    } else {
      setTasks(tasksData || []);
    }

    // Fetch active announcements
    const { data: announcementsData, error: announcementsError } = await supabase
      .from("announcements")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (announcementsError) {
      console.error("Error fetching announcements:", announcementsError);
    } else {
      setAnnouncements(announcementsData || []);
    }

    setLoadingData(false);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from("employee_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task status");
      console.error(error);
    } else {
      toast.success(`Task marked as ${newStatus}`);
      fetchData();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/hq");
    toast.success("Signed out successfully");
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading || checkingRole) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isEmployee) {
    return null;
  }

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const importantAnnouncements = announcements.filter(a => a.priority === "important").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Employee Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loadingData}>
              <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === "in-progress").length}
              </div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Not started</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
              <p className="text-xs text-muted-foreground">
                {importantAnnouncements} important
              </p>
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
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : task.status === "in-progress" ? (
                          <Clock className="h-5 w-5 text-amber-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, "in-progress")}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {task.status === "in-progress" && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => updateTaskStatus(task.id, "completed")}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "secondary"
                              : task.status === "in-progress"
                              ? "default"
                              : "outline"
                          }
                        >
                          {task.status === "in-progress" ? "In Progress" : task.status}
                        </Badge>
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
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No announcements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-3 rounded-lg border ${
                        announcement.priority === "important"
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {announcement.priority === "important" && (
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{announcement.title}</p>
                          {announcement.content && (
                            <p className="text-xs text-muted-foreground mt-1">{announcement.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Quick Links
                </h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    View Full Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Request Time Off
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}