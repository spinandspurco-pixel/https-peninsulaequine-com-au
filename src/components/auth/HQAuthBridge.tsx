/**
 * HQ Authentication Bridge — Usage Example
 *
 * This component demonstrates how to integrate the new server-side
 * authentication adapter with a modern form UI.
 */

import { useState } from "react";
import { ANIMATION_TIMING, buildTransition } from "@/lib/animationConstants";

export type HQAuthResult = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; user: string }
  | { status: "error"; message: string };

/**
 * HQ Login Form with Server-Side Auth Bridge
 *
 * Features:
 * - Sends credentials to /api/auth/login (Vercel serverless function)
 * - Bridge translates to legacy API format
 * - Handles cookies/tokens transparently
 * - Graceful error handling with Blueprint-themed alerts
 * - Blueprint-consistent motion and timing
 */
export function HQAuthBridge() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<HQAuthResult>({ status: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult({ status: "loading" });

    try {
      // Call the server-side bridge instead of the legacy API directly
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Critical: sends/receives cookies
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Legacy API rejected credentials
        setResult({
          status: "error",
          message: data.error || "Authentication failed",
        });
        return;
      }

      // Success — token and user info in response
      setResult({
        status: "success",
        user: data.user || username,
      });

      // Clear form and redirect after brief success state
      setTimeout(() => {
        setUsername("");
        setPassword("");
        // Redirect to HQ dashboard
        window.location.href = "/hq";
      }, 800);
    } catch (error) {
      setResult({
        status: "error",
        message:
          error instanceof Error ? error.message : "Network error occurred",
      });
    }
  };

  return (
    <div className="pe-reveal" style={{ "--reveal-min-height": "400px" } as React.CSSProperties}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="heading-editorial">HQ Command Centre</h2>

        {/* Username Input */}
        <div>
          <label
            htmlFor="username"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.875rem",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={result.status === "loading"}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "2px",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--input))",
              color: "hsl(var(--foreground))",
              transition: buildTransition("border-color", "fast", "interactive"),
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--ring))";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--border))";
            }}
          />
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "0.875rem",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={result.status === "loading"}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "2px",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--input))",
              color: "hsl(var(--foreground))",
              transition: buildTransition("border-color", "fast", "interactive"),
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--ring))";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "hsl(var(--border))";
            }}
          />
        </div>

        {/* Status Messages */}
        {result.status === "loading" && (
          <div
            className="alert alert-info"
            style={{
              opacity: 1,
              animation: `fadeIn ${ANIMATION_TIMING.duration.normal}ms ${ANIMATION_TIMING.ease.default}`,
            }}
          >
            Authenticating via secure bridge...
          </div>
        )}

        {result.status === "success" && (
          <div
            className="alert alert-success"
            style={{
              color: "hsl(var(--accent))",
              opacity: 1,
              animation: `fadeIn ${ANIMATION_TIMING.duration.normal}ms ${ANIMATION_TIMING.ease.default}`,
            }}
          >
            Welcome, {result.user}. Redirecting to HQ...
          </div>
        )}

        {result.status === "error" && (
          <div
            className="alert alert-danger error-message"
            style={{
              opacity: 1,
              animation: `fadeIn ${ANIMATION_TIMING.duration.normal}ms ${ANIMATION_TIMING.ease.default}`,
              // Blueprint override automatically applies:
              // color: hsl(var(--bp-alert-danger))
              // border-color: hsl(var(--bp-alert-danger))
            }}
          >
            <strong>Authentication Failed:</strong> {result.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={result.status === "loading" || !username || !password}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "2px",
            border: "1px solid hsl(var(--ring))",
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
            cursor: result.status === "loading" ? "wait" : "pointer",
            fontWeight: 600,
            letterSpacing: "0.05em",
            transition: buildTransition("background-color", "fast", "interactive"),
            opacity: result.status === "loading" ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (result.status !== "loading") {
              e.currentTarget.style.backgroundColor = "hsl(var(--accent) / 0.85)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "hsl(var(--accent))";
          }}
        >
          {result.status === "loading" ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Blueprint alert styling now automatically applied via global override */
        .alert-danger {
          padding: 12px 16px;
          border-radius: 2px;
          border-left: 3px solid;
          border-color: hsl(var(--bp-alert-danger));
          background-color: hsl(var(--card) / 0.5);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .alert-info {
          padding: 12px 16px;
          border-radius: 2px;
          border-left: 3px solid hsl(var(--bp-alert-info));
          background-color: hsl(var(--card) / 0.5);
          color: hsl(var(--bp-alert-info));
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .alert-success {
          padding: 12px 16px;
          border-radius: 2px;
          border-left: 3px solid hsl(var(--accent));
          background-color: hsl(var(--card) / 0.5);
          font-size: 0.875rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default HQAuthBridge;
