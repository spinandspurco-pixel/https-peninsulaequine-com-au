import { useEffect, useState } from "react";
import { Navigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { resolveLandingPath, authLog } from "@/lib/authRouting";
import { recordOAuthError } from "@/lib/oauthErrorLog";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, Lock, AlertTriangle, RefreshCw } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { StaffPortalFrame } from "@/components/StaffPortalFrame";
import { HqLoadingState } from "@/components/hq/HqLoadingState";
import { clearLocalAuthCacheAndSignOut } from "@/lib/authCache";
import { trackAuthFunnel } from "@/lib/authFunnel";

type SignInErrorKind = "google" | "session" | "credentials" | "roles";

interface SignInError {
  kind: SignInErrorKind;
  title: string;
  detail: string;
  hint?: string;
  canRetry?: boolean;
  canClearCache?: boolean;
}

function classifyOAuthError(message: string): SignInError {
  const msg = (message || "").toLowerCase();
  if (msg.includes("popup") || msg.includes("blocked")) {
    return {
      kind: "google",
      title: "Google sign-in was blocked",
      detail: message,
      hint: "Your browser blocked the Google popup. Allow pop-ups for this site and try again.",
      canRetry: true,
    };
  }
  if (msg.includes("redirect_uri") || msg.includes("redirect uri")) {
    return {
      kind: "google",
      title: "Google rejected this sign-in URL",
      detail: message,
      hint: "An administrator needs to add this domain to the OAuth allow-list.",
      canRetry: true,
    };
  }
  if (msg.includes("oauth secret") || msg.includes("provider is not enabled")) {
    return {
      kind: "google",
      title: "Google sign-in is not configured",
      detail: message,
      hint: "Contact an administrator — Google credentials need to be re-saved.",
      canRetry: false,
    };
  }
  if (msg.includes("refresh") || msg.includes("session") || msg.includes("token")) {
    return {
      kind: "session",
      title: "Session couldn't be restored",
      detail: message,
      hint: "Your previous session expired. Clear the cache and sign in again.",
      canRetry: true,
      canClearCache: true,
    };
  }
  return {
    kind: "google",
    title: "Google sign-in failed",
    detail: message || "Unknown error",
    hint: "Try again, or use email + password below.",
    canRetry: true,
  };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [signInError, setSignInError] = useState<SignInError | null>(null);
  const { user, roles, ready, rolesLoading, rolesError, signIn, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirectTo = searchParams.get("redirect") || null;

  // Surface URL-borne OAuth errors (Supabase appends ?error=...&error_description=...)
  useEffect(() => {
    const err = searchParams.get("error_description") || searchParams.get("error");
    if (err) {
      setSignInError(classifyOAuthError(err));
      recordOAuthError({ provider: "google", source: "callback-url", message: err });
    }
  }, [searchParams]);

  // Surface a roles-fetch failure as a persistent banner too.
  useEffect(() => {
    if (rolesError) {
      setSignInError({
        kind: "roles",
        title: "Your profile didn't load",
        detail: rolesError,
        hint: "This usually clears with a retry. If not, clear the cache and sign in again.",
        canRetry: true,
        canClearCache: true,
      });
    }
  }, [rolesError]);

  const retryGoogle = async () => {
    setSignInError(null);
    setIsLoading(true);
    trackAuthFunnel("auth_login_attempt", { method: "google", via: "retry", force: true });
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setIsLoading(false);
        const classified = classifyOAuthError(result.error.message || "");
        setSignInError(classified);
        recordOAuthError({ provider: "google", source: "login-retry", message: result.error.message || "" });
        return;
      }
      if (result.redirected) {
        trackAuthFunnel("auth_login_success", { method: "google", via: "redirect", force: true });
        return;
      }
      trackAuthFunnel("auth_login_success", { method: "google", via: "popup", force: true });
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      setSignInError(classifyOAuthError(msg));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignInError(null);
    trackAuthFunnel("auth_login_attempt", { method: "password", force: true });

    const { error } = await signIn(email, password);

    if (error) {
      const isInvalid = error.message === "Invalid login credentials";
      setSignInError({
        kind: "credentials",
        title: isInvalid ? "Email or password is incorrect" : "Sign-in failed",
        detail: error.message,
        hint: isInvalid ? "Double-check your credentials, or contact an administrator." : undefined,
        canRetry: false,
      });
      toast.error(
        isInvalid
          ? "Invalid email or password. Contact admin if you need access."
          : error.message
      );
      setIsLoading(false);
      return;
    }
    trackAuthFunnel("auth_login_success", { method: "password", force: true });
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
        <HqLoadingState label="Checking access…" hint="One moment while we verify the session." />
      </Layout>
    );
  }

  return (
    <Layout>
      <StaffPortalFrame
        title="HQ Access"
        subtitle="Workbench sign-in for Peninsula Equine staff."
      >
        <div className="bg-card/80 backdrop-blur border border-border/60 rounded-sm shadow-xl">
          <div className="p-6 sm:p-8 space-y-6">
            {signInError && (
              <div
                role="alert"
                aria-live="assertive"
                className="border border-destructive/40 bg-destructive/10 rounded-sm p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" aria-hidden />
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-destructive">
                      {signInError.title}
                    </p>
                    {signInError.hint && (
                      <p className="text-[12px] text-foreground/80 leading-relaxed">{signInError.hint}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/80 font-mono break-words">
                      {signInError.detail}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-7">
                  {signInError.canRetry && signInError.kind !== "credentials" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (signInError.kind === "roles") {
                          window.location.reload();
                        } else {
                          void retryGoogle();
                        }
                      }}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-foreground hover:text-accent transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="h-3 w-3" aria-hidden />
                      Retry
                    </button>
                  )}
                  {signInError.canClearCache && (
                    <button
                      type="button"
                      onClick={() => void clearLocalAuthCacheAndSignOut()}
                      className="text-[11px] uppercase tracking-[0.15em] text-foreground hover:text-accent transition-colors"
                    >
                      Clear cache + retry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSignInError(null)}
                    className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70 hover:text-foreground transition-colors ml-auto"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

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
                authLog("oauth:google:click", {
                  redirectTo: window.location.origin,
                  href: window.location.href,
                });
                setSignInError(null);
                setIsLoading(true);
                trackAuthFunnel("auth_login_attempt", { method: "google", force: true });
                const watchdog = window.setTimeout(() => {
                  authLog("oauth:google:watchdog-timeout", {});
                  setIsLoading(false);
                  const e: SignInError = {
                    kind: "google",
                    title: "Google sign-in didn't start",
                    detail: "No redirect happened within 15 seconds.",
                    hint: "Check that pop-ups and redirects are allowed for this site, then retry.",
                    canRetry: true,
                  };
                  setSignInError(e);
                  toast.error(e.title);
                }, 15000);
                try {
                  const result = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  authLog("oauth:google:result", {
                    hasError: !!result.error,
                    errorMsg: result.error?.message,
                    redirected: !!result.redirected,
                  });
                  if (result.error) {
                    window.clearTimeout(watchdog);
                    setIsLoading(false);
                    const classified = classifyOAuthError(result.error.message || "");
                    setSignInError(classified);
                    recordOAuthError({
                      provider: "google",
                      source: "login-button",
                      message: result.error.message || "Unknown error",
                    });
                    toast.error(classified.title);
                    return;
                  }
                  if (result.redirected) {
                    window.clearTimeout(watchdog);
                    return;
                  }
                  window.clearTimeout(watchdog);
                } catch (err) {
                  window.clearTimeout(watchdog);
                  const msg = err instanceof Error ? err.message : String(err);
                  authLog("oauth:google:throw", { msg });
                  const classified = classifyOAuthError(msg);
                  setSignInError(classified);
                  recordOAuthError({
                    provider: "google",
                    source: "login-button",
                    message: msg,
                  });
                  setIsLoading(false);
                  toast.error(classified.title);
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
