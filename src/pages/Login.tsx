import { useState } from "react";
import { Navigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { resolveLandingPath, authLog } from "@/lib/authRouting";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, Lock } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { StaffPortalFrame } from "@/components/StaffPortalFrame";
import { HqLoadingState } from "@/components/hq/HqLoadingState";
import { clearLocalAuthCacheAndSignOut } from "@/lib/authCache";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { user, roles, ready, rolesLoading, signIn, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirectTo = searchParams.get("redirect") || null;

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

    // No success toast — the redirect to the role landing page is the
    // real confirmation. A standalone "Welcome back" toast on the login
    // screen reads like success even when state hasn't actually changed.
  };

  // Render-time redirect: never paint the form (or the authed HqHeader
  // chrome that sits above it) for a signed-in user. Doing this in an
  // effect lets one frame of the form flash before navigate() runs, which
  // is what produced the "signed-in top bar + login form" bug.
  if (ready && user) {
    // Wait for roles before deciding destination — otherwise a freshly
    // signed-in user with roles still loading would briefly resolve to
    // "/login" (no roles yet) and render a blank <Navigate> loop.
    if (rolesLoading) {
      return (
        <Layout>
          <HqLoadingState label="Resolving access…" hint="Verifying your role before routing you in." />
        </Layout>
      );
    }
    const dest = resolveLandingPath(roles, redirectTo);
    authLog("login:redirect", { dest, roles, redirectTo, here: location.pathname });
    // Signed in but no recognised role — resolveLandingPath returns "/login",
    // which would render an empty <Navigate> loop and a blank page. Show an
    // actionable "no access" state instead.
    if (dest === location.pathname) {
      return (
        <Layout>
          <div className="min-h-[80vh] flex items-center justify-center bg-secondary px-6">
            <div className="max-w-md w-full text-center space-y-5">
              <h1 className="font-serif text-2xl text-foreground">No staff access on this account</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You're signed in as <span className="font-mono text-foreground/80">{user.email}</span>, but this
                account has no staff role assigned. Ask an administrator to grant access, or sign out and use a
                different account.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={async () => { await signOut(); }}
                  className="text-xs font-mono uppercase tracking-[0.25em] text-foreground hover:text-accent transition-colors"
                >
                  Sign out
                </button>
                <span className="text-muted-foreground/40">·</span>
                <button
                  type="button"
                  onClick={() => void clearLocalAuthCacheAndSignOut()}
                  className="text-xs font-mono uppercase tracking-[0.25em] text-foreground hover:text-accent transition-colors"
                >
                  Clear cache + sign out
                </button>
              </div>
            </div>
          </div>
        </Layout>
      );
    }
    return <Navigate to={dest} replace />;
  }

  if (!ready) {
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
                    placeholder="you@peninsulaequine.systems"
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
              disabled={isLoading}
              className="w-full h-11 border-border/50 hover:border-accent/30 hover:bg-accent/5 text-sm rounded-sm transition-all duration-200"
              onClick={async () => {
                const inIframe = (() => {
                  try { return window.self !== window.top; } catch { return true; }
                })();
                authLog("oauth:google:click", {
                  redirect_uri: window.location.origin,
                  href: window.location.href,
                  inIframe,
                });
                setIsLoading(true);
                // Safety net: if neither error, redirect, nor SIGNED_IN
                // happens within 15s, clear the spinner and surface an error
                // so the button never spins forever on a swallowed popup.
                const watchdog = window.setTimeout(() => {
                  authLog("oauth:google:watchdog-timeout", { inIframe });
                  setIsLoading(false);
                  toast.error(
                    inIframe
                      ? "Google sign-in didn't complete inside the preview. Open the site in a new tab and try again."
                      : "Google sign-in didn't complete. Check that pop-ups are allowed and try again."
                  );
                }, 15000);
                try {
                  const result = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  authLog("oauth:google:result", {
                    hasError: !!result?.error,
                    errorMsg: result?.error?.message,
                    redirected: !!result?.redirected,
                  });
                  if (result?.error) {
                    window.clearTimeout(watchdog);
                    setIsLoading(false);
                    toast.error(
                      result.error.message
                        ? `Google sign-in failed: ${result.error.message}`
                        : "Google sign-in failed."
                    );
                    return;
                  }
                  if (result?.redirected) {
                    // Browser is navigating away — keep spinner, drop watchdog.
                    window.clearTimeout(watchdog);
                    return;
                  }
                  // Popup flow: tokens already set. The session-driven effect
                  // above will navigate once `ready && user`. Clear the
                  // watchdog; spinner stays until that redirect lands.
                  window.clearTimeout(watchdog);
                } catch (err) {
                  window.clearTimeout(watchdog);
                  authLog("oauth:google:throw", {
                    msg: err instanceof Error ? err.message : String(err),
                  });
                  setIsLoading(false);
                  toast.error("Google sign-in failed unexpectedly.");
                }
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
              <a href="mailto:info@peninsulaequine.systems" className="text-accent/80 hover:text-accent transition-colors">
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
