// Admin-only edge function: provisions / rotates the four e2e test accounts.
//
// - Idempotent: safe to re-run; existing users have their password rotated.
// - Strong password: 32 chars, URL-safe, generated server-side per run.
// - Role assignment: replaces any existing roles for these users with the
//   single intended role (admin / preview / employee / trainer).
// - Tagged as test: user_metadata.is_e2e_test = true so they can be filtered
//   out of operational reporting / public surfaces.
// - Email confirmed on create so the user can sign in immediately.
//
// Auth model: the caller MUST be a signed-in admin. We do not rely on the
// platform JWT gate — we validate in code against public.user_roles.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

type Role = "admin" | "preview" | "employee" | "trainer";

const SEED: Array<{ email: string; role: Role }> = [
  { email: "test-admin@peninsulaequine.org", role: "admin" },
  { email: "test-preview@peninsulaequine.org", role: "preview" },
  { email: "test-employee@peninsulaequine.org", role: "employee" },
  { email: "test-trainer@peninsulaequine.org", role: "trainer" },
];

function strongPassword(): string {
  // 32 bytes → 43 char URL-safe base64. More than enough entropy.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "missing_authorization" }, 401);

  // Verify caller and confirm admin role.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: "invalid_token" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleErr) return json({ error: "role_check_failed", detail: roleErr.message }, 500);
  if (!isAdmin) return json({ error: "forbidden_admin_only" }, 403);

  // Pre-fetch all existing users (test-account volume is tiny — one page).
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) return json({ error: "list_users_failed", detail: listErr.message }, 500);
  const byEmail = new Map(list.users.map((u) => [u.email?.toLowerCase() ?? "", u]));

  const results: Array<{
    email: string;
    role: Role;
    password: string;
    status: "created" | "updated";
    user_id: string;
  }> = [];

  for (const { email, role } of SEED) {
    const password = strongPassword();
    const existing = byEmail.get(email.toLowerCase());

    let userId: string;
    let status: "created" | "updated";

    if (existing) {
      const { data: upd, error: updErr } = await admin.auth.admin.updateUserById(
        existing.id,
        {
          password,
          email_confirm: true,
          user_metadata: {
            ...(existing.user_metadata ?? {}),
            is_e2e_test: true,
            e2e_role: role,
          },
        },
      );
      if (updErr) return json({ error: "update_failed", email, detail: updErr.message }, 500);
      userId = upd.user.id;
      status = "updated";
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { is_e2e_test: true, e2e_role: role },
      });
      if (createErr) return json({ error: "create_failed", email, detail: createErr.message }, 500);
      userId = created.user.id;
      status = "created";
    }

    // Replace any existing roles with the single intended role. We DELETE
    // then INSERT rather than upsert to guarantee no stale grants linger
    // from a previous seed run that targeted a different role.
    const { error: delErr } = await admin.from("user_roles").delete().eq("user_id", userId);
    if (delErr) return json({ error: "role_clear_failed", email, detail: delErr.message }, 500);

    const { error: insErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (insErr) return json({ error: "role_insert_failed", email, detail: insErr.message }, 500);

    results.push({ email, role, password, status, user_id: userId });
  }

  // Build a copy-pasteable env block for Playwright. Wrap with an
  // unmissable warning banner so an operator can't paste this anywhere
  // without seeing the handling rules.
  const WARNING = [
    "############################################################",
    "#  E2E TEST CREDENTIALS — HANDLE AS SECRETS                #",
    "#                                                          #",
    "#  DO NOT paste passwords into chat, GitHub, tickets, or   #",
    "#  shared documents.                                       #",
    "#  Store only in: local shell session, GitHub Actions      #",
    "#  secrets, or a password manager.                         #",
    "#  Re-run this function to rotate.                         #",
    "############################################################",
  ].join("\n");

  const credsBlock = results
    .map((r) => {
      const key = r.role.toUpperCase();
      return `TEST_${key}_EMAIL=${r.email}\nTEST_${key}_PASSWORD=${r.password}`;
    })
    .join("\n");

  const envBlock = `${WARNING}\n${credsBlock}\n${WARNING}`;

  return json({
    ok: true,
    accounts: results,
    env_block: envBlock,
    warning:
      "Do not paste passwords into chat, GitHub, tickets or shared documents. Store test credentials only in local shell, GitHub Actions secrets or a password manager.",
    notice:
      "Passwords are shown ONCE. Store them in a secret manager or your shell, then discard this response. Re-run this function any time to rotate.",
  });
});

  });
});
