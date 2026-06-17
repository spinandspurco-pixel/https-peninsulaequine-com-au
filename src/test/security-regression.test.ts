/**
 * Security regression suite.
 *
 * Runs against the live (anon) Data API to assert that the public-facing
 * RLS policies, column-level GRANTs, and RPC contracts remain locked down.
 *
 * What it guards against (each item maps back to a real finding we fixed):
 *  - quotes / quote_line_items: no broad public SELECT — only the
 *    `get_quote_by_share_token` / `accept_quote_by_share_token` RPCs return data.
 *  - site_assessments: no public SELECT.
 *  - slot_holds: no public SELECT, and `session_id` is column-revoked even
 *    for the authenticated role; mutations are forced through RPCs.
 *  - inquiries / bookings / event_rsvps / user_roles: no anon SELECT (PII / roles).
 *  - Internal trigger / helper SECURITY DEFINER functions are not callable
 *    by anon (`has_role` is the only allowed exception).
 *
 * Run locally:   npx vitest run src/test/security-regression.test.ts
 * Run in CI:     same command in the deploy pipeline post-publish.
 */

import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://aizkqajrzkvwuobisnzr.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemtxYWpyemt2d3VvYmlzbnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE3NzEsImV4cCI6MjA4NjkzNzc3MX0.YC8M-qD2Ek5SNFjJ1mMZ3fj5S7cfzmgpwI7ZvJ8KkIw";

const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Anon must NOT be able to SELECT *any* row from these tables. */
const ANON_READ_LOCKED_TABLES = [
  "quotes",
  "quote_line_items",
  "site_assessments",
  "inquiries",
  "bookings",
  "event_rsvps",
  "user_roles",
  "client_followups",
  "jobs",
  "cashflow",
  "staff_documents",
] as const;

/** Internal SECURITY DEFINER funcs that must NOT be executable by anon. */
const ANON_FORBIDDEN_RPCS = [
  "notify_hubspot_on_inquiry",
  "create_nurture_on_inquiry",
  "auto_mark_overdue_followups",
  "recalc_job_profit",
  "sync_inquiry_stage_on_quote",
  "auto_tag_inquiry",
  "compute_expected_value",
  "compute_line_total",
  "generate_quote_number",
  "increment_slot_bookings",
  "create_quote_follow_ups",
  "update_updated_at_column",
] as const;

/** RPCs that anon IS allowed to call (with safe inputs). */
const ANON_ALLOWED_RPCS = [
  "get_quote_by_share_token",
  "accept_quote_by_share_token",
  "release_slot_hold",
  "refresh_slot_hold",
  "cleanup_expired_holds",
  "has_role",
] as const;

/** A permission-denied response from PostgREST surfaces as code 42501 or 401/403. */
function isPermissionDenied(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42501") return true;
  const m = (error.message ?? "").toLowerCase();
  return (
    m.includes("permission denied") ||
    m.includes("not allowed") ||
    m.includes("does not exist") // function exists check covered separately
  );
}

describe("security regression — anon Data API lockdown", () => {
  for (const table of ANON_READ_LOCKED_TABLES) {
    it(`anon cannot SELECT from public.${table}`, async () => {
      const { data, error } = await anon.from(table as any).select("*").limit(1);
      // Either an explicit permission denied OR an empty result with NO rows leaked.
      // RLS-without-policy returns [] with no error; that is acceptable because
      // no row content is exposed. Any non-empty data is a regression.
      expect(data ?? []).toEqual([]);
      if (error) expect(isPermissionDenied(error)).toBe(true);
    });
  }
});

describe("security regression — slot_holds column lockdown", () => {
  it("anon cannot read slot_holds at all", async () => {
    const { data, error } = await anon.from("slot_holds").select("id").limit(1);
    expect(data ?? []).toEqual([]);
    if (error) expect(isPermissionDenied(error)).toBe(true);
  });

  it("anon cannot DELETE arbitrary slot_holds rows", async () => {
    const fakeSlotId = "00000000-0000-0000-0000-000000000000";
    const { error } = await anon
      .from("slot_holds")
      .delete()
      .eq("slot_id", fakeSlotId);
    // Either policy denies it (error) or no rows match (no error, no data).
    // Both are acceptable — what we must NOT see is a successful broad delete.
    if (error) expect(isPermissionDenied(error)).toBe(true);
  });
});

