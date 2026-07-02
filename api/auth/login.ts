/**
 * Authentication Adapter — Server-Side Bridge to Legacy API
 *
 * This route acts as a secure intermediary between the modern frontend
 * and the legacy API. It handles the exact "handshake" the legacy system
 * requires by:
 *
 * 1. Accepting JSON credentials from the frontend
 * 2. Converting to the legacy format (form-encoded or custom headers)
 * 3. Passing through required headers, cookies, and auth schemes
 * 4. Returning credentials and session tokens to the frontend
 *
 * Benefits:
 * - Bypasses CORS errors (request originates from Vercel server, not browser)
 * - Controls request format precisely (form-encoded vs JSON)
 * - Handles cookie/session negotiation server-side
 * - Logs request/response for debugging without exposing secrets
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Legacy API configuration — update these with your actual endpoints
const LEGACY_API_BASE = process.env.LEGACY_API_URL || "https://legacy-api.example.com";
const LEGACY_API_LOGIN_PATH = "/login"; // Update if your endpoint differs

/**
 * POST /api/auth/login
 * Bridges modern frontend credentials to legacy authentication.
 *
 * Request body: JSON { username: string, password: string, ... }
 * Response: { success: boolean, token?: string, error?: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password, ...extraFields } = req.body;

    // Validate minimal input
    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    // ──────────────────────────────────────────────────
    // 1. Prepare credentials in legacy format
    // ──────────────────────────────────────────────────
    // Most legacy systems expect form-encoded (application/x-www-form-urlencoded)
    const formBody = new URLSearchParams();
    formBody.append("username", username);
    formBody.append("password", password);

    // Attach any extra fields (e.g., mfa_code, remember_me, etc.)
    Object.entries(extraFields).forEach(([key, value]) => {
      if (value != null) {
        formBody.append(key, String(value));
      }
    });

    // Log the handshake attempt (without exposing credentials)
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth-adapter] Initiating legacy handshake", {
        endpoint: `${LEGACY_API_BASE}${LEGACY_API_LOGIN_PATH}`,
        format: "application/x-www-form-urlencoded",
        fieldsCount: formBody.toString().split("&").length,
      });
    }

    // ──────────────────────────────────────────────────
    // 2. Execute the bridge request
    // ──────────────────────────────────────────────────
    const legacyResponse = await fetch(`${LEGACY_API_BASE}${LEGACY_API_LOGIN_PATH}`, {
      method: "POST",
      headers: {
        // Essential headers for legacy handshake
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest", // Often required by legacy systems
        "Accept": "application/json",
        // If your legacy API requires additional headers (e.g., Origin, Referer, custom auth)
        // Add them here. Avoid exposing these in client-side code.
        // "Authorization": req.headers.authorization || "",
        // "X-API-Key": process.env.LEGACY_API_KEY || "",
      },
      body: formBody.toString(),
    });

    // ──────────────────────────────────────────────────
    // 3. Parse and relay the response
    // ──────────────────────────────────────────────────
    const data = await legacyResponse.json();

    // Log response status (without sensitive data)
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth-adapter] Legacy response", {
        status: legacyResponse.status,
        hasData: !!data,
        hasCookie: !!legacyResponse.headers.get("set-cookie"),
      });
    }

    // ──────────────────────────────────────────────────
    // 4. Handle set-cookie headers from legacy API
    // ──────────────────────────────────────────────────
    // The modern frontend often needs session cookies from the legacy backend
    const setCookie = legacyResponse.headers.get("set-cookie");

    if (legacyResponse.ok) {
      // Success — pass auth response back to frontend
      res.status(legacyResponse.status);

      if (setCookie) {
        // Pass the cookie back to the frontend so the browser stores it
        res.setHeader("Set-Cookie", setCookie);
      }

      return res.json(data);
    } else {
      // Failure — relay the legacy error status and message
      return res.status(legacyResponse.status).json({
        error: data.error || "Authentication failed",
        details: data,
      });
    }
  } catch (error) {
    console.error("[auth-adapter] Bridge failure", {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      error: "Authentication bridge failed. Please check your connection and try again.",
    });
  }
}
