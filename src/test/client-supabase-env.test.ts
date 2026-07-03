import { describe, expect, it } from "vitest";
import { getClientSupabaseKey } from "@/lib/clientSupabaseEnv";

describe("getClientSupabaseKey", () => {
  it("prefers VITE_SUPABASE_PUBLISHABLE_KEY when both names are present", () => {
    expect(
      getClientSupabaseKey({
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_primary",
        VITE_SUPABASE_ANON_KEY: "sb_publishable_fallback",
      }),
    ).toBe("sb_publishable_primary");
  });

  it("falls back to VITE_SUPABASE_ANON_KEY when the publishable name is absent", () => {
    expect(
      getClientSupabaseKey({
        VITE_SUPABASE_ANON_KEY: "sb_publishable_alias",
      }),
    ).toBe("sb_publishable_alias");
  });

  it("treats blank values as missing", () => {
    expect(
      getClientSupabaseKey({
        VITE_SUPABASE_PUBLISHABLE_KEY: "   ",
        VITE_SUPABASE_ANON_KEY: " ",
      }),
    ).toBeUndefined();
  });
});
