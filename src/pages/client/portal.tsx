import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { logClientEvent } from "@/lib/clientLog";
import { usePageMeta } from "@/lib/usePageMeta";
import "@/styles/hq.css";
import type { User } from "@supabase/supabase-js";

interface ClientProject {
  id: string;
  name: string;
  status: "planning" | "in-progress" | "completed";
  progress: number;
  description: string;
  location: string;
  startDate: string;
  expectedCompletion: string;
  photos: string[];
}

interface ClientAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  joinedDate: string;
}

type ClientTabType = "projects" | "gallery" | "documents" | "account";

export default function ClientPortal() {
  usePageMeta({
    title: "Client Portal — Peninsula Equine",
    description: "Track your Peninsula Equine project progress and updates.",
    path: "/client/portal",
  });

  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ClientTabType>("projects");
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          logClientEvent("client_portal_unauthorized", {});
          navigate("/client/login", { replace: true });
          return;
        }

        setUser(session.user);
        logClientEvent("client_portal_access", { userId: session.user.id });
        
        // Load client projects
        loadClientProjects();
      } catch (err) {
        logClientEvent("client_portal_auth_error", {
          error: err instanceof Error ? err.message : "Unknown error",
        });
        setError("Failed to authenticate. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadClientProjects = () => {
    // Mock data - in production, filter by client_id
    const mockProjects: ClientProject[] = [
      {
        id: "client-1",
        name: "Custom Arena Build",
        status: "in-progress",
        progress: 72,
        description: "Professional equine arena with premium footing system",
        location: "Mornington Peninsula, VIC",
        startDate: "2024-04-15",
        expectedCompletion: "2024-09-30",
        photos: [],
      },
      {
        id: "client-2",
        name: "Stable Complex",
        status: "planning",
        progress: 15,
        description: "6-stall stable block with wash bay and tack room",
        location: "Mornington Peninsula, VIC",
        startDate: "2024-08-01",
        expectedCompletion: "2025-03-31",
        photos: [],
      },
    ];

    setProjects(mockProjects);
    if (mockProjects.length > 0) {
      setSelectedProject(mockProjects[0]);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logClientEvent("client_logout", { userId: user?.id });
      navigate("/client/login", { replace: true });
    } catch (err) {
      logClientEvent("client_logout_error", {
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
          <p className="text-foreground/60 font-light">Loading your projects...</p>
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
                <h2 className="font-serif text-sm text-foreground/90">Client</h2>
                <p className="font-mono text-[8px] text-foreground/50 uppercase tracking-[0.2em]">Portal</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {(
              [
                { id: "projects", label: "My Projects", icon: "🏗️" },
                { id: "gallery", label: "Gallery", icon: "📸" },
                { id: "documents", label: "Documents", icon: "📄" },
                { id: "account", label: "Account", icon: "👤" },
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

          {/* Contact Support */}
          <div className="border-t border-accent/10 pt-4 space-y-3">
            {sidebarOpen && (
              <div className="px-4 py-2">
                <p className="text-[11px] font-mono text-foreground/60 uppercase tracking-[0.2em]">
                  Questions?
                </p>
                <p className="text-[12px] text-foreground/70 mt-1">
                  <a href="mailto:info@peninsulaequine.systems" className="text-accent/70 hover:text-accent transition-colors">
                    info@peninsulaequine.systems
                  </a>
                </p>
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
              {activeTab === "projects"
                ? "My Projects"
                : activeTab === "gallery"
                  ? "Project Gallery"
                  : activeTab === "documents"
                    ? "Documents"
                    : "Account Settings"}
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

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-8">
              {/* Projects List */}
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                      selectedProject?.id === project.id
                        ? "bg-accent/10 border-accent/30"
                        : "bg-background/50 border-accent/10 hover:border-accent/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-serif text-lg text-foreground/90">{project.name}</h3>
                        <p className="text-[13px] text-foreground/50 mt-1">{project.location}</p>
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
                        <span className="text-[11px] text-foreground/50 font-mono">Overall Progress</span>
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

                    <div className="grid grid-cols-2 gap-4 text-[12px] text-foreground/60">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Start Date</p>
                        <p>{project.startDate}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1">Expected Completion</p>
                        <p>{project.expectedCompletion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Project Details */}
              {selectedProject && (
                <div className="bg-background/50 border border-accent/10 rounded-lg p-8">
                  <h2 className="font-serif text-xl text-foreground/90 mb-6">Project Details</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="font-mono text-foreground/70 text-[10px] uppercase tracking-[0.2em] mb-2">
                        Description
                      </p>
                      <p className="text-foreground/60 leading-relaxed">{selectedProject.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="font-mono text-foreground/70 text-[10px] uppercase tracking-[0.2em] mb-2">
                          Location
                        </p>
                        <p className="text-foreground/60">{selectedProject.location}</p>
                      </div>
                      <div>
                        <p className="font-mono text-foreground/70 text-[10px] uppercase tracking-[0.2em] mb-2">
                          Status
                        </p>
                        <p className="text-foreground/60 capitalize">{selectedProject.status}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-foreground/70 text-[10px] uppercase tracking-[0.2em] mb-4">
                        Timeline
                      </p>
                      <div className="space-y-2 text-[13px]">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/60">Start Date:</span>
                          <span className="text-foreground/80 font-light">{selectedProject.startDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/60">Expected Completion:</span>
                          <span className="text-foreground/80 font-light">{selectedProject.expectedCompletion}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <p className="text-foreground/60 font-light">
                Project photos and progress updates coming soon as your build progresses.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] bg-background/50 border border-accent/10 rounded-lg flex items-center justify-center"
                  >
                    <div className="text-center">
                      <span className="text-4xl mb-2">📸</span>
                      <p className="text-foreground/50 text-sm font-light">No photos yet</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <p className="text-foreground/60 font-light mb-6">
                Access project documents, quotes, contracts, and specifications.
              </p>
              <div className="space-y-3">
                {[
                  { name: "Project Specification", date: "2024-04-15", type: "PDF" },
                  { name: "Quote & Pricing", date: "2024-04-10", type: "PDF" },
                  { name: "Contract", date: "2024-04-12", type: "PDF" },
                  { name: "Site Plan", date: "2024-04-15", type: "PDF" },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-background/50 border border-accent/10 rounded-lg hover:border-accent/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-serif text-foreground/90">{doc.name}</p>
                        <p className="text-[12px] text-foreground/50">{doc.date}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-accent/70 hover:text-accent font-mono text-[10px] uppercase tracking-[0.3em] transition-colors">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-background/50 border border-accent/10 rounded-lg p-6">
                <h3 className="font-serif text-lg text-foreground/90 mb-4">Account Information</h3>
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
                </div>
              </div>

              <div className="bg-background/50 border border-accent/10 rounded-lg p-6">
                <h3 className="font-serif text-lg text-foreground/90 mb-4">Notifications</h3>
                <div className="space-y-3">
                  {[
                    { label: "Project Updates", enabled: true },
                    { label: "Milestone Reached", enabled: true },
                    { label: "Messages", enabled: true },
                  ].map((notif) => (
                    <div key={notif.label} className="flex items-center justify-between">
                      <span className="text-foreground/70">{notif.label}</span>
                      <input
                        type="checkbox"
                        checked={notif.enabled}
                        disabled
                        title={`${notif.label} notification`}
                        aria-label={`${notif.label} notification`}
                        className="w-4 h-4 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
