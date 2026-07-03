import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { logClientEvent } from "@/lib/clientLog";
import { usePageMeta } from "@/lib/usePageMeta";
import "@/styles/hq.css";
import type { User } from "@supabase/supabase-js";

interface Project {
  id: string;
  name: string;
  status: "planning" | "in-progress" | "completed";
  progress: number;
  createdAt: string;
  updatedAt: string;
  description: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  teamMembers: number;
}

type TabType = "overview" | "projects" | "team" | "settings";

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
}

export default function AdminDashboard() {
  usePageMeta({
    title: "HQ Dashboard — Peninsula Equine",
    description: "Admin dashboard for Peninsula Equine projects and operations.",
    path: "/hq/dashboard",
  });

  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          logClientEvent("hq_dashboard_unauthorized", {});
          navigate("/hq/login", { replace: true });
          return;
        }

        setUser(session.user);
        logClientEvent("hq_dashboard_access", { userId: session.user.id });
        
        // Load mock projects
        loadProjects();
      } catch (err) {
        logClientEvent("hq_dashboard_auth_error", {
          error: err instanceof Error ? err.message : "Unknown error",
        });
        setError("Failed to authenticate. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadProjects = () => {
    // Mock data - replace with actual Supabase query
    const mockProjects: Project[] = [
      {
        id: "1",
        name: "Main Ridge Pavilion",
        status: "completed",
        progress: 100,
        createdAt: "2024-01-15",
        updatedAt: "2024-06-30",
        description: "Custom rural pavilion with fireplace and timber features",
      },
      {
        id: "2",
        name: "Aberdeen Stables",
        status: "completed",
        progress: 100,
        createdAt: "2024-02-01",
        updatedAt: "2024-07-15",
        description: "Indoor arena and stable complex",
      },
      {
        id: "3",
        name: "Covered Arena Build",
        status: "in-progress",
        progress: 65,
        createdAt: "2024-04-20",
        updatedAt: "2024-08-10",
        description: "Live covered arena and stables build",
      },
    ];

    setProjects(mockProjects);
    setStats({
      totalProjects: mockProjects.length,
      activeProjects: mockProjects.filter((p) => p.status === "in-progress").length,
      completedProjects: mockProjects.filter((p) => p.status === "completed").length,
      teamMembers: 1,
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logClientEvent("hq_logout", { userId: user?.id });
      navigate("/hq/login", { replace: true });
    } catch (err) {
      logClientEvent("hq_logout_error", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setError("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin mx-auto mb-4" />
          <p className="text-foreground/60 font-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-background/95 border-r border-accent/10 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="font-serif text-accent font-bold">PE</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <h2 className="font-serif text-sm text-foreground/90">HQ</h2>
                <p className="font-mono text-[8px] text-foreground/50 uppercase tracking-[0.2em]">Admin</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {(
              [
                { id: "overview", label: "Overview", icon: "📊" },
                { id: "projects", label: "Projects", icon: "🏗️" },
                { id: "team", label: "Team", icon: "👥" },
                { id: "settings", label: "Settings", icon: "⚙️" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-accent/20 text-foreground border border-accent/30"
                    : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && (
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="border-t border-accent/10 pt-4 space-y-3">
            {sidebarOpen && user && (
              <div className="px-4 py-2">
                <p className="text-[11px] font-mono text-foreground/60 uppercase tracking-[0.2em]">
                  Logged in as
                </p>
                <p className="text-sm text-foreground/80 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <span className="text-lg">🚪</span>
              {sidebarOpen && (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
                  Logout
                </span>
              )}
            </button>
          </div>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mt-4 w-full py-2 text-foreground/50 hover:text-foreground/70 transition-colors"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Header */}
        <header className="bg-background/50 border-b border-accent/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <h1 className="font-serif text-2xl text-foreground/90">
              {activeTab === "overview"
                ? "Dashboard Overview"
                : activeTab === "projects"
                  ? "Projects"
                  : activeTab === "team"
                    ? "Team"
                    : "Settings"}
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500/90 text-[13px] font-light">{error}</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Projects", value: stats.totalProjects, icon: "📊" },
                  { label: "Active", value: stats.activeProjects, icon: "🔴" },
                  { label: "Completed", value: stats.completedProjects, icon: "✅" },
                  { label: "Team Members", value: stats.teamMembers, icon: "👥" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-background/50 border border-accent/10 rounded-lg p-6 hover:border-accent/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-foreground/60 text-[10px] uppercase tracking-[0.2em]">
                        {stat.label}
                      </span>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className="font-serif text-3xl text-foreground/90 font-bold">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent Projects */}
              <div className="bg-background/50 border border-accent/10 rounded-lg p-8">
                <h2 className="font-serif text-lg text-foreground/90 mb-6">Recent Projects</h2>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-background/50 border border-accent/10 rounded-lg hover:border-accent/20 transition-all duration-300"
                    >
                      <div className="flex-1">
                        <h3 className="font-serif text-foreground/90">{project.name}</h3>
                        <p className="text-[12px] text-foreground/50 mt-1">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hq-progress-bar w-32" title={`Progress: ${project.progress}%`}>
                          <div
                            className="hq-progress-fill"
                            style={{ width: `${project.progress}%` } as React.CSSProperties}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-foreground/60 w-10 text-right">
                          {project.progress}%
                        </span>
                        <span className="font-mono text-[11px] text-foreground/60 w-10 text-right">
                          {project.progress}%
                        </span>
                        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded ${
                          project.status === "completed"
                            ? "bg-green-500/20 text-green-500/90"
                            : "bg-blue-500/20 text-blue-500/90"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-foreground/60 font-light">
                  {projects.length} project{projects.length !== 1 ? "s" : ""} found
                </p>
                <button className="px-4 py-2 bg-accent/80 hover:bg-accent text-background font-mono text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all duration-300">
                  + New Project
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-background/50 border border-accent/10 rounded-lg p-6 hover:border-accent/20 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-serif text-lg text-foreground/90">
                          {project.name}
                        </h3>
                        <p className="text-[13px] text-foreground/50 mt-1">
                          {project.description}
                        </p>
                      </div>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded ${
                        project.status === "completed"
                          ? "bg-green-500/20 text-green-500/90"
                          : project.status === "in-progress"
                            ? "bg-blue-500/20 text-blue-500/90"
                            : "bg-gray-500/20 text-gray-500/90"
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-foreground/50 font-mono">Progress</span>
                        <span className="font-mono text-[11px] text-foreground/70">{project.progress}%</span>
                      </div>
                      <div 
                        className="hq-progress-bar w-full" 
                        title={`${project.name} progress: ${project.progress}%`}
                      >
                        <div
                          className="hq-progress-fill"
                          style={{ width: `${project.progress}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-foreground/50">
                      <span>Created {project.createdAt}</span>
                      <div className="space-x-2">
                        <button className="text-accent/70 hover:text-accent transition-colors">Edit</button>
                        <button className="text-red-500/70 hover:text-red-500 transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-foreground/60 font-light">
                  {stats.teamMembers} team member{stats.teamMembers !== 1 ? "s" : ""}
                </p>
                <button className="px-4 py-2 bg-accent/80 hover:bg-accent text-background font-mono text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all duration-300">
                  + Invite Member
                </button>
              </div>

              <div className="bg-background/50 border border-accent/10 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center font-serif font-bold text-accent">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-serif text-foreground/90">{user?.email}</p>
                    <p className="text-[12px] text-foreground/50 font-mono uppercase tracking-[0.2em]">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-background/50 border border-accent/10 rounded-lg p-6">
                <h3 className="font-serif text-lg text-foreground/90 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-foreground/70 text-[10px] uppercase tracking-[0.2em] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      title="Email address"
                      aria-label="Email address"
                      className="w-full px-4 py-2 bg-background/50 border border-accent/10 rounded-lg text-foreground/60 font-light text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-foreground/70 text-[10px] uppercase tracking-[0.2em] mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value="Administrator"
                      disabled
                      title="User role"
                      aria-label="User role"
                      className="w-full px-4 py-2 bg-background/50 border border-accent/10 rounded-lg text-foreground/60 font-light text-[13px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-background/50 border border-accent/10 rounded-lg p-6">
                <h3 className="font-serif text-lg text-foreground/90 mb-4">Security</h3>
                <button className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent font-mono text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all duration-300">
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
