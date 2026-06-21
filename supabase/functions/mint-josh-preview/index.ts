import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TARGET_EMAIL = "josh.dales@peninsulaequine.systems";
const DISPLAY_NAME = "Josh Dales";

function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;
  const buf = new Uint32Array(20);
  crypto.getRandomValues(buf);
  // Guarantee one of each class
  const pick = (set: string, n: number) => set[n % set.length];
  const chars = [
    pick(upper, buf[0]),
    pick(lower, buf[1]),
    pick(digits, buf[2]),
    pick(symbols, buf[3]),
  ];
  for (let i = 4; i < 20; i++) chars.push(pick(all, buf[i]));
  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = (buf[i] ?? 0) % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1. Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const token = authHeader.slice(7);
    const { data: { user: caller }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !caller) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Check if user already exists
    // Use admin.listUsers + filter by email (no direct getUserByEmail in v2)
    let existingUserId: string | null = null;
    let page = 1;
    while (page <= 20) {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (listErr) throw listErr;
      const match = list.users.find(
        (u) => (u.email ?? "").toLowerCase() === TARGET_EMAIL,
      );
      if (match) {
        existingUserId = match.id;
        break;
      }
      if (list.users.length < 200) break;
      page++;
    }

    if (existingUserId) {
      return new Response(
        JSON.stringify({
          success: true,
          already_exists: true,
          message: "Josh Dales preview account already exists.",
          user_id: existingUserId,
          email: TARGET_EMAIL,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Create user with strong temporary password
    const tempPassword = generateStrongPassword();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: TARGET_EMAIL,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { display_name: DISPLAY_NAME, must_reset_password: true },
    });
    if (createErr || !created.user) {
      throw createErr ?? new Error("User creation returned no user");
    }
    const newUserId = created.user.id;

    // 4. Assign ONLY the preview role. Strip any other accidental rows.
    await admin.from("user_roles").delete().eq("user_id", newUserId);
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: newUserId, role: "preview" });
    if (roleErr) {
      // Roll back user to avoid an orphaned auth account with no role.
      await admin.auth.admin.deleteUser(newUserId);
      throw roleErr;
    }

    // 5. Best-effort audit log entry
    try {
      await admin.from("activity_log").insert({
        action_type: "create_preview_account",
        action_level: "user_approved",
        category: "security",
        title: "Minted Josh Dales preview account",
        description: `Admin ${caller.email ?? caller.id} created the Client Preview account for ${TARGET_EMAIL}.`,
        entity_type: "auth_user",
        entity_id: newUserId,
        performed_by: caller.email ?? caller.id,
        metadata: { email: TARGET_EMAIL, role: "preview" },
      });
    } catch (_logErr) {
      // Non-fatal — minting succeeded.
    }

    return new Response(
      JSON.stringify({
        success: true,
        already_exists: false,
        user_id: newUserId,
        email: TARGET_EMAIL,
        temp_password: tempPassword,
        role: "preview",
        write_access_blocked: true,
        login_url: `${new URL(req.url).origin.replace(/\.functions\..*$/, "")}/login`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
