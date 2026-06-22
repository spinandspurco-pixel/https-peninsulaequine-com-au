// TEMPORARY E2E HELPER — verify-admin-login
// ----------------------------------------------------------------------
// Purpose: validate the renamed admin identity end-to-end from a place
// that DOES have TEST_ADMIN_PASSWORD (edge-function secrets), since the
// Lovable sandbox shell does not receive newly added runtime secrets and
// blocks the normal Playwright path.
//
// Behaviour:
//   1. Requires gating (either path):
//        a) Authorization: Bearer <jwt> belonging to a user with the
//           `admin` role in public.user_roles, OR
//        b) x-e2e-verify-secret: <value> matching env E2E_VERIFY_SECRET.
//   2. Performs supabase.auth.signInWithPassword for
//      info@peninsulaequine.systems using TEST_ADMIN_PASSWORD.
//   3. Confirms a session was returned and the user's role is admin.
//   4. Returns ONLY { ok, email, role, userId }. Never returns or logs
//      the password, access token, refresh token, or full session.
//
// Cleanup: once TEST_ADMIN_PASSWORD is reliably injected into the sandbox
// shell (so the standalone Playwright project can run unaided), delete
// this folder and call supabase--delete_edge_functions(["verify-admin-login"]).
// Also remove the E2E_VERIFY_SECRET secret and the fallback branch in
// e2e/admin-login.spec.ts.
// ----------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-e2e-verify-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("TEST_ADMIN_PASSWORD") ?? "";
const VERIFY_SECRET = Deno.env.get("E2E_VERIFY_SECRET") ?? "";

const EXPECTED_EMAIL = "info@peninsulaequine.systems";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Constant-time string compare to avoid timing oracles on the gate secret.
function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function callerIsAdmin(jwt: string): Promise<boolean> {
  if (!jwt) return false;
  try {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return false;

    const svc = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await svc
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    return Boolean(roleRow);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // --- Gate ---
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const headerSecret = (req.headers.get("x-e2e-verify-secret") ?? "").trim();

  const gateAdmin = await callerIsAdmin(jwt);
  const gateSecret = VERIFY_SECRET.length > 0 && safeEqual(headerSecret, VERIFY_SECRET);

  if (!gateAdmin && !gateSecret) {
    return json({ error: "forbidden" }, 403);
  }

  // --- Preconditions ---
  if (!ADMIN_PASSWORD) {
    return json({ ok: false, error: "TEST_ADMIN_PASSWORD not configured" }, 500);
  }

  // --- Perform sign-in with an anon client (no session persistence) ---
  const anon = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email: EXPECTED_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (signInErr || !signIn?.session || !signIn?.user) {
    // Do NOT echo password or any token; surface only the auth error code.
    return json(
      {
        ok: false,
        email: EXPECTED_EMAIL,
        error: signInErr?.message ?? "sign_in_failed",
      },
      401,
    );
  }

  const userId = signIn.user.id;

  // Best-effort: revoke the issued session immediately so we never leave
  // a stray refresh token alive on the auth server.
  try {
    await anon.auth.signOut();
  } catch {
    /* ignore */
  }

  // --- Role lookup via service role (bypasses RLS, no caller context) ---
  const svc = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: roleRow, error: roleErr } = await svc
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleErr) {
    return json({ ok: false, email: EXPECTED_EMAIL, userId, error: "role_lookup_failed" }, 500);
  }

  const role = roleRow?.role ?? null;
  const ok = role === "admin";

  return json({ ok, email: EXPECTED_EMAIL, role, userId }, ok ? 200 : 403);
});
