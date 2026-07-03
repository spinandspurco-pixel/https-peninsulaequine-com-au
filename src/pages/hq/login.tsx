import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { logClientEvent } from "@/lib/clientLog";
import { usePageMeta } from "@/lib/usePageMeta";

type AuthMode = "signin" | "signup" | "forgot";

interface AuthError {
  message: string;
  code?: string;
}

export default function HQLogin() {
  usePageMeta({
    title: "HQ Login — Peninsula Equine",
    description: "Secure access to Peninsula Equine HQ dashboard.",
    path: "/hq/login",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/hq/dashboard", { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  // Clear errors on mode change
  useEffect(() => {
    setError(null);
    setSuccess("");
  }, [mode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        logClientEvent("hq_signin_error", {
          error_code: signInError.status,
          error_message: signInError.message,
        });
        setError({
          message: signInError.message || "Failed to sign in. Please try again.",
          code: signInError.status?.toString(),
        });
        return;
      }

      logClientEvent("hq_signin_success", { email });
      navigate("/hq/dashboard", { replace: true });
    } catch (err) {
      logClientEvent("hq_signin_exception", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setError({
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError({ message: "Passwords do not match." });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError({ message: "Password must be at least 8 characters." });
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/hq/auth/callback`,
        },
      });

      if (signUpError) {
        logClientEvent("hq_signup_error", {
          error_code: signUpError.status,
          error_message: signUpError.message,
        });
        setError({
          message: signUpError.message || "Failed to create account.",
          code: signUpError.status?.toString(),
        });
        return;
      }

      logClientEvent("hq_signup_success", { email });
      setSuccess(
        "Account created! Check your email for confirmation before signing in."
      );
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setMode("signin"), 3000);
    } catch (err) {
      logClientEvent("hq_signup_exception", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setError({
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/hq/auth/reset-password`,
        }
      );

      if (resetError) {
        logClientEvent("hq_password_reset_error", {
          error_code: resetError.status,
          error_message: resetError.message,
        });
        setError({
          message:
            resetError.message || "Failed to send reset email. Try again.",
          code: resetError.status?.toString(),
        });
        return;
      }

      logClientEvent("hq_password_reset_sent", { email });
      setSuccess("Password reset email sent. Check your inbox.");
      setEmail("");
    } catch (err) {
      logClientEvent("hq_password_reset_exception", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setError({
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/hq/auth/callback`,
        },
      });

      if (googleError) {
        logClientEvent("hq_google_signin_error", {
          error_message: googleError.message,
        });
        setError({
          message: "Failed to sign in with Google. Please try again.",
        });
        setLoading(false);
      }
    } catch (err) {
      logClientEvent("hq_google_signin_exception", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      setError({
        message: "An unexpected error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center px-4 py-12">
      {/* Ambient background elements */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--accent) / 0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 right-1/4 w-96 h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent) / 0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-foreground/90 text-2xl tracking-tight mb-2">
            Peninsula Equine
          </h1>
          <p className="font-mono uppercase text-foreground/50 text-[10px] tracking-[0.4em]">
            HQ Access
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="relative backdrop-blur-sm bg-background/80 border border-accent/20 rounded-lg p-8 shadow-lg"
          style={{
            boxShadow: "0 8px 32px hsl(var(--accent) / 0.12)",
          }}
        >
          {/* Mode Tabs */}
          <div className="flex gap-1 mb-8 p-1 bg-background/50 rounded-md border border-accent/10">
            {(["signin", "signup", "forgot"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={loading}
                className={`flex-1 py-2 px-3 text-[11px] font-mono uppercase tracking-[0.3em] rounded transition-all duration-300 ${
                  mode === m
                    ? "bg-accent/20 text-foreground border border-accent/30"
                    : "text-foreground/50 hover:text-foreground/70"
                }`}
              >
                {m === "signin"
                  ? "Sign In"
                  : m === "signup"
                    ? "Sign Up"
                    : "Reset"}
              </button>
            ))}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-500/90 text-[13px] font-light leading-relaxed">
                {success}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500/90 text-[13px] font-light leading-relaxed">
                {error.message}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={
              mode === "signin"
                ? handleSignIn
                : mode === "signup"
                  ? handleSignUp
                  : handleForgotPassword
            }
            className="space-y-5"
          >
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block font-mono text-foreground/70 text-[10px] uppercase tracking-[0.3em]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 bg-background/50 border border-accent/20 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent/50 focus:bg-background/70 transition-all duration-300 text-[14px]"
                placeholder="your@email.com"
              />
            </div>

            {/* Password Input (Sign In & Sign Up) */}
            {mode !== "forgot" && (
              <div className="space-y-2">
                <label className="block font-mono text-foreground/70 text-[10px] uppercase tracking-[0.3em]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-3 bg-background/50 border border-accent/20 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent/50 focus:bg-background/70 transition-all duration-300 text-[14px] pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/70 transition-colors"
                  >
                    {showPassword ? (
                      <span className="text-[12px]">Hide</span>
                    ) : (
                      <span className="text-[12px]">Show</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Sign Up Only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="block font-mono text-foreground/70 text-[10px] uppercase tracking-[0.3em]">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-accent/20 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent/50 focus:bg-background/70 transition-all duration-300 text-[14px]"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Forgot Password Link (Sign In Mode) */}
            {mode === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-accent/70 hover:text-accent transition-colors text-[11px] font-mono uppercase tracking-[0.3em]"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent/80 hover:bg-accent disabled:bg-accent/50 text-background font-mono uppercase text-[11px] tracking-[0.3em] rounded-lg transition-all duration-300 mt-6"
              style={{
                boxShadow: "0 4px 16px hsl(var(--accent) / 0.3)",
              }}
            >
              {loading ? "Processing..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"}
            </button>
          </form>

          {/* Divider */}
          {mode === "signin" && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-accent/10" />
                <span className="text-foreground/50 text-[10px] font-mono uppercase tracking-[0.3em]">
                  Or
                </span>
                <div className="flex-1 h-px bg-accent/10" />
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 bg-background/50 border border-accent/20 hover:border-accent/40 disabled:border-accent/10 text-foreground font-mono uppercase text-[11px] tracking-[0.3em] rounded-lg transition-all duration-300"
              >
                {loading ? "..." : "Sign In with Google"}
              </button>
            </>
          )}

          {/* Mode Switch Link */}
          <div className="mt-6 text-center text-[12px]">
            {mode === "signin" && (
              <p>
                No account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-accent/70 hover:text-accent transition-colors font-mono uppercase tracking-[0.2em]"
                >
                  Sign up
                </button>
              </p>
            )}
            {mode === "signup" && (
              <p>
                Have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-accent/70 hover:text-accent transition-colors font-mono uppercase tracking-[0.2em]"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <p>
                <button
                  onClick={() => setMode("signin")}
                  className="text-accent/70 hover:text-accent transition-colors font-mono uppercase tracking-[0.2em]"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-foreground/40 text-[11px] font-light mt-8">
          HQ access restricted to authorized personnel.
        </p>
      </div>
    </div>
  );
}