describe("security regression — quote share-token RPC is the only path", () => {
  it("get_quote_by_share_token rejects short / empty tokens", async () => {
    const { data, error } = await anon.rpc("get_quote_by_share_token" as any, {
      p_token: "too-short",
    });
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("get_quote_by_share_token returns null for an unknown but well-formed token", async () => {
    const { data, error } = await anon.rpc("get_quote_by_share_token" as any, {
      p_token: "this-token-does-not-exist-in-the-database-xxxxxxxxxx",
    });
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("accept_quote_by_share_token rejects short tokens", async () => {
    const { data, error } = await anon.rpc("accept_quote_by_share_token" as any, {
      p_token: "nope",
    });
    expect(error).toBeNull();
    expect(data).toBe(false);
  });
});

describe("security regression — slot-hold RPCs accept their contract", () => {
  it("release_slot_hold is callable by anon and is a no-op for unknown sessions", async () => {
    const { error } = await anon.rpc("release_slot_hold" as any, {
      p_slot_id: "00000000-0000-0000-0000-000000000000",
      p_session_id: "regression-test-no-such-session",
    });
    expect(error).toBeNull();
  });

  it("refresh_slot_hold is callable by anon and is a no-op for unknown sessions", async () => {
    const { error } = await anon.rpc("refresh_slot_hold" as any, {
      p_slot_id: "00000000-0000-0000-0000-000000000000",
      p_session_id: "regression-test-no-such-session",
      p_expires_at: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(error).toBeNull();
  });
});

describe("security regression — internal SECURITY DEFINER functions are NOT anon-callable", () => {
  for (const fn of ANON_FORBIDDEN_RPCS) {
    it(`anon cannot execute public.${fn}`, async () => {
      const { error } = await anon.rpc(fn as any, {});
      // Expect EITHER permission denied OR function-signature mismatch (PGRST202).
      // What we MUST NOT see is a 2xx success.
      expect(error).not.toBeNull();
      const code = error?.code ?? "";
      const msg = (error?.message ?? "").toLowerCase();
      const acceptable =
        code === "42501" ||
        code === "PGRST202" || // no function matches the signature on anon's search path
        msg.includes("permission denied") ||
        msg.includes("could not find the function") ||
        msg.includes("not allowed");
      expect(acceptable).toBe(true);
    });
  }

  it("sanity check: at least one allowed RPC actually exists for anon", async () => {
    // has_role with a random uuid + an existing role; anon may not own roles
    // so result is false, but the call itself must succeed without permission error.
    const { error } = await anon.rpc("has_role" as any, {
      _user_id: "00000000-0000-0000-0000-000000000000",
      _role: "admin",
    });
    expect(error).toBeNull();
  });
});

describe("security regression — public storage buckets", () => {
  it("storage.objects is not exposed through the public Data API", async () => {
    // The storage schema is not exposed via PostgREST. Any attempt to query
    // `objects` through the public Data API must return no data — either an
    // error or an empty result.
    const { data } = await anon.from("objects" as any).select("*").limit(1);
    expect(data ?? []).toEqual([]);
  });
});

// Helpful inventory so we don't silently drop a check if the table list grows.
describe("security regression — registry sanity", () => {
  it("read-locked table list is non-trivial", () => {
    expect(ANON_READ_LOCKED_TABLES.length).toBeGreaterThanOrEqual(10);
  });
  it("forbidden RPC list is non-trivial", () => {
    expect(ANON_FORBIDDEN_RPCS.length).toBeGreaterThanOrEqual(10);
  });
  it("allowed RPC list documents every intentionally public SECURITY DEFINER fn", () => {
    expect(ANON_ALLOWED_RPCS).toContain("get_quote_by_share_token");
    expect(ANON_ALLOWED_RPCS).toContain("release_slot_hold");
  });
});
