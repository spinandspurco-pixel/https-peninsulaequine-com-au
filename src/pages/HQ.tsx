import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import logoPeMark from "@/assets/logo-pe-mark.webp";

/* ── Division data ────────────────────────────────── */

const DIVISIONS = [
  {
    num: "01",
    title: "Build",
    role: "Project Delivery",
    body: "Site-to-handover execution across arenas, stables, barns, and rural infrastructure. Every project managed on-property, on-schedule.",
    cta: "Start a Project",
    href: "/site-assessment",
  },
  {
    num: "02",
    title: "Signature Systems",
    role: "Proprietary Engineering",
    body: "GroundLock and future engineered systems — developed in-house, validated through builds, designed for how properties actually perform.",
    cta: "Enquire About Systems",
    href: "/systems",
  },
  {
    num: "03",
    title: "GroundLock Systems",
    role: "Systems Division",
    body: "Ground stabilisation systems, hardware, and GroundLock configurations — fabricated to Peninsula Equine tolerances, available as standalone products.",
    cta: "Explore Forge",
    href: "/forge",
  },
];

/* ── Page ──────────────────────────────────────────── */

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
        <div className="absolute inset-0 grain-texture opacity-15" />

        <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
          <div
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: "150ms", animationFillMode: "both" }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 border border-accent/20 bg-accent/5 mb-8">
              <img src={logoPeMark} alt="P.E" className="h-7 w-7 object-contain" />
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
            className="mt-8 text-[13px] sm:text-[14px] text-muted-foreground/50 max-w-sm mx-auto leading-[2] opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both" }}
          >
            Three divisions. One standard.<br />
            Build. Engineer. Deliver.
          </p>
        </div>
      </section>

      {/* ── Division Blocks ──────────────────────────── */}
      <section className="pb-24 sm:pb-32">
        <div className="section-container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5">
            {DIVISIONS.map((div, i) => (
              <RevealOnScroll key={div.title} direction="up" stagger={i} staggerInterval={120}>
                <Link
                  to={div.href}
                  className="group relative flex flex-col p-8 sm:p-10 lg:p-12 min-h-[300px] border border-border/30 hover:border-border/40 bg-card/40 hover:bg-card/60 transition-all duration-700"
                >
                  <div className="absolute top-0 left-0 w-8 h-px bg-accent/30 group-hover:w-14 group-hover:bg-accent/40 transition-all duration-700" />

                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-3 block">
                    {div.num}
                  </span>

                  <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/35 mb-8">
                    {div.role}
                  </p>

                  <h3 className="font-serif text-[17px] sm:text-[18px] font-medium text-foreground/80 tracking-[0.02em] mb-5 group-hover:text-foreground/90 transition-colors duration-500">
                    {div.title}
                  </h3>

                  <p className="text-[12px] text-muted-foreground/45 leading-[2.1] max-w-[280px] flex-1">
                    {div.body}
                  </p>

                  <div className="flex items-center gap-2 mt-8 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-700 translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent/60">{div.cta}</span>
                    <ArrowRight className="w-3 h-3 text-accent/50" />
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Horizon ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-border/15">
        <div className="section-container max-w-md mx-auto text-center">
          <RevealOnScroll>
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40 mb-6">
              Expanding
            </p>
            <p className="text-[12px] sm:text-[13px] text-muted-foreground/40 leading-[2.2]">
              Planning tools, entry automation, forecourt products, and
              estate hardware — validated through builds before release.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Staff Sign-In ────────────────────────────── */}
      <section className="py-24 sm:py-32 border-t border-border/15">
        <div className="section-container max-w-md mx-auto">
          <RevealOnScroll>
            <div className="text-center mb-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/45 mb-4">
                Staff Access
              </p>
              <p className="text-[12px] text-muted-foreground/45 leading-relaxed">
                Secure portal for Peninsula Equine team members.
              </p>
            </div>

            <div className="bg-card/60 border border-border/30 p-6 sm:p-8 space-y-6">
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

              <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed">
                Staff accounts are managed by your administrator.{" "}
                <a href="mailto:info@peninsulaequine.org" className="text-accent/60 hover:text-accent transition-colors">
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
