import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";

interface Project {
  id: string;
  code: string;
  name: string;
  location: string | null;
  build_type: string | null;
  status: string;
}

export default function AdminSelectedWorks() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    supabase
      .from("managed_projects")
      .select("id, code, name, location, build_type, status")
      .order("sort_order")
      .then(({ data }) => setProjects((data as Project[]) ?? []));
  }, []);

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <header className="pt-32 sm:pt-40 pb-12">
          <div className="max-w-3xl mx-auto px-6">
            <button
              onClick={() => navigate("/hq")}
              className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hover:text-foreground mb-6"
            >
              ← HQ
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent/50 mb-4">
              Content · Selected Works
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground tracking-tight">
              Case-study chapters
            </h1>
            <p className="text-[13px] text-muted-foreground/65 mt-4 leading-relaxed max-w-xl">
              Each chapter is a single working build, kept editorial. Click a row to edit scope,
              status, hero image and the client-facing summary that powers the Client Portal.
            </p>
          </div>
        </header>

        <section className="border-t border-border/10">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <ul className="divide-y divide-border/10">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => navigate(`/hq/projects/${p.id}`)}
                    className="w-full text-left py-6 grid grid-cols-12 gap-3 items-baseline hover:bg-muted/10 transition-colors"
                  >
                    <span className="col-span-3 font-mono text-[10px] uppercase tracking-[0.25em] text-accent/55">
                      {p.code}
                    </span>
                    <span className="col-span-6 font-serif text-[16px] text-foreground/90">
                      {p.name}
                    </span>
                    <span className="col-span-3 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-accent/40">
                      Open →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}
