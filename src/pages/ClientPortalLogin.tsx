import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { cn } from "@/lib/utils";

export default function ClientPortalLogin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/portal", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });

    if (authError) {
      setError("Unable to send access link. Please try again.");
    } else {
      setSent(true);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6 relative overflow-hidden">
      {/* Blueprint overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
        <BlueprintLineOverlay variant="dimensions" color="light" />
      </div>
      <div className="absolute inset-0 grain-texture opacity-[0.015] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm text-center">
        {!sent ? (
          <>
            <p
              className="text-[10px] font-mono uppercase tracking-[0.35em] text-accent/35 mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              Client Portal
            </p>

            <h1
              className="font-serif text-2xl sm:text-3xl text-primary-foreground/80 tracking-tight leading-[1.1] mb-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "both" }}
            >
              Private Access
            </h1>

            <p
              className="text-[12px] text-primary-foreground/25 leading-relaxed mb-10 opacity-0 animate-fade-in"
              style={{ animationDelay: "700ms", animationFillMode: "both" }}
            >
              Enter your project email to receive an access link.
            </p>

            <form
              onSubmit={handleMagicLink}
              className="space-y-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "900ms", animationFillMode: "both" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-transparent border border-primary-foreground/[0.08] px-5 py-3.5 text-sm text-primary-foreground/60 placeholder:text-primary-foreground/15 focus:border-accent/25 focus:outline-none transition-colors duration-500 rounded-sm"
              />
              {error && (
                <p className="text-[11px] text-red-400/60">{error}</p>
              )}
              <button
                type="submit"
                disabled={sending}
                className={cn(
                  "w-full py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-500 rounded-sm",
                  sending
                    ? "bg-accent/15 text-accent-foreground/25 cursor-wait"
                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                )}
              >
                {sending ? "Sending…" : "Request Access"}
              </button>
            </form>

            <p
              className="text-[9px] text-primary-foreground/10 mt-8 italic opacity-0 animate-fade-in"
              style={{ animationDelay: "1200ms", animationFillMode: "both" }}
            >
              Access is by invitation only.
            </p>
          </>
        ) : (
          <div className="space-y-6">
            <div className="w-8 h-px bg-accent/20 mx-auto" />
            <p className="font-serif text-xl text-primary-foreground/70">
              Access link sent.
            </p>
            <p className="text-[12px] text-primary-foreground/25 leading-relaxed">
              Check your email for a secure link to your project portal.
            </p>
            <p className="text-[9px] text-primary-foreground/12 italic">
              The link expires in 1 hour.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
