import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { RefreshCw } from "lucide-react";

const FIELD_NOTES = [
  { slug: "covered-arena-night-work", title: "Covered Arena — Night Work", status: "Published" },
  { slug: "main-ridge-pavilion-finishes", title: "Main Ridge — Pavilion Finishes", status: "Published" },
  { slug: "aberdeen-lounge-handover", title: "Aberdeen — Lounge Handover", status: "Draft" },
];

export default function AdminFieldNotes() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, authLoading, navigate]);

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
              Content · Field Notes
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground tracking-tight">
              Published field notes
            </h1>
            <p className="text-[13px] text-muted-foreground/65 mt-4 leading-relaxed max-w-xl">
              Short editorial dispatches from the build. Keep the count low and the cadence honest —
              one note a fortnight outperforms a feed.
            </p>
          </div>
        </header>

        <section className="border-t border-border/10">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <ul className="divide-y divide-border/10">
              {FIELD_NOTES.map((n) => (
                <li key={n.slug} className="py-6 grid grid-cols-12 gap-3 items-baseline">
                  <span className="col-span-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent/45">
                    {n.status}
                  </span>
                  <span className="col-span-8 font-serif text-[16px] text-foreground/90">
                    {n.title}
                  </span>
                  <span className="col-span-2 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                    Coming
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground/45 italic mt-8">
              Field-note authoring will move into the same project detail editor once /hq/projects
              writes are wired through.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
