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
  AlertCircle
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isEmployee, setIsEmployee] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

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
      .eq("role", "employee")
      .maybeSingle();

    if (!data) {
      toast.error("Access denied. Employee role required.");
      navigate("/hq");
      return;
    }

    setIsEmployee(true);
    setCheckingRole(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/hq");
    toast.success("Signed out successfully");
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

  // Mock data for employee dashboard
  const todaysTasks = [
    { id: 1, title: "Morning stable check", status: "completed", time: "6:00 AM" },
    { id: 2, title: "Feed horses - Barn A", status: "completed", time: "7:00 AM" },
    { id: 3, title: "Arena maintenance", status: "in-progress", time: "10:00 AM" },
    { id: 4, title: "Afternoon riding lessons", status: "pending", time: "2:00 PM" },
    { id: 5, title: "Evening stable check", status: "pending", time: "6:00 PM" },
  ];

  const announcements = [
    { id: 1, title: "Team meeting Friday 3PM", priority: "normal" },
    { id: 2, title: "New safety protocols in effect", priority: "important" },
  ];

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
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {todaysTasks.filter(t => t.status === "completed").length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.5</div>
              <p className="text-xs text-muted-foreground">Started at 6:00 AM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32h</div>
              <p className="text-xs text-muted-foreground">5 shifts scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
              <p className="text-xs text-muted-foreground">
                {announcements.filter(a => a.priority === "important").length} important
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
              <div className="space-y-3">
                {todaysTasks.map((task) => (
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
                        <p className="text-sm text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
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
                ))}
              </div>
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
                      <p className="text-sm font-medium">{announcement.title}</p>
                    </div>
                  </div>
                ))}
              </div>

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
