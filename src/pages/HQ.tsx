import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import logoPeMark from "@/assets/logo-pe-mark.webp";

const SYSTEM_LINES = [
  { label: "Track", statement: "Every project mapped from enquiry to handover." },
  { label: "Analyse", statement: "Land conditions assessed before a single post is set." },
  { label: "Design", statement: "System-led decisions — not guesswork." },
];

export default function HQ() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { user, isAdmin, isEmployee, isTrainer, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) navigate("/admin");
      else if (isEmployee || isTrainer) navigate("/employee");
    }
  }, [user, isAdmin, isEmployee, isTrainer, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Invalid credentials. Staff accounts are created by admin."
          : error.message
      );
      setIsLoading(false);
      return;
    }

    if (data.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .in("role", ["admin", "employee", "trainer"])
        .maybeSingle();

      if (!roleData) {
        toast.error("No staff access. Contact your administrator.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back.");
      navigate(roleData.role === "admin" ? "/admin" : "/employee");
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-44 sm:pt-56 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        {/* Blueprint grid overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          style={{ opacity: 0.03 }}
        >
          <defs>
            <pattern id="hq-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <line x1="80" y1="0" x2="80" y2="80" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="80" y2="80" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hq-grid)" />
        </svg>

        <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: "150ms", animationFillMode: "both" }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 border border-accent/15 bg-accent/[0.03] mb-8">
              <img src={logoPeMark} alt="P.E" className="h-7 w-7 object-contain" loading="lazy" decoding="async" />
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-5 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "250ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/20" />
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40">
              Command Centre
            </p>
            <div className="w-8 h-px bg-accent/20" />
          </div>

          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-[1.1] opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Peninsula Equine HQ
          </h1>

          <p
            className="mt-8 font-mono text-[10px] uppercase tracking-[0.4em] opacity-0 animate-fade-in"
            style={{
              animationDelay: "700ms",
              animationFillMode: "both",
              color: "hsl(var(--muted-foreground) / 0.2)",
            }}
          >
            Controlled process. Engineered outcome.
          </p>
        </div>
      </section>

      {/* ── The System Behind Every Build ─────────────── */}
      <section className="relative overflow-hidden">
        <div className="py-32 sm:py-40 lg:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          {/* Subtle engineering lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            style={{ opacity: 0.025 }}
          >
            <line x1="25%" y1="0" x2="25%" y2="100%" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            <line x1="75%" y1="0" x2="75%" y2="100%" stroke="hsl(var(--accent))" strokeWidth="0.5" />
          </svg>

          <div className="section-container max-w-3xl mx-auto relative z-10">
            <RevealOnScroll direction="up">
              <p
                className="font-mono text-[9px] uppercase tracking-[0.35em] text-center mb-16 sm:mb-20"
                style={{ color: "hsl(var(--accent) / 0.3)" }}
              >
                The System Behind Every Build
              </p>
            </RevealOnScroll>

            <div className="space-y-0">
              {SYSTEM_LINES.map((item, i) => (
                <RevealOnScroll key={item.label} direction="up" stagger={i} staggerInterval={140}>
                  <div className="flex items-start gap-6 sm:gap-10 py-8 sm:py-10 border-b border-border/8 last:border-b-0">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.3em] shrink-0 pt-1"
                      style={{ color: "hsl(var(--accent) / 0.25)", minWidth: "60px" }}
                    >
                      {item.label}
                    </span>
                    <p
                      className="font-serif text-[15px] sm:text-[17px] tracking-[0.02em] leading-[1.5]"
                      style={{ color: "hsl(var(--foreground) / 0.3)" }}
                    >
                      {item.statement}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter line ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="section-container max-w-2xl mx-auto text-center relative z-10">
            <RevealOnScroll direction="up">
              <p
                className="font-serif font-light italic tracking-[0.04em]"
                style={{
                  fontSize: "clamp(1rem, 0.5rem + 1.8vw, 1.5rem)",
                  color: "hsl(var(--foreground) / 0.14)",
                }}
              >
                Not a portal. A process.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Staff Sign-In ────────────────────────────── */}
      <section className="py-24 sm:py-32 border-t border-border/10">
        <div className="section-container max-w-md mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/45 mb-4">
                Staff Access
              </p>
              <p className="text-[12px] text-muted-foreground/35 leading-relaxed">
                Authorised team members only.
              </p>
            </div>

            <div className="bg-card/60 border border-border/20 p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="hq-email" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
                    Email
                  </Label>
                  <div className={`transition-all duration-200 ${focusedField === "email" ? "ring-1 ring-accent/60" : ""}`}>
                    <Input
                      id="hq-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@peninsulaequine.org"
                      required
                      autoComplete="email"
                      className="h-11 bg-background/60 border-border/50 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-accent/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hq-password" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
                    Password
                  </Label>
                  <div className={`relative transition-all duration-200 ${focusedField === "password" ? "ring-1 ring-accent/60" : ""}`}>
                    <Input
                      id="hq-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="h-11 pr-10 bg-background/60 border-border/50 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-accent/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-accent transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-[11px] font-medium shadow-md shadow-accent/15 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="mr-2 h-3.5 w-3.5" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    or
                  </span>
                </div>
              </div>

              {/* Google SSO */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-border/40 hover:border-accent/30 hover:bg-accent/5 text-sm transition-all duration-200"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) toast.error("Google sign-in failed.");
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </Button>

              <p className="text-[11px] text-muted-foreground/35 text-center leading-relaxed">
                Staff accounts are managed by your administrator.{" "}
                <a href="mailto:info@peninsulaequine.org" className="text-accent/50 hover:text-accent transition-colors">
                  Request access
                </a>
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
