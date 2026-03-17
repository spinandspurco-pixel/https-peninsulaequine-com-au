import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, Lock } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { StaffPortalFrame } from "@/components/StaffPortalFrame";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { user, isAdmin, isEmployee, isTrainer, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;

  useEffect(() => {
    if (!loading && user) {
      if (redirectTo) navigate(redirectTo);
      else if (isAdmin) navigate("/admin");
      else if (isEmployee || isTrainer) navigate("/employee");
    }
  }, [user, isAdmin, isEmployee, isTrainer, loading, navigate, redirectTo]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Invalid email or password. Contact admin if you need access."
          : error.message
      );
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back.");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center bg-secondary">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
            <p className="text-muted-foreground text-[11px] uppercase tracking-[0.2em]">Authenticating…</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <StaffPortalFrame
        title="Staff Portal"
        subtitle="Secure access with role-based routing."
      >
        <div className="bg-card/80 backdrop-blur border border-border/60 rounded-sm shadow-xl">
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
                  Email
                </Label>
                <div className={`rounded-sm transition-all duration-200 ${focusedField === "email" ? "ring-1 ring-accent/60" : ""}`}>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@peninsulaequine.com.au"
                    required
                    autoComplete="email"
                    className="h-11 bg-background/60 border-border/50 rounded-sm text-sm placeholder:text-muted-foreground/50 focus-visible:ring-accent/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
                  Password
                </Label>
                <div className={`relative rounded-sm transition-all duration-200 ${focusedField === "password" ? "ring-1 ring-accent/60" : ""}`}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="h-11 pr-10 bg-background/60 border-border/50 rounded-sm text-sm placeholder:text-muted-foreground/50 focus-visible:ring-accent/40"
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
                className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-[11px] font-medium rounded-sm shadow-md shadow-accent/15 transition-all duration-200"
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
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-border/50 hover:border-accent/30 hover:bg-accent/5 text-sm rounded-sm transition-all duration-200"
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
          </div>

          <div className="px-6 sm:px-8 py-4 border-t border-border/30 bg-muted/20">
            <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
              Staff accounts are managed by your administrator.{" "}
              <a href="mailto:info@peninsulaequine.com.au" className="text-accent/80 hover:text-accent transition-colors">
                Request access
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-accent transition-colors uppercase tracking-[0.1em]">
            <ArrowLeft className="h-3 w-3" />
            Back to site
          </Link>
        </div>
      </StaffPortalFrame>
    </Layout>
  );
}
